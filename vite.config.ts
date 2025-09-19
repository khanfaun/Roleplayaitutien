import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { URL, fileURLToPath } from 'url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // FIX: Replace __dirname with a method compatible with ES modules, as recommended by Vite.
      '@': fileURLToPath(new URL('./src', import.meta.url)), // trỏ thẳng đến root
    },
  },
})