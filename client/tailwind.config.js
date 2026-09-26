/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf7ee',
          100: '#f5ebd3',
          200: '#ebd3a3',
          300: '#dfb76d',
          400: '#d49b3d',
          500: '#e5a93c', // gold accent
          600: '#b8761a',
          700: '#925617',
          800: '#774519',
          900: '#643919',
          950: '#3a1d0b',
        },
        dark: {
          bg: '#0a0d14',
          surface: '#111726',
          card: '#161d31',
          border: '#222d4a',
          hover: '#1c2640',
        },
        cinema: {
          red: '#e50914',
          accent: '#6366f1',
          gold: '#f59e0b',
          emerald: '#10b981',
          cyan: '#06b6d4',
          purple: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
