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
          DEFAULT: '#0F1117',
          card: '#161B27',
          hover: '#1C2333',
          border: '#252D3D',
        },
        accent: {
          DEFAULT: '#6366F1',
          dim: '#4F46E5',
          glow: 'rgba(99,102,241,0.15)',
        },
        green: {
          pp: '#10B981',
          dim: 'rgba(16,185,129,0.15)',
        },
        amber: {
          pp: '#F59E0B',
          dim: 'rgba(245,158,11,0.12)',
        },
        red: {
          pp: '#EF4444',
          dim: 'rgba(239,68,68,0.12)',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#475569',
        },
      },
    },
  },
  plugins: [],
}
