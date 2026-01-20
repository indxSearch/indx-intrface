import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    fs: {
      allow: ['..', '../..'],
    },
  },
  resolve: {
    preserveSymlinks: false,
  },
  optimizeDeps: {
    exclude: ['@indxsearch/systm', '@indxsearch/intrface', '@indxsearch/pixl', '@indxsearch/indx-types'],
    include: [],
  },
});
