import { Test, TestingModule } from '@nestjs/testing';
import { PushQueueProcessor } from './push-queue.processor';
import { PushService } from './push.service';
import { RedisService } from '../redis/redis.service';
import { PUSH_QUEUE_NAME } from '../queue/queue.constants';

describe('PushQueueProcessor (Unit Tests)', () => {
  let processor: PushQueueProcessor;

  const mockPushService = {
    executePushDelivery: jest.fn().mockResolvedValue({ sent: 5, failed: 0 }),
  };

  const mockRedisService = {
    getLegacyQueueLength: jest.fn().mockResolvedValue(1),
    popLegacyQueueItem: jest
      .fn()
      .mockResolvedValueOnce(JSON.stringify({ notificationId: 1, appId: 10, targetUserIds: ['u1'] }))
      .mockResolvedValueOnce(null),
  };

  const mockPushQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job_1' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushQueueProcessor,
        { provide: PushService, useValue: mockPushService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: `BullQueue_${PUSH_QUEUE_NAME}`, useValue: mockPushQueue },
      ],
    }).compile();

    processor = module.get<PushQueueProcessor>(PushQueueProcessor);
  });

  it('should initialize and drain legacy queue on onModuleInit', async () => {
    await processor.onModuleInit();
    expect(mockRedisService.getLegacyQueueLength).toHaveBeenCalled();
    expect(mockPushQueue.add).toHaveBeenCalledWith('deliver-push', {
      notificationId: 1,
      appId: 10,
      targetUserIds: ['u1'],
    });
  });

  it('should process push delivery job and report progress', async () => {
    const job = {
      id: 'job_10',
      data: { notificationId: 1, appId: 10, targetUserIds: ['u1'] },
      attemptsMade: 0,
      updateProgress: jest.fn().mockResolvedValue(undefined),
    };

    const res = await processor.process(job as any);
    expect(job.updateProgress).toHaveBeenCalledWith(10);
    expect(mockPushService.executePushDelivery).toHaveBeenCalledWith(1, 10, ['u1']);
    expect(job.updateProgress).toHaveBeenCalledWith(100);
    expect(res).toEqual({ sent: 5, failed: 0 });
  });
});

