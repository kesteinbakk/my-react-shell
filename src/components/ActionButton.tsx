import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from './cn'
import type { Tone } from './tone'

/* ── Tone / size / layout ────────────────────────────────────────────────── */

export type ActionButtonTone = Tone

export type ActionButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ActionButtonLayout = 'vertical' | 'inline'

const actionButtonVariants = cva('mrs-action-btn', {
  variants: {
    tone: {
      neutral: 'mrs-action-btn--neutral',
      primary: 'mrs-action-btn--primary',
      success: 'mrs-action-btn--success',
      warning: 'mrs-action-btn--warning',
      danger: 'mrs-action-btn--danger',
      info: 'mrs-action-btn--info',
    },
    size: {
      xs: 'mrs-action-btn--xs',
      sm: 'mrs-action-btn--sm',
      md: 'mrs-action-btn--md',
      lg: 'mrs-action-btn--lg',
      xl: 'mrs-action-btn--xl',
    },
    layout: {
      vertical: 'mrs-action-btn--vertical',
      inline: 'mrs-action-btn--inline',
    },
    coloredLabel: { true: 'mrs-action-btn--colored-label' },
  },
  defaultVariants: { tone: 'neutral', size: 'sm', layout: 'vertical' },
})

/** Pixel glyph size per button size — keeps the emoji and the preset SVG in step. */
const ICON_PX: Record<ActionButtonSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
}

/* ── Preset icons (hand-rolled, lucide-shaped — no icon dependency) ────────── */

const svgBase = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

type GlyphRenderer = (px: number) => ReactNode

const renderStar = (px: number, filled: boolean): ReactNode => (
  <svg width={px} height={px} {...svgBase} fill={filled ? 'currentColor' : 'none'}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const PRESET_ICONS: Record<ActionType, GlyphRenderer> = {
  add: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  ),
  edit: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),
  delete: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  ),
  copy: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  ),
  share: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  ),
  download: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  ),
  upload: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  ),
  save: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  search: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  refresh: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  ),
  settings: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  star: (px) => renderStar(px, false),
  close: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  more: (px) => (
    <svg width={px} height={px} {...svgBase}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
}

/* ── Action presets ───────────────────────────────────────────────────────── */

export type ActionType =
  | 'add'
  | 'edit'
  | 'delete'
  | 'copy'
  | 'share'
  | 'download'
  | 'upload'
  | 'save'
  | 'search'
  | 'refresh'
  | 'settings'
  | 'star'
  | 'close'
  | 'more'

export interface ActionPreset {
  /** Default semantic tone for the action. */
  tone: ActionButtonTone
  /** Default emoji, shown in emoji mode (`showEmoji`) or as a fallback glyph. */
  emoji: string
}

/**
 * The shipped action presets: the "correct" glyph (SVG + emoji) and colour for each
 * common action. Override any of them per call. Presets carry **no text** — the kit
 * never renders a hardcoded language; pass a translated `label` (visible) and/or
 * `aria-label`/`hint` (accessible name) via your i18n seam.
 */
export const actionPresets: Record<ActionType, ActionPreset> = {
  add: { tone: 'success', emoji: '➕' },
  edit: { tone: 'info', emoji: '✏️' },
  delete: { tone: 'danger', emoji: '🗑️' },
  copy: { tone: 'neutral', emoji: '📋' },
  share: { tone: 'info', emoji: '🔗' },
  download: { tone: 'neutral', emoji: '⬇️' },
  upload: { tone: 'neutral', emoji: '⬆️' },
  save: { tone: 'primary', emoji: '💾' },
  search: { tone: 'neutral', emoji: '🔍' },
  refresh: { tone: 'neutral', emoji: '🔄' },
  settings: { tone: 'neutral', emoji: '⚙️' },
  star: { tone: 'warning', emoji: '⭐' },
  close: { tone: 'neutral', emoji: '❌' },
  more: { tone: 'neutral', emoji: '⋯' },
}

/* ── Props ────────────────────────────────────────────────────────────────── */

interface ActionButtonBaseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Click handler. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  /** Visible label text (vertical: below the glyph; inline: after it). No default — pass a translated string; absent → icon only. */
  label?: string
  /** Render the emoji instead of the SVG icon. Wire to `useIconMode().isEmoji` for the icons↔emojis seam. */
  showEmoji?: boolean
  /** Native tooltip shown on hover (the `title` attribute). */
  hint?: string
  /** Semantic tone. Defaults to the preset's tone, or `neutral` for a custom icon. */
  tone?: ActionButtonTone
  /** Size — drives padding, glyph size, and label size. Defaults to `sm`. */
  size?: ActionButtonSize
  /**
   * `vertical` (glyph over label, default) or `inline` (glyph left of label). The
   * `vertical` default is for standalone toolbars / action grids. Actions placed in
   * `ShellPageHeader`'s band always render **inline** regardless of this prop — the
   * band's stylesheet forces it, because a stacked label blows out the band height.
   */
  layout?: ActionButtonLayout
  /** When true the label takes the variant colour; otherwise it stays neutral. */
  coloredLabel?: boolean
  /** Disabled state. */
  disabled?: boolean
  /** Button `type` attribute. Defaults to `button`. */
  type?: 'button' | 'submit' | 'reset'
  /** Accessible name. Falls back to the visible `label`, then `hint`. No language default — absent → unnamed (icon only). */
  'aria-label'?: string
  /** Extra classes, merged via `cn()`. */
  className?: string
}

/** Preset action: `action` supplies the glyph, emoji, colour, and default label. */
export interface ActionButtonPresetProps extends ActionButtonBaseProps {
  action: ActionType
  /** Override the preset glyph with a custom node (e.g. a lucide icon or `<Icon>`). */
  icon?: ReactNode
  /** Override the preset emoji. */
  emoji?: string
  /** For `action="star"`: filled + `aria-pressed` when true. */
  active?: boolean
}

/** Custom action: bring your own `icon` node (and optionally an `emoji`). */
export interface ActionButtonIconProps extends ActionButtonBaseProps {
  icon: ReactNode
  emoji?: string
  action?: never
  active?: never
}

export type ActionButtonProps = ActionButtonPresetProps | ActionButtonIconProps

/* ── Component ────────────────────────────────────────────────────────────── */

/**
 * An opinionated icon/emoji + label action button on the semantic theme tokens.
 *
 * Use a **preset** for the common actions — each ships the correct glyph (SVG +
 * emoji) and colour. Presets carry **no text**; pass a translated `label` (visible)
 * and/or `aria-label`/`hint` (accessible name) yourself:
 * ```tsx
 * <ActionButton action="delete" aria-label={t('action.delete')} onClick={onDelete} />
 * <ActionButton action="add" label={t('action.add')} onClick={onAdd} />
 * <ActionButton action="star" active={fav} aria-label={t('action.favorite')} onClick={toggleFav} />
 * ```
 *
 * Or bring a **custom** glyph for anything else:
 * ```tsx
 * <ActionButton icon={<Download />} label={t('action.export')} tone="info" onClick={onExport} />
 * ```
 *
 * It never imports the i18n or icons modules: pass translated text via `label` /
 * `aria-label`, and wire `showEmoji={useIconMode().isEmoji}` to follow the
 * icons↔emojis seam. With no `label`/`aria-label`/`hint` the button is icon-only and
 * has **no accessible name** — supply one for any non-decorative action.
 */
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  function ActionButton(props, ref) {
    const {
      action,
      icon,
      emoji,
      active,
      onClick,
      label,
      showEmoji = false,
      hint,
      tone: toneProp,
      size = 'sm',
      layout = 'vertical',
      coloredLabel = false,
      disabled = false,
      type = 'button',
      'aria-label': ariaLabelProp,
      className,
      ...rest
    } = props

    const isStar = action === 'star'
    const preset = action != null ? actionPresets[action] : undefined

    // Tone: explicit > preset > neutral. Star is special: amber when active,
    // neutral otherwise (with an amber hover, via the star-hover modifier).
    const tone: ActionButtonTone =
      toneProp ?? (isStar ? (active ? 'warning' : 'neutral') : preset?.tone ?? 'neutral')

    const px = ICON_PX[size]
    const resolvedEmoji = emoji ?? preset?.emoji

    // Glyph: emoji mode wins when an emoji is available; else a custom icon; else
    // the preset SVG (star honours its active fill); else the emoji as a fallback.
    let glyph: ReactNode = null
    if (showEmoji && resolvedEmoji != null) {
      glyph = (
        <span className="mrs-action-btn__emoji" style={{ fontSize: px } as CSSProperties}>
          {resolvedEmoji}
        </span>
      )
    } else if (icon != null) {
      glyph = icon
    } else if (isStar) {
      glyph = renderStar(px, !!active)
    } else if (action != null) {
      glyph = PRESET_ICONS[action](px)
    } else if (resolvedEmoji != null) {
      glyph = (
        <span className="mrs-action-btn__emoji" style={{ fontSize: px } as CSSProperties}>
          {resolvedEmoji}
        </span>
      )
    }

    const visibleLabel = label
    const ariaLabel = ariaLabelProp ?? (visibleLabel != null ? undefined : hint)

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        title={hint}
        aria-label={ariaLabel}
        aria-pressed={isStar ? !!active : undefined}
        className={cn(
          actionButtonVariants({ tone, size, layout, coloredLabel: coloredLabel || undefined }),
          isStar && !active && 'mrs-action-btn--star-hover',
          className,
        )}
        {...rest}
      >
        {glyph != null && (
          <span className="mrs-action-btn__glyph" aria-hidden="true">
            {glyph}
          </span>
        )}
        {visibleLabel != null && <span className="mrs-action-btn__label">{visibleLabel}</span>}
      </button>
    )
  },
)

/* ── Group ────────────────────────────────────────────────────────────────── */

export interface ActionButtonGroupProps {
  children?: ReactNode
  /** Stack the buttons vertically instead of in a row. */
  vertical?: boolean
  className?: string
}

/** A flex container for a set of `ActionButton`s — a toolbar row (or column). */
export function ActionButtonGroup({ children, vertical = false, className }: ActionButtonGroupProps) {
  return (
    <div
      role="group"
      className={cn('mrs-action-btn-group', vertical && 'mrs-action-btn-group--vertical', className)}
    >
      {children}
    </div>
  )
}
