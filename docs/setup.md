# Setup

Este documento descreve como rodar o projeto localmente sem utilizar o fluxo completo via Docker.

---

## Pré-requisitos

Antes de começar, você precisa ter instalado:

- Node.js, a versão usada pelo projeto está fixada no `.nvmrc` na raiz, gerenciada com [nvm](https://github.com/nvm-sh/nvm#readme). Se você ainda não tem o nvm, siga os passos de instalação no README do repositório oficial dele (é um script de uma linha). Depois de instalado, na raiz do projeto:

  ```bash
  nvm install   # baixa a versão do .nvmrc (só na primeira vez)
  nvm use       # ativa a versão do projeto
  ```

- npm (instalado junto com o Node)
- Docker e Docker Compose
- Android Studio
- Expo CLI

---

## Tabela de Conteúdo

1. [Hooks do git (passo obrigatório)](#hooks-do-git)
2. [Backend](#backend-setup)
3. [Frontend](#frontend-setup)

---

# Hooks do git

O projeto usa Husky + lint-staged para rodar lint e formatação automaticamente a cada commit.

Na raiz do projeto, execute:

```bash
npm install
```

Esse passo instala, de uma vez, as dependências de todo o monorepo (raiz, backend e frontend — o projeto usa npm workspaces) e ativa os hooks do git. Sem ele, commits com erro de formatação passam localmente e quebram o Format Check no CI.

Para confirmar que está ativo:

```bash
git config core.hooksPath
```

O retorno esperado é `.husky/_`. Se vier vazio, rode `npx husky` na raiz.

---

# Backend Setup

## 1. Subir banco de dados

O backend utiliza PostgreSQL via Docker.

O `docker-compose.yaml` lê as variáveis de conexão do arquivo `.env` na raiz do projeto. Se ele não existir (ou `POSTGRES_DB` estiver vazio), o container do banco não fica saudável e não será possível conectar.

Na raiz do projeto, crie o arquivo (caso ainda não exista) e preencha as variáveis do PostgreSQL:

```bash
cp .env.example .env
```

Preencha `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`

Depois, suba apenas o banco:

```bash
docker compose up -d postgres_db
```

Confirme que ele subiu antes de seguir:

```bash
docker compose ps
```

O serviço `postgres_db` deve aparecer com status `healthy`.

## 2. Configurar variáveis de ambiente

O backend carrega o `.env` da raiz do projeto (criado no passo 1). Nenhuma ação extra aqui, cada variável está documentada com comentário no `.env.example`.

## 3. Instalar dependências

```bash
npm install
```

Com npm workspaces, esse comando instala, de uma vez, as dependências de todo o monorepo.

## 4. Rodar migrations

Na pasta `backend/`:

```bash
npm run prisma:deploy
```

## 5. Iniciar backend

Também na pasta `backend/`:

```bash
npm run start:dev
```

O backend ficará disponível em:

```text
http://localhost:3000
```

---

# Frontend Setup

O frontend utiliza React Native com Expo.

O aplicativo pode ser executado diretamente no Android Emulator ou através de builds Android utilizando EAS Build.

## 1. Configurar variáveis de ambiente

O frontend utiliza o `.env` da raiz lendo `EXPO_PUBLIC_API_URL` dele. Garanta que essa variável esteja preenchida.

## 2. Instalar dependências

```bash
npm install
```

Com npm workspaces, esse comando instala, de uma vez, as dependências de todo o monorepo (vale também se rodado na raiz).

## 3. Sincronizar código nativo

O projeto utiliza `expo prebuild` para sincronizar alterações do Expo com o código nativo Android.

Esse comando normalmente só é necessário quando:

- Dependências nativas forem adicionadas/removidas
- Configurações nativas forem alteradas
- Plugins do Expo forem modificados
- O diretório `android/` precisar ser recriado

```bash
npx expo prebuild
```

## 4. Configurar Android Studio

Para rodar o aplicativo localmente é necessário possuir um Android Emulator configurado no Android Studio.

---

# Rodar aplicação localmente

Para iniciar o aplicativo no emulador Android:

```bash
npm run android
```

Veja se o expo está no modo desenvolvimento.

Na tela do Metro Bundler, pressione:

```text
a
```

para abrir o aplicativo no Android Emulator.

---

# Build Android

O projeto utiliza EAS Build para geração dos APKs Android.

## EAS Build

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login no Expo

```bash
eas login
```

### 3. Build de Preview

Build utilizada para testes internos.

```bash
eas build --platform android --profile preview
```

---

## Script de Build

Existe um script localizado em:

```text
frontend/scripts/build.sh
```

Esse script é responsável por:

- Gerar o build Android
- Integrar com o sistema de versionamento do backend
- Baixar automaticamente o APK
- Alocar o APK no diretório utilizado pelo nginx

---

## Build Local

Para propósitos de teste, existe um comando para realizar build local sem depender da cloud do EAS.

```bash
npm run build:android:test
```

O APK será gerado em:

```text
frontend/android/app/build/outputs/apk/release/app-release.apk
```

---

# Servindo APK localmente

Os APKs gerados podem ser colocados em:

```text
nginx/downloads/
```

Para disponibilizar o APK localmente:

```bash
docker compose up -d nginx
```

O APK ficará disponível em:

```text
http://localhost/downloads/app.apk
```
