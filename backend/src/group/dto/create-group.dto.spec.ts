import { CreateGroupDto } from './create-group.dto';
import { createGroupDto } from './create-group.dto.factory';
import { validate } from 'class-validator';


describe("CreateGroupDto", () => {
    it('força execução dos decorators do DTO', () => {
        const dto = Object.assign(new CreateGroupDto(), {
            name: 'Categoria Teste',
            inviteCode: '123',
            description: 'grupo teste',
        });

        expect(dto).toBeDefined()
    });

    it('deve passar a validação se os campos forem válidos', async () => {
        const dto: CreateGroupDto = createGroupDto();

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
    });

    it('nao deve passar a validação se o nome nao for válido', async () => {
        const dto = new CreateGroupDto();
        dto.name = '';


        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('name');
        expect(errors[0].constraints.isNotEmpty).toBe('name should not be empty');
    });

    it('deve falhar a validação se o campo "name" for nulo', async () => {
        const dto = new CreateGroupDto();
        dto.name = null;


        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('name');
        expect(errors[0].constraints.isNotEmpty).toBe('name should not be empty');
    });

    it('deve falhar a validação se "name" não for uma string', async () => {
        const dto = new CreateGroupDto();
        dto.name = 123 as any;


        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('name');
        expect(errors[0].constraints.isString).toBe('name must be a string');
    });

    it('deve passar a validação se os campos opcionais nao forem passados', async () => {
        const dto = new CreateGroupDto();
        dto.name = "grupo";
        dto.description = undefined;
        dto.inviteCode = undefined;

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
    });

})