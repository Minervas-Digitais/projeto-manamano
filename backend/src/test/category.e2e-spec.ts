import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { CategoryModule } from '../category/category.module';
import { GroupModule } from 'src/group/group.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../prisma/prisma.service';
import { createCategoryDto } from 'src/category/dto/create-category.dto.factory';
import { getUserToken, createTestGroup } from './test-helpers';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { AuthService } from 'src/auth/auth.service';

describe('Category', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userToken: string;
    let authService: AuthService;

    beforeAll(async () => {;
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [CategoryModule, GroupModule, UserModule, AuthModule],
        })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        prismaService = moduleFixture.get<PrismaService>(PrismaService);
        authService = moduleFixture.get<AuthService>(AuthService);

        await app.init();

        userToken = await getUserToken(authService, prismaService);
    });

    describe("create()", () => {
        it("deve criar uma nova categoria", async () => {
            const groupId = await createTestGroup(prismaService);
            const categoryDto: CreateCategoryDto = createCategoryDto({ groupId: groupId });

            const response = await request(app.getHttpServer())
                .post('/category')
                .set('Authorization', 'Bearer ' + userToken)
                .send(categoryDto);

            expect(response.status).toBe(201)

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('type');
            expect(response.body).toHaveProperty('groupId');
            expect(response.body).toHaveProperty('createdAt');
            expect(response.body).toHaveProperty('updatedAt');
            expect(response.body.groupId).toBe(groupId);
        })

        it("deve retornar erro 404 caso o id do grupo for invalido", async () => {
            const groupId = 'invalidId';

            const categoryDto = createCategoryDto({ groupId: groupId });

            const response = await request(app.getHttpServer())
                .post('/category')
                .set('Authorization', 'Bearer ' + userToken)
                .send(categoryDto);

            expect(response.status).toBe(404)
            expect(response.body.error).toBe("Not Found")
            expect(response.body.message).toBe("Grupo não encontrado.")
        })

        it("deve retornar erro 400 caso o nome da categoria for invalido", async () => {
            const groupId = await createTestGroup(prismaService);
            const categoryDto = createCategoryDto({ name: "", groupId: groupId });

            const response = await request(app.getHttpServer())
                .post('/category')
                .set('Authorization', 'Bearer ' + userToken)
                .send(categoryDto);

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Bad Request')
            expect(response.body.message).toEqual(["name should not be empty"])
        })

        it("deve retornar erro 400 caso o tipo da categoria for invalido", async () => {
            const groupId = await createTestGroup(prismaService);
            const categoryDto = createCategoryDto({ type: "" as any, groupId: groupId });

            const response = await request(app.getHttpServer())
                .post('/category')
                .set('Authorization', 'Bearer ' + userToken)
                .send(categoryDto);

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Bad Request')
            expect(response.body.message).toEqual([
                'type must be one of the following values: NORMAL, EVENT, CLASS',
                'type should not be empty'
            ])
        })

        it("deve retornar erro 401 caso o jwt token for invalido", async () => {
            const groupId = await createTestGroup(prismaService);
            await prismaService.group.findUnique({ where: { id: groupId } })
            const categoryDto = createCategoryDto({ groupId: groupId });

            const response = await request(app.getHttpServer())
                .post('/category')
                .set('Authorization', 'Bearer ')
                .send(categoryDto);

            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Unauthorized')
        })
    })

    describe("findAll()", () => {
        it("deve retornar todas as categorias", async () => {
            const response = await request(app.getHttpServer())
                .get('/category')
                .set('Authorization', 'Bearer ' + userToken)


            expect(response.status).toBe(200)
            expect(response.body.length).toBeGreaterThan(0)
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).toHaveProperty('type');
            expect(response.body[0]).toHaveProperty('groupId');
            expect(response.body[0]).toHaveProperty('createdAt');
            expect(response.body[0]).toHaveProperty('updatedAt');
        })

        it("deve retornar [] caso nao exista categorias", async () => {
            await prismaService.category.deleteMany({});
            const response = await request(app.getHttpServer())
                .get('/category')
                .set('Authorization', 'Bearer ' + userToken)



            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })

        it('deve retornar 401 se o token JWT for inválido ou ausente', async () => {
            const response = await request(app.getHttpServer())
                .get('/category');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    describe("findCategoriesInGroup()", () => {
        it("deve retornar todas as categorias do grupo do id", async () => {
            const groupId = await createTestGroup(prismaService);

            await prismaService.category.create({
                data: {
                    name: 'Categoria 1',
                    type: 'NORMAL',
                    groupId,
                },
            });

            await prismaService.category.create({
                data: {
                    name: 'Categoria 2',
                    type: 'EVENT',
                    groupId,
                },
            });

            const response = await request(app.getHttpServer())
                .get(`/category/group/${groupId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0].groupId).toBe(groupId);
        })

        it("deve retornar [] caso o id do grupo for invalido", async () => {
            const groupId = 'invalidId';

            const response = await request(app.getHttpServer())
                .get(`/category/group/${groupId}`)
                .set('Authorization', 'Bearer ' + userToken)


            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })

        it("deve retornar [] caso o grupo nao tenha categorias", async () => {
            const groupId = createTestGroup(prismaService, 'grupo teste categoria');

            const response = await request(app.getHttpServer())
                .get(`/category/group/${groupId}`)
                .set('Authorization', 'Bearer ' + userToken)

            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })

        it('deve retornar 401 se o token JWT for inválido ou ausente', async () => {
            const response = await request(app.getHttpServer())
                .get('/category/group/id');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    describe("findOne()", () => {
        it('deve retornar uma categoria existente pelo ID', async () => {
            const groupId = await createTestGroup(prismaService);
            const category = await prismaService.category.create({
                data: {
                    name: 'Categoria de Teste',
                    type: 'NORMAL',
                    groupId,
                },
            });

            const response = await request(app.getHttpServer())
                .get(`/category/${category.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', category.id);
            expect(response.body).toHaveProperty('name', 'Categoria de Teste');
        });

        it('deve retornar 404 se a categoria não existir', async () => {
            const categoryId = 'invalidId';

            const response = await request(app.getHttpServer())
                .get(`/category/${categoryId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Not Found');
            expect(response.body.message).toBe('Categoria não encontrada.');
        });

        it('deve retornar 401 se o token JWT for inválido ou ausente', async () => {
            const response = await request(app.getHttpServer())
                .get('/category/qualquer-id');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    describe("update()", () => {
        it('deve atualizar uma categoria existente', async () => {
            const groupId = await createTestGroup(prismaService);

            const category = await prismaService.category.create({
                data: {
                    name: 'Categoria Original',
                    type: 'NORMAL',
                    groupId,
                },
            });

            const response = await request(app.getHttpServer())
                .patch(`/category/${category.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    name: 'Categoria Atualizada',
                    type: 'EVENT',
                });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('Categoria Atualizada');
            expect(response.body.type).toBe('EVENT');
        });

        it('deve retornar 404 ao tentar atualizar uma categoria inexistente', async () => {
            const categoryId = 'invalidId';

            const response = await request(app.getHttpServer())
                .patch(`/category/${categoryId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    name: 'Qualquer nome',
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Categoria não encontrada.');
        });

        it('deve retornar 400 se o nome for vazio', async () => {

            const groupId = await createTestGroup(prismaService);

            const category = await prismaService.category.create({
                data: {
                    name: 'Categoria Original',
                    type: 'NORMAL',
                    groupId,
                },
            });

            const response = await request(app.getHttpServer())
                .patch(`/category/${category.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: '' });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('name should not be empty');
        });


        it('deve retornar 401 se o token JWT for inválido ou ausente', async () => {
            const response = await request(app.getHttpServer())
                .patch('/category/qualquer-id');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    describe("remove()", () => {
        it('deve remover uma categoria existente', async () => {
            const groupId = await createTestGroup(prismaService);

            const category = await prismaService.category.create({
                data: {
                    name: 'Categoria a ser removida',
                    type: 'NORMAL',
                    groupId,
                },
            });

            const response = await request(app.getHttpServer())
                .delete(`/category/${category.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            const inDb = await prismaService.category.findUnique({ where: { id: category.id } });
            expect(inDb).toBeNull();
        });

        it('deve retornar 404 ao tentar remover uma categoria inexistente', async () => {
            const categoryId = 'invalidId';

            const response = await request(app.getHttpServer())
                .delete(`/category/${categoryId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Categoria não encontrada.');
        });

        it('deve retornar 401 se o token JWT for inválido ou ausente', async () => {
            const response = await request(app.getHttpServer())
                .delete('/category/qualquer-id');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    afterAll(async () => {
        await app.close();
    });

})