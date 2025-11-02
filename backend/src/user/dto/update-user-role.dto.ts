import { IsEnum, IsNotEmpty } from 'class-validator';
import { RoleType } from '@prisma/client';

export class UpdateUserRoleDto {
  @IsEnum(RoleType, {
    message: 'Role must be one of ADMIN, MODERATOR, or MEMBER.',
  })
  @IsNotEmpty()
  sysRole: RoleType;
}
