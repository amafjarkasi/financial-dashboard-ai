/* eslint-env node */
/******** Tailwind config for Financial Dashboard ********/ 
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"InterVariable"','Inter','system-ui','sans-serif']
      },
      boxShadow: {
        'glow': '0 0 0 1px hsl(220 60% 50% / 0.3), 0 0 0 4px hsl(260 70% 55% / 0.15)',
        'soft': '0 2px 4px -2px rgba(0,0,0,0.3), 0 6px 18px -4px rgba(0,0,0,0.35)'
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(circle at 30% 20%, rgba(120,120,255,0.25), transparent 60%)',
        'grid-dark': 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'
      },
      backgroundSize: {
        'grid-sm': '40px 40px'
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'pulse-glow': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(139,92,246,0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(139,92,246,0)' }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up .5s ease-out',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite'
      },
      colors: {
        sidebar: {
          bg: 'var(--color-sidebar-bg)',
          border: 'var(--color-sidebar-border)'
        },
        brand: {
          primary: '#3b82f6', // lighter blue
          accent: '#a78bfa'   // lighter violet
        }
      },
      borderRadius: {
        'xl2': '1.25rem'
      }
    }
  },
  plugins: []
};
