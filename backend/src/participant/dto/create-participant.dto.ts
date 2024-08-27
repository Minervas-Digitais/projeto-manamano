import { RoleType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateParticipantDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(RoleType)
  role: RoleType;

  @IsString()
  @IsNotEmpty()
  groupId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
