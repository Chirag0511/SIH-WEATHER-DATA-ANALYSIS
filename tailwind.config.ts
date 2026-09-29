import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        india: {
          saffron: "#FF6F00",
          saffronLight: "#FF9800",
          navy: "#0A192F",
          navyDark: "#020C1B",
          navyCard: "#112240",
          navyBorder: "#233554",
          green: "#138808",
          teal: "#00B4D8",
          blue: "#0077B6",
          alertRed: "#E63946",
          warningAmber: "#F59E0B",
          verifiedGreen: "#10B981",
        },
      },
    },
  },
  plugins: [],
};
export default config;
