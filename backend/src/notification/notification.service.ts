import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Notification, NotificationType, RoleType, User } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Expo } from 'expo-server-sdk';
import { NOTIFICATION_MESSAGES } from 'src/messages/notification.messages';
import { omitHash } from 'src/utils/user.util';
import { ValidatorService } from 'src/common/validators/validator.service';
import { MatchUserIdGuard } from 'src/auth/match-user-id.guard';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

export interface NotificationSettings {
  disablePopup: boolean;
  muteSystem: boolean;
  muteGroups: boolean;
}

@Injectable()
export class NotificationService {
  private expo = new Expo();

  constructor(
    private prisma: PrismaService,
    private readonly validator: ValidatorService,
  ) {}

  private buildNotificationData(
    dto: CreateNotificationDto,
    recipientId: string,
  ) {
    return {
      senderId: dto.senderId,
      recipientId,
      body: dto.body,
      type: dto.type,
      groupName: dto.groupName,
      senderName: dto.senderName,
      idContent: dto.idContent,
    };
  }

  private getNotificationTitle(
    type: NotificationType,
    groupName?: string,
    senderName?: string,
  ): string {
    switch (type) {
      case NotificationType.FIXED:
        return groupName
          ? `Nova notificação em ${groupName}`
          : 'Nova notificação';
      case NotificationType.WARNING:
        return 'Aviso importante';
      case NotificationType.COMMENT:
        return senderName ? `${senderName} comentou` : 'Novo comentário';
      default:
        return 'Nova notificação';
    }
  }

  private async createAndSendNotification(
    dto: CreateNotificationDto,
    recipientId: string,
  ): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: this.buildNotificationData(dto, recipientId),
    });

    await this.sendPushNotification(
      recipientId,
      this.getNotificationTitle(dto.type, dto.groupName, dto.senderName),
      dto.body,
      dto.groupId ? { groupId: dto.groupId } : undefined,
      dto.type,
    );

    return notification;
  }

  async createNotification(
    dto: CreateNotificationDto,
  ): Promise<Notification | { count: number }> {
    const sender = await this.prisma.user.findUnique({
      where: { id: dto.senderId },
      select: { sysRole: true },
    });

    if (!sender) {
      throw new NotFoundException(NOTIFICATION_MESSAGES.SENDER_NOT_FOUND);
    }

    if (dto.recipientId && dto.recipientId === dto.senderId) {
      throw new BadRequestException(
        NOTIFICATION_MESSAGES.CANNOT_NOTIFY_YOURSELF,
      );
    }

    if (dto.type === NotificationType.WARNING && sender.sysRole !== 'ADMIN') {
      throw new ForbiddenException(
        NOTIFICATION_MESSAGES.UNAUTHORIZED_WARNING_CALL,
      );
    }

    //FIXED pra 01 usuario
    if (dto.type === NotificationType.FIXED && dto.recipientId) {
      await this.validator.validateUserExists(dto.recipientId);
      return this.createAndSendNotification(dto, dto.recipientId);
    }

    // FIXED para grupo
    if (
      dto.type === NotificationType.FIXED &&
      !dto.recipientId &&
      dto.groupId
    ) {
      const participants = await this.prisma.participant.findMany({
        where: { groupId: dto.groupId },
        select: { userId: true },
      });

      if (participants.length === 0) {
        throw new Error(NOTIFICATION_MESSAGES.NO_PARTICIPANTS);
      }

      const data = participants.map((p) =>
        this.buildNotificationData(dto, p.userId),
      );

      const result = await this.prisma.notification.createMany({ data });

      await Promise.all(
        participants.map((participant) =>
          this.sendPushNotification(
            participant.userId,
            this.getNotificationTitle(dto.type, dto.groupName, dto.senderName),
            dto.body,
            { groupId: dto.groupId },
            dto.type,
          ),
        ),
      );

      return { count: result.count };
    }

    if (!dto.recipientId) {
      throw new BadRequestException(NOTIFICATION_MESSAGES.RECIPIENT_NOT_FOUND);
    }

    await this.validator.validateUserExists(dto.recipientId);

    return this.createAndSendNotification(dto, dto.recipientId);
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    await this.validator.validateUserExists(userId);

    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @UseGuards(MatchUserIdGuard)
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    await this.validator.ensureUserIsNotificationRecipient(
      notificationId,
      userId,
    );

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    await this.validator.ensureUserIsNotificationRecipient(
      notificationId,
      userId,
    );

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async createGlobalNotification(
    dto: CreateNotificationDto,
  ): Promise<{ count: number }> {
    await this.validator.validateUserExists(dto.senderId);

    const users = await this.prisma.user.findMany({
      where: { id: { not: dto.senderId } },
    });

    if (users.length === 0) {
      throw new NotFoundException(NOTIFICATION_MESSAGES.NO_RECIPIENTS_GLOBAL);
    }

    const data = users.map((user) => this.buildNotificationData(dto, user.id));

    const result = await this.prisma.notification.createMany({ data });

    await Promise.all(
      users.map((user) =>
        this.sendPushNotification(
          user.id,
          this.getNotificationTitle(dto.type, dto.groupName, dto.senderName),
          dto.body,
          undefined,
          dto.type,
        ),
      ),
    );

    return { count: result.count };
  }

  async deleteAllNotifications(userId: string): Promise<{ count: number }> {
    await this.validator.validateUserExists(userId);

    const deletedNotifications = await this.prisma.notification.deleteMany({
      where: { recipientId: userId },
    });

    return { count: deletedNotifications.count };
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    await this.validator.validateUserExists(userId);

    const updatedNotifications = await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });

    return { count: updatedNotifications.count };
  }

  async updateNotification(
    id: string,
    data: UpdateNotificationDto,
    userId: string,
  ): Promise<Notification> {
    await this.validator.ensureUserIsNotificationSender(id, userId);

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    return this.prisma.notification.update({
      where: { id },
      data: updateData,
    });
  }

  async registerPushNotifToken(
    userId: string,
    pushNotifToken: string,
  ): Promise<Omit<User, 'hash'>> {
    await this.validator.validateUserExists(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { pushNotifToken },
    });

    return omitHash(updatedUser);
  }

  async getNotificationSettings(id: string): Promise<NotificationSettings> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        disablePopup: true,
        muteSystem: true,
        muteGroups: true,
      },
    });

    if (!user) {
      throw new NotFoundException(NOTIFICATION_MESSAGES.USER_NOT_FOUND);
    }
    return {
      disablePopup: user.disablePopup,
      muteSystem: user.muteSystem,
      muteGroups: user.muteGroups,
    };
  }

  async updateNotificationSettings(
    id: string,
    dto: UpdateNotificationSettingsDto,
  ): Promise<Omit<User, 'hash'>> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        NOTIFICATION_MESSAGES.NO_SETTINGS_TO_UPDATE,
      );
    }

    await this.validator.validateUserExists(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return omitHash(updatedUser);
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
    type?: NotificationType,
  ): Promise<any | undefined> {
    try {
      const user = await this.validator.validateUserExists(userId);

      if (userId === user.id) {
        // impede enviar notificação pra si mesmo
        return { skipped: true };
      }

      if (!user.pushNotifToken) {
        throw new Error(NOTIFICATION_MESSAGES.NO_PUSH_TOKEN);
      }

      if (!Expo.isExpoPushToken(user.pushNotifToken)) {
        throw new Error(NOTIFICATION_MESSAGES.INVALID_PUSH_TOKEN);
      }

      // Flags para desabilitar notificações
      // Desativar todas
      if (user.disablePopup) {
        return { skipped: true };
      }

      // Desativar do "Sistema"
      if (
        (type === NotificationType.COMMENT ||
          type === NotificationType.WARNING) &&
        user.muteSystem
      ) {
        return { skipped: true };
      }

      // Desativar do "Grupo"
      if (type === NotificationType.FIXED && data?.groupId && user.muteGroups) {
        return { skipped: true };
      }

      const messages = [
        {
          to: user.pushNotifToken,
          sound: 'default',
          title,
          body,
          data,
        },
      ];

      const tickets = await this.expo.sendPushNotificationsAsync(messages);

      return tickets;
    } catch (err) {
      console.warn(`Erro ao enviar push para ${userId}:`, err.message);
    }
  }
}
