/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'sans-serif'],
      },
      aspectRatio: {
        '16/9': '16 / 9',
      },
      colors: {
        'blue-custom': '#81d4fa',
        'pink-custom': '#f47bc8',
      }
    },
  },
  plugins: [],
}