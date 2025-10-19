import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Notification, NotificationType } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Expo } from 'expo-server-sdk';

@Injectable()
export class NotificationService {
  private expo = new Expo();

  constructor(private prisma: PrismaService) {}

  async createNotification(
    dto: CreateNotificationDto,
    userRole: string,
  ): Promise<Notification | { count: number }> {
    if (dto.type === NotificationType.WARNING && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas ADMIN podem criar notificações do tipo WARNING',
      );
    }

    if (dto.type === NotificationType.FIXED && dto.recipientId) {
      const notification = await this.prisma.notification.create({
        data: {
          senderId: dto.senderId,
          recipientId: dto.recipientId,
          body: dto.body,
          type: dto.type,
          groupName: dto.groupName || null,
          senderName: dto.senderName || null,
          idContent: dto.idContent || null,
        },
      });

      try {
        await this.sendPushNotification(
          dto.recipientId,
          'Nova notificação',
          dto.body,
          dto.groupId ? { groupId: dto.groupId } : undefined,
          dto.type,
        );
      } catch (err) {
        console.warn('Erro ao enviar push:', err.message);
      }

      return notification;
    }

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
        throw new BadRequestException(
          'Não há participantes neste grupo para notificar.',
        );
      }

      const notificationsData = participants.map((p) => ({
        senderId: dto.senderId,
        recipientId: p.userId,
        body: dto.body,
        type: dto.type,
        groupName: dto.groupName || null,
        senderName: dto.senderName || null,
        idContent: dto.idContent || null,
      }));

      const result = await this.prisma.notification.createMany({
        data: notificationsData,
      });

      for (const participant of participants) {
        try {
          await this.sendPushNotification(
            participant.userId,
            'Nova notificação em ' + (dto.groupName ?? 'grupo'),
            dto.body,
            dto.groupId ? { groupId: dto.groupId } : undefined,
            dto.type,
          );
        } catch (err) {
          console.warn(
            `Erro ao enviar push para ${participant.userId}:`,
            err.message,
          );
        }
      }

      return { count: result.count };
    }

    const senderExists = await this.prisma.user.findUnique({
      where: { id: dto.senderId },
    });
    if (!senderExists) {
      throw new NotFoundException('Remetente não encontrado');
    }

    const recipientExists = await this.prisma.user.findUnique({
      where: { id: dto.recipientId },
    });
    if (!recipientExists) {
      throw new NotFoundException('Destinatário não encontrado');
    }

    const notification = await this.prisma.notification.create({
      data: {
        senderId: dto.senderId,
        recipientId: dto.recipientId,
        body: dto.body,
        type: dto.type,
        groupName: dto.groupName || null,
        senderName: dto.senderName || null,
        idContent: dto.idContent || null,
      },
    });

    try {
      await this.sendPushNotification(
        dto.recipientId,
        'Nova notificação',
        dto.body,
        dto.groupId ? { groupId: dto.groupId } : undefined,
        dto.type,
      );
    } catch (err) {
      console.warn('Erro ao enviar push:', err.message);
    }

    return notification;
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async deleteNotification(notificationId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async createGlobalNotification(
    dto: CreateNotificationDto,
  ): Promise<{ count: number }> {
    const users = await this.prisma.user.findMany({
      where: { id: { not: dto.senderId } },
    });

    if (users.length === 0) {
      throw new NotFoundException(
        'Não há usuários destinatários para notificação global',
      );
    }

    const data = users.map((user) => ({
      senderId: dto.senderId,
      recipientId: user.id,
      body: dto.body,
      type: dto.type,
      groupName: dto.groupName || null,
      senderName: dto.senderName || null,
    }));

    const result = await this.prisma.notification.createMany({ data });

    for (const user of users) {
      try {
        await this.sendPushNotification(
          user.id,
          dto.senderName ?? 'Notificação',
          dto.body,
          undefined,
          dto.type,
        );
      } catch (err) {
        console.warn(`Erro ao enviar push para ${user.id}:`, err.message);
      }
    }

    return { count: result.count };
  }

  async deleteAllNotifications(userId: string): Promise<{ count: number }> {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const deletedNotifications = await this.prisma.notification.deleteMany({
      where: { recipientId: userId },
    });

    return { count: deletedNotifications.count };
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedNotifications = await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });

    return { count: updatedNotifications.count };
  }

  async updateNotification(id: string, data: UpdateNotificationDto) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada.');
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    return this.prisma.notification.update({
      where: { id },
      data: updateData,
    });
  }

  async registerPushNotifToken(userId: string, pushNotifToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { pushNotifToken },
    });
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
    type?: NotificationType,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.pushNotifToken) {
      throw new Error('Usuário não possui push token registrado');
    }

    if (!Expo.isExpoPushToken(user.pushNotifToken)) {
      throw new Error('Push token inválido');
    }

    // Flags para desabilitar notificações
    // Desativar todas
    if (user.disablePopup) {
      console.log(
        `Notificação não enviada: usuário ${userId} desativou popups.`,
      );
      return { skipped: true };
    }

    // Desativar do "Sistema"
    if (
      (type === NotificationType.COMMENT ||
        type === NotificationType.WARNING) &&
      user.muteSystem
    ) {
      console.log(
        `Notificação não enviada: usuário ${userId} silenciou notificações do sistema.`,
      );
      return { skipped: true };
    }

    // Desativar do "Grupo"
    if (type === NotificationType.FIXED && data?.groupId && user.muteGroups) {
      console.log(
        `Notificação não enviada: usuário ${userId} silenciou notificações de grupos.`,
      );
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
  }

  async getNotificationSettings(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        disablePopup: true,
        muteSystem: true,
        muteGroups: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    return {
      disablePopup: user.disablePopup,
      muteSystem: user.muteSystem,
      muteGroups: user.muteGroups,
    };
  }

  async updateNotificationSettings(id: string, dto: UpdateNotificationDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Nenhuma configuração para atualizar');
    }

    const userExists = await this.prisma.user.findUnique({ where: { id } });
    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }
}
