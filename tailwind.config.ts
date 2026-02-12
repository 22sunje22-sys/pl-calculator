import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pl: {
          bg: "#0a0e1a",
          card: "#111827",
          border: "#1e293b",
          accent: "#6366f1",
          green: "#22c55e",
          yellow: "#eab308",
          gold: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
