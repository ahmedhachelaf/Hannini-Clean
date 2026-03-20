import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./messages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        soft: "var(--soft)",
        accent: "var(--accent)",
        accentStrong: "var(--accent-strong)",
      },
      borderRadius: {
        xl2: "1.75rem",
      },
      boxShadow: {
        card: "0 18px 50px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
