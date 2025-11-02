import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get(PrismaService);

    const user = await prisma.user.findUnique({
      where: { email: 'testuser@example.com' },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          fullName: 'Test User',
          email: 'testuser@example.com',
          phone: '0000000000',
          hash: await bcrypt.hash('password123', 10),
        },
      });
    }
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: 'testuser' } },
    });

    await prisma.$disconnect();
    await app.close();
  });

  it('deve autenticar via /auth/login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'testuser@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('loggedId');
  });

  it('deve retornar 404 se o usuário não existir', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'naoexiste@example.com', password: 'qualquer' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Usuário não encontrado.');
  });

  it('deve retornar 401 se a senha estiver incorreta', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'testuser@example.com', password: 'senhaerrada' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Senha incorreta.');
  });
});
