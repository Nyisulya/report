/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dit: {
          navy: '#0A192F',
          blue: '#1E3A8A',
          gold: '#D97706',
          lightGold: '#FDE68A',
          cyan: '#0284C7',
          surface: '#0F172A',
          card: '#1E293B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        academic: ['Times New Roman', 'serif']
      }
    },
  },
  plugins: [],
}
