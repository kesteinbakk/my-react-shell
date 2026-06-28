#!/usr/bin/env node
// sync-themes — vendor the shared `themes` palette CSS into the shell's own
// shipped source (`src/themes/*.css`).
//
// WHY this exists (distribution model): the consumer must depend on ONLY
// `my-react-shell`, never the transitive `themes` git-dep. So `themes` is a
// *devDependency* here, and its CSS is copied ("vendored") into the shell's
// committed `src/themes/` at release time — `src/index.css` imports those copies
// relatively, and they ship via the `src/**/*.css` files glob. See
// docs/guides/distribution-model.md and docs/maintainers/release-runbook.md.
//
// Usage:
//   node scripts/sync-themes.mjs           one-shot copy (used by `release` + the pre-commit guard)
//   node scripts/sync-themes.mjs --watch   copy now, then re-copy on every change (the dev loop)
//   node scripts/sync-themes.mjs --check    exit 1 (no write) if src/themes is stale vs node_modules/themes
//
// The curated file list below MUST match the `@import './themes/…'` lines in
// src/index.css. `golden.css` is intentionally omitted (foundation-only brand
// palette — the shell surfaces five palettes, see strategy D6+D13).

import { existsSync, mkdirSync, readFileSync, writeFileSync, watch as fsWatch, realpathSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SHELL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC_THEMES = join(SHELL_ROOT, 'src', 'themes')

// Curated set — keep in lockstep with src/index.css's `@import './themes/…'`.
export const VENDORED = [
  'contract.css',
  'ocean.css',
  'forest.css',
  'sunset.css',
  'soft.css',
  'dynamic.css',
]

const GENERATED_README = `# src/themes — VENDORED, do not edit by hand

These files are **copies** of the shared \`themes\` package, vendored into the
shell so consumers depend on only \`my-react-shell\` (never the transitive
\`themes\` git-dep). Edit colours in \`~/Developer/themes\`; they flow here via
\`pnpm sync:themes\` (the dev watcher does it automatically — see
docs/maintainers/release-runbook.md). A pre-commit guard keeps these in lockstep with
the resolved \`themes\`.
`

/** Resolve the themes CSS source directory.
 *
 * Priority — the SIBLING CHECKOUT is primary, on purpose: `node_modules/themes`
 * is NOT stable (pnpm re-materializes it to the pinned tag on every install, and
 * the manual symlink is a foot-gun), so sourcing the vendor from it would let a
 * stray `pnpm install` silently revert src/themes to an older themes. The sibling
 * checkout (`../themes`, the ~/Developer convention) is pnpm-proof.
 *   1. THEMES_DIR env var — explicit override (CI/release fetches the pinned tag here).
 *   2. ../themes — the sibling working tree (dev: live; release: verified == pinned tag).
 *   3. node_modules/themes — last-resort fallback for a clone without the sibling.
 */
function themesDir() {
  const candidates = [
    process.env.THEMES_DIR,
    resolve(SHELL_ROOT, '..', 'themes'),
    join(SHELL_ROOT, 'node_modules', 'themes'),
  ].filter(Boolean)
  for (const dir of candidates) {
    if (existsSync(join(dir, 'contract.css'))) return realpathSync(dir)
  }
  throw new Error(
    `themes CSS source not found. Looked in:\n` +
      candidates.map((c) => `  - ${c}`).join('\n') +
      `\n  • dev: check out the sibling repo at ../themes (~/Developer/themes)\n` +
      `  • release/CI: set THEMES_DIR to a checkout of the pinned themes tag.`,
  )
}

/** Read a vendored source file from the themes package. Throws if a curated file is missing. */
function readSource(srcDir, file) {
  const p = join(srcDir, file)
  if (!existsSync(p)) {
    throw new Error(
      `themes is missing ${file} (looked in ${srcDir}).\n` +
        `  The pinned themes version predates a palette the shell expects — bump the\n` +
        `  themes devDependency, or remove ${file} from VENDORED + src/index.css.`,
    )
  }
  return readFileSync(p, 'utf8')
}

/** Return the list of curated files whose vendored copy differs from the source. */
export function staleFiles() {
  const srcDir = themesDir()
  const stale = []
  for (const file of VENDORED) {
    const want = readSource(srcDir, file)
    const dest = join(SRC_THEMES, file)
    const have = existsSync(dest) ? readFileSync(dest, 'utf8') : null
    if (have !== want) stale.push(file)
  }
  return stale
}

/** One-shot: copy every curated file. Returns the list actually (re)written. */
export function syncOnce() {
  const srcDir = themesDir()
  mkdirSync(SRC_THEMES, { recursive: true })
  writeFileSync(join(SRC_THEMES, 'README.md'), GENERATED_README)
  const written = []
  for (const file of VENDORED) {
    const want = readSource(srcDir, file)
    const dest = join(SRC_THEMES, file)
    const have = existsSync(dest) ? readFileSync(dest, 'utf8') : null
    if (have !== want) {
      writeFileSync(dest, want)
      written.push(file)
    }
  }
  return written
}

/** Watch the themes dir and re-sync on change. Returns a stop() fn. */
export function watch(log = console.error) {
  const written = syncOnce()
  log(`[sync-themes] vendored ${VENDORED.length} files${written.length ? ` (updated: ${written.join(', ')})` : ' (all current)'}`)
  const srcDir = themesDir()
  let timer = null
  const watcher = fsWatch(srcDir, { persistent: true }, (_event, filename) => {
    if (filename && !VENDORED.includes(filename)) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      try {
        const updated = syncOnce()
        if (updated.length) log(`[sync-themes] re-vendored: ${updated.join(', ')}`)
      } catch (err) {
        log(`[sync-themes] ${err.message}`)
      }
    }, 80)
  })
  return () => {
    clearTimeout(timer)
    watcher.close()
  }
}

// ---- CLI ----
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  try {
    if (args.includes('--watch')) {
      const stop = watch()
      const bye = () => {
        stop()
        process.exit(0)
      }
      process.on('SIGINT', bye)
      process.on('SIGTERM', bye)
    } else if (args.includes('--check')) {
      const stale = staleFiles()
      if (stale.length) {
        console.error(`✖ src/themes is stale vs node_modules/themes: ${stale.join(', ')}`)
        console.error('  Run: pnpm sync:themes')
        process.exit(1)
      }
      console.error('✓ src/themes is in lockstep with the resolved themes')
    } else {
      const written = syncOnce()
      console.error(
        written.length
          ? `✓ vendored themes → src/themes (updated: ${written.join(', ')})`
          : '✓ vendored themes → src/themes (all current)',
      )
    }
  } catch (err) {
    console.error(`✖ sync-themes: ${err.message}`)
    process.exit(1)
  }
}
