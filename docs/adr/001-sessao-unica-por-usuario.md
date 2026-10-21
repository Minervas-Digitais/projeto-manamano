# Sessão única por usuário

## Status

**Status atual:** Aceita

## Contexto

Cada usuário possui um único refresh token persistido (`User.refreshToken`). Como existe apenas um
campo por usuário, um novo login sobrescreve o token anterior e, com isso, a sessão que estava
ativa deixa de ser válida.

O aplicativo foi projetado exclusivamente para mobile e tem como público-alvo pessoas que
normalmente utilizam um único telefone. Não há previsão atual de suporte a outras plataformas nem
necessidade identificada de múltiplas sessões simultâneas.

## Decisão

Manter **uma única sessão ativa por usuário**. Um novo login invalida a sessão anterior de forma
deliberada. O modelo de dados atual, um refresh token por usuário, é suficiente e não será
alterado para suportar múltiplas sessões.

## Alternativas consideradas

- **Permitir múltiplas sessões simultâneas (um refresh token por dispositivo).** Exigiria uma nova
  entidade de sessão/token no banco, migração de schema e controle individual de revogação por
  dispositivo. Oferece mais conforto para quem usa vários aparelhos, mas adiciona complexidade de
  gerenciamento de sessões sem demanda atual do produto.

## Consequências

- A conta fica ativa em apenas um aparelho por vez, ao entrar em outro, a sessão anterior deixa de
  ser válida.
- A implementação permanece simples, sem tabela adicional de sessões, sem migração e sem lógica de
  revogação por dispositivo.
- Caso o produto passe a exigir múltiplos dispositivos ou outras plataformas, esta decisão deve ser
  reavaliada.
