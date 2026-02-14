import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors — deeper teal for better contrast
        primary: "#2ECFBD",
        secondary: "#4BA8B0",
        accent: "#FFCF56",
        
        // Background Colors — warmer cream
        background: "#FFFCF7",
        backgroundSecondary: "#FFF9F0",
        
        // Surface Colors
        surface: "#FFFFFF",
        surfaceSecondary: "#F7F8FA",
        
        // Text Colors — darker for better readability
        text: "#1A1A2E",
        textSecondary: "#555770",
        textLight: "#8E90A6",
        
        // Status Colors
        success: "#34D399",
        warning: "#FBBF24",
        error: "#EF4444",
        
        // Button Colors
        buttonPrimary: "#2ECFBD",
        buttonSecondary: "#FFCF56",
        
        // Border Colors
        border: "#E8E8ED",
        borderActive: "#2ECFBD",
        
        // Special Colors
        heart: "#FF6B8A",
        fire: "#FF6B6B",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '20px',
        'lg': '16px',
        'md': '10px',
      },
    },
  },
  plugins: [],
} satisfies Config;

