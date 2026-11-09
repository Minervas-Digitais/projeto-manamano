import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class VerifyResetCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'O código deve ter exatamente 6 dígitos numéricos.' })
  code: string;
}
