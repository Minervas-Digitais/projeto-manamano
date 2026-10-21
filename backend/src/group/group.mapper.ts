/* eslint-disable @typescript-eslint/no-unused-vars */
import { Group } from '@prisma/client';
import { GroupPublic } from './group.types';

/**
 * Remove o código de convite de um grupo antes de expô-lo a quem não é membro
 * nem administrador.
 */
export function toPublicGroup(group: Group): GroupPublic {
  const { inviteCode, ...publicGroup } = group;
  return publicGroup;
}
