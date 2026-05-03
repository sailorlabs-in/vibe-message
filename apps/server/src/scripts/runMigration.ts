import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../config/database';

const runMigration = async () => {
  try {
    console.log('🔄 Running intelligent delivery migration...');
    
    const migrationPath = join(__dirname, '../../sql/migration_intelligent_delivery.sql');
    const migration = readFileSync(migrationPath, 'utf-8');

    await pool.query(migration);
    console.log('✅ Migration applied successfully!');
    process.exit(0);
  } catch (error: any) {
    // Ignore duplicate table/column errors if they already exist
    if (error.code === '42701') {
      console.log('✅ Column already exists, skipping.');
      process.exit(0);
    }
    if (error.code === '42P07') {
      console.log('✅ Table already exists, skipping.');
      process.exit(0);
    }
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
