/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0d10",
        panel: {
          dark: "#111418",
          light: "#15181d",
          secondary: "#1b1f24"
        },
        card: {
          primary: "#1b1f24",
          secondary: "#20242a"
        },
        accent: {
          purple: "#7c5cff",
          purpleHover: "#8b5cf6"
        },
        text: {
          primary: "#ffffff",
          secondary: "#9e9e9e"
        },
        border: {
          subtle: "#20242a",
          focus: "#7c5cff"
        }
      }
    },
  },
  plugins: [],
}
