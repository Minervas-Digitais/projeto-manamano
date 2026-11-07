import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import {
  PASSWORD_RESET_MAX_ATTEMPTS,
  PASSWORD_RESET_MAX_REQUESTS_PER_WINDOW,
} from 'src/auth/password-reset.service';
import { MailService } from 'src/mail/mail.service';
import { AUTH_MESSAGES } from 'src/messages/auth.messages';
import { MAIL_MESSAGES } from 'src/messages/mail.messages';
import { PrismaService } from 'src/prisma/prisma.service';
import { createUser as baseCreateUser } from './test-helpers';

const AUTH_E2E_PREFIX = `auth_e2e_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

function createUser(prisma: PrismaService) {
  return baseCreateUser(prisma, { email: `${AUTH_E2E_PREFIX}_${randomUUID()}@test.com` });
}

function cleanupUsers(prisma: PrismaService) {
  return prisma.user.deleteMany({ where: { email: { startsWith: AUTH_E2E_PREFIX } } });
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let auth: AuthService;
  let mailService: MailService;

  let user: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    auth = moduleFixture.get(AuthService);
    mailService = moduleFixture.get(MailService);

    user = await createUser(prisma);
  });

  afterAll(async () => {
    await cleanupUsers(prisma);

    await prisma.$disconnect();
    await app.close();
  });

  it('deve autenticar via /auth/login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('loggedId', user.id);
  });

  it('deve retornar 401 se o usuário não existir', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'naoexiste@example.com',
      password: 'qualquer',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('E-mail ou senha incorretos.');
  });

  it('deve retornar 401 se a senha estiver incorreta', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: user.email,
      password: 'senhaerrada',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('E-mail ou senha incorretos.');
  });

  it('não deve permitir distinguir usuário inexistente de senha incorreta', async () => {
    const missingUser = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'naoexiste@example.com',
      password: 'qualquer',
    });

    const wrongPassword = await request(app.getHttpServer()).post('/auth/login').send({
      email: user.email,
      password: 'senhaerrada',
    });

    expect(missingUser.status).toBe(wrongPassword.status);
    expect(missingUser.body.message).toBe(wrongPassword.body.message);
  });

  it('deve retornar 400 se dto inválido', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'email-invalido',
      password: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Bad Request');
  });

  it('deve retornar 401 ao fazer logout sem token', async () => {
    const response = await request(app.getHttpServer()).post('/auth/logout');

    expect(response.status).toBe(401);
  });

  it('deve invalidar apenas o refresh token do usuário autenticado', async () => {
    const { accessToken } = await auth.login({ email: user.email, password: 'password123' });

    const victim = await createUser(prisma);
    await auth.login({ email: victim.email, password: 'password123' });

    const victimBefore = await prisma.user.findUnique({ where: { id: victim.id } });
    expect(victimBefore.refreshToken).not.toBeNull();

    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: victim.id });

    expect(response.status).toBe(201);

    const userAfter = await prisma.user.findUnique({ where: { id: user.id } });
    expect(userAfter.refreshToken).toBeNull();

    const victimAfter = await prisma.user.findUnique({ where: { id: victim.id } });
    expect(victimAfter.refreshToken).not.toBeNull();
  });

  describe('recuperação de senha', () => {
    const newPassword = 'novaSenha123';
    let sendMailMock: jest.Mock;

    function extractCode(): string {
      const resetMail = sendMailMock.mock.calls
        .map(([options]) => options)
        .filter((options) => options.subject === MAIL_MESSAGES.PASSWORD_RESET_SUBJECT)
        .pop();

      return resetMail.text.match(/código de verificação: (\d{6})/)[1];
    }

    async function requestCode(email: string) {
      return request(app.getHttpServer()).post('/auth/forgot-password').send({ email });
    }

    async function verifyCode(email: string, code: string) {
      return request(app.getHttpServer()).post('/auth/verify-reset-code').send({ email, code });
    }

    async function resetWithToken(resetToken: string, password = newPassword) {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ resetToken, newPassword: password });
    }

    function wrongCodeFor(code: string): string {
      return code === '000000' ? '111111' : '000000';
    }

    beforeEach(async () => {
      sendMailMock = jest.fn().mockResolvedValue(true);
      jest.spyOn(mailService, 'getTransporter').mockReturnValue({ sendMail: sendMailMock } as any);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('POST /auth/forgot-password', () => {
      it('deve enviar o código e guardar apenas o hash', async () => {
        const target = await createUser(prisma);

        const response = await requestCode(target.email);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(AUTH_MESSAGES.FORGOT_PASSWORD_REQUESTED);
        expect(sendMailMock).toHaveBeenCalledWith(
          expect.objectContaining({
            to: target.email,
            subject: MAIL_MESSAGES.PASSWORD_RESET_SUBJECT,
          }),
        );

        const code = extractCode();
        const stored = await prisma.passwordReset.findFirst({ where: { userId: target.id } });

        expect(stored).not.toBeNull();
        expect(stored.codeHash).not.toContain(code);
        expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now());
      });

      it('deve responder igual para e-mail inexistente sem enviar e-mail', async () => {
        const response = await requestCode('naoexiste@example.com');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(AUTH_MESSAGES.FORGOT_PASSWORD_REQUESTED);
        expect(sendMailMock).not.toHaveBeenCalled();
      });

      it('deve invalidar o código anterior ao gerar um novo', async () => {
        const target = await createUser(prisma);

        await requestCode(target.email);
        const firstCode = extractCode();

        await requestCode(target.email);
        const secondCode = extractCode();

        if (firstCode !== secondCode) {
          const responseOld = await verifyCode(target.email, firstCode);
          expect(responseOld.status).toBe(400);
        }

        const responseNew = await verifyCode(target.email, secondCode);
        expect(responseNew.status).toBe(200);
      });

      it('deve limitar a quantidade de códigos enviados por conta', async () => {
        const target = await createUser(prisma);

        for (let i = 0; i < PASSWORD_RESET_MAX_REQUESTS_PER_WINDOW + 1; i++) {
          const response = await requestCode(target.email);
          expect(response.status).toBe(200);
        }

        expect(sendMailMock).toHaveBeenCalledTimes(PASSWORD_RESET_MAX_REQUESTS_PER_WINDOW);
      });

      it('deve retornar 400 se o e-mail for inválido', async () => {
        const response = await requestCode('email-invalido');

        expect(response.status).toBe(400);
      });
    });

    describe('POST /auth/verify-reset-code', () => {
      it('deve validar o código e retornar resetToken', async () => {
        const target = await createUser(prisma);

        await requestCode(target.email);
        const code = extractCode();

        const response = await verifyCode(target.email, code);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('resetToken');
        expect(typeof response.body.resetToken).toBe('string');

        const stored = await prisma.passwordReset.findFirst({ where: { userId: target.id } });
        expect(stored.verifiedAt).not.toBeNull();
        expect(stored.resetTokenHash).not.toBeNull();
        expect(stored.resetTokenExpiresAt.getTime()).toBeGreaterThan(Date.now());
      });

      it('deve recusar código errado e bloquear após o limite de tentativas', async () => {
        const target = await createUser(prisma);

        await requestCode(target.email);
        const code = extractCode();

        for (let i = 0; i < PASSWORD_RESET_MAX_ATTEMPTS; i++) {
          const response = await verifyCode(target.email, wrongCodeFor(code));
          expect(response.status).toBe(400);
          expect(response.body.message).toBe(AUTH_MESSAGES.INVALID_OR_EXPIRED_CODE);
        }

        const blocked = await verifyCode(target.email, code);
        expect(blocked.status).toBe(400);
        expect(blocked.body.message).toBe(AUTH_MESSAGES.INVALID_OR_EXPIRED_CODE);
      });

      it('deve recusar código expirado', async () => {
        const target = await createUser(prisma);

        await requestCode(target.email);
        const code = extractCode();

        await prisma.passwordReset.updateMany({
          where: { userId: target.id },
          data: { expiresAt: new Date(Date.now() - 1000) },
        });

        const response = await verifyCode(target.email, code);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(AUTH_MESSAGES.INVALID_OR_EXPIRED_CODE);
      });

      it('deve retornar o mesmo erro para e-mail inexistente', async () => {
        const response = await verifyCode('naoexiste@example.com', '123456');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(AUTH_MESSAGES.INVALID_OR_EXPIRED_CODE);
      });

      it('deve retornar 400 se o código for inválido', async () => {
        const target = await createUser(prisma);

        expect((await verifyCode(target.email, '12ab56')).status).toBe(400);
        expect((await verifyCode(target.email, '12345')).status).toBe(400);
      });
    });

    describe('POST /auth/reset-password', () => {
      it('deve redefinir a senha, revogar a sessão e enviar alerta', async () => {
        const target = await createUser(prisma);
        const session = await auth.login({ email: target.email, password: 'password123' });

        await requestCode(target.email);
        const verifyResponse = await verifyCode(target.email, extractCode());
        const { resetToken } = verifyResponse.body;

        const response = await resetWithToken(resetToken);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(AUTH_MESSAGES.PASSWORD_RESET_SUCCESS);

        const updated = await prisma.user.findUnique({ where: { id: target.id } });
        expect(updated.refreshToken).toBeNull();
        await expect(auth.refresh({ refreshToken: session.refreshToken })).rejects.toThrow();

        await expect(
          auth.login({ email: target.email, password: 'password123' }),
        ).rejects.toThrow();
        const login = await auth.login({ email: target.email, password: newPassword });
        expect(login.accessToken).toBeDefined();

        expect(await prisma.passwordReset.count({ where: { userId: target.id } })).toBe(0);
        expect(sendMailMock).toHaveBeenCalledWith(
          expect.objectContaining({
            to: target.email,
            subject: MAIL_MESSAGES.PASSWORD_CHANGED_SUBJECT,
          }),
        );
      });

      it('não deve permitir reutilizar o resetToken', async () => {
        const target = await createUser(prisma);

        await requestCode(target.email);
        const verifyResponse = await verifyCode(target.email, extractCode());
        const { resetToken } = verifyResponse.body;

        expect((await resetWithToken(resetToken)).status).toBe(200);

        const reuse = await resetWithToken(resetToken, 'outraSenha123');
        expect(reuse.status).toBe(400);
        expect(reuse.body.message).toBe(AUTH_MESSAGES.INVALID_OR_EXPIRED_RESET_TOKEN);
      });

      it('deve recusar resetToken expirado', async () => {
        const target = await createUser(prisma);

        await requestCode(target.email);
        const verifyResponse = await verifyCode(target.email, extractCode());
        const { resetToken } = verifyResponse.body;

        await prisma.passwordReset.updateMany({
          where: { userId: target.id },
          data: { resetTokenExpiresAt: new Date(Date.now() - 1000) },
        });

        const response = await resetWithToken(resetToken);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(AUTH_MESSAGES.INVALID_OR_EXPIRED_RESET_TOKEN);
      });

      it('deve retornar erro para resetToken inválido', async () => {
        const response = await resetWithToken('token-inexistente');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(AUTH_MESSAGES.INVALID_OR_EXPIRED_RESET_TOKEN);
      });

      it('deve retornar 400 se a nova senha for menor que 8 ou maior que 72 caracteres', async () => {
        expect((await resetWithToken('qualquer-token', 'curta')).status).toBe(400);
        expect((await resetWithToken('qualquer-token', 'a'.repeat(73))).status).toBe(400);
      });
    });
  });
});
