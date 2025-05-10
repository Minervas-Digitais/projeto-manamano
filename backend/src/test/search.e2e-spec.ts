import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { SearchModule } from '../search/search.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../prisma/prisma.service';


describe('SearchController', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let token: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [SearchModule, UserModule, AuthModule],
        })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        prismaService = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();

        // Criando um usuario para teste
        const createUserResponse = await request(app.getHttpServer())
            .post('/user')
            .send({
                fullName: 'Test User',
                email: 'testuser@example.com',
                phone: '1234567890',
                hash: 'password123',
            })
            .expect(201);

        // Recebendo o token do usuario teste
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123',
            })
            .expect(201);


        token = loginResponse.body.accessToken;

        console.log('LOGIN BODY RES:', loginResponse.body);
    });

    describe("/", () => {
        it('deve retornar resultados de pesquisa para usuários, grupos e posts', async () => {
            const searchDto = { input: 'Lois' };

            const response = await request(app.getHttpServer())
                .post('/search')
                .set('Authorization', 'Bearer ' + token)
                .send(searchDto);

            expect(response.status).toBe(201);

            expect(response.body).toHaveProperty('users');
            expect(response.body).toHaveProperty('groups');
            expect(response.body).toHaveProperty('posts');

            expect(Array.isArray(response.body.users)).toBe(true);
            expect(Array.isArray(response.body.groups)).toBe(true);
            expect(Array.isArray(response.body.posts)).toBe(true);
        });

        it('deve retornar 401 quando tentar acessar sem token de autenticação', async () => {
            const response = await request(app.getHttpServer())
                .post('/search')
                .send({ input: 'Lois' })
                .expect(401);

            expect(response.body.message).toBe('Unauthorized');
        });

        it('deve retornar 401 quando o token de autenticação for inválido', async () => {
            const searchDto = { input: 'Lois' };

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
                .set('Authorization', 'Bearer ' + token)
                .send(searchDto)
                .expect(400);

            expect(response.body.message).toEqual(['input should not be empty']);
        });
    })

    describe("/filter", () => {
        it('deve retornar resultados de pesquisa para usuários', async () => {
            const searchDto = { input: 'Lois' };
            const filter = 'users';

            const response = await request(app.getHttpServer())
                .post(`/search/filter/${filter}`)
                .set('Authorization', 'Bearer ' + token)
                .send(searchDto);

            expect(response.status).toBe(200);

            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('fullName');
        });

        it('deve retornar resultados de pesquisa para grupos', async () => {
            const searchDto = { input: 'Collins' };
            const filter = 'groups';

            const response = await request(app.getHttpServer())
                .post(`/search/filter/${filter}`)
                .set('Authorization', 'Bearer ' + token)
                .send(searchDto);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('name');
        });

        it('deve retornar 401 quando tentar acessar sem token de autenticação', async () => {

            const searchDto = { input: 'Lois' };
            const filter = 'users';

            const response = await request(app.getHttpServer())
                .post(`/search/filter/${filter}`)
                .send(searchDto)
                .expect(401);

            expect(response.body.message).toBe('Unauthorized');
        });

        it('deve retornar 401 quando o token de autenticação for inválido', async () => {
            const searchDto = { input: 'Lois' };
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
                .set('Authorization', 'Bearer ' + token)
                .send(searchDto)
                .expect(400);

            expect(response.body.message).toEqual(['input should not be empty']);
        });

        it('deve retornar 400 quando o filtro de pesquisa for invalido', async () => {
            const searchDto = { input: 'Lois' };
            const filter = 'filtroInvalido';

            const response = await request(app.getHttpServer())
                .post(`/search/filter/${filter}`)
                .set('Authorization', 'Bearer ' + token)
                .send(searchDto)
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid filter');
        });
    })


    afterAll(async () => {
        await app.close();
    });

})
