import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { CategoryModule } from '../category/category.module';
import { GroupModule } from 'src/group/group.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

import { createUserWithToken, createGroup, createCategory } from './test-helpers';

describe('Category', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;

  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CategoryModule, GroupModule, UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prismaService = moduleFixture.get(PrismaService);
    authService = moduleFixture.get(AuthService);

    await app.init();
  });

  beforeEach(async () => {
    await prismaService.category.deleteMany();
    await prismaService.group.deleteMany();
    await prismaService.user.deleteMany();

    userToken = (await createUserWithToken(prismaService, authService)).token;
  });

  describe('create()', () => {
    it('deve criar uma nova categoria', async () => {
      const group = await createGroup(prismaService);

      const res = await request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Categoria Teste',
          type: 'NORMAL',
          groupId: group.id,
        });

      expect(res.status).toBe(201);
      expect(res.body.groupId).toBe(group.id);
    });

    it('deve retornar erro 404 caso o id do grupo for invalido', async () => {
      const res = await request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Teste',
          type: 'NORMAL',
          groupId: 'invalid',
        });

      expect(res.status).toBe(404);
    });

    it('deve retornar erro 400 caso o nome da categoria for invalido', async () => {
      const group = await createGroup(prismaService);

      const res = await request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '',
          type: 'NORMAL',
          groupId: group.id,
        });

      expect(res.status).toBe(400);
    });

    it('deve retornar erro 400 caso o tipo da categoria for invalido', async () => {
      const group = await createGroup(prismaService);

      const res = await request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Teste',
          type: '',
          groupId: group.id,
        });

      expect(res.status).toBe(400);
    });

    it('deve retornar erro 401 caso o jwt token for invalido', async () => {
      const group = await createGroup(prismaService);

      const res = await request(app.getHttpServer())
        .post('/category')
        .set('Authorization', 'Bearer ')
        .send({
          name: 'Teste',
          type: 'NORMAL',
          groupId: group.id,
        });

      expect(res.status).toBe(401);
    });
  });

  describe('findAll()', () => {
    it('deve retornar todas as categorias', async () => {
      const group = await createGroup(prismaService);

      await createCategory(prismaService, { groupId: group.id });

      const res = await request(app.getHttpServer())
        .get('/category')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('deve retornar [] caso nao exista categorias', async () => {
      const res = await request(app.getHttpServer())
        .get('/category')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('deve retornar 401 se o token JWT for inválido ou ausente', async () => {
      const res = await request(app.getHttpServer()).get('/category');

      expect(res.status).toBe(401);
    });
  });

  describe('findCategoriesInGroup()', () => {
    it('deve retornar todas as categorias do grupo do id', async () => {
      const group = await createGroup(prismaService);

      await createCategory(prismaService, { groupId: group.id });
      await createCategory(prismaService, { groupId: group.id });

      const res = await request(app.getHttpServer())
        .get(`/category/group/${group.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('deve retornar 404 caso o id do grupo for invalido', async () => {
      const res = await request(app.getHttpServer())
        .get('/category/group/invalid')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('deve retornar [] caso o grupo nao tenha categorias', async () => {
      const group = await createGroup(prismaService);

      const res = await request(app.getHttpServer())
        .get(`/category/group/${group.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('deve retornar 401 se o token JWT for inválido ou ausente', async () => {
      const res = await request(app.getHttpServer()).get('/category/group/id');

      expect(res.status).toBe(401);
    });
  });

  describe('findOne()', () => {
    it('deve retornar uma categoria existente pelo ID', async () => {
      const group = await createGroup(prismaService);

      const category = await createCategory(prismaService, {
        groupId: group.id,
      });

      const res = await request(app.getHttpServer())
        .get(`/category/${category.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(category.id);
    });

    it('deve retornar 404 se a categoria não existir', async () => {
      const res = await request(app.getHttpServer())
        .get('/category/invalid')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('deve retornar 401 se o token JWT for inválido ou ausente', async () => {
      const res = await request(app.getHttpServer()).get('/category/qualquer-id');

      expect(res.status).toBe(401);
    });
  });

  describe('update()', () => {
    it('deve atualizar uma categoria existente', async () => {
      const group = await createGroup(prismaService);

      const category = await createCategory(prismaService, {
        groupId: group.id,
      });

      const res = await request(app.getHttpServer())
        .patch(`/category/${category.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Atualizada',
          type: 'EVENT',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Atualizada');
    });

    it('deve retornar 404 ao tentar atualizar uma categoria inexistente', async () => {
      const res = await request(app.getHttpServer())
        .patch('/category/invalid')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Teste' });

      expect(res.status).toBe(404);
    });

    it('deve retornar 400 se o nome for vazio', async () => {
      const group = await createGroup(prismaService);

      const category = await createCategory(prismaService, {
        groupId: group.id,
      });

      const res = await request(app.getHttpServer())
        .patch(`/category/${category.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });

    it('deve retornar 401 se o token JWT for inválido ou ausente', async () => {
      const res = await request(app.getHttpServer()).patch('/category/qualquer-id');

      expect(res.status).toBe(401);
    });
  });

  describe('remove()', () => {
    it('deve remover uma categoria existente', async () => {
      const group = await createGroup(prismaService);

      const category = await createCategory(prismaService, {
        groupId: group.id,
      });

      const res = await request(app.getHttpServer())
        .delete(`/category/${category.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      const inDb = await prismaService.category.findUnique({
        where: { id: category.id },
      });

      expect(inDb).toBeNull();
    });

    it('deve retornar 404 ao tentar remover uma categoria inexistente', async () => {
      const res = await request(app.getHttpServer())
        .delete('/category/invalid')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('deve retornar 401 se o token JWT for inválido ou ausente', async () => {
      const res = await request(app.getHttpServer()).delete('/category/qualquer-id');

      expect(res.status).toBe(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
