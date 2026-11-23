/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core Plantista palette — nature-inspired, premium, restrained.
        ink: '#16311F',      // near-black green, primary text / nav
        fern: '#2F5A32',     // primary brand green, buttons/links
        moss: '#4C7A4F',     // hover / mid green
        sage: '#9AB498',     // soft secondary green, borders, tags
        mist: '#E3EBDE',     // pale green surface tint
        cream: '#F6F1E7',    // main page background
        paper: '#FFFDF8',    // card / surface background
        gold: '#B8924A',     // accent for CTAs, prices, highlights
        clay: '#8A6E4B',     // secondary accent, used sparingly
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        organic: '2rem 1rem 2rem 1rem',
      },
      boxShadow: {
        card: '0 8px 24px -8px rgba(22, 49, 31, 0.15)',
        lift: '0 20px 40px -12px rgba(22, 49, 31, 0.25)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};
