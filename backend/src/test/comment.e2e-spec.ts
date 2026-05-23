import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentModule } from 'src/comment/comment.module';
import { CreateCommentDto } from 'src/comment/dto/create-comment.dto';
import request from 'supertest';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { createUserWithToken, createPost } from './test-helpers';
import { NotificationService } from 'src/notification/notification.service';

describe('Comment (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;

  let user: any;
  let userToken: string;
  let group: any;
  let category: any;
  let post: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommentModule, UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    await app.init();
  });

  beforeEach(async () => {
    await prismaService.comment.deleteMany();
    await prismaService.post.deleteMany();
    await prismaService.category.deleteMany();
    await prismaService.group.deleteMany();
    await prismaService.user.deleteMany();

    const result = await createUserWithToken(prismaService, authService);
    user = result.user;
    userToken = result.token;

    group = await prismaService.group.create({
      data: {
        name: 'Test Group',
        inviteCode: Math.random().toString(36).slice(2, 10),
      },
    });

    category = await prismaService.category.create({
      data: { name: 'Test Category', type: 'NORMAL', groupId: group.id },
    });

    post = await createPost(prismaService, {
      userId: user.id,
      groupId: group.id,
      categoryId: category.id,
    });
  });

  describe('POST /comment', () => {
    it('deve criar um comentário', async () => {
      const dto: CreateCommentDto = {
        content: 'Test comment',
        postId: post.id,
      };

      const res = await request(app.getHttpServer())
        .post('/comment')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.content).toBe(dto.content);
      expect(res.body.postId).toBe(post.id);
      expect(res.body.userId).toBe(user.id);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer())
        .post('/comment')
        .send({ content: 'Test comment', postId: post.id });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('deve retornar 400 se payload inválido', async () => {
      const res = await request(app.getHttpServer())
        .post('/comment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: '' });

      expect(res.status).toBe(400);
    });
    it('deve notificar o dono do post quando comentar em post de outro usuário', async () => {
      const notifySpy = jest
        .spyOn(app.get(NotificationService), 'createNotification')
        .mockResolvedValue(undefined as any);

      const otherUser = await createUserWithToken(prismaService, authService);

      const dto: CreateCommentDto = {
        content: 'comentário',
        postId: post.id,
      };

      await request(app.getHttpServer())
        .post('/comment')
        .set('Authorization', `Bearer ${otherUser.token}`)
        .send(dto);

      expect(notifySpy).toHaveBeenCalledTimes(1);

      const call = notifySpy.mock.calls[0][0];

      expect(call.recipientId).toBe(user.id);
      expect(call.groupId).toBe(group.id);
      expect(call.body).toContain('comentou no seu post no grupo');
    });
  });

  describe('DELETE /comment/:id', () => {
    it('deve remover comentário do próprio usuário', async () => {
      const comment = await prismaService.comment.create({
        data: { content: 'comentário', postId: post.id, userId: user.id },
      });

      const res = await request(app.getHttpServer())
        .delete(`/comment/${comment.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      const inDb = await prismaService.comment.findUnique({
        where: { id: comment.id },
      });
      expect(inDb).toBeNull();
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).delete(
        `/comment/${post.id}`,
      );
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('deve retornar 404 para comentário inexistente', async () => {
      const res = await request(app.getHttpServer())
        .delete('/comment/id-invalido')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Comentário não encontrado.');
    });

    it('não deve permitir deletar comentário de outro usuário', async () => {
      const otherUser = await createUserWithToken(prismaService, authService);

      const comment = await prismaService.comment.create({
        data: {
          content: 'comentário',
          postId: post.id,
          userId: otherUser.user.id,
        },
      });

      const res = await request(app.getHttpServer())
        .delete(`/comment/${comment.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
