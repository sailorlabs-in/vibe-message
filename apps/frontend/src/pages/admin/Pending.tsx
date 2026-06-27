import React from 'react';
import { motion } from 'motion/react';
import { RiTimerLine, RiArrowLeftLine } from '@remixicon/react';
import { useAppDispatch } from '../../store/store';
import { logoutUser } from '../../store/slices/authSlice';

export const Pending: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-3xl w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-700/50 overflow-hidden relative z-10 p-10 md:p-16 text-center">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[80px]"
          />
          <motion.div
            animate={{
              x: [0, -50, 0],
              y: [0, 50, 0],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[60px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          {/* Pulsing Icon */}
          <div className="relative mx-auto w-28 h-28 mb-10">
            <div className="absolute inset-0 bg-amber-500/30 animate-ping rounded-full blur-xl"></div>
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative flex items-center justify-center w-full h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-xl border-2 border-amber-500/50 text-amber-500">
              <RiTimerLine size={56} />
            </div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-theme-text-primary drop-shadow-sm mb-6"
          >
            Review Pending
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-theme-text-secondary font-medium leading-relaxed mb-10 max-w-lg mx-auto"
          >
            Your account is currently waiting for super admin approval. We will notify you to grant
            full access to the platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm sm:text-base shadow-sm ring-1 ring-inset ring-amber-500/30 backdrop-blur-sm"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            Waiting for Administrator
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <button
              onClick={() => dispatch(logoutUser())}
              className="inline-flex items-center gap-2 text-theme-text-muted hover:text-theme-primary-500 font-bold transition-colors cursor-pointer"
            >
              <RiArrowLeftLine size={20} />
              Return to Login
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
