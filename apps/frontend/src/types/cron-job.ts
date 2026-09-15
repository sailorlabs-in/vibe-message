export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export interface CronJob {
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
  last_run_at: string | null;
  last_status_code: number | null;
  last_duration_ms: number | null;
  last_status: 'SUCCESS' | 'FAILURE' | null;
  consecutive_failures: number;
  created_at: string;
  updated_at: string;
}

export interface CronJobLog {
  id: number;
  cron_job_id: number;
  triggered_at: string;
  duration_ms: number;
  status_code: number | null;
  status: 'SUCCESS' | 'FAILURE';
  response_headers: Record<string, string> | null;
  response_body: string | null;
  error_message: string | null;
  is_manual: boolean;
  created_at: string;
}

export interface CreateCronJobRequest {
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

export interface UpdateCronJobRequest {
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
