FROM node:20.14.0-alpine3.19

WORKDIR /app  

COPY package*.json ./  
COPY entrypoint.sh ./  

RUN npm install  

COPY . .

RUN chmod +x /app
RUN chmod +x /app/entrypoint.sh

RUN npx prisma generate --schema=/app/prisma/schema.prisma  

RUN npm run build

EXPOSE 3000

CMD ["/app/entrypoint.sh"]