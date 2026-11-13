import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import { MailService } from './mail.service';
import { SystemSettings } from '../system/system_settings.entity';
import { config } from '../../config/env';

jest.mock('nodemailer');
jest.mock('ejs');

describe('MailService (Unit Tests)', () => {
  let service: MailService;

  const mockTransporter = {
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'msg_123',
      message: JSON.stringify({
        to: [{ address: 'user@test.com' }],
        subject: 'Subject',
        from: [{ address: 'sender@test.com' }],
      }),
    }),
  };

  const mockSystemSettingsRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    (ejs.renderFile as jest.Mock).mockResolvedValue('<html>Rendered</html>');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: getRepositoryToken(SystemSettings), useValue: mockSystemSettingsRepo },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should send account approved email', async () => {
    await service.sendAccountApprovedEmail('user@test.com', { name: 'John' });
    expect(ejs.renderFile).toHaveBeenCalled();
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Your Vibe-message Account Has Been Approved!',
      })
    );
  });

  it('should send account banned email', async () => {
    await service.sendAccountBannedEmail('user@test.com', { name: 'John' });
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Your Vibe-message Account Has Been Suspended',
      })
    );
  });

  it('should send account warning email', async () => {
    await service.sendAccountWarningEmail('user@test.com', { name: 'John', warningMessage: 'Warning!' });
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Account Warning - Vibe-message',
      })
    );
  });

  it('should send app limit updated email', async () => {
    await service.sendAppLimitUpdatedEmail('user@test.com', { name: 'John', oldLimit: 2, newLimit: 5 });
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Your App Creation Limit Has Been Updated - Vibe-message',
      })
    );
  });

  it('should send app shared access email (granted vs updated)', async () => {
    await service.sendAppSharedAccessEmail('user@test.com', {
      name: 'John',
      appName: 'App1',
      role: 'moderator',
      ownerName: 'Owner',
      isUpdate: false,
    });
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'App Access Granted: App1 - Vibe-message',
      })
    );

    await service.sendAppSharedAccessEmail('user@test.com', {
      name: 'John',
      appName: 'App1',
      role: 'viewer',
      ownerName: 'Owner',
      isUpdate: true,
    });
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'App Access Updated: App1 - Vibe-message',
      })
    );
  });

  it('should send password reset and email verification emails', async () => {
    await service.sendPasswordResetEmail('user@test.com', { name: 'John', resetUrl: 'http://reset' });
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Reset Your Vibe-message Password',
      })
    );

    await service.sendEmailVerificationEmail('user@test.com', { name: 'John', verifyUrl: 'http://verify' });
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Verify Your Vibe-message Email Address',
      })
    );
  });

  it('should fallback to DB SMTP or dev mode jsonTransport', async () => {
    const origHost = config.mail.host;
    config.mail.host = '';

    mockSystemSettingsRepo.findOne.mockResolvedValueOnce({
      id: 1,
      smtp_host: 'smtp.db.com',
      smtp_port: 465,
      smtp_secure: true,
      smtp_user: 'dbuser@test.com',
      smtp_pass: 'dbpass',
      smtp_from: 'dbuser@test.com',
    });

    await service.sendAccountApprovedEmail('user@test.com', { name: 'DB SMTP' });
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'smtp.db.com' })
    );

    // Dev mode jsonTransport fallback
    mockSystemSettingsRepo.findOne.mockResolvedValueOnce(null);
    mockTransporter.sendMail.mockResolvedValueOnce({ message: JSON.stringify({ to: [{ address: 'u@test.com' }] }) });

    await service.sendAccountApprovedEmail('user@test.com', { name: 'Dev Mode' });
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ jsonTransport: true })
    );

    config.mail.host = origHost;
  });
});

