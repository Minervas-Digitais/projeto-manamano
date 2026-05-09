# Pull Requests

## Objetivo

O objetivo deste documento é padronizar a criação de Pull Requests no repositório.

PRs devem ser:

- Pequenos e revisáveis
- Focados em um único escopo
- Fáceis de entender
- Bem documentados

---

## Estrutura do Pull Request

### Título

O título do PR deve ser descritivo. Seguindo o padrao:

    [TIPO] Descrição curta

Se não for possível seguir esse padrão, utilize o título da task no Trello.

#### Exemplos

    [FEAT] integração de push notifications
    [FIX] correção da persistência de login
    [REFACTOR] separação do auth service
    [DOC] atualização do changelog

#### Evitar

Titulos vagos, como:

    [FIX]
    bug fix
    ajustes no código
    melhorias
    atualização
    coisas do login
    arrumei um problema
    mudanças na API
    ajustes finais
    tentativa de corrigir erro

---

### Descrição

Todo Pull Request deve possuir uma descrição, feita em bullet points, contendo:

- O que foi feito
- Problemas encontrados

#### Exemplo

    ## O que foi feito

    - Adicionado registro de push token
    - Criado serviço de envio de notificações
    - Ajustado fluxo de login

    ## Problemas encontrados

    - Push notification não funciona em emulator Android
    - Necessário HTTPS para produção

---

### Testes realizados

Todo PR deve informar brevemente quais testes foram realizados.

Exemplos:

- Testado no emulador
- Testado criação de grupos
- Não foi possível testar push notification em produção

Caso nenhuma validação tenha sido realizada, isso deve ser informado explicitamente no PR.

### Contexto

Informações adicionais que ajudem na compreensão do PR (opcional).

## Tamanho dos PRs

PRs devem possuir escopo reduzido e revisável.

Evitar:

- Múltiplas features no mesmo PR
- Refactors gigantes sem separação
- Alterações sem relação entre si
- PRs extremamente grandes

Sempre que possível:

- Separar refactor de feature
- Separar backend/frontend
- Criar PRs incrementais

---

## Antes de abrir um PR

Verifique:

- Se o código foi testado localmente
- Se não existem logs/debug desnecessários
- Se não existem arquivos não relacionados
- Se o PR possui escopo único

---

## Revisão de código

O review existe para:

- Garantir qualidade
- Compartilhar conhecimento
- Detectar problemas cedo
- Melhorar consistência do projeto

Feedbacks devem ser objetivos e técnicos.

---

## Observações

**Branches devem ser removidas após merge.**
