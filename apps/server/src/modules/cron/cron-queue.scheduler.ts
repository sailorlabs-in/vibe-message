import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CRON_QUEUE_NAME } from '../queue/queue.constants';

export const CRON_JOB_CLEANUP = 'midnight-cleanup';
export const CRON_JOB_SCHEDULER = 'timezone-drip-scheduler';

@Injectable()
export class CronQueueScheduler implements OnModuleInit {
  private readonly logger = new Logger(CronQueueScheduler.name);

  constructor(
    @InjectQueue(CRON_QUEUE_NAME)
    private readonly cronQueue: Queue
  ) {}

  async onModuleInit() {
    await this.registerRepeatableJobs();
  }

  /**
   * Registers BullMQ repeatable jobs for all system crons.
   * BullMQ ensures exactly one worker across the entire cluster executes each scheduled tick.
   */
  async registerRepeatableJobs() {
    this.logger.log('⏰ Initializing BullMQ repeatable cron jobs...');

    try {
      // 1. Daily midnight cleanup job (00:00 every day)
      await this.cronQueue.upsertJobScheduler(
        'system-midnight-cleanup',
        {
          pattern: '0 0 * * *',
        },
        {
          name: CRON_JOB_CLEANUP,
          data: {},
          opts: {
            removeOnComplete: true,
            removeOnFail: false,
          },
        }
      );
      this.logger.log('✅ Registered BullMQ repeatable job: midnight-cleanup (0 0 * * *)');

      // 2. Timezone-aware push and drip campaign scheduler (every minute)
      await this.cronQueue.upsertJobScheduler(
        'system-timezone-scheduler',
        {
          pattern: '* * * * *',
        },
        {
          name: CRON_JOB_SCHEDULER,
          data: {},
          opts: {
            removeOnComplete: true,
            removeOnFail: false,
          },
        }
      );
      this.logger.log('✅ Registered BullMQ repeatable job: timezone-drip-scheduler (* * * * *)');
    } catch (err: any) {
      this.logger.error('❌ Failed to register BullMQ repeatable cron jobs:', err.message);
    }
  }

  /**
   * Get active repeatable job configurations
   */
  async getRepeatableJobs() {
    return this.cronQueue.getJobSchedulers();
  }

  /**
   * Manually trigger a cleanup tick on demand
   */
  async triggerCleanupNow() {
    return this.cronQueue.add(
      CRON_JOB_CLEANUP,
      { manual: true },
      { jobId: `manual-cleanup-${Date.now()}` }
    );
  }

  /**
   * Manually trigger a scheduler tick on demand
   */
  async triggerSchedulerNow() {
    return this.cronQueue.add(
      CRON_JOB_SCHEDULER,
      { manual: true },
      { jobId: `manual-scheduler-${Date.now()}` }
    );
  }
}
