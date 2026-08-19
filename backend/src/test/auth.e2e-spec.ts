import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { createUser } from './test-helpers';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let auth: AuthService;

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
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'naoexiste@example.com',
      password: 'qualquer',
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Usuário não encontrado.');
  });

  it('deve retornar 401 se a senha estiver incorreta', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: user.email,
      password: 'senhaerrada',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Senha incorreta.');
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
});
