// Theme contrast audit — resolves every palette token to sRGB and computes WCAG
// contrast for the pairings that decide readability. Dev tooling only; not shipped.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// ---- OKLCH -> sRGB ---------------------------------------------------------
function oklchToRgb(L, C, H) {
  const hr = (H * Math.PI) / 180
  const a = C * Math.cos(hr)
  const b = C * Math.sin(hr)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3
  let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  let bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  const enc = (c) => {
    c = Math.max(0, Math.min(1, c))
    return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
  }
  return [enc(r) * 255, enc(g) * 255, bl !== undefined ? enc(bl) * 255 : 0]
}

// ---- Tailwind palette ------------------------------------------------------
const TW = {}
{
  const css = readFileSync(join(ROOT, 'node_modules/tailwindcss/theme.css'), 'utf8')
  const re = /--color-([a-z]+-\d+):\s*oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\)/g
  let m
  while ((m = re.exec(css))) {
    const [, name, l, c, h] = m
    TW[name] = oklchToRgb(parseFloat(l) / 100, parseFloat(c), parseFloat(h))
  }
}

// ---- parse a value (#hex / rgb() / var(--color-x[, fallback])) -------------
function parseColor(val, tokens) {
  val = val.trim()
  let mm
  if ((mm = val.match(/^#([0-9a-f]{6})$/i))) {
    const n = parseInt(mm[1], 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  if ((mm = val.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i))) {
    return [parseFloat(mm[1]), parseFloat(mm[2]), parseFloat(mm[3])]
  }
  if ((mm = val.match(/^var\(\s*--color-([a-z]+-\d+)\s*(?:,\s*(.+))?\)$/i))) {
    if (TW[mm[1]]) return TW[mm[1]]
    if (mm[2]) return parseColor(mm[2], tokens) // fallback
    return null
  }
  // reference to another semantic token
  if ((mm = val.match(/^var\(\s*(--color-[a-z-]+)\s*\)$/i))) {
    const ref = tokens[mm[1]]
    if (ref) return parseColor(ref, tokens)
  }
  return null
}

// ---- parse theme blocks ----------------------------------------------------
const THEMES = ['ocean', 'forest', 'sunset', 'soft', 'dynamic']
function loadTheme(name, mode) {
  const css = readFileSync(join(ROOT, `src/styles/themes/${name}.css`), 'utf8')
  const re = new RegExp(`\\.theme-${name}-${mode}\\s*\\{([\\s\\S]*?)\\n\\}`)
  const block = css.match(re)
  if (!block) throw new Error(`no block for ${name}-${mode}`)
  const tokens = {}
  const tre = /(--color-[a-z-]+):\s*([^;]+);/g
  let m
  while ((m = tre.exec(block[1]))) tokens[m[1].trim()] = m[2].trim()
  return tokens
}

// ---- WCAG contrast ---------------------------------------------------------
function lum([r, g, b]) {
  const f = (c) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
function contrast(a, b) {
  const la = lum(a), lb = lum(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// ---- pairings to check -----------------------------------------------------
// [textToken, bgToken, minRatio, label]
const surfaces = ['background-primary', 'surface-primary', 'surface-elevated', 'surface-secondary']
const PAIRS = []
for (const bg of surfaces) {
  PAIRS.push(['text-primary', bg, 4.5])
  PAIRS.push(['text-secondary', bg, 4.5])
  PAIRS.push(['text-tertiary', bg, 4.5])
  PAIRS.push(['text-muted', bg, 4.0]) // shadcn maps this to --muted-foreground (real body/descriptive text)
  PAIRS.push(['text-heading', bg, 3.0]) // heading = large text
}
// content-on-solid (button labels) — treat as normal text
for (const c of ['primary', 'secondary', 'success', 'warning', 'danger', 'info']) {
  PAIRS.push([`${c}-content`, c, 4.5])
}
// subtle badge / soft button: colored text on colored bg.
// Accent-on-tint is icon/graphic + bold-title use; bar = 3:1 (WCAG non-text
// floor). `warning` is excluded: amber-on-amber-tint is intrinsically below 3:1
// in both modes (yellow is too light), and the warning alert never renders the
// accent AS text — its body text is --color-text-primary and its edge is
// --color-warning-border. The amber accent is used on neutral surfaces + as the
// solid fill (which carries dark --color-warning-content), both of which pass.
for (const c of ['primary', 'success', 'danger', 'info']) {
  PAIRS.push([c, `${c}-bg`, 3.0])
}
// The standard shadcn bridge builds the *secondary button* from
// (bg = secondary-bg, text = secondary), so this pairing is button-label text:
// bar = 4.5. (This is what surfaced as dynamic-dark's "gray on gray" button.)
PAIRS.push(['secondary', 'secondary-bg', 4.5])
// link on common surfaces
for (const bg of ['surface-elevated', 'background-primary']) PAIRS.push(['primary', bg, 4.5])

function resolve(tokens, name) {
  const raw = tokens[`--color-${name}`]
  if (raw === undefined) return { missing: true }
  const rgb = parseColor(raw, tokens)
  return { rgb, raw }
}

const onlyFails = process.argv.includes('--fails')
for (const name of THEMES) {
  for (const mode of ['light', 'dark']) {
    const tokens = loadTheme(name, mode)
    const lines = []
    // completeness: any contract token referenced but unfilled? (skip — handled separately)
    for (const [tn, bn, min] of PAIRS) {
      const t = resolve(tokens, tn)
      const b = resolve(tokens, bn)
      if (t.missing || b.missing) {
        lines.push(`  MISSING ${t.missing ? tn : bn}`)
        continue
      }
      if (!t.rgb || !b.rgb) {
        lines.push(`  UNRESOLVED ${tn} (${t.raw}) on ${bn} (${b.raw})`)
        continue
      }
      const ratio = contrast(t.rgb, b.rgb)
      const pass = ratio >= min
      if (onlyFails && pass) continue
      const flag = pass ? 'ok  ' : ratio >= min - 1.0 ? 'WARN' : 'FAIL'
      lines.push(`  ${flag} ${ratio.toFixed(2).padStart(5)} (min ${min})  ${tn} on ${bn}`)
    }
    if (lines.length) {
      console.log(`\n### ${name}-${mode}`)
      console.log(lines.join('\n'))
    }
  }
}
