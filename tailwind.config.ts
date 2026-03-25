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
        terracotta: "#C4612A",
        "terracotta-light": "#E8835A",
        "terracotta-pale": "#FAEDE4",
        olive: "#5A6E3A",
        "olive-light": "#7A9250",
        "olive-pale": "#EBF0E2",
        "ink-footer": "#1E1A14",
        "ink-mid": "#4A4035",
        "ink-soft": "#8A7E72",
        cream: "#FFFDF9",
        gold: "#C4922A",
        "gold-pale": "#FBF3E2",
        sand: "#F7F3ED",
        "sand-dark": "#EDE6DB",
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
