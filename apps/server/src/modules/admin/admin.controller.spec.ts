import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserService } from '../user/user.service';
import { DeviceService } from '../device/device.service';
import { InternalNotificationService } from '../system/internal-notification.service';

describe('AdminController (Unit Tests)', () => {
  let controller: AdminController;

  const mockUserService = {
    getAllUsers: jest.fn().mockResolvedValue([{ id: 1, name: 'User 1' }]),
    updateUserStatus: jest.fn().mockResolvedValue({ id: 1, status: 'APPROVED' }),
    updateUserRole: jest.fn().mockResolvedValue({ id: 1, role: 'SUPER_ADMIN' }),
    updateUserRetentionPermission: jest.fn().mockResolvedValue({ id: 1, can_manage_retention: true }),
    updateUserAppLimit: jest.fn().mockResolvedValue({ id: 1, app_limit: 10 }),
    updateUserCronJobLimit: jest.fn().mockResolvedValue({ id: 1, cron_job_limit: 5 }),
    createWarning: jest.fn().mockResolvedValue({ id: 1, message: 'Warning' }),
    deleteUserBySuperAdmin: jest.fn().mockResolvedValue({ deleted: true }),
    generateEnterpriseKey: jest.fn().mockResolvedValue({ id: 1, enterprise_key: 'ent_123' }),
    revokeEnterpriseKey: jest.fn().mockResolvedValue({ id: 1, enterprise_key: null }),
  };

  const mockDeviceService = {
    unregisterAllDevicesSystemWide: jest.fn().mockResolvedValue(undefined),
  };

  const mockInternalNotificationService = {
    getAdminNotifications: jest.fn().mockResolvedValue([{ id: 1, title: 'Notice' }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        AdminService,
        { provide: UserService, useValue: mockUserService },
        { provide: DeviceService, useValue: mockDeviceService },
        { provide: InternalNotificationService, useValue: mockInternalNotificationService },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should get admin notifications', async () => {
    const res = await controller.getNotifications();
    expect(res).toEqual({ success: true, data: [{ id: 1, title: 'Notice' }] });
  });

  it('should get users', async () => {
    const res = await controller.getUsers('APPROVED');
    expect(mockUserService.getAllUsers).toHaveBeenCalledWith('APPROVED');
    expect(res.success).toBe(true);
  });

  it('should update user status', async () => {
    const res = await controller.updateUserStatus('1', { status: 'APPROVED' });
    expect(mockUserService.updateUserStatus).toHaveBeenCalledWith(1, { status: 'APPROVED' });
    expect(res.success).toBe(true);
  });

  it('should update user role', async () => {
    const res = await controller.updateUserRole('1', { role: 'SUPER_ADMIN' });
    expect(mockUserService.updateUserRole).toHaveBeenCalledWith(1, { role: 'SUPER_ADMIN' });
    expect(res.success).toBe(true);
  });

  it('should update user retention permission', async () => {
    const res = await controller.updateUserRetentionPermission('1', { canManageRetention: true });
    expect(mockUserService.updateUserRetentionPermission).toHaveBeenCalledWith(1, true);
    expect(res.success).toBe(true);
  });

  it('should update user app limit', async () => {
    const res = await controller.updateUserAppLimit('1', { appLimit: 10 });
    expect(mockUserService.updateUserAppLimit).toHaveBeenCalledWith(1, { appLimit: 10 });
    expect(res.success).toBe(true);
  });

  it('should update user cron job limit', async () => {
    const res = await controller.updateUserCronJobLimit('1', { cronJobLimit: 5 });
    expect(mockUserService.updateUserCronJobLimit).toHaveBeenCalledWith(1, 5);
    expect(res.success).toBe(true);
  });

  it('should warn user', async () => {
    const req = { user: { userId: 99 } };
    const res = await controller.warnUser(req, '1', { message: 'Warning text' });
    expect(mockUserService.createWarning).toHaveBeenCalledWith(1, 99, { message: 'Warning text' });
    expect(res.success).toBe(true);
  });

  it('should delete user', async () => {
    const req = { user: { userId: 99 } };
    const res = await controller.deleteUser(req, '1');
    expect(mockUserService.deleteUserBySuperAdmin).toHaveBeenCalledWith(1, 99);
    expect(res.success).toBe(true);
  });

  it('should delete all devices system wide', async () => {
    const res = await controller.deleteAllDevicesSystemWide();
    expect(mockDeviceService.unregisterAllDevicesSystemWide).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it('should generate and revoke enterprise key', async () => {
    const genRes = await controller.generateEnterpriseKey('1');
    expect(mockUserService.generateEnterpriseKey).toHaveBeenCalledWith(1);
    expect(genRes.success).toBe(true);

    const revRes = await controller.revokeEnterpriseKey('1');
    expect(mockUserService.revokeEnterpriseKey).toHaveBeenCalledWith(1);
    expect(revRes.success).toBe(true);
  });
});

