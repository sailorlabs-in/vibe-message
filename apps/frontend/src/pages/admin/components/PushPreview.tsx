import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RiNotification4Line } from '@remixicon/react';

interface PushPreviewProps {
  title: string;
  body: string;
  icon: string;
  appName: string;
}

export const PushPreview: React.FC<PushPreviewProps> = ({ title, body, icon, appName }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-[#0a0a0a] rounded-xl border border-theme-border relative overflow-hidden min-h-[400px]">
      {/* Background decoration to simulate a desktop / phone screen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-theme-primary-500/10 to-purple-500/10 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-theme-primary-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full" />

      <h3 className="absolute top-4 left-6 text-xs font-semibold text-theme-text-secondary uppercase tracking-wider">
        Live Preview
      </h3>

      <div className="w-full max-w-sm relative z-10 perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={title || body || icon ? 'preview' : 'empty'}
            initial={{ opacity: 0, y: 20, scale: 0.95, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
            className="w-full bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/50 border border-white/20 dark:border-white/5 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 pb-2 flex items-center justify-between border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-theme-primary-500 overflow-hidden shadow-inner">
                  {icon ? (
                    <img
                      src={icon}
                      alt="icon"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <RiNotification4Line size={12} />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {appName || 'Vibe Message'}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Now</span>
            </div>

            {/* Content */}
            <div className="p-4 pt-2 pb-5 flex gap-4">
              <div className="flex-1">
                <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight mb-1 break-words">
                  {title || 'Notification Title'}
                </h4>
                <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-snug break-words">
                  {body || "This is how your message will appear on a user's device."}
                </p>
              </div>
              {icon && (
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 border border-black/5 dark:border-white/5 overflow-hidden shadow-sm flex-shrink-0">
                  <img src={icon} alt="notification icon" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
