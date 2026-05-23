import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { ParticipantModule } from 'src/participant/participant.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

import {
  createUserWithToken,
  createGroup,
  createCategory,
  createPost,
  createParticipant,
} from './test-helpers';

import { RoleType, UserRole } from '@prisma/client';
import { PARTICIPANT_MESSAGES } from 'src/messages/participant.messages';

describe('Participant (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let auth: AuthService;

  let user: any;
  let admin: any;
  let instructor: any;

  let userToken: string;
  let adminToken: string;
  let instructorToken: string;

  let group: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ParticipantModule, UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    prisma = moduleFixture.get(PrismaService);
    auth = moduleFixture.get(AuthService);
  });

  beforeEach(async () => {
    await prisma.participant.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();

    const userRes = await createUserWithToken(prisma, auth);
    const adminRes = await createUserWithToken(prisma, auth, {
      sysRole: RoleType.ADMIN,
    });
    const instructorRes = await createUserWithToken(prisma, auth);

    user = userRes.user;
    admin = adminRes.user;
    instructor = instructorRes.user;

    userToken = userRes.token;
    adminToken = adminRes.token;
    instructorToken = instructorRes.token;

    group = await createGroup(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('joinGroup', () => {
    it('deve entrar no grupo com invite válido', async () => {
      const res = await request(app.getHttpServer())
        .post('/participant')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          inviteCode: group.inviteCode,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('userId', user.id);
      expect(res.body).toHaveProperty('groupId', group.id);
      expect(res.body).toHaveProperty('role', UserRole.STUDENT);
    });

    it('deve falhar com invite inválido', async () => {
      const res = await request(app.getHttpServer())
        .post('/participant')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          inviteCode: 'codigo-invalido',
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Código de convite inválido.');
    });

    it('deve falhar se já estiver no grupo', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .post('/participant')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          inviteCode: group.inviteCode,
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Você já está neste grupo.');
    });

    it('deve falhar sem token', async () => {
      const res = await request(app.getHttpServer())
        .post('/participant')
        .set('Authorization', 'Bearer ')
        .send({
          inviteCode: group.inviteCode,
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('deve falhar com dto inválido (invite vazio)', async () => {
      const res = await request(app.getHttpServer())
        .post('/participant')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          inviteCode: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(['inviteCode should not be empty']);
    });
  });

  describe('findAll', () => {
    it('ADMIN deve conseguir listar participants', async () => {
      await createParticipant(prisma, {
        userId: instructor.id,
        groupId: group.id,
        role: UserRole.INSTRUCTOR,
      });

      const res = await request(app.getHttpServer())
        .get('/participant')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('userId');
      expect(res.body[0]).toHaveProperty('groupId');
      expect(res.body[0]).toHaveProperty('role');
    });

    it('usuário comum NÃO deve conseguir (403)', async () => {
      const res = await request(app.getHttpServer())
        .get('/participant')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('deve retornar 404 se não houver participants', async () => {
      // limpa tudo
      await prisma.participant.deleteMany();

      const res = await request(app.getHttpServer())
        .get('/participant')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Não há usuários em grupos.');
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).get('/participant');

      expect(res.status).toBe(401);
    });
  });

  describe('findUsersInGroup', () => {
    it('membro do grupo deve conseguir', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .get(`/participant/group/${group.id}/users`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);

      const first = res.body[0];
      expect(first).toHaveProperty('userId');
      expect(first).toHaveProperty('role');
      expect(first).toHaveProperty('user');
      expect(first.user).toHaveProperty('fullName');
    });

    it('ADMIN deve conseguir mesmo fora do grupo', async () => {
      await createParticipant(prisma, {
        userId: instructor.id,
        groupId: group.id,
        role: UserRole.INSTRUCTOR,
      });

      const res = await request(app.getHttpServer())
        .get(`/participant/group/${group.id}/users`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('usuário fora do grupo deve ser bloqueado (403)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/participant/group/${group.id}/users`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(PARTICIPANT_MESSAGES.UNAUTHORIZED_ACCESS);
    });

    it('deve retornar 404 se grupo não existir', async () => {
      const res = await request(app.getHttpServer())
        .get(`/participant/group/invalid-id/users`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('deve retornar 404 se não houver participantes no grupo', async () => {
      // remove o instructor que vem do beforeEach
      await prisma.participant.deleteMany({
        where: { groupId: group.id },
      });

      const res = await request(app.getHttpServer())
        .get(`/participant/group/${group.id}/users`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Não há usuários neste grupo.');
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).get(`/participant/group/${group.id}/users`);

      expect(res.status).toBe(401);
    });
  });

  describe('findUserGroups', () => {
    it('deve retornar grupos com posts e commentsCount', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      // precisa de categoria (teu helper de post exige)
      const category = await createCategory(prisma, {
        groupId: group.id,
      });

      // cria post usando helper
      const post = await createPost(prisma, {
        title: 'Post teste',
        userId: user.id,
        groupId: group.id,
        categoryId: category.id,
      });

      // cria comentários (sem helper mesmo)
      await prisma.comment.createMany({
        data: [
          {
            content: 'comentário 1',
            postId: post.id,
            userId: user.id,
          },
          {
            content: 'comentário 2',
            postId: post.id,
            userId: user.id,
          },
        ],
      });

      const res = await request(app.getHttpServer())
        .get('/participant/groups')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      expect(res.body.length).toBeGreaterThan(0);

      const groupRes = res.body[0];

      expect(groupRes).toHaveProperty('groupId', group.id);
      expect(groupRes).toHaveProperty('participantCount');
      expect(groupRes).toHaveProperty('group');

      expect(groupRes.group.posts.length).toBeGreaterThan(0);

      const postRes = groupRes.group.posts[0];

      expect(postRes).toHaveProperty('commentsCount', 2);
      expect(postRes.title).toBe('Post teste');
    });

    it('deve retornar 404 se não estiver em nenhum grupo', async () => {
      const res = await request(app.getHttpServer())
        .get('/participant/groups')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).get('/participant/groups');

      expect(res.status).toBe(401);
    });
  });

  describe('findUserGroupsPosts', () => {
    it('deve retornar posts paginados dos grupos do usuário', async () => {
      // user entra no grupo
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const category = await createCategory(prisma, {
        groupId: group.id,
      });

      // cria vários posts
      const posts = await Promise.all([
        createPost(prisma, {
          title: 'Post 1',
          userId: user.id,
          groupId: group.id,
          categoryId: category.id,
        }),
        createPost(prisma, {
          title: 'Post 2',
          userId: user.id,
          groupId: group.id,
          categoryId: category.id,
        }),
        createPost(prisma, {
          title: 'Post 3',
          userId: user.id,
          groupId: group.id,
          categoryId: category.id,
        }),
      ]);

      // adiciona comentários em um post
      await prisma.comment.createMany({
        data: [
          {
            content: 'comentário 1',
            postId: posts[0].id,
            userId: user.id,
          },
          {
            content: 'comentário 2',
            postId: posts[0].id,
            userId: user.id,
          },
        ],
      });

      const res = await request(app.getHttpServer())
        .get('/participant/groups/posts?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      expect(res.body).toHaveProperty('posts');
      expect(res.body).toHaveProperty('pagination');

      expect(res.body.posts.length).toBe(2); // limit=2

      expect(res.body.pagination).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 2,
          total: 3,
          totalPages: 2,
          hasMore: true,
        }),
      );

      // valida estrutura de um post
      const post = res.body.posts[0];

      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('input');
      expect(post).toHaveProperty('commentsCount');
      expect(post).toHaveProperty('user');
      expect(post).toHaveProperty('group');

      expect(post.user).toHaveProperty('fullName');
      expect(post.group).toHaveProperty('name');
    });

    it('deve retornar commentsCount correto', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const category = await createCategory(prisma, {
        groupId: group.id,
      });

      const post = await createPost(prisma, {
        title: 'Post com comments',
        userId: user.id,
        groupId: group.id,
        categoryId: category.id,
      });

      await prisma.comment.createMany({
        data: [
          { content: '1', postId: post.id, userId: user.id },
          { content: '2', postId: post.id, userId: user.id },
        ],
      });

      const res = await request(app.getHttpServer())
        .get('/participant/groups/posts')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      const found = res.body.posts.find((p) => p.id === post.id);

      expect(found.commentsCount).toBe(2);
    });

    it('deve retornar vazio se usuário não estiver em grupos', async () => {
      const res = await request(app.getHttpServer())
        .get('/participant/groups/posts')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      expect(res.body).toEqual({
        posts: [],
        pagination: {
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      });
    });

    it('deve respeitar paginação (page 2)', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const category = await createCategory(prisma, {
        groupId: group.id,
      });

      // cria 3 posts
      await Promise.all([
        createPost(prisma, {
          title: 'Post 1',
          userId: user.id,
          groupId: group.id,
          categoryId: category.id,
        }),
        createPost(prisma, {
          title: 'Post 2',
          userId: user.id,
          groupId: group.id,
          categoryId: category.id,
        }),
        createPost(prisma, {
          title: 'Post 3',
          userId: user.id,
          groupId: group.id,
          categoryId: category.id,
        }),
      ]);

      const res = await request(app.getHttpServer())
        .get('/participant/groups/posts?page=2&limit=2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      expect(res.body.posts.length).toBe(1); // sobra 1 na página 2
      expect(res.body.pagination.hasMore).toBe(false);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).get('/participant/groups/posts');

      expect(res.status).toBe(401);
    });
  });

  describe('findOne', () => {
    it('deve retornar o participant do usuário no grupo', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .get(`/participant/group/${group.id}/me`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      expect(res.body).toMatchObject({
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('deve retornar 404 se usuário não estiver no grupo', async () => {
      const res = await request(app.getHttpServer())
        .get(`/participant/group/${group.id}/me`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(PARTICIPANT_MESSAGES.NOT_FOUND);
    });

    it('deve retornar 404 se groupId não existir', async () => {
      const res = await request(app.getHttpServer())
        .get(`/participant/group/invalid-id/me`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).get(`/participant/group/${group.id}/me`);

      expect(res.status).toBe(401);
    });
  });

  describe('updateUserRole', () => {
    it('INSTRUCTOR do grupo deve conseguir atualizar', async () => {
      await createParticipant(prisma, {
        userId: instructor.id,
        groupId: group.id,
        role: UserRole.INSTRUCTOR,
      });

      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .patch(`/participant/group/${group.id}/user/${user.id}/role`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ role: UserRole.INSTRUCTOR });

      expect(res.status).toBe(200);
    });

    it('ADMIN deve conseguir atualizar mesmo não estando no grupo', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      await createParticipant(prisma, {
        userId: admin.id,
        groupId: group.id,
        role: UserRole.INSTRUCTOR,
      });

      const res = await request(app.getHttpServer())
        .patch(`/participant/group/${group.id}/user/${user.id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: UserRole.INSTRUCTOR });

      expect(res.status).toBe(200);
      expect(res.body.role).toBe(UserRole.INSTRUCTOR);
    });

    it('usuário comum NÃO deve conseguir (403)', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      await createParticipant(prisma, {
        userId: instructor.id,
        groupId: group.id,
        role: UserRole.INSTRUCTOR,
      });

      const res = await request(app.getHttpServer())
        .patch(`/participant/group/${group.id}/user/${instructor.id}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: UserRole.INSTRUCTOR });

      expect(res.status).toBe(403);
    });

    it('deve retornar 404 se target não estiver no grupo', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/participant/group/${group.id}/user/${user.id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: UserRole.INSTRUCTOR });

      expect(res.status).toBe(404);
    });

    it('deve retornar 404 se caller não estiver no grupo e não for admin', async () => {
      await createParticipant(prisma, {
        userId: instructor.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .patch(`/participant/group/${group.id}/user/${instructor.id}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: UserRole.INSTRUCTOR });

      expect(res.status).toBe(404);
    });

    it('deve retornar 400 com role inválido', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .patch(`/participant/group/${group.id}/user/${user.id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'INVALID_ROLE' });

      expect(res.status).toBe(400);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/participant/group/${group.id}/user/${user.id}/role`)
        .send({ role: UserRole.INSTRUCTOR });

      expect(res.status).toBe(401);
    });
  });

  describe('removeSelf', () => {
    it('deve permitir sair do grupo', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .delete(`/participant/group/${group.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(PARTICIPANT_MESSAGES.DELETE_SUCCESS);

      // garante que saiu mesmo
      const participant = await prisma.participant.findUnique({
        where: {
          userId_groupId: { userId: user.id, groupId: group.id },
        },
      });

      expect(participant).toBeNull();
    });

    it('deve retornar 404 se não estiver no grupo', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/participant/group/${group.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('deve retornar 404 se grupo não existir', async () => {
      const fakeGroupId = 'uuid-fake';

      const res = await request(app.getHttpServer())
        .delete(`/participant/group/${fakeGroupId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).delete(`/participant/group/${group.id}`);

      expect(res.status).toBe(401);
    });
  });

  describe('removeUser', () => {
    it('INSTRUCTOR do grupo deve conseguir remover', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      await createParticipant(prisma, {
        userId: instructor.id,
        groupId: group.id,
        role: UserRole.INSTRUCTOR,
      });

      // instructor já está no grupo (beforeEach)

      const res = await request(app.getHttpServer())
        .delete(`/participant/group/${group.id}/user/${user.id}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);
    });

    it('ADMIN deve conseguir SE estiver no grupo', async () => {
      await createParticipant(prisma, {
        userId: admin.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .delete(`/participant/group/${group.id}/user/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('ADMIN fora do grupo deve retornar 404', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .delete(`/participant/group/${group.id}/user/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('usuário comum deve receber 403', async () => {
      await createParticipant(prisma, {
        userId: user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      await createParticipant(prisma, {
        userId: instructor.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .delete(`/participant/group/${group.id}/user/${instructor.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('deve retornar 404 se target não estiver no grupo', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/participant/group/${group.id}/user/${user.id}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.status).toBe(404);
    });

    it('deve retornar 404 se caller não estiver no grupo', async () => {
      await createParticipant(prisma, {
        userId: instructor.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .delete(`/participant/group/${group.id}/user/${instructor.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app.getHttpServer()).delete(
        `/participant/group/${group.id}/user/${user.id}`,
      );

      expect(res.status).toBe(401);
    });
  });
});
