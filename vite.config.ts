import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const BASE = process.env.BASE || '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills({ include: ['stream', 'util'] })],
  base: BASE,
})
