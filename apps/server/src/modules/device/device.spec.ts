import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { DeviceToken as DeviceTokenEntity } from './device_token.entity';

describe('DeviceModule (Unit Tests)', () => {
  let controller: DeviceController;
  let service: DeviceService;

  const mockDevice: DeviceTokenEntity = {
    id: 1,
    app_id: 10,
    external_user_id: 'user_1',
    subscription_json: JSON.stringify({ endpoint: 'https://push.example.com/1' }),
    timezone: 'UTC',
    is_active: true,
    drip_anchor_date: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    app: null as any,
    notification_logs: [],
  };

  const mockQb = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockDeviceRepo = {
    createQueryBuilder: jest.fn(() => mockQb),
    save: jest.fn((d) => Promise.resolve({ ...d, id: d.id || 1 })),
    create: jest.fn((d) => ({ ...d })),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [
        DeviceService,
        { provide: getRepositoryToken(DeviceTokenEntity), useValue: mockDeviceRepo },
      ],
    }).compile();

    controller = module.get<DeviceController>(DeviceController);
    service = module.get<DeviceService>(DeviceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('registerDevice', () => {
    const sub = {
      endpoint: 'https://push.example.com/1',
      keys: { p256dh: 'p256', auth: 'auth' },
    };

    it('should update existing device if found', async () => {
      mockQb.getOne.mockResolvedValueOnce({ ...mockDevice });

      const res = await service.registerDevice(10, 'user_1', sub, 'America/New_York');
      expect(res.timezone).toBe('America/New_York');
      expect(mockDeviceRepo.save).toHaveBeenCalled();
    });

    it('should create new device if not found', async () => {
      mockQb.getOne.mockResolvedValueOnce(null);

      const res = await service.registerDevice(10, 'user_2', sub);
      expect(mockDeviceRepo.create).toHaveBeenCalled();
      expect(mockDeviceRepo.save).toHaveBeenCalled();
      expect(res.external_user_id).toBe('user_2');
    });

    it('should handle conflict error 23505 and update conflict device', async () => {
      mockQb.getOne.mockResolvedValueOnce(null);
      mockDeviceRepo.save.mockRejectedValueOnce({ code: '23505' });
      mockDeviceRepo.findOne.mockResolvedValueOnce({ ...mockDevice });

      const res = await service.registerDevice(10, 'user_1', sub, 'UTC');
      expect(res.is_active).toBe(true);
    });

    it('should rethrow unknown errors', async () => {
      mockQb.getOne.mockResolvedValueOnce(null);
      mockDeviceRepo.save.mockRejectedValueOnce(new Error('Fatal DB failure'));

      await expect(service.registerDevice(10, 'user_1', sub)).rejects.toThrow('Fatal DB failure');
    });
  });

  describe('unregisterDevice', () => {
    it('should unregister device with endpoint', async () => {
      await service.unregisterDevice(10, 'user_1', 'https://push.example.com/1');
      expect(mockQb.execute).toHaveBeenCalled();
    });

    it('should unregister device without endpoint', async () => {
      await service.unregisterDevice(10, 'user_1');
      expect(mockDeviceRepo.update).toHaveBeenCalledWith(
        { app_id: 10, external_user_id: 'user_1' },
        { is_active: false }
      );
    });

    it('should unregister all devices for app and system-wide', async () => {
      await service.unregisterAllDevicesForApp(10);
      expect(mockDeviceRepo.update).toHaveBeenCalledWith({ app_id: 10 }, { is_active: false });

      await service.unregisterAllDevicesSystemWide();
      expect(mockDeviceRepo.update).toHaveBeenCalledWith({}, { is_active: false });
    });
  });

  describe('getDevicesByApp & getDeviceById', () => {
    it('should get devices with or without externalUserIds', async () => {
      mockDeviceRepo.find.mockResolvedValueOnce([mockDevice]);
      const devices = await service.getDevicesByApp(10);
      expect(devices).toHaveLength(1);

      mockDeviceRepo.find.mockResolvedValueOnce([mockDevice]);
      const filtered = await service.getDevicesByApp(10, ['user_1']);
      expect(filtered).toHaveLength(1);
    });

    it('should get device by id or throw NotFoundException', async () => {
      mockDeviceRepo.findOne.mockResolvedValueOnce(mockDevice);
      const dev = await service.getDeviceById(1);
      expect(dev.id).toBe(1);

      mockDeviceRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.getDeviceById(99)).rejects.toThrow(NotFoundException);
    });
  });
});

