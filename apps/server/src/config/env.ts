import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config();
dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(process.cwd(), 'apps/server/.env') });

interface EnvConfig {
  database: {
    url: string;
  };
  jwt: {
    secret: string;
  };
  superAdmin: {
    email: string;
    password: string;
    name: string;
  };
  vapid: {
    publicKey: string;
    privateKey: string;
    subject: string;
  };
  server: {
    port: number;
    nodeEnv: string;
  };
  cors: {
    allowedOrigins: string[];
  };
  frontendUrl: string;
  swagger: {
    user: string;
    pass: string;
  };
  redis: {
    host: string;
    port: number;
    url?: string;
    password?: string;
    username?: string;
    db?: number;
    tls?: boolean;
    keyPrefix?: string;
  };
  mail: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined || value === null) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// For optional config that may legitimately be empty (e.g. SMTP_USER when using
// an unauthenticated relay). Returns empty string if not set.
const getOptionalEnvVar = (key: string, defaultValue = ''): string => {
  return process.env[key] ?? defaultValue;
};

export const config: EnvConfig = {
  database: {
    url: getEnvVar('DATABASE_URL'),
  },
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
  },
  superAdmin: {
    email: getEnvVar('SUPER_ADMIN_EMAIL'),
    password: getEnvVar('SUPER_ADMIN_PASSWORD'),
    name: getEnvVar('SUPER_ADMIN_NAME', 'Super Admin'),
  },
  vapid: {
    publicKey: getOptionalEnvVar('VAPID_PUBLIC_KEY', ''),
    privateKey: getOptionalEnvVar('VAPID_PRIVATE_KEY', ''),
    subject: getOptionalEnvVar('VAPID_SUBJECT', 'mailto:admin@example.com'),
  },
  server: {
    port: parseInt(getEnvVar('PORT', '3000'), 10),
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
  },
  cors: {
    allowedOrigins: getEnvVar('ALLOWED_ORIGINS', 'http://localhost:5173')
      .split(',')
      .map((url) => url.trim()),
  },
  // The canonical public URL of the frontend — used to build reset-password links, etc.
  frontendUrl: getOptionalEnvVar(
    'FRONTEND_URL',
    getOptionalEnvVar('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')[0].trim()
  ),
  swagger: {
    user: getEnvVar('SWAGGER_USER', 'umangsailor'),
    pass: getEnvVar('SWAGGER_PASS', 'Umang6Sailor'),
  },
  redis: {
    url: getOptionalEnvVar('REDIS_URL') || undefined,
    host: getEnvVar('REDIS_HOST', 'localhost'),
    port: parseInt(getEnvVar('REDIS_PORT', '6379'), 10),
    password: getOptionalEnvVar('REDIS_PASSWORD') || undefined,
    username: getOptionalEnvVar('REDIS_USERNAME') || undefined,
    db: parseInt(getOptionalEnvVar('REDIS_DB', '0'), 10),
    tls: getOptionalEnvVar('REDIS_TLS', 'false') === 'true',
    keyPrefix: getOptionalEnvVar('REDIS_KEY_PREFIX', ''),
  },
  mail: {
    host: getOptionalEnvVar('SMTP_HOST'),
    port: parseInt(getOptionalEnvVar('SMTP_PORT', '587'), 10),
    secure: getOptionalEnvVar('SMTP_SECURE', 'false') === 'true',
    user: getOptionalEnvVar('SMTP_USER'),
    pass: getOptionalEnvVar('SMTP_PASS'),
    from: getOptionalEnvVar('SMTP_FROM', process.env.SMTP_USER ?? 'service@sailorlabs.in'),
  },
};
