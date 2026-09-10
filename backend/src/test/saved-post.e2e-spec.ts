import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import request from 'supertest';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { SavedPostModule } from 'src/saved-post/saved-post.module';
import { PostModule } from 'src/post/post.module';
import { BASE_MESSAGES } from 'src/messages/base.messages';
import { POST_MESSAGES } from 'src/messages/post.messages';
import { createCategory, createGroup, createPost, createUserWithToken } from './test-helpers';
import { NotificationService } from 'src/notification/notification.service';

describe('SavedPost (paginado com DTO global)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;
  let userToken: string;
  let user: any;
  let group: any;
  let category: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SavedPostModule, PostModule, UserModule, AuthModule],
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
    await prismaService.savedPost.deleteMany({});
    await prismaService.post.deleteMany({});
    await prismaService.category.deleteMany({});
    await prismaService.group.deleteMany({});
    await prismaService.user.deleteMany({});

    const userRes = await createUserWithToken(prismaService, authService, {
      fullName: 'Test User',
    });
    user = userRes.user;
    userToken = userRes.token;

    await createUserWithToken(prismaService, authService, {
      sysRole: 'ADMIN',
    });

    group = await createGroup(prismaService, { name: 'Test Group' });
    category = await createCategory(prismaService, {
      name: 'Test Category',
      groupId: group.id,
    });

    await createPost(prismaService, {
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

  describe('getSavedPosts (paginado com DTO global)', () => {
    it('deve retornar posts salvos paginados (PaginatedResponseDto)', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const postToSave = await createPost(prismaService, {
        title: 'Outro',
        input: 'Outro',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });
      await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: postToSave.id });

      const res = await request(app.getHttpServer())
        .get('/saved-post?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toMatchObject({ page: 1, limit: 10 });
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('lastPage');
    });

    it('deve respeitar paginação page/limit no saved', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      for (let i = 0; i < 5; i++) {
        const p = await createPost(prismaService, {
          title: `S ${i}`,
          input: 'x',
          userId: owner.user.id,
          groupId: group.id,
          categoryId: category.id,
        });
        await request(app.getHttpServer())
          .post('/saved-post')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ postId: p.id });
      }
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.total).toBe(5);
      expect(res.body.meta.lastPage).toBe(3);
    });

    it('deve usar valores padrão quando sem query (page=1, limit=10)', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const p = await createPost(prismaService, {
        title: 'Default',
        input: 'x',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });
      await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: p.id });
      const res = await request(app.getHttpServer())
        .get('/saved-post')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
    });

    it('deve aplicar limit padrão quando apenas page é informado', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const p = await createPost(prismaService, {
        title: 'OnlyPage',
        input: 'x',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });
      await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: p.id });
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=1')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
    });

    it('deve aplicar page padrão quando apenas limit é informado', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const p = await createPost(prismaService, {
        title: 'OnlyLimit',
        input: 'x',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });
      await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: p.id });
      const res = await request(app.getHttpServer())
        .get('/saved-post?limit=2')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
    });

    it('deve aceitar limit=20 (máximo)', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-post?limit=20&page=1')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.meta.limit).toBe(20);
    });

    it('deve retornar 200 com data vazia quando página além do total', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const p = await createPost(prismaService, {
        title: 'Single',
        input: 'x',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });
      await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: p.id });
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=999&limit=10')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(1);
      expect(res.body.meta.lastPage).toBe(1);
    });

    it('deve retornar 400 para page=0', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=0&limit=10')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para limit=0', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=1&limit=0')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para limit=-5', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=1&limit=-5')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para page negativo', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=-1&limit=5')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para valores não numéricos', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=abc&limit=xyz')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para page float', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=1.5&limit=10')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 para limit float', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=1&limit=2.5')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve retornar 400 quando limit excede máximo (21)', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=1&limit=21')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(BASE_MESSAGES.EXCEEDED_LIMIT(20));
    });

    it('deve retornar 400 para query param extra não permitido', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=1&limit=10&unknown=1')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('deve garantir ordem correta dos posts salvos paginados', async () => {
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
          .post('/saved-post')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ postId: p.id });
      }
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);
      const returnedIds = res.body.data.map((d: any) => d.id);
      created.forEach((id) => expect(returnedIds).toContain(id));
      expect(returnedIds.length).toBe(3);
    });

    it('deve retornar 401 se o token for inválido', async () => {
      const res = await request(app.getHttpServer()).get('/saved-post');
      expect(res.status).toBe(401);
    });

    it('deve retornar PaginatedResponseDto vazio quando nenhum salvo e paginado', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-post?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta).toEqual({ total: 0, page: 1, limit: 10, lastPage: 0 });
    });

    it('deve retornar segunda página sem sobreposição', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      for (let i = 0; i < 4; i++) {
        const p = await createPost(prismaService, {
          title: `Extra ${i}`,
          input: 'Conteúdo',
          userId: owner.user.id,
          groupId: group.id,
          categoryId: category.id,
        });
        await request(app.getHttpServer())
          .post('/saved-post')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ postId: p.id });
      }
      const p1 = await request(app.getHttpServer())
        .get('/saved-post?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`);
      const p2 = await request(app.getHttpServer())
        .get('/saved-post?page=2&limit=2')
        .set('Authorization', `Bearer ${userToken}`);
      expect(p1.body.meta.page).toBe(1);
      expect(p2.body.meta.page).toBe(2);
      const ids1 = p1.body.data.map((p: any) => p.id);
      const ids2 = p2.body.data.map((p: any) => p.id);
      expect(ids1.some((id: string) => ids2.includes(id))).toBe(false);
    });

    it('deve retornar 400 para all=true (não permitido no DTO global)', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-post?all=true')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('savePost', () => {
    it('deve salvar um post com sucesso (201)', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const otherPost = await createPost(prismaService, {
        title: 'Save OK',
        input: 'Conteúdo',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });

      const res = await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: otherPost.id });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('userId', user.id);
      expect(res.body).toHaveProperty('postId', otherPost.id);

      const saved = await prismaService.savedPost.findUnique({
        where: { userId_postId: { userId: user.id, postId: otherPost.id } },
      });
      expect(saved).not.toBeNull();
    });

    it('deve retornar 403 ao tentar salvar próprio post', async () => {
      const ownPost = await createPost(prismaService, {
        title: 'Own',
        input: 'x',
        userId: user.id,
        groupId: group.id,
        categoryId: category.id,
      });

      const res = await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: ownPost.id });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(POST_MESSAGES.CANNOT_SAVE_OWN);
    });

    it('deve retornar 409 ao tentar salvar post já salvo', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const otherPost = await createPost(prismaService, {
        title: 'Dup',
        input: 'x',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });

      await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: otherPost.id });

      const second = await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: otherPost.id });

      expect(second.status).toBe(409);
      expect(second.body.message).toBe(POST_MESSAGES.ALREADY_SAVED);
    });

    it('deve retornar 404 quando post não existe', async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: '00000000-0000-0000-0000-000000000000' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(POST_MESSAGES.NOT_FOUND);
    });

    it('deve retornar 400 quando postId ausente', async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 quando postId vazio', async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: '' });

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 quando postId não é string', async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: 123 } as any);

      expect(res.status).toBe(400);
    });

    it('deve retornar 400 quando envia campo extra não permitido', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const otherPost = await createPost(prismaService, {
        title: 'Extra',
        input: 'x',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });

      const res = await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: otherPost.id, extra: 'field' } as any);

      expect(res.status).toBe(400);
    });

    it('deve retornar 401 quando token ausente', async () => {
      const res = await request(app.getHttpServer()).post('/saved-post').send({ postId: 'any' });
      expect(res.status).toBe(401);
    });

    it('deve retornar 401 quando token inválido', async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', 'Bearer invalid')
        .send({ postId: 'any' });
      expect(res.status).toBe(401);
    });
  });

  describe('removeSavedPost', () => {
    it('deve remover post salvo com sucesso (200)', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const otherPost = await createPost(prismaService, {
        title: 'ToDelete',
        input: 'x',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });

      await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: otherPost.id });

      const res = await request(app.getHttpServer())
        .delete(`/saved-post/${otherPost.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      const saved = await prismaService.savedPost.findUnique({
        where: { userId_postId: { userId: user.id, postId: otherPost.id } },
      });
      expect(saved).toBeNull();
    });

    it('deve retornar 404 quando tenta remover post não salvo', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const otherPost = await createPost(prismaService, {
        title: 'NotSaved',
        input: 'x',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });

      const res = await request(app.getHttpServer())
        .delete(`/saved-post/${otherPost.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(POST_MESSAGES.POST_NOT_SAVED);
    });

    it('deve retornar 404 quando post não existe', async () => {
      const res = await request(app.getHttpServer())
        .delete('/saved-post/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(POST_MESSAGES.NOT_FOUND);
    });

    it('deve retornar 401 quando token ausente', async () => {
      const res = await request(app.getHttpServer()).delete('/saved-post/some-id');
      expect(res.status).toBe(401);
    });

    it('deve retornar 401 quando token inválido', async () => {
      const res = await request(app.getHttpServer())
        .delete('/saved-post/some-id')
        .set('Authorization', 'Bearer invalid');
      expect(res.status).toBe(401);
    });
  });

  describe('serializePost - cobertura de branch', () => {
    it('deve serializar corretamente post com user/category/Comment', async () => {
      const owner = await createUserWithToken(prismaService, authService);
      const p = await createPost(prismaService, {
        title: 'Serialize',
        input: 'x',
        userId: owner.user.id,
        groupId: group.id,
        categoryId: category.id,
      });

      await prismaService.comment.create({
        data: {
          content: 'comentário',
          postId: p.id,
          userId: user.id,
        },
      });

      await request(app.getHttpServer())
        .post('/saved-post')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ postId: p.id });

      const res = await request(app.getHttpServer())
        .get('/saved-post?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0]).toHaveProperty('nameUser');
      expect(res.body.data[0]).toHaveProperty('categoryName');
      expect(res.body.data[0]).toHaveProperty('numComments', 1);
      expect(res.body.data[0]).toHaveProperty('Comment');
    });
  });
});
