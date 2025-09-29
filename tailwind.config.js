/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cpn-dark': '#1f1f1f',
        'cpn-dark2': '#2a2a2a',
        'cpn-gray': '#ababab',
        'cpn-white': '#ffffff',
        'cpn-yellow': '#f2f661',
      },
      fontFamily: {
        'heading': ['National2Condensed', 'Arial Black', 'sans-serif'],
        'body': ['ESKlarheit', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'cpn': '100px',
      },
    },
  },
  plugins: [],
}