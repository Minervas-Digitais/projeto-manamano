import './backend/src/load-env';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'backend/prisma/schema.prisma',
});
