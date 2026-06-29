import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import * as path from 'path';
import { config } from '../../config/env';

export interface AccountApprovedData {
  name: string;
}

export interface AccountBannedData {
  name: string;
}

export interface AccountWarningData {
  name: string;
  warningMessage: string;
}

export interface AppLimitUpdatedData {
  name: string;
  oldLimit: number | null;
  newLimit: number | null;
}

export interface AppSharedAccessData {
  name: string;
  appName: string;
  role: 'moderator' | 'viewer';
  ownerName: string;
  isUpdate: boolean;
}

export interface PasswordResetData {
  name: string;
  resetUrl: string;
}

export interface EmailVerificationData {
  name: string;
  verifyUrl: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private readonly isDevMode: boolean;
  private readonly from: string;

  constructor() {
    const { host, port, secure, user, pass } = config.mail;
    this.from = this.resolveFromAddress(config.mail.from, user);

    // If no SMTP host is configured, fall back to console-preview mode (dev-friendly)
    this.isDevMode = !host;

    if (this.isDevMode) {
      this.logger.warn(
        'SMTP_HOST is not set. Mail service running in preview/console mode. ' +
          'No actual emails will be sent. Set SMTP_* environment variables to enable real email delivery.'
      );
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      } as any);
    } else {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        // requireTLS: !secure,
        auth: user || pass ? { user, pass } : undefined,
        tls: {
          rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
        },
        // logger: config.server.nodeEnv !== 'production',
        // debug: config.server.nodeEnv !== 'production',
      });

      void this.verifyTransport();
    }
  }

  private resolveFromAddress(configuredFrom: string, smtpUser: string): string {
    if (!smtpUser) {
      return configuredFrom;
    }

    const configuredAddress = this.extractEmailAddress(configuredFrom);
    if (configuredAddress.toLowerCase() === smtpUser.toLowerCase()) {
      return configuredFrom;
    }

    this.logger.warn(
      `SMTP_FROM (${configuredAddress}) does not match SMTP_USER (${smtpUser}). ` +
        'Using SMTP_USER as sender to avoid provider relay rejection.'
    );
    return `Vibe-message <${smtpUser}>`;
  }

  private extractEmailAddress(value: string): string {
    const bracketMatch = value.match(/<([^>]+)>/);
    return (bracketMatch?.[1] ?? value).trim();
  }

  private async verifyTransport(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log(`SMTP transport ready: ${config.mail.host}:${config.mail.port}`);
    } catch (err) {
      this.logger.error(`SMTP transport verification failed: ${err}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Template renderer
  // ---------------------------------------------------------------------------
  private async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    // In dev (ts-node watch mode) __dirname points to src/modules/mail
    // In prod (compiled), templates are copied to dist by nest-cli.json assets.
    const templatesDir = path.resolve(__dirname, 'templates');
    const templatePath = path.join(templatesDir, `${templateName}.ejs`);
    return ejs.renderFile(templatePath, data);
  }

  // ---------------------------------------------------------------------------
  // Core send helper
  // ---------------------------------------------------------------------------
  private async sendMail(options: { to: string; subject: string; html: string }): Promise<void> {
    const mailOptions = {
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      if (this.isDevMode) {
        // jsonTransport stringifies the message; pretty-print it for devs.
        const parsed = JSON.parse((info as any).message);
        this.logger.log(
          `\nMAIL PREVIEW - not actually sent\n` +
            `   To      : ${parsed.to?.[0]?.address ?? options.to}\n` +
            `   Subject : ${parsed.subject}\n` +
            `   From    : ${parsed.from?.[0]?.address ?? this.from}\n`
        );
      } else {
        this.logger.log(`Email sent to ${options.to} - messageId: ${info.messageId}`);
      }
    } catch (err) {
      this.logger.error(`Failed to send email to ${options.to}: ${err}`);
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Public API - one method per trigger action
  // ---------------------------------------------------------------------------

  async sendAccountApprovedEmail(to: string, data: AccountApprovedData): Promise<void> {
    const html = await this.renderTemplate('account-approved', {
      name: data.name,
    });
    await this.sendMail({
      to,
      subject: 'Your Vibe-message Account Has Been Approved!',
      html,
    });
  }

  async sendAccountBannedEmail(to: string, data: AccountBannedData): Promise<void> {
    const html = await this.renderTemplate('account-banned', {
      name: data.name,
    });
    await this.sendMail({
      to,
      subject: 'Your Vibe-message Account Has Been Suspended',
      html,
    });
  }

  async sendAccountWarningEmail(to: string, data: AccountWarningData): Promise<void> {
    const html = await this.renderTemplate('account-warning', {
      name: data.name,
      warningMessage: data.warningMessage,
    });
    await this.sendMail({
      to,
      subject: 'Account Warning - Vibe-message',
      html,
    });
  }

  async sendAppLimitUpdatedEmail(to: string, data: AppLimitUpdatedData): Promise<void> {
    const html = await this.renderTemplate('app-limit-updated', {
      name: data.name,
      oldLimit: data.oldLimit,
      newLimit: data.newLimit,
    });
    await this.sendMail({
      to,
      subject: 'Your App Creation Limit Has Been Updated - Vibe-message',
      html,
    });
  }

  async sendAppSharedAccessEmail(to: string, data: AppSharedAccessData): Promise<void> {
    const html = await this.renderTemplate('app-shared-access', {
      ...data,
    });
    const action = data.isUpdate ? 'Updated' : 'Granted';
    await this.sendMail({
      to,
      subject: `App Access ${action}: ${data.appName} - Vibe-message`,
      html,
    });
  }

  async sendPasswordResetEmail(to: string, data: PasswordResetData): Promise<void> {
    const html = await this.renderTemplate('reset-password', {
      name: data.name,
      resetUrl: data.resetUrl,
    });
    await this.sendMail({
      to,
      subject: 'Reset Your Vibe-message Password',
      html,
    });
  }

  async sendEmailVerificationEmail(to: string, data: EmailVerificationData): Promise<void> {
    const html = await this.renderTemplate('verify-email', {
      name: data.name,
      verifyUrl: data.verifyUrl,
    });
    await this.sendMail({
      to,
      subject: 'Verify Your Vibe-message Email Address',
      html,
    });
  }
}
