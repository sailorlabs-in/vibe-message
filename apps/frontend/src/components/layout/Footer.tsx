import { Link } from 'react-router-dom';
import { useHealthStatus } from '../../hooks/useHealthStatus';
import { useSystem } from '../../context/SystemContext';
import { RiTerminalBoxLine, RiShieldCheckLine } from '@remixicon/react';

const ORIGINAL_DOCS_URL = 'https://vibemessage.sailorlabs.in/docs';

export default function Footer() {
  const health = useHealthStatus();
  const { isSelfHosted } = useSystem();

  return (
    <footer className="bg-theme-bg-primary pt-24 pb-12 border-t border-theme-border relative z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-12 mb-16">
          {/* Brand & Description Column */}
          <div className="col-span-2 space-y-4 pr-0 md:pr-6">
            <div className="flex items-center space-x-2.5 text-lg font-display font-bold">
              <div className="relative w-8 h-8 rounded-xl bg-theme-bg-secondary border border-theme-border flex items-center justify-center p-1.5 shadow-2xs">
                <img
                  src="/favicon.png"
                  alt="Vibe Message Logo"
                  className={`w-4 h-4 object-contain ${isSelfHosted ? 'brand-logo-img' : ''}`}
                />
              </div>
              <span className="text-theme-text-primary tracking-tight font-extrabold flex items-center gap-1">
                <span>Vibe</span>
                <span className="text-theme-primary-500">Message</span>
              </span>
              {isSelfHosted && (
                <span className="text-xs font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-theme-primary-500/10 text-theme-primary-500 border border-theme-primary-500/20">
                  Self-Hosted
                </span>
              )}
            </div>
            <p className="text-theme-text-secondary text-sm leading-relaxed max-w-sm">
              Lightweight, open-standard Web Push infrastructure and JavaScript SDK. Engineered for
              sub-50ms dispatch and absolute developer sovereignty.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-theme-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <RiShieldCheckLine size={14} className="text-theme-success" />
                <span>RFC 8030 VAPID</span>
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5">
                <RiTerminalBoxLine size={14} className="text-theme-primary-500" />
                <span>NPM: vibe-message</span>
              </span>
            </div>
          </div>

          {/* Column 1: Product & Docs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text-primary mb-4 font-mono">
              Developers
            </h4>
            <ul className="space-y-3 text-sm text-theme-text-secondary">
              <li>
                {isSelfHosted ? (
                  <a
                    href={ORIGINAL_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-theme-text-primary transition-colors inline-block"
                  >
                    SDK Documentation
                  </a>
                ) : (
                  <Link
                    to="/docs"
                    className="hover:text-theme-text-primary transition-colors inline-block"
                  >
                    SDK Documentation
                  </Link>
                )}
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/vibe-message"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-theme-text-primary transition-colors inline-block"
                >
                  NPM Registry
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Sailor-Labs/vibe-message"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-theme-text-primary transition-colors inline-block"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="mailto:service@sailorlabs.in"
                  className="hover:text-theme-text-primary transition-colors inline-block"
                >
                  Developer Support
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text-primary mb-4 font-mono">
              Platform
            </h4>
            <ul className="space-y-3 text-sm text-theme-text-secondary">
              <li>
                <Link
                  to="/login"
                  className="hover:text-theme-text-primary transition-colors inline-block"
                >
                  Engine Console
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="hover:text-theme-text-primary transition-colors inline-block"
                >
                  Create App Vault
                </Link>
              </li>
              <li>
                <a
                  href="https://vibemessage.sailorlabs.in/demo-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-theme-text-primary transition-colors inline-block"
                >
                  Interactive Demo
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & License */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text-primary mb-4 font-mono">
              Governance
            </h4>
            <ul className="space-y-3 text-sm text-theme-text-secondary">
              <li>
                {isSelfHosted ? (
                  <a
                    href="https://vibemessage.sailorlabs.in/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-theme-text-primary transition-colors inline-block"
                  >
                    Terms of Service
                  </a>
                ) : (
                  <Link
                    to="/terms-of-service"
                    className="hover:text-theme-text-primary transition-colors inline-block"
                  >
                    Terms of Service
                  </Link>
                )}
              </li>
              <li>
                {isSelfHosted ? (
                  <a
                    href="https://vibemessage.sailorlabs.in/license"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-theme-text-primary transition-colors inline-block"
                  >
                    License Agreement
                  </a>
                ) : (
                  <Link
                    to="/license"
                    className="hover:text-theme-text-primary transition-colors inline-block"
                  >
                    License Agreement
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Telemetry Status Bar & Copyright */}
        <div className="pt-8 border-t border-theme-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-theme-text-muted">
          <div>
            &copy; {new Date().getFullYear()} SailorLabs. Vibe Message open-standard infrastructure.
          </div>
          <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-theme-bg-secondary border border-theme-border shadow-2xs">
            {health.status === 'loading' && (
              <>
                <div className="w-2 h-2 rounded-full bg-theme-text-muted animate-pulse" />
                <span>Pinging telemetry cluster…</span>
              </>
            )}
            {health.status === 'ok' && (
              <>
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-theme-success" />
                </div>
                <span className="text-theme-text-primary font-medium">
                  Dispatch Cluster Operational
                  {health.checks?.server?.uptimeHuman && (
                    <span className="ml-1 text-theme-text-muted font-normal font-mono">
                      · {health.checks.server.uptimeHuman}
                    </span>
                  )}
                </span>
              </>
            )}
            {health.status === 'degraded' && (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-500 font-medium">Degraded Latency Detected</span>
              </>
            )}
            {health.status === 'error' && (
              <>
                <div className="w-2 h-2 rounded-full bg-theme-error" />
                <span className="text-theme-error font-medium">Telemetry Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
