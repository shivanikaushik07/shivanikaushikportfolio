import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative asset paths, so dist/index.html references ./assets/... and works from any subdirectory
  base: './',
  plugins: [react()],
  server: { host: true, port: 5173 },
})
