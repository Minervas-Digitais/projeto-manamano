import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { GroupModule } from '../group/group.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../prisma/prisma.service';
import { createGroupDto } from 'src/group/dto/create-group.dto.factory';
import { updateGroupDto } from 'src/group/dto/update-group.dto.factory';
import { getAdminToken, getUserToken, createTestGroup } from './test-helpers';

describe('Group E2E', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userToken: string;
    let adminToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [GroupModule, UserModule, AuthModule],
        })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        prismaService = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();

        userToken = await getUserToken(app, prismaService);
        adminToken = await getAdminToken(app, prismaService);

    });

    describe("create()", () => {
        it("deve criar um novo grupo", async () => {
            const groupDto = createGroupDto();

            const response = await request(app.getHttpServer())
                .post('/group')
                .set('Authorization', 'Bearer ' + userToken)
                .send(groupDto);

            expect(response.status).toBe(201)

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('description');
            expect(response.body).toHaveProperty('inviteCode');
            expect(response.body).toHaveProperty('createdAt');
            expect(response.body).toHaveProperty('updatedAt');
            expect(response.body.name).toBe(groupDto.name);
            expect(response.body.description).toBe(groupDto.description);
        })

        it("deve retornar erro 400 caso o nome for invalido", async () => {
            const groupDto = createGroupDto({ name: "" });

            const response = await request(app.getHttpServer())
                .post('/group')
                .set('Authorization', 'Bearer ' + userToken)
                .send(groupDto);


            expect(response.status).toBe(400)
            expect(response.body.message).toEqual(['name should not be empty'])
            expect(response.body.error).toBe('Bad Request')
        })

        it("deve retornar erro 401 caso o token for invalido", async () => {
            const groupDto = createGroupDto();

            const response = await request(app.getHttpServer())
                .post('/group')
                .set('Authorization', 'Bearer ')
                .send(groupDto);

            expect(response.status).toBe(401)
            expect(response.body.message).toEqual('Unauthorized')
        })
    })

    describe("findAll()", () => {
        it("deve retornar lista de grupos para usuário com papel ADMIN", async () => {
            const response = await request(app.getHttpServer())
                .get('/group')
                .set('Authorization', 'Bearer ' + adminToken)


            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).toHaveProperty('description');
            expect(response.body[0]).toHaveProperty('inviteCode');
            expect(response.body[0]).toHaveProperty('createdAt');
            expect(response.body[0]).toHaveProperty('updatedAt');
        });

        it("deve retornar erro 403 para usuário sem papel ADMIN", async () => {
            const response = await request(app.getHttpServer())
                .get('/group')
                .set('Authorization', 'Bearer ' + userToken)

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("Forbidden resource");
            expect(response.body.error).toBe("Forbidden");
        });

        it("deve retornar erro 401 caso o token for invalido", async () => {
            const groupDto = createGroupDto();

            const response = await request(app.getHttpServer())
                .get('/group')
                .set('Authorization', 'Bearer ')
                .send(groupDto);

            expect(response.status).toBe(401)
            expect(response.body.message).toEqual('Unauthorized')
        })

    })

    describe("findOne()", () => {
        it("deve retornar o grupo do id especificado", async () => {
            const groupId = await createTestGroup(prismaService);

            const response = await request(app.getHttpServer())
                .get(`/group/${groupId}`)
                .set('Authorization', 'Bearer ' + adminToken)

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', groupId);
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('description');
            expect(response.body).toHaveProperty('inviteCode');
            expect(response.body).toHaveProperty('createdAt');
            expect(response.body).toHaveProperty('updatedAt');
        });

        it('deve retornar 404 quando o grupo não for encontrado', async () => {
            const invalidGroupId = 'invalidId';
            const response = await request(app.getHttpServer())
                .get(`/group/${invalidGroupId}`)
                .set('Authorization', 'Bearer ' + adminToken);


            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Grupo não encontrado.');
        });

    })

    describe("update()", () => {
        it('deve atualizar o grupo com sucesso para um usuário ADMIN', async () => {
            const groupId = await createTestGroup(prismaService);
            const updateData = updateGroupDto({ name: "Teste Update", description: "Teste update descrição" })

            const response = await request(app.getHttpServer())
                .patch(`/group/${groupId}`)
                .set('Authorization', 'Bearer ' + adminToken)
                .send(updateData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id', groupId);
            expect(response.body).toHaveProperty('name', updateData.name);
            expect(response.body).toHaveProperty('description', updateData.description);
        });

        it('deve retornar erro 404 caso o id do grupo seja invalido', async () => {
            const groupId = 'invalidId';
            const updateData = updateGroupDto({ name: "Teste Update", description: "Teste update descrição" })

            const response = await request(app.getHttpServer())
                .patch(`/group/${groupId}`)
                .set('Authorization', 'Bearer ' + adminToken)
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Grupo não encontrado.");
            expect(response.body.error).toBe("Not Found");


        });

        it('deve retornar erro 401 para um usuário sem ADMIN', async () => {
            const groupId = 'eb9b0530-5ceb-4ad4-bba5-6660e578e9de';
            const updateData = updateGroupDto({ name: "Teste Update", description: "Teste update descrição" })

            const response = await request(app.getHttpServer())
                .patch(`/group/${groupId}`)
                .set('Authorization', 'Bearer ')
                .send(updateData);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("Unauthorized");
        });

        it('deve retornar erro 400 caso os parametros de update sejam invalidos', async () => {
            const groupId = 'eb9b0530-5ceb-4ad4-bba5-6660e578e9de';
            const updateData = updateGroupDto({ name: "", description: "Teste update descrição" })

            const response = await request(app.getHttpServer())
                .patch(`/group/${groupId}`)
                .set('Authorization', 'Bearer ' + adminToken)
                .send(updateData);

            expect(response.status).toBe(400);
            expect(response.body.message).toEqual(["name should not be empty"]);
            expect(response.body.error).toBe("Bad Request");
        });
    })

    describe("remove()", () => {
        it('deve remover o grupo com sucesso para um usuário ADMIN', async () => {
            const groupId = await createTestGroup(prismaService);

            const response = await request(app.getHttpServer())
                .delete(`/group/${groupId}`)
                .set('Authorization', 'Bearer ' + adminToken)

            expect(response.status).toBe(200);

        });

        it('deve retornar 403 se usuário não for ADMIN', async () => {
            const fakeGroupId = 'id';
            const res = await request(app.getHttpServer())
                .delete(`/group/${fakeGroupId}`)
                .set('Authorization', 'Bearer ' + userToken);

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Forbidden resource');
        });

        it('deve retornar 404 se grupo não existir', async () => {
            const nonExistentId = 'idInvalido';
            const res = await request(app.getHttpServer())
                .delete(`/group/${nonExistentId}`)
                .set('Authorization', 'Bearer ' + adminToken);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Grupo não encontrado.');
        });
    })


    afterAll(async () => {
        await app.close();
    });

})