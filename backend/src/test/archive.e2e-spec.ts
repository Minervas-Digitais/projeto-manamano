import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ArchiveModule } from 'src/archive/archive.module';
import { CreateArchiveDto } from 'src/archive/dto/archive.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import request from 'supertest';
import {
  createCategory,
  createGroup,
  createPost,
  createUserWithToken,
} from './test-helpers';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';

describe('Archive', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;

  let user: any;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ArchiveModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    await app.init();

    const userResult = await createUserWithToken(prismaService, authService);
    user = userResult.user;
    userToken = userResult.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('uploadArquivo', () => {
    it('deve fazer o upload do arquivo', async () => {
      const group = await createGroup(prismaService);

      const dto: CreateArchiveDto = {
        name: 'arquivo-teste',
        mimeType: 'text/plain',
        contentBase64: 'base64string',
        groupId: group.id,
        type: 'IMAGE',
      };

      const res = await request(app.getHttpServer())
        .post('/archives')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(dto.name);
      expect(res.body.type).toBe(dto.type);
      expect(res.body.userId).toBe(user.id);
      expect(res.body.groupId).toBe(group.id);
    });

    it('deve retornar 400 para payload inválido', async () => {
      const res = await request(app.getHttpServer())
        .post('/archives')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 123,
          mimeType: false,
        });

      expect(res.status).toBe(400);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).post('/archives').send({});

      expect(res.status).toBe(401);
    });
  });

  describe('getArchive', () => {
    it('deve retornar um arquivo', async () => {
      const group = await createGroup(prismaService);

      const archive = await prismaService.archive.create({
        data: {
          name: 'file',
          mimeType: 'text/plain',
          contentBase64: 'base64',
          type: 'text/plain',
          userId: user.id,
          groupId: group.id,
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/archives/${archive.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(archive.id);
      expect(res.body.type).toBe('text/plain');
    });

    it('deve retornar 404 se não existir', async () => {
      const res = await request(app.getHttpServer())
        .get('/archives/id-invalido')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('getArchivesByPostId', () => {
    it('deve retornar arquivos do post', async () => {
      const group = await createGroup(prismaService);

      const category = await createCategory(prismaService, {
        groupId: group.id,
      });

      const post = await createPost(prismaService, {
        userId: user.id,
        groupId: group.id,
        categoryId: category.id,
      });

      const archive = await prismaService.archive.create({
        data: {
          name: 'file-post',
          mimeType: 'text/plain',
          contentBase64: 'base64',
          type: 'text/plain',
          userId: user.id,
          groupId: group.id,
          postId: post.id,
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/archives/post/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].id).toBe(archive.id);
    });

    it('deve retornar array vazio se não houver arquivos', async () => {
      const group = await createGroup(prismaService);

      const category = await createCategory(prismaService, {
        groupId: group.id,
      });

      const post = await createPost(prismaService, {
        userId: user.id,
        groupId: group.id,
        categoryId: category.id,
      });

      const res = await request(app.getHttpServer())
        .get(`/archives/post/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('deve retornar 404 se o post não existir', async () => {
      const res = await request(app.getHttpServer())
        .get('/archives/post/id-invalido')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('getArchivesByGroupId', () => {
    it('deve retornar arquivos do grupo', async () => {
      const group = await createGroup(prismaService);

      const archive = await prismaService.archive.create({
        data: {
          name: 'file-group',
          mimeType: 'text/plain',
          contentBase64: 'base64',
          type: 'text/plain',
          userId: user.id,
          groupId: group.id,
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/archives/group/${group.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].id).toBe(archive.id);
    });

    it('deve retornar array vazio se grupo não tiver arquivos', async () => {
      const group = await createGroup(prismaService);

      const res = await request(app.getHttpServer())
        .get(`/archives/group/${group.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('deve retornar 404 se grupo não existir', async () => {
      const res = await request(app.getHttpServer())
        .get('/archives/group/id-invalido')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });
});
