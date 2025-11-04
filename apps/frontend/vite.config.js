import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
    host: '0.0.0.0',
    allowedHosts: [
      'web-frontend.lemonsand-4de94d70.eastus2.azurecontainerapps.io',
      '.azurecontainerapps.io',
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'build'
  }
})
