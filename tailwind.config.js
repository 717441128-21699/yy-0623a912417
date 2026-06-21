/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        cold: {
          bg: '#1A2332',
          sidebar: '#0F172A',
          border: '#334155',
          accent: '#0EA5E9',
          alert: '#EF4444',
        },
      },
      fontFamily: {
        title: ['"DM Sans"', '"Noto Sans SC"', 'sans-serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-temp': 'pulse-temp 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-temp': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
};
