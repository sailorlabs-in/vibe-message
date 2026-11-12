import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { systemService } from '../../services/systemService';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { loginUser, clearError } from '../../store/slices/authSlice';
import {
  RiErrorWarningLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiCheckboxCircleFill,
  RiShieldKeyholeLine,
} from '@remixicon/react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hideForgotPassword, setHideForgotPassword] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    systemService
      .getPublicSettings()
      .then((s) => {
        setHideForgotPassword(s.hide_forgot_password);
      })
      .catch(console.error);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const passwordResetSuccess = (location.state as any)?.passwordResetSuccess ?? false;

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      if (user.status === 'PENDING') {
        navigate('/pending');
      } else if (user.status === 'BANNED') {
        // Error will be shown from Redux state
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const easeOut = [0.23, 1, 0.32, 1] as const;

  const formContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: easeOut },
    },
  };

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
              <RiShieldKeyholeLine size={24} className="text-theme-primary-500" />
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-theme-text-primary tracking-tight leading-tight">
              Secure access <br />
              to your workspace.
            </h2>
            <p className="text-sm lg:text-base text-theme-text-secondary leading-relaxed">
              Log in to manage your messaging infrastructure, view real-time analytics, and
              configure delivery workflows.
            </p>
          </div>

          <div className="relative z-10 space-y-3 mt-10">
            {[
              'Enterprise-grade Security',
              'Real-time Delivery Analytics',
              'Multi-platform Gateway',
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

        {/* Right Side: Login Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative bg-theme-bg-secondary">
          <motion.div
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-md w-full mx-auto"
          >
            <motion.div variants={formItemVariants} className="text-left mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-theme-text-primary mb-2">
                Welcome Back
              </h2>
              <p className="text-theme-text-secondary text-sm sm:text-base">
                Please enter your details to sign in.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {passwordResetSuccess && (
                <motion.div
                  variants={formItemVariants}
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl border border-emerald-500/20 text-xs sm:text-sm font-semibold flex items-center gap-2.5"
                >
                  <RiCheckboxCircleFill size={18} className="shrink-0" />
                  <span>Password reset successfully! Please sign in with your new password.</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  variants={formItemVariants}
                  className="bg-red-500/10 text-red-600 dark:text-red-400 p-3.5 rounded-xl border border-red-500/20 text-xs sm:text-sm font-semibold flex items-center gap-2.5"
                >
                  <RiErrorWarningLine size={18} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                <motion.div variants={formItemVariants}>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-theme-text-primary mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500/40 focus:border-theme-primary-500 transition-all text-sm"
                    placeholder="name@company.com"
                    id="email"
                    required
                  />
                </motion.div>

                <motion.div variants={formItemVariants}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-theme-text-primary"
                    >
                      Password
                    </label>
                    {!hideForgotPassword && (
                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-theme-primary-500 hover:text-theme-primary-600 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-2.5 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500/40 focus:border-theme-primary-500 transition-all text-sm"
                      placeholder="••••••••"
                      id="password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-theme-text-muted hover:text-theme-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary-500 rounded-lg p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                    </button>
                  </div>
                </motion.div>
              </div>

              <motion.button
                variants={formItemVariants}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md hover:shadow-theme-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <RiLoader4Line size={18} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </motion.button>
            </form>

            <motion.div variants={formItemVariants} className="mt-8 text-center text-xs sm:text-sm text-theme-text-secondary">
              <span>Don't have an account? </span>
              <Link
                to="/signup"
                className="text-theme-primary-500 font-bold hover:underline transition-all"
              >
                Create one now
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
