/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#0f3d2e',
        accent: '#d7a93b',
        surface: '#f7f3e8',
        card: '#fffdf6',
        ink: '#17231d',
        muted: '#6d766f',
        success: '#1f8a4c',
        warning: '#c47f12',
        error: '#b42318',
        worker: '#146c43',
        union: '#0b4f6c',
      },
      borderRadius: {
        panel: '24px',
        card: '18px',
      },
    },
  },
  plugins: [],
};
