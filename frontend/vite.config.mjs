import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/RISA-management-system/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    proxy: {
     '/backend': 'http://localhost/RISA%management%system/backend/public/index.php',
    },
  },
})
