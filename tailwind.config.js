/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Microsoft JhengHei', 'PingFang TC', 'Noto Sans TC', 'sans-serif'],
      },
      aspectRatio: {
        '16/9': '16 / 9',
      }
    },
  },
  plugins: [],
}