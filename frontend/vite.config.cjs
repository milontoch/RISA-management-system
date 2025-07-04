import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  //...other config
  server: {
    proxy: {
     '/backend': 'http://localhost/RISA%management%system/backend/public/index.php',
    },
  },
})
