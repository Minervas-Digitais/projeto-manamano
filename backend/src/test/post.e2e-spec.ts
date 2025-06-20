import { INestApplication, ValidationPipe } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";

import { createPostDto, createTestCategory, createTestGroup, createTestPost, createTestUser, getAdminToken, getUserToken } from "src/test/test-helpers";
import request from "supertest";
import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";
import { AuthService } from "src/auth/auth.service";
import { PostModule } from "src/post/post.module";
import { CreatePostDto } from "src/post/dto/create-post.dto";
import { RoleType } from "@prisma/client";

describe("Posts", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userToken: string;
    let adminToken: string;
    let authService: AuthService;


    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [PostModule, UserModule, AuthModule],
        })
            .compile()

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        prismaService = moduleFixture.get<PrismaService>(PrismaService);
        authService = moduleFixture.get<AuthService>(AuthService);

        await app.init();

        userToken = await getUserToken(authService, prismaService);
        adminToken = await getAdminToken(authService, prismaService);
    })


    describe("create()", () => {
        it("deve criar um post com sucesso", async () => {
            const uniqueTitle = `Post Teste ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const postDto: CreatePostDto = await createPostDto(prismaService, { title: uniqueTitle });

            const response = await request(app.getHttpServer())
                .post("/post")
                .set("Authorization", `Bearer ${userToken}`)
                .send(postDto);
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect(response.body.title).toBe(postDto.title);
            expect(response.body.input).toBe(postDto.input);
        });

        it('deve retornar 400 se dados obrigatórios estiverem faltando', async () => {
            const invalidDto = {
                type: 'INVALID_TYPE',
            };

            const response = await request(app.getHttpServer())
                .post('/post')
                .set('Authorization', `Bearer ${userToken}`)
                .send(invalidDto);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toEqual(expect.arrayContaining([
                'type must be one of the following values: NORMAL, EVENT, CLASS',
                'input should not be empty',
                'input must be a string',
                'userId should not be empty',
                'userId must be a string',
                'categoryId should not be empty',
                'categoryId must be a string',
                'groupId should not be empty',
                'groupId must be a string'
            ]));

        });

        it("deve retornar erro 401 caso o jwt token for invalido", async () => {
            const postDto: CreatePostDto = await createPostDto(prismaService);

            const response = await request(app.getHttpServer())
                .post("/post")
                .set("Authorization", `Bearer `)
                .send(postDto);


            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Unauthorized')
        })
    });

    describe("findAll()", () => {
        it("deve retornar a lista de posts para o usuario ADMIN", async () => {
            await createTestPost(prismaService);

            const response = await request(app.getHttpServer())
                .get("/post")
                .set("Authorization", `Bearer ` + adminToken)

            expect(response.body.length).toBeGreaterThan(0)
        })

        it("deve retornar 404 quando não houver posts", async () => {
            await prismaService.post.deleteMany();

            const response = await request(app.getHttpServer())
                .get("/post")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Nenhuma publicação encontrada.');
        });

        it("deve retornar erro 401 caso o jwt token for invalido", async () => {
            const response = await request(app.getHttpServer())
                .get("/post")
                .set("Authorization", `Bearer `)


            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Unauthorized')
        })



        it("deve retornar erro 403 caso o usuario nao seja ADMIN", async () => {

            const response = await request(app.getHttpServer())
                .get("/post")
                .set("Authorization", `Bearer ` + userToken)

            expect(response.status).toBe(403)
            expect(response.body.message).toBe('Forbidden resource')
        })
    })

    describe("findOne()", () => {
        it("deve retornar um post existente com sucesso", async () => {
            const postId = await createTestPost(prismaService);

            const response = await request(app.getHttpServer())
                .get(`/post/${postId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id", postId);
            expect(response.body).toHaveProperty("Comment");
            expect(Array.isArray(response.body.Comment)).toBe(true);
        });

        it("deve retornar 404 para um post inexistente", async () => {
            const postId = "invalidId"
            const response = await request(app.getHttpServer())
                .get(`/post/${postId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Publicação não encontrada.");
        });


        it("deve retornar erro 401 caso o jwt token for invalido", async () => {
            const postId = await createTestPost(prismaService);

            const response = await request(app.getHttpServer())
                .get("/post/" + postId)
                .set("Authorization", `Bearer `)


            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Unauthorized')
        })



        it("deve retornar erro 403 caso o usuario nao seja ADMIN", async () => {

            const response = await request(app.getHttpServer())
                .get("/post")
                .set("Authorization", `Bearer ` + userToken)

            expect(response.status).toBe(403)
            expect(response.body.message).toBe('Forbidden resource')
        })
    })

    describe("update()", () => {
        it("deve permitir que um ADMIN atualize um post", async () => {
            const postId = await createTestPost(prismaService)
            const updateDto = await createPostDto(prismaService, { title: "Post Atualizado" });

            const response = await request(app.getHttpServer())
                .patch(`/post/${postId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(updateDto);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id", postId);
            expect(response.body.title).toBe(updateDto.title);
            expect(response.body.input).toBe(updateDto.input);
        });

        it("deve retornar 403 se um usuário comum tentar atualizar", async () => {
            const postId = await createTestPost(prismaService)
            const updateDto = await createPostDto(prismaService, { title: "Post Atualizado" });

            const response = await request(app.getHttpServer())
                .patch(`/post/${postId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send(updateDto);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("Forbidden resource");
        });

        it("deve retornar 404 se tentar atualizar um post inexistente", async () => {
            const postId = 'invalidId'
            const updateDto = await createPostDto(prismaService, { title: "Post Atualizado" });

            const response = await request(app.getHttpServer())
                .patch(`/post/${postId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(updateDto);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Publicação não encontrada.");
        });

        it("deve retornar erro 401 caso o jwt token for invalido", async () => {
            const postId = await createTestPost(prismaService)
            const updateDto = await createPostDto(prismaService, { title: "Post Atualizado" });

            const response = await request(app.getHttpServer())
                .patch("/post/" + postId)
                .set("Authorization", `Bearer `)
                .send(updateDto);


            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Unauthorized')
        })


    })

    describe("remove()", () => {
        it("deve permitir que um ADMIN delete um post", async () => {
            const postId = await createTestPost(prismaService);
            const response = await request(app.getHttpServer())
                .delete(`/post/${postId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id", postId);
        });

        it("deve retornar 404 ao tentar deletar um post inexistente", async () => {
            const postId = "invalidId";

            const response = await request(app.getHttpServer())
                .delete(`/post/${postId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Publicação não encontrada.");
        });

        it("deve retornar 403 se usuário comum tentar deletar", async () => {
            const postId = await createTestPost(prismaService);
            const response = await request(app.getHttpServer())
                .delete(`/post/${postId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("Forbidden resource");
        });

        it("deve retornar erro 401 caso o jwt token for invalido", async () => {
            const postId = await createTestPost(prismaService)

            const response = await request(app.getHttpServer())
                .delete("/post/" + postId)
                .set("Authorization", `Bearer `)

            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Unauthorized')
        })
    })

    describe("savePost", () => {
        it('deve salvar um post para o usuário corretamente', async () => {
            const userId = await createTestUser(prismaService, '2093812098', 'testeemail@gmail.com');
            const postId = await createTestPost(prismaService);
            const idsParam = `${postId},${userId}`;

            const response = await request(app.getHttpServer())
                .patch(`/post/save/${idsParam}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(201);
            expect(response.body.savedPost).toContain(postId);
        });

        it('deve retornar 404 se usuário não existir', async () => {
            const postId = await createTestPost(prismaService);
            const idsParam = `${postId},invalidUser`;

            const response = await request(app.getHttpServer())
                .patch(`/post/save/${idsParam}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Usuário não encontrado.');
        });

        it('deve retornar erro ao tentar salvar próprio post', async () => {
            const postId = await createTestPost(prismaService);
            const post = await prismaService.post.findUnique({
                where: { id: postId },
            });

            const userId = post.userId;
            const idsParam = `${postId},${userId}`;

            const response = await request(app.getHttpServer())
                .patch(`/post/save/${idsParam}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Você não pode salvar sua própria publicação.');
        });

        it('deve retornar erro 401 se token inválido ou ausente', async () => {
            const userId = await createTestUser(prismaService, '2093812098', 'testeemail@gmail.com');
            const postId = await createTestPost(prismaService);
            const idsParam = `${postId},${userId}`;

            const response = await request(app.getHttpServer())
                .patch(`/post/save/${idsParam}`)
                .set('Authorization', `Bearer `)

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    describe("removeSavedPost", () => {
        it('deve remover um post salvo com sucesso', async () => {
            const userId = await createTestUser(prismaService);
            const postId = await createTestPost(prismaService);
            const idsParam = `${postId},${userId}`;

            const response = await request(app.getHttpServer())
                .patch(`/post/unsave/${idsParam}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(201);
            expect(response.body.savedPost).not.toContain(postId);
        });

        it('deve retornar 404 se usuário não existir', async () => {
            const userId = 'invalidId'
            const postId = await createTestPost(prismaService);
            const idsParam = `${postId},${userId}`;

            const response = await request(app.getHttpServer())
                .patch(`/post/unsave/${idsParam}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Usuário não encontrado.');
        });

        it('deve retornar erro 401 se token JWT for inválido', async () => {
            const userId = await createTestUser(prismaService);
            const postId = await createTestPost(prismaService);
            const idsParam = `${postId},${userId}`;

            const response = await request(app.getHttpServer())
                .patch(`/post/unsave/${idsParam}`)
                .set('Authorization', `Bearer `);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    describe("pinPost", () => {
        it('deve fixar um post com sucesso', async () => {
            const postId = await createTestPost(prismaService);
            const response = await request(app.getHttpServer())
                .patch(`/post/pin/${postId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('isPinned', true);
        });

        it('deve retornar 404 ao tentar fixar post inexistente', async () => {
            const postId = 'invalidId';

            const response = await request(app.getHttpServer())
                .patch(`/post/pin/${postId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Publicação não encontrada.');
        });

        it('deve retornar 401 se o token for inválido', async () => {
            const postId = await createTestPost(prismaService);
            const response = await request(app.getHttpServer())
                .patch(`/post/pin/${postId}`)
                .set('Authorization', `Bearer`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    describe("unpinPost", () => {
        it('deve desfixar um post com sucesso', async () => {
            prismaService.post.deleteMany({})
            const postId = await createTestPost(prismaService, { isPinned: true });
            const response = await request(app.getHttpServer())
                .patch(`/post/unpin/${postId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('isPinned', false);
        });

        it('deve retornar 404 ao tentar desfixar post inexistente', async () => {
            const postId = 'invalidId';

            const response = await request(app.getHttpServer())
                .patch(`/post/unpin/${postId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Publicação não encontrada.');
        });

        it('deve retornar 401 se o token for inválido', async () => {
            const postId = await createTestPost(prismaService, { isPinned: true });
            const response = await request(app.getHttpServer())
                .patch(`/post/unpin/${postId}`)
                .set('Authorization', `Bearer`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    describe("getPinnedPosts", () => {
        it('deve retornar apenas posts fixados de um grupo', async () => {
            await prismaService.post.deleteMany({});
            const groupId = await createTestGroup(prismaService, 'postTeste');
            await createTestPost(prismaService, { isPinned: true, groupId: groupId });

            const response = await request(app.getHttpServer())
                .get(`/post/group/pinned/${groupId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            response.body.forEach(post => {
                expect(post.isPinned).toBe(true);
                expect(post.groupId).toBe(groupId);
            });
        });

        it('deve retornar lista vazia se o grupo não tiver posts fixados', async () => {
            await prismaService.group.deleteMany({});
            const groupId = await createTestGroup(prismaService, 'postTeste');
            await createTestPost(prismaService, { groupId: groupId });

            const response = await request(app.getHttpServer())
                .get(`/post/group/pinned/${groupId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('deve retornar 401 se token JWT for inválido', async () => {
            const groupId = await createTestGroup(prismaService, 'postTeste');
            await createTestPost(prismaService, { groupId: groupId });

            const response = await request(app.getHttpServer())
                .get(`/post/group/pinned/${groupId}`)
                .set('Authorization', 'Bearer ');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    describe("getGroupPosts", () => {
        it('deve retornar todos os posts do grupo em ordem decrescente de criação', async () => {
            const groupId = await createTestGroup(prismaService, 'postTeste');
            await createTestPost(prismaService, { groupId: groupId });

            const response = await request(app.getHttpServer())
                .get(`/post/group/${groupId}`)
                .set('Authorization', `Bearer ${userToken}`);


            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThanOrEqual(0);
            response.body.forEach(post => {
                expect(post.groupId).toBe(groupId);
            });
        });

        it('deve retornar error 404 se o grupo não tiver posts', async () => {
            const groupId = await createTestGroup(prismaService);

            const userId = await createTestUser(prismaService, '1234567890', '1234567890@example.com');

            await prismaService.participant.create({
                data: {
                userId,
                groupId,
                role: RoleType.MEMBER,
                },
            });

            const response = await request(app.getHttpServer())
                .get(`/post/group/${groupId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Nenhuma publicação encontrada.');
            });


        it('deve retornar 401 se o token for inválido', async () => {
            const groupId = await createTestGroup(prismaService, 'postTeste');
            await createTestPost(prismaService, { groupId: groupId });

            const response = await request(app.getHttpServer())
                .get(`/post/group/${groupId}`)
                .set('Authorization', 'Bearer ');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    describe("getCategoryPosts", () => {
        it('deve retornar os posts da categoria em ordem decrescente de criação', async () => {
            const groupId = await createTestGroup(prismaService);
            const categoryId = await createTestCategory(prismaService, groupId);
            await createTestPost(prismaService, { categoryId: categoryId });

            const response = await request(app.getHttpServer())
                .get(`/post/category/${categoryId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(0);
            response.body.forEach(post => {
                expect(post.categoryId).toBe(categoryId);
            });
        });

        it('deve retornar 404 se a categoria não tiver posts', async () => {
            const groupId = await createTestGroup(prismaService, 'grupoTeste');
            const categoryId = await createTestCategory(prismaService, groupId);

            const response = await request(app.getHttpServer())
                .get(`/post/category/${categoryId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Nenhuma publicação encontrada.');
        });

        it('deve retornar 401 se o token for inválido', async () => {
            const groupId = await createTestGroup(prismaService);
            const categoryId = await createTestCategory(prismaService, groupId);
            await createTestPost(prismaService, { categoryId: categoryId });

            const response = await request(app.getHttpServer())
                .get(`/post/category/${categoryId}`)
                .set('Authorization', 'Bearer ');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    describe("findUserPosts", () => {

        it('deve retornar os posts do usuário em ordem decrescente', async () => {
            const userId = await createTestUser(prismaService);
            await createTestPost(prismaService, { userId: userId });

            const response = await request(app.getHttpServer())
                .get(`/post/${userId}/posts`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(0);
            response.body.forEach(post => {
                expect(post.userId).toBe(userId);
            });
        });

        it('deve retornar 404 se o usuário não tiver posts', async () => {
            const userId = await createTestUser(prismaService, '320701233', 'usuariosempost@post.com');

            const response = await request(app.getHttpServer())
                .get(`/post/${userId}/posts`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Nenhuma publicação encontrada.');
        });

        it('deve retornar 401 se o token for inválido', async () => {
            const userId = await createTestUser(prismaService);
            await createTestPost(prismaService, { userId: userId });

            const response = await request(app.getHttpServer())
                .get(`/post/${userId}/posts`)
                .set('Authorization', 'Bearer ');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })


    afterAll(async () => {
        await app.close();
    });
})
