import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { forgotPassword, clearError } from '../../store/slices/authSlice';
import {
  RiErrorWarningLine,
  RiLoader4Line,
  RiMailSendLine,
  RiArrowLeftLine,
  RiCheckboxCircleFill,
  RiMailLine,
} from '@remixicon/react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) {
      setSubmitted(true);
    }
  };

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
              <RiMailSendLine size={24} className="text-theme-primary-500" />
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-theme-text-primary tracking-tight leading-tight">
              Forgot your <br />
              password?
            </h2>
            <p className="text-sm lg:text-base text-theme-text-secondary leading-relaxed">
              No worries — it happens to the best of us. Enter your email and we'll send you a
              secure reset link valid for 15 minutes.
            </p>
          </div>

          <div className="relative z-10 space-y-3 mt-10">
            {[
              'One-time secure reset link',
              'Expires in 15 minutes',
              'Token invalidated after use',
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

        {/* Right Side: Form / Success */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative bg-theme-bg-secondary">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                transition={{ duration: 0.25, ease: easeOut }}
                className="max-w-md w-full mx-auto"
              >
                <div className="text-left mb-8">
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-theme-text-primary mb-2">
                    Reset Password
                  </h2>
                  <p className="text-theme-text-secondary text-sm sm:text-base">
                    Enter your account email address.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-3.5 rounded-xl border border-red-500/20 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                      <RiErrorWarningLine size={18} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-xs font-semibold text-theme-text-primary mb-1.5"
                    >
                      Email address
                    </label>
                    <input
                      type="email"
                      id="forgot-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500/40 focus:border-theme-primary-500 transition-all text-sm"
                      placeholder="name@company.com"
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md hover:shadow-theme-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RiLoader4Line size={18} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <RiMailSendLine size={18} />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-8 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-theme-text-secondary hover:text-theme-primary-500 transition-colors"
                  >
                    <RiArrowLeftLine size={16} />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </motion.div>
            ) : (
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
                  <RiMailLine size={28} />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-theme-text-primary mb-3">
                  Check your inbox
                </h2>
                <p className="text-theme-text-secondary text-sm sm:text-base leading-relaxed mb-2">
                  If <span className="font-bold text-theme-text-primary">{email}</span> is
                  associated with an account, you'll receive a password reset link shortly.
                </p>
                <p className="text-theme-text-muted text-xs mb-8">
                  The link expires in <strong>15 minutes</strong> and can only be used once.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail('');
                      dispatch(clearError());
                    }}
                    className="w-full py-2.5 border border-theme-border text-theme-text-primary rounded-xl font-semibold text-sm hover:bg-theme-bg-muted transition-colors active:scale-[0.98]"
                  >
                    Try a different email
                  </button>
                  <Link
                    to="/login"
                    className="w-full py-2.5 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
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
