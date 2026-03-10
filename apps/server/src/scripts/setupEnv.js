#!/usr/bin/env node

/**
 * Environment Setup Script
 * Run this to create your .env file with all necessary configurations
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('🔧 vibe-message - Environment Setup\n');
console.log('This script will create your .env file with the necessary configuration.\n');

// VAPID keys instruction
console.log('📝 Step 1: Generate VAPID Keys');
console.log('Run the following command after installing dependencies:');
console.log('   npx web-push generate-vapid-keys\n');
console.log('You will receive output like:');
console.log('   Public Key: BNgq...');
console.log('   Private Key: xyz...\n');

// Database URL
const databaseUrl = 'postgresql://umang:secret123@localhost:5432/messagedb';

// Create .env content
const envContent = `# Database Configuration
DATABASE_URL=${databaseUrl}

# JWT Configuration (auto-generated)
JWT_SECRET=${jwtSecret}

# Super Admin Credentials (created automatically on first run)
SUPER_ADMIN_EMAIL=admin@fcmclone.com
SUPER_ADMIN_PASSWORD=SuperAdmin@123

# VAPID Keys for Web Push
# Run: npx web-push generate-vapid-keys
# Then paste the keys below:
VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY_HERE
VAPID_PRIVATE_KEY=YOUR_VAPID_PRIVATE_KEY_HERE
VAPID_SUBJECT=mailto:admin@fcmclone.com

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
`;

// Write .env file
const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, envContent);

console.log('✅ Created .env file at:', envPath);
console.log('\n📋 Generated Configuration:');
console.log('   Database URL: ' + databaseUrl);
console.log('   JWT Secret: [GENERATED]');
console.log('   Super Admin Email: admin@fcmclone.com');
console.log('   Super Admin Password: SuperAdmin@123');
console.log('\n⚠️  IMPORTANT: You must still add VAPID keys to .env');
console.log('   1. Run: npx web-push generate-vapid-keys');
console.log('   2. Copy the Public Key to VAPID_PUBLIC_KEY in .env');
console.log('   3. Copy the Private Key to VAPID_PRIVATE_KEY in .env');
console.log('\n🚀 Next Steps:');
console.log('   1. npm install');
console.log('   2. npx web-push generate-vapid-keys (and update .env)');
console.log('   3. npm run db:setup');
console.log('   4. npm run dev');
