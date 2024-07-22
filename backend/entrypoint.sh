#!/bin/sh  
npx prisma migrate deploy --schema=/app/prisma/schema.prisma  
npx prisma generate --schema=/app/prisma/schema.prisma  
npx prisma migrate dev --name init --schema=/app/prisma/schema.prisma
exec "$@"