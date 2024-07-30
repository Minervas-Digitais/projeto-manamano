import { IsNotEmpty, IsString } from 'class-validator';

export class CreateParticipantDto {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  groupId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
