import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../config/database';

const runAlter = async () => {
  try {
    console.log('🔄 Running alter retention script...');
    const alterPath = join(__dirname, '../../sql/alter_retention.sql');
    const alterQuery = readFileSync(alterPath, 'utf-8');
    await pool.query(alterQuery);
    console.log('✅ Alter retention applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Alter failed:', error);
    process.exit(1);
  }
};

runAlter();
