import React from 'react';
import { motion } from 'motion/react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-theme-text-primary">
              Terms of Service
            </h1>
            <p className="text-lg text-theme-text-secondary">
              Vibe-message Hosted Service Terms of Service
            </p>
            <p className="text-sm text-theme-text-muted mt-2">Last Updated: 2026</p>
          </div>

          <div className="bg-theme-bg-secondary rounded-2xl shadow-xl shadow-theme-border/20 border border-theme-border p-8 md:p-12 text-theme-text-secondary space-y-6">
            <p className="text-lg font-medium text-theme-text-primary border-l-4 border-theme-primary-500 pl-4 py-2 bg-theme-primary-500/5">
              These Terms of Service govern the use of the hosted Vibe-message service operated by
              SailorLabs.in. By using the hosted service, you agree to the following terms.
            </p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              1. Hosted Service Overview
            </h3>
            <p>
              The Vibe-message package may connect to a default hosted server operated by
              SailorLabs.in when no custom server URL is provided.
            </p>
            <p className="mt-4">This hosted service is provided primarily for:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Students</li>
              <li>Educational use</li>
              <li>Personal projects</li>
              <li>Testing and experimentation</li>
              <li>Small applications</li>
            </ul>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              2. Infrastructure Limitations
            </h3>
            <p>
              The hosted service currently operates on limited infrastructure and is not designed
              for large-scale production workloads.
            </p>
            <p className="mt-2 text-theme-text-primary">
              To maintain stability and availability for all users, SailorLabs.in may apply
              technical restrictions.
            </p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              3. Rate Limits and Usage Restrictions
            </h3>
            <p>SailorLabs.in may enforce:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>API rate limits</li>
              <li>Usage quotas</li>
              <li>Account limits</li>
              <li>Traffic restrictions</li>
            </ul>
            <p className="mt-4 font-semibold text-theme-warning border-l-4 border-theme-warning pl-4">
              Users must not attempt to bypass these restrictions.
            </p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              4. Commercial Usage
            </h3>
            <p>
              Commercial applications may use the hosted service for development or small-scale
              usage.
            </p>
            <p className="mt-2">
              Organizations requiring high reliability or large-scale production use are encouraged
              to deploy their own instance of the Vibe-message server.
            </p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              5. Account Suspension
            </h3>
            <p>SailorLabs.in reserves the right to suspend or terminate service access if:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Usage generates excessive system load</li>
              <li>Abuse or misuse of the platform occurs</li>
              <li>The service is used in a way that impacts system stability</li>
            </ul>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">6. Self-Hosting</h3>
            <p>Users are encouraged to run their own instance of the server if they require:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Higher performance</li>
              <li>Full control over infrastructure</li>
              <li>Production-level reliability</li>
            </ul>
            <p className="mt-4 text-theme-text-primary">
              Future containerized deployments (such as Docker images) may be provided to simplify
              self-hosting.
            </p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              7. Service Availability
            </h3>
            <p>
              The hosted service is provided on a best-effort basis. SailorLabs.in does not
              guarantee uptime, availability, or long-term operation of the hosted server.
            </p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              8. Changes to the Service
            </h3>
            <p>SailorLabs.in may modify, limit, or discontinue the hosted service at any time.</p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">9. Contact</h3>
            <p>For questions regarding these terms, please contact SailorLabs.in.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
