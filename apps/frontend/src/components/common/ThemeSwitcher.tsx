import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { RiSunLine, RiComputerLine, RiMoonLine } from '@remixicon/react';
import { motion, useReducedMotion } from 'motion/react';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const options = [
    { id: 'light', icon: RiSunLine, title: 'Light Mode' },
    { id: 'system', icon: RiComputerLine, title: 'System Preference' },
    { id: 'dark', icon: RiMoonLine, title: 'Dark Mode' },
  ] as const;

  return (
    <div className="flex items-center space-x-0.5 bg-theme-bg-muted/70 rounded-full p-1 border border-theme-border w-fit relative">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className={`relative p-2 sm:p-1.5 min-w-[32px] min-h-[32px] sm:min-w-[28px] sm:min-h-[28px] flex items-center justify-center rounded-full transition-colors duration-150 ${
              isActive
                ? 'text-theme-primary-600 dark:text-theme-primary-400'
                : 'text-theme-text-muted hover:text-theme-text-primary'
            }`}
            title={opt.title}
            aria-label={opt.title}
          >
            {isActive && (
              <motion.div
                layoutId="theme-switcher-pill"
                className="absolute inset-0 rounded-full bg-theme-bg-primary shadow-xs border border-theme-border"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 500, damping: 35 }
                }
              />
            )}
            <span className="relative z-10 flex items-center justify-center">
              <Icon size={14} />
            </span>
          </button>
        );
      })}
    </div>
  );
};
