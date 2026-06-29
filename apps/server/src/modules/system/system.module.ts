import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { InternalNotificationService } from './internal-notification.service';
import { SystemSettings } from './system_settings.entity';
import { App as AppEntity } from '../app/app.entity';
import { User } from '../user/user.entity';
import { Notification } from '../push/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSettings, AppEntity, User, Notification])],
  controllers: [SystemController],
  providers: [SystemService, InternalNotificationService],
  exports: [SystemService, InternalNotificationService],
})
export class SystemModule {}
