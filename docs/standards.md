# Padrões do Projeto

Este documento define os padrões de desenvolvimento utilizados no projeto ManaMano, visando garantir consistência no código, facilitar revisões e melhorar a colaboração entre os desenvolvedores.

---

## Pull Requests

A estrutura e regras de Pull Requests estão definidas em um documento separado que pode ser acessado [aqui](./pull_request.md).

---

## Padrão de Branches

As branches devem seguir o padrão:

    TIPO/AREA/DESCRICAO

### Tipos válidos

- `feature`  
  Desenvolvimento de novas funcionalidades.

- `fix`  
  Correção de bugs ou problemas existentes.

- `refactor`  
  Refatoração de código sem alteração de comportamento esperado.

- `docs`  
  Alterações relacionadas à documentação do projeto.

- `test`  
  Criação ou alteração de testes automatizados.

- `chore`  
  Alterações de manutenção, configuração ou infraestrutura do projeto sem impacto direto em funcionalidades.

---

### Áreas válidas

- `front`  
  Alterações relacionadas ao frontend/mobile.

- `back`  
  Alterações relacionadas ao backend/API.

- `full`  
  Alterações que envolvem frontend e backend simultaneamente.

### Exemplos

    fix/back/login-not-working-for-admin
    refactor/front/saved-posts-pagination
    feature/front/push-notifications
    docs/changelog-update
    chore/back/improve-dockerfile-cache

### Regras

- Branches devem ser criadas a partir de `develop`
- Não é permitido commitar diretamente em `main`
- Branches devem ser removidas após merge

---

## Code Style

O projeto utiliza:

- ESLint para padronização e qualidade de código
- Prettier para formatação automática

### Regras obrigatórias

- Todo código deve ser formatado antes do commit
- Não abrir PRs com erros de lint
- Manter consistência com o padrão do projeto

No documento de desenvolvimento para novos membros, [development.md](./development.md), estão disponíveis comandos e instruções úteis para essas tarefas.

---

## Padrão de Testes

O projeto utiliza Jest no backend e frontend.

### Regras

- Novas features devem incluir testes quando possível
- Não abrir PRs com testes quebrando
- Testes devem ser executados localmente antes da abertura do PR

---

## Regras de Qualidade

É responsabilidade de todos os desenvolvedores manter a qualidade do código e reportar problemas encontrados.

Não é permitido:

- Subir arquivos `.env`
- Commits com código comentado desnecessário
- Uso de `console.log` em produção
- Código não relacionado ao escopo do PR
- Exposição de dados sensíveis no repositório

---

## Fluxo de Trabalho

1. Criar branch a partir de `develop`
2. Implementar feature ou correção
3. Rodar testes localmente
4. Garantir lint/format sem erros
5. Abrir Pull Request para `develop`
6. Realizar ajustes solicitados durante a revisão
7. Merge após aprovação
8. Remover branch após merge
