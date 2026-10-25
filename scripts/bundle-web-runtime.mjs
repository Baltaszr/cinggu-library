// Build the framework-free renderer with the local core so exports support Cinggu eyes.
import { build } from 'rolldown'
import { fileURLToPath } from 'node:url'
await build({
  input: 'packages/avatar-web/src/index.ts',
  output: { file: 'public/runtime/cinggu-web-20261025.js', format: 'esm' },
  resolve: {
    alias: {
      '@bible-strong/avatar-core': fileURLToPath(
        new URL('../packages/avatar-core/src/index.ts', import.meta.url)
      ),
    },
  },
})
