/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#fcf9f4",
        "on-surface": "#1c1c19",
        "surface-container": "#f0ede9",
        "surface-container-low": "#f6f3ee",
        "surface-container-high": "#ebe8e3",
        "surface-container-lowest": "#ffffff",
        "on-surface-variant": "#3d4948",
        "primary": "#006a65",
        "primary-container": "#2fa7a0",
        "on-primary-container": "#003633",
        "secondary-fixed": "#ffdad7",
        "outline-variant": "#bcc9c7",
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Plus Jakarta Sans", "sans-serif"],
        "label": ["Plus Jakarta Sans", "sans-serif"]
      },
    },
  },
  plugins: [],
}