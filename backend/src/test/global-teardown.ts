import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export default async function globalTeardown(): Promise<void> {
  const container = (globalThis as { __TESTCONTAINER__?: StartedPostgreSqlContainer })
    .__TESTCONTAINER__;

  if (container) {
    await container.stop();
  }
}
