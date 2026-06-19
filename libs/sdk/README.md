# Vibe Message SDK

Lightweight JavaScript SDK for web push notifications — a modern Firebase Cloud Messaging alternative.

[![npm version](https://img.shields.io/npm/v/vibe-message.svg)](https://www.npmjs.com/package/vibe-message)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 🎯 Live Demo

> Try a working demo at **[vibemessage.sailorlabs.in/demo-app](https://vibemessage.sailorlabs.in/demo-app)**

---

## Getting Started

### Step 1 — Create an Account

Sign up at [vibemessage.sailorlabs.in](https://vibemessage.sailorlabs.in) to access the admin panel.

### Step 2 — Create an App

Once logged in, create a new app from the dashboard. After creation you will receive three credentials:

| Credential     | Where to use                          |
| -------------- | ------------------------------------- |
| **App ID**     | Both client SDK & server SDK          |
| **Public Key** | Client SDK (frontend)                 |
| **Secret Key** | Server SDK only (backend — keep safe) |

> **⚠️ Important:** Never expose your **Secret Key** on the frontend. It must only be used in server-side (Node.js) environments.

### Step 3 — Install the SDK

```bash
npm install vibe-message
```

### Step 4 — Generate the Service Worker

Run this once in your project root (React / Vite / Next.js / plain HTML):

```bash
npx vibe-message init
```

This auto-detects your `public` directory and creates a `push-sw.js` service-worker file required for background notifications.

---

## Client SDK (Frontend)

Use the **App ID** and **Public Key** obtained from Step 2.

### Initialize

```javascript
import { initNotificationClient } from 'vibe-message';

const client = initNotificationClient({
  appId: 'your-app-id',
  publicKey: 'your-public-key',
  // baseUrl: 'https://vibemessage.sailorlabs.in/api'  ← default, override if self-hosting
});
```

### Register a Device

Call this when the user logs in or when you want to start receiving notifications:

```javascript
await client.registerDevice({
  externalUserId: 'user-123',
  serviceWorkerPath: '/push-sw.js',  // optional, defaults to '/push-sw.js'
  serviceWorkerScope: '/',            // optional, defaults to '/'
});
```

### Listen for Messages

```javascript
// Foreground — app is visible / focused
client.onMessage((payload) => {
  console.log('Foreground message:', payload);
  // Show your own in-app toast / banner
});

// Background — user clicked a push notification
client.onBackgroundMessage((payload) => {
  console.log('Notification clicked:', payload);
  // Navigate, refresh data, etc.
});

// Silent — no visible notification, just data
client.onSilentMessage((data) => {
  console.log('Silent data:', data);
});
```

### Unregister a Device

Call this when the user logs out:

```javascript
await client.unregisterDevice('user-123');
```

---

## Server SDK (Backend — Node.js)

Use the **App ID** and **Secret Key** obtained from Step 2.

### Initialize

```javascript
import { initServerClient } from 'vibe-message';

const server = initServerClient({
  appId: 'your-app-id',
  secretKey: 'your-secret-key',
  // baseUrl: 'https://vibemessage.sailorlabs.in/api'  ← default
});
```

### Send a Push Notification

```javascript
await server.notification({
  notificationData: {
    title: 'Hello!',
    body: 'You have a new message.',
    icon: '/icon.png',
    click_action: 'https://your-app.com/messages',
    // Supports custom JSON objects or stringified JSON strings (parsed automatically by the SDK SW)
    data: JSON.stringify({ messageId: '42', channel: 'general' }),
  },
  externalUsers: ['user-123', 'user-456'],  // omit to broadcast
  scheduledAt: '2026-05-25T14:30:00Z', // optional, ISO-8601 UTC timestamp string or Date object
});
```

### Send a Silent Notification

Silent notifications carry data without showing a visible push to the user — useful for background syncing:

```javascript
await server.silentNotification({
  data: { action: 'SYNC_MESSAGES', conversationId: '99' },
  externalUsers: ['user-123'],
  scheduledAt: '2026-05-25T14:30:00Z', // optional, ISO-8601 UTC timestamp string or Date object
});
```

---

## API Reference

### Client SDK

| Method | Description |
| --- | --- |
| `initNotificationClient(options)` | Create a client instance. Options: `appId`, `publicKey`, `baseUrl?` |
| `client.registerDevice(options)` | Register for push. Options: `externalUserId`, `serviceWorkerPath?`, `serviceWorkerScope?` |
| `client.unregisterDevice(userId)` | Unregister a device by external user ID |
| `client.onMessage(callback)` | Foreground message handler |
| `client.onBackgroundMessage(callback)` | Background (notification-click) handler |
| `client.onSilentMessage(callback)` | Silent data handler |

### Server SDK

| Method | Description |
| --- | --- |
| `initServerClient(options)` | Create a server instance. Options: `appId`, `secretKey`, `baseUrl?` |
| `server.notification(options)` | Send a push notification. Options: `notificationData`, `externalUsers?`, `scheduledAt?` |
| `server.silentNotification(options)` | Send a silent data payload. Options: `data`, `externalUsers?`, `scheduledAt?` |

---

## Features

- 🚀 **Lightweight** — Minimal dependencies, small bundle size
- 🔒 **Secure** — VAPID authentication, encrypted payloads
- 📱 **Cross-platform** — Works on all modern browsers
- 🎯 **Type-safe** — Full TypeScript support
- 🔄 **Background sync** — Receive notifications even when the app is closed
- 🤫 **Silent push** — Send data payloads without disturbing the user
- 🎨 **Customizable** — Full control over notification appearance
- 🖥️ **Server SDK** — Send notifications from your Node.js backend with a single function call

## Browser Support

| Browser      | Version |
| ------------ | ------- |
| Chrome/Edge  | 50+     |
| Firefox      | 44+     |
| Safari       | 16+ (macOS 13+, iOS 16.4+) |
| Opera        | 37+     |

## License

MIT
