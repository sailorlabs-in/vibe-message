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

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private readonly isDevMode: boolean;

  constructor() {
    const { host, port, secure, user, pass } = config.mail;

    // If no SMTP host is configured, fall back to console-preview mode (dev-friendly)
    this.isDevMode = !host;

    if (this.isDevMode) {
      this.logger.warn(
        '📧 SMTP_HOST is not set. Mail service running in preview/console mode. ' +
          'No actual emails will be sent. Set SMTP_* environment variables to enable real email delivery.',
      );
      // Use a fake SMTP transport that logs to stdout
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      } as any);
    } else {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Template renderer
  // ---------------------------------------------------------------------------
  private async renderTemplate(
    templateName: string,
    data: Record<string, any>,
  ): Promise<string> {
    // In dev (ts-node watch mode) __dirname points to src/modules/mail
    // In prod (compiled) it points to dist/modules/mail — templates are copied there by nest-cli.json assets
    const templatesDir = path.resolve(__dirname, 'templates');
    const templatePath = path.join(templatesDir, `${templateName}.ejs`);
    return ejs.renderFile(templatePath, { ...data, appName: 'Vibe Message' });
  }

  // ---------------------------------------------------------------------------
  // Core send helper
  // ---------------------------------------------------------------------------
  private async sendMail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const mailOptions = {
      from: config.mail.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      if (this.isDevMode) {
        // jsonTransport stringifies the message — pretty-print it for devs
        const parsed = JSON.parse((info as any).message);
        this.logger.log(
          `\n📧 ═══════════════════════════════════════════════════════════\n` +
            `   [MAIL PREVIEW – not actually sent]\n` +
            `   To      : ${parsed.to?.[0]?.address ?? options.to}\n` +
            `   Subject : ${parsed.subject}\n` +
            `   From    : ${parsed.from?.[0]?.address ?? config.mail.from}\n` +
            `═══════════════════════════════════════════════════════════\n`,
        );
      } else {
        this.logger.log(`✅ Email sent to ${options.to} — messageId: ${info.messageId}`);
      }
    } catch (err) {
      this.logger.error(`❌ Failed to send email to ${options.to}: ${err}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Public API — one method per trigger action
  // ---------------------------------------------------------------------------

  async sendAccountApprovedEmail(to: string, data: AccountApprovedData): Promise<void> {
    const html = await this.renderTemplate('account-approved', data);
    await this.sendMail({
      to,
      subject: '🎉 Your Vibe Message Account Has Been Approved!',
      html,
    });
  }

  async sendAccountBannedEmail(to: string, data: AccountBannedData): Promise<void> {
    const html = await this.renderTemplate('account-banned', data);
    await this.sendMail({
      to,
      subject: '🚫 Your Vibe Message Account Has Been Suspended',
      html,
    });
  }

  async sendAccountWarningEmail(to: string, data: AccountWarningData): Promise<void> {
    const html = await this.renderTemplate('account-warning', data);
    await this.sendMail({
      to,
      subject: '⚠️ Account Warning — Vibe Message',
      html,
    });
  }

  async sendAppLimitUpdatedEmail(to: string, data: AppLimitUpdatedData): Promise<void> {
    const html = await this.renderTemplate('app-limit-updated', data);
    await this.sendMail({
      to,
      subject: '📊 Your App Creation Limit Has Been Updated — Vibe Message',
      html,
    });
  }

  async sendAppSharedAccessEmail(to: string, data: AppSharedAccessData): Promise<void> {
    const html = await this.renderTemplate('app-shared-access', {
      ...data,
      appName2: data.appName, // actual app name — 'appName' in template is the platform name
    });
    const action = data.isUpdate ? 'Updated' : 'Granted';
    await this.sendMail({
      to,
      subject: `🔗 App Access ${action}: ${data.appName} — Vibe Message`,
      html,
    });
  }
}
