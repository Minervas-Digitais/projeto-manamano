import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';
import { NotificationType, User } from '@prisma/client';
import request from 'supertest';
import { UpdateNotificationDto } from '../notification/dto/update-notification.dto';
import {
  createTestGroup,
  createTestParticipant,
  createTestUser,
  getAdminToken,
  getNotificationId,
  getRecipientToken,
  getSenderToken,
  getUserToken,
} from 'src/test/test-helpers';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notification/notification.service';
import Expo from 'expo-server-sdk';

describe('Notification', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let notificationService: NotificationService;
  let userToken: string;
  let adminToken: string;
  let recipientToken: string;
  let senderToken: string;
  let authService: AuthService;
  let groupId: string;
  let recipientUser: User;
  let senderUser: User;
  let adminUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationModule, UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);
    notificationService =
      moduleFixture.get<NotificationService>(NotificationService);

    await app.init();

    await prismaService.notification.deleteMany({});
    await prismaService.user.deleteMany({});
    await prismaService.group.deleteMany?.({});
    userToken = await getUserToken(authService, prismaService);
    adminToken = await getAdminToken(authService, prismaService);
    recipientToken = await getRecipientToken(authService, prismaService);
    senderToken = await getSenderToken(authService, prismaService);
    groupId = await createTestGroup(prismaService);
    await createTestParticipant(prismaService);

    await createTestUser(
      prismaService,
      '23013321412',
      'testrecipient@example.com',
    );
    await createTestUser(
      prismaService,
      '23013321412',
      'testsender@example.com',
    );

    recipientUser = await prismaService.user.findUnique({
      where: { email: 'testrecipient@example.com' },
    });
    senderUser = await prismaService.user.findUnique({
      where: { email: 'testsender@example.com' },
    });
    adminUser = await prismaService.user.findUnique({
      where: { email: 'admin@example.com' },
    });
  });

  afterAll(async () => {
    await prismaService.notification.deleteMany({});
    await prismaService.user.deleteMany({});
    await prismaService.group.deleteMany?.({});
    await app.close();
  });

  describe('Create', () => {
    let sendPushMock: jest.SpyInstance;

    beforeEach(() => {
      sendPushMock = jest
        .spyOn(NotificationService.prototype, 'sendPushNotification')
        .mockResolvedValue([]);
    });

    afterEach(() => {
      sendPushMock.mockRestore();
    });

    it('Deve criar notificação FIXED com recipientId e enviar push', async () => {
      const notificationDTO: CreateNotificationDto = {
        senderId: senderUser.id,
        recipientId: recipientUser.id,
        body: 'notificação fixa com recipientId',
        type: NotificationType.FIXED,
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + userToken)
        .send(notificationDTO);

      expect(response.status).toBe(201);
      expect(sendPushMock).toHaveBeenCalledWith(
        recipientUser.id,
        'Nova notificação',
        'notificação fixa com recipientId',
        undefined,
        NotificationType.FIXED,
      );
    });

    it('Deve criar notificações FIXED para todos participantes do grupo', async () => {
      const notificationDTO: CreateNotificationDto = {
        senderId: senderUser.id,
        recipientId: null,
        type: NotificationType.FIXED,
        body: 'notificação fixa para grupo',
        groupId,
        groupName: 'grupoTeste',
        senderName: 'remetenteTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + userToken)
        .send(notificationDTO);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBeGreaterThan(0);
      expect(sendPushMock).toHaveBeenCalled();
    });

    it('Deve criar notificação COMMENT com recipientId e enviar push', async () => {
      const recipientUserId = await createTestUser(prismaService);
      const senderUserId = await createTestUser(
        prismaService,
        '1234567892',
        'testsender@example.com',
      );

      const notificationDTO: CreateNotificationDto = {
        senderId: senderUserId,
        recipientId: recipientUserId,
        type: NotificationType.COMMENT,
        body: 'bodyTeste',
        groupName: 'groupTeste',
        senderName: 'senderTeste',
        groupId: undefined,
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + userToken)
        .send(notificationDTO);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(sendPushMock).toHaveBeenCalledWith(
        recipientUserId,
        'Nova notificação',
        'bodyTeste',
        undefined,
        NotificationType.COMMENT,
      );
    });

    it('Deve retornar erro ao criar notificação FIXED para grupo sem participantes', async () => {
      const emptyGroupId = await prismaService.group
        .create({
          data: {
            name: 'Grupo Vazio ' + Date.now(),
            inviteCode: 'INVITE-' + Date.now(),
          },
        })
        .then((group) => group.id);

      const notificationDTO: CreateNotificationDto = {
        senderId: senderUser.id,
        recipientId: null,
        body: 'notificação para grupo vazio',
        type: NotificationType.FIXED,
        groupId: emptyGroupId,
        groupName: 'Grupo Vazio',
        senderName: 'remetenteTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + userToken)
        .send(notificationDTO);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'Não há participantes neste grupo para notificar',
      );
    });

    it('Deve criar notificação WARNING com usuário ADMIN', async () => {
      const notificationDTO: CreateNotificationDto = {
        senderId: senderUser.id,
        body: 'corpo de teste warning admin',
        recipientId: recipientUser.id,
        type: NotificationType.WARNING,
        groupName: 'grupoTeste',
        senderName: 'remetenteTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(notificationDTO);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(sendPushMock).toHaveBeenCalledWith(
        recipientUser.id,
        'Nova notificação',
        'corpo de teste warning admin',
        undefined,
        NotificationType.WARNING,
      );
    });

    it('Deve falhar ao criar uma notificação WARNING com usuário não ADMIN', async () => {
      const notificationDTO: CreateNotificationDto = {
        senderId: senderUser.id,
        body: 'corpo de teste',
        recipientId: recipientUser.id,
        type: NotificationType.WARNING,
        groupName: 'grupoTeste',
        senderName: 'remetenteTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + userToken)
        .send(notificationDTO);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        'Apenas ADMIN podem criar notificações do tipo WARNING',
      );
      expect(sendPushMock).not.toHaveBeenCalled();
    });

    it('Deve criar notificação COMMENT e cair no catch do envio push', async () => {
      sendPushMock.mockRejectedValueOnce(new Error('Falha no envio do push'));

      const notificationDTO: CreateNotificationDto = {
        senderId: senderUser.id,
        recipientId: recipientUser.id,
        body: 'teste erro no push',
        type: NotificationType.COMMENT,
        groupName: 'grupoTeste',
        senderName: 'remetenteTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + userToken)
        .send(notificationDTO);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(sendPushMock).toHaveBeenCalled();
    });

    it('Deve criar notificações FIXED para participante do grupo e cair no catch do envio push', async () => {
      sendPushMock.mockRejectedValueOnce(new Error('Erro no envio push'));

      const notificationDTO: CreateNotificationDto = {
        senderId: senderUser.id,
        recipientId: null,
        body: 'notificação fixa para grupo com erro no push',
        type: NotificationType.FIXED,
        groupId,
        groupName: 'grupoTeste',
        senderName: 'remetenteTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + userToken)
        .send(notificationDTO);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBeGreaterThan(0);
      expect(sendPushMock).toHaveBeenCalled();
    });

    it('Deve falhar quando o remetente não existir', async () => {
      const notificationDTO: CreateNotificationDto = {
        senderId: 'id-invalido-remetente',
        body: 'corpo de teste',
        recipientId: recipientUser.id,
        type: NotificationType.COMMENT,
        groupName: 'grupoTeste',
        senderName: 'remetenteTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + userToken)
        .send(notificationDTO);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Remetente não encontrado');
      expect(sendPushMock).not.toHaveBeenCalled();
    });

    it('Deve falhar quando o destinatário não existir', async () => {
      const notificationDTO: CreateNotificationDto = {
        senderId: senderUser.id,
        body: 'corpo de teste',
        recipientId: 'id-invalido-destinatario',
        type: NotificationType.COMMENT,
        groupName: 'grupoTeste',
        senderName: 'remetenteTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + userToken)
        .send(notificationDTO);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Destinatário não encontrado');
      expect(sendPushMock).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 caso os campos forem invalidos', async () => {
      const notificationDTO: CreateNotificationDto = {
        senderId: 123 as any,
        body: 123 as any,
        recipientId: 123 as any,
        type: 123 as any,
        groupName: 123 as any,
        senderName: 123 as any,
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + userToken)
        .send(notificationDTO);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toEqual([
        'senderId must be a string',
        'recipientId must be a string',
        'body must be a string',
        'type must be one of the following values: COMMENT, WARNING, FIXED',
        'groupName must be a string',
        'senderName must be a string',
      ]);
      expect(sendPushMock).not.toHaveBeenCalled();
    });
  });

  describe('getNotificationsForUser', () => {
    it('Deve retornar todas as notificacoes de um usuario', async () => {
      const notificationDTO1 = {
        senderId: senderUser.id,
        recipientId: recipientUser.id,
        body: 'bodyTeste1',
        type: NotificationType.COMMENT,
        groupName: 'groupTeste',
        senderName: 'senderTeste',
      };
      const notificationDTO2 = {
        senderId: senderUser.id,
        recipientId: recipientUser.id,
        body: 'bodyTeste2',
        type: NotificationType.COMMENT,
        groupName: 'groupTeste',
        senderName: 'senderTeste',
      };
      await prismaService.notification.createMany({
        data: [notificationDTO1, notificationDTO2],
      });

      const response = await request(app.getHttpServer())
        .get(`/notifications/user/${recipientUser.id}`)
        .set('Authorization', 'Bearer ' + recipientToken);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0].senderId).toEqual(senderUser.id);
      expect(response.body[0].recipientId).toEqual(recipientUser.id);
      expect(response.body[1].senderId).toEqual(senderUser.id);
      expect(response.body[1].recipientId).toEqual(recipientUser.id);
    });

    it('Deve retornar [] caso o id seja invalido', async () => {
      const id = 123;

      const response = await request(app.getHttpServer())
        .get(`/notifications/user/${id}`)
        .set('Authorization', 'Bearer ' + recipientToken);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Usuário não encontrado');
    });
  });

  describe('markAsRead', () => {
    it('Deve marcar uma notificacao como lida', async () => {
      const notificationId = await getNotificationId(
        app,
        authService,
        prismaService,
      );
      const update = { isRead: true };
      const response = await request(app.getHttpServer())
        .patch(`/notifications/${notificationId}`)
        .set('Authorization', 'Bearer ' + senderToken)
        .send(update);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isRead');
      expect(response.body.isRead).toBe(true);
    });

    it('Deve retornar erro caso o id seja invalido', async () => {
      const notificationId = 123;
      const update: UpdateNotificationDto = {
        isRead: true,
      };

      const response = await request(app.getHttpServer())
        .patch(`/notifications/${notificationId}`)
        .set('Authorization', 'Bearer ' + senderToken)
        .send(update);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Notificação não encontrada');
    });
  });

  describe('deleteNotification', () => {
    it('Deve deletar uma notificacao', async () => {
      const notificationId = await getNotificationId(
        app,
        authService,
        prismaService,
      );
      const response = await request(app.getHttpServer())
        .delete(`/notifications/${notificationId}`)
        .set('Authorization', 'Bearer ' + senderToken);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('Deve retornar erro caso o id seja invalido', async () => {
      const notificationId = 123;

      const response = await request(app.getHttpServer())
        .delete(`/notifications/${notificationId}`)
        .set('Authorization', 'Bearer ' + senderToken);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Notificação não encontrada');
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
      sendPushMock.mockRestore();
    });

    it('Deve criar uma notificacao global apenas se for admin', async () => {
      const notificationDTO = {
        senderId: adminUser.id,
        body: 'bodyTeste',
        recipientId: recipientUser.id,
        type: NotificationType.COMMENT,
        groupName: 'groupTeste',
        senderName: 'senderTeste',
      };
      const response = await request(app.getHttpServer())
        .post('/notifications/global')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(notificationDTO);
      expect(response.status).toBe(201);
    });

    it('Deve criar notificação global e capturar erro no envio push para algum usuário', async () => {
      sendPushMock.mockRejectedValueOnce(new Error('Eroo no envio push'));

      const notificationDTO = {
        senderId: adminUser.id,
        body: 'bodyTeste',
        type: NotificationType.COMMENT,
        groupName: 'groupTeste',
        senderName: 'senderTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/global')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(notificationDTO);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBeGreaterThan(0);
      expect(sendPushMock).toHaveBeenCalled();

      sendPushMock.mockRestore();
    });

    it('Deve negar acesso a token de usuario', async () => {
      const notificationDTO: CreateNotificationDto = {
        senderId: senderUser.id,
        body: 'bodyTeste',
        recipientId: recipientUser.id,
        type: NotificationType.COMMENT,
        groupName: 'groupTeste',
        senderName: 'senderTeste',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/global')
        .set('Authorization', 'Bearer ' + userToken)
        .send(notificationDTO);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden resource');
    });
  });

  describe('deleteAllNotifications', () => {
    it('Deve deletar todas as notificações de um usuário existente', async () => {
      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + senderToken)
        .send({
          senderId: senderUser.id,
          recipientId: recipientUser.id,
          body: 'bodyTeste',
          type: NotificationType.COMMENT,
          groupName: 'grupoTeste',
          senderName: 'senderTeste',
        });

      const response = await request(app.getHttpServer())
        .delete(`/notifications/user/${recipientUser.id}`)
        .set('Authorization', 'Bearer ' + senderToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBeGreaterThanOrEqual(1);
    });

    it('Deve retornar erro ao tentar deletar notificações de usuário inexistente', async () => {
      const fakeUserId = 'non-existing-user-id';

      const response = await request(app.getHttpServer())
        .delete(`/notifications/user/${fakeUserId}`)
        .set('Authorization', 'Bearer ' + senderToken);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Usuário não encontrado');
    });

    it('Deve retornar count 0 ao deletar notificações de um usuário sem notificações', async () => {
      await prismaService.notification.deleteMany({
        where: {
          recipient: {
            OR: [{ phone: '2837192123' }, { email: '230273@gmail.com' }],
          },
        },
      });

      await prismaService.user.deleteMany({
        where: {
          OR: [{ phone: '2837192123' }, { email: '230273@gmail.com' }],
        },
      });

      const emptyUser = await createTestUser(
        prismaService,
        '2837192123',
        '2301273@gmail.com',
      );

      const response = await request(app.getHttpServer())
        .delete(`/notifications/user/${emptyUser}`)
        .set('Authorization', 'Bearer ' + senderToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('Deve marcar todas as notificações como lidas para um usuário', async () => {
      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + senderToken)
        .send({
          senderId: senderUser.id,
          recipientId: recipientUser.id,
          body: 'bodyTeste',
          type: NotificationType.COMMENT,
          groupName: 'grupoTeste',
          senderName: 'senderTeste',
        });

      const response = await request(app.getHttpServer())
        .patch(`/notifications/user/${recipientUser.id}`)
        .set('Authorization', 'Bearer ' + senderToken);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBeGreaterThanOrEqual(1);
    });

    it('Deve retornar erro ao tentar marcar notificações como lidas para usuário inexistente', async () => {
      const fakeUserId = 'non-existing-user-id';

      const response = await request(app.getHttpServer())
        .patch(`/notifications/user/${fakeUserId}`)
        .set('Authorization', 'Bearer ' + senderToken);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Usuário não encontrado');
    });

    it('Deve retornar count 0 ao tentar marcar notificações como lidas quando não há notificações não lidas', async () => {
      await prismaService.notification.deleteMany({
        where: {
          recipient: {
            OR: [{ phone: '283719212' }, { email: '230273@gmail.com' }],
          },
        },
      });

      await prismaService.user.deleteMany({
        where: {
          OR: [{ phone: '283719212' }, { email: '230273123@gmail.com' }],
        },
      });

      const emptyUser = await createTestUser(
        prismaService,
        '283719212',
        '230273123@gmail.com',
      );

      const response = await request(app.getHttpServer())
        .patch(`/notifications/user/${emptyUser}`)
        .set('Authorization', 'Bearer ' + senderToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBe(0);
    });
  });

  describe('UpdateNotification', () => {
    it('Deve atualizar uma notificação com sucesso', async () => {
      const notificationCreated = await prismaService.notification.create({
        data: {
          senderId: senderUser.id,
          recipientId: recipientUser.id,
          body: 'Notificação original do teste service',
          type: NotificationType.COMMENT,
        },
      });

      const updateData: UpdateNotificationDto = {
        body: 'Corpo atualizado via teste direto no service',
        isRead: true,
        groupName: 'grupoServiceTeste',
      };

      const response = await request(app.getHttpServer())
        .patch(`/notifications/update/${notificationCreated.id}`)
        .set('Authorization', 'Bearer ' + senderToken)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(notificationCreated.id);
      expect(response.body.body).toBe(updateData.body);
      expect(response.body.isRead).toBe(true);
      expect(response.body.groupName).toBe(updateData.groupName);
    });

    it('Deve retornar 404 ao tentar atualizar notificação inexistente via rota HTTP', async () => {
      const invalidId = 'id-invalido-teste';

      const updatePayload: UpdateNotificationDto = {
        body: 'Corpo qualquer',
      };

      const response = await request(app.getHttpServer())
        .patch(`/notifications/update/${invalidId}`)
        .set('Authorization', 'Bearer ' + senderToken)
        .send(updatePayload);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Notificação não encontrada.');
    });

    it('Deve permitir atualização parcial de uma notificação', async () => {
      const notification = await prismaService.notification.create({
        data: {
          senderId: senderUser.id,
          recipientId: recipientUser.id,
          body: 'Mensagem original',
          type: NotificationType.COMMENT,
        },
      });

      const updateData: UpdateNotificationDto = {
        isRead: true,
      };

      const response = await request(app.getHttpServer())
        .patch(`/notifications/update/${notification.id}`)
        .set('Authorization', 'Bearer ' + senderToken)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(notification.id);
      expect(response.body.isRead).toBe(true);
      expect(response.body.body).toBe('Mensagem original');
    });

    it('Deve ignorar atualização se nenhum campo for enviado', async () => {
      const notification = await prismaService.notification.create({
        data: {
          senderId: senderUser.id,
          recipientId: recipientUser.id,
          body: 'Teste sem atualização',
          type: NotificationType.COMMENT,
        },
      });

      const updateData: UpdateNotificationDto = {};

      const response = await request(app.getHttpServer())
        .patch(`/notifications/update/${notification.id}`)
        .set('Authorization', 'Bearer ' + senderToken)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.body).toBe('Teste sem atualização');
    });

    it('Deve retornar erro ao tentar atualizar notificação inexistente sem campos', async () => {
      const invalidId = 'id-invalido-teste';
      const updateData: UpdateNotificationDto = {};
      const response = await request(app.getHttpServer())
        .patch(`/notifications/update/${invalidId}`)
        .set('Authorization', 'Bearer ' + senderToken)
        .send(updateData);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Notificação não encontrada.');
    });
  });

  describe('registerPushNotifToken', () => {
    it('deve registrar o pushNotifToken com sucesso via endpoint', async () => {
      const userId = await createTestUser(
        prismaService,
        '1234567891',
        'testeuser@example.com',
      );

      const token = await getUserToken(
        authService,
        prismaService,
        'testeuser@example.com',
      );

      const pushToken = 'token-funcional-123';

      const response = await request(app.getHttpServer())
        .post('/notifications/register-token')
        .set('Authorization', `Bearer ${token}`)
        .send({ pushNotifToken: pushToken });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ success: true });

      const user = await prismaService.user.findUnique({
        where: { id: userId },
      });

      expect(user.pushNotifToken).toBe(pushToken);
    });

    it('deve retornar erro 400 se pushNotifToken não for enviado', async () => {
      const response = await request(app.getHttpServer())
        .post('/notifications/register-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Push token é obrigatório');
    });

    it('deve garantir que o token só é registrado para o usuário autenticado', async () => {
      const email = 'otheruser@example.com';
      const phone = '111222333';
      const otherUserId = await createTestUser(prismaService, phone, email);
      // Tenta registrar token usando token de outro usuário
      const response = await request(app.getHttpServer())
        .post('/notifications/register-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pushNotifToken: 'token-teste' });
      expect(response.status).toBe(201);
      const user = await prismaService.user.findUnique({
        where: { id: otherUserId },
      });
      expect(user.pushNotifToken).not.toBe('token-teste');
    });

    it('deve retornar 401 se não enviar token JWT', async () => {
      const response = await request(app.getHttpServer())
        .post('/notifications/register-token')
        .send({ pushNotifToken: 'any-token' });

      expect(response.status).toBe(401);
    });
  });

  describe('sendPushNotification', () => {
    let notificationService: NotificationService;
    let userFindUniqueSpy: jest.SpyInstance;

    beforeAll(() => {
      notificationService = new NotificationService(prismaService);
    });

    afterEach(() => {
      jest.restoreAllMocks();
      userFindUniqueSpy = undefined;
      if (jest.isMockFunction(Expo.isExpoPushToken)) {
        (Expo.isExpoPushToken as unknown as jest.Mock).mockRestore();
      }
    });

    it('deve lançar NotFoundException se usuário não existir', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        notificationService.sendPushNotification('user-id', 'title', 'body'),
      ).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro se usuário não tiver pushNotifToken', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 'user-id',
        pushNotifToken: null,
      } as any);

      await expect(
        notificationService.sendPushNotification('user-id', 'title', 'body'),
      ).rejects.toThrow('Usuário não possui push token registrado');
    });

    it('deve lançar erro se push token for inválido', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 'user-id',
        pushNotifToken: 'invalid-token',
      } as any);

      jest.spyOn(Expo, 'isExpoPushToken').mockReturnValue(false);

      await expect(
        notificationService.sendPushNotification('user-id', 'title', 'body'),
      ).rejects.toThrow('Push token inválido');
    });

    it('deve retornar { skipped: true } se usuário desativou popup', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 'user-id',
        pushNotifToken: 'ExpoPushToken[valid]',
        disablePopup: true,
      } as any);

      jest.spyOn(Expo, 'isExpoPushToken').mockReturnValue(true);

      const result = await notificationService.sendPushNotification(
        'user-id',
        'title',
        'body',
      );

      expect(result).toEqual({ skipped: true });
    });

    it('deve retornar { skipped: true } se usuário silenciou notificações do sistema para tipos COMMENT ou WARNING', async () => {
      const user = {
        id: 'user-id',
        pushNotifToken: 'ExpoPushToken[valid]',
        muteSystem: true,
        disablePopup: false,
      } as any;

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(Expo, 'isExpoPushToken').mockReturnValue(true);

      const resultComment = await notificationService.sendPushNotification(
        user.id,
        'title',
        'body',
        undefined,
        NotificationType.COMMENT,
      );

      const resultWarning = await notificationService.sendPushNotification(
        user.id,
        'title',
        'body',
        undefined,
        NotificationType.WARNING,
      );

      expect(resultComment).toEqual({ skipped: true });
      expect(resultWarning).toEqual({ skipped: true });
    });

    it('deve retornar { skipped: true } se usuário silenciou notificações de grupos para tipo FIXED', async () => {
      const user = {
        id: 'user-id',
        pushNotifToken: 'ExpoPushToken[valid]',
        muteGroups: true,
        disablePopup: false,
      } as any;

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(Expo, 'isExpoPushToken').mockReturnValue(true);

      const result = await notificationService.sendPushNotification(
        user.id,
        'title',
        'body',
        { groupId: 'group1' },
        NotificationType.FIXED,
      );

      expect(result).toEqual({ skipped: true });
    });

    it('deve enviar a notificação com sucesso e retornar tickets reais', async () => {
      const user = {
        id: 'user-id',
        pushNotifToken: 'ExpoPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
        disablePopup: false,
      } as any;

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(Expo, 'isExpoPushToken').mockReturnValue(true);

      const result = await notificationService.sendPushNotification(
        user.id,
        'title',
        'body',
        { extraData: 123 },
        NotificationType.COMMENT,
      );

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getNotificationSettings', () => {
    let userId: string;
    let token: string;
    const email = 'testnotifuser@example.com';
    const phone = '999888777';

    beforeAll(async () => {
      await prismaService.user.deleteMany({ where: { email } });
      await prismaService.user.deleteMany({ where: { phone } });

      userId = await createTestUser(prismaService, phone, email);
      token = await getUserToken(authService, prismaService, email, phone);
    });

    it('deve retornar as configurações do usuário corretamente', async () => {
      const response = await request(app.getHttpServer())
        .get(`/notifications/${userId}/notification-settings`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        disablePopup: false,
        muteSystem: false,
        muteGroups: false,
      });
    });

    it('deve retornar 401 se tentar acessar configurações de outro usuário', async () => {
      const otherUserId = await createTestUser(
        prismaService,
        '111222333',
        'otheruser@example.com',
      );

      const response = await request(app.getHttpServer())
        .get(`/notifications/${otherUserId}/notification-settings`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'Você só pode acessar suas próprias configurações',
      );
    });

    it('deve retornar 401 se não enviar token JWT', async () => {
      const response = await request(app.getHttpServer()).get(
        `/notifications/${userId}/notification-settings`,
      );

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('updateNotificationSettings', () => {
    beforeAll(async () => {
      await prismaService.user.deleteMany({
        where: { email: 'testNotif@email.com' },
      });
    });

    afterAll(async () => {
      await prismaService.user.deleteMany({
        where: { email: 'testNotif@email.com' },
      });
    });
    it('deve retornar 401 ao tentar atualizar configurações de outro usuário', async () => {
      const email1 = 'user1-branch@example.com';
      const phone1 = '1010101010';
      const email2 = 'user2-branch@example.com';
      const phone2 = '2020202020';
      const userId1 = await createTestUser(prismaService, phone1, email1);
      const userId2 = await createTestUser(prismaService, phone2, email2);
      const token1 = await getUserToken(
        authService,
        prismaService,
        email1,
        phone1,
      );
      const updateDto = { muteSystem: true };
      const response = await request(app.getHttpServer())
        .patch(`/notifications/${userId2}/notification-settings`)
        .set('Authorization', 'Bearer ' + token1)
        .send(updateDto);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'Você só pode modificar suas próprias configurações',
      );
    });

    it('deve lançar BadRequestException se tentar criar notificação FIXED para grupo sem participantes', async () => {
      const senderId = await createTestUser(
        prismaService,
        '3030303030',
        'sender-badrequest@example.com',
      );
      const groupId = await prismaService.group
        .create({
          data: { name: 'GrupoBranch', inviteCode: 'INVITE-BRANCH' },
        })
        .then((group) => group.id);

      const notificationDTO: CreateNotificationDto = {
        senderId,
        recipientId: null,
        body: 'body branch',
        type: NotificationType.FIXED,
        groupId,
        groupName: 'GrupoBranch',
        senderName: 'senderBranch',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', 'Bearer ' + userToken)
        .send(notificationDTO);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Não há participantes neste grupo para notificar.',
      );
    });

    it('deve retornar erro ao falhar em enviar a notificação push', async () => {
      const user = {
        id: 'user-id-catch',
        pushNotifToken: 'ExpoPushToken[valid]',
        disablePopup: false,
      } as any;
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(Expo, 'isExpoPushToken').mockReturnValue(true);
      const notificationServiceLocal = new NotificationService(prismaService);
      const expoMock = jest
        .spyOn(
          (notificationServiceLocal as any).expo,
          'sendPushNotificationsAsync',
        )
        .mockRejectedValueOnce(new Error('Erro de envio'));
      await expect(
        notificationServiceLocal.sendPushNotification(user.id, 'title', 'body'),
      ).rejects.toThrow('Erro de envio');
      expoMock.mockRestore();
      jest.restoreAllMocks();
    });

    it('deve atualizar as configurações do usuário', async () => {
      const email = 'testNotifUser2@email.com';
      const phone = '999888999';

      const userId = await createTestUser(prismaService, phone, email);
      const token = await getUserToken(
        authService,
        prismaService,
        email,
        phone,
      );
      const updateDto = {
        disablePopup: true,
        muteSystem: false,
        muteGroups: true,
      };
      const response = await request(app.getHttpServer())
        .patch(`/notifications/${userId}/notification-settings`)
        .set('Authorization', 'Bearer ' + token)
        .send(updateDto);
      expect(response.status).toBe(200);
      expect(response.body.disablePopup).toBe(true);
      expect(response.body.muteSystem).toBe(false);
      expect(response.body.muteGroups).toBe(true);
    });

    it('deve retornar 401 ao tentar atualizar configurações de outro usuário', async () => {
      const email1 = 'testNotifUser3@email.com';
      const phone1 = '999888998';
      const email2 = 'testNotifUser4@email.com';
      const phone2 = '999888997';

      const userId1 = await createTestUser(prismaService, phone1, email1);
      const userId2 = await createTestUser(prismaService, phone2, email2);
      const token1 = await getUserToken(
        authService,
        prismaService,
        email1,
        phone1,
      );

      const updateDto = { disablePopup: true };
      const response = await request(app.getHttpServer())
        .patch(`/notifications/${userId2}/notification-settings`)
        .set('Authorization', 'Bearer ' + token1)
        .send(updateDto);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'Você só pode modificar suas próprias configurações',
      );
    });

    it('deve lançar BadRequestException se dto estiver vazio', async () => {
      const id = await createTestUser(
        prismaService,
        '293792323',
        'testNotif@email.com',
      );
      await expect(
        notificationService.updateNotificationSettings(id, {}),
      ).rejects.toThrow('Nenhuma configuração para atualizar');
    });

    it('deve lançar NotFoundException se usuário não existir', async () => {
      const updateDto = {
        disablePopup: true,
      };

      await expect(
        notificationService.updateNotificationSettings(
          'id-invalido-123',
          updateDto,
        ),
      ).rejects.toThrow('Usuário não encontrado');
    });
  });
});
