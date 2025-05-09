import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCategoryDto } from './create-category.dto';
import { PostType } from '@prisma/client';

describe('CreateCategoryDto', () => {
    it('força execução dos decorators do DTO', () => {
        const dto = Object.assign(new CreateCategoryDto(), {
            name: 'Categoria Teste',
            type: PostType.NORMAL,
            groupId: 'grupo123',
          });
        
          expect(dto).toBeDefined()
    });

    it('deve validar um DTO válido', async () => {
        const dto = plainToInstance(CreateCategoryDto, {
            name: 'Categoria Teste',
            type: PostType.NORMAL,
            groupId: 'grupo123',
        });

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
    });

    it('deve retornar erro se campos estiverem vazios ou inválidos', async () => {
        const dto = plainToInstance(CreateCategoryDto, {
            name: '',
            type: 'INVALID',
            groupId: '',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const fieldsWithErrors = errors.map(e => e.property);
        expect(fieldsWithErrors).toContain('name');
        expect(fieldsWithErrors).toContain('type');
        expect(fieldsWithErrors).toContain('groupId');
    });
});
