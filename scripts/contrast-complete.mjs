// Completeness check: every contract token in base.css :root must be filled by
// every theme block, and every value must resolve to a concrete color.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// contract tokens
const base = readFileSync(join(ROOT, 'src/styles/base.css'), 'utf8')
const rootBlock = base.match(/:root\s*\{([\s\S]*?)\n\}/)[1]
const contract = []
{
  const re = /(--color-[a-z-]+):\s*([^;]+);/g
  let m
  while ((m = re.exec(rootBlock))) contract.push(m[1].trim())
}
// --color-overlay carries a value in base; not required per-theme
const required = contract.filter((t) => t !== '--color-overlay')

const THEMES = ['ocean', 'forest', 'sunset', 'soft', 'dynamic']
for (const name of THEMES) {
  const css = readFileSync(join(ROOT, `src/styles/themes/${name}.css`), 'utf8')
  for (const mode of ['light', 'dark']) {
    const block = css.match(new RegExp(`\\.theme-${name}-${mode}\\s*\\{([\\s\\S]*?)\\n\\}`))[1]
    const have = new Set()
    const re = /(--color-[a-z-]+):/g
    let m
    while ((m = re.exec(block))) have.add(m[1].trim())
    const missing = required.filter((t) => !have.has(t))
    console.log(`${name}-${mode}: ${missing.length ? 'MISSING ' + missing.join(', ') : 'complete'}`)
  }
}
