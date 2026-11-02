/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fancode: {
          bg: '#0F0F11',
          surface: '#18181B',
          card: '#222226',
          border: '#2E2E33',
          hover: '#2A2A30',
          orange: '#FF5B00',
          orangeLight: '#FF7A29',
          orangeMuted: 'rgba(255, 91, 0, 0.15)',
          text: '#F4F4F5',
          muted: '#A1A1AA',
          subtle: '#71717A',
        }
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { borderColor: '#FF5B00', boxShadow: '0 0 15px rgba(255, 91, 0, 0.5)' },
          '50%': { borderColor: '#2E2E33', boxShadow: 'none' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 1.5s infinite',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }
    },
  },
  plugins: [],
}
