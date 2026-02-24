/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 12px 30px rgba(15, 23, 42, 0.08)',
        subtle: '0 8px 24px rgba(15, 23, 42, 0.06)',
      },
      colors: {
        app: {
          bg: '#f5f6fb',
          panel: '#ffffff',
          panel2: '#f7f8ff',
          border: 'rgba(15, 23, 42, 0.10)',
          text: '#0f172a',
          muted: 'rgba(15, 23, 42, 0.62)',
          blue: '#4f46e5',
        },
      },
    },
  },
  plugins: [],
}

