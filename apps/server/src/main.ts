import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from './config/env';
import express from 'express';
import cors from 'cors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust proxy for rate limiting behind Nginx Ingress
  const expressApp = app.getHttpAdapter().getInstance() as express.Application;
  expressApp.set('trust proxy', 1);

  const isProduction = config.server.nodeEnv.toLowerCase() === "production";
  const apiPrefix = isProduction ? "" : "/api";

  app.setGlobalPrefix(apiPrefix === "" ? "" : apiPrefix.replace(/^\//, ''));

  // CORS configuration
  const publicCorsPaths = [
    '/health',
    '/sdk',
    '/push',
  ];

  expressApp.use(cors((req, callback) => {
    const requestPath = req.path.replace(/^\/api(?=\/|$)/, '') || '/';
    const isPublicCorsPath = publicCorsPaths.some((path) => (
      requestPath === path || requestPath.startsWith(`${path}/`)
    ));

    callback(null, {
      origin: (origin, originCallback) => {
        if (config.server.nodeEnv === "development" || isPublicCorsPath) {
          return originCallback(null, true);
        }
        if (!origin || config.cors.allowedOrigins.includes(origin)) {
          return originCallback(null, true);
        }

        console.error(`Blocked by CORS: ${origin}`);
        return originCallback(new Error("Not allowed by CORS"), false);
      },
      credentials: true,
    });
  }));

  // Validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vibe Message API')
    .setDescription('FCM-style notification platform backend')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Health', 'System health checks')
    .addTag('External Notifications APIs', 'Public-facing endpoints for SDKs and server integrations')
    .addTag('Internal App APIs', 'Endpoints for the Vibe Message frontend')
    .addTag('Apps', 'App configuration and management')
    .addTag('Admin', 'Administrative operations')
    .addTag('System', 'System-level configurations and metrics')
    .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerPath = apiPrefix === "" ? "/" : apiPrefix;
  
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
}

bootstrap();
