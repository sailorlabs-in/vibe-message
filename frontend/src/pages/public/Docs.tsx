import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type TabType = "overview" | "quickstart" | "backend" | "react" | "nextjs";

export const Docs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "overview", label: "Platform Overview", icon: "✨" },
    { id: "quickstart", label: "Quick Start", icon: "🔑" },
    { id: "backend", label: "Backend Integration", icon: "⚙️" },
    { id: "react", label: "React Frontend", icon: "⚛️" },
    { id: "nextjs", label: "Next.js Frontend", icon: "▲" },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background is now handled globally in App.tsx */}

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Vibe Message{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-primary-600 dark:from-theme-primary-500 to-theme-accent-500 dark:to-theme-accent-400">
              Docs
            </span>
          </h1>
          <p className="text-lg md:text-xl text-theme-text-secondary max-w-3xl mx-auto leading-relaxed">
            The modern, lightweight, and incredibly powerful push notification
            platform for the web. Drop-in Firebase Cloud Messaging alternative.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-theme-border pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 font-semibold rounded-t-xl transition-all duration-300 border-b-2 ${
                activeTab === tab.id
                  ? "bg-theme-bg-secondary text-theme-primary-600 dark:text-theme-primary-400 border-theme-primary-500 shadow-[0_-4px_20px_-10px_rgba(167,139,250,0.3)]"
                  : "text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-secondary border-transparent"
              }`}
            >
              <span className="mr-2 opacity-80">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-theme-bg-secondary rounded-2xl shadow-xl shadow-theme-border/20 border border-theme-border p-8 md:p-12 transition-all duration-500">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-theme-text-primary">
                  Why Vibe Message?
                </h2>
                <p className="text-lg text-theme-text-secondary mb-12 leading-relaxed max-w-4xl">
                  Vibe Message is built for modern web applications that need
                  reliable, customizable, and fast push notifications without
                  the heavy baggage of legacy SDKs.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  <FeatureCard
                    icon="⚡"
                    title="Ultra Lightweight"
                    description="Zero bloated dependencies. Our SDK is a fraction of the size of traditional platforms, ensuring your web app stays blazing fast."
                  />
                  <FeatureCard
                    icon="🔐"
                    title="VAPID Security"
                    description="Built on web standards. Uses encrypted payload delivery ensuring your notifications are secure from server to screen."
                  />
                  <FeatureCard
                    icon="🔄"
                    title="Smart Delivery"
                    description="Automatically detects if your users are using the app. Show in-app toasts when active, and OS-level push notifications when away."
                  />
                  <FeatureCard
                    icon="👥"
                    title="Multi-tenant Ready"
                    description="Managing multiple apps? Vibe Message isolates credentials, users, and notifications giving you total platform control."
                  />
                  <FeatureCard
                    icon="🎨"
                    title="Highly Customizable"
                    description="You own the UI. Use our CLI to generate your Service Worker, then customize exactly how your notifications look and feel."
                  />
                  <FeatureCard
                    icon="📊"
                    title="Silent Data Sync"
                    description="Send invisible data payloads to your app to trigger background data refreshes, perfect for chat apps and live dashboards."
                  />
                </div>

                <div className="bg-theme-bg-primary border border-theme-primary-500/30 rounded-2xl p-8 lg:p-10 relative overflow-hidden shadow-2xl shadow-theme-primary-500/5 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-theme-primary-500/10 to-transparent opacity-50"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-theme-text-primary">
                        Ready to build?
                      </h3>
                      <p className="text-theme-text-secondary text-lg">
                        Join the platform, grab your API keys, and start sending
                        messages in under 5 minutes.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("quickstart")}
                      className="whitespace-nowrap px-8 py-4 bg-theme-primary-600 hover:bg-theme-primary-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-theme-primary-500/20 hover:-translate-y-1"
                    >
                      View Setup Guide →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "quickstart" && (
              <motion.div
                key="quickstart"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-4xl font-extrabold mb-6 text-theme-text-primary">
                    How It Works
                  </h2>
                  <p className="text-xl text-theme-text-secondary leading-relaxed">
                    To use Vibe Message, you need two pieces: a{" "}
                    <strong className="text-theme-primary-600 dark:text-theme-primary-400 font-semibold">
                      Frontend
                    </strong>{" "}
                    application (to receive messages) and a{" "}
                    <strong className="text-theme-primary-600 dark:text-theme-primary-400 font-semibold">
                      Backend
                    </strong>{" "}
                    service (to send messages securely).
                  </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 relative pb-8">
                  {/* Connecting lines for desktop */}
                  <div className="hidden lg:block absolute top-[20%] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-theme-primary-500/0 via-theme-primary-500/30 to-theme-primary-500/0 z-0 pointer-events-none"></div>

                  {/* Step 1 */}
                  <div className="relative z-10 bg-theme-bg-primary border border-theme-border rounded-2xl p-8 hover:border-theme-primary-500/50 hover:shadow-2xl hover:shadow-theme-primary-500/10 transition-all duration-300 group flex flex-col h-full">
                    <div className="absolute -top-4 -right-2 text-9xl font-extrabold text-theme-text-primary/5 dark:text-theme-primary-500/5 group-hover:text-theme-text-primary/10 dark:group-hover:text-theme-primary-500/10 transition-colors pointer-events-none select-none">
                      1
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-theme-primary-500 to-theme-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-theme-primary-500/20 mb-8 mx-auto lg:mx-0 transform group-hover:rotate-6 transition-transform flex-shrink-0">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-theme-text-primary mb-4 text-center lg:text-left">
                      Create Application
                    </h3>
                    <p className="text-theme-text-secondary leading-relaxed mb-8 text-center lg:text-left">
                      Register an App in the dashboard to receive your API keys.
                      Keep the secret key completely hidden.
                    </p>
                    <div className="space-y-3 mt-auto">
                      <div className="bg-theme-bg-secondary border border-theme-border rounded-lg p-3 text-sm flex items-center justify-between shadow-sm">
                        <span className="text-theme-text-muted font-mono">
                          appId
                        </span>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                          Public
                        </span>
                      </div>
                      <div className="bg-theme-bg-secondary border border-theme-border rounded-lg p-3 text-sm flex items-center justify-between shadow-sm">
                        <span className="text-theme-text-muted font-mono">
                          publicKey
                        </span>
                        <span className="text-xs font-semibold px-2 py-1 bg-theme-primary-100 dark:bg-theme-primary-900/30 text-theme-primary-700 dark:text-theme-primary-400 rounded">
                          Frontend
                        </span>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-3 text-sm flex items-center justify-between shadow-sm">
                        <span className="text-red-500 dark:text-red-400 font-mono">
                          secretKey
                        </span>
                        <span className="text-xs font-bold px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded">
                          Backend Only
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative z-10 bg-theme-bg-primary border border-theme-border rounded-2xl p-8 hover:border-theme-primary-500/50 hover:shadow-2xl hover:shadow-theme-primary-500/10 transition-all duration-300 group flex flex-col h-full mt-8 lg:mt-0">
                    <div className="absolute -top-4 -right-2 text-9xl font-extrabold text-theme-text-primary/5 dark:text-theme-primary-500/5 group-hover:text-theme-text-primary/10 dark:group-hover:text-theme-primary-500/10 transition-colors pointer-events-none select-none">
                      2
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-theme-accent-400 to-theme-accent-600 rounded-2xl flex items-center justify-center shadow-lg shadow-theme-accent-500/20 mb-8 mx-auto lg:mx-0 transform group-hover:-rotate-6 transition-transform flex-shrink-0">
                      <svg
                        className="w-8 h-8 text-gray-900 dark:text-gray-900"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-theme-text-primary mb-4 text-center lg:text-left">
                      Integrate Frontend
                    </h3>
                    <p className="text-theme-text-secondary leading-relaxed mb-6 text-center lg:text-left">
                      Use{" "}
                      <code className="text-sm font-mono text-theme-primary-600 dark:text-theme-primary-400">
                        publicKey
                      </code>{" "}
                      to authenticate the client browser and register the device
                      with the platform.
                    </p>
                    <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-xl p-5 mt-auto shadow-inner relative overflow-hidden group-hover:border-theme-primary-500/50 transition-colors">
                      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                      </div>
                      <pre className="text-sm font-mono text-gray-300 overflow-x-auto relative z-10">
                        <span className="text-theme-accent-400">await</span>{" "}
                        vibe.registerDevice({"{"}
                        <br />
                        &nbsp;&nbsp;externalUserId:{" "}
                        <span className="text-theme-warning">'usr_123'</span>
                        <br />
                        {"}"});
                      </pre>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative z-10 bg-theme-bg-primary border border-theme-border rounded-2xl p-8 hover:border-theme-primary-500/50 hover:shadow-2xl hover:shadow-theme-primary-500/10 transition-all duration-300 group flex flex-col h-full mt-8 lg:mt-0">
                    <div className="absolute -top-4 -right-2 text-9xl font-extrabold text-theme-text-primary/5 dark:text-theme-primary-500/5 group-hover:text-theme-text-primary/10 dark:group-hover:text-theme-primary-500/10 transition-colors pointer-events-none select-none">
                      3
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-900/20 mb-8 mx-auto lg:mx-0 transform group-hover:rotate-6 transition-transform flex-shrink-0">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-theme-text-primary mb-4 text-center lg:text-left">
                      Trigger from Backend
                    </h3>
                    <p className="text-theme-text-secondary leading-relaxed mb-6 text-center lg:text-left">
                      Use{" "}
                      <code className="text-sm font-mono text-red-500">
                        secretKey
                      </code>{" "}
                      securely on your server to push messages instantly to the
                      registered devices.
                    </p>
                    <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-xl p-5 mt-auto shadow-inner relative overflow-hidden group-hover:border-red-500/30 transition-colors">
                      <pre className="text-sm font-mono text-gray-300 overflow-x-auto relative z-10">
                        <span className="text-theme-primary-400">await</span>{" "}
                        vibe.notification({"{"}
                        <br />
                        &nbsp;&nbsp;users: [
                        <span className="text-theme-warning">'usr_123'</span>],
                        <br />
                        &nbsp;&nbsp;title:{" "}
                        <span className="text-theme-warning">'Hello!'</span>
                        <br />
                        {"}"});
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "backend" && (
              <motion.div
                key="backend"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <h2 className="text-3xl font-bold mb-4 text-theme-text-primary">
                  Backend Integration (Sending)
                </h2>
                <p className="text-lg text-theme-text-secondary mb-10 leading-relaxed p-4 bg-theme-warning/10 border-l-4 border-theme-warning rounded-r-lg">
                  Your backend server is responsible for triggering
                  notifications. You should{" "}
                  <strong className="text-theme-error">never</strong> expose
                  your{" "}
                  <code className="font-mono text-sm bg-theme-bg-secondary px-1 py-0.5 rounded">
                    secretKey
                  </code>{" "}
                  to your frontend code.
                </p>

                <div className="space-y-12">
                  <div>
                    <h3 className="text-xl font-bold text-theme-text-primary mb-3">
                      1. Install the SDK
                    </h3>
                    <p className="text-theme-text-secondary mb-6">
                      First, you need to install the package via npm in your
                      Node.js backend.
                    </p>
                    <CodeBlock
                      code={`npm install vibe-message`}
                      language="bash"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-theme-text-primary mb-3">
                      2. Send a Notification via SDK
                    </h3>
                    <p className="text-theme-text-secondary mb-6">
                      Use the Vibe Message SDK in your Node.js server to quickly
                      initialize and dispatch notifications securely.
                    </p>
                    <CodeBlock
                      code={`import { initServerClient } from 'vibe-message';

const vibe = initServerClient({
  appId: 'your-app-id',
  secretKey: 'your-secret-key'
});

const result = await vibe.notification({
  notificationData: {
    title: 'New Content!',
    body: 'Someone liked your post.',
    icon: 'https://yoursite.com/icon.png',
    click_action: 'https://yoursite.com/dashboard',
  },
  externalUsers: ['user-123'] // ID of the user you want to notify
});

console.log(result);`}
                      language="typescript"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-theme-text-primary mb-3">
                      3. Send a Silent Data Payload
                    </h3>
                    <p className="text-theme-text-secondary mb-6">
                      Need to trigger an invisible background refresh on the
                      client? Send a silent payload without a title/body using
                      the{" "}
                      <code className="text-sm font-mono bg-theme-bg-muted px-1 py-0.5 border border-theme-border rounded text-theme-primary-500">
                        silentNotification
                      </code>{" "}
                      method.
                    </p>
                    <CodeBlock
                      code={`import { initServerClient } from 'vibe-message';

const vibe = initServerClient({
  appId: 'your-app-id',
  secretKey: 'your-secret-key'
});

await vibe.silentNotification({
  data: {
    type: 'REFRESH_CHAT',
    chatId: 'chat-456'
  },
  externalUsers: ['user-123']
});`}
                      language="typescript"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "react" && (
              <motion.div
                key="react"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <h2 className="text-3xl font-bold mb-4 text-theme-text-primary">
                  React Frontend (Receiving)
                </h2>
                <p className="text-lg text-theme-text-secondary mb-10 leading-relaxed">
                  The recommended pattern for SPAs like Create React App or Vite
                  to start receiving messages sent by your backend.
                </p>

                <div className="space-y-12">
                  <div>
                    <h3 className="text-xl font-bold text-theme-text-primary mb-3">
                      1. Install SDK & Generate Worker
                    </h3>
                    <p className="text-theme-text-secondary mb-6">
                      Install the package, and drop the Service Worker file into
                      your public folder using the CLI.
                    </p>
                    <CodeBlock
                      code={`npm install vibe-message\n\nnpx vibe-message init`}
                      language="bash"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-theme-text-primary mb-3">
                      2. Create a Context Provider
                    </h3>
                    <p className="text-theme-text-secondary mb-6">
                      Create a global React context to manage notification state
                      and permissions.
                    </p>
                    <CodeBlock
                      code={`import React, { createContext, useContext, useState, useRef } from 'react';
import { initNotificationClient } from 'vibe-message';
import toast from 'react-hot-toast';

export const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: any) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const clientRef = useRef<any>(null);

  const init = async (userId: string) => {
    const client = initNotificationClient({
      appId: 'your-app-id',
      publicKey: 'your-public-key'
    });
    clientRef.current = client;

    client.onMessage((payload: any) => {
      // Show modern in-app toast for foreground users
      toast.success(payload.title + ": " + payload.body);
    });

    // Register the client using the logged-in user's DB ID
    await client.registerDevice({ externalUserId: userId });
    setIsRegistered(true);
  };

  return (
    <NotificationContext.Provider value={{ isRegistered, init }}>
      {children}
    </NotificationContext.Provider>
  );
};`}
                      language="tsx"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-theme-text-primary mb-3">
                      3. Use Anywhere
                    </h3>
                    <p className="text-theme-text-secondary mb-6">
                      Now you can request permissions and initialize the SDK
                      from any component (e.g. after login)!
                    </p>
                    <CodeBlock
                      code={`function LoginButton() {
  const { init } = useContext(NotificationContext);

  const handleLogin = async () => {
    // 1. Perform login via your backend
    const user = await API.login();
    
    // 2. Request browser permission
    await Notification.requestPermission();
    
    // 3. Connect the browser to Vibe Message
    await init(user.id);
  };

  return <button onClick={handleLogin}>Log In</button>;
}`}
                      language="tsx"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "nextjs" && (
              <motion.div
                key="nextjs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <h2 className="text-3xl font-bold mb-4 text-theme-text-primary">
                  Next.js Frontend (Receiving)
                </h2>
                <p className="text-lg text-theme-text-secondary mb-10 leading-relaxed">
                  Integration guide optimized for Next.js 13+ App Router Client
                  Components.
                </p>

                <div className="space-y-12">
                  <div>
                    <h3 className="text-xl font-bold text-theme-text-primary mb-3">
                      1. Install SDK & Generate Worker
                    </h3>
                    <p className="text-theme-text-secondary mb-6">
                      Install the package from npm, and generate the{" "}
                      <code>push-sw.js</code> file into your Next.js public
                      directory.
                    </p>
                    <CodeBlock
                      code={`npm install vibe-message\n\nnpx vibe-message init`}
                      language="bash"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-theme-text-primary mb-3">
                      2. Create a Client Component
                    </h3>
                    <p className="text-theme-text-secondary mb-6">
                      Because the SDK uses browser APIs, ensure the wrapper
                      component uses the{" "}
                      <code className="font-mono text-sm bg-theme-bg-muted px-1 py-0.5 border border-theme-border rounded text-theme-primary-500">
                        'use client'
                      </code>{" "}
                      directive.
                    </p>
                    <CodeBlock
                      code={`"use client";
import { useEffect, useRef } from 'react';
import { initNotificationClient } from 'vibe-message';

export default function PushNotifications() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    
    const setup = async () => {
      // Verify browser permission before registering
      if (typeof window === 'undefined' || Notification.permission !== 'granted') return;

      const client = initNotificationClient({
        appId: 'your-app-id',
        publicKey: 'your-public-key'
      });

      client.onMessage((payload) => alert("Received: " + payload.title));

      // Register with the logged-in user's ID
      await client.registerDevice({ externalUserId: 'user-123' });
      isInitialized.current = true;
    };

    setup();
  }, []);

  return null; // Empty wrapper
}`}
                      language="tsx"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-theme-text-primary mb-3">
                      3. Mount inside Layout
                    </h3>
                    <p className="text-theme-text-secondary mb-6">
                      Mount your client component somewhere global, like your
                      root Layout or a specific Dashboard layout wrapper.
                    </p>
                    <CodeBlock
                      code={`import PushNotifications from './components/PushNotifications';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PushNotifications />
        {children}
      </body>
    </html>
  );
}`}
                      language="tsx"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// UI Components

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <motion.div
    className="p-8 rounded-2xl border border-theme-border bg-theme-bg-primary hover:border-theme-primary-500/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default"
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
  >
    <div className="w-14 h-14 rounded-xl bg-theme-primary-500/10 text-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-theme-primary-600 dark:text-theme-primary-400">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-theme-text-primary mb-3">{title}</h3>
    <p className="text-theme-text-secondary leading-relaxed text-sm">
      {description}
    </p>
  </motion.div>
);

const CodeBlock = ({ code, language }: { code: string; language: string }) => (
  <motion.div
    className="rounded-xl overflow-hidden border border-[#2d2d2d] bg-[#1e1e1e] shadow-lg"
    initial={{ opacity: 0, scale: 0.98 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.4 }}
  >
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d2d]">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
      </div>
      <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">
        {language}
      </div>
    </div>
    <div className="p-6 overflow-x-auto custom-scrollbar">
      <pre className="text-gray-300 text-sm leading-relaxed font-mono whitespace-pre-wrap break-normal">
        <code>{code}</code>
      </pre>
    </div>
  </motion.div>
);
