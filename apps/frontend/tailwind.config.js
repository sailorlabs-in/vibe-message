/** @type {import('tailwindcss').Config} */
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
      colors: {
        'theme-bg-primary': 'var(--bg-primary)',
        'theme-bg-secondary': 'var(--bg-secondary)',
        'theme-bg-muted': 'var(--bg-muted)',
        
        'theme-primary-100': 'var(--primary-100)',
        'theme-primary-400': 'var(--primary-400)',
        'theme-primary-500': 'var(--primary-500)',
        'theme-primary-600': 'var(--primary-600)',
        
        'theme-accent-100': 'var(--accent-100)',
        'theme-accent-400': 'var(--accent-400)',
        'theme-accent-500': 'var(--accent-500)',
        
        'theme-text-primary': 'var(--text-primary)',
        'theme-text-secondary': 'var(--text-secondary)',
        'theme-text-muted': 'var(--text-muted)',
        
        'theme-border': 'var(--border-color)',
        
        'theme-success': 'var(--state-success)',
        'theme-warning': 'var(--state-warning)',
        'theme-error': 'var(--state-error)',
        'theme-info': 'var(--state-info)',
      },
    },
  },
  plugins: [],
}
