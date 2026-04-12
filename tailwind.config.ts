import type { Config } from "tailwindcss";
// Configuration globale de Tailwind CSS (couleurs personnalisées, chemins des fichiers à analyser pour le CSS, etc.)

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gcBlue: "#0062AF",
        gcGreen: "#28a745",
      },
    },
  },
  plugins: [],
};
export default config;
