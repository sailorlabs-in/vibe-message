import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { RiSunLine, RiComputerLine, RiMoonLine } from '@remixicon/react';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-1 bg-theme-bg-muted rounded-lg p-1 border border-theme-border w-fit">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'light'
            ? 'bg-theme-bg-primary text-theme-primary-500 shadow-sm'
            : 'text-theme-text-muted hover:text-theme-text-primary'
        }`}
        title="Light Mode"
      >
        <RiSunLine size={16} />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'system'
            ? 'bg-theme-bg-primary text-theme-primary-500 shadow-sm'
            : 'text-theme-text-muted hover:text-theme-text-primary'
        }`}
        title="System Preference"
      >
        <RiComputerLine size={16} />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'dark'
            ? 'bg-theme-bg-primary text-theme-primary-500 shadow-sm'
            : 'text-theme-text-muted hover:text-theme-text-primary'
        }`}
        title="Dark Mode"
      >
        <RiMoonLine size={16} />
      </button>
    </div>
  );
};
