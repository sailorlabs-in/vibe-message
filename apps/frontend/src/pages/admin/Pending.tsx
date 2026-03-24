import React from "react";
import { motion } from "motion/react";
import { RiTimerLine } from "@remixicon/react";

export const Pending: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center relative overflow-hidden transition-colors duration-300 px-4">
      {/* Background is now handled globally in App.tsx */}

      <div className="max-w-lg w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 24 }}
          className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2.5rem] shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-12 text-center"
        >
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 bg-theme-warning opacity-30 animate-ping rounded-full blur-md"></div>
            <div className="relative flex items-center justify-center w-full h-full bg-theme-bg-secondary rounded-full shadow-lg border-2 border-theme-warning text-theme-warning">
              <RiTimerLine size={48} />
            </div>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-theme-text-primary drop-shadow-sm mb-4">
            Under Review
          </h2>

          <p className="text-theme-text-secondary font-medium leading-relaxed mb-8">
            Your account is currently pending super admin approval.
            <br className="hidden sm:block" />
            We will notify you once you have been granted access to the
            platform.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-theme-warning text-gray-900 font-bold text-sm shadow-sm ring-1 ring-inset ring-theme-warning/50">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-900 opacity-50"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-900"></span>
            </span>
            Status Pending
          </div>
        </motion.div>
      </div>
    </div>
  );
};
