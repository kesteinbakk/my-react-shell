import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from './cn'
import type { DialogButtonProp, DialogButtonConfig } from './Dialog'
import { useDialogDismissGuard } from './useDialogDismissGuard'

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
  /** Confirm button label or configuration. If omitted, uses confirmLabel / onConfirm / tone. */
  useConfirm?: DialogButtonProp
  /** Cancel button label or configuration. If omitted, uses cancelLabel. */
  useCancel?: DialogButtonProp
  /** Confirm button label — **required**; pass a translated string via your i18n seam. */
  confirmLabel: string
  /** Cancel button label — **required**; pass a translated string via your i18n seam. */
  cancelLabel: string
  /** `danger` makes the confirm button destructive. */
  tone?: 'neutral' | 'danger'
  /** Called when the confirm button is pressed. */
  onConfirm?: () => void
  /** Disables both buttons while an async confirm is in flight. */
  loading?: boolean
  className?: string
}

/**
 * Pre-built confirmation dialog on Radix Dialog (overlay, focus trap, Esc/backdrop
 * close, portal). Styled with the theme tokens; renders its own confirm/cancel
 * buttons.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  useConfirm,
  useCancel,
  confirmLabel,
  cancelLabel,
  tone = 'neutral',
  onConfirm,
  loading = false,
  className,
}: ConfirmDialogProps) {
  const getButtonClass = (t: 'primary' | 'neutral' | 'danger') => {
    if (t === 'danger') return 'mrs-dialog__btn--danger'
    if (t === 'primary') return 'mrs-dialog__btn--primary'
    return 'mrs-dialog__btn--ghost'
  }

  // Parse cancel config
  const cancelConfig: DialogButtonConfig = (() => {
    if (useCancel != null) {
      return typeof useCancel === 'string' ? { label: useCancel } : useCancel
    }
    return { label: cancelLabel }
  })()
  const cancelClick = cancelConfig.onClick ?? (() => onOpenChange(false))
  const cancelLoading = cancelConfig.loading ?? loading
  const cancelTone = cancelConfig.tone ?? 'neutral'

  // Parse confirm config
  const confirmConfig: DialogButtonConfig = (() => {
    if (useConfirm != null) {
      return typeof useConfirm === 'string' ? { label: useConfirm } : useConfirm
    }
    return { label: confirmLabel }
  })()
  const confirmClick = confirmConfig.onClick ?? onConfirm ?? (() => onOpenChange(false))
  const confirmLoading = confirmConfig.loading ?? loading
  const confirmTone = confirmConfig.tone ?? (tone === 'danger' ? 'danger' : 'primary')

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
          <Dialog.Title className="mrs-dialog__title">{title}</Dialog.Title>
          {description != null && (
            <Dialog.Description className="mrs-dialog__desc">{description}</Dialog.Description>
          )}
          {children}
          <div className="mrs-dialog__actions">
            <button
              type="button"
              className={cn('mrs-dialog__btn', getButtonClass(cancelTone))}
              style={{ marginRight: 'auto' }}
              onClick={cancelClick}
              disabled={cancelLoading}
              aria-busy={cancelLoading || undefined}
            >
              {cancelConfig.label}
            </button>
            <button
              type="button"
              className={cn('mrs-dialog__btn', getButtonClass(confirmTone))}
              onClick={confirmClick}
              disabled={confirmLoading}
              aria-busy={confirmLoading || undefined}
            >
              {confirmConfig.label}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
