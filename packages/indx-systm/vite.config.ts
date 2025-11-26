import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      // Tell it to emit declarations into dist/
      outDir: 'dist',
      // And create a dist/index.d.ts entrypoint for the package.json "types"
      insertTypesEntry: true,
      // Don't re-process the dist folder itself
      exclude: ['dist/**', 'node_modules/**'],
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.tsx',
      name: 'IndxSystem',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: (assetInfo) => {
          // Keep images in assets folder with their original names
          if (assetInfo.name?.endsWith('.png')) {
            return 'assets/[name][extname]';
          }
          // Keep CSS with original name
          return '[name][extname]';
        },
      },
    },
  },
});
