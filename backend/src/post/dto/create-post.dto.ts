import { IsDateString, IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';
import { PostType } from 'utils/PostType';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @Validate(PostType)
  type: string;

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
  urlRecorded: string
}
