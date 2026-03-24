"use client";

import { useState, useEffect, useCallback } from "react";
import { initNotificationClient, initServerClient } from "vibe-message";
import toast, { Toaster } from "react-hot-toast";

const STORAGE_KEY = "fcm-demo-config";

const generateUserId = () =>
  `user-${Math.random().toString(36).substring(2, 9)}`;

const loadConfig = () => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

const saveConfigToStorage = (config: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

// --- Icons as inline SVGs ---
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7z" />
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
  </svg>
);
const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
  </svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
  </svg>
);
const TerminalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="4 17 10 11 4 5" /><line x1="12" x2="20" y1="19" y2="19" />
  </svg>
);
const ShieldOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="m2 2 20 20" /><path d="M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 8 8.5a14 14 0 0 0 4-1.5" /><path d="M9.8 4H12a1 1 0 0 1 1 1v2.5" /><path d="M20 13V6a1 1 0 0 0-1-1h-1" />
  </svg>
);

// --- Status Badge ---
const StatusBadge = ({ status }: { status: NotificationPermission }) => {
  const config = {
    granted: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", label: "Granted" },
    denied: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", label: "Denied" },
    default: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", label: "Not Asked" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "granted" ? "bg-emerald-400" : status === "denied" ? "bg-red-400" : "bg-amber-400"}`} />
      {config.label}
    </span>
  );
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
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [activeTab, setActiveTab] = useState<"config" | "test">("config");
  const [isSending, setIsSending] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false);
  const [selfTitle, setSelfTitle] = useState("");
  const [selfBody, setSelfBody] = useState("");
  const [otherTitle, setOtherTitle] = useState("");
  const [otherBody, setOtherBody] = useState("");

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
  }, []);

  useEffect(() => {
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
      setUserId(generateUserId());
    }

    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }

    // Note: Foreground notifications are handled by client.onMessage() callback
    // which is registered during device registration. No separate SW listener needed.
  }, [addLog]);

  const saveToLocalStorage = () => {
    saveConfigToStorage({ appId, publicKey, secretKey, userId, otherUserId, baseUrl });
    addLog("💾 Configuration saved to localStorage");
    toast.success("Configuration saved!", {
      style: { background: "#282838", color: "#e4e4ef", border: "1px solid #35354a" },
    });
  };

  const registerDevice = async (isRegenerate = false) => {
    if (!appId || !userId) {
      addLog("❌ Please enter App ID and User ID");
      return;
    }
    try {
      setIsRegistering(true);
      addLog(isRegenerate ? "🔄 Regenerating device registration..." : "🔄 Initializing notification client...");

      const client = initNotificationClient({
        baseUrl: baseUrl.endsWith("/api") ? baseUrl : baseUrl + "/api",
        appId,
        publicKey,
      });

      client.onMessage((payload: any) => {
        addLog(`📱 onMessage: ${payload.title}`);
        toast.custom(
          (t) => (
            <div className={`${t.visible ? "animate-slide-in" : "opacity-0"} max-w-sm w-full bg-[#282838] border border-[#35354a] shadow-2xl shadow-indigo-500/10 rounded-xl pointer-events-auto flex overflow-hidden`}>
              <div className="flex-1 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">🔔</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{payload.title}</p>
                    {payload.body && <p className="mt-0.5 text-xs text-gray-400">{payload.body}</p>}
                  </div>
                </div>
              </div>
              <button onClick={() => toast.dismiss(t.id)} className="px-3 border-l border-[#35354a] text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                <XCircleIcon />
              </button>
            </div>
          ),
          { duration: 5000, position: "top-right" }
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
      await client.registerDevice({
        externalUserId: userId,
        serviceWorkerPath: "/demo-app/push-sw.js",
        serviceWorkerScope: "/demo-app/",
      });

      const registrations = await navigator.serviceWorker.getRegistrations();
      const swRegistration = registrations.find((r) => r.scope.includes("/demo-app/"));

      if (swRegistration) {
        const subscription = await swRegistration.pushManager.getSubscription();
        if (subscription) {
          setDeviceInfo({
            userId,
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.toJSON().keys?.p256dh,
              auth: subscription.toJSON().keys?.auth,
            },
          });
        }
      }

      setNotificationClient(client);
      setIsRegistered(true);
      setActiveTab("test");
      addLog(isRegenerate ? "✅ Device re-registered successfully!" : "✅ Device registered successfully!");
    } catch (error: any) {
      addLog(`❌ Registration failed: ${error.message}`);
      console.error(error);
    } finally {
      setIsRegistering(false);
    }
  };

  const clearRegistration = async () => {
    try {
      addLog("🔄 Clearing device registration...");
      const registrations = await navigator.serviceWorker.getRegistrations();
      const swRegistration = registrations.find((r) => r.scope.includes("/demo-app/"));
      if (swRegistration) {
        const subscription = await swRegistration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          addLog("✅ Push subscription removed");
        }
      }
      setIsRegistered(false);
      setNotificationClient(null);
      setDeviceInfo(null);
      setActiveTab("config");
      addLog("✅ Registration cleared!");
    } catch (error: any) {
      addLog(`❌ Clear failed: ${error.message}`);
      console.error(error);
    }
  };

  const unregisterDevice = async () => {
    if (!notificationClient || !userId) {
      addLog("❌ No active registration to unregister");
      return;
    }
    try {
      setIsUnregistering(true);
      addLog("🔄 Unregistering device from server...");
      await notificationClient.unregisterDevice(userId);
      setIsRegistered(false);
      setNotificationClient(null);
      setDeviceInfo(null);
      setActiveTab("config");
      addLog("✅ Device unregistered successfully from server!");
    } catch (error: any) {
      addLog(`❌ Unregister failed: ${error.message}`);
      console.error(error);
    } finally {
      setIsUnregistering(false);
    }
  };

  const requestPermission = async () => {
    try {
      addLog("🔔 Requesting notification permission...");
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      addLog(permission === "granted" ? "✅ Notification permission granted!" : permission === "denied" ? "❌ Notification permission denied" : "⚠️ Notification permission dismissed");
    } catch (error: any) {
      addLog(`❌ Permission request failed: ${error.message}`);
    }
  };

  const sendSelfNotification = async () => {
    if (!appId || !secretKey) {
      addLog("❌ Please enter App ID and Secret Key");
      return;
    }
    try {
      setIsSending(true);
      addLog("🔄 Sending notification to yourself...");
      const serverClient = initServerClient({
        baseUrl: baseUrl.endsWith("/api") ? baseUrl : baseUrl + "/api",
        appId,
        secretKey,
      });
      await serverClient.notification({
        notificationData: {
          title: selfTitle || "Test Notification",
          body: selfBody || "This is a test notification sent to yourself!",
          icon: "/demo-app/icon.png",
          click_action: "/demo-app/",
        },
        externalUsers: [userId],
      });
      addLog("✅ Notification sent! (In-app if focused, Push if not)");
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const sendOtherUserNotification = async () => {
    if (!appId || !secretKey || !otherUserId) {
      addLog("❌ Please enter App ID, Secret Key, and Other User ID");
      return;
    }
    try {
      setIsSending(true);
      addLog(`🔄 Sending notification to ${otherUserId}...`);
      const serverClient = initServerClient({
        baseUrl: baseUrl.endsWith("/api") ? baseUrl : baseUrl + "/api",
        appId,
        secretKey,
      });
      await serverClient.notification({
        notificationData: {
          title: otherTitle || "Notification from Another User",
          body: otherBody || `${userId} sent you a notification!`,
          icon: "/demo-app/icon.png",
          click_action: "/demo-app/",
        },
        externalUsers: [otherUserId],
      });
      addLog(`✅ Notification sent to ${otherUserId}!`);
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // --- Input field component ---
  const InputField = ({ label, value, onChange, placeholder, type = "text", hint }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; hint?: string }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 bg-[#14141c] border border-[#2e2e42] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-all duration-200"
        placeholder={placeholder}
      />
      {hint && <p className="text-[11px] text-gray-600">{hint}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#18181f] text-gray-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="border-b border-[#28283e] bg-[#1c1c26]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BellIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Notification Demo</h1>
              <p className="text-[11px] text-gray-500">Vibe Message Testing Console</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={permissionStatus} />
            {isRegistered && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Connected
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column: Config + Actions */}
          <div className="space-y-6">
            {/* Tab Switcher */}
            <div className="flex bg-[#1e1e28] rounded-xl p-1 border border-[#282838]">
              <button
                onClick={() => setActiveTab("config")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "config" ? "bg-[#282838] text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
              >
                <SettingsIcon /> Configuration
              </button>
              <button
                onClick={() => setActiveTab("test")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "test" ? "bg-[#282838] text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
              >
                <SendIcon /> Send Notifications
              </button>
            </div>

            {/* Config Tab */}
            {activeTab === "config" && (
              <div className="animate-fade-in-up space-y-6">
                {/* Connection Config Card */}
                <div className="bg-[#1e1e28] border border-[#282838] rounded-2xl p-6 space-y-5">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <SettingsIcon /> Server Configuration
                  </h2>
                  <InputField label="Base URL" value={baseUrl} onChange={setBaseUrl} placeholder="http://localhost:3000" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="App ID *" value={appId} onChange={setAppId} placeholder="Your app ID" />
                    <InputField label="Public Key *" value={publicKey} onChange={setPublicKey} placeholder="Your public key" />
                  </div>
                  <InputField label="Secret Key *" value={secretKey} onChange={setSecretKey} placeholder="Your secret key" type="password" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="Your User ID" value={userId} onChange={setUserId} placeholder="user-1" hint="Auto-generated on first visit" />
                    <InputField label="Other User ID" value={otherUserId} onChange={setOtherUserId} placeholder="user-2" />
                  </div>
                  <button
                    onClick={saveToLocalStorage}
                    className="w-full py-2.5 px-4 bg-[#282838] hover:bg-[#303044] border border-[#35354a] rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-200"
                  >
                    💾 Save Configuration
                  </button>
                </div>

                {/* Device Registration Card */}
                <div className="bg-[#1e1e28] border border-[#282838] rounded-2xl p-6 space-y-4">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    📱 Device Registration
                  </h2>

                  {!isRegistered ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => registerDevice(false)}
                        disabled={isRegistering}
                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isRegistering ? (
                          <><RefreshIcon /> Registering...</>
                        ) : (
                          <><BellIcon /> Register Device</>
                        )}
                      </button>
                      {permissionStatus !== "granted" && (
                        <button
                          onClick={requestPermission}
                          className="w-full py-2.5 px-4 bg-[#282838] hover:bg-[#303044] border border-[#35354a] rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all duration-200"
                        >
                          🔔 Request Permission
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Registered Status */}
                      <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <CheckCircleIcon />
                        <span className="text-sm text-emerald-400 font-medium">Device registered and listening</span>
                      </div>

                      {/* Device Info */}
                      {deviceInfo && (
                        <div className="p-3 bg-[#1a1a24] border border-[#282838] rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-gray-500 uppercase tracking-wider">User ID</span>
                            <span className="text-xs text-gray-300 font-mono">{deviceInfo.userId}</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-gray-500 uppercase tracking-wider">Endpoint</span>
                            <p className="text-[10px] text-gray-500 font-mono mt-1 break-all leading-relaxed">{deviceInfo.endpoint.substring(0, 80)}...</p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => registerDevice(true)}
                          className="py-2.5 px-3 bg-[#282838] hover:bg-[#303044] border border-[#35354a] rounded-xl text-xs font-medium text-gray-400 hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5"
                        >
                          <RefreshIcon /> Regenerate
                        </button>
                        <button
                          onClick={clearRegistration}
                          className="py-2.5 px-3 bg-[#282838] hover:bg-[#303044] border border-[#35354a] rounded-xl text-xs font-medium text-gray-400 hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5"
                        >
                          <TrashIcon /> Clear
                        </button>
                        <button
                          onClick={unregisterDevice}
                          disabled={isUnregistering}
                          className="py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <ShieldOffIcon /> {isUnregistering ? "..." : "Unregister"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Test Tab */}
            {activeTab === "test" && (
              <div className="animate-fade-in-up space-y-6">
                {/* How it works info */}
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4">
                  <p className="text-xs text-indigo-300 font-medium mb-2">💡 How notifications work</p>
                  <p className="text-[11px] text-indigo-300/70 leading-relaxed">
                    The system automatically determines the notification type. When the page is <strong className="text-indigo-300">focused</strong>, you&apos;ll get an <strong className="text-indigo-300">in-app toast</strong>. When <strong className="text-indigo-300">unfocused</strong>, you&apos;ll get an <strong className="text-indigo-300">OS push notification</strong>.
                  </p>
                </div>

                {/* Send to Self */}
                <div className="bg-[#1e1e28] border border-[#282838] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <BellIcon />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Send to Yourself</h3>
                      <p className="text-[11px] text-gray-500">Test notification delivery on this device</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-gray-500 uppercase tracking-wider">Title</label>
                      <input type="text" value={selfTitle} onChange={(e) => setSelfTitle(e.target.value)} placeholder="Test Notification" className="w-full px-3 py-2 bg-[#14141c] border border-[#2e2e42] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-gray-500 uppercase tracking-wider">Body</label>
                      <input type="text" value={selfBody} onChange={(e) => setSelfBody(e.target.value)} placeholder="This is a test notification..." className="w-full px-3 py-2 bg-[#14141c] border border-[#2e2e42] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                    </div>
                  </div>
                  <button
                    onClick={sendSelfNotification}
                    disabled={!isRegistered || isSending}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {isSending ? <><RefreshIcon /> Sending...</> : <><SendIcon /> Send Notification</>}
                  </button>
                  {!isRegistered && (
                    <p className="text-[11px] text-gray-600 text-center">Register your device first to send notifications</p>
                  )}
                </div>

                {/* Send to Other User */}
                <div className="bg-[#1e1e28] border border-[#282838] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <UserIcon />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Send to Other User</h3>
                      <p className="text-[11px] text-gray-500">Send to <span className="text-purple-400 font-mono">{otherUserId || "..."}</span></p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-gray-500 uppercase tracking-wider">Title</label>
                      <input type="text" value={otherTitle} onChange={(e) => setOtherTitle(e.target.value)} placeholder="Notification from Another User" className="w-full px-3 py-2 bg-[#14141c] border border-[#2e2e42] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-gray-500 uppercase tracking-wider">Body</label>
                      <input type="text" value={otherBody} onChange={(e) => setOtherBody(e.target.value)} placeholder={`${userId} sent you a notification!`} className="w-full px-3 py-2 bg-[#14141c] border border-[#2e2e42] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all" />
                    </div>
                  </div>
                  <button
                    onClick={sendOtherUserNotification}
                    disabled={isSending}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {isSending ? <><RefreshIcon /> Sending...</> : <><SendIcon /> Send Notification</>}
                  </button>
                </div>

                {/* Device Management when on test tab */}
                {isRegistered && (
                  <div className="bg-[#1e1e28] border border-[#282838] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                        <ShieldOffIcon />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Device Management</h3>
                        <p className="text-[11px] text-gray-500">Unregister this device from the server</p>
                      </div>
                    </div>
                    <button
                      onClick={unregisterDevice}
                      disabled={isUnregistering}
                      className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUnregistering ? <><RefreshIcon /> Unregistering...</> : <><ShieldOffIcon /> Unregister Device</>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Activity Logs */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="bg-[#1e1e28] border border-[#282838] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#282838]">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <TerminalIcon /> Activity Logs
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="text-[10px] uppercase tracking-wider text-gray-600 hover:text-gray-300 px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="h-[calc(100vh-180px)] min-h-[400px] overflow-y-auto p-3 font-mono text-[11px] leading-relaxed space-y-0.5">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-700">
                    <TerminalIcon />
                    <p className="mt-2 text-xs">No logs yet</p>
                    <p className="text-[10px] mt-0.5">Register device to start</p>
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className={`py-1 px-2 rounded ${index === 0 ? "bg-white/[0.03]" : ""} ${log.includes("❌") ? "text-red-400/80" : log.includes("✅") ? "text-emerald-400/80" : log.includes("🔄") ? "text-blue-400/70" : "text-gray-500"}`}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
