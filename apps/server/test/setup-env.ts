import dotenv from 'dotenv';
import { resolve } from 'path';

// Load base .env and .env.test
dotenv.config();
dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(process.cwd(), 'apps/server/.env') });
dotenv.config({ path: resolve(__dirname, '../.env.test'), override: true });
dotenv.config({ path: resolve(process.cwd(), 'apps/server/.env.test'), override: true });

const originalUrl =
  process.env.DATABASE_URL || 'postgresql://umang:secret123@localhost:5432/messagedb';
const urlObj = new URL(originalUrl);
const originalDb = urlObj.pathname.replace(/^\//, '') || 'messagedb';
const testDb = `${originalDb}-test`;
urlObj.pathname = `/${testDb}`;

// Override DATABASE_URL for tests
process.env.DATABASE_URL = urlObj.toString();
process.env.NODE_ENV = 'test';
process.env.IS_SELF_HOSTED = 'false';

