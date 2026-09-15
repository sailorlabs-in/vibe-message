import { HttpMethod } from './entities/cron-job.entity';

export interface CreateCronJobDto {
  title: string;
  url: string;
  method?: HttpMethod;
  schedule: string;
  timezone?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout_seconds?: number;
  retries?: number;
  is_enabled?: boolean;
  notify_on_failure?: boolean;
}

export interface UpdateCronJobDto {
  title?: string;
  url?: string;
  method?: HttpMethod;
  schedule?: string;
  timezone?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout_seconds?: number;
  retries?: number;
  is_enabled?: boolean;
  notify_on_failure?: boolean;
}

export interface CronJobResponse {
  id: number;
  user_id: number;
  title: string;
  url: string;
  method: HttpMethod;
  schedule: string;
  timezone: string;
  headers: Record<string, string> | null;
  body: string | null;
  timeout_seconds: number;
  retries: number;
  is_enabled: boolean;
  notify_on_failure: boolean;
  last_run_at: Date | null;
  last_status_code: number | null;
  last_duration_ms: number | null;
  last_status: 'SUCCESS' | 'FAILURE' | null;
  consecutive_failures: number;
  created_at: Date;
  updated_at: Date;
}

export interface CronJobLogResponse {
  id: number;
  cron_job_id: number;
  triggered_at: Date;
  duration_ms: number;
  status_code: number | null;
  status: 'SUCCESS' | 'FAILURE';
  response_headers: Record<string, string> | null;
  response_body: string | null;
  error_message: string | null;
  is_manual: boolean;
  created_at: Date;
}
