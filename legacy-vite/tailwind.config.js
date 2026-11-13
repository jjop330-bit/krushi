/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#0F3822',
        },
        cream: {
          50: '#FDFAF4',
          100: '#F9F5EC',
          200: '#F3ECE0',
          300: '#E8DEC9',
          400: '#D6C5A5',
          500: '#BC9F75',
          600: '#A18357',
          700: '#816843',
          800: '#645136',
          900: '#4D3E2B',
        },
        limeacc: {
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Oriya', 'system-ui', '-apple-system', 'sans-serif'],
        odia: ['Noto Sans Oriya', 'Kalinga', 'sans-serif']
      }
    },
  },
  plugins: [],
}
