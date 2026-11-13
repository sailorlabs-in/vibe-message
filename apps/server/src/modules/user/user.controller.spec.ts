import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController (Unit Tests)', () => {
  let controller: UserController;

  const mockUserService = {
    requestEnterpriseKey: jest.fn().mockResolvedValue({ id: 1, enterprise_key_requested: true }),
    shuffleEnterpriseKey: jest.fn().mockResolvedValue({ id: 1, enterprise_key: 'new_key' }),
    verifyLicenseKey: jest.fn().mockResolvedValue({ valid: true, ownerName: 'Admin', ownerEmail: 'a@b.com' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should request enterprise key', async () => {
    const req = { user: { userId: 1 } };
    const res = await controller.requestEnterpriseKey(req);
    expect(mockUserService.requestEnterpriseKey).toHaveBeenCalledWith(1);
    expect(res).toEqual({ success: true, data: { id: 1, enterprise_key_requested: true } });
  });

  it('should shuffle enterprise key', async () => {
    const req = { user: { userId: 1 } };
    const res = await controller.shuffleEnterpriseKey(req);
    expect(mockUserService.shuffleEnterpriseKey).toHaveBeenCalledWith(1);
    expect(res).toEqual({ success: true, data: { id: 1, enterprise_key: 'new_key' } });
  });

  it('should verify license key', async () => {
    const res = await controller.verifyLicense('license-123');
    expect(mockUserService.verifyLicenseKey).toHaveBeenCalledWith('license-123');
    expect(res).toEqual({
      success: true,
      data: { valid: true, ownerName: 'Admin', ownerEmail: 'a@b.com' },
    });
  });
});

