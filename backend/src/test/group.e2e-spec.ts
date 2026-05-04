import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { GroupModule } from '../group/group.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../prisma/prisma.service';
import { createGroupDto } from 'src/group/dto/create-group.dto.factory';
import { updateGroupDto } from 'src/group/dto/update-group.dto.factory';
import { AuthService } from 'src/auth/auth.service';
import { createUserWithToken, createGroup } from './test-helpers';

describe('Group (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;

  let userToken: string;
  let adminToken: string;
  let groupId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GroupModule, UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = moduleFixture.get(PrismaService);
    authService = moduleFixture.get(AuthService);
  });

  beforeEach(async () => {
    await prismaService.group.deleteMany();
    await prismaService.user.deleteMany();

    userToken = (await createUserWithToken(prismaService, authService)).token;
    adminToken = (
      await createUserWithToken(prismaService, authService, {
        sysRole: 'ADMIN',
      })
    ).token;

    const group = await createGroup(prismaService);
    groupId = group.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create()', () => {
    it('deve criar grupo', async () => {
      const dto = createGroupDto();

      const res = await request(app.getHttpServer())
        .post('/group')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe(dto.name);
      expect(res.body.description).toBe(dto.description);
      expect(res.body).toHaveProperty('id');
    });

    it('deve falhar com payload inválido', async () => {
      const res = await request(app.getHttpServer())
        .post('/group')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer())
        .post('/group')
        .send(createGroupDto());

      expect(res.status).toBe(401);
    });
  });

  describe('findAll()', () => {
    it('admin deve listar grupos', async () => {
      const res = await request(app.getHttpServer())
        .get('/group')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('user não admin deve receber 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/group')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('deve retornar 404 se não houver grupos', async () => {
      await prismaService.group.deleteMany();

      const res = await request(app.getHttpServer())
        .get('/group')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('findOne()', () => {
    it('deve retornar grupo', async () => {
      const res = await request(app.getHttpServer())
        .get(`/group/${groupId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(groupId);
    });

    it('deve retornar 404 se não existir', async () => {
      const res = await request(app.getHttpServer())
        .get('/group/invalid-id')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('update()', () => {
    it('admin deve atualizar grupo', async () => {
      const dto = updateGroupDto({ name: 'Novo Nome' });

      const res = await request(app.getHttpServer())
        .patch(`/group/${groupId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Novo Nome');
    });

    it('deve retornar 403 para user comum', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/group/${groupId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateGroupDto());

      expect(res.status).toBe(403);
    });

    it('deve retornar 404 se grupo não existir', async () => {
      const res = await request(app.getHttpServer())
        .patch('/group/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateGroupDto());

      expect(res.status).toBe(404);
    });

    it('deve retornar 400 se payload inválido', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/group/${groupId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('remove()', () => {
    it('admin deve deletar grupo', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/group/${groupId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('deve retornar 403 para user comum', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/group/${groupId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('deve retornar 404 se não existir', async () => {
      const res = await request(app.getHttpServer())
        .delete('/group/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
