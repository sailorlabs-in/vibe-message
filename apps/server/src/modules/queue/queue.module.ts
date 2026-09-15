import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { PUSH_QUEUE_NAME, CRON_QUEUE_NAME, MAIL_QUEUE_NAME, HTTP_CRON_QUEUE_NAME } from './queue.constants';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        connection: redisService.getBullMqConnectionOptions(),
      }),
    }),
    BullModule.registerQueue(
      {
        name: PUSH_QUEUE_NAME,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: {
            count: 1000,
            age: 86400, // 24 hours
          },
          removeOnFail: {
            count: 5000,
            age: 604800, // 7 days
          },
        },
      },
      {
        name: CRON_QUEUE_NAME,
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: 'fixed',
            delay: 5000,
          },
          removeOnComplete: {
            count: 200,
            age: 86400,
          },
          removeOnFail: {
            count: 500,
            age: 604800,
          },
        },
      },
      {
        name: MAIL_QUEUE_NAME,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: {
            count: 500,
            age: 86400,
          },
          removeOnFail: {
            count: 1000,
            age: 604800,
          },
        },
      },
      {
        name: HTTP_CRON_QUEUE_NAME,
        defaultJobOptions: {
          attempts: 1, // We handle retries directly according to job settings
          removeOnComplete: {
            count: 2000,
            age: 86400, // 24 hours
          },
          removeOnFail: {
            count: 5000,
            age: 604800, // 7 days
          },
        },
      }
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
