import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// Dev-harness build config (D7). The published library ships TS source via
// `exports` and is transpiled by the *consumer's* Vite — this config only builds
// react-shell's own harness app (showcase + test routes).
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
