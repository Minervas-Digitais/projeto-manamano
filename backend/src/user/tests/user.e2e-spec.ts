import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from '../user.module';
import { AuthModule } from 'src/auth/auth.module';
import request from 'supertest';
import {
    createTestUser,
    getUserToken,
    resetDatabase,
} from 'src/test/test-helper.comment';
import { RoleType } from '@prisma/client';

describe('User', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userToken: string;

    beforeAll(async () => {
        resetDatabase();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [UserModule, AuthModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        prismaService = moduleFixture.get<PrismaService>(PrismaService);
        userToken = await getUserToken(app, prismaService);
    });

    describe('Create User', () => {
        it('should create a new user', async () => {
            const userId = await createTestUser(prismaService, '9999999999');
            const user = await prismaService.user.findUnique({ where: { id: userId } });

            expect(user).toBeDefined();
            expect(user?.phone).toBe('9999999999');
        });
    });

    describe('Find All Users', () => {
        it('should return users with admin token', async () => {
            await createTestUser(prismaService, '1111111111');

            const response = await request(app.getHttpServer())
                .get('/user')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return 401 without token', async () => {
            const response = await request(app.getHttpServer()).get('/user');
            expect(response.status).toBe(401);
        });
    });

    describe('Find One User', () => {
        let userId: string;

        beforeAll(async () => {
            userId = await createTestUser(prismaService, '2222222222');
        });

        it('should find the created user', async () => {
            const response = await request(app.getHttpServer())
                .get(`/user/${userId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(userId);
        });

        it('should return 404 for invalid user ID', async () => {
            const response = await request(app.getHttpServer())
                .get('/user/nonexistent-id')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
        });
    });

    describe('Update User', () => {
        let userId: string;

        beforeAll(async () => {
            userId = await createTestUser(prismaService, '3333333333');
        });

        it('should update the user', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/user/${userId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ fullName: 'Updated Name' });

            expect(response.status).toBe(201);
            expect(response.body.fullName).toBe('Updated Name');
        });
    });

    describe('Change Password', () => {
        let userId: string;

        beforeAll(async () => {
            userId = await createTestUser(prismaService, '4444444444');
            await prismaService.user.update({
                where: { id: userId },
                data: { hash: 'initialpass' },
            });
        });

        it('should change password with correct old password', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/user/${userId}/change-password`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ oldPassword: 'initialpass', newPassword: 'newsecurepass' });

            expect(response.status).toBe(201);
        });

        it('should fail with incorrect old password', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/user/${userId}/change-password`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ oldPassword: 'wrongpass', newPassword: 'anotherpass' });

            expect(response.status).toBe(401);
        });
    });

    describe('Update Role', () => {
        let userId: string;

        beforeAll(async () => {
            userId = await createTestUser(prismaService, '5555555555');
        });

        it('should update the user role', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/user/${userId}/role`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ role: RoleType.MODERATOR });

            expect(response.status).toBe(200);
            expect(response.body.sysRole).toBe('MODERATOR');
        });

        it('should fail without role in body', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/user/${userId}/role`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('Remove User', () => {
        let userId: string;

        beforeEach(async () => {
            const phone = `delete-${Date.now()}`;
            userId = await createTestUser(prismaService, phone);
        });

        it('should delete the user', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/user/${userId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
        });

        it('should return 404 when trying to delete non-existing user', async () => {
            const response = await request(app.getHttpServer())
                .delete('/user/nonexistent-id')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
        });

        it('should return 401 when deleting without token', async () => {
            const response = await request(app.getHttpServer()).delete(
                `/user/${userId}`,
            );

            expect(response.status).toBe(401);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
