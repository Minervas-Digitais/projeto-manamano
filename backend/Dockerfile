ARG NODE_IMAGE=node:24-alpine

FROM ${NODE_IMAGE} AS base

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

FROM base AS deps-dev
RUN npm ci -w backend --ignore-scripts
RUN npm rebuild bcrypt

FROM base AS deps-prod
RUN npm ci -w backend --omit=dev --ignore-scripts
RUN npm rebuild bcrypt

FROM deps-dev AS build
COPY backend ./backend
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
RUN npx prisma generate --schema=/app/backend/prisma/schema.prisma
RUN npm run build -w backend
RUN node backend/verifyPrisma.js

FROM ${NODE_IMAGE} AS runtime-prod

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/backend ./backend

RUN chmod +x /app/backend/entrypoint.sh

EXPOSE 3000
CMD ["/app/backend/entrypoint.sh"]

FROM ${NODE_IMAGE} AS runtime-dev

WORKDIR /app
ENV NODE_ENV=development

COPY --from=deps-dev /app/node_modules ./node_modules
COPY . .

RUN chmod +x /app/backend/entrypoint.sh

EXPOSE 3000
CMD ["/app/backend/entrypoint.sh"]
