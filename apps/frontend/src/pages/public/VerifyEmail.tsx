import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-6xl w-full flex flex-col md:flex-row bg-theme-bg-secondary dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-theme-border overflow-hidden relative z-10 min-h-[600px]">
        {/* Left Side: Branding Panel */}
        <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-theme-primary-500/10 via-theme-primary-500/5 to-transparent p-12 flex-col justify-between overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: [0, 40, 0], y: [0, -40, 0], rotate: [0, 60, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-20 -left-20 w-96 h-96 bg-violet-500/20 rounded-full blur-[80px]"
            />
            <motion.div
              animate={{ x: [0, -40, 0], y: [0, 40, 0], rotate: [0, -60, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-10 -right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-[60px]"
            />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-theme-primary-500 to-theme-primary-600 flex items-center justify-center shadow-xl shadow-theme-primary-500/30 mb-8"
            >
              <RiMailCheckLine size={32} className="text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl lg:text-5xl font-black text-theme-text-primary tracking-tight leading-tight mb-4"
            >
              Email <br />
              Verification
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-theme-text-secondary leading-relaxed max-w-md"
            >
              Verify your email address to gain access to Vibe Message notification infrastructure.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative z-10 space-y-4 mt-12"
          >
            {[
              'Instant email activation',
              'Self-service verification link',
              'Safe and secure workflow',
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-sm w-max"
              >
                <RiCheckboxCircleFill size={20} className="text-theme-success" />
                <span className="font-bold text-theme-text-primary text-sm tracking-wide">
                  {feature}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side: Status UI */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md w-full mx-auto text-center space-y-6"
              >
                <RiLoader4Line size={48} className="animate-spin text-theme-primary-500 mx-auto" />
                <h2 className="text-2xl font-black text-theme-text-primary">Verifying email address...</h2>
                <p className="text-theme-text-secondary">
                  Please hold on while we validate your verification link with the server.
                </p>
              </motion.div>
            ) : success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="max-w-md w-full mx-auto text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30"
                >
                  <RiCheckboxCircleFill size={40} className="text-white" />
                </motion.div>

                <h2 className="text-3xl font-black text-theme-text-primary mb-4">
                  Account Verified!
                </h2>
                <p className="text-theme-text-secondary text-lg leading-relaxed mb-8">
                  Your email has been verified successfully. You are now ready to log in and start using your Vibe Message dashboard.
                </p>

                <Link
                  to="/login"
                  className="w-full py-4 bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-theme-primary-600 hover:to-theme-primary-700 transition-all shadow-lg shadow-theme-primary-500/20"
                >
                  <RiArrowLeftLine size={18} />
                  Go to Sign In
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="failure"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="max-w-md w-full mx-auto text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mx-auto mb-6"
                >
                  <RiErrorWarningLine size={40} />
                </motion.div>

                <h2 className="text-3xl font-black text-red-600 dark:text-red-400 mb-4">
                  Verification Failed
                </h2>
                <p className="text-theme-text-secondary text-lg leading-relaxed mb-8">
                  {errorMessage}
                </p>

                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="w-full py-4 bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-theme-primary-600 hover:to-theme-primary-700 transition-all shadow-lg shadow-theme-primary-500/20"
                  >
                    <RiArrowLeftLine size={18} />
                    Back to Sign In
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
