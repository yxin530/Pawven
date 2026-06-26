/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2D5016",
        secondary: "#8B4513",
        background: "#FFF8F0",
        surface: "#E8F0E0",
        accent: "#E8740C",
        text: "#1A1A1A",
        "text-secondary": "#5C6B4A",
        border: "#D4C5A0",
        active: "#4CAF50",
        disabled: "#B0B0B0",
      },
    },
  },
  plugins: [],
};
