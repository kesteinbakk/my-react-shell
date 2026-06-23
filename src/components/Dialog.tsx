import type { ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { cn } from './cn'

export interface DialogProps {
  /** Controlled open state. */
  open: boolean
  /** Open-state change handler (backdrop / Esc / ✕ call this with `false`). */
  onOpenChange: (open: boolean) => void
  /** Dialog heading — required (also the accessible name). */
  title: ReactNode
  /** Supporting line under the title. */
  description?: ReactNode
  /** Dialog body. */
  children?: ReactNode
  /** Optional content for the bottom actions row (e.g. buttons). */
  footer?: ReactNode
  /** Render the top-right ✕ close button. Defaults to `true`. */
  showClose?: boolean
  /** Accessible label for the ✕ close button. Defaults to `"Close"`. */
  closeLabel?: string
  className?: string
}

/**
 * General-purpose controlled dialog on Radix Dialog (overlay, focus trap, Esc/backdrop
 * close, portal). Unlike `ConfirmDialog`, it renders no buttons of its own — pass your
 * own body in `children` and any actions in `footer`. Styled with the theme tokens.
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
 * ```
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  showClose = true,
  closeLabel = 'Close',
  className,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="mrs-dialog__overlay" />
        <RadixDialog.Content className={cn('mrs-dialog', className)}>
          <RadixDialog.Title className="mrs-dialog__title">{title}</RadixDialog.Title>
          {description != null && (
            <RadixDialog.Description className="mrs-dialog__desc">
              {description}
            </RadixDialog.Description>
          )}
          {showClose && (
            <RadixDialog.Close className="mrs-dialog__close" aria-label={closeLabel}>
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </RadixDialog.Close>
          )}
          {children != null && <div className="mrs-dialog__body">{children}</div>}
          {footer != null && <div className="mrs-dialog__actions">{footer}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
