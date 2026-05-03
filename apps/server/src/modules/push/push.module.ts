import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { Notification } from './notification.entity';
import { NotificationLog } from './notification_log.entity';
import { DeviceToken } from '../device/device_token.entity';
import { AppModule } from '../app/app.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationLog, DeviceToken]),
    forwardRef(() => AppModule),
  ],
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
