import { Client } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Ensure .env is loaded
dotenv.config();
dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(process.cwd(), 'apps/server/.env') });

export function getDbConfig() {
  const originalUrl =
    process.env.DATABASE_URL || 'postgresql://umang:secret123@localhost:5432/messagedb';
  const urlObj = new URL(originalUrl);
  const originalDb = urlObj.pathname.replace(/^\//, '') || 'messagedb';
  const testDb = `${originalDb}-test`;

  urlObj.pathname = `/${testDb}`;
  const testUrl = urlObj.toString();

  // Connect to postgres default DB or original DB to issue CREATE/DROP DATABASE
  const adminUrlObj = new URL(originalUrl);
  adminUrlObj.pathname = '/postgres';
  const adminUrl = adminUrlObj.toString();

  return {
    originalUrl,
    originalDb,
    testDb,
    testUrl,
    adminUrl,
  };
}

export async function createTestDatabase(): Promise<string> {
  const { originalUrl, testDb, testUrl, adminUrl } = getDbConfig();
  console.log(`\n======================================================`);
  console.log(`🚀 [E2E Setup] Creating test database: "${testDb}"`);
  console.log(`📡 [E2E Setup] Target connection: ${testUrl}`);
  console.log(`======================================================\n`);

  let client = new Client({ connectionString: adminUrl });
  try {
    await client.connect();
  } catch {
    // If postgres default database doesn't exist, connect to original database
    client = new Client({ connectionString: originalUrl });
    await client.connect();
  }

  try {
    // Terminate any existing connections to the test database
    await client.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [testDb]
    );
    await client.query(`DROP DATABASE IF EXISTS "${testDb}" WITH (FORCE)`);
    await client.query(`CREATE DATABASE "${testDb}"`);
    console.log(`✅ [E2E Setup] Created fresh test database: "${testDb}"\n`);
  } finally {
    await client.end();
  }

  return testUrl;
}

export async function dropTestDatabase(): Promise<void> {
  const { originalUrl, testDb, adminUrl } = getDbConfig();
  console.log(`\n======================================================`);
  console.log(`🧹 [E2E Teardown] Removing test database: "${testDb}"`);
  console.log(`======================================================\n`);

  let client = new Client({ connectionString: adminUrl });
  try {
    await client.connect();
  } catch {
    client = new Client({ connectionString: originalUrl });
    await client.connect();
  }

  try {
    // Terminate any connections still open to test database
    await client.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [testDb]
    );
    await client.query(`DROP DATABASE IF EXISTS "${testDb}" WITH (FORCE)`);
    console.log(`🗑️ [E2E Teardown] Successfully dropped and removed database: "${testDb}"\n`);
  } catch (err: any) {
    console.error(`⚠️ [E2E Teardown] Failed to remove test database:`, err.message);
  } finally {
    await client.end();
  }
}

