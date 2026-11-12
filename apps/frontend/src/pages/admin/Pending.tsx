import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  RiMailSendLine,
  RiArrowLeftLine,
  RiLoader4Line,
  RiCheckboxCircleFill,
} from '@remixicon/react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logoutUser } from '../../store/slices/authSlice';
import ApiRequest from '../../services/ApiRequest';
import toast from 'react-hot-toast';

export const Pending: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleResend = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      await ApiRequest('/auth/resend-verification', 'post', { email: user.email }, false);
      setResent(true);
      toast.success('Verification email resent successfully!');
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const easeOut = [0.23, 1, 0.32, 1] as const;

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <motion.div
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: easeOut }}
        className="max-w-xl w-full bg-theme-bg-secondary rounded-2xl sm:rounded-3xl shadow-xl border border-theme-border p-8 sm:p-12 text-center relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: easeOut }}
        >
          {/* Status Icon */}
          <motion.div
            initial={{ scale: shouldReduceMotion ? 1 : 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6 text-amber-500"
          >
            <RiMailSendLine size={32} />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-theme-text-primary mb-3">
            Verify Your Email
          </h2>

          <p className="text-sm sm:text-base text-theme-text-secondary leading-relaxed mb-8 max-w-md mx-auto">
            We've sent a verification link to{' '}
            <strong className="text-theme-text-primary font-semibold">{user?.email}</strong>. Please
            check your inbox and click the link to activate your account.
          </p>

          <div className="flex flex-col items-center gap-3 mb-8 max-w-xs mx-auto">
            <motion.button
              whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleResend}
              disabled={resending || resent}
              className="w-full py-3 px-5 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md hover:shadow-theme-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {resending ? (
                <>
                  <RiLoader4Line size={18} className="animate-spin" />
                  <span>Resending Link...</span>
                </>
              ) : resent ? (
                <>
                  <RiCheckboxCircleFill size={18} className="text-white" />
                  <span>Resent Successfully!</span>
                </>
              ) : (
                <>
                  <RiMailSendLine size={18} />
                  <span>Resend Verification Email</span>
                </>
              )}
            </motion.button>
          </div>

          <div className="pt-6 border-t border-theme-border">
            <button
              onClick={() => dispatch(logoutUser())}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-theme-text-muted hover:text-theme-text-primary transition-colors cursor-pointer"
            >
              <RiArrowLeftLine size={16} />
              <span>Return to Login</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
