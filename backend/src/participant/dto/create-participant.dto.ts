import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateParticipantDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]{8}$/, {
    message: 'inviteCode deve ter 8 caracteres alfanuméricos.',
  })
  inviteCode: string;
}
