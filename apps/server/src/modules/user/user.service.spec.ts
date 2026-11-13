import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Warning } from './warning.entity';
import { App } from '../app/app.entity';
import { InternalNotificationService } from '../system/internal-notification.service';
import { MailService } from '../mail/mail.service';

describe('UserService (Unit Tests)', () => {
  let service: UserService;

  const mockUser: User = {
    id: 1,
    name: 'Regular User',
    email: 'user@example.com',
    password_hash: 'hash',
    role: 'ADMIN',
    status: 'APPROVED',
    app_limit: 5,
    cron_job_limit: 10,
    can_manage_retention: false,
    enterprise_key: 'ent_current',
    enterprise_key_requested: false,
    created_at: new Date(),
    updated_at: new Date(),
    apps: [],
    appMembers: [],
    warnings: [],
  };

  const mockUserRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((dto) => ({ ...dto, id: 1 })),
    save: jest.fn((entity) => Promise.resolve({ ...entity })),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockWarningRepo = {
    create: jest.fn((dto) => ({ ...dto, id: 1, created_at: new Date() })),
    save: jest.fn((entity) => Promise.resolve(entity)),
    find: jest.fn(),
  };

  const mockAppRepo = {
    count: jest.fn().mockResolvedValue(2),
  };

  const mockInternalNotificationService = {
    notifyUserApproved: jest.fn().mockResolvedValue(undefined),
    notifyUserBanned: jest.fn().mockResolvedValue(undefined),
    notifyUserAppLimitChanged: jest.fn().mockResolvedValue(undefined),
    notifyUserWarned: jest.fn().mockResolvedValue(undefined),
  };

  const mockMailService = {
    sendAccountApprovedEmail: jest.fn().mockResolvedValue(undefined),
    sendAccountBannedEmail: jest.fn().mockResolvedValue(undefined),
    sendAppLimitUpdatedEmail: jest.fn().mockResolvedValue(undefined),
    sendAccountWarningEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    delete process.env.IS_SELF_HOSTED;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Warning), useValue: mockWarningRepo },
        { provide: getRepositoryToken(App), useValue: mockAppRepo },
        { provide: InternalNotificationService, useValue: mockInternalNotificationService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('getAllUsers', () => {
    it('should return all users with/without filter', async () => {
      mockUserRepo.find.mockResolvedValueOnce([mockUser]);
      const res = await service.getAllUsers();
      expect(res).toHaveLength(1);
      expect((res[0] as any).password_hash).toBeUndefined();

      mockUserRepo.find.mockResolvedValueOnce([mockUser]);
      const filtered = await service.getAllUsers('APPROVED');
      expect(filtered).toHaveLength(1);
    });
  });

  describe('updateUserStatus', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.updateUserStatus(99, { status: 'APPROVED' })).rejects.toThrow(NotFoundException);
    });

    it('should notify and email when user is approved', async () => {
      const user = { ...mockUser, status: 'PENDING' as any };
      mockUserRepo.findOne.mockResolvedValueOnce(user);

      const res = await service.updateUserStatus(1, { status: 'APPROVED' });
      expect(res.status).toBe('APPROVED');
      expect(mockInternalNotificationService.notifyUserApproved).toHaveBeenCalledWith(1, user.name);
      expect(mockMailService.sendAccountApprovedEmail).toHaveBeenCalledWith(user.email, { name: user.name });
    });

    it('should notify and email when user is banned', async () => {
      const user = { ...mockUser };
      mockUserRepo.findOne.mockResolvedValueOnce(user);

      const res = await service.updateUserStatus(1, { status: 'BANNED' });
      expect(res.status).toBe('BANNED');
      expect(mockInternalNotificationService.notifyUserBanned).toHaveBeenCalledWith(1);
      expect(mockMailService.sendAccountBannedEmail).toHaveBeenCalled();
    });
  });

  describe('updateUserRole', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.updateUserRole(99, { role: 'SUPER_ADMIN' })).rejects.toThrow(NotFoundException);
    });

    it('should set app_limit to null when promoted to SUPER_ADMIN', async () => {
      const user = { ...mockUser };
      mockUserRepo.findOne.mockResolvedValueOnce(user);

      const res = await service.updateUserRole(1, { role: 'SUPER_ADMIN' });
      expect(res.role).toBe('SUPER_ADMIN');
      expect(res.app_limit).toBeNull();
    });
  });

  describe('updateUserAppLimit & updateUserCronJobLimit', () => {
    it('should update app limit, notify and send email', async () => {
      const user = { ...mockUser };
      mockUserRepo.findOne.mockResolvedValueOnce(user);

      const res = await service.updateUserAppLimit(1, { appLimit: 20 });
      expect(res.app_limit).toBe(20);
      expect(mockInternalNotificationService.notifyUserAppLimitChanged).toHaveBeenCalledWith(1, 20);
      expect(mockMailService.sendAppLimitUpdatedEmail).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found for app limit', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.updateUserAppLimit(99, { appLimit: 20 })).rejects.toThrow(NotFoundException);
    });

    it('should update cron job limit', async () => {
      const user = { ...mockUser };
      mockUserRepo.findOne.mockResolvedValueOnce(user);

      const res = await service.updateUserCronJobLimit(1, 15);
      expect(res.cron_job_limit).toBe(15);
    });

    it('should throw NotFoundException if user not found for cron job limit', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.updateUserCronJobLimit(99, 15)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createWarning & getUserWarnings', () => {
    it('should throw NotFoundException if user not found for warning', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.createWarning(99, 1, { message: 'Warning' })).rejects.toThrow(NotFoundException);
    });

    it('should create warning and send notification/email', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(mockUser);
      const res = await service.createWarning(1, 99, { message: 'Watch out' });
      expect(mockWarningRepo.save).toHaveBeenCalled();
      expect(mockInternalNotificationService.notifyUserWarned).toHaveBeenCalledWith(1, 'Watch out');
      expect(mockMailService.sendAccountWarningEmail).toHaveBeenCalled();
      expect(res.message).toBe('Watch out');
    });

    it('should get user warnings', async () => {
      mockWarningRepo.find.mockResolvedValueOnce([{ id: 1, message: 'W1' }]);
      const res = await service.getUserWarnings(1);
      expect(res).toHaveLength(1);
    });
  });

  describe('updateUserProfile', () => {
    it('should throw ForbiddenException if email already taken by another user', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 2, email: 'taken@example.com' });
      await expect(service.updateUserProfile(1, 'Name', 'taken@example.com')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null); // email check passes
      mockUserRepo.findOne.mockResolvedValueOnce(null); // user check fails
      await expect(service.updateUserProfile(99, 'Name', 'new@example.com')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if neither name nor email provided', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(mockUser);
      await expect(service.updateUserProfile(1, '', '')).rejects.toThrow(BadRequestException);
    });

    it('should update profile successfully', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null); // email check
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser }); // user check
      const res = await service.updateUserProfile(1, 'Updated Name', 'updated@example.com');
      expect(res.name).toBe('Updated Name');
      expect(res.email).toBe('updated@example.com');
    });
  });

  describe('updateUserRetentionPermission', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.updateUserRetentionPermission(99, true)).rejects.toThrow(NotFoundException);
    });

    it('should update retention permission', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser });
      const res = await service.updateUserRetentionPermission(1, true);
      expect(res.can_manage_retention).toBe(true);
    });
  });

  describe('deleteUserAccount & deleteUserBySuperAdmin', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.deleteUserAccount(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if super admin deletes own account', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser, role: 'SUPER_ADMIN' });
      await expect(service.deleteUserAccount(1)).rejects.toThrow(ForbiddenException);
    });

    it('should remove user on deleteUserAccount', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(mockUser);
      await service.deleteUserAccount(1);
      expect(mockUserRepo.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ForbiddenException if non-super-admin tries to deleteUserBySuperAdmin', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser, role: 'ADMIN' });
      await expect(service.deleteUserBySuperAdmin(2, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if target user not found', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser, id: 99, role: 'SUPER_ADMIN' });
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.deleteUserBySuperAdmin(2, 99)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if target user is super admin', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser, id: 99, role: 'SUPER_ADMIN' });
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser, id: 2, role: 'SUPER_ADMIN' });
      await expect(service.deleteUserBySuperAdmin(2, 99)).rejects.toThrow(ForbiddenException);
    });

    it('should delete user and return deleted apps count', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser, id: 99, role: 'SUPER_ADMIN' });
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser, id: 2, role: 'ADMIN' });
      mockAppRepo.count.mockResolvedValueOnce(3);

      const res = await service.deleteUserBySuperAdmin(2, 99);
      expect(res.deletedAppsCount).toBe(3);
      expect(mockUserRepo.remove).toHaveBeenCalled();
    });
  });

  describe('Enterprise Licensing', () => {
    it('should throw ForbiddenException in self-hosted mode', async () => {
      process.env.IS_SELF_HOSTED = 'true';
      await expect(service.requestEnterpriseKey(1)).rejects.toThrow(ForbiddenException);
      await expect(service.generateEnterpriseKey(1)).rejects.toThrow(ForbiddenException);
      await expect(service.shuffleEnterpriseKey(1)).rejects.toThrow(ForbiddenException);
      await expect(service.revokeEnterpriseKey(1)).rejects.toThrow(ForbiddenException);
      await expect(service.verifyLicenseKey('key')).rejects.toThrow(ForbiddenException);
    });

    it('should request enterprise key', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser });
      const res = await service.requestEnterpriseKey(1);
      expect(res.enterprise_key_requested).toBe(true);

      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.requestEnterpriseKey(99)).rejects.toThrow(NotFoundException);
    });

    it('should generate enterprise key', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser });
      const res = await service.generateEnterpriseKey(1);
      expect(res.enterprise_key?.startsWith('vibe_ent_')).toBe(true);

      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.generateEnterpriseKey(99)).rejects.toThrow(NotFoundException);
    });

    it('should shuffle enterprise key', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser, enterprise_key: 'vibe_ent_old' });
      const res = await service.shuffleEnterpriseKey(1);
      expect(res.enterprise_key?.startsWith('vibe_ent_')).toBe(true);

      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.shuffleEnterpriseKey(99)).rejects.toThrow(NotFoundException);

      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser, enterprise_key: null });
      await expect(service.shuffleEnterpriseKey(1)).rejects.toThrow(BadRequestException);
    });

    it('should revoke enterprise key', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser });
      const res = await service.revokeEnterpriseKey(1);
      expect(res.enterprise_key).toBeNull();

      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.revokeEnterpriseKey(99)).rejects.toThrow(NotFoundException);
    });

    it('should verify license key', async () => {
      expect(await service.verifyLicenseKey('')).toEqual({ valid: false });

      mockUserRepo.findOne.mockResolvedValueOnce(null);
      expect(await service.verifyLicenseKey('invalid')).toEqual({ valid: false });

      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser, status: 'BANNED' });
      expect(await service.verifyLicenseKey('banned')).toEqual({ valid: false });

      mockUserRepo.findOne.mockResolvedValueOnce({ ...mockUser, status: 'APPROVED' });
      expect(await service.verifyLicenseKey('valid_key')).toEqual({
        valid: true,
        ownerName: mockUser.name,
        ownerEmail: mockUser.email,
      });
    });
  });

  describe('ensureSuperAdminCreated', () => {
    it('should do nothing if super admin exists', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(mockUser);
      await service.ensureSuperAdminCreated();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should create default super admin if none exists', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await service.ensureSuperAdminCreated();
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(mockUserRepo.save).toHaveBeenCalled();
    });
  });
});

