import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { MailModule } from 'src/mail/mail.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { AuthService } from 'src/auth/auth.service';
import { createUserWithToken } from './test-helpers';
import { MAIL_MESSAGES } from 'src/messages/mail.messages';

describe('Mail (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let mailService: MailService;
  let authService: AuthService;

  let user: any;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MailModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = moduleFixture.get(PrismaService);
    authService = moduleFixture.get(AuthService);
    mailService = moduleFixture.get(MailService);
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();

    const result = await createUserWithToken(prismaService, authService);

    user = result.user;
    userToken = result.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /mail', () => {
    let sendMailMock: jest.Mock;

    beforeEach(() => {
      sendMailMock = jest.fn().mockResolvedValue(true);

      jest.spyOn(mailService, 'getTransporter').mockReturnValue({
        sendMail: sendMailMock,
      } as any);
    });

    it('deve enviar email com sucesso', async () => {
      const spy = jest.spyOn(mailService, 'sendMail');

      const dto = {
        subject: 'Teste de envio',
        text: 'Teste automatizado',
      };

      const res = await request(app.getHttpServer())
        .post('/mail')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.message).toContain(MAIL_MESSAGES.SEND_SUCCESS);

      expect(spy).toHaveBeenCalledWith(dto, user.id);

      expect(sendMailMock).toHaveBeenCalled();
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).post('/mail').send({
        subject: 'Teste',
        text: 'Teste',
      });

      expect(res.status).toBe(401);
    });

    it('deve retornar 400 se payload inválido', async () => {
      const res = await request(app.getHttpServer())
        .post('/mail')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          subject: 123,
          text: false,
        });

      expect(res.status).toBe(400);
    });

    it('deve retornar 500 quando falhar envio de email', async () => {
      jest.spyOn(mailService, 'getTransporter').mockReturnValue({
        sendMail: jest.fn().mockRejectedValue(new Error('SMTP error')),
      } as any);

      const dto = {
        subject: 'Teste',
        text: 'Teste',
      };

      const res = await request(app.getHttpServer())
        .post('/mail')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dto);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe(MAIL_MESSAGES.SEND_FAILURE);
    });

    it('deve chamar transporter com os dados corretos', async () => {
      const sendMailMock = jest.fn().mockResolvedValue(true);

      const transporterSpy = jest
        .spyOn(mailService, 'getTransporter')
        .mockReturnValue({
          sendMail: sendMailMock,
        } as any);

      const dto = {
        subject: 'Assunto X',
        text: 'Conteudo X',
      };

      await request(app.getHttpServer())
        .post('/mail')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dto);

      expect(transporterSpy).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: dto.subject,
          text: expect.stringContaining(dto.text),
          from: expect.any(String),
          to: expect.any(String),
          cc: user.email,
        }),
      );
    });
  });
});
