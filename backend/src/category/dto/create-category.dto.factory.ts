import { PostType } from '@prisma/client';
import { CreateCategoryDto } from './create-category.dto';

export function createCategoryDto(overrides?: Partial<CreateCategoryDto>): CreateCategoryDto {
  return {
    name: 'Grupo Padrão',
    type: PostType.NORMAL,
    groupId: '123',
    ...overrides,
  };
}
