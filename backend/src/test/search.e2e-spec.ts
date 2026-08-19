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
    app.useGlobalPipes(new ValidationPipe());
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
      const searchDto = { input: 'Test' };

      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send(searchDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('groups');
      expect(response.body).toHaveProperty('posts');

      expect(response.body.users.length).toBeGreaterThan(0);
      expect(response.body.groups.length).toBeGreaterThan(0);
      expect(response.body.posts.length).toBeGreaterThan(0);

      const searchTerm = searchDto.input.toLowerCase();

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

    it('deve retornar metadados de paginação com valores padrão', async () => {
      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test' });

      expect(response.status).toBe(201);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 5,
        users: { page: 1, limit: 5, total: 1, totalPages: 1, hasMore: false },
        groups: { page: 1, limit: 5, total: 1, totalPages: 1, hasMore: false },
        posts: { page: 1, limit: 5, total: 1, totalPages: 1, hasMore: false },
      });
    });

    it('deve respeitar page e limit', async () => {
      for (let i = 0; i < 7; i++) {
        await createUser(prismaService, { fullName: `Test User ${i}` });
      }

      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test', page: 1, limit: 3 });

      expect(response.status).toBe(201);
      expect(response.body.users.length).toBe(3);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 3,
        users: { page: 1, limit: 3, total: 8, totalPages: 3, hasMore: true },
        groups: { page: 1, limit: 3, total: 1, totalPages: 1, hasMore: false },
        posts: { page: 1, limit: 3, total: 1, totalPages: 1, hasMore: false },
      });

      const pageTwo = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test', page: 3, limit: 3 });

      expect(pageTwo.status).toBe(201);
      expect(pageTwo.body.users.length).toBe(2);
      expect(pageTwo.body.pagination.users).toEqual({
        page: 3,
        limit: 3,
        total: 8,
        totalPages: 3,
        hasMore: false,
      });
    });

    it('deve retornar arrays vazios em página além do limite', async () => {
      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test', page: 2, limit: 5 });

      expect(response.status).toBe(201);
      expect(response.body.users).toEqual([]);
      expect(response.body.groups).toEqual([]);
      expect(response.body.posts).toEqual([]);
      expect(response.body.pagination.users.total).toBe(1);
      expect(response.body.pagination.users.hasMore).toBe(false);
    });

    it('deve retornar 400 se page for menor que 1', async () => {
      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test', page: 0 });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('page must not be less than 1');
    });

    it('deve retornar 400 se limit exceder o máximo', async () => {
      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test', limit: 51 });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('limit must not be greater than 50');
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
  });

  describe('searchByFilter()', () => {
    it('deve retornar resultados de pesquisa para usuários com metadados de paginação', async () => {
      const searchDto = { input: 'Test' };
      const filter = 'users';

      const response = await request(app.getHttpServer())
        .post(`/search/filter/${filter}`)
        .set('Authorization', 'Bearer ' + userToken)
        .send(searchDto);

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
        totalPages: 1,
        hasMore: false,
      });
    });

    it('deve retornar resultados de pesquisa para grupos', async () => {
      const searchDto = { input: 'Test' };
      const filter = 'groups';

      const response = await request(app.getHttpServer())
        .post(`/search/filter/${filter}`)
        .set('Authorization', 'Bearer ' + userToken)
        .send(searchDto);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('name');
    });

    it('deve retornar resultados de pesquisa para posts', async () => {
      const searchDto = { input: 'Test' };
      const filter = 'posts';

      const response = await request(app.getHttpServer())
        .post(`/search/filter/${filter}`)
        .set('Authorization', 'Bearer ' + userToken)
        .send(searchDto);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('title');
    });

    it('deve respeitar page e limit na busca por filtro', async () => {
      for (let i = 0; i < 5; i++) {
        await createUser(prismaService, { fullName: `Test User ${i}` });
      }

      const response = await request(app.getHttpServer())
        .post('/search/filter/users')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test', page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.meta).toEqual({
        page: 1,
        limit: 2,
        total: 6,
        totalPages: 3,
        hasMore: true,
      });

      const lastPage = await request(app.getHttpServer())
        .post('/search/filter/users')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test', page: 3, limit: 2 });

      expect(lastPage.status).toBe(200);
      expect(lastPage.body.data.length).toBe(2);
      expect(lastPage.body.meta.hasMore).toBe(false);
    });

    it('deve retornar 400 se page/limit forem inválidos na busca por filtro', async () => {
      const response = await request(app.getHttpServer())
        .post('/search/filter/users')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ input: 'Test', page: 0, limit: 51 });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('page must not be less than 1');
      expect(response.body.message).toContain('limit must not be greater than 50');
    });

    it('deve retornar 401 se token for inválido', async () => {
      const searchDto = { input: 'Test' };
      const filter = 'users';

      const response = await request(app.getHttpServer())
        .post(`/search/filter/${filter}`)
        .set('Authorization', 'Bearer tokenInvalido')
        .send(searchDto);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('deve retornar 400 se input estiver vazio', async () => {
      const searchDto = { input: '' };
      const filter = 'users';

      const response = await request(app.getHttpServer())
        .post(`/search/filter/${filter}`)
        .set('Authorization', 'Bearer ' + userToken)
        .send(searchDto);

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(['input should not be empty']);
    });

    it('deve retornar 400 se filtro for inválido', async () => {
      const searchDto = { input: 'Test' };
      const filter = 'invalidFilter';

      const response = await request(app.getHttpServer())
        .post(`/search/filter/${filter}`)
        .set('Authorization', 'Bearer ' + userToken)
        .send(searchDto);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(SEARCH_MESSAGES.INVALID_FILTER);
    });
  });
});
