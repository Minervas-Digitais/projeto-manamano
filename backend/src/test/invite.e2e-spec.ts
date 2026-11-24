import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { GroupModule } from 'src/group/group.module';
import { INVITE_MESSAGES } from 'src/messages/invite.messages';
import { ParticipantModule } from 'src/participant/participant.module';
import { ParticipantController } from 'src/participant/participant.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from 'src/user/user.module';
import { RoleType, UserRole } from '@prisma/client';
import { createGroup, createInvite, createParticipant, createUserWithToken } from './test-helpers';

const PREFIX = `invite_e2e_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

// setup-env define THROTTLE_INVITE_LIMIT=1000 para não interferir nas demais
// suítes. Reduzimos o limite da rota POST /participant apenas em memória nesta
// suíte para exercitar o 429 sem disparar 1000 requisições. Cada caso usa
// usuários únicos, então o limite de 2 tentativas por usuário não afeta os
// demais testes.
Reflect.defineMetadata('THROTTLER:LIMITdefault', 2, ParticipantController.prototype.joinGroup);
Reflect.defineMetadata('THROTTLER:TTLdefault', 60000, ParticipantController.prototype.joinGroup);

function uniqueName() {
  return `${PREFIX}_${randomUUID()}`;
}

describe('Invite (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let auth: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GroupModule, ParticipantModule, UserModule, AuthModule],
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

    prisma = moduleFixture.get(PrismaService);
    auth = moduleFixture.get(AuthService);
  });

  afterAll(async () => {
    await prisma.group.deleteMany({ where: { name: { startsWith: PREFIX } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: PREFIX } } });
    await app.close();
  });

  async function makeUser(overrides = {}) {
    return createUserWithToken(prisma, auth, {
      email: `${PREFIX}_${randomUUID()}@test.com`,
      ...overrides,
    });
  }

  async function makeInstructorGroup() {
    const instructor = await makeUser();
    const group = await createGroup(prisma, { name: uniqueName() });
    await createParticipant(prisma, {
      userId: instructor.user.id,
      groupId: group.id,
      role: UserRole.INSTRUCTOR,
    });

    return { instructor, group };
  }

  describe('POST /group/:groupId/invite/regenerate', () => {
    it('instrutor regenera o código e invalida o anterior', async () => {
      const { instructor, group } = await makeInstructorGroup();
      const oldCode = group.invites[0].code;

      const res = await request(app.getHttpServer())
        .post(`/group/${group.id}/invite/regenerate`)
        .set('Authorization', `Bearer ${instructor.token}`);

      expect(res.status).toBe(201);
      expect(res.body.code).toMatch(/^[A-Za-z0-9]{8}$/);
      expect(new Date(res.body.expiresAt).getTime()).toBeGreaterThan(Date.now());

      const active = await prisma.invite.findMany({
        where: { groupId: group.id, revokedAt: null },
      });
      expect(active).toHaveLength(1);
      expect(active[0].code).not.toBe(oldCode);

      const entrant = await makeUser();
      const oldCodeRes = await request(app.getHttpServer())
        .post('/participant')
        .set('Authorization', `Bearer ${entrant.token}`)
        .send({ inviteCode: oldCode });

      expect(oldCodeRes.status).toBe(404);

      const newCodeRes = await request(app.getHttpServer())
        .post('/participant')
        .set('Authorization', `Bearer ${entrant.token}`)
        .send({ inviteCode: res.body.code });

      expect(newCodeRes.status).toBe(201);
    });

    it('mantém apenas um convite ativo em regenerates concorrentes', async () => {
      const { instructor, group } = await makeInstructorGroup();

      const responses = await Promise.all([
        request(app.getHttpServer())
          .post(`/group/${group.id}/invite/regenerate`)
          .set('Authorization', `Bearer ${instructor.token}`),
        request(app.getHttpServer())
          .post(`/group/${group.id}/invite/regenerate`)
          .set('Authorization', `Bearer ${instructor.token}`),
      ]);

      expect(responses.map((res) => res.status)).toEqual([201, 201]);

      const active = await prisma.invite.findMany({
        where: { groupId: group.id, revokedAt: null },
      });
      expect(active).toHaveLength(1);
    });

    it('ADMIN pode regenerar', async () => {
      const admin = await makeUser({ sysRole: RoleType.ADMIN });
      const group = await createGroup(prisma, { name: uniqueName() });

      const res = await request(app.getHttpServer())
        .post(`/group/${group.id}/invite/regenerate`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(201);
    });

    it('STUDENT não pode regenerar', async () => {
      const student = await makeUser();
      const group = await createGroup(prisma, { name: uniqueName() });
      await createParticipant(prisma, {
        userId: student.user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .post(`/group/${group.id}/invite/regenerate`)
        .set('Authorization', `Bearer ${student.token}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(INVITE_MESSAGES.FORBIDDEN);
    });

    it('não membro não pode regenerar', async () => {
      const outsider = await makeUser();
      const group = await createGroup(prisma, { name: uniqueName() });

      const res = await request(app.getHttpServer())
        .post(`/group/${group.id}/invite/regenerate`)
        .set('Authorization', `Bearer ${outsider.token}`);

      expect(res.status).toBe(403);
    });

    it('retorna 404 para grupo inexistente', async () => {
      const user = await makeUser();

      const res = await request(app.getHttpServer())
        .post('/group/00000000-0000-0000-0000-000000000000/invite/regenerate')
        .set('Authorization', `Bearer ${user.token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /group/:groupId/invite', () => {
    it('instrutor revoga o convite e o código deixa de funcionar', async () => {
      const { instructor, group } = await makeInstructorGroup();
      const code = group.invites[0].code;

      const res = await request(app.getHttpServer())
        .delete(`/group/${group.id}/invite`)
        .set('Authorization', `Bearer ${instructor.token}`);

      expect(res.status).toBe(200);
      expect(res.body.revoked).toBe(true);

      const entrant = await makeUser();
      const joinRes = await request(app.getHttpServer())
        .post('/participant')
        .set('Authorization', `Bearer ${entrant.token}`)
        .send({ inviteCode: code });

      expect(joinRes.status).toBe(404);
    });

    it('é idempotente quando não há convite ativo', async () => {
      const { instructor, group } = await makeInstructorGroup();

      await request(app.getHttpServer())
        .delete(`/group/${group.id}/invite`)
        .set('Authorization', `Bearer ${instructor.token}`);

      const res = await request(app.getHttpServer())
        .delete(`/group/${group.id}/invite`)
        .set('Authorization', `Bearer ${instructor.token}`);

      expect(res.status).toBe(200);
      expect(res.body.revoked).toBe(false);
    });

    it('STUDENT não pode revogar', async () => {
      const student = await makeUser();
      const group = await createGroup(prisma, { name: uniqueName() });
      await createParticipant(prisma, {
        userId: student.user.id,
        groupId: group.id,
        role: UserRole.STUDENT,
      });

      const res = await request(app.getHttpServer())
        .delete(`/group/${group.id}/invite`)
        .set('Authorization', `Bearer ${student.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /participant', () => {
    it('aceita múltiplos usuários com o mesmo convite', async () => {
      const { group } = await makeInstructorGroup();
      const code = group.invites[0].code;

      const first = await makeUser();
      const second = await makeUser();

      for (const entrant of [first, second]) {
        const res = await request(app.getHttpServer())
          .post('/participant')
          .set('Authorization', `Bearer ${entrant.token}`)
          .send({ inviteCode: code });

        expect(res.status).toBe(201);
        expect(res.body.role).toBe(UserRole.STUDENT);
      }

      const invite = await prisma.invite.findUnique({ where: { code } });
      expect(invite?.usesCount).toBe(2);
    });

    it('responde igual para convite inexistente, expirado e revogado', async () => {
      const { group } = await makeInstructorGroup();

      const expired = await createInvite(prisma, {
        groupId: group.id,
        expiresAt: new Date(Date.now() - 1000),
      });
      const revoked = await createInvite(prisma, {
        groupId: group.id,
        revokedAt: new Date(),
      });

      const cases = ['invalido', expired.code, revoked.code];
      const responses = [];

      for (const code of cases) {
        const entrant = await makeUser();
        const res = await request(app.getHttpServer())
          .post('/participant')
          .set('Authorization', `Bearer ${entrant.token}`)
          .send({ inviteCode: code });

        responses.push(res);
      }

      for (const res of responses) {
        expect(res.status).toBe(404);
        expect(res.body.message).toBe(INVITE_MESSAGES.INVALID);
      }
    });

    it('não aceita código fora do formato de 8 caracteres', async () => {
      const entrant = await makeUser();

      const res = await request(app.getHttpServer())
        .post('/participant')
        .set('Authorization', `Bearer ${entrant.token}`)
        .send({ inviteCode: 'codigo-invalido' });

      expect(res.status).toBe(400);
    });

    it('não gera deadlock entre entrada e revogação concorrentes', async () => {
      // Regressão do lock ordering: revoke trava a linha de Group e depois o
      // convite; o join trava o convite e, no INSERT de Participant, precisa
      // de FK (FOR KEY SHARE) em Group. Com FOR UPDATE isso poderia deadlockar.
      for (let attempt = 0; attempt < 5; attempt++) {
        const { instructor, group } = await makeInstructorGroup();
        const code = group.invites[0].code;
        const entrant = await makeUser();

        const [joinRes, revokeRes] = await Promise.all([
          request(app.getHttpServer())
            .post('/participant')
            .set('Authorization', `Bearer ${entrant.token}`)
            .send({ inviteCode: code }),
          request(app.getHttpServer())
            .delete(`/group/${group.id}/invite`)
            .set('Authorization', `Bearer ${instructor.token}`),
        ]);

        // Sem deadlock: a entrada entra (201) ou é rejeitada (404) e a
        // revogação sempre conclui (200). Nunca 500.
        expect([201, 404]).toContain(joinRes.status);
        expect(revokeRes.status).toBe(200);
      }
    });

    it('aplica rate limit por usuário na entrada (429)', async () => {
      const entrant = await makeUser();
      const statuses: number[] = [];

      // Limite reduzido em memória no topo do arquivo (2 tentativas/usuário).
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await request(app.getHttpServer())
          .post('/participant')
          .set('Authorization', `Bearer ${entrant.token}`)
          .send({ inviteCode: 'invalido' });

        statuses.push(res.status);
      }

      expect(statuses).toEqual([404, 404, 429]);

      // O bloqueio é por usuário (não por IP): outro usuário segue liberado.
      const anotherUser = await makeUser();
      const isolated = await request(app.getHttpServer())
        .post('/participant')
        .set('Authorization', `Bearer ${anotherUser.token}`)
        .send({ inviteCode: 'invalido' });

      expect(isolated.status).toBe(404);
    });
  });

  describe('GET /group/:groupId (compatibilidade)', () => {
    it('membro recebe o convite ativo derivado da tabela Invite', async () => {
      const { instructor, group } = await makeInstructorGroup();

      const res = await request(app.getHttpServer())
        .get(`/group/${group.id}`)
        .set('Authorization', `Bearer ${instructor.token}`);

      expect(res.status).toBe(200);
      expect(res.body.inviteCode).toBe(group.invites[0].code);
      expect(res.body).toHaveProperty('inviteExpiresAt');
      expect(res.body).not.toHaveProperty('invites');
    });

    it('após revogar, membro recebe inviteCode nulo', async () => {
      const { instructor, group } = await makeInstructorGroup();

      await request(app.getHttpServer())
        .delete(`/group/${group.id}/invite`)
        .set('Authorization', `Bearer ${instructor.token}`);

      const res = await request(app.getHttpServer())
        .get(`/group/${group.id}`)
        .set('Authorization', `Bearer ${instructor.token}`);

      expect(res.status).toBe(200);
      expect(res.body.inviteCode).toBeNull();
      expect(res.body.inviteExpiresAt).toBeNull();
    });

    it('não membro não recebe dados de convite', async () => {
      const outsider = await makeUser();
      const group = await createGroup(prisma, { name: uniqueName() });

      const res = await request(app.getHttpServer())
        .get(`/group/${group.id}`)
        .set('Authorization', `Bearer ${outsider.token}`);

      expect(res.status).toBe(200);
      expect(res.body).not.toHaveProperty('inviteCode');
      expect(res.body).not.toHaveProperty('inviteExpiresAt');
      expect(res.body).not.toHaveProperty('invites');
    });
  });
});
