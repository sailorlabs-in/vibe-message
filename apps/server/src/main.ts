import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from './config/env';
import express from 'express';
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
  app.enableCors({
    origin: (origin, callback) => {
      if (config.server.nodeEnv === "development") {
        return callback(null, true);
      }
      if (!origin || config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vibe Message API')
    .setDescription('FCM-style notification platform backend')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerPath = apiPrefix === "" ? "/" : apiPrefix;
  
  // Basic Auth for Swagger (from old index.ts)
  expressApp.use(swaggerPath, (req, res, next) => {
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
  });

  SwaggerModule.setup(swaggerPath, app, document);

  // NestJS handles routing natively now

  const port = config.server.port || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📝 Environment: ${config.server.nodeEnv}`);
}

bootstrap();
