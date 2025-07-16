module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        'oysterglow-bg': '#F8F4F0',
        'oysterglow-surface': '#DDD0C8',
        'oysterglow-dark': '#B0A89F',
        'blue-700': '#1D4ED8',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
      },
      spacing: {
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
      },
    },
  },
  plugins: [],
}; 