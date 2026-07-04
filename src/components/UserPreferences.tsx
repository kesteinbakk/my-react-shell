import { useState } from 'react'
import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { ThemeInfo, ThemeMode, ThemeName } from '../theme/themeContext'
import type { IconMode } from '../icons/iconModeContext'
import type { MenuSize } from '../app-shell/menuSizeContext'
import { useI18nContextOptional } from '../i18n/i18nContext'
import { Button } from './Button'
import { cn } from './cn'
import { Flag } from './Flag'
import { useShellText } from './useShellText'

/**
 * A section rendered as one left-nav item + right pane in the two-pane
 * (sectioned) layout. Provide the full, ordered list via
 * {@link UserPreferencesProps.sections} to switch `<UserPreferences>` from its
 * single-column body to a category rail.
 *
 * Three ids are **reserved** and render built-in panes when their `content` is omitted:
 * `'theme'` (palette + light/dark/system), `'display'` (icons↔emojis + the menu-size
 * control) and `'language'` (the language switcher, driven off the mounted
 * `<I18nProvider>`). Include an entry with that `id` (and your own `icon`/`label`)
 * wherever you want it in the order; leave the entry out entirely to render no such
 * section.
 */
export interface UserPreferencesSection {
  /** Stable id — the nav key and selected-state value. The reserved `'theme'` / `'language'` ids render built-in panes. */
  id: string
  /** Left-nav icon node (already mode-resolved by the consumer, e.g. `<AppIcon…>`). */
  icon: ReactNode
  /** Left-nav text label (translated by the consumer). */
  label: ReactNode
  /** Right-pane content shown when this section is active. Omit **only** for a reserved (`'theme'` / `'language'`) entry (the shell injects the pane); required for every other section. */
  content?: ReactNode
}

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
  /** Active display mode. Omit (with `onIconModeChange`) to hide the control. */
  iconMode?: IconMode
  /** Called when icons/emojis is chosen. Omit to hide the control. */
  onIconModeChange?: (mode: IconMode) => void

  // ── Menu size (header-chrome size) ───────────────────────────────────────
  /**
   * Active menu-size preference — the app-shell header-chrome size
   * (`'small'` · `'medium'` = normal · `'large'`). Wire it to `useMenuSize()`
   * (my-react-shell/app-shell). Omit (with `onMenuSizeChange`) to hide the control.
   */
  menuSize?: MenuSize
  /** Called when a menu size is chosen. Omit to hide the control. */
  onMenuSizeChange?: (size: MenuSize) => void

  // ── Extension + presentation ─────────────────────────────────────────────
  /** Optional rows rendered below a divider — e.g. sign out / profile. The kit stays auth-free; you wire identity here. */
  accountActions?: ReactNode
  /** Override the default trigger (an icon button). Rendered as the dialog trigger. */
  trigger?: ReactNode
  /** Controlled open state. Omit to let the component manage its own. */
  open?: boolean
  /** Open-state change handler. */
  onOpenChange?: (open: boolean) => void

  // ── Sectioned (two-pane) layout ──────────────────────────────────────────
  /**
   * The **full, ordered** left-nav. Omit (or pass an empty array) → the
   * single-column, no-nav body. Pass one or more → the dialog widens into a
   * two-pane grid with a left icon+label nav and a swappable right pane, in
   * exactly the order given. Include an `{ id: 'theme' }` entry to place the
   * built-in palette/mode/display pane wherever you want it (or leave it out to
   * omit the theme section); every other entry supplies its own `content`.
   */
  sections?: UserPreferencesSection[]
  /**
   * The active section id (controlled). Pass this + `onActiveSectionChange` to
   * own the selection — e.g. persist it to `sessionStorage` so the dialog
   * reopens where the user left off. Omit both and the component remembers the
   * last-viewed section across close→reopen within its lifetime. An id absent
   * from `sections` falls back to the first nav item.
   */
  activeSection?: string
  /** Called with the newly-selected section id when the user picks a nav item. */
  onActiveSectionChange?: (id: string) => void

  // ── Labels (all **required** — pass translated strings via your t() seam) ──
  triggerLabel: string
  title: ReactNode
  /** Optional supporting line under the title. */
  description?: ReactNode
  themeHeading: ReactNode
  modeHeading: ReactNode
  displayHeading: ReactNode
  lightLabel: ReactNode
  darkLabel: ReactNode
  systemLabel: ReactNode
  iconsLabel: ReactNode
  emojisLabel: ReactNode
  /** Heading for the menu-size control. Optional — defaults to `mrs.prefs.menuSizeHeading`. */
  menuSizeHeading?: ReactNode
  /** Label for the `small` menu-size segment. Optional — defaults to `mrs.prefs.menuSizeSmall`. */
  menuSizeSmallLabel?: ReactNode
  /** Label for the `medium` (normal) menu-size segment. Optional — defaults to `mrs.prefs.menuSizeMedium`. */
  menuSizeMediumLabel?: ReactNode
  /** Label for the `large` menu-size segment. Optional — defaults to `mrs.prefs.menuSizeLarge`. */
  menuSizeLargeLabel?: ReactNode
  /** Text for the lower close button and the accessible label of the header ✕. Optional — defaults to the built-in `mrs.action.close`. */
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

// ── Menu-size glyph (the "A" grows across the small/medium/large segments) ───
function SizeGlyph({ size }: { size: number }) {
  return (
    <svg {...svg} width={size} height={size} aria-hidden="true">
      <path d="M5 20 12 5l7 15" />
      <path d="M8.5 14h7" />
    </svg>
  )
}

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
 * <UserPreferences> — a drop-in user-options panel in a Radix dialog opened from an
 * icon button. Two built-in control groups: **theme** (palette + light/dark/system)
 * and **display** (an optional icons↔emojis switch + an optional menu-size control
 * that sizes the app-shell header chrome — small/medium/large). In the single-column
 * layout both groups stack; in the sectioned layout they are the reserved `'theme'` and `'display'` panes.
 *
 * Fully **controlled** — it reads the current values and emits an `onChange` for each
 * preference, and persists nothing itself, so the consumer decides where state lives
 * (localStorage via the shipped providers, or a per-user account / Convex). Auth-free:
 * surface sign-out / profile through the `accountActions` slot. Every label is a
 * **required, no-default prop** — pass translated strings via your t() seam, so the
 * kit never imports i18n and never renders a hardcoded language.
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
  menuSize,
  onMenuSizeChange,
  accountActions,
  trigger,
  open,
  onOpenChange,
  sections,
  activeSection,
  onActiveSectionChange,
  triggerLabel,
  title,
  description,
  themeHeading,
  modeHeading,
  displayHeading,
  lightLabel,
  darkLabel,
  systemLabel,
  iconsLabel,
  emojisLabel,
  menuSizeHeading,
  menuSizeSmallLabel,
  menuSizeMediumLabel,
  menuSizeLargeLabel,
  closeLabel,
  className,
}: UserPreferencesProps) {
  const st = useShellText()
  const i18n = useI18nContextOptional()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  // Two-pane layout is engaged only when the consumer supplies sections. Absent
  // (or empty) → the single-column body below renders exactly as before.
  const sectioned = sections != null && sections.length > 0

  // Active section is controlled-or-internal, mirroring `open`/`onOpenChange`.
  // Uncontrolled, it seeds to the first nav item and is NOT reset on open, so the
  // dialog reopens where the user left off within its lifetime. A consumer wanting
  // that to survive reloads passes `activeSection`/`onActiveSectionChange` and
  // persists it (e.g. sessionStorage). Whatever the source, a stale/absent id
  // resolves to the first nav item below.
  const [internalSection, setInternalSection] = useState(() => sections?.[0]?.id ?? 'theme')
  const activeControlled = activeSection !== undefined
  const rawSection = activeControlled ? activeSection : internalSection
  const activeId =
    sectioned && sections!.some((s) => s.id === rawSection) ? rawSection! : sections?.[0]?.id ?? 'theme'
  const setActiveSection = (id: string) => {
    if (!activeControlled) setInternalSection(id)
    onActiveSectionChange?.(id)
  }

  const showSystem = onFollowSystemChange !== undefined
  const sys = followSystem === true
  const showDisplay = iconMode !== undefined && onIconModeChange !== undefined
  const showMenuSize = menuSize !== undefined && onMenuSizeChange !== undefined
  // The modal's own glyphs follow the app's display mode when the consumer wires
  // the icons seam (passes `iconMode`); otherwise they stay icons.
  const emojiMode = iconMode === 'emoji'

  // The two built-in theme controls (palette + light/dark/system). In the
  // single-column layout they render inline; in the sectioned layout they are
  // the right pane shown while the built-in "Theme" nav item is active. The
  // display controls (icons↔emojis + menu size) live in their own `displayPane`
  // (reserved `'display'` section) so themes and visuals are separate sections.
  const themePane = (
    <>
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
    </>
  )

  // The built-in display controls (reserved `'display'` section id): the
  // icons↔emojis switch and the menu-size (header-chrome size) control. Each
  // control renders only when the consumer wires it; the pane is empty (renders
  // nothing) if neither is wired.
  const displayPane =
    showDisplay || showMenuSize ? (
      <>
        {/* Icons vs emojis */}
        {showDisplay && (
          <section className="mrs-prefs__section">
            <h3 className="mrs-prefs__heading">{displayHeading}</h3>
            <div className="mrs-prefs__seg" role="group" aria-label={typeof displayHeading === 'string' ? displayHeading : undefined}>
              {/* This toggle is exempt from the mode swap — it always shows the emoji
                  on the left and an icon on the right, to demonstrate the switch. */}
              <Segment active={iconMode === 'emoji'} onClick={() => onIconModeChange!('emoji')}>
                <span className="mrs-prefs__emoji" aria-hidden="true">😀</span>
                {emojisLabel}
              </Segment>
              <Segment active={iconMode === 'icon'} onClick={() => onIconModeChange!('icon')}>
                {SmileGlyph}
                {iconsLabel}
              </Segment>
            </div>
          </section>
        )}

        {/* Menu size (header-chrome size) */}
        {showMenuSize && (
          <section className="mrs-prefs__section">
            <h3 className="mrs-prefs__heading">{menuSizeHeading ?? st('mrs.prefs.menuSizeHeading')}</h3>
            <div
              className="mrs-prefs__seg"
              role="group"
              aria-label={typeof menuSizeHeading === 'string' ? menuSizeHeading : st('mrs.prefs.menuSizeHeading')}
            >
              <Segment active={menuSize === 'small'} onClick={() => onMenuSizeChange!('small')}>
                <SizeGlyph size={13} />
                {menuSizeSmallLabel ?? st('mrs.prefs.menuSizeSmall')}
              </Segment>
              <Segment active={menuSize === 'medium'} onClick={() => onMenuSizeChange!('medium')}>
                <SizeGlyph size={16} />
                {menuSizeMediumLabel ?? st('mrs.prefs.menuSizeMedium')}
              </Segment>
              <Segment active={menuSize === 'large'} onClick={() => onMenuSizeChange!('large')}>
                <SizeGlyph size={19} />
                {menuSizeLargeLabel ?? st('mrs.prefs.menuSizeLarge')}
              </Segment>
            </div>
          </section>
        )}
      </>
    ) : null

  // The built-in language pane (reserved `'language'` section id). Driven off the
  // i18n seam read *softly* — present only when an `<I18nProvider>` is mounted, so
  // a consumer adds `{ id: 'language', … }` to `sections` and it just works with no
  // wiring, exactly like the palette pane. Inline option buttons (flag + native
  // name), mirroring the theme palette grid.
  const languagePane =
    i18n != null && i18n.locales.length > 0 ? (
      <section className="mrs-prefs__section">
        <h3 className="mrs-prefs__heading">{st('mrs.prefs.language')}</h3>
        <div className="mrs-prefs__grid" role="group" aria-label={st('mrs.prefs.language')}>
          {i18n.locales.map((l) => (
            <button
              key={l.code}
              type="button"
              className="mrs-prefs__option"
              aria-pressed={i18n.locale === l.code}
              onClick={() => i18n.setLocale(l.code)}
            >
              <Flag code={l.code} />
              {l.label}
            </button>
          ))}
        </div>
      </section>
    ) : null

  // The left-nav is exactly the sections the consumer passes, in order — the
  // built-in theme controls are just the entry whose id is `'theme'`.
  const navItems = sectioned ? sections! : []
  // The reserved `'theme'` / `'display'` / `'language'` ids render built-in panes;
  // every other id renders its section's own content. `activeId` is already guarded
  // to a present id.
  const activeContent =
    activeId === 'theme'
      ? themePane
      : activeId === 'display'
        ? displayPane
        : activeId === 'language'
          ? languagePane
          : sections?.find((s) => s.id === activeId)?.content ?? null

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger ?? (
          <button type="button" className="mrs-prefs-trigger" aria-label={triggerLabel} title={triggerLabel}>
            <ModeGlyph icon={PaletteGlyph} emoji="🎨" emojiMode={emojiMode} />
          </button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="mrs-dialog__overlay" />
        <Dialog.Content className={cn('mrs-prefs', sectioned && 'mrs-prefs--sectioned', className)}>
          <div className="mrs-prefs__header">
            <Dialog.Title className="mrs-prefs__title">{title}</Dialog.Title>
            <Dialog.Close className="mrs-prefs__close" aria-label={closeLabel ?? st('mrs.action.close')}>
              <ModeGlyph icon={CloseGlyph} emoji="❌" emojiMode={emojiMode} />
            </Dialog.Close>
          </div>
          {description != null && (
            <Dialog.Description className="mrs-prefs__desc">{description}</Dialog.Description>
          )}

          {sectioned ? (
            <div className="mrs-prefs__panes">
              <nav className="mrs-prefs__nav" aria-label={typeof title === 'string' ? title : undefined}>
                {navItems.map((item) => {
                  const active = item.id === activeId
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="mrs-prefs__nav-item"
                      aria-pressed={active}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <span className="mrs-prefs__nav-icon" aria-hidden="true">{item.icon}</span>
                      <span className="mrs-prefs__nav-label">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
              <div className="mrs-prefs__content">{activeContent}</div>
            </div>
          ) : (
            <>
              {themePane}
              {displayPane}
            </>
          )}

          {accountActions != null && <div className="mrs-prefs__account">{accountActions}</div>}

          <div className="mrs-prefs__footer">
            <Dialog.Close asChild>
              <Button variant="soft" tone="neutral">
                {closeLabel ?? st('mrs.action.close')}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
