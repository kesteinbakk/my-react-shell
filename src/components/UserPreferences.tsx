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

const CloseGlyph = (
  <svg {...svg} width={16} height={16} aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

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

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger ?? (
          <button type="button" className="mrs-prefs-trigger" aria-label={triggerLabel} title={triggerLabel}>
            {SlidersGlyph}
          </button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="mrs-dialog__overlay" />
        <Dialog.Content className={cn('mrs-prefs', className)}>
          <div className="mrs-prefs__header">
            <Dialog.Title className="mrs-prefs__title">{title}</Dialog.Title>
            <Dialog.Close className="mrs-prefs__close" aria-label={closeLabel}>
              {CloseGlyph}
            </Dialog.Close>
          </div>
          {description != null && (
            <Dialog.Description className="mrs-prefs__desc">{description}</Dialog.Description>
          )}

          {/* Theme palette */}
          <section className="mrs-prefs__section">
            <h3 className="mrs-prefs__heading">{themeHeading}</h3>
            <div className="mrs-prefs__grid" role="group" aria-label={typeof themeHeading === 'string' ? themeHeading : undefined}>
              {themes.map((info) => (
                <button
                  key={info.name}
                  type="button"
                  className="mrs-prefs__option"
                  aria-pressed={theme === info.name}
                  onClick={() => onThemeChange(info.name)}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </section>

          {/* Color mode */}
          <section className="mrs-prefs__section">
            <h3 className="mrs-prefs__heading">{modeHeading}</h3>
            <div className="mrs-prefs__seg" role="group" aria-label={typeof modeHeading === 'string' ? modeHeading : undefined}>
              <Segment active={!sys && mode === 'light'} onClick={() => onModeChange('light')}>
                {SunGlyph}
                {lightLabel}
              </Segment>
              <Segment active={!sys && mode === 'dark'} onClick={() => onModeChange('dark')}>
                {MoonGlyph}
                {darkLabel}
              </Segment>
              {showSystem && (
                <Segment active={sys} onClick={() => onFollowSystemChange!(true)}>
                  {MonitorGlyph}
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
                <Segment active={iconMode === 'icon'} onClick={() => onIconModeChange!('icon')}>
                  {iconsLabel}
                </Segment>
                <Segment active={iconMode === 'emoji'} onClick={() => onIconModeChange!('emoji')}>
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
