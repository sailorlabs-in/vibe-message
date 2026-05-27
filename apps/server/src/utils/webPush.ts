import webpush from "web-push";
import { config } from "../config/env";

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  config.vapid.subject,
  config.vapid.publicKey,
  config.vapid.privateKey,
);

export { webpush };

export const getVapidPublicKey = (): string => {
  return config.vapid.publicKey;
};

export const getDevicePlatform = (subscriptionJson: string): string => {
  try {
    const sub = JSON.parse(subscriptionJson);
    const endpoint = sub.endpoint || "";
    if (endpoint.includes("fcm.googleapis.com") || endpoint.includes("android.googleapis.com")) {
      return "Chrome/Android";
    }
    if (endpoint.includes("apple.com") || endpoint.includes("push.apple.com")) {
      return "Safari";
    }
    if (endpoint.includes("mozilla.com") || endpoint.includes("mozilla.org")) {
      return "Firefox";
    }
    if (endpoint.includes("windows.com") || endpoint.includes("microsoft.com")) {
      return "Edge/Windows";
    }
    return "Web Push";
  } catch (e) {
    return "Web Push";
  }
};
