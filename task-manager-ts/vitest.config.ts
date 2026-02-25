import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
    env: {
      JWT_SECRET: 'test-secret-key-for-vitest',
    },
  },
})
