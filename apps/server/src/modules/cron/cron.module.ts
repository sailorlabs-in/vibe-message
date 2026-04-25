import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { SystemModule } from '../system/system.module';
import { PushModule } from '../push/push.module';
import { App as AppEntity } from '../app/app.entity';
import { Notification } from '../push/notification.entity';
import { DeviceToken } from '../device/device_token.entity';
import { DripCampaign, DripStep, DripSentLog } from '../drip/drip.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      AppEntity,
      Notification,
      DeviceToken,
      DripCampaign,
      DripStep,
      DripSentLog,
    ]),
    SystemModule,
    PushModule,
  ],
  providers: [CronService],
})
export class CronModule {}
