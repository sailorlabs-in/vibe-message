import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DripController } from './drip.controller';
import { DripService } from './drip.service';
import { DripCampaign, DripStep } from './drip.entity';

describe('DripModule (Unit Tests)', () => {
  let controller: DripController;
  let service: DripService;

  const mockCampaign: DripCampaign = {
    id: 1,
    app_id: 10,
    name: 'Welcome Drip',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    app: null as any,
    steps: [
      {
        id: 2,
        campaign_id: 1,
        step_number: 2,
        delay_days: 3,
        scheduled_at_local_time: '10:00:00',
        notification_payload_json: '{}',
        created_at: new Date(),
        campaign: null as any,
      },
      {
        id: 1,
        campaign_id: 1,
        step_number: 1,
        delay_days: 0,
        scheduled_at_local_time: '09:00:00',
        notification_payload_json: '{}',
        created_at: new Date(),
        campaign: null as any,
      },
    ],
  };

  const mockCampaignRepo = {
    findOne: jest.fn(),
    create: jest.fn((dto) => ({ ...dto, id: 1 })),
    update: jest.fn(),
  };

  const mockStepRepo = {
    create: jest.fn((dto) => ({ ...dto, id: 10 })),
  };

  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 1 })),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DripController],
      providers: [
        DripService,
        { provide: getRepositoryToken(DripCampaign), useValue: mockCampaignRepo },
        { provide: getRepositoryToken(DripStep), useValue: mockStepRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    controller = module.get<DripController>(DripController);
    service = module.get<DripService>(DripService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getDripCampaign', () => {
    it('should return null if no campaign found', async () => {
      mockCampaignRepo.findOne.mockResolvedValueOnce(null);
      const res = await service.getDripCampaign(10);
      expect(res).toBeNull();
    });

    it('should sort steps and return campaign', async () => {
      mockCampaignRepo.findOne.mockResolvedValueOnce({
        ...mockCampaign,
        steps: [...mockCampaign.steps],
      });

      const res = await service.getDripCampaign(10);
      expect(res).not.toBeNull();
      expect(res?.steps[0].step_number).toBe(1);
      expect(res?.steps[1].step_number).toBe(2);
    });
  });

  describe('saveDripCampaign', () => {
    it('should save campaign and steps in transaction', async () => {
      const steps = [
        { dayDelay: 0, time: '09:00', title: 'Welcome', body: 'Hello' },
        { dayDelay: 2, time: '14:30:00', title: 'Day 2', body: 'Followup' },
      ];

      const res = await service.saveDripCampaign(10, 'Onboarding', steps, true);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(3); // 1 campaign + 2 steps
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(res.steps).toHaveLength(2);
    });

    it('should rollback transaction on error', async () => {
      mockQueryRunner.manager.save.mockRejectedValueOnce(new Error('DB write failed'));

      await expect(service.saveDripCampaign(10, 'Test', [])).rejects.toThrow('DB write failed');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('deactivateDripCampaign', () => {
    it('should throw NotFoundException if no campaign updated', async () => {
      mockCampaignRepo.update.mockResolvedValueOnce({ affected: 0 });
      await expect(service.deactivateDripCampaign(10)).rejects.toThrow(NotFoundException);
    });

    it('should deactivate campaign successfully', async () => {
      mockCampaignRepo.update.mockResolvedValueOnce({ affected: 1 });
      await expect(service.deactivateDripCampaign(10)).resolves.toBeUndefined();
    });
  });
});

