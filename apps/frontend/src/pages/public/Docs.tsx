import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RiMagicLine, RiKeyLine, RiSettings3Line, RiReactjsLine, RiArrowUpLine, RiFlashlightLine, RiShieldKeyholeLine, RiRefreshLine, RiTeamLine, RiPaletteLine, RiBarChartBoxLine, RiInformationLine, RiCheckLine, RiErrorWarningLine, RiArchiveLine, RiServerLine, RiSmartphoneLine, RiCodeLine, RiFlaskLine } from "@remixicon/react";

type TabType = "overview" | "quickstart" | "backend" | "react" | "nextjs";

export const Docs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Platform Overview", icon: <RiMagicLine size={18} /> },
    { id: "quickstart", label: "Quick Start", icon: <RiKeyLine size={18} /> },
    { id: "backend", label: "Backend Integration", icon: <RiSettings3Line size={18} /> },
    { id: "react", label: "React Frontend", icon: <RiReactjsLine size={18} /> },
    { id: "nextjs", label: "Next.js Frontend", icon: <RiArrowUpLine size={18} /> },
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
                <p className="text-lg text-theme-text-secondary mb-8 leading-relaxed max-w-4xl">
                  Vibe Message is built for modern web applications that need
                  reliable, customizable, and fast push notifications without
                  the heavy baggage of legacy SDKs.
                </p>

                <div className="relative mb-16 rounded-2xl border border-theme-border dark:border-theme-border/30 bg-theme-bg-secondary p-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-theme-primary-500/20 via-theme-accent-500/20 to-transparent opacity-50 blur-xl"></div>
                  <div className="relative bg-theme-bg-primary rounded-xl overflow-hidden shadow-inner border border-theme-border/50 dark:border-white/5">
                    <div className="flex flex-col md:flex-row">
                      {/* Left: General Info */}
                      <div className="p-8 md:w-3/5 border-b md:border-b-0 md:border-r border-theme-border/50 dark:border-white/5">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-theme-primary-500/10 flex items-center justify-center text-theme-primary-600 dark:text-theme-primary-400">
                            <RiInformationLine size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-theme-text-primary m-0">
                            Intended Usage Guidelines
                          </h3>
                        </div>
                        <p className="text-theme-text-secondary leading-relaxed mb-6">
                          Our free hosted service is an ecosystem built primarily to support the developer community. It is designed and optimized for:
                        </p>
                        <ul className="grid grid-cols-2 gap-3">
                          {[
                            "Students & Education",
                            "Personal Projects",
                            "Testing & Prototyping",
                            "Small-scale Applications",
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-center text-sm text-theme-text-primary">
                              <RiCheckLine size={16} className="mr-2 text-theme-success" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right: Restrictions & Warnings */}
                      <div className="p-8 md:w-2/5 bg-gradient-to-br from-theme-bg-secondary to-theme-bg-primary flex flex-col justify-between">
                        <div>
                          <div className="inline-flex items-center px-3 py-1 bg-theme-error/10 text-theme-error border border-theme-error/20 dark:border-theme-error/10 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            <RiErrorWarningLine size={12} className="mr-1.5" />
                            Strictly Restricted
                          </div>
                          <h4 className="font-bold text-theme-text-primary mb-2">Commercial Production</h4>
                          <p className="text-sm text-theme-text-secondary leading-relaxed mb-6">
                            Large-scale and unmetered commercial usage is strictly restricted on the public tier. Accounts generating excessive structural load outside fair-use will be permanently banned to protect network stability.
                          </p>
                        </div>
                        
                        <div className="pt-4 border-t border-theme-border/50 dark:border-white/5">
                          <p className="text-xs text-theme-text-muted flex items-start">
                             <RiArchiveLine size={16} className="shrink-0 mr-1.5 mt-0.5" />
                            <span><strong className="text-theme-text-primary">Coming Soon:</strong> Pre-configured Docker images for self-hosted, unmetered commercial deployments on your own infrastructure.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  <FeatureCard
                    icon={<RiFlashlightLine size={28} />}
                    title="Ultra Lightweight"
                    description="Zero bloated dependencies. Our SDK is a fraction of the size of traditional platforms, ensuring your web app stays blazing fast."
                  />
                  <FeatureCard
                    icon={<RiShieldKeyholeLine size={28} />}
                    title="VAPID Security"
                    description="Built on web standards. Uses encrypted payload delivery ensuring your notifications are secure from server to screen."
                  />
                  <FeatureCard
                    icon={<RiRefreshLine size={28} />}
                    title="Smart Delivery"
                    description="Automatically detects if your users are using the app. Show in-app toasts when active, and OS-level push notifications when away."
                  />
                  <FeatureCard
                    icon={<RiTeamLine size={28} />}
                    title="Multi-tenant Ready"
                    description="Managing multiple apps? Vibe Message isolates credentials, users, and notifications giving you total platform control."
                  />
                  <FeatureCard
                    icon={<RiPaletteLine size={28} />}
                    title="Highly Customizable"
                    description="You own the UI. Use our CLI to generate your Service Worker, then customize exactly how your notifications look and feel."
                  />
                  <FeatureCard
                    icon={<RiBarChartBoxLine size={28} />}
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
                      <RiServerLine size={32} className="text-white" />
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
                      <RiSmartphoneLine size={32} className="text-gray-900 dark:text-gray-900" />
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
                        <RiCodeLine size={32} className="text-white" />
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
                      <RiFlaskLine size={32} className="text-white" />
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
                <div className="mb-10 text-center sm:text-left">
                  <h2 className="text-3xl font-bold mb-4 text-theme-text-primary">
                    Backend Integration (Sending)
                  </h2>
                  <p className="text-lg text-theme-text-secondary mb-10 leading-relaxed p-4 bg-theme-warning/10 border-l-4 border-theme-warning rounded-r-lg inline-block text-left">
                    Your backend server is responsible for triggering
                    notifications. You should{" "}
                    <strong className="text-theme-error">never</strong> expose
                    your{" "}
                    <code className="font-mono text-sm bg-theme-bg-secondary px-1 py-0.5 rounded">
                      secretKey
                    </code>{" "}
                    to your frontend code.
                  </p>
                </div>

                <div className="space-y-12">
                  <StepBlock
                    step="1"
                    title="Install the SDK"
                    description="First, you need to install the package via npm in your Node.js backend."
                    code={`npm install vibe-message`}
                    language="bash"
                  />

                  <StepBlock
                    step="2"
                    title="Send a Notification via SDK"
                    description="Use the Vibe Message SDK in your Node.js server to quickly initialize and dispatch notifications securely."
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

                  <StepBlock
                    step="3"
                    title="Send a Silent Data Payload"
                    description="Need to trigger an invisible background refresh on the client? Send a silent payload without a title/body using the silentNotification method."
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
                <div className="mb-10 text-center sm:text-left">
                  <h2 className="text-3xl font-bold mb-4 text-theme-text-primary">
                    React Integration Guide
                  </h2>
                  <p className="text-lg text-theme-text-secondary leading-relaxed">
                    The best way to integrate Vibe Message in SPAs (Create React
                    App, Vite, etc.) is by using a global Context to manage your
                    notification client. This allows you to easily tie
                    notifications to your user's authentication state.
                  </p>
                </div>

                <div className="space-y-12">
                  <StepBlock
                    step="1"
                    title="Install SDK & Generate Worker"
                    description="Install the package from npm, and initialize the required Service Worker in your public directory. This worker runs in the background to receive messages even when your app is closed."
                    code={`npm install vibe-message\n\nnpx vibe-message init`}
                    language="bash"
                  />

                  <StepBlock
                    step="2"
                    title="Create a Notification Provider"
                    description="Set up a Context Provider that initializes the client exactly once. It exposes methods to register the device upon login, and unregister it upon logout."
                    code={`import React, { createContext, useContext, useEffect, useRef } from 'react';
import { initNotificationClient } from 'vibe-message';
import toast from 'react-hot-toast'; // Optional: for in-app alerts

export const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const clientRef = useRef<any>(null);

  useEffect(() => {
    // 1. Initialize client once on app load
    clientRef.current = initNotificationClient({
      appId: 'your-app-id',
      publicKey: 'your-public-key'
    });

    // 2. Listen for messages while the app is actively open
    clientRef.current.onMessage((payload: any) => {
      toast.success(payload.title + ": " + payload.body);
    });
  }, []);

  // Use this when a user logs in
  const registerDevice = async (userId: string) => {
    if (!clientRef.current) return;
    await clientRef.current.registerDevice({ externalUserId: userId });
  };

  // Use this when a user logs out
  const unregisterDevice = async () => {
    if (!clientRef.current) return;
    await clientRef.current.unregisterDevice();
  };

  return (
    <NotificationContext.Provider value={{ registerDevice, unregisterDevice }}>
      {children}
    </NotificationContext.Provider>
  );
};`}
                    language="tsx"
                  />

                  <StepBlock
                    step="3"
                    title="Wrap Your App"
                    description="Wrap your main application component with the provider so the context is available anywhere."
                    code={`import { NotificationProvider } from './NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <YourAppComponents />
      </Router>
    </NotificationProvider>
  );
}`}
                    language="tsx"
                  />

                  <StepBlock
                    step="4"
                    title="Manage Device Registration on Login/Logout"
                    description="Now you can securely tie the push notification delivery to your authentication flow. When they log in, they get registered. When they log out, they stop receiving pushes to this device."
                    code={`import { useContext } from 'react';
import { NotificationContext } from './NotificationContext';

function AuthButtons() {
  const { registerDevice, unregisterDevice } = useContext(NotificationContext);

  const handleLogin = async () => {
    const user = await API.login();
    
    // Prompt the user for permission, then route pushes to their ID
    await Notification.requestPermission();
    await registerDevice(user.id);
  };

  const handleLogout = async () => {
    // Stop sending notifications to this browser
    await unregisterDevice();
    await API.logout();
  };

  return (
    <div className="flex gap-4">
      <button onClick={handleLogin}>Log In</button>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}`}
                    language="tsx"
                  />
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
                <div className="mb-10 text-center sm:text-left">
                  <h2 className="text-3xl font-bold mb-4 text-theme-text-primary">
                    Next.js App Router Integration
                  </h2>
                  <p className="text-lg text-theme-text-secondary leading-relaxed">
                    Designed for Next.js 13+ App Router. Because the Vibe
                    Message SDK relies on browser APIs (like Service Workers and
                    Notification), we use Client Components (
                    <code className="text-sm font-mono text-theme-primary-500 bg-theme-bg-muted p-1 rounded">
                      'use client'
                    </code>
                    ) to manage the integration.
                  </p>
                </div>

                <div className="space-y-12">
                  <StepBlock
                    step="1"
                    title="Install SDK & Generate Worker"
                    description="Install the dependency and use the CLI to generate the Service Worker file in your public directory. Next.js will automatically serve files in the public folder."
                    code={`npm install vibe-message\n\nnpx vibe-message init`}
                    language="bash"
                  />

                  <StepBlock
                    step="2"
                    title="Create a Client Provider Component"
                    description="Create a dedicated Client Component to initialize the SDK and expose register/unregister methods."
                    code={`"use client";
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { initNotificationClient } from 'vibe-message';

export const NotificationContext = createContext<any>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<any>(null);

  useEffect(() => {
    // Check if we are in the browser
    if (typeof window === 'undefined') return;

    clientRef.current = initNotificationClient({
      appId: 'your-app-id',
      publicKey: 'your-public-key'
    });

    clientRef.current.onMessage((payload: any) => {
      // Incoming message while tab is active! (e.g., show a toast)
      console.log('Received payload:', payload);
    });
  }, []);

  const registerDevice = async (userId: string) => {
    if (!clientRef.current) return;
    await clientRef.current.registerDevice({ externalUserId: userId });
  };

  const unregisterDevice = async () => {
    if (!clientRef.current) return;
    await clientRef.current.unregisterDevice();
  };

  return (
    <NotificationContext.Provider value={{ registerDevice, unregisterDevice }}>
      {children}
    </NotificationContext.Provider>
  );
}`}
                    language="tsx"
                  />

                  <StepBlock
                    step="3"
                    title="Inject Provider in Root Layout"
                    description="Wrap your application layout with the provider so all pages can access the context."
                    code={`// app/layout.tsx
import { NotificationProvider } from './components/NotificationProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}`}
                    language="tsx"
                  />

                  <StepBlock
                    step="4"
                    title="Register/Unregister on Authentication"
                    description="In your login and logout components (which must also be Client Components), use the Context to manage device registration."
                    code={`"use client";
import { useContext } from 'react';
import { NotificationContext } from './NotificationProvider';
import { RiMagicLine, RiKeyLine, RiSettings3Line, RiReactjsLine, RiArrowUpLine, RiFlashlightLine, RiShieldKeyholeLine, RiRefreshLine, RiTeamLine, RiPaletteLine, RiBarChartBoxLine, RiInformationLine, RiCheckLine, RiErrorWarningLine, RiArchiveLine, RiServerLine, RiSmartphoneLine, RiCodeLine, RiFlaskLine } from "@remixicon/react";


export default function AuthForms() {
  const { registerDevice, unregisterDevice } = useContext(NotificationContext);

  const handleLogin = async () => {
    const user = await loginUserToBackend();
    
    // Ensure the browser allows notifications
    await Notification.requestPermission();
    
    // Start routing pushes to this device
    await registerDevice(user.id);
  };

  const handleLogout = async () => {
    // Cut off push notifications to this device
    await unregisterDevice();
    await logoutUserFromBackend();
  };

  return (
    <div className="flex gap-4">
      <button onClick={handleLogin}>Log In</button>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}`}
                    language="tsx"
                  />
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
  icon: React.ReactNode;
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

const StepBlock = ({
  step,
  title,
  description,
  code,
  language,
}: {
  step: string;
  title: string;
  description: string;
  code: string;
  language: string;
}) => (
  <div className="relative pl-0 md:pl-16">
    <div className="hidden md:flex absolute top-0 left-0 w-11 h-11 rounded-full bg-gradient-to-br from-theme-primary-500 to-theme-primary-600 text-white items-center justify-center font-bold text-lg shadow-lg shadow-theme-primary-500/30 border border-white/10">
      {step}
    </div>
    <div className="md:hidden flex items-center gap-4 mb-5">
      <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-theme-primary-500 to-theme-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-theme-primary-500/30 border border-white/10">
        {step}
      </div>
      <h3 className="text-xl font-bold text-theme-text-primary m-0">{title}</h3>
    </div>
    <div className="hidden md:block">
      <h3 className="text-2xl font-bold text-theme-text-primary mb-3">
        {title}
      </h3>
    </div>
    <p className="text-theme-text-secondary mb-6 leading-relaxed">
      {description}
    </p>
    <CodeBlock code={code} language={language} />
  </div>
);
