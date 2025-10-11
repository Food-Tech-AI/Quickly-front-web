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
        // Primary Colors
        primary: "#40E0D8",
        secondary: "#5EBEC4",
        accent: "#FCE283",
        
        // Background Colors
        background: "#FDF9F2",
        backgroundSecondary: "#FEFBF4",
        
        // Surface Colors
        surface: "#FFFFFF",
        surfaceSecondary: "#F8F9FA",
        
        // Text Colors
        text: "#2D2D2D",
        textSecondary: "#666",
        textLight: "#888",
        
        // Status Colors
        success: "#4ECDC4",
        warning: "#FFD84D",
        error: "#F04245",
        
        // Button Colors
        buttonPrimary: "#40E0D8",
        buttonSecondary: "#F4D03F",
        
        // Border Colors
        border: "#E0E0E0",
        borderActive: "#00CCC3",
        
        // Special Colors
        heart: "#FFD84D",
        fire: "#FF6B6B",
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        'xl': '28px',
        'lg': '22px',
        'md': '10px',
      },
    },
  },
  plugins: [],
} satisfies Config;

