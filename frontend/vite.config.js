import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    allowedHosts: [import.meta.env.VITE_ALLOWED_HOSTS],
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
  }
})
