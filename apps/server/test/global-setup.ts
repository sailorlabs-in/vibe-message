import { createTestDatabase } from './test-db';

export default async function globalSetup() {
  await createTestDatabase();
}

