import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './config/env';

// Entities
import { User } from './modules/user/user.entity';
import { App } from './modules/app/app.entity';
import { DeviceToken } from './modules/device/device_token.entity';
import { Notification } from './modules/push/notification.entity';
import { NotificationLog } from './modules/push/notification_log.entity';
import { Warning } from './modules/user/warning.entity';
import { SystemSettings } from './modules/system/system_settings.entity';
import { DripCampaign, DripStep, DripSentLog } from './modules/drip/drip.entity';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AppModule as AppEntityModule } from './modules/app/app.module';
import { PushModule } from './modules/push/push.module';
import { DeviceModule } from './modules/device/device.module';
import { DripModule } from './modules/drip/drip.module';
import { AdminModule } from './modules/admin/admin.module';
import { SdkModule } from './modules/sdk/sdk.module';
import { SystemModule } from './modules/system/system.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'postgres',
        url: config.database.url,
        entities: [
          User, App, DeviceToken, Notification, NotificationLog, 
          Warning, SystemSettings, DripCampaign, DripStep, DripSentLog
        ],
        synchronize: true, // We use SQL files for migration, so keep this false in prod
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    AppEntityModule,
    PushModule,
    DeviceModule,
    DripModule,
    AdminModule,
    SdkModule,
    SystemModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    console.log("✅ AppModule initialized with TypeORM");
  }
}
