import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { InternalNotificationService } from './internal-notification.service';
import { SystemSettings } from './system_settings.entity';
import { App as AppEntity } from '../app/app.entity';
import { User } from '../user/user.entity';
import { Notification } from '../push/notification.entity';
import { config } from '../../config/env';
import * as vibeMessage from 'vibe-message';

jest.mock('vibe-message');

describe('SystemModule (Unit Tests)', () => {
  let controller: SystemController;
  let service: SystemService;
  let internalNotificationService: InternalNotificationService;

  const mockSettings: SystemSettings = {
    id: 1,
    default_retention_days: 14,
    smtp_host: 'smtp.test.com',
    smtp_port: 587,
    smtp_secure: false,
    smtp_user: 'testuser',
    smtp_pass: 'secret',
    smtp_from: 'from@test.com',
    hide_forgot_password: false,
    hide_email_verification: false,
    updated_at: new Date(),
  };

  const mockApp: AppEntity = {
    id: 999,
    user_id: 1,
    name: 'Admin Panel Notifications',
    description: 'Internal app for admin panel notifications',
    public_app_id: 'sys_app_id',
    public_key: 'sys_pk',
    secret_key: 'sys_sk',
    is_active: true,
    retention_days: null,
    created_at: new Date(),
    updated_at: new Date(),
    user: null as any,
    devices: [],
    notifications: [],
    members: [],
  };

  const mockSettingsRepo = {
    findOne: jest.fn(),
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn((e) => Promise.resolve(e)),
  };

  const mockAppRepo = {
    findOne: jest.fn(),
    create: jest.fn((dto) => ({ ...dto, id: 999 })),
    save: jest.fn((e) => Promise.resolve(e)),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockNotificationRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockVibeClient = {
    notification: jest.fn().mockResolvedValue({ success: true }),
  };

  const mockRes: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (vibeMessage.initServerClient as jest.Mock).mockReturnValue(mockVibeClient);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemController],
      providers: [
        SystemService,
        InternalNotificationService,
        { provide: getRepositoryToken(SystemSettings), useValue: mockSettingsRepo },
        { provide: getRepositoryToken(AppEntity), useValue: mockAppRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Notification), useValue: mockNotificationRepo },
      ],
    }).compile();

    controller = module.get<SystemController>(SystemController);
    service = module.get<SystemService>(SystemService);
    internalNotificationService = module.get<InternalNotificationService>(InternalNotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(internalNotificationService).toBeDefined();
  });

  describe('SystemController', () => {
    it('should get public settings encrypted', async () => {
      mockSettingsRepo.findOne.mockResolvedValueOnce(mockSettings);
      const res = await controller.getPublicSettings();
      expect(res.success).toBe(true);
      expect(typeof res.data).toBe('string');
    });

    it('should get system settings', async () => {
      mockSettingsRepo.findOne.mockResolvedValueOnce(mockSettings);
      const res = await controller.getSettings();
      expect(res.success).toBe(true);
      expect(res.data.default_retention_days).toBe(14);
    });

    it('should validate retention days on updateSettings', async () => {
      await controller.updateSettings({ default_retention_days: -5 }, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should update settings successfully', async () => {
      const origHost = config.mail.host;
      config.mail.host = ''; // allow db SMTP update

      mockSettingsRepo.findOne.mockResolvedValueOnce({ ...mockSettings });

      await controller.updateSettings(
        {
          default_retention_days: 30,
          smtp_host: 'smtp.new.com',
          smtp_port: '465',
          smtp_secure: true,
          smtp_user: 'user',
          smtp_pass: 'newpass',
          smtp_from: 'from@new.com',
          hide_forgot_password: true,
          hide_email_verification: true,
        },
        mockRes
      );

      expect(mockSettingsRepo.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );

      config.mail.host = origHost;
    });
  });

  describe('InternalNotificationService', () => {
    it('should return existing internal app if already present', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce(mockApp);
      const app = await internalNotificationService.getOrCreateInternalApp();
      expect(app.id).toBe(999);
    });

    it('should create internal app if not present', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce(null);
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 1, role: 'SUPER_ADMIN' });

      const app = await internalNotificationService.getOrCreateInternalApp();
      expect(mockAppRepo.create).toHaveBeenCalled();
      expect(mockAppRepo.save).toHaveBeenCalled();
      expect(app.name).toBe('Admin Panel Notifications');
    });

    it('should throw error creating internal app if no superadmin exists', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce(null);
      mockUserRepo.findOne.mockResolvedValueOnce(null);

      await expect(internalNotificationService.getOrCreateInternalApp()).rejects.toThrow(
        'No super admin found'
      );
    });

    it('should notify super admins', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce(mockApp);
      mockUserRepo.find.mockResolvedValueOnce([{ email: 'admin@test.com' }]);

      await internalNotificationService.notifySuperAdmins('Title', 'Body', { meta: true });
      expect(mockVibeClient.notification).toHaveBeenCalled();
    });

    it('should notify specific user', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce(mockApp);
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 5, email: 'user@test.com' });

      await internalNotificationService.notifyUser(5, 'User Alert', 'Message');
      expect(mockVibeClient.notification).toHaveBeenCalled();
    });

    it('should handle notification helper wrappers', async () => {
      mockAppRepo.findOne.mockResolvedValue(mockApp);
      mockUserRepo.find.mockResolvedValue([{ email: 'admin@test.com' }]);
      mockUserRepo.findOne.mockResolvedValue({ id: 1, email: 'admin@test.com' });

      await internalNotificationService.notifySuperAdminNewUser('Newbie', 'new@test.com');
      await internalNotificationService.notifyUserApproved(1, 'Newbie');
      await internalNotificationService.notifyUserBanned(1);
      await internalNotificationService.notifyUserWarned(1, 'Warning message');
      await internalNotificationService.notifyUserAppLimitChanged(1, 10);
      await internalNotificationService.notifyUserAppLimitChanged(1, null);
      expect(mockVibeClient.notification).toHaveBeenCalled();
    });

    it('should get admin notifications list', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce(mockApp);
      mockNotificationRepo.find.mockResolvedValueOnce([
        { id: 1, payload_json: '{"title":"Admin Alert"}', created_at: new Date() },
      ]);

      const res = await internalNotificationService.getAdminNotifications();
      expect(res).toHaveLength(1);
      expect(res[0].title).toBe('Admin Alert');
    });
  });
});

