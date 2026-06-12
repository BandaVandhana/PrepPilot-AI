/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#F4F0FF',
          card: '#FFFFFF',
          hover: '#EDE8FF',
          border: '#DDD5FA',
        },
        accent: {
          DEFAULT: '#7C3AED',
          dim: '#6D28D9',
          glow: 'rgba(124,58,237,0.12)',
        },
        green: {
          pp: '#22C55E',
          dim: '#DCFCE7',
        },
        amber: {
          pp: '#F97316',
          dim: '#FFF7ED',
        },
        red: {
          pp: '#EF4444',
          dim: 'rgba(239,68,68,0.12)',
        },
        text: {
          primary: '#1A0A3B',
          secondary: '#5B4B8A',
          muted: '#8B7BB8',
        },
      },
    },
  },
  plugins: [],
}
