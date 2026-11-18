import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    proxy: {
      '/api': loadEnv(mode, '.', 'STUDENTHUB_').STUDENTHUB_API_TARGET ?? 'http://127.0.0.1:8877',
    },
  },
}))
