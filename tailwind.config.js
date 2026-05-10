/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Microsoft YaHei",
          "PingFang SC",
          "Noto Sans CJK SC",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#202124",
        muted: "#667085",
        line: "#d8dee8",
        paper: "#f7f8fa",
        panel: "#ffffff",
        signal: "#2f6f73",
        amber: "#b7791f",
        brick: "#9b3a30",
      },
    },
  },
  plugins: [],
};
