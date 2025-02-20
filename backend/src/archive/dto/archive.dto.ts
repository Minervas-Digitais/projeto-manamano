import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateArchiveDto {
  @IsString()
  name: string;

  @IsString()
  mimeType: string;

  @IsString()
  contentBase64: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  userId?: number;

  @IsOptional()
  @IsString()
  groupId?: number;

}

export class ResponseArchiveDto {
  id: string;
  name: string;
  mimeType: string;
  type: string;
  userId?: number;
  groupId?: number;
}

