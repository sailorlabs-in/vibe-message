import { Controller, Get, Put, Body, UseGuards, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSettings } from './system_settings.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { config } from '../../config/env';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(
    @InjectRepository(SystemSettings)
    private systemSettingsRepository: Repository<SystemSettings>
  ) {}

  @Get('public-settings')
  @ApiOperation({ summary: 'Get public system configurations for login/signup rendering' })
  async getPublicSettings() {
    const is_self_hosted = process.env.IS_SELF_HOSTED === 'true';
    const settings = await this.systemSettingsRepository.findOne({
      where: { id: 1 },
    });

    const smtpEnvConfigured = !!config.mail.host;
    const smtpDbConfigured = !!(settings && settings.smtp_host);
    const smtpConfigured = smtpEnvConfigured || smtpDbConfigured;

    // If SMTP is not configured, we MUST hide email verification and password resets
    if (!smtpConfigured) {
      return {
        success: true,
        data: {
          is_self_hosted,
          hide_forgot_password: true,
          hide_email_verification: true,
        },
      };
    }

    return {
      success: true,
      data: {
        is_self_hosted,
        hide_forgot_password: settings ? settings.hide_forgot_password : false,
        hide_email_verification: settings ? settings.hide_email_verification : false,
      },
    };
  }

  @Get('settings')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get global system settings (Super Admin & Admin)' })
  async getSettings() {
    const settings = await this.systemSettingsRepository.findOne({
      where: { id: 1 },
    });

    const smtpEnvConfigured = !!config.mail.host;

    return {
      success: true,
      data: {
        default_retention_days: settings ? settings.default_retention_days : 14,
        smtp_host: smtpEnvConfigured ? config.mail.host : (settings?.smtp_host || ''),
        smtp_port: smtpEnvConfigured ? config.mail.port : (settings?.smtp_port || 587),
        smtp_secure: smtpEnvConfigured ? config.mail.secure : (settings?.smtp_secure || false),
        smtp_user: smtpEnvConfigured ? config.mail.user : (settings?.smtp_user || ''),
        smtp_pass: smtpEnvConfigured ? (config.mail.pass ? '********' : '') : (settings?.smtp_pass ? '********' : ''),
        smtp_from: smtpEnvConfigured ? config.mail.from : (settings?.smtp_from || ''),
        smtp_env_configured: smtpEnvConfigured,
        hide_forgot_password: settings ? settings.hide_forgot_password : false,
        hide_email_verification: settings ? settings.hide_email_verification : false,
      },
    };
  }

  @Put('settings')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update global system settings (Super Admin only)' })
  async updateSettings(@Body() body: any, @Res() res: Response) {
    const {
      default_retention_days,
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_user,
      smtp_pass,
      smtp_from,
      hide_forgot_password,
      hide_email_verification,
    } = body;

    if (default_retention_days !== undefined && (typeof default_retention_days !== 'number' || default_retention_days < 1)) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: 'Invalid retention days value.' });
    }

    let settings = await this.systemSettingsRepository.findOne({
      where: { id: 1 },
    });

    if (!settings) {
      settings = this.systemSettingsRepository.create({ id: 1 });
    }

    if (default_retention_days !== undefined) {
      settings.default_retention_days = default_retention_days;
    }

    // Only allow updating SMTP settings if NOT configured via env
    const smtpEnvConfigured = !!config.mail.host;
    if (!smtpEnvConfigured) {
      if (smtp_host !== undefined) settings.smtp_host = smtp_host;
      if (smtp_port !== undefined) settings.smtp_port = smtp_port;
      if (smtp_secure !== undefined) settings.smtp_secure = smtp_secure;
      if (smtp_user !== undefined) settings.smtp_user = smtp_user;
      if (smtp_from !== undefined) settings.smtp_from = smtp_from;
      
      // Overwrite password if provided and not the masked placeholder
      if (smtp_pass !== undefined && smtp_pass !== '********') {
        settings.smtp_pass = smtp_pass;
      }
    }

    if (hide_forgot_password !== undefined) {
      settings.hide_forgot_password = !!hide_forgot_password;
    }
    if (hide_email_verification !== undefined) {
      settings.hide_email_verification = !!hide_email_verification;
    }

    await this.systemSettingsRepository.save(settings);

    return res.json({
      success: true,
      message: 'System settings updated successfully',
      data: {
        default_retention_days: settings.default_retention_days,
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_secure: settings.smtp_secure,
        smtp_user: settings.smtp_user,
        smtp_from: settings.smtp_from,
        hide_forgot_password: settings.hide_forgot_password,
        hide_email_verification: settings.hide_email_verification,
      },
    });
  }
}
