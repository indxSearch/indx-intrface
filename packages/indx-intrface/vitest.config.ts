import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@indxsearch/indx-types': fileURLToPath(new URL('../indx-types/src', import.meta.url)),
      '@indxsearch/systm': fileURLToPath(new URL('../indx-systm/src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
