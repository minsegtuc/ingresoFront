/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'gotham-book': ['Gotham-book', 'sans-serif'],
      },
      height: {
        heightfull: 'calc(100vh)',
      },
    },
  },
  plugins: [],
}
