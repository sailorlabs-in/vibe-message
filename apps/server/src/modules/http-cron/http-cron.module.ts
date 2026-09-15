import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronJob } from './entities/cron-job.entity';
import { CronJobLog } from './entities/cron-job-log.entity';
import { HttpCronController } from './http-cron.controller';
import { HttpCronService } from './http-cron.service';
import { HttpCronQueueScheduler } from './http-cron-queue.scheduler';
import { HttpCronQueueProcessor } from './http-cron-queue.processor';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CronJob, CronJobLog]),
    SystemModule,
  ],
  controllers: [HttpCronController],
  providers: [
    HttpCronService,
    HttpCronQueueScheduler,
    HttpCronQueueProcessor,
  ],
  exports: [HttpCronService, HttpCronQueueScheduler],
})
export class HttpCronModule {}
