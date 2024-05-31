FROM node:20.14.0-alpine3.19

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run prisma:generate

EXPOSE 3000
 
CMD [ "node", "dist/main.js" ]