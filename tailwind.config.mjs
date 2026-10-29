/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#070b14',
        panel: '#0d1423',
        panel2: '#111b2e',
        line: 'rgba(129, 140, 248, 0.18)',
        // Theme-aware colours: channels live in global.css and flip under [data-theme='light'].
        white: 'rgb(var(--c-white) / <alpha-value>)',
        slate: Object.fromEntries(
          [100, 200, 300, 400, 500, 900, 950].map((shade) => [shade, `rgb(var(--c-slate-${shade}) / <alpha-value>)`]),
        ),
        neon: 'rgb(var(--c-neon) / <alpha-value>)',
        neon2: '#69a7ff',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        text: '#dbe7ff',
        muted: '#8ea1c7',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124, 247, 212, 0.12), 0 0 32px rgba(105, 167, 255, 0.18)',
      },
    },
  },
  plugins: [],
};

