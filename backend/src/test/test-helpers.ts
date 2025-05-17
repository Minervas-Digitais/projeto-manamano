import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RoleType } from '@prisma/client';
import { CreateGroupDto } from 'src/group/dto/create-group.dto';
import { execSync } from 'child_process';

export async function getUserToken(app: INestApplication, prisma: PrismaService) {
    const email = 'testuser@example.com';

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingUser) {
        await request(app.getHttpServer())
            .post('/user')
            .send({
                fullName: 'Test User',
                email,
                phone: '1234567890',
                hash: 'password123',
            })
            .expect(201);
    }

    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
            email,
            password: 'password123',
        })
        .expect(201);

    return loginResponse.body.accessToken;
}

export async function getAdminToken(app: INestApplication, prisma: PrismaService) {
    const email = 'admin@example.com';

    const existingAdmin = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('password123', 10);

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

    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
            email,
            password: 'password123',
        })
        .expect(201);

    return loginResponse.body.accessToken;
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