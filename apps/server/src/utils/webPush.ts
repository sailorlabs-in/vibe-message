import webpush from 'web-push';
import { config } from '../config/env';

let publicKey = config.vapid.publicKey;
let privateKey = config.vapid.privateKey;
const subject = config.vapid.subject || 'mailto:admin@example.com';

const isDummy = (key: string) => !key || key.includes('...') || key.length < 30;

if (isDummy(publicKey) || isDummy(privateKey)) {
  try {
    const keys = webpush.generateVAPIDKeys();
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
    console.log('🔑 Automatically generated valid VAPID keys for Web Push notifications.');
  } catch (err: any) {
    console.error('Failed to generate VAPID keys:', err.message);
  }
}

// Configure web-push with VAPID keys
try {
  webpush.setVapidDetails(subject, publicKey, privateKey);
} catch (err: any) {
  console.warn('⚠️ Web-push setup failed. Retrying with freshly generated VAPID keys...', err.message);
  try {
    const keys = webpush.generateVAPIDKeys();
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
    webpush.setVapidDetails('mailto:admin@example.com', publicKey, privateKey);
    console.log('🔑 Successfully configured freshly generated VAPID keys.');
  } catch (genErr: any) {
    console.error('❌ Critical VAPID Configuration Failure:', genErr.message);
  }
}

export { webpush };

export const getVapidPublicKey = (): string => {
  return publicKey;
};

export const getDevicePlatform = (subscriptionJson: string): string => {
  try {
    const sub = JSON.parse(subscriptionJson);
    const endpoint = sub.endpoint || '';
    if (endpoint.includes('fcm.googleapis.com') || endpoint.includes('android.googleapis.com')) {
      return 'Chrome/Android';
    }
    if (endpoint.includes('apple.com') || endpoint.includes('push.apple.com')) {
      return 'Safari';
    }
    if (endpoint.includes('mozilla.com') || endpoint.includes('mozilla.org')) {
      return 'Firefox';
    }
    if (endpoint.includes('windows.com') || endpoint.includes('microsoft.com')) {
      return 'Edge/Windows';
    }
    return 'Web Push';
  } catch (e) {
    return 'Web Push';
  }
};
