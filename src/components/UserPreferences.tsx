import { useState } from 'react'
import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { ThemeInfo, ThemeMode, ThemeName } from '../theme/themeContext'
import type { IconMode } from '../icons/iconModeContext'
import { cn } from './cn'

export interface UserPreferencesProps {
  // ── Theme palette ────────────────────────────────────────────────────────
  /** Active palette name. */
  theme: ThemeName
  /** Palettes to offer. Pass `useTheme().themes`. */
  themes: readonly ThemeInfo[]
  /** Called when a palette is chosen. */
  onThemeChange: (theme: ThemeName) => void

  // ── Color mode ───────────────────────────────────────────────────────────
  /** Active color mode. */
  mode: ThemeMode
  /** Called when light/dark is chosen. */
  onModeChange: (mode: ThemeMode) => void
  /** Whether the mode currently follows the OS. Enables the "System" option when `onFollowSystemChange` is also set. */
  followSystem?: boolean
  /** Called when "System" is chosen. Omit to hide the System option. */
  onFollowSystemChange?: (follow: boolean) => void

  // ── Icons vs emojis ──────────────────────────────────────────────────────
  /** Active display mode. Omit (with `onIconModeChange`) to hide the section. */
  iconMode?: IconMode
  /** Called when icons/emojis is chosen. Omit to hide the section. */
  onIconModeChange?: (mode: IconMode) => void

  // ── Extension + presentation ─────────────────────────────────────────────
  /** Optional rows rendered below a divider — e.g. sign out / profile. The kit stays auth-free; you wire identity here. */
  accountActions?: ReactNode
  /** Override the default trigger (an icon button). Rendered as the dialog trigger. */
  trigger?: ReactNode
  /** Controlled open state. Omit to let the component manage its own. */
  open?: boolean
  /** Open-state change handler. */
  onOpenChange?: (open: boolean) => void

  // ── Labels (English defaults; pass translated strings via your t()) ───────
  triggerLabel?: string
  title?: ReactNode
  description?: ReactNode
  themeHeading?: ReactNode
  modeHeading?: ReactNode
  displayHeading?: ReactNode
  lightLabel?: ReactNode
  darkLabel?: ReactNode
  systemLabel?: ReactNode
  iconsLabel?: ReactNode
  emojisLabel?: ReactNode
  closeLabel?: string
  className?: string
}

const svg = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const SlidersGlyph = (
  <svg {...svg} width={18} height={18} aria-hidden="true">
    <line x1="21" x2="14" y1="4" y2="4" />
    <line x1="10" x2="3" y1="4" y2="4" />
    <line x1="21" x2="12" y1="12" y2="12" />
    <line x1="8" x2="3" y1="12" y2="12" />
    <line x1="21" x2="16" y1="20" y2="20" />
    <line x1="12" x2="3" y1="20" y2="20" />
    <line x1="14" x2="14" y1="2" y2="6" />
    <line x1="8" x2="8" y1="10" y2="14" />
    <line x1="16" x2="16" y1="18" y2="22" />
  </svg>
)

const SunGlyph = (
  <svg {...svg} width={16} height={16} aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
)

const MoonGlyph = (
  <svg {...svg} width={16} height={16} aria-hidden="true">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
)

const MonitorGlyph = (
  <svg {...svg} width={16} height={16} aria-hidden="true">
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
)

const SmileGlyph = (
  <svg {...svg} width={16} height={16} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" x2="9.01" y1="9" y2="9" />
    <line x1="15" x2="15.01" y1="9" y2="9" />
  </svg>
)

const CloseGlyph = (
  <svg {...svg} width={16} height={16} aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

// ── Palette glyphs (icon mode) ───────────────────────────────────────────────
const WavesGlyph = (
  <svg {...svg} width={16} height={16} aria-hidden="true">
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
  </svg>
)

const TreeGlyph = (
  <svg {...svg} width={16} height={16} aria-hidden="true">
    <path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z" />
    <path d="M12 22v-3" />
  </svg>
)

const SunsetGlyph = (
  <svg {...svg} width={16} height={16} aria-hidden="true">
    <path d="M12 10V2" />
    <path d="m4.93 10.93 1.41 1.41" />
    <path d="M2 18h2" />
    <path d="M20 18h2" />
    <path d="m19.07 10.93-1.41 1.41" />
    <path d="M22 22H2" />
    <path d="m16 6-4 4-4-4" />
    <path d="M16 18a4 4 0 0 0-8 0" />
  </svg>
)

const CloudGlyph = (
  <svg {...svg} width={16} height={16} aria-hidden="true">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
)

const ZapGlyph = (
  <svg {...svg} width={16} height={16} aria-hidden="true">
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
)

const PaletteGlyph = (
  <svg {...svg} width={16} height={16} aria-hidden="true">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
  </svg>
)

/**
 * A glyph per built-in palette — the SVG shows in icon mode, the emoji in emoji
 * mode. Consumer-defined palettes (any name not below) fall back to the generic
 * palette glyph, so the picker never renders a bare label.
 */
const PALETTE_GLYPHS: Record<string, { icon: ReactNode; emoji: string }> = {
  ocean: { icon: WavesGlyph, emoji: '🌊' },
  forest: { icon: TreeGlyph, emoji: '🌲' },
  sunset: { icon: SunsetGlyph, emoji: '🌅' },
  soft: { icon: CloudGlyph, emoji: '☁️' },
  dynamic: { icon: ZapGlyph, emoji: '⚡' },
}
const FALLBACK_PALETTE_GLYPH = { icon: PaletteGlyph, emoji: '🎨' }

/**
 * Renders a glyph that follows the app's display mode: the SVG `icon` normally,
 * the `emoji` once the consumer switches to emoji mode (`iconMode === 'emoji'`).
 * The icons↔emojis toggle is deliberately exempt — it shows both, side by side,
 * to demonstrate exactly what the switch does.
 */
function ModeGlyph({ icon, emoji, emojiMode }: { icon: ReactNode; emoji: string; emojiMode: boolean }) {
  return emojiMode ? (
    <span className="mrs-prefs__emoji" aria-hidden="true">
      {emoji}
    </span>
  ) : (
    <>{icon}</>
  )
}

function Segment({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button type="button" className="mrs-prefs__seg-btn" aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  )
}

/**
 * <UserPreferences> — a drop-in user-options panel: theme palette + light/dark/system
 * + an optional icons↔emojis switch, in a Radix dialog opened from an icon button.
 *
 * Fully **controlled** — it reads the current values and emits an `onChange` for each
 * preference, and persists nothing itself, so the consumer decides where state lives
 * (localStorage via the shipped providers, or a per-user account / Convex). Auth-free:
 * surface sign-out / profile through the `accountActions` slot. Labels come via props
 * (English defaults), so the kit never imports i18n.
 */
export function UserPreferences({
  theme,
  themes,
  onThemeChange,
  mode,
  onModeChange,
  followSystem,
  onFollowSystemChange,
  iconMode,
  onIconModeChange,
  accountActions,
  trigger,
  open,
  onOpenChange,
  triggerLabel = 'Preferences',
  title = 'Preferences',
  description,
  themeHeading = 'Theme',
  modeHeading = 'Appearance',
  displayHeading = 'Icons',
  lightLabel = 'Light',
  darkLabel = 'Dark',
  systemLabel = 'System',
  iconsLabel = 'Icons',
  emojisLabel = 'Emojis',
  closeLabel = 'Close',
  className,
}: UserPreferencesProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const showSystem = onFollowSystemChange !== undefined
  const sys = followSystem === true
  const showDisplay = iconMode !== undefined && onIconModeChange !== undefined
  // The modal's own glyphs follow the app's display mode when the consumer wires
  // the icons seam (passes `iconMode`); otherwise they stay icons.
  const emojiMode = iconMode === 'emoji'

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger ?? (
          <button type="button" className="mrs-prefs-trigger" aria-label={triggerLabel} title={triggerLabel}>
            <ModeGlyph icon={SlidersGlyph} emoji="⚙️" emojiMode={emojiMode} />
          </button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="mrs-dialog__overlay" />
        <Dialog.Content className={cn('mrs-prefs', className)}>
          <div className="mrs-prefs__header">
            <Dialog.Title className="mrs-prefs__title">{title}</Dialog.Title>
            <Dialog.Close className="mrs-prefs__close" aria-label={closeLabel}>
              <ModeGlyph icon={CloseGlyph} emoji="✖️" emojiMode={emojiMode} />
            </Dialog.Close>
          </div>
          {description != null && (
            <Dialog.Description className="mrs-prefs__desc">{description}</Dialog.Description>
          )}

          {/* Theme palette */}
          <section className="mrs-prefs__section">
            <h3 className="mrs-prefs__heading">{themeHeading}</h3>
            <div className="mrs-prefs__grid" role="group" aria-label={typeof themeHeading === 'string' ? themeHeading : undefined}>
              {themes.map((info) => {
                const glyph = PALETTE_GLYPHS[info.name] ?? FALLBACK_PALETTE_GLYPH
                return (
                  <button
                    key={info.name}
                    type="button"
                    className="mrs-prefs__option"
                    aria-pressed={theme === info.name}
                    onClick={() => onThemeChange(info.name)}
                  >
                    <ModeGlyph icon={glyph.icon} emoji={glyph.emoji} emojiMode={emojiMode} />
                    {info.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Color mode */}
          <section className="mrs-prefs__section">
            <h3 className="mrs-prefs__heading">{modeHeading}</h3>
            <div className="mrs-prefs__seg" role="group" aria-label={typeof modeHeading === 'string' ? modeHeading : undefined}>
              <Segment active={!sys && mode === 'light'} onClick={() => onModeChange('light')}>
                <ModeGlyph icon={SunGlyph} emoji="☀️" emojiMode={emojiMode} />
                {lightLabel}
              </Segment>
              <Segment active={!sys && mode === 'dark'} onClick={() => onModeChange('dark')}>
                <ModeGlyph icon={MoonGlyph} emoji="🌙" emojiMode={emojiMode} />
                {darkLabel}
              </Segment>
              {showSystem && (
                <Segment active={sys} onClick={() => onFollowSystemChange!(true)}>
                  <ModeGlyph icon={MonitorGlyph} emoji="🖥️" emojiMode={emojiMode} />
                  {systemLabel}
                </Segment>
              )}
            </div>
          </section>

          {/* Icons vs emojis */}
          {showDisplay && (
            <section className="mrs-prefs__section">
              <h3 className="mrs-prefs__heading">{displayHeading}</h3>
              <div className="mrs-prefs__seg" role="group" aria-label={typeof displayHeading === 'string' ? displayHeading : undefined}>
                {/* This toggle is exempt from the mode swap — it always shows an icon
                    on the left and an emoji on the right, to demonstrate the switch. */}
                <Segment active={iconMode === 'icon'} onClick={() => onIconModeChange!('icon')}>
                  {SmileGlyph}
                  {iconsLabel}
                </Segment>
                <Segment active={iconMode === 'emoji'} onClick={() => onIconModeChange!('emoji')}>
                  <span className="mrs-prefs__emoji" aria-hidden="true">😀</span>
                  {emojisLabel}
                </Segment>
              </div>
            </section>
          )}

          {accountActions != null && <div className="mrs-prefs__account">{accountActions}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
