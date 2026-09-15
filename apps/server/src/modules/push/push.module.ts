import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { Notification } from './notification.entity';
import { NotificationLog } from './notification_log.entity';
import { DeviceToken } from '../device/device_token.entity';
import { AppModule } from '../app/app.module';
import { PushQueueProcessor } from './push-queue.processor';
import { PUSH_QUEUE_NAME } from '../queue/queue.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationLog, DeviceToken]),
    BullModule.registerQueue({ name: PUSH_QUEUE_NAME }),
    forwardRef(() => AppModule),
  ],
  controllers: [PushController],
  providers: [PushService, PushQueueProcessor],
  exports: [PushService],
})
export class PushModule {}
