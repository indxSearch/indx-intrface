import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    // dts({
    //   exclude: ['dist'],
    // }),
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
