import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/modules/user/user.service';
import { InternalNotificationService } from '../src/modules/system/internal-notification.service';
import { PushService } from '../src/modules/push/push.service';

let cachedApp: INestApplication | null = null;

export async function getTestApp(): Promise<INestApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));

  await app.init();

  // Seed super admin and internal admin notification app
  try {
    const userService = app.get(UserService);
    await userService.ensureSuperAdminCreated();

    const internalNotificationService = app.get(InternalNotificationService);
    await internalNotificationService.getOrCreateInternalApp();

    const pushService = app.get(PushService);
    await pushService.ensureNotificationsEncrypted();
  } catch (err: any) {
    console.error('⚠️ [Test App] Seeding error:', err.message);
  }

  cachedApp = app;
  return app;
}

export async function closeTestApp(): Promise<void> {
  if (cachedApp) {
    await cachedApp.close();
    cachedApp = null;
  }
}

