import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
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

    const senderExists = await this.prisma.user.findUnique({ where: { id: dto.senderId } });
    if (!senderExists) {
        throw new NotFoundException('Remetente não encontrado');
    }

    const recipientExists = await this.prisma.user.findUnique({ where: { id: dto.recipientId } });
    if (!recipientExists){
        throw new NotFoundException('Destinatário não encontrado');
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
    const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
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

  async createGlobalNotification(dto: CreateNotificationDto): Promise<{ count: number }> {
    const users = await this.prisma.user.findMany({
      where: { id: { not: dto.senderId } },
    });

    if (users.length === 0) {
        throw new NotFoundException('Não há usuários destinatários para notificação global');
    }
    
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
    const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
        throw new NotFoundException('Usuário não encontrado');
    }

    const deletedNotifications = await this.prisma.notification.deleteMany({
      where: { recipientId: userId },
    });

    return { count: deletedNotifications.count };
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
        throw new NotFoundException('Usuário não encontrado');
    }

    const updatedNotifications = await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });

    return { count: updatedNotifications.count };
  }
}
