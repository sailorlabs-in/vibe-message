import { api } from './api';
import {
  CronJob,
  CronJobLog,
  CreateCronJobRequest,
  UpdateCronJobRequest,
} from '../types/cron-job';

export const cronJobService = {
  async getCronJobs(): Promise<CronJob[]> {
    const response = await api.get<{ success: boolean; data: CronJob[] }>('/cron-jobs');
    return response.data.data;
  },

  async getCronJob(id: number): Promise<CronJob> {
    const response = await api.get<{ success: boolean; data: CronJob }>(`/cron-jobs/${id}`);
    return response.data.data;
  },

  async createCronJob(data: CreateCronJobRequest): Promise<CronJob> {
    const response = await api.post<{ success: boolean; data: CronJob }>('/cron-jobs', data);
    return response.data.data;
  },

  async updateCronJob(id: number, data: UpdateCronJobRequest): Promise<CronJob> {
    const response = await api.patch<{ success: boolean; data: CronJob }>(`/cron-jobs/${id}`, data);
    return response.data.data;
  },

  async deleteCronJob(id: number): Promise<void> {
    await api.delete(`/cron-jobs/${id}`);
  },

  async toggleCronJob(id: number): Promise<CronJob> {
    const response = await api.patch<{ success: boolean; data: CronJob }>(`/cron-jobs/${id}/toggle`);
    return response.data.data;
  },

  async runCronJobNow(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(`/cron-jobs/${id}/run`);
    return response.data;
  },

  async getCronJobLogs(id: number, limit = 50): Promise<CronJobLog[]> {
    const response = await api.get<{ success: boolean; data: CronJobLog[] }>(
      `/cron-jobs/${id}/logs`,
      { params: { limit } }
    );
    return response.data.data;
  },
};
