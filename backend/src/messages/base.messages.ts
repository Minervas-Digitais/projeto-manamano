export const BASE_MESSAGES = {
  NOT_FOUND: 'Registro não encontrado.',
  USER_NOT_FOUND: 'Usuário não encontrado.',
  GROUP_NOT_FOUND: 'Grupo não encontrado.',
  UNAUTHORIZED_ACCESS: 'Você não tem permissão para acessar este recurso.',
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
  DELETE_SUCCESS: 'Registro deletado com sucesso.',
  EMPTY_LIST: 'Nenhum registro encontrado.',
  SUCCESS: 'Operação realizada com sucesso',
  EXCEEDED_LIMIT: (maxLimit: number) => `O limite máximo de grupos por página é ${maxLimit}.`,
};
