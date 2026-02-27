export interface ServerInitOptions {
  baseUrl?: string;
  appId: string;
  secretKey: string;
}

export interface NotificationData {
  title?: string;
  body?: string;
  icon?: string;
  click_action?: string;
  data?: Record<string, any>;
}

export class NotificationServerClient {
  private baseUrl: string;
  private appId: string;
  private secretKey: string;

  constructor(options: ServerInitOptions) {
    this.baseUrl = options.baseUrl || "https://vibemessage.umangsailor.com/api";
    this.appId = options.appId;
    this.secretKey = options.secretKey;
  }

  /**
   * Send a standard push notification to specific users implicitly abstracting the auth headers.
   */
  async notification(options: { notificationData: NotificationData; externalUsers?: string[] }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/push/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appId: this.appId,
        secretKey: this.secretKey,
        notification: options.notificationData,
        targets: {
          externalUserIds: options.externalUsers,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to send notification via Vibe Message Server");
    }

    return data.data;
  }

  /**
   * Send a silent payload (no visible push notification) to trigger background syncs
   * or updates within the application.
   */
  async silentNotification(options: { data: Record<string, any>; externalUsers?: string[] }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/push/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appId: this.appId,
        secretKey: this.secretKey,
        notification: {
          // A payload with only 'data' and no 'title'/'body' behaves as a silent push
          data: options.data,
        },
        targets: {
          externalUserIds: options.externalUsers,
        },
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to send silent notification via Vibe Message Server");
    }

    return result.data;
  }
}

/**
 * Initialize the Vibe Message Server Client
 * This must ONLY be used on your backend environment, NEVER expose the secretKey securely on the frontend.
 */
export function initServerClient(options: ServerInitOptions): NotificationServerClient {
  return new NotificationServerClient(options);
}
