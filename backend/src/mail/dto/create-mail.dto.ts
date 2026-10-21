import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMailDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  text: string;
}
