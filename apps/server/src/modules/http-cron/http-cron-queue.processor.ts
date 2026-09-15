import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { HTTP_CRON_QUEUE_NAME, HttpCronJobPayload } from '../queue/queue.constants';
import { CronJob } from './entities/cron-job.entity';
import { CronJobLog } from './entities/cron-job-log.entity';
import { InternalNotificationService } from '../system/internal-notification.service';

@Processor(HTTP_CRON_QUEUE_NAME, { concurrency: 5 })
export class HttpCronQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(HttpCronQueueProcessor.name);

  constructor(
    @InjectRepository(CronJob)
    private readonly cronJobRepo: Repository<CronJob>,
    @InjectRepository(CronJobLog)
    private readonly cronJobLogRepo: Repository<CronJobLog>,
    private readonly internalNotificationService: InternalNotificationService
  ) {
    super();
  }

  async process(job: Job<HttpCronJobPayload>): Promise<any> {
    const { cronJobId, isManual } = job.data;
    this.logger.log(`⚡ [HttpCron Worker] Starting execution for cron job #${cronJobId} (manual=${!!isManual})`);

    const cronJob = await this.cronJobRepo.findOne({
      where: { id: cronJobId },
    });

    if (!cronJob) {
      this.logger.warn(`⚠️ [HttpCron Worker] Cron job #${cronJobId} not found. Skipping.`);
      return { skipped: true, reason: 'NOT_FOUND' };
    }

    if (!cronJob.is_enabled && !isManual) {
      this.logger.log(`⏸️ [HttpCron Worker] Cron job #${cronJobId} is paused. Skipping scheduled tick.`);
      return { skipped: true, reason: 'PAUSED' };
    }

    const triggeredAt = new Date();
    let statusCode: number | null = null;
    let isSuccess = false;
    let responseBody: string | null = null;
    let responseHeaders: Record<string, string> | null = null;
    let errorMessage: string | null = null;
    let durationMs = 0;

    const maxAttempts = (cronJob.retries || 0) + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const startTime = Date.now();
      try {
        const timeoutMs = (cronJob.timeout_seconds || 30) * 1000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const requestHeaders: Record<string, string> = {
          'User-Agent': 'VibeMessage-CronBot/1.0 (+https://vibemessage.sailorlabs.in)',
          Accept: '*/*',
          ...(cronJob.headers || {}),
        };

        const fetchOptions: RequestInit = {
          method: cronJob.method,
          headers: requestHeaders,
          signal: controller.signal,
        };

        if (
          ['POST', 'PUT', 'PATCH'].includes(cronJob.method.toUpperCase()) &&
          cronJob.body
        ) {
          fetchOptions.body = cronJob.body;
          if (!requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
            requestHeaders['Content-Type'] = 'application/json';
          }
        }

        const response = await fetch(cronJob.url, fetchOptions);
        clearTimeout(timeoutId);

        durationMs = Date.now() - startTime;
        statusCode = response.status;
        isSuccess = response.status >= 200 && response.status < 400;

        // Capture response headers
        const resHeaders: Record<string, string> = {};
        response.headers.forEach((val, key) => {
          resHeaders[key] = val;
        });
        responseHeaders = resHeaders;

        // Capture response body snippet (max 2048 chars)
        try {
          const text = await response.text();
          responseBody = text.length > 2048 ? text.substring(0, 2048) + '... [truncated]' : text;
        } catch {
          responseBody = null;
        }

        if (isSuccess || attempt === maxAttempts) {
          break;
        }
      } catch (err: any) {
        durationMs = Date.now() - startTime;
        errorMessage = err.name === 'AbortError'
          ? `Request timed out after ${cronJob.timeout_seconds || 30}s`
          : err.message || 'Network error occurred';
        isSuccess = false;
        statusCode = 0;

        if (attempt === maxAttempts) {
          break;
        }
        // Brief pause before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Persist execution log
    try {
      const log = this.cronJobLogRepo.create({
        cron_job_id: cronJob.id,
        triggered_at: triggeredAt,
        duration_ms: durationMs,
        status_code: statusCode,
        status: isSuccess ? 'SUCCESS' : 'FAILURE',
        response_headers: responseHeaders,
        response_body: responseBody,
        error_message: errorMessage,
        is_manual: !!isManual,
      });
      await this.cronJobLogRepo.save(log);
    } catch (saveLogError: any) {
      this.logger.error(`Failed to save cron job log for #${cronJob.id}:`, saveLogError.message);
    }

    // Update CronJob summary state
    try {
      cronJob.last_run_at = triggeredAt;
      cronJob.last_status_code = statusCode;
      cronJob.last_duration_ms = durationMs;
      cronJob.last_status = isSuccess ? 'SUCCESS' : 'FAILURE';

      if (isSuccess) {
        cronJob.consecutive_failures = 0;
      } else {
        cronJob.consecutive_failures = (cronJob.consecutive_failures || 0) + 1;
      }

      await this.cronJobRepo.save(cronJob);
    } catch (updateError: any) {
      this.logger.error(`Failed to update cron job state for #${cronJob.id}:`, updateError.message);
    }

    // Failure alert via push notification
    if (!isSuccess && cronJob.notify_on_failure) {
      try {
        const failureReason = statusCode && statusCode > 0
          ? `HTTP ${statusCode}`
          : errorMessage || 'Failed';

        await this.internalNotificationService.notifyUser(
          cronJob.user_id,
          `⚠️ Cron Job Alert: ${cronJob.title}`,
          `[${cronJob.method}] ${cronJob.url} failed (${failureReason}). Latency: ${durationMs}ms`,
          {
            type: 'cron_job_failure',
            cronJobId: cronJob.id,
            statusCode,
            url: cronJob.url,
          }
        );
      } catch (notifyError: any) {
        this.logger.warn(`Could not dispatch failure alert push for #${cronJob.id}:`, notifyError.message);
      }
    }

    this.logger.log(
      `🏁 [HttpCron Worker] Finished #${cronJob.id} "${cronJob.title}": ${isSuccess ? 'SUCCESS' : 'FAILURE'} (${statusCode || 'ERR'}, ${durationMs}ms)`
    );

    return {
      success: isSuccess,
      statusCode,
      durationMs,
    };
  }
}
