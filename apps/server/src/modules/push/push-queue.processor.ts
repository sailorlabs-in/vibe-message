import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { OnModuleInit, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { RedisService } from '../redis/redis.service';
import { PushService } from './push.service';
import { PUSH_QUEUE_NAME, PushJobPayload } from '../queue/queue.constants';

@Processor(PUSH_QUEUE_NAME, {
  concurrency: parseInt(process.env.PUSH_WORKER_CONCURRENCY || '5', 10),
})
export class PushQueueProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(PushQueueProcessor.name);

  constructor(
    private readonly pushService: PushService,
    private readonly redisService: RedisService,
    @InjectQueue(PUSH_QUEUE_NAME) private readonly pushQueue: Queue<PushJobPayload>
  ) {
    super();
  }

  async onModuleInit() {
    this.logger.log('🚀 PushQueueProcessor (BullMQ) worker initialized');
    await this.drainLegacyQueue();
  }

  /**
   * Gracefully drain any pending jobs from the legacy Redis list (vibe:push_queue)
   * into BullMQ so no notifications are lost during upgrades.
   */
  private async drainLegacyQueue() {
    try {
      const length = await this.redisService.getLegacyQueueLength();
      if (length > 0) {
        this.logger.log(
          `🔄 Migrating ${length} pending legacy job(s) from vibe:push_queue to BullMQ...`
        );
        let count = 0;
        while (true) {
          const item = await this.redisService.popLegacyQueueItem();
          if (!item) break;
          try {
            const parsed = JSON.parse(item);
            await this.pushQueue.add('deliver-push', {
              notificationId: parsed.notificationId,
              appId: parsed.appId,
              targetUserIds: parsed.targetUserIds,
            });
            count++;
          } catch (e: any) {
            this.logger.error('Failed to parse and migrate legacy queue item:', e.message);
          }
        }
        this.logger.log(`✅ Successfully migrated ${count} legacy job(s) into BullMQ.`);
      }
    } catch (err: any) {
      this.logger.warn('Could not inspect or drain legacy queue:', err.message);
    }
  }

  async process(job: Job<PushJobPayload>): Promise<any> {
    const { notificationId, appId, targetUserIds } = job.data;
    this.logger.log(
      `[BullMQ Push Worker] Processing job ${job.id} for notification ${notificationId} (app=${appId}, attempt=${job.attemptsMade + 1})`
    );

    await job.updateProgress(10);

    const result = await this.pushService.executePushDelivery(notificationId, appId, targetUserIds);

    await job.updateProgress(100);

    this.logger.log(
      `[BullMQ Push Worker] Job ${job.id} finished. Delivered: ${result.sent}, Failed: ${result.failed}`
    );

    return result;
  }
}
