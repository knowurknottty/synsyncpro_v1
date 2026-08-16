/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{tsx,ts,jsx,js}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neuro: {
          900: 'var(--bg)',
          800: 'var(--surface)',
          700: 'var(--border)',
          600: 'var(--border)',
          500: 'var(--primary)',
          400: 'var(--primary)',
          300: 'var(--primary)',
          accent: 'var(--secondary)',
          success: '#00C853',
          danger: '#FF3D00',
        },
        theme: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          border: 'var(--border)',
          primary: 'var(--primary)',
          secondary: 'var(--secondary)',
          accent: 'var(--accent)',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        sans: ['var(--font-body)', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 8s linear infinite',
        'cosmic-drift': 'cosmic-drift 6s ease-in-out infinite alternate',
      },
      keyframes: {
        scan: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        'cosmic-drift': {
          '0%': { filter: 'drop-shadow(0 0 8px rgba(255, 0, 128, 0.4))', transform: 'scale(1)' },
          '100%': { filter: 'drop-shadow(0 0 18px rgba(0, 212, 255, 0.6))', transform: 'scale(1.05)' },
        }
      }
    }
  },
  plugins: [],
}
