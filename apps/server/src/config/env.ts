import dotenv from "dotenv";

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
  frontendUrl: string;
  swagger: {
    user: string;
    pass: string;
  };
  redis: {
    host: string;
    port: number;
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
const getOptionalEnvVar = (key: string, defaultValue = ""): string => {
  return process.env[key] ?? defaultValue;
};

export const config: EnvConfig = {
  database: {
    url: getEnvVar("DATABASE_URL"),
  },
  jwt: {
    secret: getEnvVar("JWT_SECRET"),
  },
  superAdmin: {
    email: getEnvVar("SUPER_ADMIN_EMAIL"),
    password: getEnvVar("SUPER_ADMIN_PASSWORD"),
    name: getEnvVar("SUPER_ADMIN_NAME", "Super Admin"),
  },
  vapid: {
    publicKey: getEnvVar("VAPID_PUBLIC_KEY"),
    privateKey: getEnvVar("VAPID_PRIVATE_KEY"),
    subject: getEnvVar("VAPID_SUBJECT"),
  },
  server: {
    port: parseInt(getEnvVar("PORT", "3000"), 10),
    nodeEnv: getEnvVar("NODE_ENV", "development"),
  },
  cors: {
    allowedOrigins: getEnvVar("ALLOWED_ORIGINS", "http://localhost:5173")
      .split(",")
      .map((url) => url.trim()),
  },
  // The canonical public URL of the frontend — used to build reset-password links, etc.
  frontendUrl: getOptionalEnvVar(
    "FRONTEND_URL",
    getOptionalEnvVar("ALLOWED_ORIGINS", "http://localhost:5173")
      .split(",")[0]
      .trim(),
  ),
  swagger: {
    user: getEnvVar("SWAGGER_USER", "umangsailor"),
    pass: getEnvVar("SWAGGER_PASS", "Umang6Sailor"),
  },
  redis: {
    host: getEnvVar("REDIS_HOST", "192.168.1.2"),
    port: parseInt(getEnvVar("REDIS_PORT", "6379"), 10),
  },
  mail: {
    host: getOptionalEnvVar("SMTP_HOST"),
    port: parseInt(getOptionalEnvVar("SMTP_PORT", "587"), 10),
    secure: getOptionalEnvVar("SMTP_SECURE", "false") === "true",
    user: getOptionalEnvVar("SMTP_USER"),
    pass: getOptionalEnvVar("SMTP_PASS"),
    from: getOptionalEnvVar(
      "SMTP_FROM",
      process.env.SMTP_USER ?? "service@sailorlabs.in",
    ),
  },
};
