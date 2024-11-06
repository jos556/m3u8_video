import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    proxy: {
      '/proxy': {
        target: 'https://test-streams.mux.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, ''),
        headers: {
          'Origin': 'https://test-streams.mux.dev',
          'Referer': 'https://test-streams.mux.dev'
        }
      }
    }
  },
}) 