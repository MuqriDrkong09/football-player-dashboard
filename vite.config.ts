import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('react-dom') ||
            id.includes('/react/') ||
            id.includes('react-router') ||
            id.includes('scheduler')
          ) {
            return 'vendor-react'
          }

          if (id.includes('@tanstack')) {
            return 'vendor-query'
          }

          if (
            id.includes('recharts') ||
            id.includes('d3-') ||
            id.includes('victory')
          ) {
            return 'vendor-charts'
          }

          if (id.includes('axios') || id.includes('lucide')) {
            return 'vendor-utils'
          }
        },
      },
    },
  },
})
