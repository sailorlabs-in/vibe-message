import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  RiArrowRightLine,
  RiCodeLine,
  RiBarChartBoxLine,
  RiArrowUpLine,
  RiFlashlightLine,
  RiTerminalBoxLine,
  RiLockLine,
  RiSpeedUpLine,
  RiShieldUserLine,
  RiPlugLine,
  RiSmartphoneLine,
  RiGlobalLine,
  RiCheckboxCircleLine,
} from "@remixicon/react";
import { useRef } from "react";

export const Landing: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen text-theme-text-primary overflow-x-hidden font-sans mt-[-120px]">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-theme-primary-500 opacity-10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-theme-accent-500 opacity-10 blur-[120px]"></div>
        {/* Subtle grid background */}
      </div>

      <div className="relative z-10 w-full" ref={scrollRef}>
        {/* Hero Section */}
        <div className="relative min-h-[calc(100dvh-160px)] ">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <section className="pt-32 pb-20 lg:pt-44 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Tag Badge */}
              <div className="inline-flex items-center space-x-2 bg-theme-bg-secondary border border-theme-border rounded-full px-4 py-2 mb-8 shadow-sm hover:border-theme-primary-500 transition-colors">
                <span className="text-sm font-medium text-theme-text-primary">
                  Vibe Message Engine 1.0 is officially Live
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-8 leading-tight">
                <span className="block text-theme-text-primary">
                  Next-Gen Push
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-theme-primary-500 via-theme-accent-500 to-theme-primary-500 bg-[length:200%_auto] animate-gradient">
                  Infrastructure.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-theme-text-secondary mb-10 leading-relaxed max-w-lg">
                The enterprise-grade notification backend built for modern web
                applications. Deliver instant, reliable messages globally with
                absolute precision and unmatched security.
              </p>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/signup"
                  className="group bg-theme-primary-500 dark:bg-theme-primary-600 text-white hover:bg-theme-primary-600 relative px-8 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all hover:scale-105 shadow-lg w-full sm:w-auto text-center hover:opacity-90"
                >
                  <span className="relative flex items-center justify-center">
                    Start Building Free
                    <RiArrowRightLine
                      size={20}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </Link>

                <Link
                  to="/docs"
                  className="group px-8 py-4 bg-theme-bg-secondary border border-theme-border text-theme-text-primary rounded-xl font-bold text-lg transition-all hover:bg-theme-bg-muted w-full sm:w-auto flex items-center justify-center shadow-sm"
                >
                  <RiTerminalBoxLine
                    size={20}
                    className="mr-2 text-theme-text-muted group-hover:text-theme-text-primary transition-colors"
                  />
                  Explore Documention
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="hidden lg:block relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Developer IDE / Code Block */}
              <div className="relative rounded-2xl overflow-hidden bg-[#0F172A] border border-theme-border shadow-2xl">
                <div className="flex items-center px-4 py-3 bg-[#1E293B] border-b border-black/20">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <div className="mx-auto bg-black/20 rounded px-3 py-1 text-xs text-slate-400 font-mono">
                    api/broadcast.ts
                  </div>
                </div>
                <div className="p-6 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed">
                  <pre>
                    <code>
                      <span className="text-[#c678dd]">import</span> {"{"}{" "}
                      initServerClient {"}"}{" "}
                      <span className="text-[#c678dd]">from</span>{" "}
                      <span className="text-[#98c379]">
                        'vibe-message'
                      </span>
                      ;
                      <br />
                      <br />
                      <span className="text-[#c678dd]">const</span> vibe ={" "}
                      <span className="text-[#61afef]">initServerClient</span>
                      ({"{"}
                      <br />
                      &nbsp;&nbsp;appId:{" "}
                      <span className="text-[#98c379]">
                        'your-app-id'
                      </span>
                      ,<br />
                      &nbsp;&nbsp;secretKey:{" "}
                      <span className="text-[#98c379]">
                        'your-secret-key'
                      </span>
                      <br />
                      {"}"});
                      <br />
                      <br />
                      <span className="text-[#c678dd]">const</span> result ={" "}
                      <span className="text-[#c678dd]">await</span>{" "}
                      vibe.<span className="text-[#61afef]">notification</span>
                      ({"{"}
                      <br />
                      &nbsp;&nbsp;notificationData: {"{"}
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;title:{" "}
                      <span className="text-[#98c379]">
                        'New Content!'
                      </span>
                      ,<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;body:{" "}
                      <span className="text-[#98c379]">
                        'Someone liked your post.'
                      </span>
                      ,<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;icon:{" "}
                      <span className="text-[#98c379]">
                        'https://yoursite.com/icon.png'
                      </span>
                      ,<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;click_action:{" "}
                      <span className="text-[#98c379]">
                        'https://yoursite.com/dashboard'
                      </span>
                      ,<br />
                      &nbsp;&nbsp;{"}"},<br />
                      &nbsp;&nbsp;externalUsers: [
                      <span className="text-[#98c379]">
                        'user-1'
                      </span>
                      ]
                      <br />
                      {"}"});
                    </code>
                  </pre>
                </div>
              </div>

              {/* Floating Elements Collection */}
              <motion.div
                className="absolute -bottom-6 -left-10 bg-theme-bg-secondary border border-theme-border rounded-xl p-4 shadow-xl flex items-center space-x-4 backdrop-blur-xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="w-10 h-10 border border-theme-border rounded-full relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-theme-success opacity-10"></div>
                  <RiArrowUpLine
                    size={20}
                    className="text-theme-success z-10"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-theme-text-primary">
                    99.99%
                  </div>
                  <div className="text-xs text-theme-text-muted">
                    Delivery Rate
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -top-8 -right-8 bg-theme-bg-secondary border border-theme-border rounded-xl p-4 shadow-xl flex items-center space-x-4 backdrop-blur-xl"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="w-10 h-10 border border-theme-border rounded-full relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-theme-primary-500 opacity-10"></div>
                  <RiCodeLine
                    size={20}
                    className="text-theme-primary-500 z-10"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-theme-text-primary">
                    &lt; 5 mins
                  </div>
                  <div className="text-xs text-theme-text-muted">
                    Integration Time
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </section>
        </div>

        {/* Logo Cloud Section */}
        <section className="py-12 border-y border-theme-border bg-black/5 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <motion.p 
              className="text-sm font-medium text-theme-text-muted mb-8 uppercase tracking-widest"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Built with the modern web stack
            </motion.p>
            <motion.div 
              className="flex flex-wrap justify-center gap-10 opacity-70 hover:opacity-100 grayscale hover:grayscale-0 transition-opacity transition-filters duration-500"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                visible: {
                  transition: { staggerChildren: 0.15 }
                }
              }}
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }} className="flex items-center space-x-2 text-xl font-bold font-display">
                <RiTerminalBoxLine /> <span>Node.js</span>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }} className="flex items-center space-x-2 text-xl font-bold font-display">
                <RiCodeLine /> <span>React</span>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }} className="flex items-center space-x-2 text-xl font-bold font-display">
                <RiLockLine /> <span>PostgreSQL</span>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }} className="flex items-center space-x-2 text-xl font-bold font-display">
                <RiGlobalLine /> <span>Service Workers</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Bento Grid Showcase */}
        <section className="py-24 relative" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mb-16 max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-bold tracking-widest text-theme-primary-500 uppercase mb-3">
                Enterprise Infrastructure
              </h2>
              <h3 className="text-4xl md:text-5xl font-display font-bold mb-6 text-theme-text-primary">
                Everything you need to scale globally.
              </h3>
              <p className="text-xl text-theme-text-secondary leading-relaxed">
                We handle the complex infrastructure of push notifications—from
                token management, vendor routing, to payload encryption—so you
                can focus entirely on building your product.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[240px]">
              {/* Card 1 - Large Feature */}
              <motion.div
                className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 relative rounded-3xl bg-theme-bg-secondary border border-theme-border p-8 overflow-hidden group hover:border-[#A78BFA] transition-colors duration-300 shadow-sm hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <RiFlashlightLine size={200} />
                </div>
                <div className="relative h-full flex flex-col justify-end z-10">
                  <div className="w-14 h-14 relative rounded-2xl flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-theme-primary-500 opacity-10 rounded-2xl"></div>
                    <RiFlashlightLine
                      size={28}
                      className="text-theme-primary-500 z-10"
                    />
                  </div>
                  <h3 className="text-3xl font-display font-bold text-theme-text-primary mb-3">
                    Hyper-Scale Core
                  </h3>
                  <p className="text-theme-text-secondary text-lg leading-relaxed">
                    Built natively on heavily optimized PostgreSQL and event
                    queues. Capable of processing hundreds of thousands of
                    concurrent notification dispatch requests without breaking a
                    sweat. Guaranteed delivery integrity.
                  </p>
                </div>
              </motion.div>

              {/* Card 2 - Stats / Realtime */}
              <motion.div
                className="col-span-1 md:col-span-1 lg:col-span-2 relative rounded-3xl bg-theme-bg-secondary border border-theme-border p-8 flex flex-col justify-center overflow-hidden group hover:border-[#10B981] transition-colors duration-300 shadow-sm hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-end space-x-4 mb-3">
                  <span className="text-6xl font-display font-bold text-theme-text-primary group-hover:text-theme-accent-500 transition-colors">
                    42
                  </span>
                  <span className="text-xl text-theme-text-muted pb-1 font-mono">
                    ms
                  </span>
                </div>
                <h3 className="text-xl font-bold text-theme-text-primary mb-2">
                  Lightning Fast Latency
                </h3>
                <p className="text-sm text-theme-text-secondary">
                  From API network receipt to physical device wake up protocol.
                </p>
              </motion.div>

              {/* Card 3 - Small Feature Security */}
              <motion.div
                className="col-span-1 rounded-3xl bg-theme-bg-secondary border border-theme-border p-6 flex flex-col hover:border-[#A78BFA] transition-colors duration-300 shadow-sm hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-10 h-10 relative flex items-center justify-center mb-auto rounded-lg">
                  <div className="absolute inset-0 bg-theme-primary-500 opacity-10 rounded-lg"></div>
                  <RiShieldUserLine
                    size={24}
                    className="text-theme-primary-500 z-10"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-theme-text-primary mb-1 text-lg">
                    Multi-Tenant Vault
                  </h3>
                  <p className="text-sm text-theme-text-secondary">
                    Strict data isolation with app-scoped environment keys.
                  </p>
                </div>
              </motion.div>

              {/* Card 4 - Small Feature SDK */}
              <motion.div
                className="col-span-1 rounded-3xl bg-theme-bg-secondary border border-theme-border p-6 flex flex-col hover:border-[#A78BFA] transition-colors duration-300 shadow-sm hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-10 h-10 relative flex items-center justify-center mb-auto rounded-lg">
                  <div className="absolute inset-0 bg-theme-primary-500 opacity-10 rounded-lg"></div>
                  <RiPlugLine
                    size={24}
                    className="text-theme-primary-500 z-10"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-theme-text-primary mb-1 text-lg">
                    Frictionless SDK
                  </h3>
                  <p className="text-sm text-theme-text-secondary">
                    Pre-built clients handling tokens and service workers.
                  </p>
                </div>
              </motion.div>

              {/* Card 5 - Medium Feature Analytics */}
              <motion.div
                className="col-span-1 md:col-span-2 lg:col-span-2 relative rounded-3xl bg-theme-bg-secondary border border-theme-border p-8 flex flex-col justify-end group hover:border-[#A78BFA] transition-colors duration-300 overflow-hidden shadow-sm hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <div className="mb-auto">
                  <div className="w-12 h-12 relative flex items-center justify-center rounded-xl">
                    <div className="absolute inset-0 bg-theme-primary-500 opacity-10 rounded-xl"></div>
                    <RiBarChartBoxLine
                      size={24}
                      className="text-theme-primary-500 z-10"
                    />
                  </div>
                </div>
                <div className="mt-2 relative z-10">
                  <h3 className="text-2xl font-display font-bold text-theme-text-primary mb-3">
                    Telemetry Engine
                  </h3>
                  <p className="text-base text-theme-text-secondary leading-relaxed max-w-sm">
                    Granular, real-time analytics. Monitor delivery status,
                    manage device registries, and track notification health
                    instantly from the integrated Admin Dashboard.
                  </p>
                </div>
              </motion.div>

              {/* Card 6 - Medium Feature Audience */}
              <motion.div
                className="col-span-1 md:col-span-1 lg:col-span-2 relative rounded-3xl bg-theme-bg-secondary border border-theme-border p-8 flex flex-col justify-end group hover:border-[#10B981] transition-colors duration-300 overflow-hidden shadow-sm hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <div className="mb-auto flex space-x-4">
                  <div className="w-12 h-12 relative flex items-center justify-center rounded-xl">
                    <div className="absolute inset-0 bg-theme-accent-500 opacity-10 rounded-xl"></div>
                    <RiSmartphoneLine
                      size={24}
                      className="text-theme-accent-500 z-10"
                    />
                  </div>
                </div>
                <div className="mt-2 relative z-10">
                  <h3 className="text-2xl font-display font-bold text-theme-text-primary mb-3">
                    Precision Targeting
                  </h3>
                  <p className="text-base text-theme-text-secondary leading-relaxed max-w-sm">
                    Send rich graphical notifications directly to user screens,
                    or dispatch data-only silent background pushes to sync local
                    app states seamlessly.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Workflow / How it Works Section */}
        <section className="py-24 bg-black/5 dark:bg-white/5 relative border-t border-theme-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-theme-text-primary">
                From zero to shipped in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-primary-500 to-theme-accent-500">
                  minutes.
                </span>
              </h2>
              <p className="text-xl text-theme-text-secondary">
                We've abstracted the ridiculous complexities of VAPID keys and
                browser compatibility into four beautifully simple steps.
              </p>
            </motion.div>

            <div className="relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-theme-border -translate-y-1/2 z-0"></div>

              <div className="grid md:grid-cols-4 gap-8 relative z-10">
                {/* Step 1 */}
                <motion.div
                  className="bg-theme-bg-secondary border border-theme-border rounded-2xl p-6 shadow-sm relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-12 h-12 bg-theme-bg-primary border border-theme-border rounded-full flex items-center justify-center font-bold text-theme-primary-500 text-xl font-display mb-6 shadow-sm mx-auto md:mx-0">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-theme-text-primary mb-3 text-center md:text-left">
                    Initialize Vault
                  </h3>
                  <p className="text-theme-text-secondary text-sm leading-relaxed text-center md:text-left">
                    Register an account on the secure platform. Generating your
                    distinct App ID and isolated database tenant automatically.
                  </p>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                  className="bg-theme-bg-secondary border border-theme-border rounded-2xl p-6 shadow-sm relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-12 h-12 bg-theme-bg-primary border border-theme-border rounded-full flex items-center justify-center font-bold text-theme-primary-500 text-xl font-display mb-6 shadow-sm mx-auto md:mx-0">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-theme-text-primary mb-3 text-center md:text-left">
                    Generate Keys
                  </h3>
                  <p className="text-theme-text-secondary text-sm leading-relaxed text-center md:text-left">
                    Provision strictly encrypted VAPID key pairs and API Secret
                    keys needed to authenticate API payloads.
                  </p>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  className="bg-theme-bg-secondary border border-theme-border rounded-2xl p-6 shadow-sm relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-12 h-12 bg-theme-bg-primary border border-theme-border rounded-full flex items-center justify-center font-bold text-theme-primary-500 text-xl font-display mb-6 shadow-sm mx-auto md:mx-0">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-theme-text-primary mb-3 text-center md:text-left">
                    Embed JS SDK
                  </h3>
                  <p className="text-theme-text-secondary text-sm leading-relaxed text-center md:text-left">
                    Drop the frontend client wrapper into your React or Vue app.
                    We automatically handle service worker initialization and
                    browser dialogues.
                  </p>
                </motion.div>

                {/* Step 4 */}
                <motion.div
                  className="bg-theme-bg-secondary border border-theme-border rounded-2xl p-6 shadow-sm relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-12 h-12 bg-theme-bg-primary border border-theme-border rounded-full flex items-center justify-center font-bold text-theme-primary-500 text-xl font-display mb-6 shadow-sm mx-auto md:mx-0">
                    4
                  </div>
                  <h3 className="text-xl font-bold text-theme-text-primary mb-3 text-center md:text-left">
                    Trigger API
                  </h3>
                  <p className="text-theme-text-secondary text-sm leading-relaxed text-center md:text-left">
                    Invoke our Node.js REST API directly from your backend
                    routines. The engine routes and guarantees delivery globally
                    in milliseconds.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-24 border-t border-theme-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="relative p-8 rounded-3xl bg-theme-bg-secondary border border-theme-border shadow-xl">
                  {/* Decorative Mockup */}
                  <div className="w-full bg-theme-bg-primary rounded-xl border border-theme-border overflow-hidden shadow-inner">
                    <div className="border-b border-theme-border p-3 flex items-center bg-black/5 dark:bg-white/5">
                      <RiSpeedUpLine
                        size={18}
                        className="text-theme-text-muted mr-2"
                      />
                      <span className="text-xs font-mono text-theme-text-muted">
                        Broadcast Traffic Monitor
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between p-3 rounded bg-theme-bg-secondary border border-theme-border">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-theme-primary-500/10 flex items-center justify-center mr-3">
                            <RiCheckboxCircleLine
                              size={16}
                              className="text-theme-primary-500"
                            />
                          </div>
                          <div className="text-sm font-medium">
                            Order Dispatched
                          </div>
                        </div>
                        <div className="text-xs text-theme-text-muted">
                          Just now
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded bg-theme-bg-secondary border border-theme-border">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-theme-accent-500/10 flex items-center justify-center mr-3">
                            <RiCheckboxCircleLine
                              size={16}
                              className="text-theme-accent-500"
                            />
                          </div>
                          <div className="text-sm font-medium">
                            System Alert
                          </div>
                        </div>
                        <div className="text-xs text-theme-text-muted">
                          12s ago
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded bg-theme-bg-secondary border border-theme-border opacity-50">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-theme-primary-500/10 flex items-center justify-center mr-3">
                            <RiCheckboxCircleLine
                              size={16}
                              className="text-theme-text-muted"
                            />
                          </div>
                          <div className="text-sm font-medium">User Login</div>
                        </div>
                        <div className="text-xs text-theme-text-muted">
                          1m ago
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-theme-text-primary">
                  Versatile delivery for any product logic.
                </h2>
                <div className="space-y-6 mt-10">
                  <div className="flex items-start">
                    <div className="w-10 h-10 mt-1 rounded-full bg-theme-bg-secondary border border-theme-border flex items-center justify-center flex-shrink-0 mr-4">
                      <div className="w-2 h-2 rounded-full bg-theme-primary-500"></div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-theme-text-primary mb-2">
                        Transactional Alerts
                      </h4>
                      <p className="text-theme-text-secondary leading-relaxed">
                        Instantly reach mobile and desktop devices with critical
                        updates like payment receipts, shipping statuses, or
                        two-factor authentication prompts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-10 h-10 mt-1 rounded-full bg-theme-bg-secondary border border-theme-border flex items-center justify-center flex-shrink-0 mr-4">
                      <div className="w-2 h-2 rounded-full bg-theme-accent-500"></div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-theme-text-primary mb-2">
                        Silent Background Sync
                      </h4>
                      <p className="text-theme-text-secondary leading-relaxed">
                        Deliver invisible data payloads that trigger your
                        front-end application to silently re-fetch API data or
                        update local state without notifying the user.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-10 h-10 mt-1 rounded-full bg-theme-bg-secondary border border-theme-border flex items-center justify-center flex-shrink-0 mr-4">
                      <div className="w-2 h-2 rounded-full bg-theme-primary-500"></div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-theme-text-primary mb-2">
                        Marketing Broadcasts
                      </h4>
                      <p className="text-theme-text-secondary leading-relaxed">
                        Target custom groups and segments with feature releases,
                        promotional campaigns, and rich media announcements with
                        actionable tap links.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 overflow-hidden border-t border-theme-border bg-black/5 dark:bg-white/5">
          <motion.div
            className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-theme-text-primary">
              Ready to ship faster?
            </h2>
            <p className="text-xl text-theme-text-secondary mb-10 max-w-2xl mx-auto">
              Join development teams building the next generation of highly
              interactive, real-time web applications.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/signup"
                className="px-8 py-4 bg-theme-primary-500 dark:bg-theme-primary-600 text-white hover:bg-theme-primary-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity w-full sm:w-auto shadow-lg flex items-center justify-center"
              >
                Create Hub Account
                <RiArrowRightLine size={18} className="ml-2" />
              </Link>
              <Link
                to="/docs"
                className="px-8 py-4 border border-theme-border bg-theme-bg-primary text-theme-text-primary rounded-xl font-bold text-lg hover:bg-theme-bg-muted transition-colors w-full sm:w-auto"
              >
                Read Specification
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Advanced Footer */}
        <footer className="bg-theme-bg-primary pt-16 pb-8 border-t border-theme-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <div className="col-span-2 lg:col-span-2">
                <div className="flex items-center space-x-2 mb-6 text-lg font-display font-bold">
                  <div className="w-6 h-6 bg-theme-primary-500 rounded flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </div>
                  <span>Vibe Message</span>
                </div>
                <p className="text-theme-text-secondary mb-6 max-w-xs leading-relaxed">
                  Enterprise push notification engine architected to empower
                  developers building realtime network applications.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="mailto:service@sailorlabs.in"
                    className="text-theme-text-muted hover:text-theme-text-primary transition-colors text-sm font-medium"
                  >
                    Contact Support
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-theme-text-primary mb-4">
                  Product
                </h4>
                <ul className="space-y-3 text-sm text-theme-text-secondary">
                  <li>
                    <Link
                      to="/login"
                      className="hover:text-theme-primary-500 transition-colors"
                    >
                      Dashboard Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/signup"
                      className="hover:text-theme-primary-500 transition-colors"
                    >
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/docs"
                      className="hover:text-theme-primary-500 transition-colors"
                    >
                      Documentation
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-theme-text-primary mb-4">
                  Legal
                </h4>
                <ul className="space-y-3 text-sm text-theme-text-secondary">
                  <li>
                    <Link
                      to="/terms-of-service"
                      className="hover:text-theme-primary-500 transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/license"
                      className="hover:text-theme-primary-500 transition-colors"
                    >
                      License Agreement
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-theme-border flex flex-col md:flex-row justify-between items-center text-sm text-theme-text-muted">
              <div className="mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} SailorLabs.in All rights
                reserved.
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-theme-success"></div>
                <span>All backend services operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
