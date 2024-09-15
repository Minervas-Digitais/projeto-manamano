import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  hash: string;

  @IsDateString()
  @IsOptional()
  birthday: string;

  @IsString()
  @IsOptional()
  ethnicity: string;

  @IsString()
  @IsOptional()
  neighborhood: string;

  @IsString()
  @IsOptional()
  expertise: string;

  @IsString()
  @IsOptional()
  enterprise: string;

  @IsString()
  @IsOptional()
  bio: string;

  @IsArray()
  @IsOptional()
  savedPost: string[];
}
