#!/bin/sh
set -e

APP_ENV=${APP_ENV:-production}

if [ "$APP_ENV" = "development" ]; then
	npx prisma generate --schema=/app/prisma/schema.prisma
	npx prisma migrate dev --name init --schema=/app/prisma/schema.prisma
	exec npm run start:dev
fi

npx prisma migrate deploy --schema=/app/prisma/schema.prisma
exec npm run start:prod