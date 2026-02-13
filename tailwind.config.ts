import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        pl: {
          bg: "#0a1628",
          card: "#0f1d32",
          border: "#1a2d4a",
          monday: "#79E2FF",
          day: "#C7F8BA",
          suede: "#00A5D3",
          electro: "#221377",
          dark: "#0a1628",
          input: "#081220",
        },
      },
    },
  },
  plugins: [],
};
export default config;
