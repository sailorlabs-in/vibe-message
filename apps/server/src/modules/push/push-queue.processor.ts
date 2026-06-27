import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PushService } from './push.service';

@Injectable()
export class PushQueueProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PushQueueProcessor.name);
  private isWorking = false;

  constructor(
    private readonly redisService: RedisService,
    private readonly pushService: PushService
  ) {}

  onModuleInit() {
    this.isWorking = true;
    this.processQueueLoop().catch((err) => {
      this.logger.error('Fatal error in push queue processor loop:', err);
    });
  }

  onModuleDestroy() {
    this.isWorking = false;
  }

  private async processQueueLoop() {
    this.logger.log('🚀 PushQueueProcessor background worker loop started');

    while (this.isWorking) {
      try {
        // BLPOP vibe:push_queue 0 blocks until an item is available.
        // It returns [key, value]
        const result = await this.redisService.queueClient.blpop('vibe:push_queue', 0);
        if (result && result.length > 1) {
          const payloadStr = result[1];
          const job = JSON.parse(payloadStr);
          this.logger.log(
            `[Queue Processor] Processing job for notification ID: ${job.notificationId}`
          );

          await this.pushService.executePushDelivery(
            job.notificationId,
            job.appId,
            job.targetUserIds
          );
        }
      } catch (err: any) {
        if (!this.isWorking) {
          break; // Module is shutting down, ignore the error
        }
        this.logger.error('❌ Error in push queue processor loop:', err);
        // Delay before retrying to prevent hot loop in case of Redis connection failure
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }
}
