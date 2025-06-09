import request from 'supertest';
import { RoleType } from '@prisma/client';
import { UserModule } from '../user.module';
import { AuthModule } from 'src/auth/auth.module';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getUserToken, resetDatabase } from 'src/test/test-helper.comment';


describe('User (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userToken: string;

    const testUserDto = {
        fullName: 'Test User',
        email: 'testuser@example.com',
        phone: '1234567890',
        hash: 'password123',
    };

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
            const response = await request(app.getHttpServer())
                .post('/user')
                .send({ ...testUserDto, email: 'create@example.com' });

            expect(response.status).toBe(201);
            expect(response.body.email).toBe('create@example.com');
        });
    });

    describe('Find All Users', () => {
        it('should return users with admin token', async () => {
            await request(app.getHttpServer()).post('/user').send({
                ...testUserDto,
                email: 'all@example.com',
            });

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
        it('should find the created user', async () => {
            const user = await request(app.getHttpServer()).post('/user').send({
                ...testUserDto,
                email: 'find@example.com',
            });

            const response = await request(app.getHttpServer())
                .get(`/user/${user.body.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(user.body.id);
        });

        it('should return 404 for invalid id', async () => {
            const response = await request(app.getHttpServer())
                .get('/user/invalid-id')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
        });
    });

    describe('Update User', () => {
        it('should update the user', async () => {
            const user = await request(app.getHttpServer()).post('/user').send({
                ...testUserDto,
                email: 'update@example.com',
            });

            const response = await request(app.getHttpServer())
                .patch(`/user/${user.body.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ fullName: 'Updated Name' });

            expect(response.status).toBe(201);
            expect(response.body.fullName).toBe('Updated Name');
        });
    });

    describe('Change Password', () => {
        it('should change password with correct old password', async () => {
            const user = await request(app.getHttpServer()).post('/user').send({
                ...testUserDto,
                email: 'changepass@example.com',
                hash: 'oldpass',
            });

            const response = await request(app.getHttpServer())
                .patch(`/user/${user.body.id}/change-password`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ oldPassword: 'oldpass', newPassword: 'newpass' });

            expect(response.status).toBe(201);
        });

        it('should fail with incorrect old password', async () => {
            const user = await request(app.getHttpServer()).post('/user').send({
                ...testUserDto,
                email: 'wrongpass@example.com',
                hash: 'correctpass',
            });

            const response = await request(app.getHttpServer())
                .patch(`/user/${user.body.id}/change-password`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ oldPassword: 'wrongpass', newPassword: 'newone' });

            expect(response.status).toBe(401);
        });
    });

    describe('Update Role', () => {
        it('should update the user role', async () => {
            const user = await request(app.getHttpServer()).post('/user').send({
                ...testUserDto,
                email: 'roleupdate@example.com',
            });

            const response = await request(app.getHttpServer())
                .patch(`/user/${user.body.id}/role`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ role: RoleType.MODERATOR });

            expect(response.status).toBe(200);
            expect(response.body.sysRole).toBe('MODERATOR');
        });

        it('should fail without role in body', async () => {
            const user = await request(app.getHttpServer()).post('/user').send({
                ...testUserDto,
                email: 'failrole@example.com',
            });

            const response = await request(app.getHttpServer())
                .patch(`/user/${user.body.id}/role`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('Remove User', () => {
        it('should delete the user', async () => {
            const user = await request(app.getHttpServer()).post('/user').send({
                ...testUserDto,
                email: 'delete@example.com',
            });

            const response = await request(app.getHttpServer())
                .delete(`/user/${user.body.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.text).toBe('Usuário deletado com sucesso.');
        });

        it('should return 404 when trying to delete non-existing user', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/user/non-existent-id`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
        });

        it('should return 401 when deleting without token', async () => {
            const user = await request(app.getHttpServer()).post('/user').send({
                ...testUserDto,
                email: 'unauthdelete@example.com',
            });

            const response = await request(app.getHttpServer()).delete(`/user/${user.body.id}`,);
            expect(response.status).toBe(401);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
