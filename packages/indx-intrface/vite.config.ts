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
      // Use build tsconfig to avoid path mapping issues
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.tsx',
      name: 'IndxIntrface',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@indxsearch/systm',
        '@indxsearch/systm/styles.css', // Externalize systm CSS
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@indxsearch/systm': 'systm'
        },
      },
    },

  },
});
