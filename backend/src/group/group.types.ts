import { Group } from '@prisma/client';

/**
 * Projeção pública de um grupo: não expõe o código de convite, que só deve ser
 * visível para membros do grupo e administradores.
 */
export type GroupPublic = Omit<Group, 'inviteCode'>;
