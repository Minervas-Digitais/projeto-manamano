import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Notification, NotificationType } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(dto: CreateNotificationDto, userRole: string): Promise<Notification> {
    if (dto.type === NotificationType.WARNING && userRole !== 'ADMIN') {
      throw new ForbiddenException('Apenas ADMIN podem criar notificações do tipo WARNING');
    }

    return this.prisma.notification.create({
      data: {
        senderId: dto.senderId,
        recipientId: dto.recipientId,
        body: dto.body,
        type: dto.type,
        groupName: dto.groupName || null,
        senderName: dto.senderName || null,
        idContent: dto.idContent || null,
      } as CreateNotificationDto,
    });
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async deleteNotification(notificationId: string): Promise<Notification> {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async createGlobalNotification(dto: CreateNotificationDto): Promise<{ count: number }> {
    const users = await this.prisma.user.findMany({
      where: { id: { not: dto.senderId } },
    });

    const data = users.map(user => ({
      senderId: dto.senderId,
      recipientId: user.id,
      body: dto.body,
      type: dto.type,
      groupName: dto.groupName || null,
      senderName: dto.senderName || null,
    }));

    return this.prisma.notification.createMany({ data });
  }
  
  async deleteAllNotifications(userId: string): Promise<{ count: number }> {
    const deletedNotifications = await this.prisma.notification.deleteMany({
      where: { recipientId: userId },
    });

    return { count: deletedNotifications.count };
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const updatedNotifications = await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });

    return { count: updatedNotifications.count };
  }
}
