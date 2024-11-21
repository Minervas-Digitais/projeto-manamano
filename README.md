# Plataforma ManaMano | Minerv@s Digitais

![React Native Badge](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo Badge](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=fff&style=for-the-badge)
![styled-components Badge](https://img.shields.io/badge/styled--components-DB7093?logo=styledcomponents&logoColor=fff&style=for-the-badge)
![Axios Badge](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=fff&style=for-the-badge)
![React Hook Form Badge](https://img.shields.io/badge/React%20Hook%20Form-EC5990?logo=reacthookform&logoColor=fff&style=for-the-badge)


![Node.js Badge](https://img.shields.io/badge/Node.js-5FA04E?logo=nodedotjs&logoColor=fff&style=for-the-badge)
![NestJS Badge](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=fff&style=for-the-badge)
![Prisma Badge](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=fff&style=for-the-badge)
![Express Badge](https://img.shields.io/badge/Express-000?logo=express&logoColor=fff&style=for-the-badge)
![JSON Web Tokens Badge](https://img.shields.io/badge/JSON%20Web%20Tokens-000?logo=jsonwebtokens&logoColor=fff&style=for-the-badge)

![Docker Badge](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff&style=for-the-badge)
![PostgreSQL Badge](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff&style=for-the-badge)
![npm Badge](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=fff&style=for-the-badge)
![Yarn Badge](https://img.shields.io/badge/Yarn-2C8EBB?logo=yarn&logoColor=fff&style=for-the-badge)
![ESLint Badge](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=fff&style=for-the-badge)


A plataforma ManaMano é um aplicativo com o objetivo de criar um espaço de interação entre as participantes do projeto, disponibilizando materiais, avisos e conteúdos de aulas, além de estimular a troca de informações e a parceria entre as empreendedoras, beneficiando dessa forma o controle e organização do projeto, auxiliando no fomento do empreendedorismo para mulheres da periferia da cidade do Rio de Janeiro.
 
🚧 Em desenvolvimento ⚠️
 
## Tabela de Conteúdo

 1. [Tecnologias Utilizadas](#tecnologias-utilizadas)
 2. [Instalação](#instalação)
 3. [Configuração](#configuração)
 4. [Uso](#uso)
 5. [Referências](#referências)
 6. [Autores](#autores)
 
## Tecnologias Utilizadas

Essas são as frameworks e ferramentas que você precisará instalar previamente ao uso do projeto ou colaboração:

- [Docker CLI](https://docs.docker.com/engine/install/) (ou [Desktop](https://docs.docker.com/desktop/install/windows-install/))
- [Node.js v20.18.0](https://nodejs.org/en/download/package-manager)
- [Yarn](https://yarnpkg.com/getting-started/install)


## Instalação 

Como utilizamos o Docker para conteinerizar a aplicação do back-end, não é necessário que sejam instaladas as tecnologias previamente, bastando que tenha instalado o Docker CLI para a subida da aplicação e do banco de dados.

Já para o front-end, basta executar o seguinte comando dentro da pasta `frontend` para instalar as dependências necessárias:

``` bash
yarn install
```

## Configuração

Para configurar o projeto antes do uso, basta abrir o terminal e estar já em sua pasta, executando os seguintes comandos em seguida:

``` bash
# Arquivo .env com base no template
cp .env.example .env
```
``` bash
# Permissão de escrita para o script
chmod +x backend/entrypoint.sh
```

``` bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Após esse último comando, você deve copiar o resultado obtido para o campo `JWT_SECRET` no arquivo `.env`, além de preencher os demais campos com os valores esperados do projeto. 
 
## Uso

Possuindo o Docker CLI instalado em sua máquina, basta executar o seguinte comando para subir a aplicação do back-end junto com o banco de dados: 

``` bash
docker compose up -d --build
```
Já para a aplicação do front-end, será necessário instalar as suas tecnologias correspondentes, subindo a aplicação com os seguintes comandos: 

``` bash
yarn start
```
## Referências

- [Modelagem de Banco de Dados](https://dbdiagram.io/d/ManaMano-662d95cc5b24a634d0f9435d)
- [Figma](https://www.figma.com/file/t4tv9EeZ05TVOhoOTgfilu/ManaMano?type=design&node-id=0-1&mode=design&t=7CUX4uZnfGKbV4zh-0)


## Autores

| Nome  | Período de Atuação |
| ------------- | ------------- |
| Pedro Ormesino  | 07/08/23 ~ agora |
| Rayane Domingos  | 07/08/23 ~ agora |
| Mellanie Pereira  | 25/09/23 ~ 03/06/24 |
| Nicolas Bastos  | 11/04/24 ~ agora |
| Guilherme de Luna  | 29/08/24 ~ agora |
| Tales Moreira  | 16/09/24 ~ agora |