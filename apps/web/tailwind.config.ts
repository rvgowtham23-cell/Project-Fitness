import type { Config } from 'tailwindcss';

// Palette per architecture-plan.md's visual identity: deep charcoal/near-black primary,
// white secondary, energetic green/lime accent, soft neutral gray supporting.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#121316',
          950: '#0A0B0D',
          900: '#121316',
          800: '#1B1D21',
          700: '#26292E',
          600: '#33373D',
        },
        lime: {
          DEFAULT: '#B6FF3C',
          200: '#E4FFB8',
          400: '#C7FF66',
          500: '#B6FF3C',
          600: '#9EE62A',
          700: '#84C920',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Inter',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
