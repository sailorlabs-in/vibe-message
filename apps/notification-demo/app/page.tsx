"use client";

import { useState, useEffect } from "react";
import { initNotificationClient } from "vibe-message";
import toast, { Toaster } from "react-hot-toast";

const STORAGE_KEY = "fcm-demo-config";

// Generate random user ID
const generateUserId = () => {
  return `user-${Math.random().toString(36).substring(2, 9)}`;
};

// Load config from localStorage
const loadConfig = () => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

// Save config to localStorage
const saveConfig = (config: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export default function Home() {
  const [appId, setAppId] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [userId, setUserId] = useState("");
  const [otherUserId, setOtherUserId] = useState("user-2");
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");
  const [isRegistered, setIsRegistered] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [notificationClient, setNotificationClient] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    // Load from localStorage or generate random user ID
    const config = loadConfig();
    if (config) {
      setAppId(config.appId || "");
      setPublicKey(config.publicKey || "");
      setSecretKey(config.secretKey || "");
      setUserId(config.userId || generateUserId());
      setOtherUserId(config.otherUserId || "user-2");
      setBaseUrl(config.baseUrl || "http://localhost:3000");
      addLog("✅ Configuration loaded from localStorage");
    } else {
      // Generate random user ID for first time
      setUserId(generateUserId());
    }

    // Check initial permission status
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }

    // Listen for in-app notifications from service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "IN_APP_NOTIFICATION") {
          const { title, body, icon } = event.data.notification;

          // Show in-app notification using toast
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? "animate-enter" : "animate-leave"
                } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    {icon && (
                      <div className="flex-shrink-0 pt-0.5">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={icon}
                          alt=""
                        />
                      </div>
                    )}
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">{body}</p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                  >
                    Close
                  </button>
                </div>
              </div>
            ),
            {
              duration: 5000,
              position: "top-right",
            }
          );

          addLog(`🔔 In-app notification received: ${title}`);
        }
      });
    }
  }, []);

  const saveToLocalStorage = () => {
    const config = {
      appId,
      publicKey,
      secretKey,
      userId,
      otherUserId,
      baseUrl,
    };
    saveConfig(config);
    addLog("💾 Configuration saved to localStorage");
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
  };

  const registerDevice = async (isRegenerate = false) => {
    if (!appId || !userId) {
      addLog("❌ Please enter App ID and User ID");
      return;
    }

    try {
      if (isRegenerate) {
        addLog("🔄 Regenerating device registration...");
      } else {
        addLog("🔄 Initializing notification client...");
      }

      const client = initNotificationClient({
        baseUrl: baseUrl + "/api",
        appId: appId,
        publicKey: publicKey,
      });

      // Register callbacks for notifications
      client.onMessage((payload: any) => {
        addLog(`📱 ✅ onMessage TRIGGERED: ${payload.title}`);

        // Show toast notification for in-app messages
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <span className="text-2xl">🔔</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {payload.title}
                    </p>
                    {payload.body && (
                      <p className="mt-1 text-sm text-gray-500">
                        {payload.body}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          ),
          {
            duration: 5000,
            position: "top-right",
          }
        );
      });

      client.onBackgroundMessage((payload: any) => {
        addLog(`🔔 onBackgroundMessage: ${payload.title}`);
      });

      client.onSilentMessage((data: any) => {
        addLog(`🔇 onSilentMessage: ${JSON.stringify(data)}`);
      });

      addLog("🔄 Requesting notification permission...");
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission !== "granted") {
        addLog("❌ Notification permission denied");
        return;
      }

      addLog("🔄 Registering device...");
      const registration = await client.registerDevice({
        externalUserId: userId,
        serviceWorkerPath: "/push-sw.js",
      });

      // Get subscription details
      const swRegistration = await navigator.serviceWorker.ready;
      const subscription = await swRegistration.pushManager.getSubscription();

      if (subscription) {
        setDeviceInfo({
          userId: userId,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys?.p256dh,
            auth: subscription.toJSON().keys?.auth,
          },
        });
      }

      setNotificationClient(client);
      setIsRegistered(true);
      addLog(
        isRegenerate
          ? "✅ Device re-registered successfully!"
          : "✅ Device registered successfully!"
      );
    } catch (error: any) {
      console.log('🚀 ~ registerDevice ~ error:', error);
      addLog(`❌ Registration failed: ${error.message}`);
      console.error(error);
    }
  };

  const clearRegistration = async () => {
    try {
      addLog("🔄 Clearing device registration...");

      // Unregister service worker
      const swRegistration = await navigator.serviceWorker.ready;
      const subscription = await swRegistration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        addLog("✅ Push subscription removed");
      }

      setIsRegistered(false);
      setNotificationClient(null);
      setDeviceInfo(null);
      addLog("✅ Registration cleared!");
      addLog('💡 Click "Register Device" to re-enable notifications');
    } catch (error: any) {
      addLog(`❌ Clear failed: ${error.message}`);
      console.error(error);
    }
  };

  const requestPermission = async () => {
    try {
      addLog("🔔 Requesting notification permission...");
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === "granted") {
        addLog("✅ Notification permission granted!");
      } else if (permission === "denied") {
        addLog("❌ Notification permission denied");
      } else {
        addLog("⚠️ Notification permission dismissed");
      }
    } catch (error: any) {
      addLog(`❌ Permission request failed: ${error.message}`);
    }
  };

  const sendSelfPushNotification = async () => {
    if (!appId || !secretKey) {
      addLog("❌ Please enter App ID and Secret Key");
      return;
    }

    try {
      addLog("🔄 Sending self push notification...");
      const response = await fetch(`${baseUrl}/api/push/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId,
          secretKey,
          notification: {
            title: "Self Push Notification",
            body: "This is a push notification sent to yourself!",
            icon: "/icon.png",
            click_action: "/",
          },
          targets: {
            externalUserIds: [userId],
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        addLog("✅ Self push notification sent successfully!");
      } else {
        addLog(`❌ Failed: ${data.message}`);
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  const sendSelfInAppNotification = async () => {
    if (!appId || !secretKey) {
      addLog("❌ Please enter App ID and Secret Key");
      return;
    }

    try {
      addLog("🔄 Sending in-app notification via messaging service...");

      const response = await fetch(`${baseUrl}/api/push/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId,
          secretKey,
          notification: {
            title: "Self In-App Notification",
            body: "This was sent through the messaging service!",
            icon: "/icon.png",
          },
          targets: {
            externalUserIds: [userId],
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        addLog("✅ Notification sent! Watch for onMessage callback.");
      } else {
        addLog(`❌ Failed: ${data.message}`);
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  const sendOtherUserPushNotification = async () => {
    if (!appId || !secretKey || !otherUserId) {
      addLog("❌ Please enter App ID, Secret Key, and Other User ID");
      return;
    }

    try {
      addLog(`🔄 Sending push notification to ${otherUserId}...`);
      const response = await fetch(`${baseUrl}/api/push/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId,
          secretKey,
          notification: {
            title: "Push from Another User",
            body: `${userId} sent you a push notification!`,
            icon: "/icon.png",
            click_action: "/",
          },
          targets: {
            externalUserIds: [otherUserId],
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        addLog(`✅ Push notification sent to ${otherUserId}!`);
      } else {
        addLog(`❌ Failed: ${data.message}`);
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  const sendOtherUserInAppNotification = async () => {
    addLog(
      `ℹ️ In-app notifications are local only. To send to ${otherUserId}, they need to be on this page.`
    );
    addLog("💡 Use push notifications to reach other users remotely.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔔 Notification Demo
          </h1>
          <p className="text-gray-600">
            Test push and in-app notifications with your Vibe Message service
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              ⚙️ Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                  placeholder="http://localhost:3000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App ID *
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                  placeholder="Enter your app ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Key *
                </label>
                <input
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                  placeholder="Enter your public key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key *
                </label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                  placeholder="Enter your secret key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                  placeholder="user-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  🎲 Random ID generated on first visit
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other User ID
                </label>
                <input
                  type="text"
                  value={otherUserId}
                  onChange={(e) => setOtherUserId(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                  placeholder="user-2"
                />
              </div>

              {/* Save Configuration Button */}
              <button
                onClick={saveToLocalStorage}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                💾 Save Configuration
              </button>

              <div className="space-y-2">
                <button
                  onClick={() => registerDevice(false)}
                  disabled={isRegistered}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                    isRegistered
                      ? "bg-green-500 text-white cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isRegistered ? "✅ Device Registered" : "📱 Register Device"}
                </button>

                {isRegistered && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => registerDevice(true)}
                      className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
                    >
                      🔄 Regenerate
                    </button>
                    <button
                      onClick={clearRegistration}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                    >
                      🗑️ Clear
                    </button>
                  </div>
                )}

                {!isRegistered && (
                  <button
                    onClick={requestPermission}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition text-sm"
                  >
                    🔔 Request Permission
                  </button>
                )}
              </div>

              {/* Permission Status */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Permission:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      permissionStatus === "granted"
                        ? "text-green-600"
                        : permissionStatus === "denied"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {permissionStatus === "granted"
                      ? "✅ Granted"
                      : permissionStatus === "denied"
                      ? "❌ Denied"
                      : "⚠️ Not Asked"}
                  </span>
                </p>
              </div>

              {/* Device Info Display */}
              {deviceInfo && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    📱 Device Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-blue-800">
                        User ID:
                      </span>
                      <p className="text-blue-900 font-mono bg-white px-2 py-1 rounded mt-1 break-all">
                        {deviceInfo.userId}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">
                        Endpoint:
                      </span>
                      <p className="text-blue-900 font-mono text-xs bg-white px-2 py-1 rounded mt-1 break-all">
                        {deviceInfo.endpoint.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              🚀 Test Notifications
            </h2>

            <div className="space-y-3">
              <div className="border-b pb-3">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Self Notifications
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={sendSelfPushNotification}
                    disabled={!isRegistered}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📲 Self Push Notification
                  </button>
                  <button
                    onClick={sendSelfInAppNotification}
                    disabled={!isRegistered}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔔 Self In-App Notification
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Other User Notifications
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={sendOtherUserPushNotification}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    📤 Send Push to Other User
                  </button>
                  <button
                    onClick={sendOtherUserInAppNotification}
                    className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-700 transition"
                  >
                    💬 Send In-App to Other User
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>💡 How it works:</strong>
                </p>
                <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                  <li>
                    <strong>In-App:</strong> Shown as toast notification when
                    page is visible/focused
                  </li>
                  <li>
                    <strong>Push:</strong> Shown as OS notification when page is
                    hidden/unfocused
                  </li>
                  <li>
                    <strong>Tip:</strong> Open in two browsers with different
                    user IDs to test cross-user notifications!
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Logs Panel */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              📋 Activity Logs
            </h2>
            <button
              onClick={() => setLogs([])}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition"
            >
              Clear Logs
            </button>
          </div>

          <div className="bg-gray-900 text-green-400 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">
                No logs yet. Start by registering your device!
              </p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
