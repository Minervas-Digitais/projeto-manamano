import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RoleType } from '@prisma/client';
import { CreateGroupDto } from 'src/group/dto/create-group.dto';
import { CreatePostDto } from "src/post/dto/create-post.dto";
import { execSync } from 'child_process';
import { PostType } from "@prisma/client";
import { AuthService } from 'src/auth/auth.service';

const DEFAULT_PASSWORD = 'password123'

export async function getUserToken(authService: AuthService, prisma: PrismaService) {
    const email = 'testuser@example.com';

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10,);

    if (!existingUser) {
        await prisma.user.create({
            data: {
                fullName: 'Test User',
                email,
                phone: '1234567890',
                hash: hashedPassword,
            },
        });
    }

    const loginResponse = await authService.login({
        email,
        password: 'password123',
    });

    return loginResponse.accessToken;
}

export async function getAdminToken(authService: AuthService, prisma: PrismaService) {
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

export async function createTestGroup(prisma: PrismaService, name: string = 'Test Group') {
    const existingGroup = await prisma.group.findFirst({
        where: {
            name: name,
        },
    });

    if (existingGroup != null) {
        const stillExists = await prisma.group.findUnique({ where: { id: existingGroup.id } });
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

    const persisted = await prisma.group.findUnique({ where: { id: newGroup.id } });
    if (!persisted) throw new Error('Grupo não foi persistido corretamente');

    return newGroup.id;
}

export async function createTestCategory(prisma: PrismaService, groupId: string) {
    const existingCategory = await prisma.category.findFirst({
        where: {
            groupId
        }
    })

    if (existingCategory != null) {
        return existingCategory.id;
    }

    const newCategory = await prisma.category.create({
        data: {
            name: "Teste Category",
            type: PostType.NORMAL,
            groupId,
        }
    })

    return newCategory.id;
}

export async function createPostDto(prisma: PrismaService, overrides: Partial<CreatePostDto> = {}): Promise<CreatePostDto> {
    const groupId = await createTestGroup(prisma);
    const userId = overrides.userId || await createTestUser(prisma);
    const categoryId = overrides.categoryId || await createTestCategory(prisma, groupId);


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

export async function createTestPost(prisma: PrismaService, overrides: Partial<CreatePostDto> = {},) {
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

export async function createTestUser(prisma: PrismaService, phone: string = "1234567891", email: string = "testeuser@example.com") {
    const existingUser = await prisma.user.findFirst({
        where: { phone }
    })

    if (existingUser != null) {
        return existingUser.id
    }

    const newUser = await prisma.user.create({
        data: {
            fullName: "Teste User",
            email: email,
            hash: DEFAULT_PASSWORD,
            phone,
        }
    })

    return newUser.id;
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

async function isInviteCodeUnique(inviteCode: string, prismaService: PrismaService) {
    try {
        const group = await prismaService.group.findUnique({
            where: { inviteCode },
        });
        return !group;
    } catch (error) {
        return error;
    }
}

async function generateUniqueInviteCode(prismaService: PrismaService, length: number = 8) {
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