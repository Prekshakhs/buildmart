/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        steel: {
          50: "#f4f6f8",
          100: "#e2e8ee",
          200: "#c5d0da",
          300: "#9aafc0",
          400: "#6b8aa0",
          500: "#4d6f87",
          600: "#3d5a70",
          700: "#334a5c",
          800: "#2c3e4e",
          900: "#1a2530",
          950: "#0f1820",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        rust: {
          500: "#e05c2a",
          600: "#c74a1e",
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.18)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.28)",
        glow: "0 0 24px rgba(251,191,36,0.25)",
      },
    },
  },
  plugins: [],
};
