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
import { createCategory, createGroup, createPost, createUserWithToken } from './test-helpers';

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
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');

      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('groups');
      expect(response.body.data).toHaveProperty('posts');

      expect(response.body.data.users.length).toBeGreaterThan(0);
      expect(response.body.data.groups.length).toBeGreaterThan(0);
      expect(response.body.data.posts.length).toBeGreaterThan(0);

      const searchTerm = searchDto.input.toLowerCase();

      response.body.data.users.forEach((u) => {
        expect(u.fullName.toLowerCase()).toContain(searchTerm);
      });

      response.body.data.groups.forEach((g) => {
        expect(g.name.toLowerCase()).toContain(searchTerm);
      });

      response.body.data.posts.forEach((p) => {
        const title = p.title?.toLowerCase() ?? '';
        const input = p.input?.toLowerCase() ?? '';
        expect(title.includes(searchTerm) || input.includes(searchTerm)).toBe(true);
      });
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

    it('deve retornar 400 se a página informada for menor que 1', async () => {
      const response = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', 'Bearer ' + userToken)
        .send({ page: 0 });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('page must not be less than 1');
    });
  });

  describe('searchByFilter()', () => {
    it('deve retornar resultados de pesquisa para usuários', async () => {
      const searchDto = { input: 'Test' };
      const filter = 'users';

      const response = await request(app.getHttpServer())
        .post(`/search/filter/${filter}`)
        .set('Authorization', 'Bearer ' + userToken)
        .send(searchDto);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('fullName');
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

    it('deve retornar 400 se o limite de paginação for inválido', async () => {
      const searchDto = { limit: -5 };
      const filter = 'users';

      const response = await request(app.getHttpServer())
        .post(`/search/filter/${filter}`)
        .set('Authorization', 'Bearer ' + userToken)
        .send(searchDto);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('limit must not be less than 1');
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
