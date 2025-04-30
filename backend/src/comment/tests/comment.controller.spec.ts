import { Test, TestingModule } from "@nestjs/testing";
import { CommentController } from "../comment.controller"
import { CommentService } from "../comment.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CreateCommentDto } from "../dto/create-comment.dto";
import { NotFoundException } from "@nestjs/common";

describe("CommentController", () => {
    let controller: CommentController;
    let service: CommentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentController],
            providers: [
                {
                    provide: CommentService,
                    useValue: {
                        create: jest.fn(),
                        remove: jest.fn()
                    }
                }
            ]
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();
        
        controller = module.get<CommentController>(CommentController);
        service = module.get<CommentService>(CommentService);
    })

    describe("Segurança", () => {
        it("Deve aplicar JwtAuthGuard nos endpoints", async () => {
            const guardCreate = Reflect.getMetadata('__guards__', CommentController.prototype.create);
            const guardRemove = Reflect.getMetadata('__guards__', CommentController.prototype.remove);

            expect(guardCreate[0]).toBe(JwtAuthGuard);
            expect(guardRemove[0]).toBe(JwtAuthGuard);
        });
    })

    describe("Create", () => {
        it("Deve criar um novo comentário", async () => {
            const dto: CreateCommentDto = {
                content: "Conteudo teste",
                userId: "Usuario123",
                postId: "Post123",
            }

            const expectedResult: CreateCommentDto = {
                content: "Conteudo teste",
                userId: "Usuario123",
                postId: "Post123",
            }
            jest.spyOn(service, "create").mockResolvedValue(expectedResult);

            const result = await controller.create(dto);
            
            expect(result).toEqual(expectedResult)
            expect(service.create).toHaveBeenCalledWith(dto);
            expect(service.create).toHaveBeenCalledTimes(1);
        })

        it("Deve retornar erro se falhar", async () => {
            const dto: CreateCommentDto = new CreateCommentDto;

            jest.spyOn(service, "create").mockRejectedValue(new Error("Erro no service"));
            
            await expect(controller.create(dto)).rejects.toThrow("Erro no service");
        })
    })

    describe("Remove", () => {
        it("Deve remover o comentario de acordo com o id", async () => {
            const id = "1";
            const expectedResult = { message: "Comentário removido com sucesso" };

            jest.spyOn(service, "remove").mockResolvedValue(expectedResult);

            const result = await controller.remove(id);

            expect(result).toEqual(expectedResult);
            expect(service.remove).toHaveBeenCalledWith(id);
            expect(service.remove).toHaveBeenCalledTimes(1);
        })

        it("Deve lançar erro se o id do comentário não for encontrado", async () => {
            const id = "1";
            const error = new NotFoundException("Comentário não encontrado.");

            jest.spyOn(service, "remove").mockRejectedValue(error);

            await expect(controller.remove(id)).rejects.toThrow("Comentário não encontrado.");
        });

        it("Deve retornar erro se falhar", async () => {
            const id = "1";
            jest.spyOn(service, "remove").mockRejectedValue(new Error("Erro no service"));

            await expect(controller.remove(id)).rejects.toThrow("Erro no service");
        })
    })
})