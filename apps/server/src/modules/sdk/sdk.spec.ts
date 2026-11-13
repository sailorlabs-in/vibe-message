import { Test, TestingModule } from '@nestjs/testing';
import { SdkController } from './sdk.controller';
import { SdkService } from './sdk.service';
import { AppService } from '../app/app.service';
import { DeviceService } from '../device/device.service';
import { PushService } from '../push/push.service';
import { encryptPayload } from '../../utils/crypto';

describe('SdkModule (Unit Tests)', () => {
  let controller: SdkController;
  let service: SdkService;

  const mockApp = {
    id: 1,
    public_app_id: 'app_123',
    public_key: 'pk_12345678901234567890123456789012',
    secret_key: 'sk_123',
  };

  const mockAppService = {
    getAppByPublicId: jest.fn(),
    validateSdkCredentials: jest.fn(),
  };

  const mockDeviceService = {
    registerDevice: jest.fn().mockResolvedValue({ id: 5 }),
    unregisterDevice: jest.fn().mockResolvedValue(undefined),
  };

  const mockPushService = {
    updateLogStatus: jest.fn().mockResolvedValue(undefined),
  };

  const mockRes: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SdkController],
      providers: [
        SdkService,
        { provide: AppService, useValue: mockAppService },
        { provide: DeviceService, useValue: mockDeviceService },
        { provide: PushService, useValue: mockPushService },
      ],
    }).compile();

    controller = module.get<SdkController>(SdkController);
    service = module.get<SdkService>(SdkService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should return vapid public key', () => {
    const res = controller.getVapidPublicKey();
    expect(res.success).toBe(true);
    expect(res.data.publicKey).toBeDefined();
  });

  describe('registerDevice', () => {
    it('should return 400 on missing appId or payload', async () => {
      await controller.registerDevice({}, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if app not found', async () => {
      mockAppService.getAppByPublicId.mockResolvedValueOnce(null);
      await controller.registerDevice({ appId: 'app_1', payload: 'xxx' }, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 on invalid encrypted payload', async () => {
      mockAppService.getAppByPublicId.mockResolvedValueOnce(mockApp);
      await controller.registerDevice({ appId: 'app_123', payload: 'invalid-cipher' }, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should register device on valid encrypted payload', async () => {
      mockAppService.getAppByPublicId.mockResolvedValueOnce(mockApp);
      mockAppService.validateSdkCredentials.mockResolvedValueOnce(mockApp);

      const payload = encryptPayload(
        {
          publicKey: mockApp.public_key,
          externalUserId: 'usr_1',
          subscription: { endpoint: 'https://push.com', keys: { p256dh: 'p', auth: 'a' } },
          timezone: 'UTC',
        },
        mockApp.public_key
      );

      await controller.registerDevice({ appId: 'app_123', payload }, mockRes);
      expect(mockDeviceService.registerDevice).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('unregisterDevice', () => {
    it('should return 400 on missing appId or payload', async () => {
      await controller.unregisterDevice({}, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if app not found', async () => {
      mockAppService.getAppByPublicId.mockResolvedValueOnce(null);
      await controller.unregisterDevice({ appId: 'app_1', payload: 'xxx' }, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should unregister device on valid payload', async () => {
      mockAppService.getAppByPublicId.mockResolvedValueOnce(mockApp);

      const payload = encryptPayload(
        { externalUserId: 'usr_1', endpoint: 'https://push.com' },
        mockApp.public_key
      );

      await controller.unregisterDevice({ appId: 'app_123', payload }, mockRes);
      expect(mockDeviceService.unregisterDevice).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('trackNotification', () => {
    it('should validate logId and status', async () => {
      await controller.trackNotification({} as any, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);

      await controller.trackNotification({ logId: -1, status: 'DELIVERED' } as any, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);

      await controller.trackNotification({ logId: 10, status: 'UNKNOWN' as any }, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should update log status when valid', async () => {
      await controller.trackNotification({ logId: 10, status: 'DELIVERED' }, mockRes);
      expect(mockPushService.updateLogStatus).toHaveBeenCalledWith(10, 'DELIVERED', undefined);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors gracefully', async () => {
      mockPushService.updateLogStatus.mockRejectedValueOnce(new Error('DB failure'));
      await controller.trackNotification({ logId: 10, status: 'FAILED', errorMessage: 'Err' }, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});

