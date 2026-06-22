#!/usr/bin/env node
// release — cut a my-react-shell release.
//
// Vendors the shared `themes` palette CSS from the pinned tag, rebuilds dist/,
// bumps the version, commits, and tags. The PREFLIGHT is the point: it refuses
// unless the `themes` this release will ship is clean + pushed + exactly at the
// pinned tag — so the shell can NEVER ship against an unreleased or incompatible
// themes (the dev/prod skew this whole model exists to kill). See
// docs/guides/release-runbook.md.
//
// Usage:
//   pnpm release              bump patch (0.3.0 → 0.3.1)
//   pnpm release minor        bump minor (0.3.0 → 0.4.0)   [major|minor|patch]
//   pnpm release 0.4.0        explicit version
//   pnpm release <ver> --push   also push branch + tag (runs typecheck + build first)
//
// NEVER auto-pushes without --push (push is the user's call — root CLAUDE.md).

import { execFileSync } from 'node:child_process'
import { readFileSync as read, writeFileSync as write } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SHELL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const THEMES_DIR = resolve(SHELL_ROOT, '..', 'themes')

const die = (msg) => {
  console.error(`\n✖ release aborted:\n${msg}\n`)
  process.exit(1)
}
const ok = (msg) => console.error(`✓ ${msg}`)
const sh = (cmd, args, cwd = SHELL_ROOT) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim()
const shGit = (cwd, ...args) => sh('git', args, cwd)

// ---- args ----
const argv = process.argv.slice(2)
const push = argv.includes('--push')
const verArg = argv.find((a) => !a.startsWith('--')) ?? 'patch'

// ---- read package.json + pinned themes tag ----
const pkgPath = resolve(SHELL_ROOT, 'package.json')
const pkg = JSON.parse(read(pkgPath, 'utf8'))
const themesSpec = pkg.devDependencies?.themes ?? ''
const pinMatch = themesSpec.match(/#(v[\d]+\.[\d]+\.[\d]+)/)
if (!pinMatch) die(`could not read the themes pin from devDependencies.themes:\n  "${themesSpec}"`)
const themesTag = pinMatch[1]

// ---- compute next version ----
function nextVersion(current, bump) {
  if (/^\d+\.\d+\.\d+$/.test(bump)) return bump
  const [maj, min, pat] = current.split('.').map(Number)
  if (bump === 'major') return `${maj + 1}.0.0`
  if (bump === 'minor') return `${maj}.${min + 1}.0`
  if (bump === 'patch') return `${maj}.${min}.${pat + 1}`
  die(`unknown version arg "${bump}" (use major|minor|patch or an explicit X.Y.Z)`)
}
const newVersion = nextVersion(pkg.version, verArg)
const newTag = `v${newVersion}`

console.error(`\n— my-react-shell release ${pkg.version} → ${newVersion} (themes pinned ${themesTag}) —\n`)

// ---- PREFLIGHT: the themes this release vendors must be released + matched ----
try {
  shGit(THEMES_DIR, 'rev-parse', '--is-inside-work-tree')
} catch {
  die(`themes checkout not found at ${THEMES_DIR}.\n  Check out ~/Developer/themes beside the shell.`)
}

const themesDirty = shGit(THEMES_DIR, 'status', '--porcelain')
if (themesDirty) {
  die(
    `the themes working tree (${THEMES_DIR}) has uncommitted changes:\n${themesDirty}\n` +
      `  Release themes first:  cd ../themes && pnpm release`,
  )
}

let tagCommit
try {
  tagCommit = shGit(THEMES_DIR, 'rev-list', '-n', '1', themesTag)
} catch {
  die(`themes tag ${themesTag} does not exist locally in ${THEMES_DIR}.\n  Release themes at ${themesTag} first: cd ../themes && pnpm release`)
}

const onOrigin = shGit(THEMES_DIR, 'ls-remote', '--tags', 'origin', themesTag)
if (!onOrigin) {
  die(`themes tag ${themesTag} is not on origin — consumers' CI can't fetch it.\n  Push it: cd ../themes && git push origin ${themesTag}`)
}

const themesHead = shGit(THEMES_DIR, 'rev-parse', 'HEAD')
if (themesHead !== tagCommit) {
  die(
    `themes HEAD (${themesHead.slice(0, 8)}) is not at the pinned tag ${themesTag} (${tagCommit.slice(0, 8)}).\n` +
      `  The shell pins themes ${themesTag} but the checkout is on a different commit.\n` +
      `  Either: bump the themes pin in package.json to the tag you want, OR\n` +
      `          cd ../themes && git checkout ${themesTag}\n` +
      `  (If ../themes is ahead with unreleased work — release it: cd ../themes && pnpm release — then bump the pin here.)`,
  )
}
ok(`themes ${themesTag} is released, pushed, and matches ../themes HEAD`)

// ---- vendor + build ----
sh('node', ['scripts/sync-themes.mjs'])
ok('vendored themes → src/themes')
sh('pnpm', ['build:lib'])
ok('rebuilt dist/')
sh('pnpm', ['typecheck'])
ok('typecheck passed')

// ---- bump version, commit, tag ----
pkg.version = newVersion
write(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
ok(`package.json → ${newVersion}`)

shGit(SHELL_ROOT, 'add', '-A')
shGit(SHELL_ROOT, 'commit', '-m', `release: my-react-shell ${newTag} (themes ${themesTag})`)
shGit(SHELL_ROOT, 'tag', newTag)
ok(`committed + tagged ${newTag}`)

// ---- push (only with --push) ----
if (push) {
  sh('pnpm', ['build']) // full build = pre-push sanity (catches CSS/harness breakage)
  ok('full build passed (pre-push)')
  shGit(SHELL_ROOT, 'push')
  shGit(SHELL_ROOT, 'push', 'origin', newTag)
  ok(`pushed ${newTag} to origin`)
  console.error(`\n✅ Released my-react-shell ${newTag}. Bump consumers: cd ../<app> && pnpm release\n`)
} else {
  console.error(
    `\n✅ Tagged ${newTag} locally (not pushed). To publish:\n` +
      `   git push && git push origin ${newTag}\n` +
      `   (or re-run with --push)\n`,
  )
}
