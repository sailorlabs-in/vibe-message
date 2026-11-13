import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { PUSH_QUEUE_NAME, CRON_QUEUE_NAME } from '../queue/queue.constants';

describe('HealthController (Unit Tests)', () => {
  let controller: HealthController;

  const mockDataSource = {
    query: jest.fn().mockResolvedValue([{ 1: 1 }]),
  };

  const mockRedisService = {
    ping: jest.fn().mockResolvedValue({ ok: true, latencyMs: 2 }),
  };

  const mockPushQueue = {
    getJobCounts: jest.fn().mockResolvedValue({
      waiting: 0,
      active: 0,
      completed: 10,
      failed: 0,
      delayed: 0,
    }),
  };

  const mockCronQueue = {
    getJobSchedulers: jest.fn().mockResolvedValue([
      { name: 'midnight-cleanup', pattern: '0 0 * * *', next: 1700000000000 },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: DataSource, useValue: mockDataSource },
        { provide: RedisService, useValue: mockRedisService },
        { provide: `BullQueue_${PUSH_QUEUE_NAME}`, useValue: mockPushQueue },
        { provide: `BullQueue_${CRON_QUEUE_NAME}`, useValue: mockCronQueue },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return ok status when database, redis, and queues are healthy', async () => {
    const res = await controller.check();

    expect(res.success).toBe(true);
    expect(res.data.status).toBe('ok');
    expect(res.data.checks.database.status).toBe('ok');
    expect(res.data.checks.redis.status).toBe('ok');
    expect(res.data.checks.queues.status).toBe('ok');
    expect(res.data.checks.server.status).toBe('ok');
    expect(res.data.checks.scheduler.status).toBe('ok');
  });

  it('should report error when database is unreachable', async () => {
    mockDataSource.query.mockRejectedValueOnce(new Error('DB Connection Refused'));

    const res = await controller.check();

    expect(res.success).toBe(true);
    expect(res.data.status).toBe('degraded');
    expect(res.data.checks.database.status).toBe('error');
    expect(res.data.checks.database.message).toBe('DB Connection Refused');
  });

  it('should report error when redis ping fails or throws', async () => {
    mockRedisService.ping.mockResolvedValueOnce({ ok: false, error: 'Redis timeout', latencyMs: -1 });

    let res = await controller.check();
    expect(res.data.checks.redis.status).toBe('error');
    expect(res.data.checks.redis.message).toBe('Redis timeout');

    mockRedisService.ping.mockRejectedValueOnce(new Error('Redis crash'));
    res = await controller.check();
    expect(res.data.checks.redis.status).toBe('error');
    expect(res.data.checks.redis.message).toBe('Redis crash');
  });

  it('should report error when queues check throws', async () => {
    mockPushQueue.getJobCounts.mockRejectedValueOnce(new Error('Queue unavailable'));

    const res = await controller.check();
    expect(res.data.checks.queues.status).toBe('error');
    expect(res.data.checks.queues.message).toBe('Queue unavailable');
  });

  it('should handle cronSchedulers with null next timestamp and format uptime', async () => {
    mockCronQueue.getJobSchedulers.mockResolvedValueOnce([
      { name: 'job-without-next', pattern: '* * * * *', next: null },
    ]);

    const res = await controller.check();
    expect(res.data.checks.queues.activeCronSchedules[0].next).toBeNull();
  });
});
