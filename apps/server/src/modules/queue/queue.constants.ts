export const PUSH_QUEUE_NAME = 'push-notification';
export const CRON_QUEUE_NAME = 'scheduler-cron';
export const MAIL_QUEUE_NAME = 'mail-queue';
export const HTTP_CRON_QUEUE_NAME = 'http-cron-queue';

export interface PushJobPayload {
  notificationId: number;
  appId: number;
  targetUserIds?: string[];
}

export interface MailJobPayload {
  to: string;
  subject: string;
  template: string;
  templateData: Record<string, any>;
}

export interface HttpCronJobPayload {
  cronJobId: number;
  isManual?: boolean;
}

