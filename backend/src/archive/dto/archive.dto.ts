import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateArchiveDto {
  @IsString() name: string;
  @IsString() mimeType: string;
  @IsString() contentBase64: string;
  @IsString() type: string;
  @IsOptional() @IsNumber() userId?: number;
  @IsOptional() @IsNumber() groupId?: number;
  @IsOptional() @IsNumber() publicationId?: number;
}
