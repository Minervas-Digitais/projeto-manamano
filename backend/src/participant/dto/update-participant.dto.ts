import { IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateParticipantRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
