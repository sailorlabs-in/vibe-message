import ApiRequest from './ApiRequest';
import { decryptPayload, SYSTEM_ENCRYPTION_KEY } from '../utils/crypto';

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
    try {
      const response = await ApiRequest('/system/public-settings', 'get', undefined, false);
      const rawData = response?.data !== undefined ? response.data : response;
      if (typeof rawData === 'string') {
        return decryptPayload<PublicSystemSettings>(rawData, SYSTEM_ENCRYPTION_KEY);
      }
      return rawData;
    } catch (err) {
      console.error('Failed to decrypt public settings:', err);
      return {
        is_self_hosted: false,
        hide_forgot_password: false,
        hide_email_verification: false,
      };
    }
  },
};
