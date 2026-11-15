import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
};
export default config;
