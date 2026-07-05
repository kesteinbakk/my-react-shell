import type { ReactNode } from 'react';
import type { IconMode } from '../icons/iconModeContext';
/** Which edge the panel slides in from. */
export type SheetSide = 'left' | 'right' | 'top' | 'bottom';
/** Panel extent — width for left/right, height for top/bottom. `full` fills that axis. */
export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
/**
 * Breakpoint at and above which a `permanent` sheet becomes an inline layout panel.
 * `sm` = ≥640px, `lg` = ≥1024px — the same two breakpoints the app-shell uses.
 */
export type SheetPermanentBreakpoint = 'sm' | 'lg';
export interface SheetProps {
    /** Panel content. */
    children: ReactNode;
    /** Optional anchor that opens the sheet (wrapped in the Radix trigger, `asChild`). */
    trigger?: ReactNode;
    /** Controlled open state. */
    open?: boolean;
    /** Open-state change handler (trigger / Esc / outside-click / ✕ call this). */
    onOpenChange?: (open: boolean) => void;
    /**
     * Called when the Escape key is pressed while the sheet is open (forwarded to Radix's
     * `onEscapeKeyDown`). Call `event.preventDefault()` to suppress the default Esc-closes
     * behavior — for a persistent panel that must close only via ✕ or an external toggle.
     */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    /** Initial open state when uncontrolled. */
    defaultOpen?: boolean;
    /** Heading shown in the built-in header row (also the accessible name). */
    title?: ReactNode;
    /** Custom header content, replacing the default title row. */
    header?: ReactNode;
    /** Optional header action icon buttons displayed next to the close button. */
    headerActions?: ReactNode;
    /** Supporting line under the title. */
    description?: ReactNode;
    /** Which edge the panel slides from. Defaults to `right`. */
    side?: SheetSide;
    /** Panel extent. Defaults to `md`. */
    size?: SheetSize;
    /** Render the ✕ close button in the header. Defaults to `true`. */
    showClose?: boolean;
    /**
     * Accessible label for the ✕ close button. Optional — defaults to the shell's
     * built-in, locale-aware "Close" (`mrs.action.close`). Pass a string to override.
     */
    closeLabel?: string;
    /**
     * Override the display mode of the ✕ close button. By default the ✕ **follows the
     * app's icons↔emojis seam automatically** (the lucide-style icon in `'icon'` mode,
     * the ❌ emoji in `'emoji'` mode) with no wiring — reading the icons context softly
     * and falling back to the icon when the icons module isn't installed. Pass this only
     * to force a specific mode regardless of the app setting.
     */
    iconMode?: IconMode;
    /**
     * Render the dimming backdrop behind the panel (default `true`). Set `false` for a
     * sheet that floats over a still-visible page; pair with `modal={false}` to also keep
     * the page interactive and scrollable while the sheet is open.
     */
    scrim?: boolean;
    /**
     * Keep the page behind interactive (no focus trap, no scroll lock). Defaults to
     * `true` (a normal modal sheet). Pair with `scrim={false}` for a non-blocking panel.
     */
    modal?: boolean;
    /**
     * Let a genuine outside click dismiss a **non-modal** sheet. By default a non-modal
     * sheet suppresses outside-click close (the page stays interactive and the panel
     * closes only via its ✕ / an external toggle). Set `true` to instead call
     * `onOpenChange(false)` on a real backdrop click. Has no effect on a modal sheet
     * (Radix already dismisses those on outside click) and is applied only **after** the
     * nested-layer guard passes, so a click inside a nested popper (Select, menu,
     * Popover), a stacked Dialog, or a tooltip never collapses the sheet. Esc handling is
     * unaffected — wire `onEscapeKeyDown` to suppress it separately. Defaults to `false`.
     */
    closeOnOutsideClick?: boolean;
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
    permanent?: SheetPermanentBreakpoint;
    /**
     * Render `children` directly into the panel with no built-in header row and no padded
     * scroll wrapper — for a self-contained, full-height column (e.g. a nav menu) that
     * fills the panel edge-to-edge. `title` / `header` / `showClose` are ignored.
     */
    bare?: boolean;
    /** Extra classes on the panel. */
    className?: string;
    /** Extra classes on the backdrop overlay. */
    overlayClass?: string;
    /** Optional `data-testid` on the panel. */
    panelTestId?: string;
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
export declare function Sheet({ children, trigger, open, onOpenChange, onEscapeKeyDown, defaultOpen, title, header, headerActions, description, side, size, showClose, closeLabel, iconMode, scrim, modal, closeOnOutsideClick, permanent, bare, className, overlayClass, panelTestId, }: SheetProps): import("react").JSX.Element;
