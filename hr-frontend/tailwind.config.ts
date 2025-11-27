import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Tailwind'in class'ları arayacağı dosyalar
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}", // Views klasörünü ekledik
  ],
  theme: {
    extend: {
      colors: {
        // Özel Renk Paletimiz
        primary: {
          DEFAULT: "#2563EB", // blue-600 (Ana renk)
          hover: "#1D4ED8", // blue-700 (Hover hali)
          light: "#EFF6FF", // blue-50 (Arkaplanlar için)
        },
        secondary: "#64748B", // slate-500 (Gri metinler)
        danger: "#DC2626", // red-600 (Silme butonları)
        success: "#16A34A", // green-600 (Onay mesajları)

        // Diğer markalar için ek renkler
        brand: {
          purple: "#9333EA", // purple-600
          teal: "#0D9488", // teal-600
        },
      },
    },
  },
  plugins: [],
};
export default config;
