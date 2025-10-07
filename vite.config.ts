import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        exportType: 'default',
        icon: true,
        replaceAttrValues: {
          '#979BAB': 'var(--icon-primary, #979BAB)',
          '#979bab': 'var(--icon-primary, #979bab)',
          '#E7E9F0': 'var(--icon-primary, #E7E9F0)',
          '#17171A': 'var(--icon-primary, #17171A)',
          'rgb(151,155,171)': 'var(--icon-primary, rgb(151,155,171))',

          white: 'var(--icon-secondary, #fff)',
          '#fff': 'var(--icon-secondary, #fff)',
          black: 'var(--icon-secondary, #000)',
          '#000': 'var(--icon-secondary, #000)',

          currentColor: 'var(--icon-primary, currentColor)'
        },
        svgo: true,
        svgoConfig: {
          plugins: [
            { name: 'removeDimensions', active: true },
            { name: 'removeXMLNS', active: true },
            {
              name: 'convertColors',
              params: {
                currentColor: false,
                names2hex: false,
                shorthex: false
              }
            }
          ]
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
