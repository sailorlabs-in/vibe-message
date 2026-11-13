import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PushService } from './push.service';
import { Notification as NotificationEntity } from './notification.entity';
import { NotificationLog as NotificationLogEntity } from './notification_log.entity';
import { DeviceToken as DeviceTokenEntity } from '../device/device_token.entity';
import { RedisService } from '../redis/redis.service';
import { webpush } from '../../utils/webPush';
import { PUSH_QUEUE_NAME } from '../queue/queue.constants';

describe('PushService (Unit Tests)', () => {
  let service: PushService;

  const mockNotification: NotificationEntity = {
    id: 1,
    app_id: 10,
    payload_json: '{"title":"Test","body":"Hello"}',
    is_silent: false,
    scheduled_at: null,
    target_user_ids: null,
    dispatched_at: null,
    created_at: new Date(),
    app: null as any,
    logs: [],
  };

  const mockDeviceToken: DeviceTokenEntity = {
    id: 1,
    app_id: 10,
    external_user_id: 'u1',
    subscription_json: JSON.stringify({
      endpoint: 'https://push.example.com',
      keys: { p256dh: 'pk', auth: 'auth' },
    }),
    timezone: 'UTC',
    is_active: true,
    drip_anchor_date: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    app: null as any,
    notification_logs: [],
  };

  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      save: jest.fn((e) => Promise.resolve({ ...e, id: e.id || 1 })),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockDeviceToken]),
      })),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  const mockNotificationRepo = {
    create: jest.fn((dto) => ({ ...dto, id: 1 })),
    save: jest.fn((e) => Promise.resolve(e)),
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockNotification]),
    })),
  };

  const mockNotificationLogRepo = {
    create: jest.fn((dto) => ({ ...dto, id: 50 })),
    save: jest.fn((e) => Promise.resolve(e)),
    find: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockDeviceTokenRepo = {
    find: jest.fn().mockResolvedValue([mockDeviceToken]),
  };

  const mockRedisService = {};

  const mockPushQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job_1' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushService,
        { provide: getRepositoryToken(NotificationEntity), useValue: mockNotificationRepo },
        { provide: getRepositoryToken(NotificationLogEntity), useValue: mockNotificationLogRepo },
        { provide: getRepositoryToken(DeviceTokenEntity), useValue: mockDeviceTokenRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: RedisService, useValue: mockRedisService },
        { provide: `BullQueue_${PUSH_QUEUE_NAME}`, useValue: mockPushQueue },
      ],
    }).compile();

    service = module.get<PushService>(PushService);
  });

  describe('sendPushNotification', () => {
    it('should create notification and enqueue immediate delivery', async () => {
      const res = await service.sendPushNotification(10, { title: 'Immediate Push', body: 'Body' });
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(mockPushQueue.add).toHaveBeenCalledWith(
        'deliver-push',
        expect.objectContaining({ appId: 10 }),
        expect.anything()
      );
      expect(res.queued).toBe(true);
    });

    it('should handle scheduled notification within 24 hours', async () => {
      const scheduledAt = new Date(Date.now() + 3600000); // 1 hour ahead
      const res = await service.sendPushNotification(
        10,
        { title: 'Scheduled' },
        ['u1'],
        scheduledAt
      );
      expect(mockPushQueue.add).toHaveBeenCalled();
      expect(res.queued).toBe(true);
    });

    it('should handle scheduled notification beyond 24 hours without immediate queueing', async () => {
      const scheduledAt = new Date(Date.now() + 48 * 3600000); // 48 hours ahead
      const res = await service.sendPushNotification(
        10,
        { title: 'Far Future' },
        undefined,
        scheduledAt
      );
      expect(res.queued).toBe(false);
    });

    it('should rollback on database failure', async () => {
      mockQueryRunner.manager.save.mockRejectedValueOnce(new Error('DB failure'));
      await expect(service.sendPushNotification(10, { title: 'Fail' })).rejects.toThrow('DB failure');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('executePushDelivery', () => {
    it('should return sent: 0 if notification not found in DB', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);
      const res = await service.executePushDelivery(99, 10);
      expect(res).toEqual({ sent: 0, failed: 0 });
    });

    it('should return sent: 0 when no active devices found', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({ ...mockNotification });
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce([]),
      };
      mockQueryRunner.manager.createQueryBuilder.mockReturnValueOnce(qb as any);

      const res = await service.executePushDelivery(1, 10);
      expect(res).toEqual({ sent: 0, failed: 0 });
    });

    it('should retry on transient server error (status 500) and then succeed', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({ ...mockNotification });
      const retryableErr: any = new Error('Server error');
      retryableErr.statusCode = 500;

      jest
        .spyOn(webpush, 'sendNotification')
        .mockRejectedValueOnce(retryableErr)
        .mockResolvedValueOnce({} as any);

      const res = await service.executePushDelivery(1, 10);
      expect(res.sent).toBe(1);
    }, 15000);

    it('should rollback transaction on fatal execute delivery error', async () => {
      mockQueryRunner.manager.findOne.mockRejectedValueOnce(new Error('Fatal DB crash'));
      await expect(service.executePushDelivery(1, 10)).rejects.toThrow('Fatal DB crash');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should send web push notifications to devices successfully', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({ ...mockNotification });
      jest.spyOn(webpush, 'sendNotification').mockResolvedValueOnce({} as any);

      const res = await service.executePushDelivery(1, 10, ['u1']);
      expect(res.sent).toBe(1);
      expect(res.failed).toBe(0);
    });

    it('should mark device inactive on 410 Gone error and record failed log', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({ ...mockNotification });
      const goneError: any = new Error('Subscription expired');
      goneError.statusCode = 410;
      jest.spyOn(webpush, 'sendNotification').mockRejectedValueOnce(goneError);

      const res = await service.executePushDelivery(1, 10);
      expect(res.failed).toBe(1);
      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        DeviceTokenEntity,
        1,
        { is_active: false }
      );
    });
  });

  describe('Queries and maintenance', () => {
    it('should get notification logs', async () => {
      await service.getNotificationLogs(1);
      expect(mockNotificationLogRepo.find).toHaveBeenCalledWith({
        where: { notification_id: 1 },
        relations: ['device_token'],
        order: { sent_at: 'DESC' },
      });
    });

    it('should get app notifications (scheduled and sent)', async () => {
      const scheduled = await service.getAppNotifications(10, 50, true);
      expect(scheduled).toHaveLength(1);

      const sent = await service.getAppNotifications(10, 50, false);
      expect(sent).toHaveLength(1);
    });

    it('should delete and clear notifications', async () => {
      await service.deleteNotification(10, 1);
      expect(mockNotificationRepo.delete).toHaveBeenCalledWith({ app_id: 10, id: 1 });

      await service.clearAppNotifications(10);
      expect(mockNotificationRepo.delete).toHaveBeenCalledWith({ app_id: 10 });
    });

    it('should update log status', async () => {
      await service.updateLogStatus(50, 'DELIVERED');
      expect(mockNotificationLogRepo.update).toHaveBeenCalledWith(
        50,
        expect.objectContaining({ status: 'DELIVERED', delivered_at: expect.any(Date) })
      );

      await service.updateLogStatus(50, 'FAILED', 'Network error');
      expect(mockNotificationLogRepo.update).toHaveBeenCalledWith(
        50,
        expect.objectContaining({ status: 'FAILED', error_message: 'Network error' })
      );
    });

    it('should preview notification payload', async () => {
      mockNotificationRepo.findOne.mockResolvedValueOnce(mockNotification);
      const preview = await service.getNotificationPayloadPreview(10, 1);
      expect(preview.id).toBe(1);
      expect(preview.payload.title).toBe('Test');

      mockNotificationRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.getNotificationPayloadPreview(10, 99)).rejects.toThrow(NotFoundException);
    });

    it('should ensure notifications encrypted and handle failure gracefully', async () => {
      mockNotificationRepo.find.mockResolvedValueOnce([
        { id: 1, payload_json: '{"plain":"text"}' },
      ]);

      const count = await service.ensureNotificationsEncrypted();
      expect(count).toBe(1);
      expect(mockNotificationRepo.update).toHaveBeenCalled();

      mockNotificationRepo.find.mockRejectedValueOnce(new Error('DB failure'));
      const failCount = await service.ensureNotificationsEncrypted();
      expect(failCount).toBe(0);
    });
  });
});
