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
        // v2.0 design tokens
        terracotta: "#1648c0",
        "terracotta-light": "#3b7dff",
        "terracotta-pale": "#e8f0ff",
        olive: "#0284c7",
        "olive-light": "#38bdf8",
        "olive-pale": "#e0f2fe",
        "ink-footer": "#0d1c45",
        "ink-mid": "#2d4a7a",
        "ink-soft": "#6b8cae",
        cream: "#f8faff",
        gold: "#145cff",
        "gold-pale": "#dbeafe",
        sand: "#eff6ff",
        "sand-dark": "#dbeafe",
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
