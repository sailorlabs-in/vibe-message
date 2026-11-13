import { Test, TestingModule } from '@nestjs/testing';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { AppService } from '../app/app.service';
import { encryptPayload } from '../../utils/crypto';

describe('PushController (Unit Tests)', () => {
  let controller: PushController;

  const mockApp = {
    id: 1,
    public_app_id: 'app_123',
    secret_key: 'sk_test_secret_key_1234567890123456',
    is_active: true,
  };

  const mockAppService = {
    getAppByPublicId: jest.fn(),
    validateAppCredentials: jest.fn(),
  };

  const mockPushService = {
    sendPushNotification: jest.fn().mockResolvedValue({
      notificationId: 10,
      sent: 2,
      failed: 0,
      queued: false,
    }),
  };

  const mockRes: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushController],
      providers: [
        { provide: AppService, useValue: mockAppService },
        { provide: PushService, useValue: mockPushService },
      ],
    }).compile();

    controller = module.get<PushController>(PushController);
  });

  it('should return 400 if appId or payload missing', async () => {
    await controller.sendPush({}, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);

    await controller.sendPush({ appId: 'app_1' }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should return 404 if app not found', async () => {
    mockAppService.getAppByPublicId.mockResolvedValueOnce(null);
    await controller.sendPush({ appId: 'unknown', payload: 'cipher' }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  it('should return 400 if payload decryption fails', async () => {
    mockAppService.getAppByPublicId.mockResolvedValueOnce(mockApp);
    await controller.sendPush({ appId: 'app_123', payload: 'invalid-encrypted-data' }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should decrypt valid payload, validate credentials and send push', async () => {
    mockAppService.getAppByPublicId.mockResolvedValueOnce(mockApp);
    mockAppService.validateAppCredentials.mockResolvedValueOnce(mockApp);

    const payload = encryptPayload(
      {
        targets: { externalUserIds: ['u1'] },
        notification: { title: 'Test Push', body: 'Push body' },
      },
      mockApp.secret_key
    );

    await controller.sendPush({ appId: 'app_123', payload }, mockRes);
    expect(mockPushService.sendPushNotification).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.anything() })
    );
  });

  it('should handle errors with status and generic error', async () => {
    mockAppService.getAppByPublicId.mockRejectedValueOnce({ status: 403, message: 'Forbidden' });
    await controller.sendPush({ appId: 'app_123', payload: 'x' }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(403);

    mockAppService.getAppByPublicId.mockRejectedValueOnce(new Error('Unknown crash'));
    await controller.sendPush({ appId: 'app_123', payload: 'x' }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
});

