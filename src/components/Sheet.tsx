import type { ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { cn } from './cn'

/** Which edge the panel slides in from. */
export type SheetSide = 'left' | 'right' | 'top' | 'bottom'
/** Panel extent — width for left/right, height for top/bottom. `full` fills that axis. */
export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface SheetProps {
  /** Panel content. */
  children: ReactNode
  /** Optional anchor that opens the sheet (wrapped in the Radix trigger, `asChild`). */
  trigger?: ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Open-state change handler (trigger / Esc / outside-click / ✕ call this). */
  onOpenChange?: (open: boolean) => void
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean
  /** Heading shown in the built-in header row (also the accessible name). */
  title?: ReactNode
  /** Custom header content, replacing the default title row. */
  header?: ReactNode
  /** Optional header action icon buttons displayed next to the close button. */
  headerActions?: ReactNode
  /** Supporting line under the title. */
  description?: ReactNode
  /** Which edge the panel slides from. Defaults to `right`. */
  side?: SheetSide
  /** Panel extent. Defaults to `md`. */
  size?: SheetSize
  /** Render the ✕ close button in the header. Defaults to `true`. */
  showClose?: boolean
  /** Accessible label for the ✕ close button. Defaults to `"Close"`. */
  closeLabel?: string
  /**
   * Render the dimming backdrop behind the panel (default `true`). Set `false` for a
   * sheet that floats over a still-visible page; pair with `modal={false}` to also keep
   * the page interactive and scrollable while the sheet is open.
   */
  scrim?: boolean
  /**
   * Keep the page behind interactive (no focus trap, no scroll lock). Defaults to
   * `true` (a normal modal sheet). Pair with `scrim={false}` for a non-blocking panel.
   */
  modal?: boolean
  /**
   * Render `children` directly into the panel with no built-in header row and no padded
   * scroll wrapper — for a self-contained, full-height column (e.g. a nav menu) that
   * fills the panel edge-to-edge. `title` / `header` / `showClose` are ignored.
   */
  bare?: boolean
  /** Extra classes on the panel. */
  className?: string
  /** Extra classes on the backdrop overlay. */
  overlayClass?: string
  /** Optional `data-testid` on the panel. */
  panelTestId?: string
}

const CloseIcon = () => (
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
)

/**
 * Overlay sheet that slides in from any edge — for navigation menus, filters, detail
 * panels, or any content that overlays the page. Built on Radix Dialog (focus trap,
 * Esc / outside-click close, portal), themed against the tokens. `side` picks the edge,
 * `size` the extent (width for left/right, height for top/bottom). Works controlled
 * (`open` / `onOpenChange`) or uncontrolled (`defaultOpen`), with an optional `trigger`.
 *
 * `scrim={false}` (with `modal={false}`) keeps the page visible and interactive; `bare`
 * hands the whole panel to a self-contained child.
 *
 * ```tsx
 * <Sheet trigger={<Button>Filters</Button>} title="Filters" side="right">
 *   …
 * </Sheet>
 *
 * // Non-blocking, page stays interactive:
 * <Sheet open={open} onOpenChange={setOpen} side="bottom" size="sm" scrim={false} modal={false} bare>
 *   <Toolbar />
 * </Sheet>
 * ```
 */
export function Sheet({
  children,
  trigger,
  open,
  onOpenChange,
  defaultOpen,
  title,
  header,
  headerActions,
  description,
  side = 'right',
  size = 'md',
  showClose = true,
  closeLabel = 'Close',
  scrim = true,
  modal = true,
  bare = false,
  className,
  overlayClass,
  panelTestId,
}: SheetProps) {
  const showHeader = !bare && (header != null || title != null || showClose || headerActions != null)
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen} modal={modal}>
      {trigger != null && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        {scrim && <RadixDialog.Overlay className={cn('mrs-sheet__overlay', overlayClass)} />}
        <RadixDialog.Content
          data-testid={panelTestId}
          className={cn('mrs-sheet', `mrs-sheet--${side}`, `mrs-sheet--${size}`, className)}
          // Without a scrim, Radix still traps focus when modal; keep the panel from
          // grabbing focus away from the live page in the non-modal float case.
          onInteractOutside={modal ? undefined : (e) => e.preventDefault()}
        >
          {bare ? (
            <>
              {/* Accessible name only — the bare child owns the visible chrome. */}
              {title != null && (
                <RadixDialog.Title className="mrs-sr-only">{title}</RadixDialog.Title>
              )}
              {description != null && (
                <RadixDialog.Description className="mrs-sr-only">
                  {description}
                </RadixDialog.Description>
              )}
              {children}
            </>
          ) : (
            <>
              {/* A custom header replaces the visible title, but the dialog still needs
                  an accessible name — keep `title` as a visually-hidden Title. */}
              {header != null && title != null && (
                <RadixDialog.Title className="mrs-sr-only">{title}</RadixDialog.Title>
              )}
              {showHeader && (
                <div className="mrs-sheet__header">
                  {header != null ? (
                    header
                  ) : (
                    title != null && (
                      <RadixDialog.Title className="mrs-sheet__title">{title}</RadixDialog.Title>
                    )
                  )}
                  {(showClose || headerActions != null) && (
                    <div className="mrs-sheet__header-actions">
                      {headerActions}
                      {showClose && (
                        <RadixDialog.Close className="mrs-sheet__close" aria-label={closeLabel}>
                          <CloseIcon />
                        </RadixDialog.Close>
                      )}
                    </div>
                  )}
                </div>
              )}
              {description != null && (
                <RadixDialog.Description className="mrs-sheet__desc">
                  {description}
                </RadixDialog.Description>
              )}
              <div className="mrs-sheet__body">{children}</div>
            </>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
