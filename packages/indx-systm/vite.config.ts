import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { copyFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

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
    {
      name: 'copy-global-css',
      closeBundle() {
        // Copy cursors.css to dist after build
        const cursorsSource = resolve(__dirname, 'src/globals/cursors.css');
        const cursorsDest = resolve(__dirname, 'dist/cursors.css');
        mkdirSync(dirname(cursorsDest), { recursive: true });
        copyFileSync(cursorsSource, cursorsDest);

        // Copy patterns.css to dist after build
        const patternsSource = resolve(__dirname, 'src/globals/patterns.css');
        const patternsDest = resolve(__dirname, 'dist/patterns.css');
        copyFileSync(patternsSource, patternsDest);
      }
    }
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
          // Keep SVG and PNG images in assets folder with their original names
          if (assetInfo.name?.endsWith('.png') || assetInfo.name?.endsWith('.svg')) {
            return 'assets/[name][extname]';
          }
          // Keep CSS with original name
          return '[name][extname]';
        },
      },
    },
  },
});
