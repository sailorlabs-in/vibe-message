import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { App as AppEntity } from './app.entity';
import { AppMember } from './app-member.entity';
import { User } from '../user/user.entity';

import { SystemModule } from '../system/system.module';
import { PushModule } from '../push/push.module';
import { DeviceModule } from '../device/device.module';
import { DripModule } from '../drip/drip.module';
import { UserModule } from '../user/user.module';
import { CronModule } from '../cron/cron.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppEntity, User, AppMember]),
    forwardRef(() => SystemModule),
    forwardRef(() => PushModule),
    forwardRef(() => DeviceModule),
    forwardRef(() => DripModule),
    forwardRef(() => UserModule),
    CronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
