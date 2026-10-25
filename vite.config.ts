/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works at https://<user>.github.io/Fitness-pal/ and locally.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
})
