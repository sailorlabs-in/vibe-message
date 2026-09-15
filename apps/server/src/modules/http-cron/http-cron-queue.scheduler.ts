import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HTTP_CRON_QUEUE_NAME, HttpCronJobPayload } from '../queue/queue.constants';
import { CronJob } from './entities/cron-job.entity';

export const EXECUTE_HTTP_CRON_JOB = 'execute-http-cron';

@Injectable()
export class HttpCronQueueScheduler implements OnModuleInit {
  private readonly logger = new Logger(HttpCronQueueScheduler.name);

  constructor(
    @InjectQueue(HTTP_CRON_QUEUE_NAME)
    private readonly httpCronQueue: Queue<HttpCronJobPayload>,
    @InjectRepository(CronJob)
    private readonly cronJobRepo: Repository<CronJob>
  ) {}

  async onModuleInit() {
    await this.syncActiveCronJobs();
  }

  /**
   * Synchronizes all active enabled cron jobs from PostgreSQL into BullMQ repeatable schedulers.
   */
  async syncActiveCronJobs() {
    try {
      this.logger.log('⏰ Syncing enabled HTTP cron jobs to BullMQ schedulers...');
      const activeJobs = await this.cronJobRepo.find({
        where: { is_enabled: true },
      });

      for (const job of activeJobs) {
        await this.registerScheduler(job);
      }

      this.logger.log(`✅ Synced ${activeJobs.length} HTTP cron jobs to BullMQ repeatable schedulers.`);
    } catch (error: any) {
      this.logger.error('❌ Failed to sync HTTP cron jobs to BullMQ:', error.message);
    }
  }

  /**
   * Registers or updates a repeatable scheduler for an HTTP cron job.
   */
  async registerScheduler(cronJob: CronJob) {
    const schedulerId = `http-cron-${cronJob.id}`;
    try {
      await this.httpCronQueue.upsertJobScheduler(
        schedulerId,
        {
          pattern: cronJob.schedule,
        },
        {
          name: EXECUTE_HTTP_CRON_JOB,
          data: {
            cronJobId: cronJob.id,
            isManual: false,
          },
          opts: {
            removeOnComplete: true,
            removeOnFail: false,
          },
        }
      );
      this.logger.log(`✅ Registered HTTP cron scheduler "${schedulerId}" (${cronJob.schedule}) for ${cronJob.url}`);
    } catch (error: any) {
      this.logger.error(`❌ Failed to register HTTP cron scheduler "${schedulerId}":`, error.message);
    }
  }

  /**
   * Removes a repeatable scheduler from BullMQ when a cron job is paused or deleted.
   */
  async removeScheduler(cronJobId: number) {
    const schedulerId = `http-cron-${cronJobId}`;
    try {
      await this.httpCronQueue.removeJobScheduler(schedulerId);
      this.logger.log(`🗑️ Removed HTTP cron scheduler "${schedulerId}" from BullMQ.`);
    } catch (error: any) {
      this.logger.warn(`⚠️ Failed to remove HTTP cron scheduler "${schedulerId}":`, error.message);
    }
  }

  /**
   * Queues an immediate one-off execution for a cron job ("Run Now").
   */
  async triggerNow(cronJobId: number) {
    return this.httpCronQueue.add(
      EXECUTE_HTTP_CRON_JOB,
      {
        cronJobId,
        isManual: true,
      },
      {
        removeOnComplete: true,
      }
    );
  }
}
