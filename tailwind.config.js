/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 700: '#1e1b4b', 800: '#15133a', 900: '#0d0b26', 950: '#07061a' },
        accent: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', '"Noto Sans Malayalam"', 'system-ui', 'sans-serif'] },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,.04), 0 10px 30px -10px rgba(15,23,42,.10)',
        glow: '0 8px 30px -6px rgba(124,58,237,.55)',
      },
      keyframes: { up: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } } },
      animation: { up: 'up .35s ease-out both' },
    },
  },
  plugins: [],
};
