import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'c8', // or 'c8',
      reporter: ['text', 'json-summary', 'json', 'html'],
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.cache/**',
    ],
    include: [
      './test/**',
    ],
    alias: {
      '@productdevbook/ts-i18n': 'src/index.ts',
    },
  },
})
