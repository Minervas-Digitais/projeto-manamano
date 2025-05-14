import { INestApplication, ValidationPipe } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { CommentModule } from "../comment.module";
import { getUserToken, resetDatabase } from "src/test/test-helper.comment";
import { CreateCommentDto } from "../dto/create-comment.dto";
import request from "supertest";

describe("Comment", () => {
    let app :INestApplication;
    let prismaService: PrismaService;
    let userToken: string

    beforeAll(async () => {
        resetDatabase();
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [CommentModule],
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
            const commentDTO: CreateCommentDto = {
                content: "Test comment",
                postId: "postid123",
                userId: "userid123",
            } as CreateCommentDto;

            const response = await request(app.getHttpServer)
                .post("/comment")
                .set("Authorization", "Bearer " + userToken)
                .send(commentDTO)
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id")
            expect(response.body).toHaveProperty("content")
            expect(response.body).toHaveProperty("userId")
            expect(response.body).toHaveProperty("postId")
            expect(response.body).toHaveProperty("createdAt")
            expect(response.body).toHaveProperty("updatedAt")
        })

        it("deve retornar erro 401 caso o jwt token for invalido", async () => {
            const commentDTO: CreateCommentDto = {
                content: "Test comment",
                postId: "postid123",
                userId: "userid123",
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
            const comment = await prismaService.comment.create({
                data: {
                    content: "Test comment",
                    postId: "postid123",
                    userId: "userid123",
                },
            });

            const response = await request(app.getHttpServer())
                .delete(`/category/${comment.id}`)
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
            expect(response.body.message).toBe('Categoria não encontrada.');
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