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
          DEFAULT: ' #F6F1E8',
          card: '#FFF8EE',
          hover: '#F2E9DD',
          border: '#E3D6C7',
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
          primary: '#241A33',
          secondary: '#4B3D63',
          muted: '#7A6A8A',
        },
      },
    },
  },
  plugins: [],
}
