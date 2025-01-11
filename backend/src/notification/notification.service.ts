import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Notification } from '@prisma/client';



@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(senderId: string, recipientId: string, body: string): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        senderId,
        recipientId,
        body,
      },
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
}
