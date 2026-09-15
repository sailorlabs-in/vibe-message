import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CRON_QUEUE_NAME } from '../queue/queue.constants';
import { CronService } from './cron.service';
import { CRON_JOB_CLEANUP, CRON_JOB_SCHEDULER } from './cron-queue.scheduler';

@Processor(CRON_QUEUE_NAME, { concurrency: 1 })
export class CronQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(CronQueueProcessor.name);

  constructor(private readonly cronService: CronService) {
    super();
  }

  async process(job: Job): Promise<any> {
    const isManual = job.data?.manual === true;
    this.logger.debug(
      `[BullMQ Cron Worker] Executing cron job '${job.name}' (id=${job.id}, manual=${isManual})`
    );

    switch (job.name) {
      case CRON_JOB_CLEANUP:
        return await this.cronService.handleCleanup();

      case CRON_JOB_SCHEDULER:
        return await this.cronService.handleTimezoneScheduler();

      default:
        this.logger.warn(`[BullMQ Cron Worker] Unknown job name received: ${job.name}`);
        return { ignored: true };
    }
  }
}
