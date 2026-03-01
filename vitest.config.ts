import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: false
  },
  resolve: {
    alias: {
      // '@/foo' → 'src/foo' — mirrors vite.config.ts's '@' alias
      '@': path.resolve(__dirname, 'src')
    }
  }
});
