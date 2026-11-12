import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useSystem } from '../../context/SystemContext';

export const TermsOfService: React.FC = () => {
  const { isSelfHosted } = useSystem();

  useEffect(() => {
    if (isSelfHosted) {
      window.location.replace('https://vibemessage.sailorlabs.in/terms-of-service');
    }
  }, [isSelfHosted]);

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-bg-secondary border border-theme-border text-xs font-mono font-semibold text-theme-text-muted mb-4 shadow-2xs">
              <span>TERMS & POLICIES</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-3 tracking-tight text-theme-text-primary">
              Terms of Service
            </h1>
            <p className="text-base sm:text-lg text-theme-text-secondary">
              Vibe-message Hosted Service Terms of Service
            </p>
            <p className="text-xs text-theme-text-muted mt-2 font-mono">Last Updated: 2026</p>
          </div>

          <div className="bg-theme-bg-secondary rounded-2xl sm:rounded-3xl shadow-xs border border-theme-border p-8 md:p-12 text-theme-text-secondary space-y-6 leading-relaxed">
            <div className="text-sm sm:text-base font-medium text-theme-text-primary border-l-2 border-theme-primary-500 pl-4 py-2 bg-theme-primary-500/5 rounded-r-xl">
              These Terms of Service govern the use of the hosted Vibe-message service operated by
              SailorLabs.in. By using the hosted service, you agree to the following terms.
            </div>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              1. Hosted Service Overview
            </h3>
            <p>
              The Vibe-message package may connect to a default hosted server operated by
              SailorLabs.in when no custom server URL is provided.
            </p>
            <p className="font-semibold text-theme-text-primary">
              This hosted service is provided primarily for:
            </p>
            <ul className="space-y-2.5 pl-1">
              {[
                'Students',
                'Educational use',
                'Personal projects',
                'Testing and experimentation',
                'Small applications',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-theme-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-primary-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              2. Infrastructure Limitations
            </h3>
            <p>
              The hosted service currently operates on limited infrastructure and is not designed
              for large-scale production workloads.
            </p>
            <p className="text-theme-text-primary font-medium">
              To maintain stability and availability for all users, SailorLabs.in may apply
              technical restrictions.
            </p>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              3. Rate Limits and Usage Restrictions
            </h3>
            <p>SailorLabs.in may enforce:</p>
            <ul className="space-y-2.5 pl-1">
              {[
                'API rate limits',
                'Usage quotas',
                'Account limits',
                'Traffic restrictions',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-theme-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-primary-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="text-sm font-semibold text-amber-600 dark:text-amber-400 border-l-2 border-amber-500 pl-4 py-1.5 bg-amber-500/5 rounded-r-xl">
              Users must not attempt to bypass these restrictions.
            </div>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              4. Commercial Usage
            </h3>
            <p>
              Commercial applications may use the hosted service for development or small-scale
              usage.
            </p>
            <p>
              Organizations requiring high reliability or large-scale production use are encouraged
              to deploy their own instance of the Vibe-message server.
            </p>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              5. Account Suspension
            </h3>
            <p>SailorLabs.in reserves the right to suspend or terminate service access if:</p>
            <ul className="space-y-2.5 pl-1">
              {[
                'Usage generates excessive system load',
                'Abuse or misuse of the platform occurs',
                'The service is used in a way that impacts system stability',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-theme-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-primary-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              6. Self-Hosting
            </h3>
            <p>Users are encouraged to run their own instance of the server if they require:</p>
            <ul className="space-y-2.5 pl-1">
              {[
                'Higher performance',
                'Full control over infrastructure',
                'Production-level reliability',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-theme-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-primary-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-theme-text-primary">
              Future containerized deployments (such as Docker images) may be provided to simplify
              self-hosting.
            </p>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              7. Service Availability
            </h3>
            <p>
              The hosted service is provided on a best-effort basis. SailorLabs.in does not
              guarantee uptime, availability, or long-term operation of the hosted server.
            </p>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              8. Changes to the Service
            </h3>
            <p>SailorLabs.in may modify, limit, or discontinue the hosted service at any time.</p>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              9. Contact
            </h3>
            <p>For questions regarding these terms, please contact SailorLabs.in.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
