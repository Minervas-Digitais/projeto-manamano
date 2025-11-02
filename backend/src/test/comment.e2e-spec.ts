import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentModule } from 'src/comment/comment.module';
import {
  createTestPost,
  createTestUser,
  getUserToken,
} from 'src/test/test-helpers';
import { CreateCommentDto } from 'src/comment/dto/create-comment.dto';
import request from 'supertest';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';

describe('Comment', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let userToken: string;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommentModule, UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    await app.init();

    userToken = await getUserToken(authService, prismaService);
  });

  describe('Create', () => {
    it('Deve criar um novo comentario', async () => {
      const user = await createTestUser(prismaService);
      const post = await createTestPost(prismaService);

      const commentDTO: CreateCommentDto = {
        content: 'Test comment',
        postId: post,
        userId: user,
      } as CreateCommentDto;

      const response = await request(app.getHttpServer())
        .post('/comment')
        .set('Authorization', 'Bearer ' + userToken)
        .send(commentDTO);

      expect(response.status).toBe(201);
    });

    it('deve retornar erro 401 caso o jwt token for invalido', async () => {
      const user = await createTestUser(prismaService);
      const post = await createTestPost(prismaService);

      const commentDTO: CreateCommentDto = {
        content: 'Test comment',
        postId: post,
        userId: user,
      } as CreateCommentDto;

      const response = await request(app.getHttpServer())
        .post('/comment')
        .set('Authorization', 'Bearer ')
        .send(commentDTO);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Remove', () => {
    it('Deve remover um comentario', async () => {
      const user = await createTestUser(prismaService);
      const post = await createTestPost(prismaService);

      const commentDTO: CreateCommentDto = {
        content: 'Test comment',
        postId: post,
        userId: user,
      } as CreateCommentDto;

      const comment = await prismaService.comment.create({
        data: commentDTO,
      });

      const response = await request(app.getHttpServer())
        .delete(`/comment/${comment.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      const inDb = await prismaService.category.findUnique({
        where: { id: comment.id },
      });
      expect(inDb).toBeNull();
    });

    it('deve retornar 401 se o token JWT for inválido ou ausente', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/comment/qualquer-id',
      );

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('deve retornar 404 ao tentar remover um comentário inexistente', async () => {
      const nonExistentCommentId = 'invalido';

      const response = await request(app.getHttpServer())
        .delete(`/comment/${nonExistentCommentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Comentário não encontrado.');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
