import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { createUser } from './test-helpers';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let user: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get(PrismaService);

    user = await createUser(prisma);
  });

  afterAll(async () => {
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
    await app.close();
  });

  afterAll(async () => {
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

  it('deve retornar 404 se o usuário não existir', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'naoexiste@example.com',
        password: 'qualquer',
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Usuário não encontrado.');
  });

  it('deve retornar 401 se a senha estiver incorreta', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: 'senhaerrada',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Senha incorreta.');
  });

  it('deve retornar 400 se dto inválido', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'email-invalido',
        password: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Bad Request');
  });
});
