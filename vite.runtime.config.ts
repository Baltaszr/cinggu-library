import { defineConfig } from 'vite'
export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'public/runtime',
    emptyOutDir: false,
    lib: {
      entry: 'packages/avatar-web/src/index.ts',
      formats: ['es'],
      fileName: () => 'cinggu-web-20261024.js',
    },
  },
})
