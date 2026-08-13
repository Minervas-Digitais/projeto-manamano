import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';

import request from 'supertest';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { PostModule } from 'src/post/post.module';
import { CreatePostDto } from 'src/post/dto/create-post.dto';
import { POST_MESSAGES } from 'src/messages/post.messages';
import { createCategory, createGroup, createPost, createUserWithToken } from './test-helpers';
import { PostType } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';

export function makePostDto(overrides: Partial<CreatePostDto> = {}): CreatePostDto {
  const unique = Date.now() + Math.floor(Math.random() * 1000);

  return {
    title: `Post Teste ${unique}`,
    input: `Conteúdo de teste ${unique}`,
    type: PostType.NORMAL,
    groupId: overrides.groupId ?? 'dummy-group-id',
    categoryId: overrides.categoryId ?? 'dummy-category-id',
    schedule: overrides.schedule,
    urlLive: overrides.urlLive,
    urlRecorded: overrides.urlRecorded,
    isPinned: overrides.isPinned ?? false,
    ...overrides,
  } as CreatePostDto;
}

describe('Posts', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;
  let userToken: string;
  let adminToken: string;

  let user: any;
  let group: any;
  let category: any;
  let post: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PostModule, UserModule, AuthModule],
    })
      .overrideProvider(NotificationService)
      .useValue({
        createNotification: async () => {}, // para a criação de notificações
      })
      .compile();

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

    const userRes = await createUserWithToken(prismaService, authService, {
      fullName: 'Test User',
    });
    user = userRes.user;
    userToken = userRes.token;

    const adminResult = await createUserWithToken(prismaService, authService, {
      sysRole: 'ADMIN',
    });

    adminToken = adminResult.token;

    group = await createGroup(prismaService, { name: 'Test Group' });
    category = await createCategory(prismaService, {
      name: 'Test Category',
      groupId: group.id,
    });

    post = await createPost(prismaService, {
      title: 'Post Teste',
      input: 'Conteúdo de teste',
      userId: user.id,
      groupId: group.id,
      categoryId: category.id,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create()', () => {
    it('deve criar um post com sucesso', async () => {
      const postDto = makePostDto({
        groupId: group.id,
        categoryId: category.id,
      });

      const response = await request(app.getHttpServer())
        .post('/post')
        .set('Authorization', `Bearer ${userToken}`)
        .send(postDto);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body).toMatchObject({
        title: postDto.title,
        input: postDto.input,
      });

      await prismaService.post.delete({ where: { id: response.body.id } });
    });

    it('deve retornar 400 se dados obrigatórios estiverem faltando', async () => {
      const invalidDto = { type: 'INVALID_TYPE' };

      const response = await request(app.getHttpServer())
        .post('/post')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidDto);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('type'), expect.stringContaining('input')]),
      );
    });

    it('deve retornar 401 se token JWT for inválido', async () => {
      const postDto = makePostDto({
        groupId: group.id,
        categoryId: category.id,
      });

      const response = await request(app.getHttpServer())
        .post('/post')
        .set('Authorization', 'Bearer ')
        .send(postDto);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('findAll()', () => {
    it('deve retornar a lista de posts para o usuário ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/post')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('title', post.title);
    });

    it('deve retornar 404 quando não houver posts', async () => {
      await prismaService.post.deleteMany();

      const response = await request(app.getHttpServer())
        .get('/post')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Nenhuma publicação encontrada.');
    });

    it('deve retornar erro 401 caso o JWT token seja inválido', async () => {
      const response = await request(app.getHttpServer())
        .get('/post')
        .set('Authorization', `Bearer `);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('deve retornar erro 403 caso o usuário não seja ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/post')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden resource');
    });
  });

  describe('findOne()', () => {
    it('deve retornar um post existente com sucesso', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', post.id);
      expect(response.body).toHaveProperty('Comment');
      expect(Array.isArray(response.body.Comment)).toBe(true);
    });

    it('deve retornar 404 para um post inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/invalid-id`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Publicação não encontrada.');
    });

    it('deve retornar erro 401 caso o JWT token seja inválido', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/${post.id}`)
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('update()', () => {
    it('deve permitir que um ADMIN atualize um post', async () => {
      const updateDto = makePostDto({
        title: 'Post Atualizado',
        input: 'Conteúdo atualizado',
        groupId: group.id,
        categoryId: category.id,
      });

      const response = await request(app.getHttpServer())
        .patch(`/post/${post.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', post.id);
      expect(response.body.title).toBe(updateDto.title);
      expect(response.body.input).toBe(updateDto.input);
    });

    it('deve retornar 403 se um usuário comum tentar atualizar', async () => {
      const updateDto = makePostDto({ title: 'Post Atualizado' });

      const response = await request(app.getHttpServer())
        .patch(`/post/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateDto);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden resource');
    });

    it('deve retornar 404 se tentar atualizar um post inexistente', async () => {
      const updateDto = makePostDto({ title: 'Post Atualizado' });

      const response = await request(app.getHttpServer())
        .patch(`/post/invalid-id`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(POST_MESSAGES.NOT_FOUND);
    });

    it('deve retornar erro 401 caso o JWT token for inválido', async () => {
      const updateDto = makePostDto({ title: 'Post Atualizado' });

      const response = await request(app.getHttpServer())
        .patch(`/post/${post.id}`)
        .set('Authorization', 'Bearer ')
        .send(updateDto);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('remove()', () => {
    it('deve permitir que um ADMIN delete um post', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/post/${post.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', post.id);
    });

    it('deve retornar 404 ao tentar deletar um post inexistente', async () => {
      const invalidPostId = 'invalidId';

      const response = await request(app.getHttpServer())
        .delete(`/post/${invalidPostId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Publicação não encontrada.');
    });

    it('deve retornar 403 se usuário comum tentar deletar', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/post/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden resource');
    });

    it('deve retornar erro 401 caso o jwt token for invalido', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/post/${post.id}`)
        .set('Authorization', `Bearer `);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('savePost', () => {
    it('deve salvar um post para o usuário corretamente', async () => {
      const userRes = await createUserWithToken(prismaService, authService, {
        fullName: 'Test User',
      });
      userToken = userRes.token;

      const response = await request(app.getHttpServer())
        .patch(`/post/save/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(201);
      expect(response.body.savedPost).toContain(post.id);
    });

    it('deve retornar erro 401 se token inválido ou ausente', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/post/save/${post.id}`)
        .set('Authorization', `Bearer `);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('removeSavedPost', () => {
    it('deve remover um post salvo com sucesso', async () => {
      const userRes = await createUserWithToken(prismaService, authService, {
        fullName: 'Test User',
      });
      userToken = userRes.token;

      await request(app.getHttpServer())
        .patch(`/post/save/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      const response = await request(app.getHttpServer())
        .patch(`/post/unsave/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(201);
      expect(response.body.savedPost).not.toContain(post.id);
    });

    it('deve retornar erro 401 se token JWT for inválido', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/post/unsave/${post.id}`)
        .set('Authorization', `Bearer `);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('pinPost', () => {
    it('deve fixar um post com sucesso', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/post/pin/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('isPinned', true);
    });

    it('deve retornar 404 ao tentar fixar post inexistente', async () => {
      const postId = 'invalidId';

      const response = await request(app.getHttpServer())
        .patch(`/post/pin/${postId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Publicação não encontrada.');
    });

    it('deve retornar 401 se o token for inválido', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/post/pin/${post.id}`)
        .set('Authorization', `Bearer`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('unpinPost', () => {
    it('deve desfixar um post com sucesso', async () => {
      await request(app.getHttpServer())
        .patch(`/post/pin/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      const response = await request(app.getHttpServer())
        .patch(`/post/unpin/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('isPinned', false);
    });

    it('deve retornar 404 ao tentar desfixar post inexistente', async () => {
      const postId = 'invalidId';

      const response = await request(app.getHttpServer())
        .patch(`/post/unpin/${postId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Publicação não encontrada.');
    });

    it('deve retornar 401 se o token for inválido', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/post/unpin/${post.id}`)
        .set('Authorization', `Bearer`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('getPinnedPosts', () => {
    it('deve retornar apenas posts fixados de um grupo', async () => {
      await createPost(prismaService, {
        title: 'Pinned Post',
        input: 'Conteúdo fixado',
        userId: user.id,
        groupId: group.id,
        categoryId: category.id,
        isPinned: true,
      });

      const response = await request(app.getHttpServer())
        .get(`/post/group/pinned/${group.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((post) => {
        expect(post.isPinned).toBe(true);
        expect(post.groupId).toBe(group.id);
      });
    });

    it('deve retornar lista vazia se o grupo não tiver posts fixados', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/group/pinned/${group.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('deve retornar 401 se token JWT for inválido', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/group/pinned/${group.id}`)
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('getGroupPosts', () => {
    it('deve retornar todos os posts do grupo em ordem decrescente de criação', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/group/${group.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);

      const { data, meta } = response.body;

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      data.forEach((post) => {
        expect(post.groupId).toBe(group.id);
      });

      expect(meta).toHaveProperty('page');
      expect(meta).toHaveProperty('limit');
      expect(meta).toHaveProperty('total');
    });

    it('deve retornar 401 se o token for inválido', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/group/${group.id}`)
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('getCategoryPosts', () => {
    it('deve retornar os posts da categoria em ordem decrescente de criação', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/category/${category.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);

      const { data, meta } = response.body;

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      data.forEach((post) => {
        expect(post.categoryId).toBe(category.id);
      });

      expect(meta).toHaveProperty('page');
      expect(meta).toHaveProperty('limit');
    });

    it('deve retornar 401 se o token for inválido', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/category/${category.id}`)
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('findUserPosts', () => {
    it('deve retornar os posts do usuário em ordem decrescente', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/${user.id}/posts`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);

      const { data, meta } = response.body;

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      data.forEach((post) => {
        expect(post.userId).toBe(user.id);
      });

      expect(meta).toHaveProperty('page');
      expect(meta).toHaveProperty('limit');
    });

    it('deve retornar 401 se o token for inválido', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/${user.id}/posts`)
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });
});
