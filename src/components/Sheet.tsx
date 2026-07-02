import type { ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { cn } from './cn'
import type { IconMode } from '../icons/iconModeContext'
import { CloseGlyph } from './CloseGlyph'
import { useShellText } from './useShellText'
import { useDialogDismissGuard } from './useDialogDismissGuard'

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
  /**
   * Accessible label for the ✕ close button. Optional — defaults to the shell's
   * built-in, locale-aware "Close" (`mrs.action.close`). Pass a string to override.
   */
  closeLabel?: string
  /**
   * Override the display mode of the ✕ close button. By default the ✕ **follows the
   * app's icons↔emojis seam automatically** (the lucide-style icon in `'icon'` mode,
   * the ✖️ emoji in `'emoji'` mode) with no wiring — reading the icons context softly
   * and falling back to the icon when the icons module isn't installed. Pass this only
   * to force a specific mode regardless of the app setting.
   */
  iconMode?: IconMode
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
  closeLabel,
  iconMode,
  scrim = true,
  modal = true,
  bare = false,
  className,
  overlayClass,
  panelTestId,
}: SheetProps) {
  const st = useShellText()
  const showHeader = !bare && (header != null || title != null || showClose || headerActions != null)
  // Keep a nested popper (Select, DropdownMenu, Popover, …) dismissal from tearing down the
  // whole sheet. See useDialogDismissGuard for the full mechanism.
  const guardPopperOutside = useDialogDismissGuard(open)
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen} modal={modal}>
      {trigger != null && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        {scrim && <RadixDialog.Overlay className={cn('mrs-sheet__overlay', overlayClass)} />}
        <RadixDialog.Content
          data-testid={panelTestId}
          className={cn('mrs-sheet', `mrs-sheet--${side}`, `mrs-sheet--${size}`, className)}
          // Without a scrim, Radix still traps focus when modal; keep the panel from
          // grabbing focus away from the live page in the non-modal float case. The popper
          // guard runs first so a nested Select/menu dismissal never collapses the sheet.
          onPointerDownOutside={(e) => {
            guardPopperOutside(e)
          }}
          onInteractOutside={(e) => {
            if (guardPopperOutside(e)) return
            if (!modal) e.preventDefault()
          }}
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
                        <RadixDialog.Close className="mrs-sheet__close" aria-label={closeLabel ?? st('mrs.action.close')}>
                          <CloseGlyph iconMode={iconMode} />
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
