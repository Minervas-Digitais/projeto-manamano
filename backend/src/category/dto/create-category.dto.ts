import { PostType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(PostType)
  type: PostType;

  @IsString()
  @IsNotEmpty()
  groupId: string;
}
