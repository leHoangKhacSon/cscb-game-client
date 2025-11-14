/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'mobile': '320px',
        'tablet': '768px',
        'desktop': '1024px',
      },
      colors: {
        primary: {
          DEFAULT: '#08989e',
          teal: '#08989e',
        },
        secondary: {
          DEFAULT: '#ff751f',
          orange: '#ff751f',
        },
        danger: {
          DEFAULT: '#ea4335',
          red: '#ea4335',
        },
        neutral: {
          dark: '#545454',
          light: '#a0a3a8',
        },
        success: {
          DEFAULT: '#119c11',
          green: '#119c11',
        },
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
