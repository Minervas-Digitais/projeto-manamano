import { UpdateCategoryDto } from './update-category.dto';
import { PostType } from '@prisma/client';

export const updateCategoryDto = (overrides: Partial<UpdateCategoryDto> = {}): UpdateCategoryDto => {
  return {
    name: 'Categoria Atualizada', 
    type: PostType.NORMAL,         
    groupId: 'grupo123',         
    ...overrides,               
  };
};
