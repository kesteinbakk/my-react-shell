#!/usr/bin/env node
// release — cut a my-react-shell release. RUN BY AGENTS, every time. Never hand
// the steps to a human. See docs/guides/release-runbook.md (the agent rulebook).
//
// This ONE command handles the whole upstream chain automatically:
//   1. CASCADE THEMES — inspect the sibling ../themes checkout and, if it has
//      unreleased work, release + (with --push) push it; then pin the shell to the
//      resulting themes tag. So you never have to release themes separately.
//   2. Vendor the pinned themes → src/themes, rebuild dist/, typecheck.
//   3. Bump the shell version, commit, tag, and (with --push) push.
//
// Usage:
//   pnpm release                 patch bump, local only
//   pnpm release minor           minor bump (shell)        [major|minor|patch|X.Y.Z]
//   pnpm release minor --push    release + push (themes too); the prod path
//   pnpm release --themes minor  bump level to use IF themes needs a cascade release
//                                (default: patch)
//
// Abundant guard rails; it refuses only when a human must decide (uncommitted
// themes work, a divergent themes checkout). NEVER auto-pushes without --push.

import { execFileSync } from 'node:child_process'
import { readFileSync as read, writeFileSync as write } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SHELL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const THEMES_DIR = resolve(SHELL_ROOT, '..', 'themes')
const THEMES_SPEC = (tag) => `git+ssh://git@bitbucket.org:kesteinbakk/themes.git#${tag}`

const die = (m) => {
  console.error(`\n✖ release aborted:\n${m}\n`)
  process.exit(1)
}
const ok = (m) => console.error(`✓ ${m}`)
const step = (m) => console.error(`\n— ${m} —`)
const run = (cmd, args, cwd = SHELL_ROOT) => execFileSync(cmd, args, { cwd, stdio: 'inherit' })
const cap = (cmd, args, cwd = SHELL_ROOT) => execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim()
const git = (cwd, ...args) => cap('git', args, cwd)
const tryGit = (cwd, ...args) => {
  try {
    // stderr ignored: tryGit is for existence/state checks where failure is expected
    // (e.g. rev-parse of a not-yet-created tag) — don't print git's "fatal:" noise.
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return null
  }
}

// ---- args ----
const argv = process.argv.slice(2)
const push = argv.includes('--push')
const themesIdx = argv.indexOf('--themes')
const themesBump = themesIdx !== -1 ? argv[themesIdx + 1] : 'patch'
// Exclude the `--themes <level>` VALUE — but only when --themes is actually present
// (themesIdx === -1 would otherwise wrongly exclude argv[0], the shell bump arg).
const verArg = argv.filter((a, i) => !a.startsWith('--') && !(themesIdx !== -1 && i === themesIdx + 1))[0] ?? 'patch'

function nextVersion(current, bump) {
  if (/^\d+\.\d+\.\d+$/.test(bump)) return bump
  const [maj, min, pat] = current.split('.').map(Number)
  if (bump === 'major') return `${maj + 1}.0.0`
  if (bump === 'minor') return `${maj}.${min + 1}.0`
  if (bump === 'patch') return `${maj}.${min}.${pat + 1}`
  die(`unknown version arg "${bump}" (use major|minor|patch or X.Y.Z)`)
}

function latestTag(cwd) {
  const tags = (tryGit(cwd, 'tag', '-l', 'v*') ?? '')
    .split('\n')
    .filter((t) => /^v\d+\.\d+\.\d+$/.test(t))
    .map((t) => t.slice(1).split('.').map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
  const top = tags.at(-1)
  return top ? `v${top.join('.')}` : null
}
const latestThemesTag = () => latestTag(THEMES_DIR)

// ============================================================================
// STEP 1 — CASCADE THEMES (every time)
// ============================================================================
step('themes cascade')

if (!tryGit(THEMES_DIR, 'rev-parse', '--is-inside-work-tree')) {
  die(`themes checkout not found at ${THEMES_DIR}.\n  Check out ~/Developer/themes beside the shell.`)
}

const themesDirty = git(THEMES_DIR, 'status', '--porcelain')
if (themesDirty) {
  die(
    `../themes has UNCOMMITTED changes — a human must commit them with a meaningful\n` +
      `message before they can ship (the release won't author themes content commits):\n${themesDirty}\n` +
      `  Fix: cd ../themes && git add -A && git commit, then re-run.`,
  )
}

let themesTag = latestThemesTag()
const themesHead = git(THEMES_DIR, 'rev-parse', 'HEAD')

// Is HEAD at-or-ahead of the latest tag (releasable), behind/divergent (human), or untagged?
const unreleased = themesTag ? Number(git(THEMES_DIR, 'rev-list', `${themesTag}..HEAD`, '--count')) : null
const tagIsAncestor = themesTag ? tryGit(THEMES_DIR, 'merge-base', '--is-ancestor', themesTag, 'HEAD') !== null : false

if (themesTag && !tagIsAncestor) {
  die(
    `../themes HEAD (${themesHead.slice(0, 8)}) is behind/divergent from its latest tag ${themesTag}.\n` +
      `  A human should reconcile the themes checkout (likely: git checkout main).`,
  )
}

if (!themesTag || unreleased > 0) {
  // Unreleased themes work → release it (and push it iff the shell push is requested).
  ok(`themes has ${themesTag ? `${unreleased} unreleased commit(s) after ${themesTag}` : 'no tags'} → releasing themes (${themesBump}${push ? ', push' : ', local'})`)
  run('pnpm', push ? ['release', themesBump, '--push'] : ['release', themesBump], THEMES_DIR)
  themesTag = latestThemesTag()
  ok(`themes released ${themesTag}`)
} else {
  // HEAD == latest tag. Make sure it (and main) are on origin when pushing.
  ok(`themes is at its latest tag ${themesTag} (no new work)`)
  if (push) {
    if (!git(THEMES_DIR, 'ls-remote', '--tags', 'origin', themesTag)) {
      run('git', ['push', 'origin', themesTag], THEMES_DIR)
      ok(`pushed existing themes ${themesTag} to origin`)
    }
    if (Number(tryGit(THEMES_DIR, 'rev-list', '@{u}..HEAD', '--count') ?? '0') > 0) {
      run('git', ['push'], THEMES_DIR)
      ok('pushed themes main to origin')
    }
  } else if (!git(THEMES_DIR, 'ls-remote', '--tags', 'origin', themesTag)) {
    console.error(`  note: themes ${themesTag} is not on origin yet — it will be pushed when you release the shell with --push.`)
  }
}

// ============================================================================
// STEP 2 — pin the shell to the resolved themes tag + vendor + build
// ============================================================================
step(`pin themes ${themesTag} + vendor + build`)

const pkgPath = resolve(SHELL_ROOT, 'package.json')
let pkg = JSON.parse(read(pkgPath, 'utf8'))
const wantSpec = THEMES_SPEC(themesTag)
if (pkg.devDependencies?.themes !== wantSpec) {
  pkg.devDependencies.themes = wantSpec
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  ok(`pinned devDependencies.themes → ${themesTag}`)
  run('pnpm', ['install', '--lockfile-only']) // reconcile the lockfile to the new pin
}

run('node', ['scripts/sync-themes.mjs']) // vendor from ../themes (== themesTag)
ok('vendored themes → src/themes')
run('pnpm', ['build:lib'])
ok('rebuilt dist/')
run('pnpm', ['typecheck'])
ok('typecheck passed')

// ============================================================================
// STEP 3 — bump shell version, commit, tag, (push)
// ============================================================================
pkg = JSON.parse(read(pkgPath, 'utf8')) // re-read (lockfile-only may have touched nothing else)
// Base the bump on the LATEST TAG, not package.json — tags are the source of truth
// for released versions and package.json can lag (disposable history).
const semverGt = (a, b) => {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2]
}
const shellLatest = latestTag(SHELL_ROOT)
const base = shellLatest && semverGt(shellLatest.slice(1), pkg.version) > 0 ? shellLatest.slice(1) : pkg.version
const newVersion = nextVersion(base, verArg)
const newTag = `v${newVersion}`
step(`my-react-shell ${pkg.version} (latest tag ${shellLatest ?? 'none'}) → ${newVersion}`)
if (tryGit(SHELL_ROOT, 'rev-parse', newTag)) die(`shell tag ${newTag} already exists.`)

pkg.version = newVersion
write(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
git(SHELL_ROOT, 'add', '-A')
git(SHELL_ROOT, 'commit', '-m', `release: my-react-shell ${newTag} (themes ${themesTag})`)
git(SHELL_ROOT, 'tag', newTag)
ok(`committed + tagged ${newTag}`)

if (push) {
  run('pnpm', ['build']) // full build = pre-push sanity (catches CSS/harness breakage)
  ok('full build passed (pre-push)')
  run('git', ['push'], SHELL_ROOT)
  run('git', ['push', 'origin', newTag], SHELL_ROOT)
  ok(`pushed ${newTag} to origin`)
  console.error(`\n✅ Released my-react-shell ${newTag} (themes ${themesTag}). Bump consumers: cd ../<app> && pnpm release\n`)
} else {
  console.error(`\n✅ Tagged ${newTag} locally (not pushed). Publish: git push && git push origin ${newTag} (or re-run with --push)\n`)
}
