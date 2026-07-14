import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: '#0f5132',
        chalk: '#f8fafc',
      },
    },
  },
  plugins: [],
} satisfies Config;
