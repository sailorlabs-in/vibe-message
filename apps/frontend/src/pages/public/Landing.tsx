import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion, useScroll, useSpring } from 'motion/react';
import {
  RiArrowRightLine,
  RiTerminalBoxLine,
  RiSpeedUpLine,
  RiShieldCheckLine,
  RiPulseLine,
  RiServerLine,
  RiTimeLine,
  RiSendPlane2Line,
  RiNotification3Line,
  RiArrowDownSLine,
  RiCheckLine,
  RiCpuLine,
  RiHeartLine,
} from '@remixicon/react';
import { useSystem } from '../../context/SystemContext';
import { CopyButton } from '../../components/common/CopyButton';

// Sample notification scenarios for the interactive hero simulator
interface Scenario {
  id: string;
  badge: string;
  title: string;
  body: string;
  icon: string;
  actionText: string;
  latencyMs: number;
  type: 'transactional' | 'security' | 'marketing' | 'silent';
}

const SCENARIOS: Scenario[] = [
  {
    id: 'order',
    badge: 'Transactional',
    title: 'Order Confirmed · #8492',
    body: 'Your package is in transit via Express Air. Estimated delivery in 2 hours.',
    icon: '📦',
    actionText: 'Track Delivery',
    latencyMs: 19,
    type: 'transactional',
  },
  {
    id: 'auth',
    badge: 'Security Shield',
    title: 'Two-Factor Authentication',
    body: 'Login attempt from Tokyo, Japan (macOS · Chrome). Confirm identity to authorize.',
    icon: '🔐',
    actionText: 'Authorize Session',
    latencyMs: 14,
    type: 'security',
  },
  {
    id: 'promo',
    badge: 'Real-time Event',
    title: 'Flash Release is Live',
    body: 'Developer pro kits just unlocked with priority routing. 40 items remaining.',
    icon: '⚡',
    actionText: 'Claim Access',
    latencyMs: 24,
    type: 'marketing',
  },
  {
    id: 'silent',
    badge: 'Silent Sync',
    title: 'Background Cache Warmed',
    body: 'Service worker updated 14 offline assets silently without triggering audio prompts.',
    icon: '🔄',
    actionText: 'View State',
    latencyMs: 11,
    type: 'silent',
  },
];

const EMOJI_PRESETS = ['🔔', '🚀', '🔒', '📦', '⚡', '🎉', '💬'] as const;

interface CommunityPillar {
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
}

const COMMUNITY_PILLARS: CommunityPillar[] = [
  {
    title: 'Students & Education',
    subtitle: 'Free for universities, coursework & hackathons',
    icon: '🎓',
    badge: '100% Free',
  },
  {
    title: 'Personal Projects',
    subtitle: 'Zero cost for side apps, blogs & hobby portfolios',
    icon: '🛠️',
    badge: 'Zero Billing',
  },
  {
    title: 'Testing & Prototyping',
    subtitle: 'Fast MVP feedback & device handshake experiments',
    icon: '🧪',
    badge: 'Instant MVP',
  },
  {
    title: 'Small-scale Applications',
    subtitle: 'Reliable push for utility tools & indie products',
    icon: '⚡',
    badge: 'Community Tier',
  },
];

export const Landing: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isSelfHosted } = useSystem();
  const shouldReduceMotion = useReducedMotion();

  // Scroll Progress Telemetry
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 75,
    damping: 24,
    restDelta: 0.001,
  });

  // Hero Simulator State
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionSuccess, setTransmissionSuccess] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'client' | 'server'>('server');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Playground State
  const [customTitle, setCustomTitle] = useState('Payment Received');
  const [customBody, setCustomBody] = useState('You received $1,250.00 from Acme Corp.');
  const [customAction, setCustomAction] = useState('View Invoice');
  const [customIcon, setCustomIcon] = useState('🍦');

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (!rawVal) {
      setCustomIcon('');
      return;
    }

    // Strictly enforce maximum 1 emoji / grapheme cluster using Intl.Segmenter
    let singleGrapheme: string;
    const IntlAny = Intl as any;
    if (typeof IntlAny !== 'undefined' && IntlAny.Segmenter) {
      const segmenter = new IntlAny.Segmenter(undefined, { granularity: 'grapheme' });
      const segments: string[] = Array.from(segmenter.segment(rawVal))
        .map((s: any) => (s?.segment ? String(s.segment).trim() : ''))
        .filter(Boolean);
      if (segments.length === 0) {
        setCustomIcon('');
        return;
      }
      singleGrapheme = segments.length > 1 ? segments[segments.length - 1] : segments[0];
    } else {
      const chars = Array.from(rawVal)
        .map((c) => c.trim())
        .filter(Boolean);
      singleGrapheme = chars.length > 1 ? chars[chars.length - 1] : chars[0] || '';
    }

    setCustomIcon(singleGrapheme);
  };

  // Community pillar rotation
  const [activePillarIdx, setActivePillarIdx] = useState(0);

  useEffect(() => {
    if (isSelfHosted) {
      navigate('/login', { replace: true });
    }
  }, [isSelfHosted, navigate]);

  useEffect(() => {
    const pillarTimer = setInterval(() => {
      setActivePillarIdx((prev) => (prev + 1) % COMMUNITY_PILLARS.length);
    }, 3200);
    return () => clearInterval(pillarTimer);
  }, []);

  // Dynamic SEO metadata
  useEffect(() => {
    document.title = 'Vibe Message — Open-Standard Web Push Infrastructure & SDK';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Lightweight, open-standard Web Push notification infrastructure and JavaScript SDK. Free community tier for students, personal projects, and prototypes with complete Docker self-hosting for production.'
      );
    }
  }, []);

  const handleTransmit = () => {
    setIsTransmitting(true);
    setTransmissionSuccess(false);

    setTimeout(() => {
      setIsTransmitting(false);
      setTransmissionSuccess(true);
    }, 850);
  };

  // Motion easing tokens (Emil Kowalski / Apple inspired spring feel)
  const easeOut = [0.16, 1, 0.3, 1] as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.14,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: easeOut },
    },
  };

  const sectionHeaderVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: easeOut },
    },
  };

  const staggerGridVariants = (stagger = 0.12) => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : stagger,
      },
    },
  });

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeOut },
    },
  };

  return (
    <div
      ref={scrollRef}
      className="text-theme-text-primary font-sans mt-[-100px] selection:bg-theme-primary-500/20 selection:text-theme-primary-500 relative w-full"
    >
      {/* Precision Scroll Progress Telemetry Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-theme-primary-500 via-theme-accent-400 to-theme-primary-500 origin-left z-[60] pointer-events-none shadow-glow-sm"
      />

      <div className="relative z-10 w-full">
        {/* =========================================================================
            1. HERO SECTION: "THE TELEMETRY COMMAND"
            ========================================================================= */}
        <section
          aria-labelledby="hero-heading"
          className="relative pt-24 pb-20 lg:pt-28 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Column: Vision & Command */}
            <motion.div
              className="lg:col-span-7 space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Telemetry Status Pill */}
              <motion.div variants={itemVariants}>
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-theme-bg-secondary/10 border border-theme-border shadow-2xs hover:border-theme-primary-500/30 transition-colors">
                  <span className="text-xs font-mono font-medium text-theme-text-primary tracking-wide">
                    RFC 8030 VAPID Standard · Free Developer Community Ecosystem
                  </span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                id="hero-heading"
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.1] text-theme-text-primary"
              >
                The Web Push Engine.
                <span className="block text-theme-primary-500">
                  Engineered for Absolute Precision.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-theme-text-secondary leading-relaxed max-w-2xl font-normal"
              >
                Lightweight, open-standard push notification infrastructure built for the developer
                community. 100% free for students, personal projects, and prototypes—with complete
                Docker support to self-host unmetered in production.
              </motion.p>

              {/* CTAs and CLI Quickstart */}
              <motion.div variants={itemVariants} className="space-y-4 pt-1">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Link
                    to="/signup"
                    className="btn-primary !px-7 !py-3.5 !rounded-xl text-sm font-semibold shadow-sm hover:shadow-glow-sm transition-all"
                  >
                    <span>Start Building Free</span>
                    <RiArrowRightLine size={18} />
                  </Link>

                  <Link to="/docs" className="btn-secondary !px-7 !py-3.5 !rounded-xl text-sm font-semibold">
                    <RiTerminalBoxLine size={18} className="text-theme-text-muted" />
                    <span>Explore Specification</span>
                  </Link>
                </div>

                {/* Instant CLI Copy Pill */}
                <div className="flex items-center gap-3 pt-2 text-xs font-mono text-theme-text-muted">
                  <span className="hidden sm:inline">Quick Install:</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-theme-bg-muted/80 border border-theme-border text-theme-text-primary">
                    <span className="text-theme-primary-500 font-bold">$</span>
                    <span>npm i vibe-message</span>
                    <CopyButton text="npm i vibe-message" iconOnly />
                  </div>
                  <span className="hidden md:inline">· Zero proprietary lock-in</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Interactive Live Dispatch Simulator */}
            <motion.div
              className="lg:col-span-5 relative"
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.25, ease: easeOut }}
            >
              <div className="relative rounded-3xl bg-[#0b0c11] border border-white/10 shadow-2xl overflow-hidden text-slate-200">
                {/* Simulator Console Header */}
                <div className="px-5 py-3.5 bg-[#12141c] border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-xs text-slate-400 font-semibold tracking-wide">
                      DISPATCH CONSOLE
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>GATEWAY READY</span>
                  </div>
                </div>

                {/* Scenario Selector Chips */}
                <div className="p-5 pb-3">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                    Select Test Payload Scenario:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SCENARIOS.map((sc) => (
                      <button
                        key={sc.id}
                        onClick={() => {
                          setSelectedScenario(sc);
                          setTransmissionSuccess(false);
                        }}
                        className={`relative text-left p-2.5 rounded-xl border text-xs font-mono transition-colors ${
                          selectedScenario.id === sc.id
                            ? 'text-white border-theme-primary-500/60 shadow-glow-sm'
                            : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                        }`}
                      >
                        {selectedScenario.id === sc.id && (
                          <motion.div
                            layoutId="active-scenario-pill"
                            className="absolute inset-0 bg-theme-primary-500/20 border border-theme-primary-500/60 rounded-xl"
                            transition={
                              shouldReduceMotion
                                ? { duration: 0 }
                                : { type: 'spring', stiffness: 280, damping: 28 }
                            }
                          />
                        )}
                        <div className="relative z-10 flex items-center gap-1.5 font-semibold">
                          <span>{sc.icon}</span>
                          <span className="truncate">{sc.badge}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Device Notification Preview Card */}
                <div className="px-5 py-3">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedScenario.id}
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: easeOut }}
                      className="relative rounded-2xl bg-[#161824] border border-white/10 p-4 shadow-lg overflow-hidden"
                    >
                      {/* Simulated Carrier Status Bar */}
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2.5 mb-2.5 border-b border-white/5">
                        <div className="flex items-center gap-1.5">
                          <RiNotification3Line size={13} className="text-theme-primary-400" />
                          <span>WebPush Client (Physical Device)</span>
                        </div>
                        <span className="text-slate-500">just now</span>
                      </div>

                      {/* Notification Content Body */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-theme-primary-500/20 border border-theme-primary-500/30 flex items-center justify-center text-lg shrink-0">
                          {selectedScenario.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white font-display truncate">
                            {selectedScenario.title}
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                            {selectedScenario.body}
                          </p>
                        </div>
                      </div>

                      {/* Notification Action Buttons */}
                      <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-end gap-2">
                        <span className="text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer px-2 py-1 rounded">
                          Dismiss
                        </span>
                        <button className="px-3 py-1 rounded-lg bg-theme-primary-500 text-white text-xs font-semibold hover:bg-theme-primary-600 transition-colors">
                          {selectedScenario.actionText}
                        </button>
                      </div>

                      {/* Animated Pulse Beam on transmission */}
                      <AnimatePresence>
                        {isTransmitting && (
                          <motion.div
                            initial={{ left: '-100%' }}
                            animate={{ left: '200%' }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.85, ease: 'linear' }}
                            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-theme-primary-400/30 to-transparent skew-x-12 pointer-events-none"
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Transmit Button & Realtime Latency Telemetry */}
                <div className="p-5 pt-2 flex flex-col gap-3">
                  <motion.button
                    onClick={handleTransmit}
                    disabled={isTransmitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-theme-primary-500 hover:bg-theme-primary-600 text-white transition-colors shadow-glow-sm disabled:opacity-60"
                  >
                    {isTransmitting ? (
                      <>
                        <RiPulseLine size={16} className="animate-spin" />
                        <span>Transmitting Packet...</span>
                      </>
                    ) : (
                      <>
                        <RiSendPlane2Line size={16} />
                        <span>Transmit Live WebPush Pulse</span>
                      </>
                    )}
                  </motion.button>

                  {/* Telemetry Output Bar */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-400">
                      <RiSpeedUpLine size={14} className="text-theme-primary-400" />
                      <span>Measured Dispatch Time:</span>
                    </div>
                    <span className="text-emerald-400 font-bold">
                      {transmissionSuccess ? '✓ Transmitted · ' : ''}
                      {selectedScenario.latencyMs} ms · 200 OK
                    </span>
                  </div>
                </div>

                {/* Integrated Code Spec Drawer */}
                <div
                  className="border-t border-white/10 bg-[#0e1017] rounded-b-3xl overflow-hidden"
                  style={{ colorScheme: 'dark' }}
                >
                  <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/5">
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl">
                      <button
                        onClick={() => setActiveCodeTab('server')}
                        className={`relative px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                          activeCodeTab === 'server'
                            ? 'text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {activeCodeTab === 'server' && (
                          <motion.div
                            layoutId="simulator-code-tab"
                            className="absolute inset-0 bg-white/15 rounded-lg"
                            transition={
                              shouldReduceMotion
                                ? { duration: 0 }
                                : { type: 'spring', stiffness: 280, damping: 28 }
                            }
                          />
                        )}
                        <span className="relative z-10">server.ts</span>
                      </button>
                      <button
                        onClick={() => setActiveCodeTab('client')}
                        className={`relative px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                          activeCodeTab === 'client'
                            ? 'text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {activeCodeTab === 'client' && (
                          <motion.div
                            layoutId="simulator-code-tab"
                            className="absolute inset-0 bg-white/15 rounded-lg"
                            transition={
                              shouldReduceMotion
                                ? { duration: 0 }
                                : { type: 'spring', stiffness: 280, damping: 28 }
                            }
                          />
                        )}
                        <span className="relative z-10">client.ts</span>
                      </button>
                    </div>
                    <CopyButton
                      text={
                        activeCodeTab === 'server'
                          ? `import { initServerClient } from 'vibe-message';\nconst vibe = initServerClient({ appId: 'YOUR_APP_ID', secretKey: 'SECRET_KEY' });\nawait vibe.notification({\n  notificationData: { title: '${selectedScenario.title}', body: '${selectedScenario.body}' },\n  externalUsers: ['user-id']\n});`
                          : `import { initNotificationClient } from 'vibe-message';\nconst client = initNotificationClient({ appId: 'YOUR_APP_ID', publicKey: 'VAPID_PUBLIC_KEY' });\nawait client.subscribe();`
                      }
                      iconOnly
                    />
                  </div>

                  <div
                    className="p-4 sm:p-5 font-mono text-xs leading-relaxed text-slate-300 overflow-hidden w-full min-w-0 select-text"
                    style={{ colorScheme: 'dark' }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeCodeTab + '-' + selectedScenario.id}
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.28, ease: easeOut }}
                        className="w-full min-w-0"
                      >
                        {activeCodeTab === 'server' ? (
                          <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] font-mono m-0 p-0 w-full min-w-0">
                            <code className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] font-mono block w-full">
                              <span className="text-theme-primary-400">import</span> {'{'}{' '}
                              initServerClient {'}'}{' '}
                              <span className="text-theme-primary-400">from</span>{' '}
                              <span className="text-emerald-300">'vibe-message'</span>;{'\n'}
                              <span className="text-theme-primary-400">const</span> vibe ={' '}
                              <span className="text-amber-300">initServerClient</span>({'{'} appId,
                              secretKey {'}'});{'\n'}
                              <span className="text-theme-primary-400">await</span> vibe.
                              <span className="text-amber-300">notification</span>({'{'}
                              {'\n'}
                              {'  '}notificationData: {'{'}
                              {'\n'}
                              {'    '}title:{' '}
                              <span className="text-emerald-300 break-words [overflow-wrap:anywhere]">
                                '{selectedScenario.title}'
                              </span>
                              ,{'\n'}
                              {'    '}body:{' '}
                              <span className="text-emerald-300 break-words [overflow-wrap:anywhere]">
                                '{selectedScenario.body}'
                              </span>
                              {'\n'}
                              {'  '}
                              {'}'},{'\n'}
                              {'  '}externalUsers: [
                              <span className="text-emerald-300">'usr_prod_849'</span>]{'\n'}
                              {'}'});
                            </code>
                          </pre>
                        ) : (
                          <pre className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] font-mono m-0 p-0 w-full min-w-0">
                            <code className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] font-mono block w-full">
                              <span className="text-theme-primary-400">import</span> {'{'}{' '}
                              initNotificationClient {'}'}{' '}
                              <span className="text-theme-primary-400">from</span>{' '}
                              <span className="text-emerald-300">'vibe-message'</span>;{'\n'}
                              <span className="text-theme-primary-400">const</span> client ={' '}
                              <span className="text-amber-300">initNotificationClient</span>({'{'}
                              {'\n'}
                              {'  '}appId: <span className="text-emerald-300">'app_live_091'</span>,
                              {'\n'}
                              {'  '}publicKey:{' '}
                              <span className="text-emerald-300">'BPa3X...VAPID'</span>
                              {'\n'}
                              {'}'});{'\n'}
                              <span className="text-slate-500">
                                // Requests browser prompt & caches push token
                              </span>
                              {'\n'}
                              <span className="text-theme-primary-400">await</span> client.
                              <span className="text-amber-300">subscribe</span>();
                            </code>
                          </pre>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            2. CARRIER PROTOCOL & SPECIFICATION MATRIX
            ========================================================================= */}
        <section
          id="architecture"
          aria-labelledby="matrix-heading"
          className="py-14 border-y border-theme-border bg-theme-bg-secondary/60 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={sectionHeaderVariants}
              className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-theme-border/60"
            >
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-theme-primary-500 mb-1">
                  CARRIER COMPATIBILITY MATRIX
                </p>
                <h2 id="matrix-heading" className="text-lg font-display font-bold text-theme-text-primary">
                  Native Protocol Compliance Across Modern Browsers
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-theme-text-secondary">
                <span className="flex items-center gap-1.5">
                  <RiCheckLine size={14} className="text-theme-success" />
                  <span>RFC 8291 WebPush Encryption</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <RiCheckLine size={14} className="text-theme-success" />
                  <span>HTTP/2 Multiplexing</span>
                </span>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerGridVariants(0.1)}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6"
            >
              {[
                { name: 'Apple Safari', version: 'macOS & iOS 16.4+', spec: 'APNs Push' },
                { name: 'Google Chrome', version: 'Desktop & Android', spec: 'FCM Endpoint' },
                { name: 'Mozilla Firefox', version: 'Windows / Linux / Mac', spec: 'Autopush' },
                { name: 'Microsoft Edge', version: 'Chromium Core', spec: 'WNS Protocol' },
                { name: 'Node.js Engine', version: 'v18, v20, v22 LTS', spec: 'Webcrypto' },
                { name: 'Service Worker', version: 'W3C Push API', spec: 'Silent Wakeup' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="p-3.5 rounded-xl bg-theme-bg-primary border border-theme-border flex flex-col justify-between hover:border-theme-primary-500/40 transition-colors shadow-2xs"
                >
                  <div className="text-xs font-bold font-display text-theme-text-primary">
                    {item.name}
                  </div>
                  <div className="text-xs text-theme-text-secondary mt-1">{item.version}</div>
                  <div className="text-xs font-mono text-theme-primary-500 mt-2 font-medium">
                    {item.spec}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            3. BENTO GRID: "COMMUNITY & OPEN ARCHITECTURE"
            ========================================================================= */}
        <section id="features" aria-labelledby="features-heading" className="py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={sectionHeaderVariants}
              className="mb-16 max-w-3xl"
            >
              <span className="text-xs font-mono font-bold tracking-widest text-theme-primary-500 uppercase mb-2 block">
                COMMUNITY &amp; ARCHITECTURE
              </span>
              <h2
                id="features-heading"
                className="text-3xl sm:text-4xl font-display font-bold text-theme-text-primary tracking-tight mb-4"
              >
                Community-first hosted service. Unmetered self-hosting.
              </h2>
              <p className="text-base sm:text-lg text-theme-text-secondary leading-relaxed">
                Our free hosted service is an ecosystem built primarily to support developers, learners,
                and indie makers at zero cost. When you need high-volume commercial production or private
                database control, deploy with Docker in minutes.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerGridVariants(0.12)}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6"
            >
              {/* Card 1: Community-First Hosted Service (Span 7) */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="lg:col-span-7 rounded-3xl bg-theme-bg-secondary border border-theme-border p-8 flex flex-col justify-between shadow-xs hover:border-theme-primary-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-theme-primary-500/10 border border-theme-primary-500/20 flex items-center justify-center text-theme-primary-500">
                      <RiHeartLine size={24} />
                    </div>
                    <span className="text-xs font-mono text-theme-success px-2.5 py-1 rounded-full bg-theme-success/10 border border-theme-success/20 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse" />
                      <span>100% Free · Community Ecosystem</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-display font-bold text-theme-text-primary mb-2.5">
                    Built Primarily to Support the Developer Community
                  </h3>
                  <p className="text-theme-text-secondary text-sm leading-relaxed mb-6">
                    Our free hosted service is an ecosystem built to empower the developer community
                    with zero financial barrier. It is intentionally designed and optimized for:
                  </p>
                </div>

                {/* Interactive 4-Pillars Showcase */}
                <div className="rounded-2xl bg-theme-bg-primary border border-theme-border p-4 font-mono text-xs">
                  <div className="flex items-center justify-between text-xs text-theme-text-muted uppercase tracking-wider mb-3">
                    <span>Designed &amp; Optimized For:</span>
                    <span className="text-theme-primary-500 font-semibold">Community Tier</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {COMMUNITY_PILLARS.map((pillar, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActivePillarIdx(i)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          activePillarIdx === i
                            ? 'bg-theme-primary-500/10 border-theme-primary-500/50 text-theme-text-primary shadow-2xs'
                            : 'bg-theme-bg-secondary/70 border-theme-border text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-border/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{pillar.icon}</span>
                          <span className="font-bold font-display text-xs truncate text-theme-text-primary">
                            {pillar.title}
                          </span>
                        </div>
                        <div className="text-xs text-theme-text-muted mt-1 leading-snug line-clamp-1 font-sans">
                          {pillar.subtitle}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-theme-border/60 flex items-center justify-between text-xs font-mono text-theme-text-muted">
                    <span className="flex items-center gap-1.5 text-theme-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Single Community Node · Fair-Use Policy</span>
                    </span>
                    <Link
                      to="/terms-of-service"
                      className="text-theme-primary-500 hover:underline"
                    >
                      Usage Guidelines &rarr;
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Sovereign Multi-Tenant Vault (Span 5) */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="lg:col-span-5 rounded-3xl bg-theme-bg-secondary border border-theme-border p-8 flex flex-col justify-between shadow-xs hover:border-theme-primary-500/40 transition-colors"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-theme-primary-500/10 border border-theme-primary-500/20 flex items-center justify-center text-theme-primary-500 mb-6">
                    <RiShieldCheckLine size={24} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-theme-text-primary mb-2.5">
                    Multi-Tenant Vault
                  </h3>
                  <p className="text-theme-text-secondary text-sm leading-relaxed mb-6">
                    Strict cryptographic isolation per application. Each workspace receives an
                    isolated App ID, frontend Public Key, and server Secret Key.
                  </p>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-theme-bg-primary border border-theme-border">
                    <span className="text-theme-text-muted">Public Key:</span>
                    <span className="text-theme-text-primary">
                      BPa3X...ECDSA (Safe for browser)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-theme-bg-primary border border-theme-border">
                    <span className="text-theme-text-muted">Secret Key:</span>
                    <span className="text-theme-primary-500 font-bold">●●●●●●●● (Server only)</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Automated Drip & Retention Loops (Span 4) */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="lg:col-span-4 rounded-3xl bg-theme-bg-secondary border border-theme-border p-7 flex flex-col justify-between shadow-xs hover:border-theme-primary-500/40 transition-colors"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-theme-primary-500/10 border border-theme-primary-500/20 flex items-center justify-center text-theme-primary-500 mb-5">
                    <RiTimeLine size={22} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-theme-text-primary mb-2.5">
                    Automated Drip Loops
                  </h3>
                  <p className="text-theme-text-secondary text-sm leading-relaxed">
                    Schedule multi-step re-engagement anchors. Trigger cron sequences that
                    autonomously nurture active users without custom worker cron servers.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-theme-border flex items-center gap-2 text-xs font-mono text-theme-text-muted">
                  <span className="w-2 h-2 rounded-full bg-theme-success" />
                  <span>Integrated Cron Daemon</span>
                </div>
              </motion.div>

              {/* Card 4: Silent Background Synchronization (Span 4) */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="lg:col-span-4 rounded-3xl bg-theme-bg-secondary border border-theme-border p-7 flex flex-col justify-between shadow-xs hover:border-theme-primary-500/40 transition-colors"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-theme-primary-500/10 border border-theme-primary-500/20 flex items-center justify-center text-theme-primary-500 mb-5">
                    <RiCpuLine size={22} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-theme-text-primary mb-2.5">
                    Silent Background Sync
                  </h3>
                  <p className="text-theme-text-secondary text-sm leading-relaxed">
                    Dispatch invisible data packets to awake the Service Worker in the background.
                    Re-fetch GraphQL queries, warm cache tables, or synchronize offline state.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-theme-border flex items-center gap-2 text-xs font-mono text-theme-text-muted">
                  <span className="w-2 h-2 rounded-full bg-theme-primary-500" />
                  <span>Zero UI Intrusion</span>
                </div>
              </motion.div>

              {/* Card 5: Self-Host for Production & Scale (Span 4) */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="lg:col-span-4 rounded-3xl bg-theme-bg-secondary border border-theme-border p-7 flex flex-col justify-between shadow-xs hover:border-theme-primary-500/40 transition-colors"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-theme-primary-500/10 border border-theme-primary-500/20 flex items-center justify-center text-theme-primary-500 mb-5">
                    <RiServerLine size={22} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-theme-text-primary mb-2.5">
                    Self-Host for High Scale
                  </h3>
                  <p className="text-theme-text-secondary text-sm leading-relaxed">
                    Need unmetered commercial throughput, high reliability, or private data control?
                    Deploy your own instance in minutes with Docker Compose or Kubernetes.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-theme-border flex items-center justify-between text-xs font-mono text-theme-text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-theme-success" />
                    <span>Unmetered &amp; Private</span>
                  </span>
                  <span className="text-theme-primary-500 font-semibold">Docker Ready</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            4. WORKFLOW: "FROM ZERO TO BROADCAST IN 180 SECONDS"
            ========================================================================= */}
        <section
          id="workflow"
          aria-labelledby="workflow-heading"
          className="py-28 border-t border-theme-border bg-theme-bg-secondary/40 backdrop-blur-sm relative"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={sectionHeaderVariants}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <span className="text-xs font-mono font-bold tracking-widest text-theme-primary-500 uppercase mb-2 block">
                INTEGRATION WALKTHROUGH
              </span>
              <h2
                id="workflow-heading"
                className="text-3xl sm:text-4xl font-display font-bold text-theme-text-primary tracking-tight mb-4"
              >
                Three clean steps. Zero configuration overhead.
              </h2>
              <p className="text-base sm:text-lg text-theme-text-secondary leading-relaxed">
                We automated VAPID generation, service-worker registration, and carrier handshake
                into a seamless CLI and lightweight SDK.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerGridVariants(0.16)}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Step 1 */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="rounded-3xl bg-theme-bg-secondary border border-theme-border p-8 flex flex-col justify-between shadow-xs hover:border-theme-primary-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-xl bg-theme-primary-500/10 text-theme-primary-500 font-mono font-bold flex items-center justify-center text-xs">
                      01
                    </span>
                    <span className="text-xs font-mono text-theme-text-muted uppercase">
                      One-time init
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-theme-text-primary mb-2.5">
                    Generate Service Worker
                  </h3>
                  <p className="text-sm text-theme-text-secondary leading-relaxed mb-6">
                    Run the CLI in your React, Next.js, or Vite project. It automatically writes the
                    background push listener in your public directory.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-theme-bg-primary border border-theme-border font-mono text-xs flex items-center justify-between text-theme-text-primary">
                  <code>npx vibe-message init</code>
                  <CopyButton text="npx vibe-message init" iconOnly />
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="rounded-3xl bg-theme-bg-secondary border border-theme-border p-8 flex flex-col justify-between shadow-xs hover:border-theme-primary-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-xl bg-theme-primary-500/10 text-theme-primary-500 font-mono font-bold flex items-center justify-center text-xs">
                      02
                    </span>
                    <span className="text-xs font-mono text-theme-text-muted uppercase">
                      Frontend SDK
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-theme-text-primary mb-2.5">
                    Subscribe Client Device
                  </h3>
                  <p className="text-sm text-theme-text-secondary leading-relaxed mb-6">
                    Call `client.subscribe()` anywhere in your user settings or onboarding flow. We
                    handle the browser permission prompt and token sync.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-theme-bg-primary border border-theme-border font-mono text-xs text-theme-text-primary whitespace-pre-wrap break-all overflow-hidden">
                  <code>await client.subscribe();</code>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="rounded-3xl bg-theme-bg-secondary border border-theme-border p-8 flex flex-col justify-between shadow-xs hover:border-theme-primary-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-xl bg-theme-primary-500/10 text-theme-primary-500 font-mono font-bold flex items-center justify-center text-xs">
                      03
                    </span>
                    <span className="text-xs font-mono text-theme-text-muted uppercase">
                      Backend API
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-theme-text-primary mb-2.5">
                    Trigger REST Payload
                  </h3>
                  <p className="text-sm text-theme-text-secondary leading-relaxed mb-6">
                    Dispatch notifications directly from your Node.js backend. Broadcast to single
                    users, target custom tags, or dispatch global announcements.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-theme-bg-primary border border-theme-border font-mono text-xs text-theme-text-primary whitespace-pre-wrap break-all overflow-hidden">
                  <code>await vibe.notification(...)</code>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            5. LIVE NOTIFICATION PLAYGROUND STUDIO
            ========================================================================= */}
        <section
          id="playground"
          aria-labelledby="playground-heading"
          className="py-28 border-t border-theme-border"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Studio Left Form Controls */}
              <motion.div
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -36 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.9, ease: easeOut }}
                className="lg:col-span-6 space-y-6"
              >
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-theme-primary-500 uppercase mb-2 block">
                    INTERACTIVE PLAYGROUND
                  </span>
                  <h2
                    id="playground-heading"
                    className="text-3xl sm:text-4xl font-display font-bold text-theme-text-primary tracking-tight mb-3"
                  >
                    Customize and inspect payloads in real-time.
                  </h2>
                  <p className="text-base sm:text-lg text-theme-text-secondary leading-relaxed">
                    Test how your notifications look on consumer operating systems before shipping
                    to production.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl bg-theme-bg-secondary border border-theme-border p-6 shadow-xs">
                  <div>
                    <label className="block text-xs font-mono font-medium text-theme-text-secondary mb-1.5">
                      Notification Title
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="input text-sm"
                      placeholder="e.g. Payment Received"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-theme-text-secondary mb-1.5">
                      Message Body
                    </label>
                    <textarea
                      rows={2}
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      className="input text-sm"
                      placeholder="Describe the alert..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-mono font-medium text-theme-text-secondary">
                          Icon Emoji / Symbol
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customIcon}
                          onChange={handleIconChange}
                          className="input !text-center text-lg !py-1.5 !px-2 w-12 shrink-0 font-emoji select-all"
                          placeholder="🎉"
                          title="Enter a single emoji"
                        />
                        {/* Quick Presets */}
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                          {EMOJI_PRESETS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setCustomIcon(emoji)}
                              className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                                customIcon === emoji
                                  ? 'bg-theme-primary-500/20 border border-theme-primary-500/60 scale-105 shadow-xs'
                                  : 'bg-theme-bg-muted/60 border border-theme-border hover:bg-theme-bg-muted hover:scale-105'
                              }`}
                              title={`Set icon to ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-medium text-theme-text-secondary mb-1.5">
                        Action Button Label
                      </label>
                      <input
                        type="text"
                        value={customAction}
                        onChange={(e) => setCustomAction(e.target.value)}
                        className="input text-sm"
                        placeholder="View Invoice"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Studio Right Visual Simulation Plate */}
              <motion.div
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 36 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.9, delay: 0.12, ease: easeOut }}
                className="lg:col-span-6"
              >
                <div className="rounded-3xl bg-gradient-to-b from-[#13151f] to-[#0b0c11] border border-white/10 p-6 sm:p-8 shadow-2xl text-slate-200">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 text-xs font-mono text-slate-400">
                    <span>OS RENDER SIMULATOR (macOS / Windows 11)</span>
                    <span className="text-theme-primary-400 font-semibold">
                      Native Desktop Push
                    </span>
                  </div>

                  {/* Desktop Toast Banner */}
                  <div className="rounded-2xl bg-[#1b1e2c]/90 border border-white/15 p-5 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-theme-primary-500/20 border border-theme-primary-500/40 flex items-center justify-center text-2xl shrink-0">
                        {customIcon || '🔔'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                            VIBE ENGINE APP
                          </span>
                          <span className="text-xs text-slate-500 font-mono">1m ago</span>
                        </div>
                        <h4 className="text-sm font-bold text-white font-display mt-0.5 truncate">
                          {customTitle || 'Your Notification Title'}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {customBody || 'Your notification message description will appear here.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white cursor-pointer transition-colors">
                        Close
                      </span>
                      <button className="px-4 py-1.5 rounded-xl bg-theme-primary-500 hover:bg-theme-primary-600 text-white font-semibold text-xs transition-colors shadow-glow-sm">
                        {customAction || 'Action'}
                      </button>
                    </div>
                  </div>

                  {/* Generated JSON Payload Specs */}
                  <div className="mt-6 pt-4 border-t border-white/10 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs uppercase">REST Payload Output:</span>
                      <CopyButton
                        text={JSON.stringify(
                          {
                            notificationData: {
                              title: customTitle,
                              body: customBody,
                              icon: 'https://yoursite.com/icon.png',
                              click_action: 'https://yoursite.com/dashboard',
                            },
                            externalUsers: ['user-1'],
                          },
                          null,
                          2
                        )}
                        iconOnly
                      />
                    </div>
                    <pre
                      className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] font-mono overflow-hidden select-text"
                      style={{ colorScheme: 'dark' }}
                    >
                      <code className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] block">
                        {`{
  "notificationData": {
    "title": "${customTitle}",
    "body": "${customBody}",
    "action": "${customAction}"
  },
  "externalUsers": ["target-user-id"]
}`}
                      </code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. COMPARISON MATRIX: "WHY TEAMS CHOOSE VIBE MESSAGE"
            ========================================================================= */}
        <section
          id="comparison"
          aria-labelledby="comparison-heading"
          className="py-28 border-t border-theme-border bg-theme-bg-secondary/40"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={sectionHeaderVariants}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span className="text-xs font-mono font-bold tracking-widest text-theme-primary-500 uppercase mb-2 block">
                PLATFORM COMPARISON
              </span>
              <h2
                id="comparison-heading"
                className="text-3xl sm:text-4xl font-display font-bold text-theme-text-primary tracking-tight mb-4"
              >
                Engineered for sovereignty. Zero lock-in.
              </h2>
              <p className="text-base sm:text-lg text-theme-text-secondary leading-relaxed">
                See how Vibe Message compares directly with legacy proprietary push notification
                vendors.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.85, ease: easeOut }}
              className="overflow-x-auto rounded-3xl border border-theme-border bg-theme-bg-secondary shadow-xs"
            >
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-theme-border text-xs font-mono uppercase text-theme-text-muted">
                    <th className="py-4 px-6 font-semibold">Capability</th>
                    <th className="py-4 px-6 font-bold text-theme-primary-500 bg-theme-primary-500/5 rounded-t-2xl">
                      Vibe Message
                    </th>
                    <th className="py-4 px-6 font-semibold">Firebase Cloud Messaging</th>
                    <th className="py-4 px-6 font-semibold">OneSignal / Novu</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-theme-border">
                  {[
                    {
                      feature: 'Self-Hostable Infrastructure',
                      vibe: 'Yes (Docker & K8s)',
                      fcm: 'No (Proprietary Google Cloud)',
                      alt: 'Partial / Closed Core',
                    },
                    {
                      feature: 'Subscriber Limit Pricing',
                      vibe: 'Unlimited (No subscriber tax)',
                      fcm: 'Free tier / Google Cloud lock',
                      alt: 'Steep tier fees per 10k users',
                    },
                    {
                      feature: 'Data Sovereignty & Privacy',
                      vibe: '100% in your own database',
                      fcm: 'Stored in Google Datacenters',
                      alt: 'Third-party hosted SaaS',
                    },
                    {
                      feature: 'Web Push Standards',
                      vibe: 'Pure RFC 8030 / 8292 VAPID',
                      fcm: 'Proprietary FCM tokens',
                      alt: 'Custom SDK wrapping',
                    },
                    {
                      feature: 'SDK Footprint',
                      vibe: '< 6 KB (Zero external bloat)',
                      fcm: 'Heavy Firebase SDK bundle',
                      alt: 'Medium to Heavy',
                    },
                    {
                      feature: 'Direct Database Access',
                      vibe: 'Direct PostgreSQL + Redis',
                      fcm: 'No SQL Access',
                      alt: 'REST API Only',
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-theme-bg-muted/40 transition-colors">
                      <td className="py-4 px-6 font-medium text-theme-text-primary">
                        {row.feature}
                      </td>
                      <td className="py-4 px-6 font-bold text-theme-primary-500 bg-theme-primary-500/5">
                        {row.vibe}
                      </td>
                      <td className="py-4 px-6 text-theme-text-secondary">{row.fcm}</td>
                      <td className="py-4 px-6 text-theme-text-secondary">{row.alt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            7. FREQUENTLY ASKED QUESTIONS (ACCORDION)
            ========================================================================= */}
        <section id="faq" aria-labelledby="faq-heading" className="py-28 border-t border-theme-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={sectionHeaderVariants}
              className="text-center mb-16"
            >
              <span className="text-xs font-mono font-bold tracking-widest text-theme-primary-500 uppercase mb-2 block">
                ENGINEERING SPECIFICATIONS
              </span>
              <h2
                id="faq-heading"
                className="text-3xl sm:text-4xl font-display font-bold text-theme-text-primary tracking-tight mb-4"
              >
                Frequently Answered Questions
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerGridVariants(0.1)}
              className="space-y-4"
            >
              {[
                {
                  q: 'How does Vibe Message differ from Firebase Cloud Messaging (FCM)?',
                  a: 'Firebase requires heavy Google client libraries and routes subscriber tokens through Google servers. Vibe Message uses open W3C Web Push protocols with VAPID keys, offering a free hosted service for the developer community and full open-source code to self-host with zero vendor lock-in.',
                },
                {
                  q: 'Does Vibe Message support iOS Safari push notifications?',
                  a: 'Yes! iOS 16.4+ natively supports Web Push notifications for Progressive Web Apps (PWAs) added to the Home Screen. Vibe Message seamlessly handles Apple Push Notification Service (APNs) VAPID handshakes without requiring an Apple Developer account for web push.',
                },
                {
                  q: 'Can I self-host Vibe Message completely on my own VPS?',
                  a: 'Yes. The repository includes automated Docker Compose scripts and PostgreSQL schemas. You can spin up the entire frontend, backend, and Redis queue on a $5/mo VPS or Kubernetes cluster with a single command.',
                },
                {
                  q: 'What are the intended usage guidelines for the free hosted tier?',
                  a: 'Our free hosted tier is run as a community service to support students & education, personal projects, testing & prototyping, and small-scale apps. To protect system stability for everyone, large-scale commercial use is restricted on the public node. Organizations needing production-level reliability and unmetered scale are encouraged to self-host with our Docker Compose setup.',
                },
                {
                  q: 'How are VAPID public and secret keys managed?',
                  a: 'VAPID keys use ECDSA P-256 curve cryptography. When you create an app, an App ID, Public Key, and Secret Key are generated. The Public Key is safe for client-side JavaScript, while the Secret Key remains strictly on your Node.js backend to sign payloads.',
                },
              ].map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    className="rounded-2xl bg-theme-bg-secondary border border-theme-border overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : index)}
                      className="w-full p-5 text-left flex items-center justify-between text-base font-bold font-display text-theme-text-primary hover:text-theme-primary-500 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <RiArrowDownSLine
                        size={18}
                        className={`text-theme-text-muted transition-transform duration-200 shrink-0 ml-4 ${
                          isOpen ? 'rotate-180 text-theme-primary-500' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="faq-content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={
                            shouldReduceMotion ? { duration: 0 } : { duration: 0.38, ease: easeOut }
                          }
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 text-sm text-theme-text-secondary leading-relaxed border-t border-theme-border/50 pt-3">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            8. CALL TO ACTION: "READY TO SHIP PRECISE PUSH INFRASTRUCTURE"
            ========================================================================= */}
        <motion.section
          id="cta"
          aria-labelledby="cta-heading"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.95, ease: easeOut }}
          className="relative py-28 border-t border-theme-border bg-theme-bg-secondary/60 backdrop-blur-sm overflow-hidden"
        >
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 space-y-8">
            <h2
              id="cta-heading"
              className="text-3xl sm:text-4xl font-display font-bold text-theme-text-primary tracking-tight"
            >
              Ready to ship push notifications that just work?
            </h2>
            <p className="text-base sm:text-lg text-theme-text-secondary max-w-2xl mx-auto leading-relaxed">
              Drop the lightweight SDK into your project and experience standard Web Push without
              bloat or subscriber penalties.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <Link
                to="/signup"
                className="btn-primary !px-8 !py-3.5 !rounded-xl text-sm font-semibold w-full sm:w-auto shadow-sm hover:shadow-glow-sm"
              >
                <span>Create Hub Account Free</span>
                <RiArrowRightLine size={18} />
              </Link>
              <Link
                to="/docs"
                className="btn-secondary !px-8 !py-3.5 !rounded-xl text-sm font-semibold w-full sm:w-auto"
              >
                <span>Read Full Specification</span>
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs font-mono text-theme-text-muted">
              <span>✓ MIT Licensed</span>
              <span>·</span>
              <span>✓ Self-Hostable</span>
              <span>·</span>
              <span>✓ Zero Lock-in</span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};
