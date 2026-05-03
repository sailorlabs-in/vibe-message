const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://umang:secret123@localhost:5432/messagedb',
});

async function main() {
  try {
    const res = await pool.query("SELECT id, name, public_app_id, public_key, secret_key FROM apps WHERE name = 'Admin Panel Notifications'");
    console.log("Admin App Details:");
    console.log(`VITE_ADMIN_APP_ID=${res.rows[0].public_app_id}`);
    console.log(`VITE_ADMIN_PUBLIC_KEY=${res.rows[0].public_key}`);
    console.log(`ADMIN_SECRET_KEY=${res.rows[0].secret_key}`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

main();
