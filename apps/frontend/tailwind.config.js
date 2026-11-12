/** @type {import('tailwindcss').Config} */
function withAlpha(variableName, fallbackHex) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}-rgb) / ${opacityValue})`;
    }
    return `var(${variableName}, ${fallbackHex})`;
  };
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'glow-primary': '0 0 30px -5px rgb(var(--primary-500-rgb) / 0.35)',
        'glow-sm': '0 0 15px -3px rgb(var(--primary-500-rgb) / 0.25)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderColor: ({ theme }) => ({
        ...theme('colors'),
        DEFAULT: 'var(--border-color, #E5E7EB)',
      }),
      colors: {
        'theme-bg-primary': withAlpha('--bg-primary', '#F8F7FC'),
        'theme-bg-secondary': withAlpha('--bg-secondary', '#FFFFFF'),
        'theme-bg-muted': withAlpha('--bg-muted', '#F1F0FA'),
        
        'theme-primary-100': withAlpha('--primary-100', '#EDE9FE'),
        'theme-primary-400': withAlpha('--primary-400', '#C4B5FD'),
        'theme-primary-500': withAlpha('--primary-500', '#A78BFA'),
        'theme-primary-600': withAlpha('--primary-600', '#8B5CF6'),
        
        'theme-accent-100': withAlpha('--accent-100', '#D1FAE5'),
        'theme-accent-400': withAlpha('--accent-400', '#6EE7B7'),
        'theme-accent-500': withAlpha('--accent-500', '#10B981'),
        
        'theme-text-primary': withAlpha('--text-primary', '#1F2937'),
        'theme-text-secondary': withAlpha('--text-secondary', '#6B7280'),
        'theme-text-muted': withAlpha('--text-muted', '#9CA3AF'),
        
        'theme-border': withAlpha('--border-color', '#E5E7EB'),
        
        'theme-success': 'var(--state-success)',
        'theme-warning': 'var(--state-warning)',
        'theme-error': 'var(--state-error)',
        'theme-info': 'var(--state-info)',
      },
    },
  },
  plugins: [],
}
