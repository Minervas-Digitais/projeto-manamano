import { IsDateString, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  fullName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  password: string;

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
}
