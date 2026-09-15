import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { RiSunLine, RiComputerLine, RiMoonLine } from '@remixicon/react';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-0.5 bg-black/[0.03] dark:bg-white/[0.04] rounded-full p-1 border border-black/[0.05] dark:border-white/[0.08] w-fit">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-full transition-all ${
          theme === 'light'
            ? 'bg-white dark:bg-white/15 text-theme-primary-500 dark:text-theme-primary-300 shadow-xs'
            : 'text-theme-text-muted hover:text-theme-text-primary hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        title="Light Mode"
      >
        <RiSunLine size={15} />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-full transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-white/15 text-theme-primary-500 dark:text-theme-primary-300 shadow-xs'
            : 'text-theme-text-muted hover:text-theme-text-primary hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        title="System Preference"
      >
        <RiComputerLine size={15} />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-full transition-all ${
          theme === 'dark'
            ? 'bg-white dark:bg-white/15 text-theme-primary-500 dark:text-theme-primary-300 shadow-xs'
            : 'text-theme-text-muted hover:text-theme-text-primary hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        title="Dark Mode"
      >
        <RiMoonLine size={15} />
      </button>
    </div>
  );
};
