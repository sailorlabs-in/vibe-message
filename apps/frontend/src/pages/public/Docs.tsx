import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiMagicLine,
  RiKeyLine,
  RiSettings3Line,
  RiReactjsLine,
  RiArrowUpLine,
  RiFlashlightLine,
  RiShieldKeyholeLine,
  RiRefreshLine,
  RiTeamLine,
  RiPaletteLine,
  RiBarChartBoxLine,
  RiInformationLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiArchiveLine,
  RiServerLine,
  RiSmartphoneLine,
  RiCodeLine,
  RiFlaskLine,
} from '@remixicon/react';

type TabType = 'overview' | 'quickstart' | 'sdk' | 'backend' | 'react' | 'nextjs';

export const Docs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Platform Overview', icon: <RiMagicLine size={18} /> },
    { id: 'quickstart', label: 'Quick Start', icon: <RiKeyLine size={18} /> },
    { id: 'sdk', label: 'SDK Package', icon: <RiCodeLine size={18} /> },
    { id: 'backend', label: 'Backend Integration', icon: <RiSettings3Line size={18} /> },
    { id: 'react', label: 'React Frontend', icon: <RiReactjsLine size={18} /> },
    { id: 'nextjs', label: 'Next.js Frontend', icon: <RiArrowUpLine size={18} /> },
  ];

  return (
    <div className="min-h-[calc(100vh-160px)] pb-24 px-4 sm:px-6 lg:px-8 relative font-sans">
      {/* Background is now handled globally in App.tsx */}

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-8 tracking-tight leading-tight">
            Vibe Message{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-primary-500 via-theme-accent-500 to-theme-primary-500 bg-[length:200%_auto] animate-gradient">
              Docs
            </span>
          </h1>
          <p className="text-lg md:text-xl text-theme-text-secondary max-w-2xl mx-auto leading-relaxed">
            The modern, lightweight, and incredibly powerful push notification platform for the web.
            Drop-in Firebase Cloud Messaging alternative.
          </p>
        </motion.div>

        {/* Tab Navigation - Pill Style */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 font-semibold rounded-full transition-all duration-300 shadow-sm ${
                activeTab === tab.id
                  ? 'bg-theme-primary-500 dark:bg-theme-primary-600 border border-theme-primary-500 text-white scale-105'
                  : 'bg-theme-bg-primary border border-theme-border text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-primary-500'
              }`}
            >
              <span className={`mr-2 ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-theme-border p-8 md:p-12 transition-all duration-500 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-4xl font-display font-extrabold mb-6 text-theme-text-primary">
                  Why Vibe Message?
                </h2>
                <p className="text-lg text-theme-text-secondary mb-8 leading-relaxed max-w-4xl">
                  Vibe Message is built for modern web applications that need reliable,
                  customizable, and fast push notifications without the heavy baggage of legacy
                  SDKs.
                </p>

                {/* Usage Guidelines Bento */}
                <div className="mb-16 grid lg:grid-cols-2 gap-6">
                  <div className="bg-theme-bg-secondary border border-theme-border rounded-3xl p-8 relative overflow-hidden group hover:border-theme-primary-500 transition-colors duration-300">
                    <div className="flex items-center space-x-3 mb-6 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-theme-primary-500/10 flex items-center justify-center text-theme-primary-600 dark:text-theme-primary-400">
                        <RiInformationLine size={24} />
                      </div>
                      <h3 className="text-xl font-display font-bold text-theme-text-primary m-0">
                        Intended Usage Guidelines
                      </h3>
                    </div>
                    <p className="text-theme-text-secondary leading-relaxed mb-6 relative z-10">
                      Our free hosted service is an ecosystem built primarily to support the
                      developer community. It is designed and optimized for:
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-4 relative z-10">
                      {[
                        'Students & Education',
                        'Personal Projects',
                        'Testing & Prototyping',
                        'Small-scale Applications',
                      ].map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-sm font-semibold text-theme-text-primary bg-black/5 dark:bg-white/5 rounded-lg p-3 border border-theme-border"
                        >
                          <RiCheckLine
                            size={18}
                            className="mr-3 text-theme-success flex-shrink-0"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#1a0f0f] dark:bg-[#2a0808] border border-red-900/30 rounded-3xl p-8 relative flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                        <RiErrorWarningLine size={14} className="mr-1.5" />
                        Strictly Restricted
                      </div>
                      <h4 className="text-2xl font-display font-bold text-white mb-4">
                        Commercial Production
                      </h4>
                      <p className="text-base text-red-100/80 leading-relaxed mb-6">
                        Large-scale and unmetered commercial usage is strictly restricted on the
                        public tier. Accounts generating excessive structural load outside fair-use
                        will be permanently banned to protect network stability.
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-red-900/30">
                      <p className="text-sm text-red-200 flex items-start">
                        <RiArchiveLine size={18} className="shrink-0 mr-2 opacity-50" />
                        <span>
                          <strong className="text-white">Coming Soon:</strong> Pre-configured Docker
                          images for self-hosted, unmetered commercial deployments on your own
                          infrastructure.
                        </span>
                      </p>
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

                {/* Ready to build CTA */}
                <div className="bg-theme-primary-500 dark:bg-theme-primary-600 rounded-3xl p-10 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl mt-16">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                  <div className="relative z-10 text-white">
                    <h3 className="text-3xl font-display font-extrabold mb-3 text-white">
                      Ready to build?
                    </h3>
                    <p className="text-white/80 text-lg max-w-lg">
                      Join the platform, grab your API keys, and start sending messages in under 5
                      minutes.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('quickstart')}
                    className="relative z-10 whitespace-nowrap px-8 py-4 bg-white text-theme-primary-600 rounded-xl font-bold transition-all shadow-lg hover:scale-105"
                  >
                    View Setup Guide →
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'quickstart' && (
              <motion.div
                key="quickstart"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-4xl font-display font-extrabold mb-6 text-theme-text-primary">
                    How It Works
                  </h2>
                  <p className="text-xl text-theme-text-secondary leading-relaxed">
                    To use Vibe Message, you need two pieces: a{' '}
                    <strong className="text-theme-primary-600 dark:text-theme-primary-400 font-semibold">
                      Frontend
                    </strong>{' '}
                    application (to receive messages) and a{' '}
                    <strong className="text-theme-primary-600 dark:text-theme-primary-400 font-semibold">
                      Backend
                    </strong>{' '}
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
                    <h3 className="text-2xl font-display font-bold text-theme-text-primary mb-4 text-center lg:text-left">
                      Create Application
                    </h3>
                    <p className="text-theme-text-secondary leading-relaxed mb-8 text-center lg:text-left">
                      Register an App in the dashboard to receive your API keys. Keep the secret key
                      completely hidden.
                    </p>
                    <div className="space-y-3 mt-auto">
                      <div className="bg-theme-bg-secondary border border-theme-border rounded-lg p-3 text-sm flex items-center justify-between shadow-sm">
                        <span className="text-theme-text-muted font-mono">appId</span>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                          Public
                        </span>
                      </div>
                      <div className="bg-theme-bg-secondary border border-theme-border rounded-lg p-3 text-sm flex items-center justify-between shadow-sm">
                        <span className="text-theme-text-muted font-mono">publicKey</span>
                        <span className="text-xs font-semibold px-2 py-1 bg-theme-primary-100 dark:bg-theme-primary-900/30 text-theme-primary-700 dark:text-theme-primary-400 rounded">
                          Frontend
                        </span>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-3 text-sm flex items-center justify-between shadow-sm">
                        <span className="text-red-500 dark:text-red-400 font-mono">secretKey</span>
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
                    <h3 className="text-2xl font-display font-bold text-theme-text-primary mb-4 text-center lg:text-left">
                      Integrate Frontend
                    </h3>
                    <p className="text-theme-text-secondary leading-relaxed mb-6 text-center lg:text-left">
                      Use{' '}
                      <code className="text-sm font-mono text-theme-primary-600 dark:text-theme-primary-400">
                        publicKey
                      </code>{' '}
                      to authenticate the client browser and register the device with the platform.
                    </p>
                    <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-xl p-5 mt-auto shadow-inner relative overflow-hidden group-hover:border-theme-primary-500/50 transition-colors">
                      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                        <RiCodeLine size={32} className="text-white" />
                      </div>
                      <pre className="text-sm font-mono text-gray-300 overflow-x-auto relative z-10">
                        <span className="text-theme-accent-400">await</span> vibe.registerDevice(
                        {'{'}
                        <br />
                        &nbsp;&nbsp;externalUserId:{' '}
                        <span className="text-theme-warning">'usr_123'</span>
                        <br />
                        {'}'});
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
                    <h3 className="text-2xl font-display font-bold text-theme-text-primary mb-4 text-center lg:text-left">
                      Trigger from Backend
                    </h3>
                    <p className="text-theme-text-secondary leading-relaxed mb-6 text-center lg:text-left">
                      Use <code className="text-sm font-mono text-red-500">secretKey</code> securely
                      on your server to push messages instantly to the registered devices.
                    </p>
                    <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-xl p-5 mt-auto shadow-inner relative overflow-hidden group-hover:border-red-500/30 transition-colors">
                      <pre className="text-sm font-mono text-gray-300 overflow-x-auto relative z-10">
                        <span className="text-theme-primary-400">await</span> vibe.notification(
                        {'{'}
                        <br />
                        &nbsp;&nbsp;users: [<span className="text-theme-warning">'usr_123'</span>],
                        <br />
                        &nbsp;&nbsp;title: <span className="text-theme-warning">'Hello!'</span>
                        <br />
                        {'}'});
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sdk' && (
              <motion.div
                key="sdk"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-5xl mx-auto space-y-12"
              >
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <h2 className="text-4xl font-display font-extrabold mb-4 text-theme-text-primary">
                    Vibe Message SDK Reference
                  </h2>
                  <p className="text-lg text-theme-text-secondary leading-relaxed">
                    The{' '}
                    <code className="font-mono text-theme-primary-500 bg-theme-bg-secondary px-1 py-0.5 rounded">
                      vibe-message
                    </code>{' '}
                    package provides lightweight client-side API integrations for browsers and fully
                    secure server-side SDKs for Node.js backends.
                  </p>
                </div>

                {/* Installation */}
                <div className="bg-theme-bg-secondary border border-theme-border rounded-3xl p-8 relative overflow-hidden group hover:border-theme-primary-500 transition-all duration-300 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-theme-primary-500/10 flex items-center justify-center text-theme-primary-600 dark:text-theme-primary-400">
                      <RiFlashlightLine size={20} />
                    </div>
                    <h3 className="text-xl font-display font-bold text-theme-text-primary m-0">
                      Installation
                    </h3>
                  </div>
                  <p className="text-theme-text-secondary text-sm mb-6">
                    Get started by installing the universal SDK package into your project:
                  </p>
                  <CodeBlock code="npm install vibe-message" language="bash" />
                </div>

                {/* Grid for Client and Server SDK */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column: Client SDK */}
                  <div className="space-y-6">
                    <div className="bg-[#0f172a]/20 border border-theme-border rounded-3xl p-8 space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-theme-accent-500/10 flex items-center justify-center text-theme-accent-600 dark:text-theme-accent-400">
                          <RiSmartphoneLine size={20} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-theme-text-primary m-0">
                          Client SDK (Frontend)
                        </h3>
                      </div>
                      <p className="text-theme-text-secondary text-sm leading-relaxed">
                        Responsible for requesting browser permissions, subscribing to push
                        notification service workers, handling foreground messages, and managing
                        silent data syncs.
                      </p>

                      <div className="space-y-4">
                        <div className="border-t border-theme-border pt-4">
                          <h4 className="text-sm font-bold text-theme-text-primary font-mono mb-2">
                            initNotificationClient(options)
                          </h4>
                          <p className="text-xs text-theme-text-secondary leading-relaxed mb-2">
                            Initializes a browser-facing notification client instance.
                          </p>
                          <ul className="text-xs space-y-1 text-theme-text-muted">
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                appId: string
                              </strong>{' '}
                              — Public ID of your application.
                            </li>
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                publicKey: string
                              </strong>{' '}
                              — VAPID public key.
                            </li>
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                baseUrl?: string
                              </strong>{' '}
                              — Override for custom hosting.
                            </li>
                          </ul>
                        </div>

                        <div className="border-t border-theme-border pt-4">
                          <h4 className="text-sm font-bold text-theme-text-primary font-mono mb-2">
                            client.registerDevice(options)
                          </h4>
                          <p className="text-xs text-theme-text-secondary leading-relaxed mb-2">
                            Requests push notification access permissions and registers service
                            worker subscriptions with the server.
                          </p>
                          <ul className="text-xs space-y-1 text-theme-text-muted">
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                externalUserId: string
                              </strong>{' '}
                              — Unique developer ID mapping the user.
                            </li>
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                serviceWorkerPath?: string
                              </strong>{' '}
                              — Defaults to <code className="font-mono">/push-sw.js</code>.
                            </li>
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                serviceWorkerScope?: string
                              </strong>{' '}
                              — Scope (defaults to <code className="font-mono">/</code>).
                            </li>
                          </ul>
                        </div>

                        <div className="border-t border-theme-border pt-4">
                          <h4 className="text-sm font-bold text-theme-text-primary font-mono mb-2">
                            client.onMessage(callback)
                          </h4>
                          <p className="text-xs text-theme-text-secondary leading-relaxed">
                            Foreground callback when the web app is visible and focused. Receives
                            standard notification payload details.
                          </p>
                        </div>

                        <div className="border-t border-theme-border pt-4">
                          <h4 className="text-sm font-bold text-theme-text-primary font-mono mb-2">
                            client.onSilentMessage(callback)
                          </h4>
                          <p className="text-xs text-theme-text-secondary leading-relaxed">
                            Bypasses UI system notifications to deliver direct data payloads to
                            background callbacks. Perfect for syncing databases/stores.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Server SDK */}
                  <div className="space-y-6">
                    <div className="bg-[#0f172a]/20 border border-theme-border rounded-3xl p-8 space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-theme-primary-500/10 flex items-center justify-center text-theme-primary-600 dark:text-theme-primary-400">
                          <RiServerLine size={20} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-theme-text-primary m-0">
                          Server SDK (Backend)
                        </h3>
                      </div>
                      <p className="text-theme-text-secondary text-sm leading-relaxed">
                        Empowers your backend server to securely encrypt and publish system-wide or
                        user-specific push notifications using your private credentials.
                      </p>

                      <div className="space-y-4">
                        <div className="border-t border-theme-border pt-4">
                          <h4 className="text-sm font-bold text-theme-text-primary font-mono mb-2">
                            initServerClient(options)
                          </h4>
                          <p className="text-xs text-theme-text-secondary leading-relaxed mb-2">
                            Initializes a private server-side instance. Must only be run in node
                            backend scripts.
                          </p>
                          <ul className="text-xs space-y-1 text-theme-text-muted">
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                appId: string
                              </strong>{' '}
                              — Application public ID.
                            </li>
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                secretKey: string
                              </strong>{' '}
                              — Private administrative secret.
                            </li>
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                baseUrl?: string
                              </strong>{' '}
                              — Custom hosted endpoint routing.
                            </li>
                          </ul>
                        </div>

                        <div className="border-t border-theme-border pt-4">
                          <h4 className="text-sm font-bold text-theme-text-primary font-mono mb-2">
                            server.notification(options)
                          </h4>
                          <p className="text-xs text-theme-text-secondary leading-relaxed mb-2">
                            Sends a standard visible push notification to targets or global
                            broadcasts.
                          </p>
                          <ul className="text-xs space-y-1 text-theme-text-muted">
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                notificationData: NotificationData
                              </strong>{' '}
                              — Title, body, icon, custom click_action, and data (supports JSON
                              objects or stringified JSON).
                            </li>
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                externalUsers?: string[]
                              </strong>{' '}
                              — Target user list. Omit to broadcast.
                            </li>
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                scheduledAt?: string | Date
                              </strong>{' '}
                              — UTC timezone timestamp (ISO-8601).
                            </li>
                          </ul>
                        </div>

                        <div className="border-t border-theme-border pt-4">
                          <h4 className="text-sm font-bold text-theme-text-primary font-mono mb-2">
                            server.silentNotification(options)
                          </h4>
                          <p className="text-xs text-theme-text-secondary leading-relaxed mb-2">
                            Sends an invisible data payload directly to user background instances.
                          </p>
                          <ul className="text-xs space-y-1 text-theme-text-muted">
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                data: Record&lt;string, any&gt;
                              </strong>{' '}
                              — Custom structural data dictionary.
                            </li>
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                externalUsers?: string[]
                              </strong>{' '}
                              — Target client list.
                            </li>
                            <li>
                              <strong className="text-theme-text-secondary font-mono">
                                scheduledAt?: string | Date
                              </strong>{' '}
                              — UTC timestamp scheduling.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example Quick Code block */}
                <div className="bg-theme-bg-secondary border border-theme-border rounded-3xl p-8 relative overflow-hidden group hover:border-theme-primary-500 transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-theme-primary-500/10 flex items-center justify-center text-theme-primary-600 dark:text-theme-primary-400">
                      <RiCodeLine size={20} />
                    </div>
                    <h3 className="text-xl font-display font-bold text-theme-text-primary m-0">
                      Full SDK implementation Flow
                    </h3>
                  </div>
                  <p className="text-theme-text-secondary text-sm mb-6">
                    A typical setup importing client listeners and secure server dispatch modules:
                  </p>
                  <CodeBlock
                    code={`// 1. Frontend Implementation
import { initNotificationClient } from 'vibe-message';

const client = initNotificationClient({
  appId: 'your-app-id',
  publicKey: 'your-public-key'
});

// Start listening for notifications
client.onMessage((payload) => {
  console.log('Got visible notification:', payload.title);
});

client.onSilentMessage((data) => {
  console.log('Got sync background request:', data);
});

// Call upon user login
await client.registerDevice({ externalUserId: 'user_123' });


// 2. Node.js Secure Backend Trigger
import { initServerClient } from 'vibe-message';

const server = initServerClient({
  appId: 'your-app-id',
  secretKey: 'your-secret-key'
});

// Trigger a scheduled visible alert
await server.notification({
  notificationData: {
    title: 'Match Alert!',
    body: 'Your match is starting now.',
    data: { matchId: 'm_99' } // Optional custom data (supports object or stringified JSON)
  },
  externalUsers: ['user_123'],
  scheduledAt: new Date(Date.now() + 60000) // schedule 1 minute into the future
});`}
                    language="typescript"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'backend' && (
              <motion.div
                key="backend"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-10 text-center sm:text-left">
                  <h2 className="text-3xl font-display font-extrabold mb-4 text-theme-text-primary">
                    Backend Integration (Sending)
                  </h2>
                  <p className="text-lg text-theme-text-secondary mb-10 leading-relaxed p-4 bg-theme-warning/10 border-l-4 border-theme-warning rounded-r-lg inline-block text-left">
                    Your backend server is responsible for triggering notifications. You should{' '}
                    <strong className="text-theme-error">never</strong> expose your{' '}
                    <code className="font-mono text-sm bg-theme-bg-secondary px-1 py-0.5 rounded">
                      secretKey
                    </code>{' '}
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
    data: JSON.stringify({ postId: 123 }), // Optional custom data (supports object or stringified JSON)
  },
  externalUsers: ['user-123'], // ID of the user you want to notify
  scheduledAt: '2026-05-25T14:30:00Z' // Optional: ISO-8601 UTC timestamp string or Date object
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
  externalUsers: ['user-123'],
  scheduledAt: '2026-05-25T14:30:00Z' // Optional: ISO-8601 UTC timestamp string or Date object
});`}
                    language="typescript"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'react' && (
              <motion.div
                key="react"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-10 text-center sm:text-left">
                  <h2 className="text-3xl font-display font-extrabold mb-4 text-theme-text-primary">
                    React Integration Guide
                  </h2>
                  <p className="text-lg text-theme-text-secondary leading-relaxed">
                    The best way to integrate Vibe Message in SPAs (Create React App, Vite, etc.) is
                    by using a global Context to manage your notification client. This allows you to
                    easily tie notifications to your user's authentication state.
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

            {activeTab === 'nextjs' && (
              <motion.div
                key="nextjs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-10 text-center sm:text-left">
                  <h2 className="text-3xl font-display font-extrabold mb-4 text-theme-text-primary">
                    Next.js App Router Integration
                  </h2>
                  <p className="text-lg text-theme-text-secondary leading-relaxed">
                    Designed for Next.js 13+ App Router. Because the Vibe Message SDK relies on
                    browser APIs (like Service Workers and Notification), we use Client Components (
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
    className="p-8 rounded-3xl border border-theme-border bg-theme-bg-secondary hover:border-theme-primary-500 transition-colors duration-300 group cursor-default shadow-sm hover:shadow-md"
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
  >
    <div className="w-14 h-14 rounded-2xl bg-theme-primary-500/10 text-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-theme-primary-600 dark:text-theme-primary-400">
      {icon}
    </div>
    <h3 className="text-xl font-display font-bold text-theme-text-primary mb-3">{title}</h3>
    <p className="text-theme-text-secondary leading-relaxed text-sm">{description}</p>
  </motion.div>
);

const highlightCode = (code: string): string => {
  const tokens: string[] = [];
  const placeholder = (idx: number) => `\x00T${idx}\x00`;

  // 1. Escape HTML entities first
  let result = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 2. Tokenise single-line comments  (must come before strings so // inside a string isn't matched)
  result = result.replace(/(\/\/.*)$/gm, (match) => {
    const idx = tokens.length;
    tokens.push(`<span class="text-[#5c6370]">${match}</span>`);
    return placeholder(idx);
  });

  // 3. Tokenise string literals (single or double quoted, handles escaped quotes)
  result = result.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g, (match) => {
    const idx = tokens.length;
    tokens.push(`<span class="text-[#98c379]">${match}</span>`);
    return placeholder(idx);
  });

  // 4. Now it's safe to apply keyword / identifier colouring — no span attrs to pollute
  result = result
    .replace(
      /\b(import|from|const|let|var|await|async|export|default|function|return|if|else|true|false|new|typeof|window|null)\b/g,
      '<span class="text-[#c678dd]">$1</span>'
    )
    .replace(
      /\b(npm|npx|install|init|React|useEffect|useContext|useRef|createContext|console|NotificationContext|NotificationProvider|vibe|Notification|initServerClient|initNotificationClient)\b/g,
      '<span class="text-[#e5c07b]">$1</span>'
    )
    .replace(/([a-zA-Z0-9_]+)(?=\()/g, (match, p1) => {
      if (['function', 'if', 'span', 'class'].includes(p1)) return match;
      return `<span class="text-[#61afef]">${p1}</span>`;
    });

  // 5. Restore all tokenised strings & comments
  // eslint-disable-next-line no-control-regex
  result = result.replace(/\x00T(\d+)\x00/g, (_, idx) => tokens[parseInt(idx, 10)]);

  return result;
};

const CodeBlock = ({ code, language }: { code: string; language: string }) => (
  <motion.div
    className="rounded-2xl overflow-hidden border border-theme-border bg-[#0F172A] shadow-xl mt-6"
    initial={{ opacity: 0, scale: 0.98 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.4 }}
  >
    <div className="flex items-center justify-between px-4 py-3 border-b border-black/20 bg-[#1E293B]">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
      </div>
      <div className="text-xs font-mono text-slate-400 uppercase tracking-widest bg-black/20 rounded px-3 py-1">
        {language}
      </div>
    </div>
    <div className="p-6 overflow-x-auto custom-scrollbar">
      <pre className="text-slate-300 text-sm leading-relaxed font-mono whitespace-pre-wrap break-normal">
        <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
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
  <div className="relative pl-0 md:pl-16 p-8 border border-theme-border rounded-3xl bg-black/5 dark:bg-white/5 mb-8">
    <div className="hidden md:flex absolute top-8 left-0 -translate-x-1/2 w-12 h-12 rounded-full bg-theme-bg-primary border border-theme-border text-theme-primary-500 items-center justify-center font-display font-bold text-xl shadow-sm">
      {step}
    </div>
    <div className="md:hidden flex items-center gap-4 mb-5">
      <div className="w-12 h-12 shrink-0 rounded-full bg-theme-bg-primary border border-theme-border text-theme-primary-500 flex items-center justify-center font-display font-bold text-xl shadow-sm">
        {step}
      </div>
      <h3 className="text-2xl font-display font-bold text-theme-text-primary m-0">{title}</h3>
    </div>
    <div className="hidden md:block">
      <h3 className="text-2xl font-display font-bold text-theme-text-primary mb-3">{title}</h3>
    </div>
    <p className="text-theme-text-secondary leading-relaxed">{description}</p>
    <CodeBlock code={code} language={language} />
  </div>
);
