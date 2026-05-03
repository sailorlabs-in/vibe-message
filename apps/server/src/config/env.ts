import dotenv from 'dotenv';

dotenv.config();

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
  swagger: {
    user: string;
    pass: string;
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
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
    publicKey: getEnvVar('VAPID_PUBLIC_KEY'),
    privateKey: getEnvVar('VAPID_PRIVATE_KEY'),
    subject: getEnvVar('VAPID_SUBJECT'),
  },
  server: {
    port: parseInt(getEnvVar('PORT', '3000'), 10),
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
  },
  cors: {
    allowedOrigins: (getEnvVar('ALLOWED_ORIGINS', 'http://localhost:5173')).split(',').map(url => url.trim()),
  },
  swagger: {
    user: getEnvVar('SWAGGER_USER', 'umangsailor'),
    pass: getEnvVar('SWAGGER_PASS', 'Umang6Sailor'),
  },
};
