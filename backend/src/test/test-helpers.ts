import { PostType } from '@prisma/client';
import { hash } from 'bcrypt';
import { randomUUID } from 'crypto';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

const password = 'password123';

/**
 * Cria um usuário de teste no banco.
 */
export async function createUser(prisma: PrismaService, overrides = {}) {
  const number = String(Date.now() + Math.floor(Math.random() * 1000));
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
 * Cria um grupo.
 */
export async function createGroup(prisma: PrismaService, overrides = {}) {
  return prisma.group.create({
    data: {
      name: 'Test Group',
      inviteCode: Math.random().toString(36).slice(2, 10),
      ...overrides,
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
