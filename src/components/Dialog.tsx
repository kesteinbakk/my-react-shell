import type { ReactNode, CSSProperties } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { cn } from './cn'
import type { Tone } from './tone'
import type { IconMode } from '../icons/iconModeContext'
import { CloseGlyph } from './CloseGlyph'
import { useDialogDismissGuard } from './useDialogDismissGuard'

export interface DialogButtonConfig {
  /** The button label. */
  label: ReactNode
  /** Click callback. If omitted, defaults to closing the dialog via onOpenChange(false). */
  onClick?: () => void
  /** Style tone. */
  tone?: Tone
  /** Shows loading state and disables the button. */
  loading?: boolean
}

export type DialogButtonProp = string | DialogButtonConfig

/** Outer width of the dialog card. `full` fills the viewport (minus a small inset). */
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface DialogProps {
  /** Controlled open state. */
  open: boolean
  /** Open-state change handler (backdrop / Esc / ✕ call this with `false`). */
  onOpenChange: (open: boolean) => void
  /** Dialog heading — required (also the accessible name). */
  title: ReactNode
  /** Optional control rendered on the title row, next to the heading (standard mode). */
  titleActions?: ReactNode
  /** Optional header action icon buttons displayed next to the close button. */
  headerActions?: ReactNode
  /** Supporting line under the title. */
  description?: ReactNode
  /** Dialog body. */
  children?: ReactNode
  /** Optional content for the bottom actions row (e.g. buttons). */
  footer?: ReactNode
  /** Render a default Cancel button on the left of the footer with this label or config. */
  useCancel?: DialogButtonProp
  /** Render a default Primary button on the right of the footer with this label or config. */
  usePrimary?: DialogButtonProp
  /** Outer width. Defaults to `md`. */
  size?: DialogSize
  /**
   * Full-bleed content mode: the dialog drops its own padding/spacing and the consumer
   * owns the entire inner layout (e.g. a sticky header band + a scrolling body, an
   * edge-to-edge viewer). `title` is still required and kept as the accessible name
   * (visually hidden); render your own visible header inside `children`. The `footer`
   * slot is ignored in this mode.
   */
  bleed?: boolean
  /** Render the top-right ✕ close button. Defaults to `true`. */
  showClose?: boolean
  /** Accessible label for the ✕ close button — **required**; pass a translated string. */
  closeLabel: string
  /**
   * Override the display mode of the ✕ close button. By default the ✕ **follows the
   * app's icons↔emojis seam automatically** (the lucide-style icon in `'icon'` mode,
   * the ✖️ emoji in `'emoji'` mode) with no wiring — reading the icons context softly
   * and falling back to the icon when the icons module isn't installed. Pass this only
   * to force a specific mode regardless of the app setting.
   */
  iconMode?: IconMode
  /** Close when the backdrop is clicked. Defaults to `true`; set `false` to guard unsaved edits. */
  closeOnBackdrop?: boolean
  /** Close when Esc is pressed. Defaults to `true`. */
  closeOnEsc?: boolean
  /**
   * Override where Radix sends focus when the dialog opens. Pass `(e) => e.preventDefault()`
   * to suppress the default auto-focus (useful when the first focusable element is a header
   * action button that should not appear pre-selected on open).
   */
  onOpenAutoFocus?: (e: Event) => void
  className?: string
}

/**
 * General-purpose controlled dialog on Radix Dialog (overlay, focus trap, Esc/backdrop
 * close, portal). Unlike `ConfirmDialog`, it renders no buttons of its own — pass your
 * own body in `children` and any actions in `footer`. Styled with the theme tokens.
 *
 * The content caps at the viewport height and the body scrolls within it. For dialogs
 * that aren't the standard padded card — a full-bleed viewer, a custom sticky header —
 * use `bleed` and own the inner layout. `size` sets the width; `titleActions` puts a
 * control on the heading row; `closeOnBackdrop`/`closeOnEsc` control what dismisses it.
 *
 * ```tsx
 * <Dialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Edit profile"
 *   description="Update your details."
 *   footer={<Button onClick={save}>Save</Button>}
 * >
 *   <Input value={name} onChange={(e) => setName(e.target.value)} />
 * </Dialog>
 *
 * // Full-bleed viewer that won't discard on backdrop click:
 * <Dialog open={open} onOpenChange={setOpen} title="Document" size="xl" bleed closeOnBackdrop={false}>
 *   <header className="…sticky header…">…</header>
 *   <div className="…scrolling body…">…</div>
 * </Dialog>
 * ```
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  titleActions,
  headerActions,
  description,
  children,
  footer,
  useCancel,
  usePrimary,
  size = 'md',
  bleed = false,
  showClose = true,
  closeLabel,
  iconMode,
  closeOnBackdrop = true,
  closeOnEsc = true,
  onOpenAutoFocus,
  className,
}: DialogProps) {
  const getButtonClass = (tone: Tone) => {
    switch (tone) {
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

  const renderButton = (
    prop: DialogButtonProp,
    defaultTone: Tone,
    style?: CSSProperties
  ) => {
    const config: DialogButtonConfig = typeof prop === 'string' ? { label: prop } : prop
    const tone = config.tone ?? defaultTone
    const onClick = config.onClick ?? (() => onOpenChange(false))
    const loading = config.loading ?? false

    return (
      <button
        type="button"
        className={cn('mrs-dialog__btn', getButtonClass(tone))}
        style={style}
        onClick={onClick}
        disabled={loading}
        aria-busy={loading || undefined}
      >
        {config.label}
      </button>
    )
  }

  // Keep a nested popper (Select, DropdownMenu, Popover, …) dismissal from tearing down the
  // whole dialog. See useDialogDismissGuard for the full mechanism.
  const guardPopperOutside = useDialogDismissGuard(open)

  const hasActions = useCancel != null || usePrimary != null || footer != null
  const renderedFooter = hasActions ? (
    <>
      {footer}
      {usePrimary != null && renderButton(usePrimary, 'primary')}
      {useCancel != null && renderButton(useCancel, 'neutral', { marginRight: 'auto', order: -1 })}
    </>
  ) : null

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="mrs-dialog__overlay" />
        <RadixDialog.Content
          className={cn(
            'mrs-dialog',
            `mrs-dialog--${size}`,
            bleed && 'mrs-dialog--bleed',
            className,
          )}
          onPointerDownOutside={(e) => {
            if (guardPopperOutside(e)) return
            if (!closeOnBackdrop) e.preventDefault()
          }}
          onInteractOutside={(e) => {
            if (guardPopperOutside(e)) return
            if (!closeOnBackdrop) e.preventDefault()
          }}
          onEscapeKeyDown={closeOnEsc ? undefined : (e) => e.preventDefault()}
          onOpenAutoFocus={onOpenAutoFocus}
        >
          {bleed ? (
            <>
              {/* Accessible name only — the visible header lives in children. */}
              <RadixDialog.Title className="mrs-dialog__title mrs-sr-only">
                {title}
              </RadixDialog.Title>
              {description != null && (
                <RadixDialog.Description className="mrs-sr-only">
                  {description}
                </RadixDialog.Description>
              )}
              {children}
            </>
          ) : (
            <>
              <div className="mrs-dialog__header">
                <RadixDialog.Title className="mrs-dialog__title">{title}</RadixDialog.Title>
                {titleActions != null && (
                  <div className="mrs-dialog__title-actions">{titleActions}</div>
                )}
              </div>
              {description != null && (
                <RadixDialog.Description className="mrs-dialog__desc">
                  {description}
                </RadixDialog.Description>
              )}
              {children != null && <div className="mrs-dialog__body">{children}</div>}
              {renderedFooter != null && <div className="mrs-dialog__actions">{renderedFooter}</div>}
            </>
          )}
          {(showClose || headerActions != null) && (
            <div className="mrs-dialog__close-container">
              {headerActions}
              {showClose && (
                <RadixDialog.Close className="mrs-dialog__close" aria-label={closeLabel}>
                  <CloseGlyph iconMode={iconMode} />
                </RadixDialog.Close>
              )}
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
