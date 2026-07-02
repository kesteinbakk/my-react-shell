import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from './cn'
import type { DialogButtonProp, DialogButtonConfig } from './Dialog'
import type { Tone } from './tone'
import { TONE_COLOR } from './tone'
import { useShellText } from './useShellText'
import { useDialogDismissGuard } from './useDialogDismissGuard'

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/**
 * Per-tone leading glyph. `primary`/`neutral` are intentionally icon-less — a plain
 * confirm needs no callout — while the four semantic tones each get a matching mark
 * (shared visual language with `Alert`). Override or drop via the `icon` prop.
 */
const DEFAULT_TONE_ICONS: Record<Tone, ReactNode> = {
  primary: null,
  neutral: null,
  info: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  success: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  warning: (
    <svg {...iconProps}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  danger: (
    <svg {...iconProps}>
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  ),
}

export interface ConfirmDialogProps {
  /** Controlled open state. */
  open: boolean
  /** Open-state change handler (backdrop / Esc / Cancel call this with `false`). */
  onOpenChange: (open: boolean) => void
  /** Dialog heading — required (also the accessible name). */
  title: ReactNode
  /** Supporting line under the title. */
  description?: ReactNode
  /** Optional custom body, rendered below the description. */
  children?: ReactNode
  /**
   * Semantic tone. Drives the leading tone icon and the confirm button colour: the
   * confirm button stays `primary` for every tone **except** `danger` and `warning`,
   * which adopt the tone. Defaults to `neutral` (primary button, no icon).
   */
  tone?: Tone
  /**
   * Override the tone's leading icon, or pass `false` to drop it. Defaults to the
   * per-tone glyph (`info`/`success`/`warning`/`danger`; none for `primary`/`neutral`).
   */
  icon?: ReactNode | false
  /**
   * Confirm button label or configuration. Defaults to the shell's built-in,
   * locale-aware "OK" (`mrs.action.ok`); pass a string for any other label. A
   * `DialogButtonConfig` overrides the tone-derived button colour.
   */
  useConfirm?: DialogButtonProp
  /** Confirm button label. Defaults to the built-in `mrs.action.ok`. Superseded by `useConfirm`. */
  confirmLabel?: string
  /**
   * Cancel button label or configuration. Its presence renders the cancel button — see
   * `showCancel`. Superseded by `useCancel` when set.
   */
  cancelLabel?: string
  /** Cancel button label or configuration. Its presence renders the cancel button. */
  useCancel?: DialogButtonProp
  /** Force-render the cancel button even when no `cancelLabel`/`onCancel`/`useCancel` is set. */
  showCancel?: boolean
  /** Called when the confirm button is pressed. */
  onConfirm?: () => void
  /** Called when the cancel button is pressed. Its presence renders the cancel button. */
  onCancel?: () => void
  /** Disables both buttons while an async confirm is in flight. */
  loading?: boolean
  className?: string
}

/**
 * Pre-built confirmation dialog on Radix Dialog (overlay, focus trap, Esc/backdrop
 * close, portal). Styled with the theme tokens; renders its own confirm/cancel buttons.
 *
 * The confirm button defaults to the built-in, locale-aware "OK" (`mrs.action.ok`) and
 * always shows on the right. The cancel button is opt-in on the left — it renders only
 * when at least one of `showCancel`, `onCancel`, `cancelLabel`, or `useCancel` is
 * provided (label defaulting to `mrs.action.cancel`). `tone` colours a leading icon and
 * the confirm button.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  tone = 'neutral',
  icon,
  useConfirm,
  confirmLabel,
  cancelLabel,
  useCancel,
  showCancel = false,
  onConfirm,
  onCancel,
  loading = false,
  className,
}: ConfirmDialogProps) {
  const st = useShellText()
  const getButtonClass = (t: Tone) => {
    switch (t) {
      case 'danger':
        return 'mrs-dialog__btn--danger'
      case 'warning':
        return 'mrs-dialog__btn--warning'
      case 'info':
        return 'mrs-dialog__btn--info'
      case 'success':
        return 'mrs-dialog__btn--success'
      case 'primary':
        return 'mrs-dialog__btn--primary'
      case 'neutral':
        return 'mrs-dialog__btn--ghost'
    }
  }

  // Cancel is opt-in: any of these props asks for it.
  const cancelRequested =
    showCancel || useCancel != null || cancelLabel != null || onCancel != null

  const cancelConfig: DialogButtonConfig = (() => {
    if (useCancel != null) {
      return typeof useCancel === 'string' ? { label: useCancel } : useCancel
    }
    return { label: cancelLabel ?? st('mrs.action.cancel') }
  })()
  const cancelClick = cancelConfig.onClick ?? onCancel ?? (() => onOpenChange(false))
  const cancelLoading = cancelConfig.loading ?? loading
  const cancelTone: Tone = cancelConfig.tone ?? 'neutral'

  const confirmConfig: DialogButtonConfig = (() => {
    if (useConfirm != null) {
      return typeof useConfirm === 'string' ? { label: useConfirm } : useConfirm
    }
    return { label: confirmLabel ?? st('mrs.action.ok') }
  })()
  const confirmClick = confirmConfig.onClick ?? onConfirm ?? (() => onOpenChange(false))
  const confirmLoading = confirmConfig.loading ?? loading
  // The confirm button stays primary except for danger/warning, which adopt the tone.
  const derivedConfirmTone: Tone =
    tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'primary'
  const confirmTone: Tone = confirmConfig.tone ?? derivedConfirmTone

  const leadingIcon = icon === false ? null : (icon ?? DEFAULT_TONE_ICONS[tone])

  // Keep a nested popper (Select, DropdownMenu, Popover, …) dismissal from tearing down the
  // whole dialog. See useDialogDismissGuard for the full mechanism.
  const guardPopperOutside = useDialogDismissGuard(open)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="mrs-dialog__overlay" />
        <Dialog.Content
          className={cn('mrs-dialog', className)}
          onPointerDownOutside={(e) => {
            guardPopperOutside(e)
          }}
          onInteractOutside={(e) => {
            guardPopperOutside(e)
          }}
        >
          <div className="mrs-dialog__title-row">
            {leadingIcon != null && (
              <span
                className="mrs-dialog__tone-icon"
                style={{ color: TONE_COLOR[tone] }}
                aria-hidden="true"
              >
                {leadingIcon}
              </span>
            )}
            <Dialog.Title className="mrs-dialog__title">{title}</Dialog.Title>
          </div>
          {description != null && (
            <Dialog.Description className="mrs-dialog__desc">{description}</Dialog.Description>
          )}
          {children}
          <div className="mrs-dialog__actions">
            <button
              type="button"
              className={cn('mrs-dialog__btn', getButtonClass(confirmTone))}
              onClick={confirmClick}
              disabled={confirmLoading}
              aria-busy={confirmLoading || undefined}
            >
              {confirmConfig.label}
            </button>
            {cancelRequested && (
              <button
                type="button"
                className={cn('mrs-dialog__btn', getButtonClass(cancelTone))}
                style={{ marginRight: 'auto', order: -1 }}
                onClick={cancelClick}
                disabled={cancelLoading}
                aria-busy={cancelLoading || undefined}
              >
                {cancelConfig.label}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
