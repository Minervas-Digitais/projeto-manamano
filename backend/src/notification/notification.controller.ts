import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Body, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { MatchUserIdGuard } from 'src/auth/match-user-id.guard';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { User } from 'src/user/user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @User('id') senderId: string,
  ) {
    return this.notificationService.createNotification(
      createNotificationDto,
      senderId,
    );
  }

  @Post('global')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async createGlobal(
    @Body() dto: CreateNotificationDto,
    @User('id') senderId: string,
  ) {
    return this.notificationService.createGlobalNotification(dto, senderId);
  }

  @Get('user')
  async getUserNotifications(@User('id') userId: string) {
    return this.notificationService.getNotificationsForUser(userId);
  }

  @Patch(':notificationId')
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @User('id') userId: string,
  ) {
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Patch('update/:notificationId')
  async updateNotification(
    @Param('notificationId') notificationId: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @User('id') userId: string,
  ) {
    return this.notificationService.updateNotification(
      notificationId,
      updateNotificationDto,
      userId,
    );
  }

  @Delete(':notificationId')
  async deleteNotification(
    @Param('notificationId') notificationId: string,
    @User('id') userId: string,
  ) {
    return this.notificationService.deleteNotification(notificationId, userId);
  }

  @Delete('user')
  async deleteAllNotifications(@User('id') userId: string) {
    return this.notificationService.deleteAllNotifications(userId);
  }

  @Patch('user')
  async markAllAsRead(@User('id') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Post('register-token')
  async registerPushToken(
    @User('id') userId: string,
    @Body() body: { pushNotifToken: string },
  ) {
    if (!body.pushNotifToken) {
      throw new BadRequestException('Push token é obrigatório');
    }

    await this.notificationService.registerPushNotifToken(
      userId,
      body.pushNotifToken,
    );

    return { success: true };
  }

  @Get('notification-settings')
  async getNotificationSettings(@User('id') userId: string) {
    return this.notificationService.getNotificationSettings(userId);
  }

  @Patch('notification-settings')
  async updateNotificationSettings(
    @User('id') userId: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.notificationService.updateNotificationSettings(userId, dto);
  }
}
