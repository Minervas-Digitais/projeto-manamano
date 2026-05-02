ARG NODE_IMAGE=node:20.19.5-alpine3.21

FROM ${NODE_IMAGE} AS base

WORKDIR /app

COPY package*.json ./

FROM base AS deps-dev
RUN npm ci

FROM base AS deps-prod
RUN npm ci --omit=dev

FROM deps-dev AS build
COPY . .
RUN npx prisma generate --schema=/app/prisma/schema.prisma
RUN npm run build
RUN node verifyPrisma.js

FROM ${NODE_IMAGE} AS runtime-prod

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/entrypoint.sh ./entrypoint.sh

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
CMD ["/app/entrypoint.sh"]

FROM ${NODE_IMAGE} AS runtime-dev

WORKDIR /app
ENV NODE_ENV=development

COPY --from=deps-dev /app/node_modules ./node_modules
COPY . .

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
CMD ["/app/entrypoint.sh"]