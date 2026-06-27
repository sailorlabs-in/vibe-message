import ApiRequest from './ApiRequest';

export interface SystemSettings {
  default_retention_days: number;
}

export const systemService = {
  getSettings: async (): Promise<SystemSettings> => {
    const response = await ApiRequest('/system/settings', 'get');
    return response.data;
  },

  updateSettings: async (default_retention_days: number): Promise<SystemSettings> => {
    const response = await ApiRequest('/system/settings', 'put', { default_retention_days });
    return response.data;
  },
};
