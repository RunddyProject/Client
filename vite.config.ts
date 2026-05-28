import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

function getDevServerPort(mode: string) {
  const env = loadEnv(mode, process.cwd(), '');
  const rawPort = env.DEV_SERVER_PORT;
  if (!rawPort) return undefined;

  const port = Number(rawPort);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('DEV_SERVER_PORT must be an integer between 1 and 65535.');
  }

  return port;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const devServerPort = getDevServerPort(mode);

  return {
    plugins: [
      react(),
      tailwindcss(),

      svgr({
        include: ['**/*.svg?react'],
        svgrOptions: {
          exportType: 'default',
          svgo: true,
          svgoConfig: {
            plugins: [
              { name: 'removeViewBox', active: false },
              { name: 'removeDimensions', active: true },
              { name: 'cleanupNumericValues', params: { floatPrecision: 2 } },
              {
                name: 'convertColors',
                params: {
                  currentColor: false,
                  names2hex: false,
                  shorthex: false
                }
              }
            ]
          },
          svgProps: {
            role: 'img',
            focusable: 'false',
            vectorEffect: 'non-scaling-stroke',
            shapeRendering: 'geometricPrecision'
          },
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
          }
        }
      })
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@app': path.resolve(__dirname, 'src/app'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@features': path.resolve(__dirname, 'src/features'),
        '@pages': path.resolve(__dirname, 'src/pages')
      }
    },

    server: {
      port: devServerPort,
      strictPort: !!devServerPort
    },

    esbuild: {
      drop: ['console', 'debugger']
    }
  };
});
