#!/usr/bin/env node
// dev-watch — the shell's single dev-loop watcher, run by the `dev start`
// `rs:watch` sidecar (registry `watch = true` → `pnpm run build:lib:watch`).
//
// It runs TWO live mirrors so a `link:` consumer (the demos, evaluering) sees
// every shell edit without a tag or reinstall:
//   1. `tsc -p tsconfig.lib.json --watch` → rebuilds dist/ (the JS the consumer reads)
//   2. the themes mirror → re-vendors src/themes/ on every themes-checkout edit
//      (so a colour change in ~/Developer/themes HMRs into the consumer; CSS is
//       live from src, dist is not involved — see distribution-model.md)
//
// One process tree, so `dev stop rs` (or Ctrl-C) cleans both up — no orphans.

import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { watch as watchThemes } from './sync-themes.mjs'

const SHELL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// 1) tsc --watch for dist/
const tsc = spawn('pnpm', ['exec', 'tsc', '-p', 'tsconfig.lib.json', '--watch'], {
  cwd: SHELL_ROOT,
  stdio: 'inherit',
})

// 2) themes mirror → src/themes/
let stopThemes = () => {}
try {
  stopThemes = watchThemes()
} catch (err) {
  // Non-fatal: tsc keeps running; surface the reason so the dev can symlink themes.
  console.error(`[dev-watch] themes mirror not started: ${err.message}`)
}

let shuttingDown = false
function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  stopThemes()
  if (!tsc.killed) tsc.kill('SIGTERM')
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
tsc.on('exit', (code) => shutdown(code ?? 0))
