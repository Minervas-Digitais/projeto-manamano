import { INestApplication } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import request from "supertest";
import { PrismaService } from "src/prisma/prisma.service";
import { execSync } from "child_process";
import { NotificationType, RoleType } from "@prisma/client";
import { CreateNotificationDto } from "src/notification/dto/create-notification.dto";

export async function getNotificationId(app: INestApplication, prisma: PrismaService) {
    const recipientToken = await getRecipientToken(app, prisma)
    const recipientUser = await prisma.user.findUnique({
            where: {email: "testrecipient@example.com"}
        })

    const senderToken = await getSenderToken(app, prisma);
    const senderUser = await prisma.user.findUnique({
            where: {email: "testuser@example.com"},
        })
    
    const notificationDTO: CreateNotificationDto = {
            senderId: senderUser.id,
            body: "bodyTeste",
            recipientId: recipientUser.id,
            type: NotificationType.COMMENT,
            groupName: "groupTeste",
            senderName: "senderTeste"
        }
        
    const response = await request(app.getHttpServer())
            .post("/notifications")
            .set("Authorization", "Bearer " + senderToken)
            .send(notificationDTO)
            .expect(201)
    
    return response.body.id
}

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

export async function getRecipientToken(app: INestApplication, prisma: PrismaService) {
    const email = 'testrecipient@example.com';

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingUser) {
        await request(app.getHttpServer())
            .post('/user')
            .send({
                fullName: 'TestRecipientUser',
                email,
                phone: '1234567891',
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

export async function getSenderToken(app: INestApplication, prisma: PrismaService) {
    const email = 'testsender@example.com';

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingUser) {
        await request(app.getHttpServer())
            .post('/user')
            .send({
                fullName: 'TestSenderUser',
                email,
                phone: '1234567892',
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