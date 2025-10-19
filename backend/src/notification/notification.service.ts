import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Notification, NotificationType, RoleType, User } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Expo } from 'expo-server-sdk';
import { NOTIFICATION_MESSAGES } from 'src/messages/notification.messages';

export interface NotificationSettings {
  disablePopup: boolean;
  muteSystem: boolean;
  muteGroups: boolean;
}

@Injectable()
export class NotificationService {
  private expo = new Expo();

  constructor(private prisma: PrismaService) {}

  private async validateTokenMatchUser(notifId: string, userId: string) {
    const notification = await this.validateNotificationExists(notifId);

    if (notification.recipientId !== userId) {
      throw new ForbiddenException(
        NOTIFICATION_MESSAGES.UNAUTHORIZED_NOTIF_UPDATE,
      );
    }
  }

  private async validateUserExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(NOTIFICATION_MESSAGES.USER_NOT_FOUND);
    }
  }

  private async validateNotificationExists(id: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(NOTIFICATION_MESSAGES.NOT_FOUND);
    }

    return notification;
  }

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

    if (dto.type === NotificationType.WARNING && sender.sysRole !== 'ADMIN') {
      throw new ForbiddenException(
        NOTIFICATION_MESSAGES.UNAUTHORIZED_WARNING_CALL,
      );
    }

    //FIXED pra 01 usuario
    if (dto.type === NotificationType.FIXED && dto.recipientId) {
      await this.validateUserExists(dto.recipientId);

      const notification = await this.prisma.notification.create({
        data: this.buildNotificationData(dto, dto.recipientId),
      });

      await this.sendPushNotification(
        dto.recipientId,
        'Nova notificação',
        dto.body,
        dto.groupId ? { groupId: dto.groupId } : undefined,
        dto.type,
      );

      return notification;
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

      for (const participant of participants) {
        await this.sendPushNotification(
          participant.userId,
          'Nova notificação em ' + dto.groupName,
          dto.body,
          { groupId: dto.groupId },
          dto.type,
        );
      }

      return { count: result.count };
    }

    if (!dto.recipientId) {
      throw new BadRequestException(NOTIFICATION_MESSAGES.RECIPIENT_EMPTY);
    }

    await this.validateUserExists(dto.recipientId);

    const notification = await this.prisma.notification.create({
      data: this.buildNotificationData(dto, dto.recipientId),
    });

    await this.sendPushNotification(
      dto.recipientId,
      'Nova notificação',
      dto.body,
      dto.groupId,
      dto.type,
    );

    return notification;
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    await this.validateUserExists(userId);

    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    await this.validateTokenMatchUser(notificationId, userId);

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    await this.validateTokenMatchUser(notificationId, userId);

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async createGlobalNotification(
    dto: CreateNotificationDto,
  ): Promise<{ count: number }> {
    await this.validateUserExists(dto.senderId);

    const users = await this.prisma.user.findMany({
      where: { id: { not: dto.senderId } },
    });

    if (users.length === 0) {
      throw new NotFoundException(NOTIFICATION_MESSAGES.NO_RECIPIENTS_GLOBAL);
    }

    const data = users.map((user) => this.buildNotificationData(dto, user.id));

    const result = await this.prisma.notification.createMany({ data });

    for (const user of users) {
      await this.sendPushNotification(
        user.id,
        dto.senderName ?? 'Notificação',
        dto.body,
        undefined,
        dto.type,
      );
    }

    return { count: result.count };
  }

  async deleteAllNotifications(userId: string): Promise<{ count: number }> {
    await this.validateUserExists(userId);

    const deletedNotifications = await this.prisma.notification.deleteMany({
      where: { recipientId: userId },
    });

    return { count: deletedNotifications.count };
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    await this.validateUserExists(userId);

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
    await this.validateTokenMatchUser(id, userId);

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
  ): Promise<User> {
    await this.validateUserExists(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { pushNotifToken },
    });
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
    dto: UpdateNotificationDto,
  ): Promise<User> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        NOTIFICATION_MESSAGES.NO_SETTINGS_TO_UPDATE,
      );
    }

    await this.validateUserExists(id);

    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
    type?: NotificationType,
  ): Promise<any | undefined> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(NOTIFICATION_MESSAGES.USER_NOT_FOUND);
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

      console.log('Tickets enviados:', tickets);

      return tickets;
    } catch (err) {
      console.warn(`Erro ao enviar push para ${userId}:`, err.message);
    }
  }
}
