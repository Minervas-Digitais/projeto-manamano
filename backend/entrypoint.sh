#!/bin/sh  
npx prisma migrate deploy --schema=/usr/src/app/prisma/schema.prisma  
npx prisma generate --schema=/usr/src/app/prisma/schema.prisma  
npx prisma migrate dev --name init --schema=/usr/src/app/prisma/schema.prisma
exec "$@"