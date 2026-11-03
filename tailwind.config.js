/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        broadcast: {
          canvas: '#090A0C',
          surface: '#111317',
          card: '#181A20',
          cardHover: '#1F222A',
          border: '#262933',
          borderLight: '#323644',
          orange: '#FF5200',
          orangeHover: '#FF6A22',
          orangeGlow: 'rgba(255, 82, 0, 0.25)',
          amber: '#F59E0B',
          red: '#EF4444',
          green: '#10B981',
          blue: '#3B82F6',
          text: '#F4F4F6',
          muted: '#9CA3AF',
          subtle: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        broadcastPulse: {
          '0%, 100%': { borderColor: '#FF5200', boxShadow: '0 0 20px rgba(255, 82, 0, 0.45)' },
          '50%': { borderColor: '#262933', boxShadow: 'none' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        tickerSlide: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'broadcast-pulse': 'broadcastPulse 1.8s infinite cubic-bezier(0.4, 0, 0.6, 1)',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'ticker-slide': 'tickerSlide 0.25s ease-out'
      }
    },
  },
  plugins: [],
}
