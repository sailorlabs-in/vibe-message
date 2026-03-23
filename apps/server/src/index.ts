import express, { Application } from "express";
import cors from "cors";
import { config } from "./config/env";
import { pool } from "./config/database";
import { initializeSuperAdmin } from "./services/authService";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";

// Import routes
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import appsRoutes from "./routes/apps.routes";
import sdkRoutes from "./routes/sdk.routes";
import pushRoutes from "./routes/push.routes";
import systemRoutes from "./routes/system.routes";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import { startCleanupJob } from "./jobs/cleanupJob";

const app: Application = express();

// Trust proxy for rate limiting behind Nginx Ingress
app.set("trust proxy", 1);

const isProduction = config.server.nodeEnv.toLowerCase() === "production";
const apiPrefix = isProduction ? "" : "/api";

// Middleware
const restrictedCors = cors({
  origin: (origin, callback) => {
    if (config.server.nodeEnv === "development") {
      return callback(null, true);
    }

    if (!origin || config.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
});

app.use((req, res, next) => {
  if (req.path.startsWith(`${apiPrefix}/push`) || req.path.startsWith(`${apiPrefix}/sdk`)) {
    return cors()(req, res, next);
  }
  return restrictedCors(req, res, next);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Apply rate limiting to API routes
app.use("/", apiLimiter);

// Routes

console.log(`\n🔍 DEBUG ROUTING:`);
console.log(`- RAW NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- Parsed NODE_ENV: ${config.server.nodeEnv}`);
console.log(`- isProduction Check: ${isProduction}`);
console.log(`- Assigned API Prefix: "${apiPrefix}"\n`);

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/apps`, appsRoutes);
app.use(`${apiPrefix}/sdk`, sdkRoutes);
app.use(`${apiPrefix}/push`, pushRoutes);
app.use(`${apiPrefix}/system`, systemRoutes);

const swaggerPath = apiPrefix === "" ? "/" : apiPrefix;
app.use(swaggerPath, (req, res, next) => {
  if (req.path === '/' || req.path === '/index.html' || req.path.includes('swagger')) {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (login === 'umangsailor' && password === 'Umang6Sailor') {
      return next();
    }
    res.set('WWW-Authenticate', 'Basic realm="401"');
    return res.status(401).send('Authentication required.');
  }
  return next();
}, swaggerUi.serve, swaggerUi.setup(specs));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful");

    // Initialize super admin
    await initializeSuperAdmin();

    // Start server
    app.listen(config.server.port, () => {
      console.log(`🚀 Server running on port ${config.server.port}`);
      console.log(`📝 Environment: ${config.server.nodeEnv}`);
      console.log(
        `🌐 CORS enabled for: ${config.cors.allowedOrigins.join(", ")}`,
      );
      // Start background cron jobs
      startCleanupJob();
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await pool.end();
  process.exit(0);
});

// --- 📝 EXTERNAL SDK USAGE EXAMPLE (BACKEND) ---
// If you are integrating this from a separate 3rd-party Node.js backend to send notifications,
// you would use the `initServerClient` like this (omitting baseUrl):

import { initServerClient } from "vibe-message";

const vibe = initServerClient({
  baseUrl: process.env.NOTIFICATION_URL || "",
  appId: process.env.ADMIN_APP_ID || "",
  secretKey: process.env.ADMIN_SECRET_KEY || "",
});

// Example: Triggering a push notification to a specific user
vibe
  .notification({
    notificationData: { title: "Alert!", body: "Your process completed." },
    externalUsers: ["user-123"],
  })
  .catch((err) =>
    console.log("[Dev Test] Expected crash (Requires real keys):", err.message),
  );

// --------------------------------------------
