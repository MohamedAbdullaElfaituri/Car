import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#111111",
          red: "#d71920",
          white: "#ffffff",
          ink: "#1f2937",
          muted: "#6b7280",
          surface: "#f7f7f8"
        }
      },
      boxShadow: {
        soft: "0 16px 50px rgba(17, 17, 17, 0.08)"
      },
      fontFamily: {
        sans: ["var(--font-arabic)", "Tahoma", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
