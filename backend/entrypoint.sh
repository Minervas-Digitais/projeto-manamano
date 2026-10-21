#!/bin/sh
# Ponto de entrada do container do backend
# aplica as migrações do Prisma antes de subir a API, conforme APP_ENV
set -e

cd /app/backend

APP_ENV=${APP_ENV:-production}

if [ "$APP_ENV" = "development" ]; then
	npx prisma generate --schema=/app/backend/prisma/schema.prisma
	npx prisma migrate dev --schema=/app/backend/prisma/schema.prisma
	exec npm run start:dev
fi

npx prisma migrate deploy --schema=/app/backend/prisma/schema.prisma
exec npm run start:prod