# Development Guide

A ideia desse arquivo é servir como "entry point" e “guia de uso contínuo” para os novos membros do projeto.

## Padrões do projeto

As regras de desenvolvimento, qualidade de código e fluxo de trabalho estão centralizadas nos seguintes documentos:

- [Padrões do Projeto](./standards.md)
- [Pull Requests](./pull-request.md)

Sempre consulte esses arquivos antes de abrir um PR ou implementar uma nova feature.

---

## Comandos Recorrentes

Essa seção vai conter alguns codigos que normalmente vao ser muito usados durante o desenvolvimento, servindo como um guia inicial de consulta. Vale notar que muitos dos comandos podem ser consultados nos arquivos `package.json`.

### frontend

```bash
cd frontend
npm run test
```

### backend

```
cd backend
npm run test
```

### Antes de abrir PR

- garantir que testes passam
- não quebrar testes existentes
- adicionar testes quando fizer sentido

### Lint e formatação

```bash
npm run lint
```

Corrigir automaticamente

```bash
npm run lint:fix
```

Formatação

```bash
npm run format
```

---

## Banco de dados (Docker)

O PostgreSQL roda via Docker. Por isso é importante verificar se ele está rodando antes de iniciar o backend.

Para iniciar o container em segundo plano:

```bash
docker compose up -d postgres_db
```

Parar:

```bash
docker compose down
```

---

## Migrations e schema do banco

O projeto utiliza migrations para versionamento do banco de dados.

Sempre que houver alterações no schema, siga o fluxo abaixo.

### Aplicar migrations existentes

```bash
npx prisma migrate deploy
```

Use quando alterar o schema.prisma:

```bash
npx prisma migrate dev --name nome_da_migration
```

Sempre que o schema for alterado, gere o client:

```bash
npx prisma generate
```

### Reset do banco

Isso ajuda quando o Prisma ou migrations ficam inconsistentes:

```bash
npx prisma migrate reset
```

### Populando o banco

O projeto possui um script para popular o banco com dados iniciais, úteis para testes e desenvolvimento.

```bash
npm run seed
```
