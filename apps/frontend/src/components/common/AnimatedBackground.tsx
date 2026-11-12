import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-theme-bg-primary transition-colors duration-300"
    >
      {/* Precision architectural coordinate grid with smooth radial falloff */}
      <div className="absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_at_top_center,black_45%,transparent_85%)] opacity-75 dark:opacity-35" />

      {/* Subtle top solar horizon illumination */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-theme-primary-500/10 via-theme-primary-500/3 to-transparent blur-3xl pointer-events-none dark:opacity-40 opacity-50" />

      {/* Ambient lower carrier fill */}
      <div className="absolute top-[800px] right-[-200px] w-[600px] h-[600px] rounded-full bg-theme-accent-500/4 blur-[120px] pointer-events-none" />

      {/* Fine architectural hairline horizon */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-border to-transparent" />
    </div>
  );
};
