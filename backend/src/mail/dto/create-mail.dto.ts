import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMailDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
