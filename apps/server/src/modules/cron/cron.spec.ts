import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CronService } from './cron.service';
import { CronQueueProcessor } from './cron-queue.processor';
import { CronQueueScheduler, CRON_JOB_CLEANUP, CRON_JOB_SCHEDULER } from './cron-queue.scheduler';
import { PushService } from '../push/push.service';
import { SystemSettings } from '../system/system_settings.entity';
import { App as AppEntity } from '../app/app.entity';
import { Notification } from '../push/notification.entity';
import { DeviceToken } from '../device/device_token.entity';
import { DripCampaign, DripSentLog } from '../drip/drip.entity';
import { RedisService } from '../redis/redis.service';
import { CRON_QUEUE_NAME, PUSH_QUEUE_NAME } from '../queue/queue.constants';

describe('CronModule (Unit Tests)', () => {
  let service: CronService;
  let scheduler: CronQueueScheduler;
  let processor: CronQueueProcessor;

  const mockSystemSettingsRepo = {
    findOne: jest.fn().mockResolvedValue({ id: 1, default_retention_days: 14 }),
  };

  const mockAppRepo = {
    find: jest.fn().mockResolvedValue([{ id: 1, retention_days: 7 }]),
  };

  const mockDeleteQb = {
    delete: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 3 }),
  };

  const mockNotificationRepo = {
    createQueryBuilder: jest.fn(() => ({
      ...mockDeleteQb,
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        { id: 1, app_id: 10, target_user_ids: '["u1"]', scheduled_at: new Date() },
      ]),
    })),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockDeviceTokenRepo = {
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      subQuery: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnValue('(SELECT 1 FROM drip_sent_logs)'),
      })),
      getRawMany: jest.fn().mockResolvedValue([
        { device_id: 1, external_user_id: 'u1', app_id: 10 },
      ]),
    })),
  };

  const mockDripCampaignRepo = {
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        {
          campaign_id: 1,
          app_id: 10,
          step_id: 5,
          step_number: 1,
          delay_days: 0,
          step_time: '09:00',
          notification_payload_json: '{"title":"Hi"}',
        },
      ]),
    })),
  };

  const mockDripSentLogRepo = {
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn().mockResolvedValue({ id: 1 }),
    createQueryBuilder: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    })),
  };

  const mockPushService = {
    sendPushNotification: jest.fn().mockResolvedValue({ notificationId: 10 }),
  };

  const mockRedisService = {
    client: {
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    },
  };

  const mockPushQueue = {
    add: jest.fn().mockResolvedValue({ id: 'push_job_1' }),
  };

  const mockCronQueue = {
    upsertJobScheduler: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        CronQueueScheduler,
        CronQueueProcessor,
        { provide: PushService, useValue: mockPushService },
        { provide: getRepositoryToken(SystemSettings), useValue: mockSystemSettingsRepo },
        { provide: getRepositoryToken(AppEntity), useValue: mockAppRepo },
        { provide: getRepositoryToken(Notification), useValue: mockNotificationRepo },
        { provide: getRepositoryToken(DeviceToken), useValue: mockDeviceTokenRepo },
        { provide: getRepositoryToken(DripCampaign), useValue: mockDripCampaignRepo },
        { provide: getRepositoryToken(DripSentLog), useValue: mockDripSentLogRepo },
        { provide: RedisService, useValue: mockRedisService },
        { provide: `BullQueue_${PUSH_QUEUE_NAME}`, useValue: mockPushQueue },
        { provide: `BullQueue_${CRON_QUEUE_NAME}`, useValue: mockCronQueue },
      ],
    }).compile();

    service = module.get<CronService>(CronService);
    scheduler = module.get<CronQueueScheduler>(CronQueueScheduler);
    processor = module.get<CronQueueProcessor>(CronQueueProcessor);
  });

  describe('CronQueueScheduler', () => {
    it('should register repeatable jobs on onModuleInit and handle error', async () => {
      await scheduler.onModuleInit();
      expect(mockCronQueue.upsertJobScheduler).toHaveBeenCalledTimes(2);

      mockCronQueue.upsertJobScheduler.mockRejectedValueOnce(new Error('BullMQ failure'));
      await expect(scheduler.registerRepeatableJobs()).resolves.toBeUndefined();
    });

    it('should get repeatable jobs, triggerCleanupNow, and triggerSchedulerNow', async () => {
      mockCronQueue.getJobSchedulers = jest.fn().mockResolvedValue([{ id: 1 }]);
      mockCronQueue.add = jest.fn().mockResolvedValue({ id: 'job_1' });

      await scheduler.getRepeatableJobs();
      expect(mockCronQueue.getJobSchedulers).toHaveBeenCalled();

      await scheduler.triggerCleanupNow();
      expect(mockCronQueue.add).toHaveBeenCalledWith(CRON_JOB_CLEANUP, expect.anything(), expect.anything());

      await scheduler.triggerSchedulerNow();
      expect(mockCronQueue.add).toHaveBeenCalledWith(CRON_JOB_SCHEDULER, expect.anything(), expect.anything());
    });
  });

  describe('CronQueueProcessor', () => {
    it('should delegate cleanup and scheduler jobs correctly', async () => {
      const cleanupSpy = jest.spyOn(service, 'handleCleanup').mockResolvedValue(undefined as any);
      const schedulerSpy = jest.spyOn(service, 'handleTimezoneScheduler').mockResolvedValue(undefined as any);

      await processor.process({ name: CRON_JOB_CLEANUP, data: {} } as any);
      expect(cleanupSpy).toHaveBeenCalled();

      await processor.process({ name: CRON_JOB_SCHEDULER, data: {} } as any);
      expect(schedulerSpy).toHaveBeenCalled();

      const ignored = await processor.process({ name: 'unknown-job', data: {} } as any);
      expect(ignored).toEqual({ ignored: true });
    });
  });

  describe('CronService', () => {
    it('should handle notification cleanup', async () => {
      await expect(service.handleCleanup()).resolves.toBeUndefined();
      expect(mockAppRepo.find).toHaveBeenCalled();
    });

    it('should handle timezone scheduler (regular scheduled notifications + drip)', async () => {
      await expect(service.handleTimezoneScheduler()).resolves.toBeUndefined();
      expect(mockNotificationRepo.update).toHaveBeenCalled();
      expect(mockPushQueue.add).toHaveBeenCalled();
    });
  });
});
