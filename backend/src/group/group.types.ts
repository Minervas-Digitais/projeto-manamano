import { Group } from '@prisma/client';

/**
 * Projeção pública de um grupo: não expõe o código de convite, que só deve ser
 * visível para membros do grupo e administradores.
 */
export type GroupPublic = Omit<Group, 'inviteCode'>;

/**
 * Grupo com os dados do convite ativo derivados da tabela Invite.
 * `inviteCode` continua presente para não quebrar o contrato atual do frontend.
 */
export type GroupWithInvite = Omit<Group, 'inviteCode'> & {
  inviteCode: string | null;
  inviteExpiresAt: Date | null;
};
