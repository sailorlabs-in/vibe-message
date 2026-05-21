import { Link } from "react-router-dom";
import { useHealthStatus } from "../../hooks/useHealthStatus";

export default function Footer() {
  const health = useHealthStatus();
  return (
    <footer className="bg-theme-bg-primary pt-16 pb-8 border-t border-theme-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6 text-lg font-display font-bold">
              <img src="/favicon.png" alt="Vibe Message Logo" className="w-6 h-6 object-contain" />
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
            <h4 className="font-bold text-theme-text-primary mb-4">Product</h4>
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
            <h4 className="font-bold text-theme-text-primary mb-4">Legal</h4>
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
            &copy; {new Date().getFullYear()} SailorLabs.in All rights reserved.
          </div>
          <div className="flex items-center space-x-2">
            {health.status === "loading" && (
              <>
                <div className="w-2 h-2 rounded-full bg-theme-text-muted animate-pulse" />
                <span>Checking services…</span>
              </>
            )}
            {health.status === "ok" && (
              <>
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-theme-success" />
                </div>
                <span>
                  All services operational
                  {health.checks?.server?.uptimeHuman && (
                    <span className="ml-1 opacity-60">
                      · up {health.checks.server.uptimeHuman}
                    </span>
                  )}
                </span>
              </>
            )}
            {health.status === "degraded" && (
              <>
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span>Some services degraded</span>
              </>
            )}
            {health.status === "error" && (
              <>
                <div className="w-2 h-2 rounded-full bg-theme-error" />
                <span>Backend unreachable</span>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
