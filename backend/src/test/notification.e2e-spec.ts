import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';
import { NotificationType } from '@prisma/client';
import request from 'supertest';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notification/notification.service';
import { createGroup, createUserWithToken, getNotificationId } from './test-helpers';
import { NOTIFICATION_MESSAGES } from 'src/messages/notification.messages';
import Expo from 'expo-server-sdk';

describe('Notification', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;

  let user: any;
  let admin: any;
  let sender: any;
  let recipient: any;

  let userToken: string;
  let adminToken: string;
  let senderToken: string;
  let recipientToken: string;

  let group: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationModule, UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = moduleFixture.get(PrismaService);
    authService = moduleFixture.get(AuthService);
  });

  beforeEach(async () => {
    await prismaService.notification.deleteMany();
    await prismaService.participant.deleteMany();
    await prismaService.group.deleteMany();
    await prismaService.user.deleteMany();

    const userResult = await createUserWithToken(prismaService, authService);
    const adminResult = await createUserWithToken(prismaService, authService, {
      sysRole: 'ADMIN',
    });
    const senderResult = await createUserWithToken(prismaService, authService);
    const recipientResult = await createUserWithToken(prismaService, authService);

    user = userResult.user;
    admin = adminResult.user;
    sender = senderResult.user;
    recipient = recipientResult.user;

    userToken = userResult.token;
    adminToken = adminResult.token;
    senderToken = senderResult.token;
    recipientToken = recipientResult.token;

    group = await createGroup(prismaService, { name: 'Test Group' });

    await prismaService.participant.createMany({
      data: [
        { userId: sender.id, groupId: group.id, role: 'STUDENT' },
        { userId: recipient.id, groupId: group.id, role: 'STUDENT' },
        { userId: admin.id, groupId: group.id, role: 'INSTRUCTOR' },
      ],
    });
  });

  describe('Create', () => {
    let pushMock: jest.SpyInstance;

    beforeEach(() => {
      pushMock = jest
        .spyOn(NotificationService.prototype, 'sendPushNotification')
        .mockResolvedValue([]);
    });

    afterEach(() => {
      pushMock.mockRestore();
    });

    it('deve criar notificação FIXED para um usuário', async () => {
      const dto: CreateNotificationDto = {
        recipientId: recipient.id,
        body: 'notificação fixa',
        type: NotificationType.FIXED,
      };

      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(dto);

      expect(res.status).toBe(201);

      expect(pushMock).toHaveBeenCalledWith(
        sender.id,
        recipient.id,
        'Nova notificação',
        'notificação fixa',
        undefined,
        NotificationType.FIXED,
      );
    });

    it('deve criar notificação COMMENT', async () => {
      const dto: CreateNotificationDto = {
        recipientId: recipient.id,
        body: 'comentário',
        type: NotificationType.COMMENT,
      };

      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('deve criar notificação FIXED para grupo', async () => {
      const dto: CreateNotificationDto = {
        recipientId: null,
        body: 'grupo',
        type: NotificationType.FIXED,
        groupId: group.id,
        groupName: 'Grupo',
        senderName: 'Sender',
      };

      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.count).toBeGreaterThan(0);
    });

    it('Deve retornar count 0 ao criar notificação FIXED para grupo sem participantes', async () => {
      const emptyGroupId = await prismaService.group
        .create({
          data: {
            name: 'Grupo Vazio ' + Date.now(),
            inviteCode: 'INVITE-' + Date.now(),
          },
        })
        .then((group) => group.id);

      const notificationDTO: CreateNotificationDto = {
        recipientId: null,
        body: 'notificação para grupo vazio',
        type: NotificationType.FIXED,
        groupId: emptyGroupId,
        groupName: 'Grupo Vazio',
        senderName: 'remetenteTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + senderToken)
        .send(notificationDTO);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('count', 0);
    });

    it('deve retornar count 0 se grupo não tiver participantes', async () => {
      const emptyGroup = await createGroup(prismaService, { name: 'Empty' });

      const dto: CreateNotificationDto = {
        recipientId: null,
        body: 'grupo vazio',
        type: NotificationType.FIXED,
        groupId: emptyGroup.id,
        groupName: 'Empty',
        senderName: 'Sender',
      };

      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('count', 0);
    });

    it('deve permitir WARNING para ADMIN', async () => {
      const dto: CreateNotificationDto = {
        recipientId: recipient.id,
        body: 'warning',
        type: NotificationType.WARNING,
      };

      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto);

      expect(res.status).toBe(201);
    });

    it('deve bloquear WARNING para usuário comum', async () => {
      const dto: CreateNotificationDto = {
        recipientId: recipient.id,
        body: 'warning',
        type: NotificationType.WARNING,
      };

      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(dto);

      expect(res.status).toBe(403);
    });

    it('deve falhar ao tentar notificar a si mesmo', async () => {
      const dto: CreateNotificationDto = {
        recipientId: sender.id,
        body: 'self',
        type: NotificationType.COMMENT,
      };

      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(dto);

      expect(res.status).toBe(400);
    });

    it('deve falhar quando destinatário não existir', async () => {
      const dto: CreateNotificationDto = {
        recipientId: 'id-invalido',
        body: 'erro',
        type: NotificationType.COMMENT,
      };

      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(dto);

      expect(res.status).toBe(404);
    });

    it('deve continuar mesmo se push falhar', async () => {
      pushMock.mockRejectedValueOnce(new Error('push error'));

      const dto: CreateNotificationDto = {
        recipientId: recipient.id,
        body: 'erro push',
        type: NotificationType.COMMENT,
      };

      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(pushMock).toHaveBeenCalled();
    });
  });

  describe('getNotificationsForUser', () => {
    it('deve retornar todas as notificações do usuário', async () => {
      const notifications = [{ body: 'bodyTeste1' }, { body: 'bodyTeste2' }].map((n) => ({
        senderId: sender.id,
        recipientId: recipient.id,
        body: n.body,
        type: NotificationType.COMMENT,
        groupName: 'groupTeste',
        senderName: 'senderTeste',
      }));

      await prismaService.notification.createMany({
        data: notifications,
      });

      const response = await request(app.getHttpServer())
        .get(`/notifications/user`)
        .set('Authorization', 'Bearer ' + recipientToken);

      expect(response.status).toBe(200);

      const result = response.body;

      expect(result.length).toBeGreaterThanOrEqual(2);

      result.forEach((notification: any) => {
        expect(notification.senderId).toBe(sender.id);
        expect(notification.recipientId).toBe(recipient.id);
      });

      const bodies = result.map((n: any) => n.body);
      expect(bodies).toEqual(expect.arrayContaining(['bodyTeste1', 'bodyTeste2']));
    });
  });

  describe('markAsRead', () => {
    it('Deve marcar uma notificacao como lida', async () => {
      const notificationId = await getNotificationId(prismaService, sender.id, sender.id);

      const response = await request(app.getHttpServer())
        .patch(`/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ isRead: true });

      expect(response.status).toBe(200);
      expect(response.body.isRead).toBe(true);
    });

    it('Deve retornar erro caso o id seja invalido', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/notifications/id-invalido`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ isRead: true });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(NOTIFICATION_MESSAGES.NOT_FOUND);
    });
  });

  describe('deleteNotification', () => {
    it('Deve deletar uma notificacao', async () => {
      const notificationId = await getNotificationId(prismaService, sender.id, sender.id);

      const response = await request(app.getHttpServer())
        .delete(`/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('Deve retornar erro caso o id seja invalido', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/notifications/id-invalido`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(NOTIFICATION_MESSAGES.NOT_FOUND);
    });
  });

  describe('CreateGlobal', () => {
    let sendPushMock: jest.SpyInstance;

    beforeEach(() => {
      sendPushMock = jest
        .spyOn(NotificationService.prototype, 'sendPushNotification')
        .mockResolvedValue([]);
    });

    afterEach(() => {
      if (sendPushMock) {
        sendPushMock.mockRestore();
      }
    });

    afterAll(async () => {
      await app.close();
    });

    it('Deve criar uma notificacao global apenas se for admin', async () => {
      const dto = {
        body: 'bodyTeste',
        type: NotificationType.COMMENT,
        groupName: 'groupTeste',
        senderName: 'senderTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/global')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto);

      expect(response.status).toBe(201);
    });

    it('Deve criar notificação global mesmo se push falhar', async () => {
      sendPushMock.mockRejectedValueOnce(new Error('Erro no push'));

      const dto = {
        body: 'bodyTeste',
        type: NotificationType.COMMENT,
        groupName: 'groupTeste',
        senderName: 'senderTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/global')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto);

      expect(response.status).toBe(201);
      expect(response.body.count).toBeGreaterThan(0);
      expect(sendPushMock).toHaveBeenCalled();
    });

    it('Deve negar acesso a usuário comum', async () => {
      const dto: CreateNotificationDto = {
        body: 'bodyTeste',
        recipientId: recipient.id,
        type: NotificationType.COMMENT,
        groupName: 'groupTeste',
        senderName: 'senderTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/global')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dto);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden resource');
    });
  });

  describe('deleteAllNotifications', () => {
    it('deve deletar todas as notificações de um usuário', async () => {
      await prismaService.notification.createMany({
        data: [
          {
            senderId: sender.id,
            recipientId: recipient.id,
            body: 'body1',
            type: NotificationType.COMMENT,
          },
          {
            senderId: sender.id,
            recipientId: recipient.id,
            body: 'body2',
            type: NotificationType.COMMENT,
          },
        ],
      });

      const res = await request(app.getHttpServer())
        .delete(`/notifications/user`)
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
    });

    it('deve retornar count 0 se usuário não tiver notificações', async () => {
      const emptyUser = await createUserWithToken(prismaService, authService);

      const res = await request(app.getHttpServer())
        .delete(`/notifications/user`)
        .set('Authorization', `Bearer ${emptyUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('deve marcar todas como lidas', async () => {
      await prismaService.notification.createMany({
        data: [
          {
            senderId: sender.id,
            recipientId: recipient.id,
            body: 'body1',
            type: NotificationType.COMMENT,
            isRead: false,
          },
          {
            senderId: sender.id,
            recipientId: recipient.id,
            body: 'body2',
            type: NotificationType.COMMENT,
            isRead: false,
          },
        ],
      });

      const res = await request(app.getHttpServer())
        .patch(`/notifications/user`)
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
    });

    it('deve retornar count 0 se não houver notificações não lidas', async () => {
      const emptyUser = await createUserWithToken(prismaService, authService);

      const res = await request(app.getHttpServer())
        .patch(`/notifications/user`)
        .set('Authorization', `Bearer ${emptyUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
    });
  });

  describe('UpdateNotification', () => {
    it('deve atualizar uma notificação', async () => {
      const notification = await prismaService.notification.create({
        data: {
          senderId: sender.id,
          recipientId: recipient.id,
          body: 'original',
          type: NotificationType.COMMENT,
        },
      });

      const res = await request(app.getHttpServer())
        .patch(`/notifications/update/${notification.id}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          body: 'atualizado',
          isRead: true,
          groupName: 'grupoTeste',
        });

      expect(res.status).toBe(200);
      expect(res.body.body).toBe('atualizado');
      expect(res.body.isRead).toBe(true);
      expect(res.body.groupName).toBe('grupoTeste');
    });

    it('deve retornar 404 para id inválido', async () => {
      const res = await request(app.getHttpServer())
        .patch('/notifications/update/id-invalido')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ body: 'teste' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Notificação não encontrada.');
    });

    it('deve permitir atualização parcial', async () => {
      const notification = await prismaService.notification.create({
        data: {
          senderId: sender.id,
          recipientId: recipient.id,
          body: 'original',
          type: NotificationType.COMMENT,
        },
      });

      const res = await request(app.getHttpServer())
        .patch(`/notifications/update/${notification.id}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ isRead: true });

      expect(res.status).toBe(200);
      expect(res.body.isRead).toBe(true);
      expect(res.body.body).toBe('original');
    });

    it('deve ignorar update vazio', async () => {
      const notification = await prismaService.notification.create({
        data: {
          senderId: sender.id,
          recipientId: recipient.id,
          body: 'sem update',
          type: NotificationType.COMMENT,
        },
      });

      const res = await request(app.getHttpServer())
        .patch(`/notifications/update/${notification.id}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.body).toBe('sem update');
    });

    it('deve retornar erro ao atualizar inexistente sem payload', async () => {
      const res = await request(app.getHttpServer())
        .patch('/notifications/update/id-invalido')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({});

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Notificação não encontrada.');
    });
  });

  describe('registerPushNotifToken', () => {
    it('deve registrar o token', async () => {
      const pushToken = 'token-123';

      const res = await request(app.getHttpServer())
        .post('/notifications/register-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pushNotifToken: pushToken });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ success: true });

      const updated = await prismaService.user.findUnique({
        where: { id: user.id },
      });

      expect(updated.pushNotifToken).toBe(pushToken);
    });

    it('deve falhar sem token', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications/register-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('deve retornar 401 sem JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications/register-token')
        .send({ pushNotifToken: 'x' });

      expect(res.status).toBe(401);
    });
  });

  describe('sendPushNotification', () => {
    let service: NotificationService;
    let validatorMock: any;

    beforeEach(() => {
      validatorMock = {
        validateUserExists: jest.fn(),
      };

      service = new NotificationService(prismaService, validatorMock);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('deve retornar undefined se erro ocorrer', async () => {
      validatorMock.validateUserExists.mockRejectedValueOnce(new Error('fail'));

      const result = await service.sendPushNotification('sender', 'user', 'title', 'body');

      expect(result).toBeUndefined();
    });

    it('deve retornar skipped se disablePopup', async () => {
      validatorMock.validateUserExists.mockResolvedValue({
        id: 'user',
        pushNotifToken: 'ExpoPushToken[valid]',
        disablePopup: true,
      });

      jest.spyOn(Expo, 'isExpoPushToken').mockReturnValue(true);

      const result = await service.sendPushNotification('sender', 'user', 'title', 'body');

      expect(result).toEqual({ skipped: true });
    });
  });

  describe('getNotificationSettings', () => {
    it('deve retornar configs do usuário logado', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications/notification-settings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        disablePopup: false,
        muteSystem: false,
        muteGroups: false,
      });
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).get('/notifications/notification-settings');

      expect(res.status).toBe(401);
    });
  });

  describe('updateNotificationSettings', () => {
    it('deve atualizar configs', async () => {
      const res = await request(app.getHttpServer())
        .patch('/notifications/notification-settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          disablePopup: true,
          muteGroups: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.disablePopup).toBe(true);
      expect(res.body.muteGroups).toBe(true);
    });

    it('deve falhar com dto vazio', async () => {
      const res = await request(app.getHttpServer())
        .patch('/notifications/notification-settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
