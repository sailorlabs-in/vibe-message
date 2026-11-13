import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('AuthController (Unit Tests)', () => {
  let controller: AuthController;

  const mockAuthService = {
    signup: jest.fn().mockResolvedValue({ token: 'jwt_token', user: { id: 1 } }),
    login: jest.fn().mockResolvedValue({ token: 'jwt_token', user: { id: 1 } }),
    getUserById: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
    changePassword: jest.fn().mockResolvedValue(undefined),
    forgotPassword: jest.fn().mockResolvedValue(undefined),
    resetPassword: jest.fn().mockResolvedValue(undefined),
    verifyEmail: jest.fn().mockResolvedValue({ id: 1, status: 'APPROVED' }),
    resendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  };

  const mockUserService = {
    updateUserProfile: jest.fn().mockResolvedValue({ id: 1, name: 'New Name' }),
    deleteUserAccount: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should handle signup', async () => {
    const dto = { name: 'Test', email: 'test@test.com', password: 'Password123' };
    const res = await controller.signup(dto);
    expect(mockAuthService.signup).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ success: true, data: { token: 'jwt_token', user: { id: 1 } } });
  });

  it('should handle login', async () => {
    const dto = { email: 'test@test.com', password: 'Password123' };
    const res = await controller.login(dto);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ success: true, data: { token: 'jwt_token', user: { id: 1 } } });
  });

  it('should get current user profile', async () => {
    const req = { user: { userId: 1 } };
    const res = await controller.getProfile(req);
    expect(mockAuthService.getUserById).toHaveBeenCalledWith(1);
    expect(res).toEqual({ success: true, data: { id: 1, name: 'Test' } });
  });

  it('should update profile', async () => {
    const req = { user: { userId: 1 } };
    const dto = { name: 'New Name', email: 'new@test.com' };
    const res = await controller.updateProfile(req, dto);
    expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(1, dto.name, dto.email);
    expect(res.success).toBe(true);
  });

  it('should delete account', async () => {
    const req = { user: { userId: 1 } };
    const res = await controller.deleteAccount(req);
    expect(mockUserService.deleteUserAccount).toHaveBeenCalledWith(1);
    expect(res.success).toBe(true);
  });

  it('should change password', async () => {
    const req = { user: { userId: 1 } };
    const dto = { oldPassword: 'old', newPassword: 'new' };
    const res = await controller.changePassword(req, dto);
    expect(mockAuthService.changePassword).toHaveBeenCalledWith(1, dto.oldPassword, dto.newPassword);
    expect(res.success).toBe(true);
  });

  it('should handle forgot password', async () => {
    const dto = { email: 'test@test.com' };
    const res = await controller.forgotPassword(dto);
    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto.email);
    expect(res.success).toBe(true);
  });

  it('should handle reset password', async () => {
    const dto = { token: 'token123', newPassword: 'newPassword123' };
    const res = await controller.resetPassword(dto);
    expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto.token, dto.newPassword);
    expect(res.success).toBe(true);
  });

  it('should handle verify email', async () => {
    const dto = { token: 'token123' };
    const res = await controller.verifyEmail(dto);
    expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(dto.token);
    expect(res.success).toBe(true);
  });

  it('should handle resend verification email', async () => {
    const dto = { email: 'test@test.com' };
    const res = await controller.resendVerification(dto);
    expect(mockAuthService.resendVerificationEmail).toHaveBeenCalledWith(dto.email);
    expect(res.success).toBe(true);
  });
});

