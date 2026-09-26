/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#050505',
          900: '#080808',
          850: '#0d0d0d',
          800: '#121212',
          750: '#161616',
          700: '#1a1a1a',
          600: '#242424',
          500: '#2e2e2e',
        },
        silver: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
        }
      },
      backgroundImage: {
        'futuristic-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(220, 220, 220, 0.08), transparent 70%)',
        'silver-gradient': 'linear-gradient(135deg, #ffffff 0%, #e5e5e5 50%, #b8b8b8 100%)',
        'silver-glow-border': 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.12) 100%)',
      },
      boxShadow: {
        'silver-subtle': '0 0 25px -5px rgba(220, 220, 220, 0.08)',
        'silver-card': '0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.07)',
        'silver-card-hover': '0 12px 30px -4px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(220, 220, 220, 0.28), 0 0 25px -4px rgba(200, 200, 200, 0.12)',
        'silver-btn': '0 2px 10px 0 rgba(255, 255, 255, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'subtle-pulse': 'subtlePulse 4s ease-in-out infinite',
        'sheen': 'sheen 3s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '0.08' },
          '50%': { opacity: '0.14' },
        },
        sheen: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
