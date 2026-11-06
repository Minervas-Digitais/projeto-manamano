import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Token de redefinição obrigatório.' })
  resetToken: string;

  @IsString()
  @MinLength(8, { message: 'A nova senha deve ter no mínimo 8 caracteres.' })
  @MaxLength(72, { message: 'A nova senha deve ter no máximo 72 caracteres.' })
  newPassword: string;
}
