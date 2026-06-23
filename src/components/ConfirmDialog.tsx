import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from './cn'

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
  /** Confirm button label. Defaults to `"Confirm"`. */
  confirmLabel?: string
  /** Cancel button label. Defaults to `"Cancel"`. */
  cancelLabel?: string
  /** `danger` makes the confirm button destructive. */
  tone?: 'neutral' | 'danger'
  /** Called when the confirm button is pressed. */
  onConfirm: () => void
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
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'neutral',
  onConfirm,
  loading = false,
  className,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="mrs-dialog__overlay" />
        <Dialog.Content className={cn('mrs-dialog', className)}>
          <Dialog.Title className="mrs-dialog__title">{title}</Dialog.Title>
          {description != null && (
            <Dialog.Description className="mrs-dialog__desc">{description}</Dialog.Description>
          )}
          {children}
          <div className="mrs-dialog__actions">
            <button
              type="button"
              className="mrs-dialog__btn mrs-dialog__btn--ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={cn(
                'mrs-dialog__btn',
                tone === 'danger' ? 'mrs-dialog__btn--danger' : 'mrs-dialog__btn--primary',
              )}
              onClick={onConfirm}
              disabled={loading}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
