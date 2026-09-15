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
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
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
