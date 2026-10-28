import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerStorage, ThrottlerStorageService } from '@nestjs/throttler';
import request from 'supertest';
import { AuthModule } from 'src/auth/auth.module';
import { ThrottlingModule } from 'src/common/throttling/throttling.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { createUser } from './test-helpers';

function makeUserDto(index: number) {
  const unique = `${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`;

  return {
    fullName: 'Test User',
    email: `security_${unique}@email.com`,
    phone: unique.replace(/\D/g, ''),
    password: 'password123',
  };
}

describe('Security (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let throttlerStorage: ThrottlerStorageService;
  let user: Awaited<ReturnType<typeof createUser>>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ThrottlingModule, AuthModule],
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
    throttlerStorage = moduleFixture.get<ThrottlerStorageService>(ThrottlerStorage);
  });

  beforeEach(async () => {
    throttlerStorage.storage.clear();
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();

    user = await createUser(prisma);
  });

  afterAll(async () => {
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  it('deve retornar 429 após exceder o limite de tentativas de login', async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
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

  it('deve retornar 429 após exceder o limite de cadastros', async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await request(app.getHttpServer()).post('/user').send(makeUserDto(attempt));

      expect(response.status).toBe(201);
    }

    const blocked = await request(app.getHttpServer()).post('/user').send(makeUserDto(5));

    expect(blocked.status).toBe(429);
  });
});
