/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '70': '17.5rem', // 280px, assuming 1rem = 16px
      },
    },
  },
  plugins: [],
}

