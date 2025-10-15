import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsOptional()
  fullName?: string;

  @IsNotEmpty()
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsOptional()
  birthday?: string;

  @IsString()
  @IsOptional()
  ethnicity?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  expertise?: string;

  @IsString()
  @IsOptional()
  enterprise?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  //   @IsArray()
  //   @IsOptional()
  //   savedPost: string[];
}
