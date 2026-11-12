import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import ApiRequest from '../../services/ApiRequest';
import {
  RiErrorWarningLine,
  RiLoader4Line,
  RiCheckboxCircleFill,
  RiArrowLeftLine,
  RiMailCheckLine,
} from '@remixicon/react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setErrorMessage('Verification token is missing. Please check your link.');
        return;
      }

      try {
        setLoading(true);
        setErrorMessage('');
        await ApiRequest('/auth/verify-email', 'post', { token }, false);
        setSuccess(true);
      } catch (err: any) {
        setSuccess(false);
        setErrorMessage(
          err.response?.data?.message || 'Verification failed. The link may have expired.'
        );
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token]);

  const easeOut = [0.23, 1, 0.32, 1] as const;

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <motion.div
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: easeOut }}
        className="max-w-5xl w-full flex flex-col md:flex-row bg-theme-bg-secondary rounded-2xl sm:rounded-3xl shadow-xl border border-theme-border overflow-hidden relative z-10"
      >
        {/* Left Side: Branding Panel */}
        <div className="hidden md:flex md:w-5/12 relative bg-theme-bg-muted/70 p-10 lg:p-12 flex-col justify-between border-r border-theme-border overflow-hidden">
          <div className="relative z-10 space-y-4">
            <motion.div
              initial={{ scale: shouldReduceMotion ? 1 : 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="w-12 h-12 rounded-xl bg-theme-primary-500/10 border border-theme-primary-500/20 flex items-center justify-center mb-6"
            >
              <RiMailCheckLine size={24} className="text-theme-primary-500" />
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-theme-text-primary tracking-tight leading-tight">
              Email <br />
              Verification
            </h2>
            <p className="text-sm lg:text-base text-theme-text-secondary leading-relaxed">
              Verify your email address to gain access to Vibe Message notification infrastructure.
            </p>
          </div>

          <div className="relative z-10 space-y-3 mt-10">
            {[
              'Instant email activation',
              'Self-service verification link',
              'Safe and secure workflow',
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : 0.2 + idx * 0.08, ease: easeOut }}
                whileHover={shouldReduceMotion ? undefined : { x: 3 }}
                className="flex items-center gap-3 bg-theme-bg-secondary border border-theme-border px-4 py-3 rounded-xl shadow-2xs"
              >
                <RiCheckboxCircleFill size={18} className="text-theme-success shrink-0" />
                <span className="font-semibold text-theme-text-primary text-xs tracking-wide">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Status UI */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative bg-theme-bg-secondary">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                className="max-w-md w-full mx-auto text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-theme-primary-500/10 border border-theme-primary-500/20 flex items-center justify-center mx-auto text-theme-primary-500">
                  <RiLoader4Line size={28} className="animate-spin" />
                </div>
                <h2 className="text-2xl font-display font-bold text-theme-text-primary">
                  Verifying email address...
                </h2>
                <p className="text-sm text-theme-text-secondary leading-relaxed">
                  Please hold on while we validate your verification link with the server.
                </p>
              </motion.div>
            ) : success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="max-w-md w-full mx-auto text-center"
              >
                <motion.div
                  initial={{ scale: shouldReduceMotion ? 1 : 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                  className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-500"
                >
                  <RiCheckboxCircleFill size={32} />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-theme-text-primary mb-3">
                  Account Verified!
                </h2>
                <p className="text-sm sm:text-base text-theme-text-secondary leading-relaxed mb-8">
                  Your email has been verified successfully. You are now ready to log in and start
                  using your Vibe Message dashboard.
                </p>

                <Link
                  to="/login"
                  className="w-full py-3 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                >
                  <RiArrowLeftLine size={16} />
                  <span>Go to Sign In</span>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="failure"
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="max-w-md w-full mx-auto text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-red-500">
                  <RiErrorWarningLine size={32} />
                </div>

                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-red-600 dark:text-red-400 mb-3">
                  Verification Failed
                </h2>
                <p className="text-sm sm:text-base text-theme-text-secondary leading-relaxed mb-8">
                  {errorMessage}
                </p>

                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="w-full py-3 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <RiArrowLeftLine size={16} />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
