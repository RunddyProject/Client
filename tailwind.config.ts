import { twTypography } from './src/shared/design/tokens/tw-typography';

import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        w: { 100: 'var(--w-100)' },
        g: {
          '10': 'var(--g-10)',
          '20': 'var(--g-20)',
          '30': 'var(--g-30)',
          '40': 'var(--g-40)',
          '50': 'var(--g-50)',
          '60': 'var(--g-60)',
          '70': 'var(--g-70)',
          '80': 'var(--g-80)',
          '90': 'var(--g-90)',
          '100': 'var(--g-100)',
          black: 'var(--g-black)'
        },
        runddy: {
          blue: 'var(--runddy-blue)',
          pressed: 'var(--runddy-pressed)',
          orange: 'var(--runddy-orange)',
          green: 'var(--runddy-green)',
          pink: 'var(--runddy-pink)'
        },
        pri: 'var(--text-pri)',
        sec: 'var(--text-sec)',
        ter: 'var(--text-ter)',
        placeholder: 'var(--text-placeholder)',

        lineTer: 'var(--line-ter)',
        stateError: 'var(--state-error)'
      },

      fontSize: twTypography,

      boxShadow: {
        runddy: 'var(--shadow-runddy)'
      },
      borderRadius: {
        DEFAULT: 'var(--radius)'
      },
      fontFamily: {
        pretendard: 'var(--fontfamilies-pretendard)'
      }
    }
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          /* Firefox */
          'scrollbar-width': 'none',

          /* Safari / Chrome / Edge */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      });
    }
  ]
} satisfies Config;
