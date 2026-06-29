import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from './config/env';
import express from 'express';
import cors from 'cors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UserService } from './modules/user/user.service';
import { InternalNotificationService } from './modules/system/internal-notification.service';

async function bootstrap() {
  if (process.env.IS_SELF_HOSTED === 'true') {
    console.log('🚀 Starting Vibe Message in Self-Hosted Enterprise Mode...');
    const enterpriseKey = process.env.ENTERPRISE_KEY;
    if (!enterpriseKey) {
      console.error('❌ Enterprise Error: ENTERPRISE_KEY environment variable is required for self-hosted deployments.');
      process.exit(1);
    }
    const verifyUrl = process.env.VIBE_MAIN_SERVER_URL || 'https://vibe-message.sailorlabs.in/api';
    console.log(`📡 Verifying license key with main server: ${verifyUrl}`);
    try {
      const response = await fetch(`${verifyUrl}/user/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: enterpriseKey }),
      });
      const resData: any = await response.json();
      if (!response.ok || !resData.success || !resData.data?.valid) {
        console.error('❌ Enterprise Error: Invalid or inactive ENTERPRISE_KEY.');
        process.exit(1);
      }
      console.log(`✅ Enterprise License verified successfully!`);
      console.log(`👤 License Owner: ${resData.data.ownerName} (${resData.data.ownerEmail})`);
    } catch (err: any) {
      console.error('❌ Enterprise Error: Failed to contact the validation server.', err.message);
      process.exit(1);
    }
  }

  const app = await NestFactory.create(AppModule);

  // Trust proxy for rate limiting behind Nginx Ingress
  const expressApp = app.getHttpAdapter().getInstance() as express.Application;
  expressApp.set('trust proxy', 1);

  const isProduction = config.server.nodeEnv.toLowerCase() === 'production';
  const apiPrefix = isProduction ? '' : '/api';

  app.setGlobalPrefix(apiPrefix === '' ? '' : apiPrefix.replace(/^\//, ''));

  // CORS configuration
  const publicCorsPaths = ['/health', '/sdk', '/push'];

  expressApp.use(
    cors((req, callback) => {
      const requestPath = req.path.replace(/^\/api(?=\/|$)/, '') || '/';
      const isPublicCorsPath = publicCorsPaths.some(
        (path) => requestPath === path || requestPath.startsWith(`${path}/`)
      );

      callback(null, {
        origin: (origin, originCallback) => {
          if (config.server.nodeEnv === 'development' || isPublicCorsPath) {
            return originCallback(null, true);
          }
          if (!origin || config.cors.allowedOrigins.includes(origin)) {
            return originCallback(null, true);
          }

          console.error(`Blocked by CORS: ${origin}`);
          return originCallback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
      });
    })
  );

  // Validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vibe Message API')
    .setDescription('FCM-style notification platform backend')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Health', 'System health checks')
    .addTag(
      'External Notifications APIs',
      'Public-facing endpoints for SDKs and server integrations'
    )
    .addTag('Internal App APIs', 'Endpoints for the Vibe Message frontend')
    .addTag('Apps', 'App configuration and management')
    .addTag('Admin', 'Administrative operations')
    .addTag('System', 'System-level configurations and metrics')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerPath = apiPrefix === '' ? '/' : apiPrefix;

  // Basic Auth for Swagger (from old index.ts)
  expressApp.use(swaggerPath, (req, res, next) => {
    if (req.path === '/' || req.path === '/index.html' || req.path.includes('swagger')) {
      const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
      const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

      if (login === config.swagger.user && password === config.swagger.pass) {
        return next();
      }
      res.set('WWW-Authenticate', 'Basic realm="401"');
      return res.status(401).send('Authentication required.');
    }
    return next();
  });

  SwaggerModule.setup(swaggerPath, app, document);

  // NestJS handles routing natively now

  const port = config.server.port || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📝 Environment: ${config.server.nodeEnv}`);

  // Seed Database (SuperAdmin and Admin Notification App)
  try {
    const userService = app.get(UserService);
    await userService.ensureSuperAdminCreated();

    const internalNotificationService = app.get(InternalNotificationService);
    await internalNotificationService.getOrCreateInternalApp();
  } catch (err: any) {
    console.error('⚠️ Database seeding failed:', err.message);
  }
}

bootstrap();
