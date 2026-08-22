/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,html}",
    "./components/**/*.{js,ts,jsx,tsx,html}",
    "./lib/**/*.{js,ts,jsx,tsx,html}",
    "./js/**/*.{js,ts,jsx,tsx,html}",
    "./css/**/*.css",
    "./*.html"
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f6f8f5',
          100: '#e8ede4',
          200: '#d3decb',
          300: '#b4c7a6',
          400: '#8faa7c',
          500: '#6f8d59',
          600: '#567143',
          700: '#435835',
          800: '#38482d',
          900: '#2b3e2a',
          950: '#142013',
        },
        amberGold: '#f59e0b',
        darkSlate: '#0a1209',
        cardBg: '#1c2b1a',
        cardHighlight: '#243522',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
