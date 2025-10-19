import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { Body, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { MatchUserIdGuard } from 'src/auth/match-user-id.guard';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Post('/global')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createGlobal(@Body() dto: CreateNotificationDto, @Req() req) {
    return this.notificationService.createGlobalNotification({
      ...dto,
      senderId: req.user.id,
    });
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, MatchUserIdGuard)
  async getUserNotifications(@Param('userId') userId: string) {
    return this.notificationService.getNotificationsForUser(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Req() req,
  ) {
    const { isRead } = updateNotificationDto;
    if (isRead) {
      return this.notificationService.markAsRead(id, req.user.id);
    }
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  async updateNotification(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Req() req
  ) {
    return this.notificationService.updateNotification(
      id,
      updateNotificationDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteNotification(@Param('id') id: string, @Req() req) {
    return this.notificationService.deleteNotification(id, req.user.id);
  }

  @Delete('user/:userId')
  @UseGuards(JwtAuthGuard, MatchUserIdGuard)
  async deleteAllNotifications(@Param('userId') userId: string) {
    return this.notificationService.deleteAllNotifications(userId);
  }

  @Patch('user/:userId')
  @UseGuards(JwtAuthGuard, MatchUserIdGuard)
  async markAllAsRead(@Param('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('register-token')
  async registerPushToken(
    @Req() req,
    @Body() body: { pushNotifToken: string },
  ) {
    const userId = req.user.id;

    if (!body.pushNotifToken) {
      throw new Error('Push token é obrigatório');
    }

    await this.notificationService.registerPushNotifToken(
      userId,
      body.pushNotifToken,
    );

    return { success: true };
  }

  @Get(':id/notification-settings')
  @UseGuards(JwtAuthGuard, MatchUserIdGuard)
  async getNotificationSettings(@Param('id') id: string) {
    return this.notificationService.getNotificationSettings(id);
  }

  @Patch(':id/notification-settings')
  @UseGuards(JwtAuthGuard, MatchUserIdGuard)
  async updateNotificationSettings(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notificationService.updateNotificationSettings(id, dto);
  }
}
