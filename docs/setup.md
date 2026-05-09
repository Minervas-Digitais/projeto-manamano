# Setup

Este documento descreve como rodar o projeto localmente sem utilizar o fluxo completo via Docker.

---

## Pré-requisitos

Antes de começar, você precisa ter instalado:

- Node.js
- npm
- Docker
- Android Studio
- Expo CLI

---

## Tabela de Conteúdo

1. [Backend](#backend-setup)
2. [Frontend](#frontend-setup)

---

# Backend Setup

## 1. Subir banco de dados

O backend utiliza PostgreSQL via Docker.

Na raiz do projeto, execute:

```bash
docker compose up -d postgres_db
```

---

## 2. Configurar variáveis de ambiente

Entre na pasta do backend:

```bash
cd backend
```

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

Preencha as variáveis necessárias do projeto.

---

## 3. Instalar dependências

```bash
npm install
```

---

## 4. Rodar migrations

```bash
npx prisma migrate deploy
```

---

## 5. Iniciar backend

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

---

## 1. Configurar variáveis de ambiente

Entre na pasta do frontend:

```bash
cd frontend
```

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

Preencha as variáveis necessárias do projeto.

---

## 2. Instalar dependências

```bash
npm install
```

---

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

---

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

---

## EAS Build

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

---

### 2. Login no Expo

```bash
eas login
```

---

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
