import { Controller, Get, Post, Patch, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { Body, Param, Request, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createNotificationDto: CreateNotificationDto, @Req() req) {
        const userRole = req.user.sysRole; 
        return this.notificationService.createNotification(createNotificationDto, userRole);
    }

    @Post('/global')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async createGlobal(@Body() dto: CreateNotificationDto, @Request() req) {
        return this.notificationService.createGlobalNotification({
            ...dto,
            senderId: req.user.id,
        });
    }

    @Get('user/:userId')
    @UseGuards(JwtAuthGuard)
    async getUserNotifications(@Param('userId') userId: string) {
        return this.notificationService.getNotificationsForUser(userId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async markAsRead(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
        const { isRead } = updateNotificationDto;
        if (isRead) {
            return this.notificationService.markAsRead(id);
        }
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
    async updateNotification(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
        return this.notificationService.updateNotification(id, updateNotificationDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteNotification(@Param('id') id: string) {
        return this.notificationService.deleteNotification(id);
    }

    @Delete('user/:userId')
    @UseGuards(JwtAuthGuard)
    async deleteAllNotifications(@Param('userId') userId: string) {
        return this.notificationService.deleteAllNotifications(userId);
    }

    @Patch('user/:userId')
    @UseGuards(JwtAuthGuard)
    async markAllAsRead(@Param('userId') userId: string) {
        return this.notificationService.markAllAsRead(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('register-token')
    async registerPushToken(@Req() req, @Body() body: { pushNotifToken: string }) {
        const userId = req.user.id;

        if (!body.pushNotifToken) {
            throw new Error('Push token é obrigatório');
        }

        await this.notificationService.registerPushNotifToken(userId, body.pushNotifToken);

        return { success: true };
    }

    @Post('send/:userId')
    @UseGuards(JwtAuthGuard)
    async sendNotificationToUser(
        @Param('userId') userId: string,
        @Body() body: { title: string; message: string }
    ) {
        return this.notificationService.sendPushNotification(
            userId,
            body.title,
            body.message,
        );
    }

    @Get(':id/notification-settings')
    @UseGuards(JwtAuthGuard)
    async getNotificationSettings(@Param('id') id: string, @Req() req) {
        if (req.user.id !== id) {
            throw new UnauthorizedException('Você só pode acessar suas próprias configurações');
        }
        return this.notificationService.getNotificationSettings(id);
    }

    @Patch(':id/notification-settings')
    @UseGuards(JwtAuthGuard)
    async updateNotificationSettings(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
    @Req() req,
    ) {
        if (req.user.id !== id) {
            throw new UnauthorizedException('Você só pode modificar suas próprias configurações');
        }
        return this.notificationService.updateNotificationSettings(id, dto);
    }
}
