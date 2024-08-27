import { PostType } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(PostType)
  type: PostType;

  @IsString()
  @IsNotEmpty()
  input: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsDateString()
  @IsOptional()
  schedule: string;

  @IsString()
  @IsOptional()
  urlLive: string;

  @IsString()
  @IsOptional()
  urlRecorded: string;

  @IsBoolean()
  @IsOptional()
  isPinned: boolean;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  groupId: string;
}
