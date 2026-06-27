import {
  InitOptions,
  RegisterDeviceOptions,
  PushSubscription,
  MessageCallback,
  SilentMessageCallback,
  ServiceWorkerMessage,
} from './types';
import { encryptPayload } from './utils/crypto';

export class NotificationClient {
  private baseUrl: string;
  private appId: string;
  private publicKey: string;
  private vapidPublicKey: string | null = null;

  // Callback handlers
  private messageCallback: MessageCallback | null = null;
  private backgroundMessageCallback: MessageCallback | null = null;
  private silentMessageCallback: SilentMessageCallback | null = null;

  constructor(options: InitOptions) {
    this.baseUrl = options.baseUrl || 'https://vibemessage.sailorlabs.in/api';
    this.appId = options.appId;
    this.publicKey = options.publicKey;

    // Set up service worker message listener
    this.setupMessageListener();
  }

  /**
   * Set up listener for messages from service worker
   */
  private setupMessageListener(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const message: ServiceWorkerMessage = event.data;

        switch (message.type) {
          case 'FOREGROUND_MESSAGE':
            if (this.messageCallback) {
              this.messageCallback(message.payload);
            }
            break;
          case 'BACKGROUND_MESSAGE':
            if (this.backgroundMessageCallback) {
              this.backgroundMessageCallback(message.payload);
            }
            break;
          case 'SILENT_MESSAGE':
            if (this.silentMessageCallback) {
              this.silentMessageCallback(message.data);
            }
            break;
        }
      });
    }
  }

  /**
   * Register callback for foreground messages (when app is visible)
   */
  onMessage(callback: MessageCallback): void {
    this.messageCallback = callback;
  }

  /**
   * Register callback for background messages (when app is not visible)
   */
  onBackgroundMessage(callback: MessageCallback): void {
    this.backgroundMessageCallback = callback;
  }

  /**
   * Register callback for silent messages (no UI notification)
   */
  onSilentMessage(callback: SilentMessageCallback): void {
    this.silentMessageCallback = callback;
  }

  /**
   * Get VAPID public key from server
   */
  private async getVapidPublicKey(): Promise<string> {
    if (this.vapidPublicKey) {
      return this.vapidPublicKey;
    }

    const response = await fetch(`${this.baseUrl}/sdk/vapid-public-key`);
    const data = await response.json();

    if (!data.success || !data.data?.publicKey) {
      throw new Error('Failed to get VAPID public key');
    }

    this.vapidPublicKey = data.data.publicKey;
    return this.vapidPublicKey!;
  }

  /**
   * Convert base64 string to Uint8Array for VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    // eslint-disable-next-line no-useless-escape
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Register service worker and subscribe to push notifications
   */
  async registerDevice(options: RegisterDeviceOptions): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported in this browser');
    }

    if (!('PushManager' in window)) {
      throw new Error('Push notifications are not supported in this browser');
    }

    // Check for Notification support before requesting permission
    if (typeof window === 'undefined' || !('Notification' in window)) {
      throw new Error('Push notifications are not supported in this browser');
    }

    // Only request permission if not already granted (avoids macOS double-prompt issues)
    if (Notification.permission !== 'granted') {
      const permission = await window.Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }

    // Register service worker with retry for macOS stale-cache issues
    const swPath = options.serviceWorkerPath || '/push-sw.js';
    const swScope = options.serviceWorkerScope || '/';

    let registration: ServiceWorkerRegistration;
    try {
      // updateViaCache: 'none' forces the browser to bypass its HTTP cache for the SW script,
      // which fixes macOS Chrome's "unknown error occurred when fetching the script" issue
      registration = await navigator.serviceWorker.register(swPath, {
        scope: swScope,
        updateViaCache: 'none',
        type: 'classic',
      });
    } catch (swError: any) {
      // On macOS, a stale/corrupt cached SW can cause "An unknown error" —
      // clear all old registrations and retry once
      console.warn(
        'Service worker registration failed, clearing stale registrations and retrying...',
        swError
      );
      const existingRegistrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of existingRegistrations) {
        await reg.unregister();
      }
      // Give the browser a moment to fully clean up before retrying
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mac Chrome sometimes maintains a corrupted cache entry for the exact URL
      // that even updateViaCache: 'none' doesn't bypass. Append a cache-buster:
      const cacheBuster = swPath.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;

      registration = await navigator.serviceWorker.register(swPath + cacheBuster, {
        scope: swScope,
        updateViaCache: 'none',
        type: 'classic',
      });
    }

    // Wait for the service worker to be active — macOS browsers often need this
    // before pushManager.subscribe() will work reliably
    if (registration.installing || registration.waiting) {
      await new Promise<void>((resolve) => {
        const sw = registration.installing || registration.waiting;
        if (!sw) {
          resolve();
          return;
        }
        if (sw.state === 'activated') {
          resolve();
          return;
        }
        sw.addEventListener('statechange', function listener() {
          if (sw.state === 'activated') {
            sw.removeEventListener('statechange', listener);
            resolve();
          }
        });
        // Safety timeout — don't hang forever
        setTimeout(resolve, 5000);
      });
    }

    // Get VAPID public key
    const vapidPublicKey = await this.getVapidPublicKey();

    // Subscribe to push notifications
    let subscription: globalThis.PushSubscription;
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as any,
      });
    } catch (error: any) {
      // If there's an existing subscription with a different key, unsubscribe and retry
      if (
        error.name === 'InvalidStateError' ||
        error.message?.includes('different application server key')
      ) {
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          await existingSubscription.unsubscribe();
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as any,
          });
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    // Convert subscription to plain object
    const subscriptionObject: PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
      },
    };

    // Record timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    // Register device with backend
    const response = await fetch(`${this.baseUrl}/sdk/register-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: this.appId,
        payload: encryptPayload(
          {
            publicKey: this.publicKey,
            externalUserId: options.externalUserId,
            subscription: subscriptionObject,
            timezone,
          },
          this.publicKey
        ),
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to register device');
    }
  }

  /**
   * Unregister device from push notifications.
   * Only unregisters the current browser/device — other devices for the same user remain active.
   */
  async unregisterDevice(externalUserId: string): Promise<void> {
    // Get current subscription endpoint for per-device unregister
    let endpoint: string | undefined;

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          endpoint = subscription.endpoint;
          // Unsubscribe from push manager on this device
          await subscription.unsubscribe();
          break;
        }
      }
    }

    const response = await fetch(`${this.baseUrl}/sdk/unregister-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: this.appId,
        payload: encryptPayload(
          {
            externalUserId,
            endpoint,
          },
          this.publicKey
        ),
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to unregister device');
    }
  }
}

export function initNotificationClient(options: InitOptions): NotificationClient {
  return new NotificationClient(options);
}
