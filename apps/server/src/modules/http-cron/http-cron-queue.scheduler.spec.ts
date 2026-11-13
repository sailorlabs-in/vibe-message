import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpCronQueueScheduler, EXECUTE_HTTP_CRON_JOB } from './http-cron-queue.scheduler';
import { CronJob } from './entities/cron-job.entity';
import { HTTP_CRON_QUEUE_NAME } from '../queue/queue.constants';

describe('HttpCronQueueScheduler (Unit Tests)', () => {
  let scheduler: HttpCronQueueScheduler;

  const mockQueue = {
    upsertJobScheduler: jest.fn().mockResolvedValue(undefined),
    removeJobScheduler: jest.fn().mockResolvedValue(undefined),
    add: jest.fn().mockResolvedValue({ id: 'job_1' }),
  };

  const mockCronJobRepo = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpCronQueueScheduler,
        { provide: `BullQueue_${HTTP_CRON_QUEUE_NAME}`, useValue: mockQueue },
        { provide: getRepositoryToken(CronJob), useValue: mockCronJobRepo },
      ],
    }).compile();

    scheduler = module.get<HttpCronQueueScheduler>(HttpCronQueueScheduler);
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  it('should sync active cron jobs on onModuleInit', async () => {
    mockCronJobRepo.find.mockResolvedValueOnce([
      { id: 1, schedule: '* * * * *', url: 'https://test.com', is_enabled: true },
    ]);

    await scheduler.onModuleInit();
    expect(mockCronJobRepo.find).toHaveBeenCalledWith({ where: { is_enabled: true } });
    expect(mockQueue.upsertJobScheduler).toHaveBeenCalled();
  });

  it('should handle sync error gracefully', async () => {
    mockCronJobRepo.find.mockRejectedValueOnce(new Error('DB unreachable'));
    await expect(scheduler.syncActiveCronJobs()).resolves.toBeUndefined();
  });

  it('should register scheduler and handle registration error', async () => {
    await scheduler.registerScheduler({ id: 2, schedule: '0 * * * *', url: 'https://test.com' } as any);
    expect(mockQueue.upsertJobScheduler).toHaveBeenCalledWith(
      'http-cron-2',
      { pattern: '0 * * * *' },
      expect.anything()
    );

    mockQueue.upsertJobScheduler.mockRejectedValueOnce(new Error('BullMQ failure'));
    await expect(
      scheduler.registerScheduler({ id: 3, schedule: '0 * * * *', url: 'https://test.com' } as any)
    ).resolves.toBeUndefined();
  });

  it('should remove scheduler and handle removal error', async () => {
    await scheduler.removeScheduler(2);
    expect(mockQueue.removeJobScheduler).toHaveBeenCalledWith('http-cron-2');

    mockQueue.removeJobScheduler.mockRejectedValueOnce(new Error('Cannot remove'));
    await expect(scheduler.removeScheduler(3)).resolves.toBeUndefined();
  });

  it('should triggerNow by adding immediate job to queue', async () => {
    await scheduler.triggerNow(5);
    expect(mockQueue.add).toHaveBeenCalledWith(
      EXECUTE_HTTP_CRON_JOB,
      { cronJobId: 5, isManual: true },
      { removeOnComplete: true }
    );
  });
});

