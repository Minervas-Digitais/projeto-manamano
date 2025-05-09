import { validate } from 'class-validator';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { plainToInstance } from 'class-transformer';

describe("CreateCommentDTO", () => {
    it("Força execução dos decoradores do DTO", () => {
        const dto = Object.assign(new CreateCommentDto(), {
            content: "Comment teste",
            userId: "usuario123",
            postId: "post123",
        });

        expect(dto).toBeDefined()
    });

    it("Deve validar um DTO válido", async () => {
        const dto = plainToInstance(CreateCommentDto, {
            content: "Comment teste",
            userId: "usuario123",
            postId: "post123",
        });

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
    });

    it("Deve retornar erro se os campos forem todos strings vazias", async () => {
        const dto = plainToInstance(CreateCommentDto, {
            content: "",
            userId: "",
            postId: "",
        });

        const erros = await validate(dto);

        expect(erros.length).toBeGreaterThan(0);
        const fieldWithErrors = erros.map(e => e.property);
        expect(fieldWithErrors).toContain("content");
        expect(fieldWithErrors).toContain("userId");
        expect(fieldWithErrors).toContain("postId");
    });
});