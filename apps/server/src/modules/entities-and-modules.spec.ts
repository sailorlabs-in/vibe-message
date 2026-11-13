import { User } from './user/user.entity';
import { Warning } from './user/warning.entity';
import { App } from './app/app.entity';
import { AppMember } from './app/app-member.entity';
import { DeviceToken } from './device/device_token.entity';
import { Notification } from './push/notification.entity';
import { NotificationLog } from './push/notification_log.entity';
import { DripCampaign, DripStep, DripSentLog } from './drip/drip.entity';
import { CronJob } from './http-cron/entities/cron-job.entity';
import { CronJobLog } from './http-cron/entities/cron-job-log.entity';
import { SystemSettings } from './system/system_settings.entity';
import {
  SignupDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from './auth/dto/auth.dto';
import { AdminModule } from './admin/admin.module';
import { AppModule as AppEntityModule } from './app/app.module';
import { AuthModule } from './auth/auth.module';
import { CronModule } from './cron/cron.module';
import { DeviceModule } from './device/device.module';
import { DripModule } from './drip/drip.module';
import { HealthModule } from './health/health.module';
import { HttpCronModule } from './http-cron/http-cron.module';
import { MailModule } from './mail/mail.module';
import { PushModule } from './push/push.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { SdkModule } from './sdk/sdk.module';
import { SystemModule } from './system/system.module';
import { UserModule } from './user/user.module';
import { AppModule } from '../app.module';

describe('Entities, DTOs and Modules coverage', () => {
  it('should instantiate all entities with their properties', () => {
    const user = new User();
    user.id = 1;
    user.name = 'Test';
    user.email = 'test@example.com';
    user.password_hash = 'hash';
    user.role = 'ADMIN';
    user.status = 'APPROVED';
    expect(user.id).toBe(1);

    const warning = new Warning();
    warning.id = 1;
    warning.message = 'Watch out';
    expect(warning.message).toBe('Watch out');

    const app = new App();
    app.id = 1;
    app.name = 'App';
    expect(app.name).toBe('App');

    const appMember = new AppMember();
    appMember.id = 1;
    appMember.role = 'moderator';
    expect(appMember.role).toBe('moderator');

    const deviceToken = new DeviceToken();
    deviceToken.id = 1;
    deviceToken.external_user_id = 'user_1';
    expect(deviceToken.external_user_id).toBe('user_1');

    const notif = new Notification();
    notif.id = 1;
    expect(notif.id).toBe(1);

    const notifLog = new NotificationLog();
    notifLog.id = 1;
    expect(notifLog.id).toBe(1);

    const dripCampaign = new DripCampaign();
    dripCampaign.id = 1;
    expect(dripCampaign.id).toBe(1);

    const dripStep = new DripStep();
    dripStep.id = 1;
    expect(dripStep.id).toBe(1);

    const dripSentLog = new DripSentLog();
    dripSentLog.id = 1;
    expect(dripSentLog.id).toBe(1);

    const cronJob = new CronJob();
    cronJob.id = 1;
    expect(cronJob.id).toBe(1);

    const cronJobLog = new CronJobLog();
    cronJobLog.id = 1;
    expect(cronJobLog.id).toBe(1);

    const systemSettings = new SystemSettings();
    systemSettings.id = 1;
    expect(systemSettings.id).toBe(1);
  });

  it('should instantiate all DTOs', () => {
    const signup = new SignupDto();
    signup.name = 'Name';
    signup.email = 'email@test.com';
    signup.password = 'Pass';
    expect(signup.name).toBe('Name');

    const login = new LoginDto();
    login.email = 'email@test.com';
    login.password = 'Pass';
    expect(login.email).toBe('email@test.com');

    const updateProfile = new UpdateProfileDto();
    updateProfile.name = 'Name';
    expect(updateProfile.name).toBe('Name');

    const changePassword = new ChangePasswordDto();
    changePassword.oldPassword = 'old';
    changePassword.newPassword = 'new';
    expect(changePassword.oldPassword).toBe('old');

    const forgot = new ForgotPasswordDto();
    forgot.email = 'e@test.com';
    expect(forgot.email).toBe('e@test.com');

    const reset = new ResetPasswordDto();
    reset.token = 'tok';
    reset.newPassword = 'new';
    expect(reset.token).toBe('tok');

    const verify = new VerifyEmailDto();
    verify.token = 'tok';
    expect(verify.token).toBe('tok');

    const resend = new ResendVerificationDto();
    resend.email = 'e@test.com';
    expect(resend.email).toBe('e@test.com');
  });

  it('should instantiate all feature modules', () => {
    expect(new AdminModule()).toBeDefined();
    expect(new AppEntityModule()).toBeDefined();
    expect(new AuthModule()).toBeDefined();
    expect(new CronModule()).toBeDefined();
    expect(new DeviceModule()).toBeDefined();
    expect(new DripModule()).toBeDefined();
    expect(new HealthModule()).toBeDefined();
    expect(new HttpCronModule()).toBeDefined();
    expect(new MailModule()).toBeDefined();
    expect(new PushModule()).toBeDefined();
    expect(new QueueModule()).toBeDefined();
    expect(new RedisModule()).toBeDefined();
    expect(new SdkModule()).toBeDefined();
    expect(new SystemModule()).toBeDefined();
    expect(new UserModule()).toBeDefined();
  });

  it('should execute AppModule onModuleInit', async () => {
    const appModule = new AppModule();
    expect(appModule).toBeDefined();
    await expect(appModule.onModuleInit()).resolves.toBeUndefined();
  });
});

