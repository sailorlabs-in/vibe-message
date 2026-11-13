import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InternalNotificationService } from '../system/internal-notification.service';
import { PushService } from '../push/push.service';
import { DeviceService } from '../device/device.service';
import { DripService } from '../drip/drip.service';
import { UserService } from '../user/user.service';

describe('AppController (Unit Tests)', () => {
  let controller: AppController;

  const mockApp = {
    id: 1,
    public_app_id: 'app_123',
    public_key: 'pk_123',
    secret_key: 'sk_123',
    name: 'My App',
    currentUserRole: 'owner',
  };

  const mockAppService = {
    getUserApps: jest.fn().mockResolvedValue([mockApp]),
    createApp: jest.fn().mockResolvedValue(mockApp),
    getAppById: jest.fn().mockResolvedValue(mockApp),
    updateApp: jest.fn().mockResolvedValue(mockApp),
    rotateAppSecret: jest.fn().mockResolvedValue(mockApp),
    deleteApp: jest.fn().mockResolvedValue(undefined),
    getAppMembers: jest.fn().mockResolvedValue([{ id: 10, role: 'moderator' }]),
    shareApp: jest.fn().mockResolvedValue({ success: true }),
    updateAppMemberRole: jest.fn().mockResolvedValue({ success: true }),
    removeAppMember: jest.fn().mockResolvedValue({ success: true }),
  };

  const mockInternalNotificationService = {
    getOrCreateInternalApp: jest.fn().mockResolvedValue({ public_app_id: 'sys_app', public_key: 'sys_pk' }),
  };

  const mockPushService = {
    getAppNotifications: jest.fn().mockResolvedValue([{ id: 100 }]),
    clearAppNotifications: jest.fn().mockResolvedValue(undefined),
    deleteNotification: jest.fn().mockResolvedValue(undefined),
    getNotificationPayloadPreview: jest.fn().mockResolvedValue({ title: 'Preview' }),
    getNotificationLogs: jest.fn().mockResolvedValue([
      {
        id: 1,
        notification_id: 100,
        device_token_id: 2,
        status: 'sent',
        device_token: { id: 2, external_user_id: 'u1', subscription_json: '{"endpoint":"https://fcm.googleapis.com"}' },
      },
      {
        id: 2,
        notification_id: 100,
        device_token_id: 3,
        status: 'failed',
        device_token: null,
      },
    ]),
    sendPushNotification: jest.fn().mockResolvedValue({ notificationId: 100, sent: 1, failed: 0, queued: false }),
  };

  const mockDeviceService = {
    getDevicesByApp: jest.fn().mockResolvedValue([
      { id: 1, external_user_id: 'u1', is_active: true, subscription_json: '{}' },
    ]),
    unregisterAllDevicesForApp: jest.fn().mockResolvedValue(undefined),
  };

  const mockDripService = {
    getDripCampaign: jest.fn().mockResolvedValue({ id: 5, name: 'Drip' }),
    saveDripCampaign: jest.fn().mockResolvedValue({ id: 5, name: 'Drip' }),
  };

  const mockUserService = {
    getUserWarnings: jest.fn().mockResolvedValue([{ id: 1, message: 'Warning' }]),
  };

  const req = { user: { userId: 1, role: 'ADMIN' } };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAppService.getAppById.mockResolvedValue({ ...mockApp, currentUserRole: 'owner' });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppService, useValue: mockAppService },
        { provide: InternalNotificationService, useValue: mockInternalNotificationService },
        { provide: PushService, useValue: mockPushService },
        { provide: DeviceService, useValue: mockDeviceService },
        { provide: DripService, useValue: mockDripService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should get user apps', async () => {
    const res = await controller.getUserApps(req, '2');
    expect(mockAppService.getUserApps).toHaveBeenCalledWith(1, 'ADMIN', 2);
    expect(res.success).toBe(true);
  });

  it('should create app', async () => {
    const res = await controller.createApp(req, { name: 'New App' });
    expect(mockAppService.createApp).toHaveBeenCalledWith(1, { name: 'New App' });
    expect(res.success).toBe(true);
  });

  it('should get system app public info', async () => {
    const res = await controller.getSystemAppPublic();
    expect(res.data.public_app_id).toBe('sys_app');
  });

  it('should get app by id, update and rotate secret and delete', async () => {
    await controller.getAppById(req, 'app_123');
    expect(mockAppService.getAppById).toHaveBeenCalledWith('app_123', 1, 'ADMIN');

    await controller.updateApp(req, 'app_123', { name: 'Updated' });
    expect(mockAppService.updateApp).toHaveBeenCalledWith('app_123', 1, 'ADMIN', { name: 'Updated' });

    await controller.rotateAppSecret(req, 'app_123');
    expect(mockAppService.rotateAppSecret).toHaveBeenCalledWith('app_123', 1, 'ADMIN');

    const delRes = await controller.deleteApp(req, 'app_123');
    expect(mockAppService.deleteApp).toHaveBeenCalledWith('app_123', 1, 'ADMIN');
    expect(delRes.success).toBe(true);
  });

  it('should get notifications and preview', async () => {
    const notifs = await controller.getAppNotifications(req, 'app_123', 'true');
    expect(mockPushService.getAppNotifications).toHaveBeenCalledWith(1, 100, true);
    expect(notifs.success).toBe(true);

    const prev = await controller.getNotificationPayloadPreview(req, 'app_123', '100');
    expect(mockPushService.getNotificationPayloadPreview).toHaveBeenCalledWith(1, 100);
    expect(prev.success).toBe(true);

    const logs = await controller.getNotificationLogs(req, 'app_123', '100');
    expect(logs.success).toBe(true);
    expect(logs.data).toHaveLength(2);
  });

  it('should prevent viewer role from clearing notifications, deleting notifications, clearing subscribers, and sending push', async () => {
    mockAppService.getAppById.mockResolvedValue({ ...mockApp, currentUserRole: 'viewer' });

    await expect(controller.clearAppNotifications(req, 'app_123')).rejects.toThrow(ForbiddenException);
    await expect(controller.deleteNotification(req, 'app_123', '100')).rejects.toThrow(ForbiddenException);
    await expect(controller.clearAppSubscribers(req, 'app_123')).rejects.toThrow(ForbiddenException);
    await expect(controller.sendPushNotificationDirectly(req, 'app_123', {})).rejects.toThrow(ForbiddenException);
    await expect(controller.saveDripCampaign(req, 'app_123', {})).rejects.toThrow(ForbiddenException);
  });

  it('should allow owner to clear notifications, delete notification, clear subscribers, and send push', async () => {
    await controller.clearAppNotifications(req, 'app_123');
    expect(mockPushService.clearAppNotifications).toHaveBeenCalledWith(1);

    await controller.deleteNotification(req, 'app_123', '100');
    expect(mockPushService.deleteNotification).toHaveBeenCalledWith(1, 100);

    const subs = await controller.getAppSubscribers(req, 'app_123');
    expect(subs.data).toHaveLength(1);

    await controller.clearAppSubscribers(req, 'app_123');
    expect(mockDeviceService.unregisterAllDevicesForApp).toHaveBeenCalledWith(1);

    const pushRes = await controller.sendPushNotificationDirectly(req, 'app_123', {
      targets: { externalUserIds: ['u1'] },
      notification: { title: 'Test' },
    });
    expect(pushRes.success).toBe(true);
  });

  it('should get user warnings and drip campaign', async () => {
    const warnings = await controller.getUserWarnings(req);
    expect(warnings.success).toBe(true);

    const drip = await controller.getDripCampaign(req, 'app_123');
    expect(drip.success).toBe(true);

    const saveDrip = await controller.saveDripCampaign(req, 'app_123', { name: 'Campaign', steps: [] });
    expect(saveDrip.success).toBe(true);
  });

  it('should manage app members', async () => {
    const members = await controller.getMembers(req, 'app_123');
    expect(members.success).toBe(true);

    const share = await controller.shareApp(req, 'app_123', { email: 'guest@example.com', role: 'moderator' });
    expect(share.success).toBe(true);

    const updateRole = await controller.updateMemberRole(req, 'app_123', '10', { role: 'viewer' });
    expect(updateRole.success).toBe(true);

    const remove = await controller.removeMember(req, 'app_123', '10');
    expect(remove.success).toBe(true);
  });
});

