import { INestApplication, ValidationPipe, ExecutionContext, CanActivate } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { MailModule } from 'src/mail/mail.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MailService } from 'src/mail/mail.service';

import { createTestUser } from './test-helpers';

// 🔒 Mock do AuthGuard
class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

// ✉️ Mock do MailService
const mockMailService = {
  sendMail: jest.fn().mockResolvedValue({
    message: 'Mail sent successfully (mock)',
  }),
};

describe('Mail', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MailModule, AuthModule],
    })
      .overrideGuard(JwtAuthGuard) // Ignora autenticação
      .useClass(MockAuthGuard)
      .overrideProvider(MailService) // Mock do serviço de email
      .useValue(mockMailService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  describe('POST /mail', () => {
    it('deve enviar um email com sucesso (mockado)', async () => {
      const userId = await createTestUser(prismaService);

      const response = await request(app.getHttpServer())
        .post('/mail')
        .send({
          subject: 'Teste de envio',
          text: 'Este é um teste automatizado de envio de e-mail',
          userId: userId,
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('Mail sent successfully');
      expect(mockMailService.sendMail).toHaveBeenCalled(); // ✅ Confirma se foi chamado
    });

    it('deve retornar erro 400 se campos forem inválidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/mail')
        .send({
          subject: 123,
          text: false,
          userId: null,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
