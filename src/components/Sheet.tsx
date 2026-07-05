import type { ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { cn } from './cn'
import type { IconMode } from '../icons/iconModeContext'
import { CloseGlyph } from './CloseGlyph'
import { useShellText } from './useShellText'
import { useDialogDismissGuard } from './useDialogDismissGuard'
import { useMediaQuery } from './useMediaQuery'

/** Which edge the panel slides in from. */
export type SheetSide = 'left' | 'right' | 'top' | 'bottom'
/** Panel extent — width for left/right, height for top/bottom. `full` fills that axis. */
export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'
/**
 * Breakpoint at and above which a `permanent` sheet becomes an inline layout panel.
 * `sm` = ≥640px, `lg` = ≥1024px — the same two breakpoints the app-shell uses.
 */
export type SheetPermanentBreakpoint = 'sm' | 'lg'

/** Min-width media query for each permanent breakpoint. */
const PERMANENT_QUERY: Record<SheetPermanentBreakpoint, string> = {
  sm: '(min-width: 640px)',
  lg: '(min-width: 1024px)',
}

export interface SheetProps {
  /** Panel content. */
  children: ReactNode
  /** Optional anchor that opens the sheet (wrapped in the Radix trigger, `asChild`). */
  trigger?: ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Open-state change handler (trigger / Esc / outside-click / ✕ call this). */
  onOpenChange?: (open: boolean) => void
  /**
   * Called when the Escape key is pressed while the sheet is open (forwarded to Radix's
   * `onEscapeKeyDown`). Call `event.preventDefault()` to suppress the default Esc-closes
   * behavior — for a persistent panel that must close only via ✕ or an external toggle.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void
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
   * the ❌ emoji in `'emoji'` mode) with no wiring — reading the icons context softly
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
   * Let a genuine outside click dismiss a **non-modal** sheet. By default a non-modal
   * sheet suppresses outside-click close (the page stays interactive and the panel
   * closes only via its ✕ / an external toggle). Set `true` to instead close on a real
   * backdrop click: the shell `preventDefault`s the outside interaction (so Radix's own
   * DismissableLayer dismiss does not *also* fire) and calls `onOpenChange(false)` as the
   * single close channel — the same channel the ✕ uses, so the exit animation plays and
   * the panel unmounts cleanly. Has no effect on a modal sheet (Radix already dismisses
   * those on outside click) and is applied only **after** the nested-layer guard passes,
   * so a click inside a nested popper (Select, menu, Popover), a stacked Dialog, or a
   * tooltip never collapses the sheet. Esc handling is unaffected — wire `onEscapeKeyDown`
   * to suppress it separately. Defaults to `false`.
   */
  closeOnOutsideClick?: boolean
  /**
   * Make the sheet a **permanent, non-modal, non-dismissible layout panel** at and
   * above the given breakpoint (`sm` = ≥640px, `lg` = ≥1024px). Above it, the panel
   * renders inline as a real layout sibling that occupies UI space — no portal, no
   * overlay, no close affordance, always visible. Below it, the sheet falls back to a
   * normal modal sheet honoring `modal` / `scrim` (open via `trigger` / `open`,
   * dismissible via ✕ / Esc). Above the breakpoint `trigger`, `scrim`, `modal`,
   * `showClose`, `open` / `onOpenChange`, and the dismiss handlers are ignored.
   *
   * Because a permanent panel participates in layout, place `<Sheet>` as a flex/grid
   * sibling of the content it flanks (unlike an overlay sheet, which can sit anywhere).
   */
  permanent?: SheetPermanentBreakpoint
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
  onEscapeKeyDown,
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
  closeOnOutsideClick = false,
  permanent,
  bare = false,
  className,
  overlayClass,
  panelTestId,
}: SheetProps) {
  const st = useShellText()
  // Above the `permanent` breakpoint the sheet renders as an inline layout panel; below
  // it (or when `permanent` is unset) it stays the normal overlay dialog. The hook runs
  // unconditionally — a null query disables the subscription.
  const isPermanent = useMediaQuery(permanent != null ? PERMANENT_QUERY[permanent] : null)
  const showHeader = !bare && (header != null || title != null || showClose || headerActions != null)
  // Keep a nested layer — a popper (Select, DropdownMenu, Popover, …) or a stacked Dialog —
  // from tearing down the whole sheet when it's dismissed. See useDialogDismissGuard.
  const guardNestedDismiss = useDialogDismissGuard(open)

  // Permanent mode: an inline, non-dismissible column that occupies real layout space.
  // Not a dialog — no portal, overlay, trigger, or close; `title`/`description` render as
  // plain elements (no accessible-name plumbing needed without a modal focus trap).
  if (permanent != null && isPermanent) {
    const showPermanentHeader = !bare && (header != null || title != null || headerActions != null)
    return (
      <aside
        data-testid={panelTestId}
        className={cn('mrs-sheet', `mrs-sheet--${side}`, `mrs-sheet--${size}`, 'mrs-sheet--permanent', className)}
      >
        {bare ? (
          children
        ) : (
          <>
            {showPermanentHeader && (
              <div className="mrs-sheet__header">
                {header != null ? (
                  header
                ) : (
                  title != null && <h2 className="mrs-sheet__title">{title}</h2>
                )}
                {headerActions != null && (
                  <div className="mrs-sheet__header-actions">{headerActions}</div>
                )}
              </div>
            )}
            {description != null && <p className="mrs-sheet__desc">{description}</p>}
            <div className="mrs-sheet__body">{children}</div>
          </>
        )}
      </aside>
    )
  }

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen} modal={modal}>
      {trigger != null && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        {scrim && <RadixDialog.Overlay className={cn('mrs-sheet__overlay', overlayClass)} />}
        <RadixDialog.Content
          data-testid={panelTestId}
          className={cn('mrs-sheet', `mrs-sheet--${side}`, `mrs-sheet--${size}`, className)}
          // Without a scrim, Radix still traps focus when modal; keep the panel from
          // grabbing focus away from the live page in the non-modal float case. The nested-layer
          // guard runs first so a nested Select/menu or stacked Dialog dismissal never collapses
          // the sheet.
          onEscapeKeyDown={onEscapeKeyDown}
          onPointerDownOutside={(e) => {
            guardNestedDismiss(e)
          }}
          onInteractOutside={(e) => {
            if (guardNestedDismiss(e)) return
            // Non-modal default suppresses outside-close. With `closeOnOutsideClick`,
            // a genuine backdrop click (the guard already excluded poppers, tooltips,
            // and stacked dialogs above) instead dismisses the sheet.
            if (!modal && closeOnOutsideClick) {
              // preventDefault FIRST so Radix's own DismissableLayer `onDismiss`
              // (which fires when the event is not defaulted) does NOT also close
              // the dialog. Without this the dialog is closed through two channels
              // in one tick — the consumer's `onOpenChange(false)` here AND Radix's
              // internal `setOpen(false)` — and the double transition strands the
              // exit animation: `data-state` flips to "closed" but the slide-out
              // never plays, so `animationend` never fires and Radix Presence keeps
              // the panel mounted forever. Routing through the single consumer
              // channel (matching the ✕ path) makes the exit animate and unmount.
              e.preventDefault()
              onOpenChange?.(false)
              return
            }
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
