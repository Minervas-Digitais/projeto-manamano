import { Controller, Get, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { ThrottlingModule } from 'src/common/throttling/throttling.module';
import {
  THROTTLE_LOGIN_LIMIT,
  THROTTLE_REGISTER_LIMIT,
} from 'src/common/throttling/throttling.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { USER_MESSAGES } from 'src/messages/user.messages';
import { createUser, createUserWithToken } from './test-helpers';

const PREFIX = `security_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

let sequence = 0;

function makeUserDto() {
  sequence += 1;
  const unique = `${Date.now()}${sequence}`;

  return {
    fullName: 'Test User',
    email: `${PREFIX}_${unique}@email.com`,
    phone: unique,
    password: 'password123',
  };
}

@Controller('security-test')
class SecurityTestController {
  @Get('a')
  @Throttle({ global: { limit: 3, ttl: 60000 } })
  a() {
    return {};
  }

  @Get('b')
  @Throttle({ global: { limit: 3, ttl: 60000 } })
  b() {
    return {};
  }

  @Get('ip')
  @Throttle({ global: { limit: 1, ttl: 60000 } })
  ip() {
    return {};
  }

  @Get('skip')
  @SkipThrottle({ global: true })
  skip() {
    return {};
  }
}

describe('Security (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ThrottlingModule, AuthModule],
      controllers: [SecurityTestController],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.set('trust proxy', true);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    authService = moduleFixture.get(AuthService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { startsWith: PREFIX } } });
    await prisma.$disconnect();
    await app.close();
  });

  function createPrefixedUser(overrides = {}) {
    return createUser(prisma, { email: `${PREFIX}_${randomUUID()}@test.com`, ...overrides });
  }

  function createTokenFor(overrides = {}) {
    return createUserWithToken(prisma, authService, {
      email: `${PREFIX}_${randomUUID()}@test.com`,
      ...overrides,
    });
  }

  it('deve retornar 429 após exceder o limite de login da conta', async () => {
    const user = await createPrefixedUser();

    for (let attempt = 0; attempt < THROTTLE_LOGIN_LIMIT; attempt++) {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: 'senhaerrada' });

      expect(response.status).toBe(401);
    }

    const blocked = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'senhaerrada' });

    expect(blocked.status).toBe(429);
  });

  it('não deve compartilhar a cota de login entre contas no mesmo IP', async () => {
    const accountA = await createPrefixedUser();
    const accountB = await createPrefixedUser();

    for (let attempt = 0; attempt < THROTTLE_LOGIN_LIMIT; attempt++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: accountA.email, password: 'senhaerrada' });
    }

    const blocked = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: accountA.email, password: 'senhaerrada' });
    expect(blocked.status).toBe(429);

    const otherAccount = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: accountB.email, password: 'senhaerrada' });
    expect(otherAccount.status).toBe(401);
  });

  it('deve compartilhar a cota de login da mesma conta entre IPs diferentes', async () => {
    const user = await createPrefixedUser();

    for (let attempt = 0; attempt < THROTTLE_LOGIN_LIMIT; attempt++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('X-Forwarded-For', '198.51.100.10')
        .send({ email: user.email, password: 'senhaerrada' });
    }

    const blocked = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Forwarded-For', '198.51.100.20')
      .send({ email: user.email, password: 'senhaerrada' });

    expect(blocked.status).toBe(429);
  });

  it('deve retornar 429 após exceder o limite de cadastro por e-mail', async () => {
    const userDto = makeUserDto();

    for (let attempt = 0; attempt < THROTTLE_REGISTER_LIMIT; attempt++) {
      const response = await request(app.getHttpServer()).post('/user').send(userDto);

      expect(response.status).toBe(201);
    }

    const blocked = await request(app.getHttpServer()).post('/user').send(userDto);

    expect(blocked.status).toBe(429);
  });

  it('não deve permitir distinguir cadastro novo de e-mail já existente', async () => {
    const existing = await createPrefixedUser();
    const newAccount = makeUserDto();
    const existingAccount = makeUserDto();

    const created = await request(app.getHttpServer()).post('/user').send(newAccount);
    const conflicted = await request(app.getHttpServer())
      .post('/user')
      .send({ ...existingAccount, email: existing.email });

    expect(created.status).toBe(201);
    expect(conflicted.status).toBe(201);
    expect(created.body).toEqual({ message: USER_MESSAGES.REGISTRATION_RECEIVED });
    expect(conflicted.body).toEqual(created.body);

    const duplicated = await prisma.user.count({ where: { email: existing.email } });
    expect(duplicated).toBe(1);
  });

  it('deve aplicar um teto global entre endpoints diferentes', async () => {
    const { user, token } = await createTokenFor();
    const other = await createTokenFor();

    const first = await request(app.getHttpServer())
      .get('/security-test/a')
      .set('Authorization', `Bearer ${token}`);
    const second = await request(app.getHttpServer())
      .get('/security-test/b')
      .set('Authorization', `Bearer ${token}`);
    const third = await request(app.getHttpServer())
      .get('/security-test/a')
      .set('Authorization', `Bearer ${token}`);
    const blocked = await request(app.getHttpServer())
      .get('/security-test/b')
      .set('Authorization', `Bearer ${token}`);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(third.status).toBe(200);
    expect(blocked.status).toBe(429);

    const otherUser = await request(app.getHttpServer())
      .get('/security-test/a')
      .set('Authorization', `Bearer ${other.token}`);
    expect(otherUser.status).toBe(200);
    expect(other.user.id).not.toBe(user.id);
  });

  it('deve respeitar o IP real quando trust proxy está habilitado', async () => {
    const first = await request(app.getHttpServer())
      .get('/security-test/ip')
      .set('X-Forwarded-For', '203.0.113.10');
    const blocked = await request(app.getHttpServer())
      .get('/security-test/ip')
      .set('X-Forwarded-For', '203.0.113.10');
    const otherIp = await request(app.getHttpServer())
      .get('/security-test/ip')
      .set('X-Forwarded-For', '203.0.113.20');

    expect(first.status).toBe(200);
    expect(blocked.status).toBe(429);
    expect(otherIp.status).toBe(200);
  });

  it('deve ignorar o teto global em rotas com @SkipThrottle nativo', async () => {
    const first = await request(app.getHttpServer())
      .get('/security-test/ip')
      .set('X-Forwarded-For', '203.0.113.30');
    const blocked = await request(app.getHttpServer())
      .get('/security-test/ip')
      .set('X-Forwarded-For', '203.0.113.30');
    const skipped = await request(app.getHttpServer())
      .get('/security-test/skip')
      .set('X-Forwarded-For', '203.0.113.30');

    expect(first.status).toBe(200);
    expect(blocked.status).toBe(429);
    expect(skipped.status).toBe(200);
  });
});
