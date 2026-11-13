import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { HttpCronService } from './http-cron.service';
import { CronJob } from './entities/cron-job.entity';
import { CronJobLog } from './entities/cron-job-log.entity';
import { User } from '../user/user.entity';
import { HttpCronQueueScheduler } from './http-cron-queue.scheduler';

describe('HttpCronService (Unit Tests)', () => {
  let service: HttpCronService;

  const mockCronJob: CronJob = {
    id: 1,
    user_id: 1,
    title: 'Health Check',
    url: 'https://example.com/health',
    method: 'GET',
    schedule: '*/5 * * * *',
    timezone: 'UTC',
    headers: { 'X-Custom': '1' },
    body: null,
    timeout_seconds: 30,
    retries: 0,
    is_enabled: true,
    notify_on_failure: true,
    last_run_at: null,
    last_status: null,
    last_status_code: null,
    last_duration_ms: null,
    created_at: new Date(),
    updated_at: new Date(),
    user: null as any,
    logs: [],
  };

  const mockCronJobRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn((dto) => ({ ...dto, id: 1 })),
    save: jest.fn((entity) => Promise.resolve({ ...entity })),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockCronJobLogRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
  };

  const mockScheduler = {
    registerScheduler: jest.fn().mockResolvedValue(undefined),
    removeScheduler: jest.fn().mockResolvedValue(undefined),
    triggerNow: jest.fn().mockResolvedValue({ id: 'job_1' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    delete process.env.IS_SELF_HOSTED;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpCronService,
        { provide: getRepositoryToken(CronJob), useValue: mockCronJobRepo },
        { provide: getRepositoryToken(CronJobLog), useValue: mockCronJobLogRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: HttpCronQueueScheduler, useValue: mockScheduler },
      ],
    }).compile();

    service = module.get<HttpCronService>(HttpCronService);
  });

  describe('Validation & create', () => {
    it('should throw BadRequestException on invalid URL', async () => {
      await expect(service.create(1, { title: 'T', url: '', schedule: '* * * * *' })).rejects.toThrow(BadRequestException);
      await expect(service.create(1, { title: 'T', url: 'ftp://bad.com', schedule: '* * * * *' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on invalid schedule', async () => {
      await expect(service.create(1, { title: 'T', url: 'https://ok.com', schedule: '' })).rejects.toThrow(BadRequestException);
      await expect(service.create(1, { title: 'T', url: 'https://ok.com', schedule: 'too few parts' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if title is empty', async () => {
      await expect(service.create(1, { title: '   ', url: 'https://ok.com', schedule: '* * * * *' })).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.create(99, { title: 'T', url: 'https://ok.com', schedule: '* * * * *' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user reached cron limit', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 1, cron_job_limit: 2 });
      mockCronJobRepo.count.mockResolvedValueOnce(2);

      await expect(service.create(1, { title: 'T', url: 'https://ok.com', schedule: '* * * * *' })).rejects.toThrow(ForbiddenException);
    });

    it('should create cron job and register scheduler', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 1, cron_job_limit: 5 });
      mockCronJobRepo.count.mockResolvedValueOnce(1);

      const res = await service.create(1, {
        title: 'Daily Ping',
        url: 'https://example.com/ping',
        schedule: '0 0 * * *',
        timeout_seconds: 60,
        retries: 2,
      });

      expect(mockCronJobRepo.create).toHaveBeenCalled();
      expect(mockCronJobRepo.save).toHaveBeenCalled();
      expect(mockScheduler.registerScheduler).toHaveBeenCalled();
      expect(res.title).toBe('Daily Ping');
    });
  });

  describe('findAll & findOne', () => {
    it('should find all cron jobs for user', async () => {
      mockCronJobRepo.find.mockResolvedValueOnce([mockCronJob]);
      const res = await service.findAll(1);
      expect(res).toEqual([mockCronJob]);
    });

    it('should find one or throw NotFoundException', async () => {
      mockCronJobRepo.findOne.mockResolvedValueOnce(mockCronJob);
      const res = await service.findOne(1, 1);
      expect(res).toEqual(mockCronJob);

      mockCronJobRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne(99, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if job not found', async () => {
      mockCronJobRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.update(99, 1, { title: 'New' })).rejects.toThrow(NotFoundException);
    });

    it('should update fields and register/remove scheduler', async () => {
      mockCronJobRepo.findOne.mockResolvedValueOnce({ ...mockCronJob, is_enabled: true });

      const res = await service.update(1, 1, {
        title: 'Updated',
        url: 'https://new.com',
        schedule: '*/10 * * * *',
        is_enabled: false,
      });

      expect(res.title).toBe('Updated');
      expect(mockScheduler.removeScheduler).toHaveBeenCalledWith(1);

      // Re-enable
      mockCronJobRepo.findOne.mockResolvedValueOnce({ ...mockCronJob, is_enabled: false });
      await service.update(1, 1, { is_enabled: true });
      expect(mockScheduler.registerScheduler).toHaveBeenCalled();
    });

    it('should validate title when updating', async () => {
      mockCronJobRepo.findOne.mockResolvedValueOnce({ ...mockCronJob });
      await expect(service.update(1, 1, { title: '   ' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('toggleEnabled', () => {
    it('should toggle state and update scheduler', async () => {
      mockCronJobRepo.findOne.mockResolvedValueOnce({ ...mockCronJob, is_enabled: true });
      let res = await service.toggleEnabled(1, 1);
      expect(res.is_enabled).toBe(false);
      expect(mockScheduler.removeScheduler).toHaveBeenCalledWith(1);

      mockCronJobRepo.findOne.mockResolvedValueOnce({ ...mockCronJob, is_enabled: false });
      res = await service.toggleEnabled(1, 1);
      expect(res.is_enabled).toBe(true);
      expect(mockScheduler.registerScheduler).toHaveBeenCalled();

      mockCronJobRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.toggleEnabled(99, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete & runNow & getLogs', () => {
    it('should delete job and remove scheduler', async () => {
      mockCronJobRepo.findOne.mockResolvedValueOnce(mockCronJob);
      const res = await service.delete(1, 1);
      expect(mockScheduler.removeScheduler).toHaveBeenCalledWith(1);
      expect(mockCronJobRepo.remove).toHaveBeenCalledWith(mockCronJob);
      expect(res.success).toBe(true);

      mockCronJobRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.delete(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('should trigger runNow or throw NotFoundException', async () => {
      mockCronJobRepo.findOne.mockResolvedValueOnce(mockCronJob);
      const res = await service.runNow(1, 1);
      expect(mockScheduler.triggerNow).toHaveBeenCalledWith(1);
      expect(res.success).toBe(true);

      mockCronJobRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.runNow(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('should get logs with limit or throw NotFoundException', async () => {
      mockCronJobRepo.findOne.mockResolvedValueOnce(mockCronJob);
      mockCronJobLogRepo.find.mockResolvedValueOnce([{ id: 10 }]);

      const logs = await service.getLogs(1, 1, 20);
      expect(logs).toHaveLength(1);
      expect(mockCronJobLogRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 })
      );

      mockCronJobRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.getLogs(99, 1)).rejects.toThrow(NotFoundException);
    });
  });
});

