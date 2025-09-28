/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cpn-dark': '#0A0A0A',
        'cpn-dark2': '#111111',
        'cpn-gray': '#6B7280',
        'cpn-white': '#FFFFFF',
        'cpn-yellow': '#FDE047',
      },
      fontFamily: {
        'heading': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}