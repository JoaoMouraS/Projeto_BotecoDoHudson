/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#1A110C',
          surface: '#221711',
        },
        brand: {
          DEFAULT: '#FF6B00',
          hover: '#E65F00',
        },
      },
      fontFamily: {
        heading: ['Oswald', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
