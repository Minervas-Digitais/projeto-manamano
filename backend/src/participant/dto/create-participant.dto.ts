import { UserRole } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateParticipantDto {
  @IsString()
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  groupId?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  inviteCode: string;
}
