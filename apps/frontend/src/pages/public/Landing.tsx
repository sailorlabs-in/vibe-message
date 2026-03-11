import { Link } from "react-router-dom";
import { motion } from "motion/react";

export const Landing: React.FC = () => {
  // Remove the old state-based visibility transition
  // We'll use framer-motion instead

  return (
    <div className="min-h-screen text-theme-text-primary selection:bg-theme-primary-500/30 font-sans overflow-x-hidden transition-colors duration-300">
      {/* Background is now handled globally in App.tsx */}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center space-x-2 bg-theme-primary-500/10 border border-theme-primary-500/20 dark:border-theme-primary-500/5 rounded-full px-4 py-2 mb-8 backdrop-blur-sm cursor-default hover:bg-theme-primary-500/20 transition-all">
            <span className="flex h-2 w-2 rounded-full bg-theme-primary-500 animate-pulse border border-theme-primary-400"></span>
            <span className="text-sm font-medium text-theme-primary-600 dark:text-theme-primary-400">
              Vibe Message Engine v1.0 is live
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            <span className="block text-theme-text-primary">Next-Gen Push</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-theme-primary-600 dark:from-theme-primary-500 via-theme-accent-500 dark:via-theme-accent-400 to-theme-primary-600 dark:to-theme-primary-400">
              Notifications Infrastructure.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-theme-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
            A powerful, enterprise-grade notification backend designed for
            modern web applications. Deliver instant, reliable messages with
            absolute precision and security.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup"
              className="group relative px-8 py-4 bg-theme-primary-600 text-white rounded-xl font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.6)] w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative flex items-center justify-center">
                Start Building Free
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
            </Link>

            <Link
              to="/docs"
              className="group px-8 py-4 bg-theme-bg-muted border border-theme-border text-theme-text-primary rounded-xl font-bold text-lg backdrop-blur-md transition-all hover:bg-theme-border w-full sm:w-auto flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2 text-theme-text-muted group-hover:text-theme-text-primary transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Explore Documentation
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Dashboard Preview / Mockup Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-32">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative rounded-2xl overflow-hidden bg-theme-bg-secondary border border-theme-border shadow-2xl shadow-theme-primary-500/10 dark:shadow-theme-primary-500/5">
            <div className="flex items-center px-4 py-3 bg-theme-bg-muted border-b border-theme-border">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="mx-auto bg-theme-bg-primary rounded-md px-4 py-1.5 text-xs text-theme-text-secondary font-mono flex items-center shadow-sm">
                <svg
                  className="w-3 h-3 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                vibemessage.sailorlabs.in/api
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 lg:p-10 bg-theme-bg-primary">
              <div className="col-span-1 border border-theme-border bg-theme-bg-secondary rounded-xl p-6 shadow-sm">
                <div className="text-theme-text-muted text-sm font-medium mb-1">
                  Total Sent
                </div>
                <div className="text-4xl font-bold text-theme-text-primary mb-4">
                  124.5K
                </div>
                <div className="h-2 bg-theme-bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-theme-primary-500 w-3/4"></div>
                </div>
                <div className="mt-2 text-xs text-theme-primary-600 dark:text-theme-primary-400 font-medium">
                  +12.5% this week
                </div>
              </div>
              <div className="col-span-1 border border-theme-border bg-theme-bg-secondary rounded-xl p-6 shadow-sm">
                <div className="text-theme-text-muted text-sm font-medium mb-1">
                  Delivery Rate
                </div>
                <div className="text-4xl font-bold text-theme-text-primary mb-4">
                  99.8%
                </div>
                <div className="h-2 bg-theme-bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-theme-success w-[99%]"></div>
                </div>
                <div className="mt-2 text-xs text-theme-success font-medium">
                  Industry leading
                </div>
              </div>
              <div className="col-span-1 border border-theme-border bg-theme-bg-secondary rounded-xl p-6 shadow-sm">
                <div className="text-theme-text-muted text-sm font-medium mb-1">
                  Avg Latency
                </div>
                <div className="text-4xl font-bold text-theme-text-primary mb-4">
                  42ms
                </div>
                <div className="h-2 bg-theme-bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-theme-accent-500 w-1/4"></div>
                </div>
                <div className="mt-2 text-xs text-theme-accent-500 font-medium">
                  Lightning fast
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-theme-bg-primary via-transparent to-transparent pointer-events-none opacity-50 dark:opacity-100"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative overflow-hidden bg-theme-bg-secondary border-t border-theme-border">
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-theme-border to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-20"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-theme-primary-600 dark:text-theme-primary-400 uppercase mb-3">
              Enterprise Grade
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold mb-6 text-theme-text-primary">
              Everything you need to deliver.
            </h3>
            <p className="text-theme-text-secondary text-lg">
              We've handled the complex infrastructure so you can focus on
              building your application's core product.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              className="group bg-theme-bg-primary border border-theme-border rounded-2xl p-8 hover:bg-theme-bg-secondary hover:border-theme-primary-500/50 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-14 h-14 bg-theme-primary-100 rounded-xl flex items-center justify-center mb-6 text-theme-primary-600 dark:text-theme-primary-400 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7"
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
              <h4 className="text-xl font-bold text-theme-text-primary mb-3">
                Frictionless SDK
              </h4>
              <p className="text-theme-text-secondary leading-relaxed">
                Plug-and-play JavaScript SDK alongside a robust REST API. From
                zero to your first push notification in under 5 minutes.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="group bg-theme-bg-primary border border-theme-border rounded-2xl p-8 hover:bg-theme-bg-secondary hover:border-theme-primary-500/50 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-14 h-14 bg-theme-primary-100 rounded-xl flex items-center justify-center mb-6 text-theme-primary-600 dark:text-theme-primary-400 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-theme-text-primary mb-3">
                Multi-Tenant Vault
              </h4>
              <p className="text-theme-text-secondary leading-relaxed">
                App-scoped environments with rotating secret keys. Backed by a
                strict super-admin approval workflow to guarantee absolute
                security.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="group bg-theme-bg-primary border border-theme-border rounded-2xl p-8 hover:bg-theme-bg-secondary hover:border-theme-primary-500/50 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="w-14 h-14 bg-theme-accent-100 rounded-xl flex items-center justify-center mb-6 text-theme-accent-500 dark:text-theme-accent-400 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-theme-text-primary mb-3">
                Telemetry Engine
              </h4>
              <p className="text-theme-text-secondary leading-relaxed">
                Granular, real-time analytics. Monitor delivery status, manage
                device registries, and track notification health instantly.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              className="group bg-theme-bg-primary border border-theme-border rounded-2xl p-8 hover:bg-theme-bg-secondary hover:border-theme-primary-500/50 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-14 h-14 bg-theme-primary-100 rounded-xl flex items-center justify-center mb-6 text-theme-primary-600 dark:text-theme-primary-400 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-theme-text-primary mb-3">
                Silent Payloads
              </h4>
              <p className="text-theme-text-secondary leading-relaxed">
                Send rich graphical notifications to engage users, or dispatch
                data-only silent pushes to sync application state in the
                background.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              className="group bg-theme-bg-primary border border-theme-border rounded-2xl p-8 hover:bg-theme-bg-secondary hover:border-theme-primary-500/50 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="w-14 h-14 bg-theme-accent-100 rounded-xl flex items-center justify-center mb-6 text-theme-accent-500 dark:text-theme-accent-400 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-theme-text-primary mb-3">
                Precision Targeting
              </h4>
              <p className="text-theme-text-secondary leading-relaxed">
                Hyper-specific routing. Broadcast globally to millions, or
                target individual devices and custom user-groups seamlessly.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              className="group bg-theme-bg-primary border border-theme-border rounded-2xl p-8 hover:bg-theme-bg-secondary hover:border-theme-primary-500/50 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="w-14 h-14 bg-theme-primary-100 rounded-xl flex items-center justify-center mb-6 text-theme-primary-600 dark:text-theme-primary-400 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-theme-text-primary mb-3">
                Hyper-Scale Core
              </h4>
              <p className="text-theme-text-secondary leading-relaxed">
                Architected on Node.js and heavily optimized PostgreSQL. Built
                specifically to handle immense throughput without bottlenecking.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-24 bg-theme-bg-primary relative border-t border-theme-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-theme-text-primary">
                From setup to deployment in{" "}
                <span className="text-theme-primary-500 dark:text-theme-primary-400">
                  four steps.
                </span>
              </h2>

              <div className="space-y-8">
                <div className="flex">
                  <div className="flex flex-col items-center mr-6 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-theme-primary-600 flex items-center justify-center font-bold text-white shadow-lg shadow-theme-primary-500/30 z-10">
                      1
                    </div>
                    <div className="w-px h-full bg-theme-border my-2"></div>
                  </div>
                  <div className="pb-8">
                    <h3 className="text-xl font-bold text-theme-text-primary mb-2">
                      Initialize Account
                    </h3>
                    <p className="text-theme-text-secondary">
                      Register on the platform. Enterprise access is manually
                      verified by super-admins to ensure network integrity.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex flex-col items-center mr-6 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-theme-primary-600 flex items-center justify-center font-bold text-white shadow-lg shadow-theme-primary-500/30 z-10">
                      2
                    </div>
                    <div className="w-px h-full bg-theme-border my-2"></div>
                  </div>
                  <div className="pb-8">
                    <h3 className="text-xl font-bold text-theme-text-primary mb-2">
                      Generate Credentials
                    </h3>
                    <p className="text-theme-text-secondary">
                      Create your App instance to provision securely encrypted
                      App IDs and API Secret Keys.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex flex-col items-center mr-6 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-theme-primary-600 flex items-center justify-center font-bold text-white shadow-lg shadow-theme-primary-500/30 z-10">
                      3
                    </div>
                    <div className="w-px h-full bg-theme-border my-2"></div>
                  </div>
                  <div className="pb-8">
                    <h3 className="text-xl font-bold text-theme-text-primary mb-2">
                      Install Client SDK
                    </h3>
                    <p className="text-theme-text-secondary">
                      Drop the JS SDK into your frontend code. We handle service
                      workers and token registration automatically.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex flex-col items-center mr-6 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-theme-primary-600 flex items-center justify-center font-bold text-white shadow-lg shadow-theme-primary-500/30 z-10">
                      4
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-theme-text-primary mb-2">
                      Trigger Payloads
                    </h3>
                    <p className="text-theme-text-secondary">
                      Invoke the REST API from your backend servers to instantly
                      route push notifications globally.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-theme-primary-500 to-theme-accent-500 rounded-2xl blur-lg opacity-20"></div>
              <div className="relative bg-theme-bg-secondary border border-theme-border rounded-xl p-6 shadow-2xl">
                <div className="flex items-center space-x-2 mb-4 b-border-white/10 pb-4 border-b border-theme-border">
                  <div className="text-theme-text-muted font-mono text-sm">
                    bash
                  </div>
                </div>
                <pre className="font-mono text-sm overflow-x-auto text-theme-text-secondary">
                  <code>
                    <span className="text-theme-accent-500 opacity-90">
                      POST
                    </span>{" "}
                    <span className="text-theme-success dark:text-theme-success">
                      /api/v1/messages/send
                    </span>
                    <br />
                    <br />
                    <span className="text-theme-text-primary">Headers:</span>
                    <br />
                    Authorization: Bearer sk_live_...
                    <br />
                    <br />
                    <span className="text-theme-text-primary">Body:</span>
                    <br />
                    {"{"}
                    <br />
                    &nbsp;&nbsp;
                    <span className="text-theme-primary-500">
                      "target"
                    </span>:{" "}
                    <span className="text-theme-warning opacity-90">
                      "usr_12345"
                    </span>
                    ,<br />
                    &nbsp;&nbsp;
                    <span className="text-theme-primary-500">
                      "notification"
                    </span>
                    : {"{"}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-theme-primary-500">
                      "title"
                    </span>:{" "}
                    <span className="text-theme-warning opacity-90">
                      "Payment Received"
                    </span>
                    ,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-theme-primary-500">"body"</span>:{" "}
                    <span className="text-theme-warning opacity-90">
                      "You have received $500.00"
                    </span>
                    <br />
                    &nbsp;&nbsp;{"}"}
                    <br />
                    {"}"}
                  </code>
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden bg-theme-primary-500/10 dark:bg-theme-bg-secondary">
        <div className="absolute inset-0 bg-theme-primary-500 mix-blend-multiply opacity-5 dark:opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-theme-border to-transparent"></div>

        <motion.div
          className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-theme-text-primary">
            Build the future of communication.
          </h2>
          <p className="text-xl text-theme-text-secondary mb-10 max-w-2xl mx-auto">
            Stop worrying about device tokens and delivery rates. Start scaling
            your application today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup"
              className="btn-primary px-8 py-4 text-lg hover:scale-105 transition-transform w-full sm:w-auto shadow-xl shadow-theme-primary-500/20"
            >
              Create Hub Account
            </Link>
            <Link
              to="/docs"
              className="btn-secondary px-8 py-4 text-lg hover:bg-theme-bg-muted transition-all w-full sm:w-auto"
            >
              Read Documentation
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-theme-bg-secondary py-12 border-t border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-theme-text-secondary">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Vibe Message. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link
              to="/terms-of-service"
              className="hover:text-theme-text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/license"
              className="hover:text-theme-text-primary transition-colors"
            >
              License
            </Link>
            <a
              href="mailto:service@sailorlabs.in"
              className="hover:text-theme-text-primary transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
