import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { SearchModule } from '../search/search.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../prisma/prisma.service';

import { GroupModule } from 'src/group/group.module';
import { AuthService } from 'src/auth/auth.service';
import { SEARCH_MESSAGES } from 'src/messages/search.messages';
import { BASE_MESSAGES } from 'src/messages/base.messages';
import {
  createCategory,
  createGroup,
  createPost,
  createUser,
  createUserWithToken,
} from './test-helpers';

describe('SearchController', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;
  let userToken: string;
  let user: any;
  let group: any;
  let category: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SearchModule, UserModule, AuthModule, GroupModule],
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

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  beforeEach(async () => {
    await prismaService.post.deleteMany({});
    await prismaService.category.deleteMany({});
    await prismaService.group.deleteMany({});
    await prismaService.user.deleteMany({});

    const userResult = await createUserWithToken(prismaService, authService, {
      fullName: 'Test User',
    });
    user = userResult.user;
    userToken = userResult.token;

    group = await createGroup(prismaService, { name: 'Test Group' });

    category = await createCategory(prismaService, {
      name: 'Test Category',
      groupId: group.id,
    });

    await createPost(prismaService, {
      title: 'Test Post',
      input: 'Conteúdo Teste',
      userId: user.id,
      groupId: group.id,
      categoryId: category.id,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('search()', () => {
    it('deve retornar resultados de pesquisa para usuários, grupos e posts', async () => {
      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('groups');
      expect(response.body).toHaveProperty('posts');

      expect(response.body.users.length).toBeGreaterThan(0);
      expect(response.body.groups.length).toBeGreaterThan(0);
      expect(response.body.posts.length).toBeGreaterThan(0);

      const searchTerm = 'test';

      response.body.users.forEach((u) => {
        expect(u.fullName.toLowerCase()).toContain(searchTerm);
      });

      response.body.groups.forEach((g) => {
        expect(g.name.toLowerCase()).toContain(searchTerm);
      });

      response.body.posts.forEach((p) => {
        const title = p.title?.toLowerCase() ?? '';
        const input = p.input?.toLowerCase() ?? '';
        expect(title.includes(searchTerm) || input.includes(searchTerm)).toBe(true);
      });
    });

    it('deve retornar metadados de paginação com valores padrão (page=1, limit=5, PaginatedResponseDto)', async () => {
      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(201);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 5,
        users: { page: 1, limit: 5, total: 1, lastPage: 1 },
        groups: { page: 1, limit: 5, total: 1, lastPage: 1 },
        posts: { page: 1, limit: 5, total: 1, lastPage: 1 },
      });
    });

    it('deve respeitar query page e limit', async () => {
      for (let i = 0; i < 7; i++) {
        await createUser(prismaService, { fullName: `Test User ${i}` });
      }

      const response = await request(app.getHttpServer())
        .post('/search?page=1&limit=3')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(201);
      expect(response.body.users.length).toBe(3);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 3,
        users: { page: 1, limit: 3, total: 8, lastPage: 3 },
        groups: { page: 1, limit: 3, total: 1, lastPage: 1 },
        posts: { page: 1, limit: 3, total: 1, lastPage: 1 },
      });

      const pageTwo = await request(app.getHttpServer())
        .post('/search?page=3&limit=3')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(pageTwo.status).toBe(201);
      expect(pageTwo.body.users.length).toBe(2);
      expect(pageTwo.body.pagination.users).toEqual({
        page: 3,
        limit: 3,
        total: 8,
        lastPage: 3,
      });
    });

    it('deve retornar segunda página corretamente sem sobreposição', async () => {
      for (let i = 0; i < 7; i++) {
        await createUser(prismaService, { fullName: `Test User ${i}` });
      }

      const resPage1 = await request(app.getHttpServer())
        .post('/search?page=1&limit=3')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      const resPage2 = await request(app.getHttpServer())
        .post('/search?page=2&limit=3')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(resPage1.status).toBe(201);
      expect(resPage2.status).toBe(201);
      expect(resPage2.body.pagination.users.page).toBe(2);
      const ids1 = resPage1.body.users.map((u: { id: string }) => u.id);
      const ids2 = resPage2.body.users.map((u: { id: string }) => u.id);
      expect(ids1.some((id: string) => ids2.includes(id))).toBe(false);
    });

    it('deve usar valores padrão quando apenas page é informado (limit=5)', async () => {
      const res = await request(app.getHttpServer())
        .post('/search?page=1')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(res.status).toBe(201);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.users.limit).toBe(5);
    });

    it('deve usar valores padrão quando apenas limit é informado (page=1)', async () => {
      const res = await request(app.getHttpServer())
        .post('/search?limit=2')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(res.status).toBe(201);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
    });

    it('deve aceitar limit=20 (limite máximo global)', async () => {
      const res = await request(app.getHttpServer())
        .post('/search?limit=20&page=1')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(res.status).toBe(201);
      expect(res.body.pagination.limit).toBe(20);
    });

    it('deve retornar arrays vazios em página além do total', async () => {
      const response = await request(app.getHttpServer())
        .post('/search?page=2&limit=5')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(201);
      expect(response.body.users).toEqual([]);
      expect(response.body.groups).toEqual([]);
      expect(response.body.posts).toEqual([]);
      expect(response.body.pagination.users.total).toBe(1);
      expect(response.body.pagination.users.lastPage).toBe(1);
    });

    it('deve rejeitar payload com paginação no body (whitelist)', async () => {
      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test', page: 1, limit: 3 });

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('property page should not exist')]),
      );
    });

    it('deve retornar 400 para paginação inválida (page=0) via query', async () => {
      const response = await request(app.getHttpServer())
        .post('/search?page=0&limit=5')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 para limit=0', async () => {
      const response = await request(app.getHttpServer())
        .post('/search?page=1&limit=0')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 para limit=-5', async () => {
      const response = await request(app.getHttpServer())
        .post('/search?page=1&limit=-5')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(response.status).toBe(400);
    });

    it('deve retornar 400 para page negativo', async () => {
      const response = await request(app.getHttpServer())
        .post('/search?page=-1&limit=5')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(response.status).toBe(400);
    });

    it('deve retornar 400 para valores não numéricos', async () => {
      const response = await request(app.getHttpServer())
        .post('/search?page=abc&limit=xyz')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(response.status).toBe(400);
    });

    it('deve retornar 400 para page float', async () => {
      const response = await request(app.getHttpServer())
        .post('/search?page=1.5&limit=5')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(response.status).toBe(400);
    });

    it('deve retornar 400 para limit float', async () => {
      const response = await request(app.getHttpServer())
        .post('/search?page=1&limit=2.5')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(response.status).toBe(400);
    });

    it('deve retornar 400 quando limit excede o máximo (21) via DTO global', async () => {
      const response = await request(app.getHttpServer())
        .post('/search?page=1&limit=21')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(BASE_MESSAGES.EXCEEDED_LIMIT(20));
    });

    it('deve retornar 400 quando limit=100', async () => {
      const response = await request(app.getHttpServer())
        .post('/search?page=1&limit=100')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(BASE_MESSAGES.EXCEEDED_LIMIT(20));
    });

    it('deve retornar 400 para query param extra não permitido (whitelist)', async () => {
      const response = await request(app.getHttpServer())
        .post('/search?page=1&limit=5&unknown=1')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(response.status).toBe(400);
    });

    it('deve retornar 401 se não enviar token', async () => {
      const response = await request(app.getHttpServer()).post('/search').send({ input: 'Test' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('deve retornar 401 se token for inválido', async () => {
      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer tokenInvalido')
        .send({ input: 'Test' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('deve retornar 400 se input estiver vazio', async () => {
      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(['input should not be empty']);
    });

    it('deve retornar 400 se input ausente', async () => {
      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('searchByFilter()', () => {
    it('deve retornar resultados de pesquisa para usuários com metadados PaginatedResponseDto', async () => {
      const response = await request(app.getHttpServer())
        .post(`/search/filter/users`)
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('fullName');
      expect(response.body.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        lastPage: 1,
      });
    });

    it('deve retornar resultados de pesquisa para grupos (PaginatedResponseDto)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/search/filter/groups`)
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        lastPage: expect.any(Number),
      });
    });

    it('deve retornar resultados de pesquisa para posts', async () => {
      const response = await request(app.getHttpServer())
        .post(`/search/filter/posts`)
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.meta).toMatchObject({ page: 1, limit: 10 });
    });

    it('deve respeitar query page e limit na busca por filtro', async () => {
      for (let i = 0; i < 5; i++) {
        await createUser(prismaService, { fullName: `Test User ${i}` });
      }

      const response = await request(app.getHttpServer())
        .post('/search/filter/users?page=1&limit=2')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.meta).toEqual({
        page: 1,
        limit: 2,
        total: 6,
        lastPage: 3,
      });

      const lastPage = await request(app.getHttpServer())
        .post('/search/filter/users?page=3&limit=2')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(lastPage.status).toBe(200);
      expect(lastPage.body.data.length).toBe(2);
      expect(lastPage.body.meta).toEqual({
        page: 3,
        limit: 2,
        total: 6,
        lastPage: 3,
      });
    });

    it('deve retornar segunda página sem sobreposição', async () => {
      for (let i = 0; i < 5; i++) {
        await createUser(prismaService, { fullName: `Test User ${i}` });
      }

      const p1 = await request(app.getHttpServer())
        .post('/search/filter/users?page=1&limit=2')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      const p2 = await request(app.getHttpServer())
        .post('/search/filter/users?page=2&limit=2')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(p1.body.data.length).toBe(2);
      expect(p2.body.data.length).toBe(2);
      const ids1 = p1.body.data.map((u: { id: string }) => u.id);
      const ids2 = p2.body.data.map((u: { id: string }) => u.id);
      expect(ids1.some((id: string) => ids2.includes(id))).toBe(false);
    });

    it('deve usar valores padrão quando sem query (page=1, limit=10)', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
    });

    it('deve aplicar limit padrão quando apenas page é informado', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=2')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.limit).toBe(10);
    });

    it('deve aplicar page padrão quando apenas limit é informado', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?limit=2')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
    });

    it('deve aceitar limit=20 (limite máximo)', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=1&limit=20')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(200);
      expect(res.body.meta.limit).toBe(20);
    });

    it('deve retornar meta.total e lastPage corretos com múltiplos registros', async () => {
      for (let i = 0; i < 4; i++) await createUser(prismaService, { fullName: `Test User ${i}` });
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=1&limit=2')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(200);
      // 1 original + 4 novos = 5 filtrados por 'Test' (todos contem Test)
      expect(res.body.meta.total).toBe(5);
      expect(res.body.meta.lastPage).toBe(3);
    });

    it('deve rejeitar paginação no body (whitelist)', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=1&limit=2')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test', page: 1, limit: 2 });
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para page=0 via query', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=0&limit=10')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para limit=0', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=1&limit=0')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para limit=-5', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=1&limit=-5')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para page negativo', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=-1&limit=5')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para valores não numéricos', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=abc&limit=xyz')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para page float', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=1.5&limit=10')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para limit float', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=1&limit=2.5')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 quando limit excede máximo (21)', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=1&limit=21')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(BASE_MESSAGES.EXCEEDED_LIMIT(20));
    });

    it('deve retornar 400 quando limit=100', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=1&limit=100')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(BASE_MESSAGES.EXCEEDED_LIMIT(20));
    });

    it('deve retornar 400 para query param extra não permitido', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users?page=1&limit=10&unknown=1')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(400);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users')
        .send({ input: 'Test' });
      expect(res.status).toBe(401);
    });

    it('deve retornar 401 se token for inválido', async () => {
      const response = await request(app.getHttpServer())
        .post(`/search/filter/users`)
        .set('Authorization', 'Bearer tokenInvalido')
        .send({ input: 'Test' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('deve retornar 400 se input estiver vazio', async () => {
      const response = await request(app.getHttpServer())
        .post(`/search/filter/users`)
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(['input should not be empty']);
    });

    it('deve retornar 400 se input ausente', async () => {
      const response = await request(app.getHttpServer())
        .post(`/search/filter/users`)
        .set('Authorization', 'Bearer ' + userToken)
        .send({});

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 se filtro for inválido', async () => {
      const response = await request(app.getHttpServer())
        .post(`/search/filter/invalidFilter`)
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(SEARCH_MESSAGES.INVALID_FILTER);
    });

    it('deve garantir que hashes não são expostos em users filtrados', async () => {
      const res = await request(app.getHttpServer())
        .post('/search/filter/users')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });
      expect(res.status).toBe(200);
      res.body.data.forEach((u: any) => expect(u).not.toHaveProperty('hash'));
    });
  });
});
