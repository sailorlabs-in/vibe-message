import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronService } from './cron.service';
import { CronQueueScheduler } from './cron-queue.scheduler';
import { CronQueueProcessor } from './cron-queue.processor';
import { SystemModule } from '../system/system.module';
import { PushModule } from '../push/push.module';
import { App as AppEntity } from '../app/app.entity';
import { Notification } from '../push/notification.entity';
import { DeviceToken } from '../device/device_token.entity';
import { DripCampaign, DripStep, DripSentLog } from '../drip/drip.entity';
import { SystemSettings } from '../system/system_settings.entity';
import { CRON_QUEUE_NAME, PUSH_QUEUE_NAME } from '../queue/queue.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AppEntity,
      Notification,
      DeviceToken,
      DripCampaign,
      DripStep,
      DripSentLog,
      SystemSettings,
    ]),
    BullModule.registerQueue({ name: CRON_QUEUE_NAME }, { name: PUSH_QUEUE_NAME }),
    SystemModule,
    PushModule,
  ],
  providers: [CronService, CronQueueScheduler, CronQueueProcessor],
  exports: [CronService, CronQueueScheduler],
})
export class CronModule {}
