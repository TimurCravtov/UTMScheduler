import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves project sites from /<repo>/; the deploy workflow passes that in as BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
})
