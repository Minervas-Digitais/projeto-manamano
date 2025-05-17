import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { SearchModule } from '../search/search.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../prisma/prisma.service';
import { getAdminToken, getUserToken, createTestGroup } from './test-helpers';
import { GroupModule } from 'src/group/group.module';


describe('SearchController', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userToken: string;
    let adminToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [SearchModule, UserModule, AuthModule, GroupModule],
        })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        prismaService = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();

        userToken = await getUserToken(app, prismaService);
        adminToken = await getAdminToken(app, prismaService);
    });

    describe("search()", () => {
        it('deve retornar resultados de pesquisa para usuários, grupos e posts', async () => {
            const searchDto = { input: 'Test' };

            const response = await request(app.getHttpServer())
                .post('/search')
                .set('Authorization', 'Bearer ' + userToken)
                .send(searchDto);

            expect(response.status).toBe(201);

            expect(response.body).toHaveProperty('users');
            expect(response.body).toHaveProperty('groups');
            expect(response.body).toHaveProperty('posts');

            expect(Array.isArray(response.body.users)).toBe(true);
            expect(Array.isArray(response.body.groups)).toBe(true);
            expect(Array.isArray(response.body.posts)).toBe(true);
        });

        it('deve retornar 401 quando tentar acessar sem userToken de autenticação', async () => {
            const response = await request(app.getHttpServer())
                .post('/search')
                .send({ input: 'Test' })
                .expect(401);

            expect(response.body.message).toBe('Unauthorized');
        });

        it('deve retornar 401 quando o userToken de autenticação for inválido', async () => {
            const searchDto = { input: 'Test' };

            const response = await request(app.getHttpServer())
                .post('/search')
                .set('Authorization', 'Bearer tokenInvalido')
                .send(searchDto)
                .expect(401);

            expect(response.body.message).toBe('Unauthorized');
        });

        it('deve retornar 400 quando o parâmetro de pesquisa estiver vazio', async () => {
            const searchDto = { input: '' };

            const response = await request(app.getHttpServer())
                .post('/search')
                .set('Authorization', 'Bearer ' + userToken)
                .send(searchDto)
                .expect(400);

            expect(response.body.message).toEqual(['input should not be empty']);
        });
    })

    describe("searchByFilter()", () => {
        it('deve retornar resultados de pesquisa para usuários', async () => {
            const searchDto = { input: 'Test' };
            const filter = 'users';

            const response = await request(app.getHttpServer())
                .post(`/search/filter/${filter}`)
                .set('Authorization', 'Bearer ' + userToken)
                .send(searchDto);

            expect(response.status).toBe(200);
            

            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('fullName');
        });

        it('deve retornar resultados de pesquisa para grupos', async () => {
            createTestGroup(prismaService);

            const searchDto = { input: 'Test' };
            const filter = 'groups';

            const response = await request(app.getHttpServer())
                .post(`/search/filter/${filter}`)
                .set('Authorization', 'Bearer ' + userToken)
                .send(searchDto);
  
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('name');
        });

        it('deve retornar 401 quando tentar acessar sem userToken de autenticação', async () => {

            const searchDto = { input: 'Test' };
            const filter = 'users';

            const response = await request(app.getHttpServer())
                .post(`/search/filter/${filter}`)
                .send(searchDto)
                .expect(401);

            expect(response.body.message).toBe('Unauthorized');
        });

        it('deve retornar 401 quando o userToken de autenticação for inválido', async () => {
            const searchDto = { input: 'Test' };
            const filter = 'users';

            const response = await request(app.getHttpServer())
                .post(`/search/filter/${filter}`)
                .set('Authorization', 'Bearer tokenInvalido')
                .send(searchDto)
                .expect(401);

            expect(response.body.message).toBe('Unauthorized');
        });

        it('deve retornar 400 quando o parâmetro de pesquisa estiver vazio', async () => {
            const searchDto = { input: '' };
            const filter = 'users';

            const response = await request(app.getHttpServer())
                .post(`/search/filter/${filter}`)
                .set('Authorization', 'Bearer ' + userToken)
                .send(searchDto)
                .expect(400);

            expect(response.body.message).toEqual(['input should not be empty']);
        });

        it('deve retornar 500 quando o filtro de pesquisa for invalido', async () => {
            const searchDto = { input: 'Test' };
            const filter = 'invalidFilter';

            const response = await request(app.getHttpServer())
                .post(`/search/filter/${filter}`)
                .set('Authorization', 'Bearer ' + userToken)
                .send(searchDto)

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Internal server error');
        });
    })


    afterAll(async () => {
        await app.close();
    });

})
