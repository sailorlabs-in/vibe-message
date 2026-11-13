import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpCronQueueProcessor } from './http-cron-queue.processor';
import { CronJob } from './entities/cron-job.entity';
import { CronJobLog } from './entities/cron-job-log.entity';
import { InternalNotificationService } from '../system/internal-notification.service';

describe('HttpCronQueueProcessor (Unit Tests)', () => {
  let processor: HttpCronQueueProcessor;

  const mockCronJob: CronJob = {
    id: 1,
    user_id: 10,
    title: 'Test Cron',
    url: 'https://example.com/api',
    method: 'POST',
    schedule: '* * * * *',
    timezone: 'UTC',
    headers: { 'X-Auth': 'token' },
    body: JSON.stringify({ key: 'val' }),
    timeout_seconds: 5,
    retries: 1,
    is_enabled: true,
    notify_on_failure: true,
    last_run_at: null,
    last_status: null,
    last_status_code: null,
    last_duration_ms: null,
    consecutive_failures: 0,
    created_at: new Date(),
    updated_at: new Date(),
    user: null as any,
    logs: [],
  };

  const mockCronJobRepo = {
    findOne: jest.fn(),
    save: jest.fn((j) => Promise.resolve(j)),
  };

  const mockCronJobLogRepo = {
    create: jest.fn((dto) => ({ ...dto, id: 100 })),
    save: jest.fn((l) => Promise.resolve(l)),
  };

  const mockInternalNotificationService = {
    notifyUser: jest.fn().mockResolvedValue(undefined),
  };

  const originalFetch = global.fetch;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpCronQueueProcessor,
        { provide: getRepositoryToken(CronJob), useValue: mockCronJobRepo },
        { provide: getRepositoryToken(CronJobLog), useValue: mockCronJobLogRepo },
        { provide: InternalNotificationService, useValue: mockInternalNotificationService },
      ],
    }).compile();

    processor = module.get<HttpCronQueueProcessor>(HttpCronQueueProcessor);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should skip execution if cron job is not found', async () => {
    mockCronJobRepo.findOne.mockResolvedValueOnce(null);
    const res = await processor.process({ data: { cronJobId: 99 } } as any);
    expect(res).toEqual({ skipped: true, reason: 'NOT_FOUND' });
  });

  it('should skip scheduled tick if cron job is disabled and not manual', async () => {
    mockCronJobRepo.findOne.mockResolvedValueOnce({ ...mockCronJob, is_enabled: false });
    const res = await processor.process({ data: { cronJobId: 1, isManual: false } } as any);
    expect(res).toEqual({ skipped: true, reason: 'PAUSED' });
  });

  it('should execute successfully when fetch returns 200', async () => {
    mockCronJobRepo.findOne.mockResolvedValueOnce({ ...mockCronJob });

    const mockHeaders = new Map<string, string>([['content-type', 'application/json']]);
    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 200,
      headers: mockHeaders,
      text: jest.fn().mockResolvedValueOnce('OK'),
    });

    const res = await processor.process({ data: { cronJobId: 1, isManual: true } } as any);
    expect(res.success).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(mockCronJobLogRepo.save).toHaveBeenCalled();
    expect(mockCronJobRepo.save).toHaveBeenCalled();
  });

  it('should handle fetch failure, retry, log failure and notify user', async () => {
    mockCronJobRepo.findOne.mockResolvedValueOnce({ ...mockCronJob, retries: 0 });

    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    const res = await processor.process({ data: { cronJobId: 1, isManual: false } } as any);
    expect(res.success).toBe(false);
    expect(res.statusCode).toBe(0);
    expect(mockInternalNotificationService.notifyUser).toHaveBeenCalledWith(
      10,
      expect.stringContaining('Cron Job Alert'),
      expect.any(String),
      expect.any(Object)
    );
  });
});

