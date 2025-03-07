import { Controller, Post, Get, Patch, Delete, Body, Param, ForbiddenException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto, @Body('role') role: string) {
    return this.notificationService.createNotification(createNotificationDto, role);
  }

  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: string) {
    return this.notificationService.getNotificationsForUser(userId);
  }

  @Patch(':id')
  async markAsRead(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    const { isRead } = updateNotificationDto;
    if (isRead) {
      return this.notificationService.markAsRead(id);
    }
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationService.deleteNotification(id);
  }
}