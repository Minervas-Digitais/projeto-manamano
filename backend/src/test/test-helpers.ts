import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { NotificationType, RoleType } from '@prisma/client';
import { CreateGroupDto } from 'src/group/dto/create-group.dto';
import { CreatePostDto } from 'src/post/dto/create-post.dto';
import { PostType } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { CreateParticipantDto } from 'src/participant/dto/create-participant.dto';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

const DEFAULT_PASSWORD = 'password123';

export async function getUserToken(
  authService: AuthService,
  prisma: PrismaService,
  email: string = 'testuser@example.com',
  phone: string = '1234567890',
  name: string = 'Test User',
) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await prisma.user.create({
      data: {
        fullName: name,
        email,
        phone: phone,
        hash: hashedPassword,
      },
    });
  }

  const loginResponse = await authService.login({
    email,
    password: DEFAULT_PASSWORD,
  });

  return loginResponse.accessToken;
}

export async function getAdminToken(
  authService: AuthService,
  prisma: PrismaService,
) {
  const email = 'admin@example.com';

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    await prisma.user.create({
      data: {
        fullName: 'Admin User',
        email,
        phone: '1111111111',
        hash: hashedPassword,
        sysRole: RoleType.ADMIN,
      },
    });
  }

  const loginResponse = await authService.login({
    email,
    password: 'password123',
  });

  return loginResponse.accessToken;
}

export async function getSenderToken(
  authService: AuthService,
  prisma: PrismaService,
): Promise<string | null> {
  const email = 'testsender@example.com';
  const phone = '1234567892';

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      fullName: 'TestSenderUser',
      email,
      phone,
      hash: hashedPassword,
    },
  });

  const loginResponse = await authService.login({
    email,
    password: DEFAULT_PASSWORD,
  });

  return loginResponse.accessToken;
}

export async function getRecipientToken(
  authService: AuthService,
  prisma: PrismaService,
): Promise<string | null> {
  const email = 'testrecipient@example.com';
  const phone = '1234567231523541';

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      fullName: 'TestRecipientUser',
      email,
      phone,
      hash: hashedPassword,
    },
  });

  const loginResponse = await authService.login({
    email,
    password: DEFAULT_PASSWORD,
  });

  return loginResponse?.accessToken || null;
}

export async function createTestGroup(
  prisma: PrismaService,
  name: string = 'Test Group',
) {
  const existingGroup = await prisma.group.findFirst({
    where: {
      name: name,
    },
  });

  if (existingGroup != null) {
    const stillExists = await prisma.group.findUnique({
      where: { id: existingGroup.id },
    });
    if (stillExists) {
      return stillExists.id;
    }
  }

  const newGroup = await prisma.group.create({
    data: {
      name: name,
      description: 'Descrição teste',
      inviteCode: String(await generateUniqueInviteCode(prisma)),
    } as CreateGroupDto,
  });

  const persisted = await prisma.group.findUnique({
    where: { id: newGroup.id },
  });
  if (!persisted) throw new Error('Grupo não foi persistido corretamente');

  return newGroup.id;
}

export async function createTestCategory(
  prisma: PrismaService,
  groupId: string,
) {
  const existingCategory = await prisma.category.findFirst({
    where: {
      groupId,
    },
  });

  if (existingCategory != null) {
    return existingCategory.id;
  }

  const newCategory = await prisma.category.create({
    data: {
      name: 'Teste Category',
      type: PostType.NORMAL,
      groupId,
    },
  });

  return newCategory.id;
}

export async function createPostDto(
  prisma: PrismaService,
  overrides: Partial<CreatePostDto> = {},
): Promise<CreatePostDto> {
  const groupId = await createTestGroup(prisma);
  const userId = overrides.userId || (await createTestUser(prisma));
  const categoryId =
    overrides.categoryId || (await createTestCategory(prisma, groupId));

  const defaultDto: CreatePostDto = {
    title: 'Post Teste',
    input: 'Teste',
    type: PostType.NORMAL,
    userId,
    groupId,
    categoryId,
    isPinned: false,
    urlLive: undefined,
    urlRecorded: undefined,
    schedule: undefined,
    ...overrides,
  };

  return defaultDto;
}

export async function createTestPost(
  prisma: PrismaService,
  overrides: Partial<CreatePostDto> = {},
) {
  const post: CreatePostDto = await createPostDto(prisma, overrides);

  const existingPost = await prisma.post.findFirst({
    where: { title: post.title },
  });

  if (existingPost) {
    return existingPost.id;
  }
  const newPost = await prisma.post.create({
    data: post,
  });

  return newPost.id;
}

export async function createUserDto(
  overrides: Partial<CreateUserDto> = {},
): Promise<CreateUserDto> {
  const defaultDto = {
    fullName: 'Teste User',
    email: 'testEmail@gmail.com',
    hash: DEFAULT_PASSWORD,
    phone: '123456789',
    ...overrides,
  } as CreateUserDto;

  return defaultDto;
}

export async function createTestUser(
  prisma: PrismaService,
  phone: string = '1234567891',
  email: string = 'testeuser@example.com',
) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ phone }, { email }],
    },
  });

  if (existingUser) return existingUser.id;

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const newUser = await prisma.user.create({
    data: {
      fullName: 'Teste User',
      email: email,
      hash: hashedPassword,
      phone
    },
  });

  return newUser.id;
}

export async function createTestArchive(
  prisma: PrismaService,
  group_id: string = null,
  post_id: string = null,
) {
  const name = 'testearchivename123';

  const existingArchive = await prisma.archive.findFirst({
    where: { name },
  });

  if (existingArchive != null) {
    return existingArchive.id;
  }

  const user_id = await createTestUser(prisma);

  if (post_id == null) {
    post_id = await createTestPost(prisma);
  }

  if (group_id == null) {
    group_id = await createTestGroup(prisma);
  }

  const newArchive = await prisma.archive.create({
    data: {
      name: name,
      mimeType: 'text',
      contentBase64: 'stringembase64aaa',
      userId: user_id,
      groupId: group_id,
      postId: post_id,
    },
  });

  return newArchive.id;
}

export async function deleteAllTestArchives(prisma: PrismaService) {
  const deleted = await prisma.archive.deleteMany({
    where: { name: 'testearchivename123' },
  });
}

export async function createParticipantDto(prisma: PrismaService) {
  const groupId = await createTestGroup(prisma);
  
  const number = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 10),
  ).join('');
  const userId = await createTestUser(
    prisma,
    number,
    String(number) + '@gmail.com',
  );

  const fullGroup = await prisma.group.findUnique({
    where: { id: groupId },
  });

  const dto: CreateParticipantDto = {
    role: RoleType.MEMBER,
    groupId: groupId,
    userId: userId,
    inviteCode: fullGroup.inviteCode,
  };

  return dto;
}

export async function createTestParticipant(prisma: PrismaService) {
  const dto = await createParticipantDto(prisma);

  const participant = await prisma.participant.create({
    data: {
      role: dto.role,
      groupId: dto.groupId,
      userId: dto.userId,
    },
  });
  return participant;
}

async function generateInviteCode(length: number = 8) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function isInviteCodeUnique(
  inviteCode: string,
  prismaService: PrismaService,
) {
  try {
    const group = await prismaService.group.findUnique({
      where: { inviteCode },
    });
    return !group;
  } catch (error) {
    return error;
  }
}

async function generateUniqueInviteCode(
  prismaService: PrismaService,
  length: number = 8,
) {
  try {
    let inviteCode: string;
    let isUnique = false;

    do {
      inviteCode = await generateInviteCode(length);
      isUnique = await isInviteCodeUnique(inviteCode, prismaService);
    } while (!isUnique);

    return inviteCode;
  } catch (error) {
    return error;
  }
}

export async function getNotificationId(
  app: INestApplication,
  authService: AuthService,
  prisma: PrismaService,
) {
  const recipientUser = await prisma.user.findUnique({
    where: { email: 'testrecipient@example.com' },
  });

  const senderToken = await getSenderToken(authService, prisma);
  const senderUser = await prisma.user.findUnique({
    where: { email: 'testuser@example.com' },
  });

  if (!senderUser || !recipientUser) {
    throw new Error('Usuário sender ou recipient não encontrado no banco');
  }

  const notificationDTO: CreateNotificationDto = {
    senderId: senderUser.id,
    body: 'bodyTeste',
    recipientId: recipientUser.id,
    type: NotificationType.COMMENT,
    groupName: 'groupTeste',
    senderName: 'senderTeste',
  };

  const response = await request(app.getHttpServer())
    .post('/notifications')
    .set('Authorization', 'Bearer ' + senderToken)
    .send(notificationDTO)
    .expect(201);

  return response.body.id;
}
