import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// With `globals: false` (vitest.config.ts), @testing-library/react does not
// auto-register its DOM cleanup — do it explicitly so renders don't accumulate
// across tests within a file.
afterEach(() => {
  cleanup()
})
