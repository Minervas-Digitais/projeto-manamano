import { INestApplication, ValidationPipe } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { CommentModule } from "../comment.module";
import { createTestPost, createTestUser, getUserToken, resetDatabase } from "src/test/test-helper.comment";
import { CreateCommentDto } from "../dto/create-comment.dto";
import request from "supertest";
import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";

describe("Comment", () => {
    let app :INestApplication;
    let prismaService: PrismaService;
    let userToken: string

    beforeAll(async () => {
        resetDatabase();
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [CommentModule, UserModule, AuthModule],
        })
            .compile()

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        prismaService = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();

        userToken = await getUserToken(app, prismaService);
    })

    describe("Create", () => {
        it("Deve criar um novo comentario", async () => {
            const user = await createTestUser(prismaService);
            const post = await createTestPost(prismaService);
            
            const commentDTO: CreateCommentDto = {
                content: "Test comment",
                postId: post,
                userId: user,
            } as CreateCommentDto;

            const response = await request(app.getHttpServer())
                .post("/comment")
                .set("Authorization", "Bearer " + userToken)
                .send(commentDTO)
            
            expect(response.status).toBe(201);
        })

        it("deve retornar erro 401 caso o jwt token for invalido", async () => {
            const user = await createTestUser(prismaService);
            const post = await createTestPost(prismaService);

            const commentDTO: CreateCommentDto = {
                content: "Test comment",
                postId: post,
                userId: user,
            } as CreateCommentDto;

            const response = await request(app.getHttpServer())
                .post('/comment')
                .set('Authorization', 'Bearer ')
                .send(commentDTO);

            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Unauthorized')
        })
    })

    describe("Remove", () => {
        it("Deve remover um comentario", async () => {
            const user = await createTestUser(prismaService);
            const post = await createTestPost(prismaService);

            const commentDTO: CreateCommentDto = {
                content: "Test comment",
                postId: post,
                userId: user,
            } as CreateCommentDto;

            const comment = await prismaService.comment.create({
                data: commentDTO
            });


            const response = await request(app.getHttpServer())
                .delete(`/comment/${comment.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            const inDb = await prismaService.category.findUnique({ where: { id: comment.id } });
            expect(inDb).toBeNull();
        })

        it('deve retornar 404 ao tentar remover uma categoria inexistente', async () => {
            const commentId = 'invalidId';

            const response = await request(app.getHttpServer())
                .delete(`/category/${commentId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Cannot DELETE /category/invalidId');
        });

        it('deve retornar 401 se o token JWT for inválido ou ausente', async () => {
            const response = await request(app.getHttpServer())
                .delete('/comment/qualquer-id');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    })

    afterAll(async () => {
        await app.close();
    });
})