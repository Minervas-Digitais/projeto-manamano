# Plataforma ManaMano | Minerv@s Digitais

## Sobre o projeto

A plataforma ManaMano é um aplicativo com o objetivo de criar um espaço de interação entre as participantes do projeto, disponibilizando materiais, avisos e conteúdos de aulas, além de estimular a troca de informações e a parceria entre as empreendedoras, beneficiando dessa forma o controle e organização do projeto, auxiliando no fomento do empreendedorismo para mulheres da periferia da cidade do Rio de Janeiro.

🚧 Em desenvolvimento ⚠️

## Tabela de Conteúdo

1.  [Tecnologias](#tecnologias)
2.  [Instalação Rápida](#instalação-rápida)
3.  [Configuração](#configuração)
4.  [Referências](#referências)
5.  [Autores](#autores)

## Tecnologias

### Frontend (Mobile)

- React Native
- Expo
- Axios
- Jest

### Backend

- NestJS
- Prisma
- PostgreSQL
- Jest

### Infraestrutura e ferramentas

- Docker
- Node.js
- npm

## Instalação Rápida

A utilização do Docker é o método recomendado para rodar o projeto localmente.

O aplicativo mobile utilizará o build previamente feito via EAS Build, localizado em projeto-manamano/nginx/downloads/app.apk.

Uma versão alternativa (sem Docker) pode ser encontrada em `docs/setup.md`.

### 1. Pré-requisitos

Antes de começar, você precisa ter instalado:

- Docker
- Docker Compose
- Node.js

---

### 2. Clonar o repositório

```bash
git clone https://github.com/Minervas-Digitais/projeto-manamano
cd projeto-manamano
```

### 3. Configurar as variáveis de ambiente

Esse passo pode ser encontrado na seção de [Configuração](#configuração).

### 4. Subir a aplicação

```bash
docker compose up -d --build
```

Isso irá iniciar:

- Backend
- Banco de dados
- Nginx (servindo o APK do aplicativo)

### 5. Instalando o Aplicativo

A versão estável do aplicativo pode ser baixada no ambiente local via Nginx:

    http://localhost/downloads/app.apk

## Configuração

O projeto possui múltiplos arquivos de variáveis de ambiente:

- Backend: `backend/.env`
- Frontend: `frontend/.env`
- Infraestrutura: `.env` na raiz do projeto

Todos os arquivos possuem um template `.env.example` correspondente.

---

### 1. Criar arquivos de ambiente

Backend:

```bash
cp backend/.env.example backend/.env
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

Raiz:

```bash
cp .env.example .env
```

### 2. Preencher variáveis

Preencha os arquivos `.env` com os valores necessários do projeto.

Principais variáveis incluem:

- Banco de dados
- JWT_SECRET
- URLs de API
- Configurações do Expo / Firebase

---

## Referências

- [Modelagem de Banco de Dados](https://dbdiagram.io/d/ManaMano-662d95cc5b24a634d0f9435d)
- [Figma](https://www.figma.com/file/t4tv9EeZ05TVOhoOTgfilu/ManaMano?type=design&node-id=0-1&mode=design&t=7CUX4uZnfGKbV4zh-0)

## Autores

| Nome              | Período de Atuação  |
| ----------------- | ------------------- |
| Pedro Ormesino    | 07/08/23 ~ agora    |
| Rayane Domingos   | 07/08/23 ~ agora    |
| Mellanie Pereira  | 25/09/23 ~ 03/06/24 |
| Nicolas Bastos    | 11/04/24 ~ agora    |
| Guilherme de Luna | 29/08/24 ~ agora    |
| Tales Moreira     | 16/09/24 ~ agora    |
| Jhonata Monteiro  | 18/04/25 ~ agora    |
