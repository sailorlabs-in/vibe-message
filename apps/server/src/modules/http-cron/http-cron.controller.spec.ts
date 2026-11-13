import { Test, TestingModule } from '@nestjs/testing';
import { HttpCronController } from './http-cron.controller';
import { HttpCronService } from './http-cron.service';

describe('HttpCronController (Unit Tests)', () => {
  let controller: HttpCronController;

  const mockJob = {
    id: 1,
    title: 'Health Ping',
    url: 'https://example.com/ping',
    schedule: '*/5 * * * *',
    is_enabled: true,
  };

  const mockCronService = {
    findAll: jest.fn().mockResolvedValue([mockJob]),
    findOne: jest.fn().mockResolvedValue(mockJob),
    create: jest.fn().mockResolvedValue(mockJob),
    update: jest.fn().mockResolvedValue(mockJob),
    delete: jest.fn().mockResolvedValue({ success: true }),
    runNow: jest.fn().mockResolvedValue({ success: true, message: 'Execution scheduled immediately' }),
    toggleEnabled: jest.fn().mockResolvedValue({ ...mockJob, is_enabled: false }),
    getLogs: jest.fn().mockResolvedValue([{ id: 10, status: 'success' }]),
  };

  const req = { user: { userId: 1 } };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HttpCronController],
      providers: [{ provide: HttpCronService, useValue: mockCronService }],
    }).compile();

    controller = module.get<HttpCronController>(HttpCronController);
  });

  it('should list cron jobs', async () => {
    const res = await controller.listCronJobs(req);
    expect(mockCronService.findAll).toHaveBeenCalledWith(1);
    expect(res.data).toEqual([mockJob]);
  });

  it('should create cron job', async () => {
    const dto = { title: 'Ping', url: 'https://example.com', schedule: '* * * * *' };
    const res = await controller.createCronJob(req, dto as any);
    expect(mockCronService.create).toHaveBeenCalledWith(1, dto);
    expect(res.data).toEqual(mockJob);
  });

  it('should get cron job details', async () => {
    const res = await controller.getCronJob(req, 1);
    expect(mockCronService.findOne).toHaveBeenCalledWith(1, 1);
    expect(res.data).toEqual(mockJob);
  });

  it('should update cron job', async () => {
    const dto = { title: 'Updated' };
    const res = await controller.updateCronJob(req, 1, dto);
    expect(mockCronService.update).toHaveBeenCalledWith(1, 1, dto);
    expect(res.data).toEqual(mockJob);
  });

  it('should delete cron job', async () => {
    const res = await controller.deleteCronJob(req, 1);
    expect(mockCronService.delete).toHaveBeenCalledWith(1, 1);
    expect(res.success).toBe(true);
  });

  it('should trigger runNow', async () => {
    const res = await controller.runNow(req, 1);
    expect(mockCronService.runNow).toHaveBeenCalledWith(1, 1);
    expect(res.success).toBe(true);
  });

  it('should toggle cron job', async () => {
    const res = await controller.toggleCronJob(req, 1);
    expect(mockCronService.toggleEnabled).toHaveBeenCalledWith(1, 1);
    expect(res.data.is_enabled).toBe(false);
  });

  it('should get logs with and without limit', async () => {
    const resDefault = await controller.getLogs(req, 1);
    expect(mockCronService.getLogs).toHaveBeenCalledWith(1, 1, 50);
    expect(resDefault.data).toHaveLength(1);

    await controller.getLogs(req, 1, '10');
    expect(mockCronService.getLogs).toHaveBeenCalledWith(1, 1, 10);
  });
});

