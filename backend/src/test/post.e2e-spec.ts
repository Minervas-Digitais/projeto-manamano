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
import { BASE_MESSAGES } from 'src/messages/base.messages';
import {
  createCategory,
  createGroup,
  createParticipant,
  createPost,
  createUserWithToken,
} from './test-helpers';
import { PostType, UserRole } from '@prisma/client';
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
        createNotification: async () => {},
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
    await prismaService.participant.deleteMany({});
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
    it('deve permitir que um INSTRUCTOR atualize um post', async () => {
      const instructorRes = await createUserWithToken(prismaService, authService, {
        fullName: 'Instructor User',
      });
      await createParticipant(prismaService, {
        userId: instructorRes.user.id,
        groupId: group.id,
        role: UserRole.INSTRUCTOR,
      });

      const updateDto = makePostDto({
        title: 'Post Atualizado',
        input: 'Conteúdo atualizado',
        groupId: group.id,
        categoryId: category.id,
      });

      const response = await request(app.getHttpServer())
        .patch(`/post/${post.id}`)
        .set('Authorization', `Bearer ${instructorRes.token}`)
        .send(updateDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', post.id);
      expect(response.body.title).toBe(updateDto.title);
      expect(response.body.input).toBe(updateDto.input);
    });

    it('deve retornar 403 se um STUDENT tentar atualizar', async () => {
      await createParticipant(prismaService, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const updateDto = makePostDto({ title: 'Post Atualizado' });

      const response = await request(app.getHttpServer())
        .patch(`/post/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateDto);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Você não tem permissão para acessar este recurso.');
    });

    it('deve retornar 403 se usuário não for participante do grupo', async () => {
      const outsider = await createUserWithToken(prismaService, authService, {
        fullName: 'Outsider',
      });

      const updateDto = makePostDto({ title: 'Post Atualizado' });

      const response = await request(app.getHttpServer())
        .patch(`/post/${post.id}`)
        .set('Authorization', `Bearer ${outsider.token}`)
        .send(updateDto);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Você não tem permissão para acessar este recurso.');
    });

    it('deve retornar 404 se tentar atualizar um post inexistente', async () => {
      const instructorRes = await createUserWithToken(prismaService, authService, {
        fullName: 'Instructor 404',
      });
      await createParticipant(prismaService, {
        userId: instructorRes.user.id,
        groupId: group.id,
        role: UserRole.INSTRUCTOR,
      });

      const updateDto = makePostDto({ title: 'Post Atualizado' });

      const response = await request(app.getHttpServer())
        .patch(`/post/invalid-id`)
        .set('Authorization', `Bearer ${instructorRes.token}`)
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
    it('deve permitir que um INSTRUCTOR delete um post', async () => {
      const instructorRes = await createUserWithToken(prismaService, authService, {
        fullName: 'Instructor Delete',
      });
      await createParticipant(prismaService, {
        userId: instructorRes.user.id,
        groupId: group.id,
        role: UserRole.INSTRUCTOR,
      });

      const response = await request(app.getHttpServer())
        .delete(`/post/${post.id}`)
        .set('Authorization', `Bearer ${instructorRes.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', post.id);
    });

    it('deve retornar 404 ao tentar deletar um post inexistente', async () => {
      const invalidPostId = 'invalidId';
      const instructorRes = await createUserWithToken(prismaService, authService, {
        fullName: 'Instructor 404 del',
      });
      await createParticipant(prismaService, {
        userId: instructorRes.user.id,
        groupId: group.id,
        role: UserRole.INSTRUCTOR,
      });

      const response = await request(app.getHttpServer())
        .delete(`/post/${invalidPostId}`)
        .set('Authorization', `Bearer ${instructorRes.token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Publicação não encontrada.');
    });

    it('deve retornar 403 se STUDENT tentar deletar', async () => {
      await createParticipant(prismaService, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const response = await request(app.getHttpServer())
        .delete(`/post/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Você não tem permissão para acessar este recurso.');
    });

    it('deve retornar 403 se usuário não for participante', async () => {
      const outsider = await createUserWithToken(prismaService, authService, {
        fullName: 'Outsider Del',
      });

      const response = await request(app.getHttpServer())
        .delete(`/post/${post.id}`)
        .set('Authorization', `Bearer ${outsider.token}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Você não tem permissão para acessar este recurso.');
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

    it('deve retornar 403 ao tentar salvar próprio post (branch CANNOT_SAVE_OWN)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/post/save/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(POST_MESSAGES.CANNOT_SAVE_OWN);
    });

    it('deve retornar 409 ao tentar salvar post já salvo (branch ALREADY_SAVED)', async () => {
      const other = await createUserWithToken(prismaService, authService);
      const otherPost = await createPost(prismaService, {
        title: 'Outro',
        input: 'Outro',
        userId: other.user.id,
        groupId: group.id,
        categoryId: category.id,
      });
      await request(app.getHttpServer())
        .patch(`/post/save/${otherPost.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      const second = await request(app.getHttpServer())
        .patch(`/post/save/${otherPost.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(second.status).toBe(409);
      expect(second.body.message).toBe(POST_MESSAGES.ALREADY_SAVED);
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

    it('deve retornar 404 ao tentar remover post não salvo (branch POST_NOT_SAVED)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/post/unsave/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(POST_MESSAGES.POST_NOT_SAVED);
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

    it('deve retornar 404 quando já está fixado (branch POST_PINNED_STATUS_UNCHANGED)', async () => {
      await request(app.getHttpServer())
        .patch(`/post/pin/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      const second = await request(app.getHttpServer())
        .patch(`/post/pin/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(second.status).toBe(404);
      expect(second.body.message).toBe(POST_MESSAGES.POST_PINNED_STATUS_UNCHANGED);
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

    it('deve retornar 404 quando já está desfixado (branch UNCHANGED)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/post/unpin/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(POST_MESSAGES.POST_PINNED_STATUS_UNCHANGED);
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

  describe('getGroupPosts (paginado com DTO global)', () => {
    it('deve retornar todos os posts do grupo em ordem decrescente (PaginatedResponseDto)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/group/${group.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      const { data, meta } = response.body;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      data.forEach((p) => expect(p.groupId).toBe(group.id));
      expect(meta).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        lastPage: expect.any(Number),
      });
    });

    it('deve respeitar query page e limit', async () => {
      for (let i = 0; i < 4; i++) {
        await createPost(prismaService, {
          title: `Extra ${i}`,
          input: 'Conteúdo',
          userId: user.id,
          groupId: group.id,
          categoryId: category.id,
        });
      }
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=1&limit=2`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.meta.total).toBe(5);
      expect(res.body.meta.lastPage).toBe(3);
    });

    it('deve retornar segunda página sem sobreposição', async () => {
      for (let i = 0; i < 4; i++) {
        await createPost(prismaService, {
          title: `Extra ${i}`,
          input: 'Conteúdo',
          userId: user.id,
          groupId: group.id,
          categoryId: category.id,
        });
      }
      const p1 = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=1&limit=2`)
        .set('Authorization', `Bearer ${userToken}`);
      const p2 = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=2&limit=2`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(p1.body.meta.page).toBe(1);
      expect(p2.body.meta.page).toBe(2);
      const ids1 = p1.body.data.map((p: any) => p.id);
      const ids2 = p2.body.data.map((p: any) => p.id);
      expect(ids1.some((id: string) => ids2.includes(id))).toBe(false);
    });

    it('deve usar valores padrão quando sem query (page=1, limit=10)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
    });

    it('deve aplicar limit padrão quando apenas page é informado', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=1`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.body.meta.limit).toBe(10);
    });

    it('deve aplicar page padrão quando apenas limit é informado', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?limit=2`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
    });

    it('deve aceitar limit=20 (máximo)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?limit=20&page=1`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.meta.limit).toBe(20);
    });

    it('deve retornar 200 com data vazia quando página além do total', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=999&limit=10`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
      expect(res.body.meta.lastPage).toBe(Math.ceil(res.body.meta.total / 10));
    });

    it('deve retornar 400 para page=0', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=0&limit=10`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para limit=0', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=1&limit=0`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para limit=-5', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=1&limit=-5`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para page negativo', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=-1&limit=5`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para valores não numéricos', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=abc&limit=xyz`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para page float', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=1.5&limit=10`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para limit float', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=1&limit=2.5`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 quando limit excede máximo (21)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=1&limit=21`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(BASE_MESSAGES.EXCEEDED_LIMIT(20));
    });

    it('deve retornar 400 para query param extra não permitido', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/group/${group.id}?page=1&limit=10&unknown=1`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 401 se o token for inválido', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/group/${group.id}`)
        .set('Authorization', 'Bearer ');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('getCategoryPosts (paginado com DTO global)', () => {
    it('deve retornar os posts da categoria em ordem decrescente (PaginatedResponseDto)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/category/${category.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      const { data, meta } = response.body;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      data.forEach((p) => expect(p.categoryId).toBe(category.id));
      expect(meta).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        lastPage: expect.any(Number),
      });
    });

    it('deve respeitar query page e limit', async () => {
      for (let i = 0; i < 4; i++) {
        await createPost(prismaService, {
          title: `Cat ${i}`,
          input: 'Conteúdo',
          userId: user.id,
          groupId: group.id,
          categoryId: category.id,
        });
      }
      const res = await request(app.getHttpServer())
        .get(`/post/category/${category.id}?page=1&limit=2`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.total).toBe(5);
      expect(res.body.meta.lastPage).toBe(3);
    });

    it('deve retornar 400 para paginação inválida', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/category/${category.id}?page=0&limit=10`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 quando limit excede máximo', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/category/${category.id}?page=1&limit=21`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(BASE_MESSAGES.EXCEEDED_LIMIT(20));
    });

    it('deve retornar 401 se o token for inválido', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/category/${category.id}`)
        .set('Authorization', 'Bearer ');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('findUserPosts (paginado com DTO global)', () => {
    it('deve retornar os posts do usuário em ordem decrescente (PaginatedResponseDto)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/${user.id}/posts`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      const { data, meta } = response.body;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      data.forEach((p) => expect(p.userId).toBe(user.id));
      expect(meta).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        lastPage: expect.any(Number),
      });
    });

    it('deve respeitar query page e limit', async () => {
      for (let i = 0; i < 4; i++) {
        await createPost(prismaService, {
          title: `User ${i}`,
          input: 'Conteúdo',
          userId: user.id,
          groupId: group.id,
          categoryId: category.id,
        });
      }
      const res = await request(app.getHttpServer())
        .get(`/post/${user.id}/posts?page=1&limit=2`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.lastPage).toBe(3);
    });

    it('deve retornar 400 para paginação inválida', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/${user.id}/posts?page=0&limit=10`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 quando limit excede máximo', async () => {
      const res = await request(app.getHttpServer())
        .get(`/post/${user.id}/posts?page=1&limit=21`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(BASE_MESSAGES.EXCEEDED_LIMIT(20));
    });

    it('deve retornar 401 se o token for inválido', async () => {
      const response = await request(app.getHttpServer())
        .get(`/post/${user.id}/posts`)
        .set('Authorization', 'Bearer ');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('getSavedPosts (paginado com DTO global)', () => {
    it('deve retornar posts salvos paginados (PaginatedResponseDto)', async () => {
      const extras = [];
      for (let i = 0; i < 3; i++) {
        extras.push(
          await createPost(prismaService, {
            title: `Saved ${i}`,
            input: 'Conteúdo',
            userId: user.id,
            groupId: group.id,
            categoryId: category.id,
          }),
        );
      }
      const owner = await createUserWithToken(prismaService, authService);
      const postToSave = await createPost(prismaService, {
        title: 'Outro',
        input: 'Outro',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });
      await request(app.getHttpServer())
        .patch(`/post/save/${postToSave.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      await request(app.getHttpServer())
        .patch(`/post/save/${extras[0].id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const res = await request(app.getHttpServer())
        .get('/post/saved?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toMatchObject({ page: 1, limit: 10 });
    });

    it('deve retornar todos com all=true como array (compatibilidade)', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const p = await createPost(prismaService, {
        title: 'All',
        input: 'All',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });
      await request(app.getHttpServer())
        .patch(`/post/save/${p.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      const res = await request(app.getHttpServer())
        .get('/post/saved?all=true')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('deve respeitar paginação page/limit no saved', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const ids = [];
      for (let i = 0; i < 5; i++) {
        const p = await createPost(prismaService, {
          title: `S ${i}`,
          input: 'x',
          userId: owner.user.id,
          groupId: group.id,
          categoryId: category.id,
        });
        ids.push(p.id);
        await request(app.getHttpServer())
          .patch(`/post/save/${p.id}`)
          .set('Authorization', `Bearer ${userToken}`);
      }
      const res = await request(app.getHttpServer())
        .get('/post/saved?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.total).toBe(5);
      expect(res.body.meta.lastPage).toBe(3);
    });

    it('deve retornar 400 para paginação inválida no saved', async () => {
      const res = await request(app.getHttpServer())
        .get('/post/saved?page=0&limit=10')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 quando limit excede máximo no saved', async () => {
      const res = await request(app.getHttpServer())
        .get('/post/saved?page=1&limit=21')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(BASE_MESSAGES.EXCEEDED_LIMIT(20));
    });

    it('deve retornar 401 sem token no saved', async () => {
      const res = await request(app.getHttpServer()).get('/post/saved');
      expect(res.status).toBe(401);
    });

    it('deve retornar [] com all=true quando nenhum salvo (branch all+empty)', async () => {
      const res = await request(app.getHttpServer())
        .get('/post/saved?all=true')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('deve retornar PaginatedResponseDto vazio quando nenhum salvo e paginado (branch paginatedIds empty)', async () => {
      const res = await request(app.getHttpServer())
        .get('/post/saved?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta).toEqual({ total: 0, page: 1, limit: 10, lastPage: 0 });
    });

    it('deve retornar data vazio quando página além do total no saved (branch slice vazio)', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const p = await createPost(prismaService, {
        title: 'Single',
        input: 'x',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });
      await request(app.getHttpServer())
        .patch(`/post/save/${p.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      const res = await request(app.getHttpServer())
        .get('/post/saved?page=999&limit=10')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(1);
      expect(res.body.meta.lastPage).toBe(1);
    });

    it('deve garantir ordem correta dos posts salvos paginados (branch ordered)', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const created = [];
      for (let i = 0; i < 3; i++) {
        const p = await createPost(prismaService, {
          title: `Ord ${i}`,
          input: 'x',
          userId: owner.user.id,
          groupId: group.id,
          categoryId: category.id,
        });
        created.push(p.id);
        await request(app.getHttpServer())
          .patch(`/post/save/${p.id}`)
          .set('Authorization', `Bearer ${userToken}`);
      }
      const res = await request(app.getHttpServer())
        .get('/post/saved?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);
      const returnedIds = res.body.data.map((d: any) => d.id);
      created.forEach((id) => expect(returnedIds).toContain(id));
      expect(returnedIds.length).toBe(3);
    });
  });

  describe('getGroupPosts - branching extra', () => {
    it('deve retornar PaginatedResponseDto vazio quando grupo sem posts (branch total 0)', async () => {
      const emptyGroup = await createGroup(prismaService, { name: 'Vazio' });
      const res = await request(app.getHttpServer())
        .get(`/post/group/${emptyGroup.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta).toEqual({ total: 0, page: 1, limit: 10, lastPage: 0 });
    });
  });

  describe('getCategoryPosts - branching extra', () => {
    it('deve retornar vazio quando categoria sem posts (branch total 0)', async () => {
      const emptyCat = await createCategory(prismaService, {
        groupId: group.id,
        name: 'Cat Vazia',
      });
      const res = await request(app.getHttpServer())
        .get(`/post/category/${emptyCat.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
      expect(res.body.meta.lastPage).toBe(0);
    });
  });

  describe('findUserPosts - branching extra', () => {
    it('deve retornar vazio quando usuário sem posts (branch total 0)', async () => {
      const other = await createUserWithToken(prismaService, authService);
      const res = await request(app.getHttpServer())
        .get(`/post/${other.user.id}/posts`)
        .set('Authorization', `Bearer ${other.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });
  });
});
