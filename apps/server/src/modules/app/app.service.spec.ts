import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';
import { App as AppEntity } from './app.entity';
import { AppMember } from './app-member.entity';
import { User } from '../user/user.entity';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';

describe('AppService (Unit Tests)', () => {
  let service: AppService;

  const mockApp: AppEntity = {
    id: 1,
    user_id: 1,
    name: 'Test App',
    description: 'Description',
    public_app_id: 'app_123',
    public_key: 'pk_123',
    secret_key: 'sk_123',
    is_active: true,
    retention_days: 30,
    created_at: new Date(),
    updated_at: new Date(),
    user: null as any,
    devices: [],
    notifications: [],
    members: [],
  };

  const mockQueryBuilder: any = {
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockApp]),
    getRawOne: jest.fn(),
  };

  const mockAppRepo = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn((dto) => ({ ...dto, id: 1 })),
    save: jest.fn((entity) => Promise.resolve({ ...entity })),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
  };

  const mockAppMemberRepo = {
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn((dto) => ({ ...dto, id: 10 })),
    save: jest.fn((entity) => Promise.resolve(entity)),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockRedisClient = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
  };

  const mockRedisService = {
    client: mockRedisClient,
  };

  const mockMailService = {
    sendAppSharedAccessEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    delete process.env.IS_SELF_HOSTED;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: getRepositoryToken(AppEntity), useValue: mockAppRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(AppMember), useValue: mockAppMemberRepo },
        { provide: RedisService, useValue: mockRedisService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getUserApps', () => {
    it('should return apps for regular user or super admin with filter', async () => {
      const apps = await service.getUserApps(1, 'ADMIN');
      expect(apps).toHaveLength(1);

      await service.getUserApps(1, 'SUPER_ADMIN', 2);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('getAppById', () => {
    it('should throw NotFoundException if app not found', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValueOnce(null);
      await expect(service.getAppById('app_123', 1, 'ADMIN')).rejects.toThrow(NotFoundException);
    });

    it('should return app with owner role', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        name: 'Test App',
        device_count: '5',
        notification_count: '10',
      });

      const res = await service.getAppById('app_123', 1, 'ADMIN');
      expect(res.currentUserRole).toBe('owner');
      expect(res.device_count).toBe(5);
      expect(res.notification_count).toBe(10);
    });

    it('should return app with superadmin role', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({
        id: 1,
        user_id: 2,
        name: 'Test App',
      });

      const res = await service.getAppById('app_123', 1, 'SUPER_ADMIN');
      expect(res.currentUserRole).toBe('superadmin');
    });

    it('should return app with member role', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({
        id: 1,
        user_id: 2,
        name: 'Test App',
      });
      mockAppMemberRepo.findOne.mockResolvedValueOnce({ role: 'moderator' });

      const res = await service.getAppById('app_123', 3, 'ADMIN');
      expect(res.currentUserRole).toBe('moderator');
    });
  });

  describe('createApp', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.createApp(1, { name: 'New' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user not approved', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 1, status: 'PENDING', role: 'ADMIN' });
      await expect(service.createApp(1, { name: 'New' })).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user reached app limit', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 1, status: 'APPROVED', role: 'ADMIN', app_limit: 2 });
      mockAppRepo.count.mockResolvedValueOnce(2);

      await expect(service.createApp(1, { name: 'New' })).rejects.toThrow(ForbiddenException);
    });

    it('should create app successfully', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 1, status: 'APPROVED', role: 'ADMIN', app_limit: 5 });
      mockAppRepo.count.mockResolvedValueOnce(1);

      const app = await service.createApp(1, { name: 'New App', description: 'Desc' });
      expect(mockAppRepo.create).toHaveBeenCalled();
      expect(mockAppRepo.save).toHaveBeenCalled();
      expect(app.name).toBe('New App');
    });
  });

  describe('updateApp', () => {
    it('should prevent modifying Admin Panel Notifications', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp, name: 'Admin Panel Notifications' });
      await expect(service.updateApp('app_123', 1, 'ADMIN', { name: 'Test' })).rejects.toThrow(ForbiddenException);
    });

    it('should prevent viewers from editing app', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp, user_id: 2 });
      mockAppMemberRepo.findOne.mockResolvedValueOnce({ role: 'viewer' });

      await expect(service.updateApp('app_123', 3, 'ADMIN', { name: 'Test' })).rejects.toThrow(ForbiddenException);
    });

    it('should prevent retention change if user lacks retention permission', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp });
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 1, can_manage_retention: false });

      await expect(service.updateApp('app_123', 1, 'ADMIN', { retention_days: 60 })).rejects.toThrow(ForbiddenException);
    });

    it('should update app fields and invalidate redis cache', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp });
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 1, can_manage_retention: true });

      const updated = await service.updateApp('app_123', 1, 'ADMIN', {
        name: 'Updated Name',
        description: 'New Desc',
        is_active: false,
        retention_days: 60,
      });

      expect(updated.name).toBe('Updated Name');
      expect(mockRedisClient.del).toHaveBeenCalled();
    });
  });

  describe('rotateAppSecret & deleteApp', () => {
    it('should rotate secret for owner or superadmin', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp });
      const rotated = await service.rotateAppSecret('app_123', 1, 'ADMIN');
      expect(rotated.secret_key.startsWith('sk_')).toBe(true);

      // Deny for moderator
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp, user_id: 2 });
      mockAppMemberRepo.findOne.mockResolvedValueOnce({ role: 'moderator' });
      await expect(service.rotateAppSecret('app_123', 3, 'ADMIN')).rejects.toThrow(ForbiddenException);
    });

    it('should delete app for owner or superadmin', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp });
      await service.deleteApp('app_123', 1, 'ADMIN');
      expect(mockAppRepo.remove).toHaveBeenCalled();

      // Deny delete for Admin Panel Notifications
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp, name: 'Admin Panel Notifications' });
      await expect(service.deleteApp('app_123', 1, 'SUPER_ADMIN')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('App Members & Sharing', () => {
    it('should get members list including owner', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp });
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 1, name: 'Owner', email: 'owner@test.com' });
      mockAppMemberRepo.find.mockResolvedValueOnce([
        { user: { id: 2, name: 'Member', email: 'm@test.com' }, role: 'moderator', created_at: new Date() },
      ]);

      const members = await service.getAppMembers('app_123', 1, 'ADMIN');
      expect(members).toHaveLength(2);
      expect(members[0].role).toBe('owner');
      expect(members[1].role).toBe('moderator');
    });

    it('should share app with user and send email', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp });
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 2, name: 'Guest', email: 'guest@test.com' }); // targetUser
      mockAppMemberRepo.findOne.mockResolvedValueOnce(null); // not existing member
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 1, name: 'Owner' }); // ownerUser

      const res = await service.shareApp('app_123', 1, 'ADMIN', 'guest@test.com', 'moderator');
      expect(res.name).toBe('Guest');
      expect(mockAppMemberRepo.save).toHaveBeenCalled();
      expect(mockMailService.sendAppSharedAccessEmail).toHaveBeenCalled();
    });

    it('should validate target user when sharing app', async () => {
      // User not found
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp });
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.shareApp('app_123', 1, 'ADMIN', 'bad@test.com', 'moderator')).rejects.toThrow(NotFoundException);

      // Sharing with owner
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp });
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 1, email: 'owner@test.com' });
      await expect(service.shareApp('app_123', 1, 'ADMIN', 'owner@test.com', 'moderator')).rejects.toThrow(BadRequestException);

      // Already member
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp });
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 2, email: 'member@test.com' });
      mockAppMemberRepo.findOne.mockResolvedValueOnce({ id: 99 });
      await expect(service.shareApp('app_123', 1, 'ADMIN', 'member@test.com', 'moderator')).rejects.toThrow(BadRequestException);
    });

    it('should update member role', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp });
      mockAppMemberRepo.findOne.mockResolvedValueOnce({ id: 10, role: 'viewer' });
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 2, name: 'Member', email: 'm@test.com' });
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 1, name: 'Owner' });

      const res = await service.updateAppMemberRole('app_123', 1, 'ADMIN', 2, 'moderator');
      expect(res.success).toBe(true);
      expect(mockAppMemberRepo.save).toHaveBeenCalled();
    });

    it('should remove member', async () => {
      mockAppRepo.findOne.mockResolvedValueOnce({ ...mockApp });
      mockAppMemberRepo.findOne.mockResolvedValueOnce({ id: 10 });

      const res = await service.removeAppMember('app_123', 1, 'ADMIN', 2);
      expect(res.success).toBe(true);
      expect(mockAppMemberRepo.remove).toHaveBeenCalled();
    });
  });

  describe('Credentials & Caching', () => {
    it('should get app from redis cache or db', async () => {
      // Cache hit
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockApp));
      let app = await service.getAppByPublicId('app_123');
      expect(app?.name).toBe('Test App');

      // Cache miss, DB hit
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockAppRepo.findOne.mockResolvedValueOnce(mockApp);
      app = await service.getAppByPublicId('app_123');
      expect(app?.name).toBe('Test App');
      expect(mockRedisClient.set).toHaveBeenCalled();
    });

    it('should validate app credentials', async () => {
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockApp));
      const app = await service.validateAppCredentials('app_123', 'sk_123');
      expect(app.id).toBe(1);

      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockApp));
      await expect(service.validateAppCredentials('app_123', 'wrong_sk')).rejects.toThrow(ForbiddenException);

      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify({ ...mockApp, is_active: false }));
      await expect(service.validateAppCredentials('app_123', 'sk_123')).rejects.toThrow(ForbiddenException);
    });

    it('should validate SDK credentials', async () => {
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockApp));
      const app = await service.validateSdkCredentials('app_123', 'pk_123');
      expect(app.id).toBe(1);

      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockApp));
      await expect(service.validateSdkCredentials('app_123', 'wrong_pk')).rejects.toThrow(ForbiddenException);

      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify({ ...mockApp, is_active: false }));
      await expect(service.validateSdkCredentials('app_123', 'pk_123')).rejects.toThrow(ForbiddenException);
    });
  });
});

