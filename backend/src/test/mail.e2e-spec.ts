import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { MailModule } from 'src/mail/mail.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MailService } from 'src/mail/mail.service';
import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcrypt';
import { createTestUser, getUserToken } from 'src/test/test-helpers';

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}
const mockMailService = {
  sendMail: jest.fn().mockResolvedValue({
    message: 'Mail sent successfully (mock)',
  }),
};

describe('Mail', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let mailService: MailService;
  let userId: string;
  let authService: AuthService;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MailModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);
    mailService = moduleFixture.get<MailService>(MailService);

    userToken = await getUserToken(authService, prismaService);
    const user = await prismaService.user.findUnique({
      where: { email: 'testuser@example.com' },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /mail', () => {
    it('deve enviar um email com sucesso (com token real)', async () => {
      const spy = jest.spyOn(mailService, 'sendMail');

      const response = await request(app.getHttpServer())
        .post('/mail')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          subject: 'Teste de envio',
          text: 'Este é um teste automatizado de envio de e-mail',
          userId: userId,
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('Mail sent successfully');
      expect(spy).toHaveBeenCalledWith({
        subject: 'Teste de envio',
        text: 'Este é um teste automatizado de envio de e-mail',
        userId: userId,
      });
    });

    it('deve retornar 401 sem token', async () => {
      const response = await request(app.getHttpServer()).post('/mail').send({
        subject: 'Teste',
        text: 'Teste',
        userId,
      });

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 400 se campos forem inválidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/mail')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          subject: 123,
          text: false,
          userId: null,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
    });
  });
});
