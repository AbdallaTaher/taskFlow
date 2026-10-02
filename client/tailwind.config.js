/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f7ff",
          100: "#e6edff",
          200: "#cedcff",
          500: "#5b7cff",
          600: "#3d67ff",
          700: "#294cd8",
          900: "#101a3d",
        },
        plum: "#7c5cff",
        mint: "#4adeb8",
        ink: "#0b1120",
      },
      boxShadow: {
        luxe: "0 30px 80px rgba(52, 78, 160, 0.18)",
      },
    },
  },
  plugins: [],
};
