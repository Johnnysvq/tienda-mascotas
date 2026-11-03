import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // En desarrollo, el navegador habla solo con vite
    // y vite reenvia /api a spring boot.
    proxy: { '/api': 'http://localhost:8080' }
  },
})
