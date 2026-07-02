import type { IconMode } from '../icons/iconModeContext'
import { useIconModeContextOptional } from '../icons/iconModeContext'

const svg = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/**
 * The close-affordance glyph shared by the overlay components (`Dialog`, `Sheet`).
 * Renders the lucide-style ✕ icon by default, swapping to the ❌ emoji when the app
 * is in emoji display mode — matching `UserPreferences`' own close glyph.
 *
 * The emoji is ❌ (cross mark), not ✖️ (heavy multiplication x). ✖️ carries an
 * emoji-presentation variation selector that forces the platform's *monochrome* glyph,
 * which renders near-black and ignores `currentColor` — so on a dark surface it is
 * almost invisible. ❌ is a genuinely coloured emoji, legible on light and dark alike.
 *
 * Resolution order for the display mode:
 *   1. the explicit `iconMode` prop (an override), else
 *   2. the app's icons↔emojis seam, read *softly* via `useIconModeContextOptional()`
 *      — so the ✕ follows the toggle automatically with zero wiring, else
 *   3. `'icon'` when neither is present (a consumer that never installs the icons
 *      module is unaffected — the context read returns `null`, no provider required).
 *
 * This is the sanctioned **soft optional integration** exception to module
 * self-containment — see docs/maintainers/module-authoring.md → "Self-contained".
 */
export function CloseGlyph({ iconMode }: { iconMode?: IconMode }) {
  const ctx = useIconModeContextOptional()
  const mode = iconMode ?? ctx?.iconMode ?? 'icon'
  if (mode === 'emoji') {
    return (
      <span className="mrs-close-emoji" aria-hidden="true">
        ❌
      </span>
    )
  }
  return (
    <svg {...svg} width={16} height={16} aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
