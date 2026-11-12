import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { resetPassword, clearError } from '../../store/slices/authSlice';
import {
  RiErrorWarningLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiShieldCheckLine,
  RiArrowLeftLine,
  RiLockPasswordLine,
} from '@remixicon/react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const easeOut = [0.23, 1, 0.32, 1] as const;

  // If no token, show an error immediately
  if (!token) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="max-w-md w-full text-center bg-theme-bg-secondary rounded-2xl sm:rounded-3xl shadow-xl border border-theme-border p-10 sm:p-12"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <RiErrorWarningLine size={28} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-theme-text-primary mb-3">
            Invalid Link
          </h2>
          <p className="text-theme-text-secondary text-sm mb-8 leading-relaxed">
            This password reset link is invalid or missing. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center py-2.5 px-6 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-[0.98]"
          >
            Request Reset Link
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    const result = await dispatch(resetPassword({ token, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      navigate('/login', { state: { passwordResetSuccess: true } });
    }
  };

  const displayError = localError || error;

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
              <RiLockPasswordLine size={24} className="text-theme-primary-500" />
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-theme-text-primary tracking-tight leading-tight">
              Choose a new <br />
              password.
            </h2>
            <p className="text-sm lg:text-base text-theme-text-secondary leading-relaxed">
              Pick a strong, unique password for your Vibe-message account. Once set, the reset link
              will be invalidated automatically.
            </p>
          </div>

          <div className="relative z-10 space-y-3 mt-10">
            {['Minimum 6 characters', 'Token used only once', 'Existing sessions unaffected'].map(
              (feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : 0.2 + idx * 0.08, ease: easeOut }}
                  whileHover={shouldReduceMotion ? undefined : { x: 3 }}
                  className="flex items-center gap-3 bg-theme-bg-secondary border border-theme-border px-4 py-3 rounded-xl shadow-2xs"
                >
                  <RiShieldCheckLine size={18} className="text-theme-success shrink-0" />
                  <span className="font-semibold text-theme-text-primary text-xs tracking-wide">
                    {feature}
                  </span>
                </motion.div>
              )
            )}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative bg-theme-bg-secondary">
          <div className="max-w-md w-full mx-auto">
            <div className="text-left mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-theme-text-primary mb-2">
                New Password
              </h2>
              <p className="text-theme-text-secondary text-sm sm:text-base">
                Enter and confirm your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {displayError && (
                <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-3.5 rounded-xl border border-red-500/20 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                  <RiErrorWarningLine size={18} className="shrink-0" />
                  <span>{displayError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold text-theme-text-primary mb-1.5"
                >
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-2.5 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500/40 focus:border-theme-primary-500 transition-all text-sm"
                    placeholder="New password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-theme-text-muted hover:text-theme-text-primary transition-colors focus:outline-none"
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-semibold text-theme-text-primary mb-1.5"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-2.5 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500/40 focus:border-theme-primary-500 transition-all text-sm"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-theme-text-muted hover:text-theme-text-primary transition-colors focus:outline-none"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md hover:shadow-theme-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <RiLoader4Line size={18} className="animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <RiShieldCheckLine size={18} />
                    <span>Set New Password</span>
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
          </div>
        </div>
      </motion.div>
    </div>
  );
};
