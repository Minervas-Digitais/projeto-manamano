import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PrismaService } from "src/prisma/prisma.service";
import { execSync } from "child_process";

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