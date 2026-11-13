import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../user/user.entity';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
import { InternalNotificationService } from '../system/internal-notification.service';

jest.mock('bcrypt');

describe('AuthService (Unit Tests)', () => {
  let service: AuthService;

  const getMockUser = (): User => ({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password_hash: '$2b$10$hashedpassword',
    role: 'ADMIN',
    status: 'PENDING',
    app_limit: 5,
    cron_job_limit: 10,
    can_manage_retention: false,
    enterprise_key: null,
    enterprise_key_requested: false,
    created_at: new Date(),
    updated_at: new Date(),
    apps: [],
    appMembers: [],
    warnings: [],
  });

  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn((dto) => ({ ...dto, id: 1 })),
    save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 1 })),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockRedisClient = {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
  };

  const mockRedisService = {
    client: mockRedisClient,
  };

  const mockMailService = {
    sendEmailVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  };

  const mockInternalNotificationService = {
    notifyAdmin: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUserRepo.create.mockImplementation((dto) => ({ ...dto, id: 1 }));
    mockUserRepo.save.mockImplementation((entity) => Promise.resolve({ ...entity, id: entity.id || 1 }));
    mockUserRepo.remove.mockResolvedValue(undefined);
    mockUserRepo.findOne.mockReset();
    (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockMailService.sendEmailVerificationEmail.mockResolvedValue(undefined);
    mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);
    mockRedisClient.set.mockResolvedValue('OK');
    mockRedisClient.del.mockResolvedValue(1);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: RedisService, useValue: mockRedisService },
        { provide: MailService, useValue: mockMailService },
        { provide: InternalNotificationService, useValue: mockInternalNotificationService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(getMockUser());
      await expect(
        service.signup({ name: 'Test', email: 'test@example.com', password: 'Password123' })
      ).rejects.toThrow(ConflictException);
    });

    it('should create user, store verify token in redis, send email and return token and user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      const res = await service.signup({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(mockRedisClient.set).toHaveBeenCalled();
      expect(mockMailService.sendEmailVerificationEmail).toHaveBeenCalled();
      expect(res.token).toBeDefined();
      expect(res.user.email).toBe('test@example.com');
      expect((res.user as any).password_hash).toBeUndefined();
    });

    it('should handle self-hosted mode without sending email', async () => {
      const origEnv = process.env.IS_SELF_HOSTED;
      process.env.IS_SELF_HOSTED = 'true';
      mockUserRepo.findOne.mockResolvedValue(null);

      const res = await service.signup({
        name: 'Test User',
        email: 'self@example.com',
        password: 'Password123',
      });

      expect(res.user.status).toBe('APPROVED');
      expect(mockMailService.sendEmailVerificationEmail).not.toHaveBeenCalled();
      process.env.IS_SELF_HOSTED = origEnv;
    });

    it('should catch email sending error gracefully during signup', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockMailService.sendEmailVerificationEmail.mockRejectedValue(new Error('SMTP down'));

      const res = await service.signup({
        name: 'Test',
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(res.token).toBeDefined();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(
        service.login({ email: 'notfound@example.com', password: 'Password123' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockUserRepo.findOne.mockResolvedValue(getMockUser());

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPassword' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user on successful login', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUserRepo.findOne.mockResolvedValue(getMockUser());

      const res = await service.login({ email: 'test@example.com', password: 'CorrectPassword' });
      expect(res.token).toBeDefined();
      expect(res.user.email).toBe('test@example.com');
    });
  });

  describe('getUserById', () => {
    it('should return user response', async () => {
      const user = getMockUser();
      mockUserRepo.findOne.mockResolvedValue(user);
      const res = await service.getUserById(1);
      expect(res.email).toBe(user.email);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.getUserById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAccount', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteAccount(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is SUPER_ADMIN', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...getMockUser(), role: 'SUPER_ADMIN' });
      await expect(service.deleteAccount(1)).rejects.toThrow(BadRequestException);
    });

    it('should remove user', async () => {
      const user = getMockUser();
      mockUserRepo.findOne.mockResolvedValue(user);
      await service.deleteAccount(1);
      expect(mockUserRepo.remove).toHaveBeenCalledWith(user);
    });
  });

  describe('changePassword', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.changePassword(99, 'old', 'new')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if current password incorrect', async () => {
      mockUserRepo.findOne.mockResolvedValue(getMockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(1, 'wrong', 'new')).rejects.toThrow(BadRequestException);
    });

    it('should update password when valid', async () => {
      mockUserRepo.findOne.mockResolvedValue(getMockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.changePassword(1, 'old', 'NewPassword123');
      expect(mockUserRepo.save).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should silently return if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await service.forgotPassword('nonexistent@test.com');
      expect(mockRedisClient.set).not.toHaveBeenCalled();
    });

    it('should save token in redis and send password reset email', async () => {
      mockUserRepo.findOne.mockResolvedValue(getMockUser());
      await service.forgotPassword('test@example.com');
      expect(mockRedisClient.set).toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should catch mail error gracefully', async () => {
      mockUserRepo.findOne.mockResolvedValue(getMockUser());
      mockMailService.sendPasswordResetEmail.mockRejectedValue(new Error('SMTP down'));
      await expect(service.forgotPassword('test@example.com')).resolves.toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if token not in redis', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      await expect(service.resetPassword('badtoken', 'newpass')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user for token not found', async () => {
      mockRedisClient.get.mockResolvedValue('99');
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.resetPassword('validtoken', 'newpass')).rejects.toThrow(NotFoundException);
    });

    it('should update password and delete token', async () => {
      mockRedisClient.get.mockResolvedValue('1');
      mockUserRepo.findOne.mockResolvedValue(getMockUser());

      await service.resetPassword('validtoken', 'newPass123');
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(mockRedisClient.del).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should throw BadRequestException if token not found', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      await expect(service.verifyEmail('invalid')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRedisClient.get.mockResolvedValue('1');
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.verifyEmail('token')).rejects.toThrow(NotFoundException);
    });

    it('should approve user and delete token', async () => {
      mockRedisClient.get.mockResolvedValue('1');
      const userInstance = getMockUser();
      mockUserRepo.findOne.mockResolvedValue(userInstance);

      const res = await service.verifyEmail('token');
      expect(userInstance.status).toBe('APPROVED');
      expect(mockUserRepo.save).toHaveBeenCalledWith(userInstance);
      expect(mockRedisClient.del).toHaveBeenCalled();
      expect(res.status).toBe('APPROVED');
    });
  });

  describe('resendVerificationEmail', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.resendVerificationEmail('bad@test.com')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is not PENDING', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...getMockUser(), status: 'APPROVED' });
      await expect(service.resendVerificationEmail('test@example.com')).rejects.toThrow(BadRequestException);
    });

    it('should resend email if user is PENDING', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...getMockUser(), status: 'PENDING' });
      await service.resendVerificationEmail('test@example.com');
      expect(mockRedisClient.set).toHaveBeenCalled();
      expect(mockMailService.sendEmailVerificationEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email sending fails', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...getMockUser(), status: 'PENDING' });
      mockMailService.sendEmailVerificationEmail.mockRejectedValue(new Error('Send error'));
      await expect(service.resendVerificationEmail('test@example.com')).rejects.toThrow(BadRequestException);
    });
  });
});
