import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { resetPassword, clearError } from "../../store/slices/authSlice";
import {
  RiErrorWarningLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiShieldCheckLine,
  RiArrowLeftLine,
  RiLockPasswordLine,
} from "@remixicon/react";

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // If no token, show an error immediately
  if (!token) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-theme-bg-secondary dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2rem] shadow-xl border border-theme-border p-12">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <RiErrorWarningLine size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-theme-text-primary mb-3">Invalid Link</h2>
          <p className="text-theme-text-secondary mb-8">
            This password reset link is invalid or missing. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 text-white rounded-2xl font-bold hover:from-theme-primary-600 hover:to-theme-primary-700 transition-all shadow-lg shadow-theme-primary-500/20"
          >
            Request Reset Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    const result = await dispatch(resetPassword({ token, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      navigate("/login", { state: { passwordResetSuccess: true } });
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
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-6xl w-full flex flex-col md:flex-row bg-theme-bg-secondary dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-theme-border overflow-hidden relative z-10 min-h-[600px]">
        {/* Left Side: Branding Panel */}
        <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-theme-primary-500/10 via-theme-primary-500/5 to-transparent p-12 flex-col justify-between overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: [0, 50, 0], y: [0, -50, 0], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -left-20 w-96 h-96 bg-violet-500/20 rounded-full blur-[80px]"
            />
            <motion.div
              animate={{ x: [0, -50, 0], y: [0, 50, 0], rotate: [0, -90, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-10 -right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[60px]"
            />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-theme-primary-500 to-theme-primary-600 flex items-center justify-center shadow-xl shadow-theme-primary-500/30 mb-8"
            >
              <RiLockPasswordLine size={32} className="text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl lg:text-5xl font-black text-theme-text-primary tracking-tight leading-tight mb-4"
            >
              Choose a new <br />
              password.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-theme-text-secondary leading-relaxed max-w-md"
            >
              Pick a strong, unique password for your Vibe-message account. Once
              set, the reset link will be invalidated automatically.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative z-10 space-y-4 mt-12"
          >
            {[
              "Minimum 6 characters",
              "Token used only once",
              "Existing sessions unaffected",
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-sm w-max"
              >
                <RiShieldCheckLine size={20} className="text-theme-success" />
                <span className="font-bold text-theme-text-primary text-sm tracking-wide">
                  {feature}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-md w-full mx-auto"
          >
            <motion.div variants={itemVariants} className="text-left mb-10">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-theme-text-primary mb-3">
                New Password
              </h2>
              <p className="text-theme-text-secondary font-medium text-lg">
                Enter and confirm your new password below.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-500/10 text-red-500 dark:text-red-400 p-4 rounded-2xl border border-red-500/20 text-sm font-bold flex items-center gap-3 backdrop-blur-md"
                >
                  <RiErrorWarningLine size={20} className="shrink-0" />
                  {displayError}
                </motion.div>
              )}

              <div className="space-y-5">
                {/* New Password */}
                <motion.div variants={itemVariants} className="relative group">
                  <input
                    type={showNew ? "text" : "password"}
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-5 pr-12 py-4 bg-theme-bg-muted dark:bg-slate-800/50 text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all placeholder-transparent peer backdrop-blur-sm"
                    placeholder="New password"
                    required
                    minLength={6}
                  />
                  <label
                    htmlFor="new-password"
                    className="absolute left-5 top-4 text-theme-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:font-bold peer-focus:bg-white dark:peer-focus:bg-slate-900 px-2 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:font-bold peer-valid:bg-white dark:peer-valid:bg-slate-900 pointer-events-none rounded-full shadow-sm shadow-black/5 opacity-0 peer-valid:opacity-100 peer-focus:opacity-100"
                  >
                    New password
                  </label>
                  <span className="absolute left-5 top-4 text-theme-text-secondary peer-focus:opacity-0 peer-valid:opacity-0 transition-opacity pointer-events-none">
                    New password
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-4 text-theme-text-muted hover:text-theme-primary-500 transition-colors focus:outline-none"
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <RiEyeOffLine size={24} /> : <RiEyeLine size={24} />}
                  </button>
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={itemVariants} className="relative group">
                  <input
                    type={showConfirm ? "text" : "password"}
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-5 pr-12 py-4 bg-theme-bg-muted dark:bg-slate-800/50 text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all placeholder-transparent peer backdrop-blur-sm"
                    placeholder="Confirm password"
                    required
                  />
                  <label
                    htmlFor="confirm-password"
                    className="absolute left-5 top-4 text-theme-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:font-bold peer-focus:bg-white dark:peer-focus:bg-slate-900 px-2 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:font-bold peer-valid:bg-white dark:peer-valid:bg-slate-900 pointer-events-none rounded-full shadow-sm shadow-black/5 opacity-0 peer-valid:opacity-100 peer-focus:opacity-100"
                  >
                    Confirm password
                  </label>
                  <span className="absolute left-5 top-4 text-theme-text-secondary peer-focus:opacity-0 peer-valid:opacity-0 transition-opacity pointer-events-none">
                    Confirm password
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-4 text-theme-text-muted hover:text-theme-primary-500 transition-colors focus:outline-none"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <RiEyeOffLine size={24} /> : <RiEyeLine size={24} />}
                  </button>
                </motion.div>
              </div>

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
                    Resetting...
                  </>
                ) : (
                  <>
                    <RiShieldCheckLine size={20} />
                    Set New Password
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
        </div>
      </div>
    </div>
  );
};
