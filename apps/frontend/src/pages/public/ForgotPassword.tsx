import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
  };

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
              <RiMailSendLine size={32} className="text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl lg:text-5xl font-black text-theme-text-primary tracking-tight leading-tight mb-4"
            >
              Forgot your <br />
              password?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-theme-text-secondary leading-relaxed max-w-md"
            >
              No worries — it happens to the best of us. Enter your email and we'll send you a
              secure reset link valid for 15 minutes.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative z-10 space-y-4 mt-12"
          >
            {[
              'One-time secure reset link',
              'Expires in 15 minutes',
              'Token invalidated after use',
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

        {/* Right Side: Form / Success */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                className="max-w-md w-full mx-auto"
              >
                <motion.div variants={itemVariants} className="text-left mb-10">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-theme-text-primary mb-3">
                    Reset Password
                  </h2>
                  <p className="text-theme-text-secondary font-medium text-lg">
                    Enter your account email address.
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-red-500/10 text-red-500 dark:text-red-400 p-4 rounded-2xl border border-red-500/20 text-sm font-bold flex items-center gap-3 backdrop-blur-md"
                    >
                      <RiErrorWarningLine size={20} className="shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants} className="relative group">
                    <input
                      type="email"
                      id="forgot-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-theme-bg-muted dark:bg-slate-800/50 text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all placeholder-transparent peer backdrop-blur-sm"
                      placeholder="Email"
                      required
                    />
                    <label
                      htmlFor="forgot-email"
                      className="absolute left-5 top-4 text-theme-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:font-bold peer-focus:bg-white dark:peer-focus:bg-slate-900 px-2 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:font-bold peer-valid:bg-white dark:peer-valid:bg-slate-900 pointer-events-none rounded-full shadow-sm shadow-black/5 opacity-0 peer-valid:opacity-100 peer-focus:opacity-100"
                    >
                      Email address
                    </label>
                    <span className="absolute left-5 top-4 text-theme-text-secondary peer-focus:opacity-0 peer-valid:opacity-0 transition-opacity pointer-events-none">
                      Email address
                    </span>
                  </motion.div>

                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 mt-2 bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 hover:from-theme-primary-600 hover:to-theme-primary-700 text-white rounded-2xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-theme-primary-500/30"
                  >
                    {loading ? (
                      <>
                        <RiLoader4Line size={22} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RiMailSendLine size={20} />
                        Send Reset Link
                      </>
                    )}
                  </motion.button>
                </form>

                <motion.div variants={itemVariants} className="mt-10 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-theme-text-secondary font-medium hover:text-theme-primary-500 transition-colors"
                  >
                    <RiArrowLeftLine size={18} />
                    Back to Sign In
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="max-w-md w-full mx-auto text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30"
                >
                  <RiMailLine size={36} className="text-white" />
                </motion.div>

                <h2 className="text-3xl font-black text-theme-text-primary mb-4">
                  Check your inbox
                </h2>
                <p className="text-theme-text-secondary text-lg leading-relaxed mb-2">
                  If <span className="font-bold text-theme-text-primary">{email}</span> is
                  associated with an account, you'll receive a password reset link shortly.
                </p>
                <p className="text-theme-text-muted text-sm mb-10">
                  The link expires in <strong>15 minutes</strong> and can only be used once.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail('');
                      dispatch(clearError());
                    }}
                    className="w-full py-3.5 border-2 border-theme-border text-theme-text-primary rounded-2xl font-bold hover:border-theme-primary-500 hover:text-theme-primary-500 transition-all"
                  >
                    Try a different email
                  </button>
                  <Link
                    to="/login"
                    className="w-full py-3.5 bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-theme-primary-600 hover:to-theme-primary-700 transition-all shadow-lg shadow-theme-primary-500/20"
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
