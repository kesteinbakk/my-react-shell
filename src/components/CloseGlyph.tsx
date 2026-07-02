import type { IconMode } from '../icons/iconModeContext'

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
 * Renders the lucide-style ✕ icon by default, swapping to the ✖️ emoji once the
 * consumer wires the icons↔emojis seam and the app is in emoji mode
 * (`iconMode === 'emoji'`) — matching `UserPreferences`' own close glyph. Left
 * unwired (`iconMode` omitted) it always renders the icon, so it is non-breaking.
 */
export function CloseGlyph({ iconMode }: { iconMode?: IconMode }) {
  if (iconMode === 'emoji') {
    return (
      <span className="mrs-close-emoji" aria-hidden="true">
        ✖️
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
