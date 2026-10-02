import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { spawnSync } from 'child_process';
import { resolve } from 'path';

const REPO_ROOT = resolve(__dirname, '../../..');

export default async function globalSetup(): Promise<void> {
  let container: StartedPostgreSqlContainer;
  try {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
  } catch (error) {
    const detail = error instanceof Error ? ` (${error.message})` : '';
    throw new Error(
      `Não foi possível subir o PostgreSQL de teste. Os testes do backend exigem o Docker rodando${detail}`,
    );
  }

  process.env.DATABASE_URL = `${container.getConnectionUri()}?schema=public`;

  const migrate = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: REPO_ROOT,
    env: process.env,
    stdio: 'inherit',
  });

  if (migrate.status !== 0) {
    await container.stop();
    throw new Error('prisma migrate deploy falhou no banco de teste');
  }

  (globalThis as { __TESTCONTAINER__?: StartedPostgreSqlContainer }).__TESTCONTAINER__ = container;
}
