/**
 * createIconRenderer — wire a consumer's icon + emoji maps into a single
 * `renderIcon(key, size)` function, with the two guardrails the bare <Icon> seam
 * can't provide on its own:
 *
 *   1. A **compile-time** completeness check — `emojis` is typed against the keys of
 *      `icons`, so a glyph with no emoji is a type error, not a silent fallback.
 *   2. A **dev-time** missing-emoji warning — a backstop for loosely-typed or
 *      dynamically-built maps where the compiler can't verify coverage.
 *
 * It owns **no glyphs and no `lucide-react` dependency** — it operates purely on the
 * maps you pass, staying true to the icons module's "a seam, not a registry" design.
 * The only layer that can audit emoji coverage is the one that sees the whole map,
 * which <Icon> never does (it sees one resolved glyph+emoji pair) — so the check
 * lives here.
 *
 * Glyphs are library-neutral: `icons` maps each key to a `(size) => ReactNode`
 * factory, so any icon source works. With lucide, the adapter is a one-liner:
 *
 * ```tsx
 * import type { LucideIcon } from 'lucide-react'
 * import { Home, Palette } from 'lucide-react'
 * import { createIconRenderer, type IconGlyph } from 'my-react-shell/icons'
 *
 * const glyph = (G: LucideIcon): IconGlyph => (size) => <G size={size} />
 *
 * const ICONS = { home: glyph(Home), palette: glyph(Palette) }      // keys infer a union
 * const EMOJIS: Record<keyof typeof ICONS, string> = { home: '🏠', palette: '🎨' }
 *
 * export const renderIcon = createIconRenderer(ICONS, EMOJIS)        // drop into renderIcon / config.renderIcon
 * ```
 */

import type { ReactNode } from 'react'
import { Icon } from './Icon'

/** A library-neutral glyph factory: given a pixel size, return the glyph node. */
export type IconGlyph = (size: number) => ReactNode

/** The `renderIcon` produced by {@link createIconRenderer}. Drop-in for app-shell's
 *  `config.renderIcon`. The optional `label` makes the glyph announced (`role=img`);
 *  omit it for decorative glyphs (`aria-hidden`). */
export type IconRenderer = (key: string, size: number, label?: string) => ReactNode

export interface CreateIconRendererOptions<K extends string> {
  /**
   * Keys that always render as the glyph, even in emoji mode — and so are exempt
   * from the missing-emoji dev warning. For brand marks, spinners, or symbols whose
   * emoji would misread. (Passed through to `<Icon forceIcon>` per key.)
   */
  force?: readonly K[]
  /**
   * Emoji rendered for a key absent from `emojis` (and not forced). Default `'●'`.
   * A key that hits this fallback is what the dev warning flags.
   */
  fallbackEmoji?: string
  /**
   * Glyph rendered for a key absent from `icons`. Default: none — the resolved emoji
   * is shown in icon mode too, and (in dev) the unknown key is warned once.
   */
  fallbackGlyph?: IconGlyph
}

/** DEV-only one-time audit of the maps at construction. */
function auditMaps(
  iconKeys: readonly string[],
  emojis: Record<string, string>,
  forced: ReadonlySet<string>,
  fallbackEmoji: string,
): void {
  const emojiKeys = Object.keys(emojis)
  const hasEmoji = new Set(emojiKeys)

  const missing = iconKeys.filter((k) => !hasEmoji.has(k) && !forced.has(k))
  if (missing.length > 0) {
    console.warn(
      `[my-react-shell/icons] createIconRenderer: ${missing.length} icon key(s) have no emoji and ` +
        `will render the fallback "${fallbackEmoji}" in emoji mode:\n  ${missing.join(', ')}\n` +
        `Add an emoji for each, or list them in \`force\` to keep them as glyphs.`,
    )
  }

  const iconKeySet = new Set(iconKeys)
  const orphans = emojiKeys.filter((k) => !iconKeySet.has(k))
  if (orphans.length > 0) {
    console.warn(
      `[my-react-shell/icons] createIconRenderer: ${orphans.length} emoji key(s) have no matching glyph ` +
        `(likely a typo or a renamed key):\n  ${orphans.join(', ')}`,
    )
  }
}

/**
 * Build a `renderIcon(key, size, label?)` from a key→glyph map and a key→emoji map.
 * Typing `emojis` as `Record<keyof typeof icons, string>` makes a missing emoji a
 * compile error; for dynamically-built maps the dev warning is the backstop.
 */
export function createIconRenderer<K extends string>(
  icons: Record<K, IconGlyph>,
  emojis: Record<K, string>,
  options: CreateIconRendererOptions<K> = {},
): IconRenderer {
  const { force, fallbackEmoji = '●', fallbackGlyph } = options
  const forced: ReadonlySet<string> = new Set(force)

  // Index access by arbitrary string at call time (key: string for app-shell drop-in).
  const iconsByKey = icons as Record<string, IconGlyph | undefined>
  const emojisByKey = emojis as Record<string, string | undefined>

  if (import.meta.env.DEV) {
    auditMaps(Object.keys(icons), emojis as Record<string, string>, forced, fallbackEmoji)
  }
  const warnedUnknown = import.meta.env.DEV ? new Set<string>() : undefined

  return function renderIcon(key: string, size: number, label?: string): ReactNode {
    const glyphFactory = iconsByKey[key]
    const emoji = emojisByKey[key] ?? fallbackEmoji

    if (import.meta.env.DEV && glyphFactory === undefined && !warnedUnknown!.has(key)) {
      warnedUnknown!.add(key)
      console.warn(`[my-react-shell/icons] renderIcon: no glyph registered for key "${key}".`)
    }

    const glyphNode = glyphFactory ? glyphFactory(size) : fallbackGlyph ? fallbackGlyph(size) : emoji

    return <Icon icon={glyphNode} emoji={emoji} size={size} label={label} forceIcon={forced.has(key)} />
  }
}
