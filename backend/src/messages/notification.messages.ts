import { UnauthorizedException } from "@nestjs/common";

export const NOTIFICATION_MESSAGES = {
  SENDER_NOT_FOUND: 'Remetente não encontrado.',
  RECIPIENT_NOT_FOUND: 'Destinatário não encontrado.',
  RECIPIENT_EMPTY: 'Destinatário não encontrado.',
  USER_NOT_FOUND: 'Usuário não encontrado.',
  NOT_FOUND: 'Notificação não encontrada.',
  NO_PARTICIPANTS: 'Não há participantes neste grupo para notificar.',
  NO_RECIPIENTS_GLOBAL:
    'Não há usuários destinatários para notificação global.',
  NO_PUSH_TOKEN: 'Usuário não possui push token registrado.',
  INVALID_PUSH_TOKEN: 'Push token inválido.',
  NO_SETTINGS_TO_UPDATE: 'Nenhuma configuração para atualizar.',
  UNAUTHORIZED_WARNING_CALL:
    'Apenas ADMIN podem criar notificações do tipo WARNING',
  UNAUTHORIZED_NOTIF_UPDATE: 'Você não pode modificar essa notificação',
};
