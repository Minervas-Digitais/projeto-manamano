import { PrismaService } from "src/prisma/prisma.service";
import { CommentController } from "../comment.controller";
import { CommentService } from "../comment.service";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateCommentDto } from "../dto/create-comment.dto";
import { NotFoundException } from "@nestjs/common";

// AINDA NAO TA FUNCIONANDO!
// o arquivo da erros na parte de remove, vou olhar depois

describe("CommentService", () => {
    let service: CommentService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentService,
                {
                    provide: PrismaService,
                    useValue: {
                        comment: {
                            create: jest.fn(),
                            remove: jest.fn()
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<CommentService>(CommentService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    describe("Create", () => {
        it("Deve criar um comentário", async () => {
            const comment: CreateCommentDto = {
                content: "Teste",
                userId: "Usuario123",
                postId: "Post123",
            };
            const id = "1"
            const expectedResult = {
                id: id,
                ...comment,
                createdAt: new Date(),
                updatedAt: new Date()
            }

            jest.spyOn(prismaService.comment, "create").mockResolvedValue(expectedResult);

            const result = await service.create(comment);
            expect(result).toEqual(expectedResult);
            expect(prismaService.comment.create).toHaveBeenCalledWith({ data: comment });
            expect(prismaService.comment.create).toHaveBeenCalledTimes(1);
        });

        it("Deve retornar erro se falhar ao criar comentário", async () => {
            const dto: CreateCommentDto = new CreateCommentDto;

            const error = new Error("Erro no banco de dados");

            jest.spyOn(prismaService.comment, "create").mockRejectedValue(error);

            await expect(service.create(dto)).resolves.toEqual(error);
        });
    })

    describe("Remove", () => {
        it("Deve remover um comentário com o id especificado", async () => {
            const id = "1";
            const comment: CreateCommentDto = {
                content: "Teste",
                userId: "Usuario123",
                postId: "Post123",
            };

            const response = {
                id, 
                ...comment,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prismaService.comment, "delete").mockResolvedValue(response);

            const result = await service.remove(id);
            expect(result).toEqual(response);
        })

        it("Deve lançar NotFoundException quando o comentário não for encontrado", async () => {
            const id = "1"

            jest.spyOn(prismaService.comment, "findUnique").mockResolvedValue(null);

            const result = await service.remove(id);

            expect(result).toBeInstanceOf(NotFoundException);
            expect(result.message).toBe("Comentário não encontrado.");
        })

        it("Deve retornar erro se ocorrer falha na remoção do comentário", async () => {
            const id = "1";
            const comment: CreateCommentDto = {
                content: "Teste",
                userId: "Usuario123",
                postId: "Post123",
            };
            jest.spyOn(prismaService.comment, "findUnique").mockResolvedValue({id, ...comment, createdAt: new Date(), updatedAt: new Date()});
            jest.spyOn(prismaService.comment, "delete").mockRejectedValue(new Error("Erro inesperado na remoção"));

            const result = await service.remove(id);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Erro inesperado na remoção");
        })
    })
})