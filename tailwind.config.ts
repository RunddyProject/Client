import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // palette
        blue: '#04aef1',
        green: '#2ac47e',
        orange: '#ff7534',
        pink: '#fd7fcd',
        error: '#f45b50',

        // text tokens
        'text-primary': '#0f0f11',
        'text-secondary': '#383b45',
        'text-tertiary': '#5d6270',
        placeholder: '#979bab'
      }
    }
  }
} satisfies Config;
