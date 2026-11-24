import { PostType, Prisma, UserRole } from '@prisma/client';
import { hash } from 'bcrypt';
import { randomUUID } from 'crypto';
import { AuthService } from 'src/auth/auth.service';
import { generateInviteCode } from 'src/group/invite-code.util';
import { INVITE_TTL_MS } from 'src/group/invite.constants';
import { PrismaService } from 'src/prisma/prisma.service';

const password = 'password123';

/**
 * Cria um usuário de teste no banco.
 */
export async function createUser(prisma: PrismaService, overrides = {}) {
  const number = randomUUID();
  const email = `${randomUUID()}@test.com`;

  const hashedPassword = await hash(password, 10);

  return prisma.user.create({
    data: {
      fullName: 'Test User',
      email,
      phone: number,
      hash: hashedPassword,
      ...overrides,
    },
  });
}

/**
 * Cria usuário e retorna { user, token }.
 */
export async function createUserWithToken(
  prisma: PrismaService,
  auth: AuthService,
  overrides = {},
) {
  const user = await createUser(prisma, overrides);

  const { accessToken } = await auth.login({
    email: user.email,
    password,
  });

  return {
    user,
    token: accessToken,
  };
}

/**
 * Cria uma categoria vinculada a um grupo
 */
export async function createCategory(
  prisma: PrismaService,
  data: Partial<{ name: string; type: PostType; groupId: string }> = {},
) {
  return prisma.category.create({
    data: {
      name: data.name ?? 'Test Category',
      type: data.type ?? PostType.NORMAL,
      groupId: data.groupId!,
    },
  });
}

/**
 * Cria um grupo junto com um convite ativo.
 */
export async function createGroup(
  prisma: PrismaService,
  overrides: Partial<Prisma.GroupCreateInput> = {},
) {
  const code = generateInviteCode();

  return prisma.group.create({
    data: {
      name: 'Test Group',
      ...overrides,
      inviteCode: code,
      invites: {
        create: {
          code,
          expiresAt: new Date(Date.now() + INVITE_TTL_MS),
        },
      },
    },
    include: { invites: true },
  });
}

/**
 * Cria um convite avulso (expirado/revogado) para um grupo.
 */
export async function createInvite(
  prisma: PrismaService,
  data: {
    groupId: string;
    code?: string;
    expiresAt?: Date;
    revokedAt?: Date | null;
    role?: UserRole;
  },
) {
  return prisma.invite.create({
    data: {
      groupId: data.groupId,
      code: data.code ?? generateInviteCode(),
      expiresAt: data.expiresAt ?? new Date(Date.now() + INVITE_TTL_MS),
      revokedAt: data.revokedAt ?? null,
      role: data.role ?? UserRole.STUDENT,
    },
  });
}

/**
 * Cria um post de teste
 */
export async function createPost(
  prisma: PrismaService,
  data: Partial<{
    input: string;
    title: string;
    type: PostType;
    userId: string;
    groupId: string;
    categoryId: string;
    schedule: string;
    urlLive: string;
    urlRecorded: string;
    isPinned: boolean;
  }> = {},
) {
  return prisma.post.create({
    data: {
      input: data.input ?? 'Test content',
      title: data.title,
      type: data.type ?? PostType.NORMAL,
      userId: data.userId!,
      groupId: data.groupId!,
      categoryId: data.categoryId!,
      schedule: data.schedule ? new Date(data.schedule) : undefined,
      urlLive: data.urlLive,
      urlRecorded: data.urlRecorded,
      isPinned: data.isPinned ?? false,
    },
  });
}

/**
 * Retorna o ID de uma notificação
 */
export async function getNotificationId(
  prisma: PrismaService,
  senderId: string,
  recipientId: string,
) {
  const notification = await prisma.notification.create({
    data: {
      senderId,
      recipientId,
      body: 'teste',
      type: 'COMMENT',
    },
  });

  return notification.id;
}

/**
 * Coloca o usuario como participante de um grupo
 */
export async function createParticipant(
  prisma: PrismaService,
  data: {
    userId: string;
    groupId: string;
    role?: UserRole;
  },
) {
  return prisma.participant.create({
    data: {
      role: data.role ?? UserRole.STUDENT,
      userId: data.userId,
      groupId: data.groupId,
    },
  });
}
