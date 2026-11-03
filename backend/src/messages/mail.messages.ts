import { BASE_MESSAGES } from './base.messages';

export const MAIL_MESSAGES = {
  ...BASE_MESSAGES,
  SEND_SUCCESS: 'E-mail enviado com sucesso.',
  SEND_FAILURE: 'Falha ao enviar e-mail.',
  PASSWORD_RESET_SUBJECT: 'ManaMano - Código para redefinir sua senha',
  PASSWORD_RESET_TEXT: (fullName: string, code: string, ttlMinutes: number) =>
    `Olá, ${fullName}!\n\n` +
    `Recebemos uma solicitação para redefinir a senha da sua conta no ManaMano.\n\n` +
    `Seu código de verificação: ${code}\n\n` +
    `O código é válido por ${ttlMinutes} minutos e só pode ser usado uma vez.\n` +
    `Se você não solicitou a redefinição, ignore este e-mail: sua senha continua a mesma.`,
  PASSWORD_CHANGED_SUBJECT: 'ManaMano - Sua senha foi alterada',
  PASSWORD_CHANGED_TEXT: (fullName: string, changedAt: string) =>
    `Olá, ${fullName}!\n\n` +
    `A senha da sua conta no ManaMano foi alterada em ${changedAt} (horário de Brasília).\n\n` +
    `Se você não realizou esta alteração, entre em contato conosco imediatamente.`,
};
