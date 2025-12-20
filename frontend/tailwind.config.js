/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Manrope', 'sans-serif'],
        'sans': ['Public Sans', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
        'mono': ['JetBrains Mono', 'monospace']
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#2F5D62",
          50: "#F2F7F7",
          100: "#E1EDED",
          200: "#C4DCDC",
          300: "#9FBFC0",
          400: "#769F9F",
          500: "#548282",
          600: "#2F5D62",
          700: "#264A4E",
          800: "#203D40",
          900: "#1C3336",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#DFD3C3",
          50: "#FBF9F6",
          100: "#F6F2ED",
          200: "#EBE2D8",
          300: "#DFD3C3",
          400: "#C7B6A1",
          500: "#A8957D",
          600: "#85725B",
          700: "#635442",
          800: "#453B2E",
          900: "#2B241C",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "#F28C28",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: "#059669",
        warning: "#D97706",
        error: "#DC2626",
        info: "#0284C7",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'soft': '0 4px 20px -4px rgba(47,93,98,0.08)',
        'hover': '0 8px 30px -4px rgba(47,93,98,0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};