import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
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
          white: 'var(--icon-secondary, #fff)',
          '#fff': 'var(--icon-secondary, #fff)',
          black: 'var(--icon-secondary, #000)',
          '#000': 'var(--icon-secondary, #000)',
          currentColor: 'var(--icon-primary, currentColor)',
        },
        svgo: true,
        svgoConfig: {
          plugins: [
            { name: 'removeDimensions', active: true },
            { name: 'removeXMLNS', active: true },
            { name: 'convertColors', params: { currentColor: false, names2hex: false, shorthex: false } },
          ],
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
