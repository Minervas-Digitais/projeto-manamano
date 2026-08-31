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
import { GROUP_MESSAGES } from 'src/messages/group.messages';

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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
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
      expect(res.body).toHaveProperty('inviteCode');
    });

    it('deve criar grupo com inviteCode e categorias padrão', async () => {
      const dto = createGroupDto();
      const res = await request(app.getHttpServer())
        .post('/group')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dto);

      expect(res.status).toBe(201);

      const participant = await prismaService.participant.findFirst({
        where: { groupId: res.body.id },
      });
      expect(participant).not.toBeNull();
      expect(participant?.role).toBe('INSTRUCTOR');

      const categories = await prismaService.category.findMany({
        where: { groupId: res.body.id },
      });
      expect(categories.length).toBe(4);
    });

    it('deve falhar com payload inválido', async () => {
      const res = await request(app.getHttpServer())
        .post('/group')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).post('/group').send(createGroupDto());

      expect(res.status).toBe(401);
    });
  });

  describe('findAll()', () => {
    it('admin deve listar grupos paginados', async () => {
      const res = await request(app.getHttpServer())
        .get('/group')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta).toMatchObject({
        total: expect.any(Number),
        page: 1,
        limit: 20,
        lastPage: expect.any(Number),
      });
      expect(res.body.meta.total).toBeGreaterThanOrEqual(res.body.data.length);
      expect(res.body.meta.lastPage).toBe(Math.ceil(res.body.meta.total / res.body.meta.limit));
    });

    it('deve respeitar query page e limit', async () => {
      await createGroup(prismaService);
      await createGroup(prismaService);
      await createGroup(prismaService);

      const res = await request(app.getHttpServer())
        .get('/group?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(4);
      expect(res.body.meta.lastPage).toBe(Math.ceil(res.body.meta.total / 2));
    });

    it('deve retornar segunda página corretamente', async () => {
      await createGroup(prismaService);
      await createGroup(prismaService);
      await createGroup(prismaService);

      const resPage1 = await request(app.getHttpServer())
        .get('/group?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      const resPage2 = await request(app.getHttpServer())
        .get('/group?page=2&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resPage1.status).toBe(200);
      expect(resPage2.status).toBe(200);
      expect(resPage2.body.meta.page).toBe(2);
      expect(resPage2.body.meta.limit).toBe(2);
      expect(resPage2.body.data.length).toBeGreaterThan(0);
      const idsPage1 = resPage1.body.data.map((g: { id: string }) => g.id);
      const idsPage2 = resPage2.body.data.map((g: { id: string }) => g.id);
      expect(idsPage1.some((id: string) => idsPage2.includes(id))).toBe(false);
    });

    it('deve usar valores padrão (page=1, limit=20) quando sem query', async () => {
      const res = await request(app.getHttpServer())
        .get('/group')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(20);
    });

    it('deve aplicar limit padrão quando apenas page é informado', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(20);
    });

    it('deve aplicar page padrão quando apenas limit é informado', async () => {
      await createGroup(prismaService);
      const res = await request(app.getHttpServer())
        .get('/group?limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.data.length).toBe(2);
    });

    it('deve aceitar limit=20 (limite máximo)', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?limit=20&page=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.meta.limit).toBe(20);
    });

    it('deve retornar total e lastPage corretos com múltiplos registros', async () => {
      for (let i = 0; i < 4; i++) await createGroup(prismaService);

      const res = await request(app.getHttpServer())
        .get('/group?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.meta.total).toBe(5);
      expect(res.body.meta.lastPage).toBe(3);
    });

    it('lastPage deve ser 1 quando total <= limit', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=1&limit=20')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.meta.total).toBe(1);
      expect(res.body.meta.lastPage).toBe(1);
    });

    it('user não admin deve receber 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/group')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).get('/group');
      expect(res.status).toBe(401);
    });

    it('deve retornar 401 com token inválido', async () => {
      const res = await request(app.getHttpServer())
        .get('/group')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });

    it('deve retornar 404 se não houver grupos', async () => {
      await prismaService.group.deleteMany();

      const res = await request(app.getHttpServer())
        .get('/group')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(GROUP_MESSAGES.EMPTY_GROUPS);
    });

    it('deve retornar 404 se página além do total (lista vazia)', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=999&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(GROUP_MESSAGES.EMPTY_GROUPS);
    });

    it('deve retornar 400 para paginação inválida (page=0)', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=0&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para limit=0', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=1&limit=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para paginação inválida (limit=-5)', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=1&limit=-5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para page negativo', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=-1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para valores não numéricos', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=abc&limit=xyz')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para page float', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=1.5&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para limit float', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=1&limit=2.5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 quando limit excede o máximo (21)', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=1&limit=21')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(GROUP_MESSAGES.EXCEEDED_LIMIT(20));
    });

    it('deve retornar 400 quando limit=100', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=1&limit=100')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(GROUP_MESSAGES.EXCEEDED_LIMIT(20));
    });

    it('deve retornar 400 para query param extra não permitido (whitelist)', async () => {
      const res = await request(app.getHttpServer())
        .get('/group?page=1&limit=10&unknown=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
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

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).get(`/group/${groupId}`);
      expect(res.status).toBe(401);
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

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/group/${groupId}`)
        .send(updateGroupDto());
      expect(res.status).toBe(401);
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
      expect(res.body.message).toBe(GROUP_MESSAGES.DELETE_SUCCESS);
    });

    it('deve retornar 403 para user comum', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/group/${groupId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).delete(`/group/${groupId}`);
      expect(res.status).toBe(401);
    });

    it('deve retornar 404 se não existir', async () => {
      const res = await request(app.getHttpServer())
        .delete('/group/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
