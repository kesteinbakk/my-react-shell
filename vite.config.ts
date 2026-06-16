import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// Dev-harness build config (D7). This config builds ONLY my-react-shell's own
// dev-harness app (showcase + test routes) — it does not build the published
// library. The importable library ships precompiled `dist/` (JS + `.d.ts`)
// emitted by the `prepare` build via `tsc -p tsconfig.lib.json` — not raw TS.
export default defineConfig({
  plugins: [
    // tanstackRouter() MUST come before react().
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
