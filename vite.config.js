
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path'; // ✅ Add this

// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//   ],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, 'src'), // ✅ This makes @ point to /src
//     },
//   },
// });


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        console.warn('ROLLUP WARNING:', warning);
        warn(warning); // Keep default behavior
      },
    },
  },
});
