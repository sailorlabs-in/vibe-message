import webpush from 'web-push';
import { config } from '../config/env';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  config.vapid.subject,
  config.vapid.publicKey,
  config.vapid.privateKey
);

export { webpush };

export const getVapidPublicKey = (): string => {
  return config.vapid.publicKey;
};
