import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'app'),
    },
  },
  test: {
    // Default to Node for logic/server tests; component tests opt into jsdom
    // via a `// @vitest-environment jsdom` pragma at the top of the file.
    environment: 'node',
    globals: false,
    setupFiles: ['test/setup.ts'],
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
})
