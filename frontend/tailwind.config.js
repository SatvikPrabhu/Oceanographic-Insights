/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          50: "#e6eef6",
          400: "#7b93ad",
          700: "#1c2a3a",
          800: "#121c28",
          900: "#0b1220",
          950: "#070d16",
        },
        ocean: {
          50: "#eef8fb",
          100: "#d5eef5",
          400: "#22d3ee",
          500: "#0e7490",
          700: "#155e75",
          900: "#083344",
        },
      },
      boxShadow: {
        panel: "0 12px 40px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
