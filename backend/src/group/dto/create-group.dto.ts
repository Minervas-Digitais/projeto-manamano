import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // Aceito apenas por compatibilidade com clientes antigos; o servidor ignora
  // e sempre gera o código na tabela Invite.
  @IsString()
  @IsOptional()
  inviteCode: string;

  @IsString()
  @IsOptional()
  description: string;
}
