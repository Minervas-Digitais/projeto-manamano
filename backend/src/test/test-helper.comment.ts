import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PrismaService } from "src/prisma/prisma.service";
import { execSync } from "child_process";
import { CreatePostDto } from "src/post/dto/create-post.dto";
import { CreateGroupDto } from "src/group/dto/create-group.dto";
import { PostType } from "@prisma/client";

export async function createTestPost(prisma: PrismaService) {
    const groupId = await createTestGroup(prisma);
    const userId = await createTestUser(prisma);
    const categoryId = await createTestCategory(prisma, groupId);

    const post: CreatePostDto = {
        title: "Teste post",
        groupId,
        userId,
        type: PostType.NORMAL,
        categoryId,
        input: "Teste input"
    } as any

    const existingPost = await prisma.post.findFirst({
        where: {
            title: "Teste post"
        }
    })

    if (existingPost != null) {
        return existingPost.id;
    }

    const newPost = await prisma.post.create({
        data: post
    })

    return newPost.id;
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

export async function createTestGroup(prisma: PrismaService, name: string = 'Test Group') {
    const existingGroup = await prisma.group.findFirst({
        where: {
            name: 'Test Group',
        },
    });

    if (existingGroup != null) {
        return existingGroup.id;
    }

    const newGroup = await prisma.group.create({
        data: {
            name: 'Test Group',
            description: 'Descrição teste',
            inviteCode: String(generateUniqueInviteCode()),
        } as CreateGroupDto,
    });

    return newGroup.id;
}

async function generateUniqueInviteCode(length: number = 8) {
    try {
      let inviteCode: string;
      let isUnique = false;

      do {
        inviteCode = this.generateInviteCode(length);
        isUnique = await this.isInviteCodeUnique(inviteCode);
      } while (!isUnique);

      return inviteCode;
    } catch (error) {
      return error;
    }
}

export async function createTestUser(prisma: PrismaService, phone: string = "1234567891") {
    const existingUser = await prisma.user.findFirst({
        where: { phone }
    })

    if (existingUser != null) {
        return existingUser.id
    }

    const newUser = await prisma.user.create({
        data: {
            fullName: "Teste User",
            email: "testeuser@example.com",
            hash: "senha123",
            phone,
        }
    })

    return newUser.id;
}

export async function getUserToken(app: INestApplication, prisma: PrismaService) {
    const email = "testuser@example.com";
    
    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (!existingUser) {
        await request(app.getHttpServer())
            .post("/user")
            .send({
                fullName: "Test user",
                email,
                phone: "1234567890",
                hash: "password123",
            })
            .expect(201);
    }

    const loginResponse = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
            email,
            password: "password123",
        })
        .expect(201);
    
    return loginResponse.body.accessToken;
}

export function resetDatabase() {
    try {
        console.log('🔄 Resetando banco...');
        execSync('npx prisma migrate reset --force --skip-generate --skip-seed', { stdio: 'inherit' });
        execSync('npm run seed', { stdio: 'inherit' });
        console.log('✅ Banco resetado com seed');
    } catch (err) {
        console.error('❌ Erro ao resetar banco:', err);
        process.exit(1);
    }
}