import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { systemService } from '../../services/systemService';
import {
  RiMagicLine,
  RiKeyLine,
  RiSettings3Line,
  RiReactjsLine,
  RiArrowUpLine,
  RiFlashlightLine,
  RiShieldKeyholeLine,
  RiShieldCheckLine,
  RiRefreshLine,
  RiTeamLine,
  RiPaletteLine,
  RiBarChartBoxLine,
  RiInformationLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiServerLine,
  RiSmartphoneLine,
  RiCodeLine,
  RiFlaskLine,
  RiFileCopyLine,
} from '@remixicon/react';

type TabType = 'overview' | 'quickstart' | 'sdk' | 'backend' | 'react' | 'nextjs' | 'selfhost';

export const Docs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const shouldReduceMotion = useReducedMotion();
  const easeOut = [0.23, 1, 0.32, 1] as const;

  useEffect(() => {
    systemService
      .getPublicSettings()
      .then((s) => {
        if (s.is_self_hosted) {
          window.location.replace('https://vibemessage.sailorlabs.in/docs');
        }
      })
      .catch(console.error);
  }, []);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Platform Overview', icon: <RiMagicLine size={18} /> },
    { id: 'quickstart', label: 'Quick Start', icon: <RiKeyLine size={18} /> },
    { id: 'sdk', label: 'SDK Package', icon: <RiCodeLine size={18} /> },
    { id: 'backend', label: 'Backend Integration', icon: <RiSettings3Line size={18} /> },
    { id: 'react', label: 'React Frontend', icon: <RiReactjsLine size={18} /> },
    { id: 'nextjs', label: 'Next.js Frontend', icon: <RiArrowUpLine size={18} /> },
    { id: 'selfhost', label: 'Self-Hosting', icon: <RiServerLine size={18} /> },
  ];

  return (
    <div className="min-h-[calc(100vh-160px)] pb-24 px-4 sm:px-6 lg:px-8 relative font-sans">
      {/* Background is now handled globally in App.tsx */}

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-theme-bg-secondary border border-theme-border text-xs font-mono font-semibold text-theme-text-muted mb-6 shadow-2xs">
            <span>DEVELOPER DOCUMENTATION</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold mb-5 tracking-tight text-theme-text-primary">
            Vibe Message <span className="text-theme-primary-500">Docs</span>
          </h1>
          <p className="text-base sm:text-lg text-theme-text-secondary max-w-2xl mx-auto leading-relaxed">
            Open-standard Web Push infrastructure for the developer community. Free hosted tier
            for learning, prototypes, and hobby apps, with complete Docker self-hosting for production scale.
          </p>
        </motion.div>

        {/* Tab Navigation - Pill Style */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 mb-10 p-1.5 rounded-2xl bg-theme-bg-secondary border border-theme-border max-w-full sm:max-w-fit mx-auto shadow-2xs justify-start sm:justify-center px-2 sm:px-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center shrink-0 whitespace-nowrap px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-theme-text-secondary hover:text-theme-text-primary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="docs-active-tab"
                    className="absolute inset-0 bg-theme-primary-500 rounded-xl shadow-xs"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 420, damping: 32 }
                    }
                  />
                )}
                <span className="relative z-10 mr-2 flex items-center">
                  {tab.icon}
                </span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-theme-bg-secondary rounded-2xl sm:rounded-3xl border border-theme-border p-6 sm:p-10 lg:p-12 shadow-sm transition-all duration-300 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                transition={{ duration: 0.22, ease: easeOut }}
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
                      developer community at zero cost. It is designed and optimized for:
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
                    <div className="mt-6 pt-4 border-t border-theme-border text-xs text-theme-text-muted flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Single Community Node · Fair-Use Policy</span>
                      </span>
                      <span className="text-theme-primary-500 font-semibold">100% Free Forever</span>
                    </div>
                  </div>

                  <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-3xl p-8 relative flex flex-col justify-between shadow-xs transition-colors duration-300">
                    <div>
                      <div className="inline-flex items-center px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                        <RiErrorWarningLine size={14} className="mr-1.5" />
                        Commercial &amp; High-Volume
                      </div>
                      <h4 className="text-2xl font-display font-bold text-theme-text-primary mb-4">
                        Production Workloads
                      </h4>
                      <p className="text-base text-theme-text-secondary leading-relaxed mb-6">
                        Large-scale and unmetered commercial usage is restricted on the free public tier
                        to ensure stability for all community users. For production reliability and
                        unlimited throughput, self-hosting is the recommended path.
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-rose-200/60 dark:border-rose-900/30 bg-white/80 dark:bg-black/25 backdrop-blur-sm p-4 rounded-2xl border border-rose-200/60 dark:border-rose-800/30 space-y-3">
                      <p className="text-sm text-theme-text-secondary flex items-start leading-relaxed">
                        <RiServerLine
                          size={18}
                          className="shrink-0 mr-2.5 text-theme-primary-600 dark:text-theme-primary-400 mt-0.5"
                        />
                        <span>
                          <strong className="text-theme-text-primary font-bold">
                            Self-Host Unmetered:
                          </strong>{' '}
                          Deploy via pre-configured Docker Compose. Request an{' '}
                          <strong className="text-theme-primary-600 dark:text-theme-primary-400 font-semibold">
                            Enterprise License Key
                          </strong>{' '}
                          in your profile settings to run on your own servers with zero limits.
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('selfhost')}
                        className="text-xs font-mono font-bold text-theme-primary-500 hover:text-theme-primary-600 flex items-center gap-1.5 transition-colors"
                      >
                        <span>View Docker Self-Hosting Guide →</span>
                      </button>
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
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                transition={{ duration: 0.22, ease: easeOut }}
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
                    <div
                      className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-xl p-5 mt-auto shadow-inner relative overflow-hidden group-hover:border-theme-primary-500/50 transition-colors"
                      style={{ colorScheme: 'dark' }}
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                        <RiCodeLine size={32} className="text-white" />
                      </div>
                      <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap break-words [overflow-wrap:anywhere] overflow-x-hidden relative z-10 m-0">
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
                    <div
                      className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-xl p-5 mt-auto shadow-inner relative overflow-hidden group-hover:border-red-500/30 transition-colors"
                      style={{ colorScheme: 'dark' }}
                    >
                      <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap break-words [overflow-wrap:anywhere] overflow-x-hidden relative z-10 m-0">
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
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                transition={{ duration: 0.22, ease: easeOut }}
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
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                transition={{ duration: 0.22, ease: easeOut }}
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
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                transition={{ duration: 0.22, ease: easeOut }}
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
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                transition={{ duration: 0.22, ease: easeOut }}
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

            {activeTab === 'selfhost' && (
              <motion.div
                key="selfhost"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                transition={{ duration: 0.22, ease: easeOut }}
                className="max-w-4xl mx-auto space-y-10"
              >
                <div className="mb-10 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-theme-bg-primary border border-theme-border text-xs font-mono font-semibold text-theme-text-muted mb-4 shadow-2xs">
                    <span>UNMETERED PRODUCTION INFRASTRUCTURE</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-display font-extrabold mb-4 text-theme-text-primary">
                    Self-Hosting Guide (Docker)
                  </h2>
                  <p className="text-lg text-theme-text-secondary leading-relaxed">
                    Deploy Vibe Message on infrastructure you control. Self-hosting removes all public rate
                    limits, provides unmetered throughput, and keeps your subscriber database 100% private.
                  </p>
                </div>

                {/* Prerequisites Callout */}
                <div className="p-6 rounded-2xl bg-theme-bg-primary border border-theme-border shadow-xs">
                  <h3 className="text-base font-display font-bold text-theme-text-primary mb-3 flex items-center gap-2">
                    <RiShieldCheckLine size={20} className="text-theme-primary-500" />
                    <span>Prerequisites</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-theme-text-secondary">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-primary-500" />
                      <span><strong>Docker &amp; Docker Compose</strong> installed on your server (Linux, macOS, or Windows).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-primary-500" />
                      <span><strong>Enterprise License Key</strong> (e.g. <code className="font-mono text-xs bg-theme-bg-secondary px-1 py-0.5 rounded">vibe_ent_...</code>) requested from your profile settings on the cloud platform.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-primary-500" />
                      <span><strong>VAPID Keys</strong> (generate via dashboard or <code className="font-mono text-xs bg-theme-bg-secondary px-1 py-0.5 rounded">npx web-push generate-vapid-keys</code>).</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-12">
                  <StepBlock
                    step="1"
                    title="Configure Environment (.env)"
                    description="Create a .env file in the same directory as docker-compose.yml and set your server credentials and license key."
                    code={`# Vibe Message Server Port
PORT=5000

# Enterprise Verification (Required)
ENTERPRISE_KEY=your_vibe_ent_license_key_here
VIBE_MAIN_SERVER_URL=https://vibe-message.sailorlabs.in/api

# Security
JWT_SECRET=use-a-strong-random-jwt-secret-string

# VAPID Configuration
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@yourdomain.com

# Initial Super Admin (Created on first boot)
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=SelectAStrongAdminPassword123!
SUPER_ADMIN_NAME=Super Admin`}
                    language="bash"
                  />

                  <StepBlock
                    step="2"
                    title="Launch the Stack"
                    description="Run Docker Compose to download, build, and start the Vibe Message container alongside Postgres and Redis."
                    code={`docker compose up -d`}
                    language="bash"
                  />

                  <StepBlock
                    step="3"
                    title="Using External Postgres & Redis (Optional)"
                    description="If you already have managed Postgres and Redis instances on your cloud provider (e.g. AWS RDS, DigitalOcean, Supabase), set the external connection strings in .env and start only the backend service:"
                    code={`# In .env:
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_HOST=your_redis_host
REDIS_PORT=6379

# Launch only the server container:
docker compose up -d vibe-message-server`}
                    language="bash"
                  />

                  <StepBlock
                    step="4"
                    title="Connect SDK to Your Self-Hosted Server"
                    description="In your frontend and backend code, simply set baseUrl to your self-hosted server URL instead of the default community cloud:"
                    code={`// 1. Frontend Client SDK
import { initNotificationClient } from 'vibe-message';

const client = initNotificationClient({
  appId: 'your-app-id',
  publicKey: 'your-public-key',
  baseUrl: 'https://push.yourdomain.com/api' // Point to your self-hosted server
});

// 2. Node.js Backend Server SDK
import { initServerClient } from 'vibe-message';

const server = initServerClient({
  appId: 'your-app-id',
  secretKey: 'your-secret-key',
  baseUrl: 'https://push.yourdomain.com/api' // Point to your self-hosted server
});`}
                    language="typescript"
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
  <div
    className="p-7 rounded-2xl border border-theme-border bg-theme-bg-secondary hover:border-theme-primary-500/40 transition-all duration-300 group cursor-default shadow-xs hover:shadow-sm"
  >
    <div className="w-12 h-12 rounded-xl bg-theme-primary-500/10 border border-theme-primary-500/20 text-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform text-theme-primary-600 dark:text-theme-primary-400">
      {icon}
    </div>
    <h3 className="text-lg font-display font-bold text-theme-text-primary mb-2.5 tracking-tight">{title}</h3>
    <p className="text-theme-text-secondary leading-relaxed text-sm">{description}</p>
  </div>
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
      /\b(npm|npx|install|init|React|useEffect|useContext|useRef|createContext|console|NotificationContext|NotificationProvider|vibe|Notification|initServerClient|initNotificationClient|docker|compose|up)\b/g,
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

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/10 bg-[#0B0D13] shadow-lg mt-5"
      style={{ colorScheme: 'dark' }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#111420]">
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest bg-white/[0.04] border border-white/[0.06] rounded px-2.5 py-0.5">
            {language}
          </div>
          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] rounded px-2.5 py-0.5 transition-colors"
            title="Copy snippet"
          >
            {copied ? (
              <>
                <RiCheckLine size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <RiFileCopyLine size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="p-5 overflow-x-hidden custom-scrollbar" style={{ colorScheme: 'dark' }}>
        <pre className="text-slate-300 text-xs sm:text-sm leading-relaxed font-mono whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] m-0 p-0 w-full min-w-0">
          <code
            dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
            className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] block w-full"
          />
        </pre>
      </div>
    </div>
  );
};

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
  <div className="relative pl-0 md:pl-16 p-7 sm:p-8 border border-theme-border rounded-2xl sm:rounded-3xl bg-theme-bg-primary mb-8 shadow-xs">
    <div className="hidden md:flex absolute top-8 left-0 -translate-x-1/2 w-10 h-10 rounded-xl bg-theme-bg-secondary border border-theme-border text-theme-primary-500 items-center justify-center font-display font-bold text-sm shadow-xs">
      {step}
    </div>
    <div className="md:hidden flex items-center gap-3 mb-4">
      <div className="w-9 h-9 shrink-0 rounded-xl bg-theme-bg-secondary border border-theme-border text-theme-primary-500 flex items-center justify-center font-display font-bold text-sm shadow-xs">
        {step}
      </div>
      <h3 className="text-xl font-display font-bold text-theme-text-primary m-0 tracking-tight">{title}</h3>
    </div>
    <div className="hidden md:block">
      <h3 className="text-xl sm:text-2xl font-display font-bold text-theme-text-primary mb-2.5 tracking-tight">{title}</h3>
    </div>
    <p className="text-theme-text-secondary leading-relaxed text-sm sm:text-base">{description}</p>
    <CodeBlock code={code} language={language} />
  </div>
);
