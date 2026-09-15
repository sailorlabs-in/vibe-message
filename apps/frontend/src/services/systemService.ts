import ApiRequest from './ApiRequest';

export interface SystemSettings {
  default_retention_days: number;
  smtp_host?: string;
  smtp_port?: number;
  smtp_secure?: boolean;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_from?: string;
  smtp_env_configured?: boolean;
  hide_forgot_password?: boolean;
  hide_email_verification?: boolean;
}

export interface PublicSystemSettings {
  is_self_hosted: boolean;
  hide_forgot_password: boolean;
  hide_email_verification: boolean;
}

export const systemService = {
  getSettings: async (): Promise<SystemSettings> => {
    const response = await ApiRequest('/system/settings', 'get');
    return response.data;
  },

  updateSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await ApiRequest('/system/settings', 'put', settings);
    return response.data;
  },

  getPublicSettings: async (): Promise<PublicSystemSettings> => {
    const response = await ApiRequest('/system/public-settings', 'get', undefined, false);
    return response.data;
  },
};
