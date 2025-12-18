import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateArchiveDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsString()
  @IsNotEmpty()
  contentBase64: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  postId?: string;
}

export class ResponseArchiveDto {
  id: string;
  name: string;
  mimeType: string;
  type: string;
  userId?: string;
  groupId?: string;
  contentBase64: string;
  postId: string;
}
