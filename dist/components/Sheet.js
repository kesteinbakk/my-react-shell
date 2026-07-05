import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as RadixDialog from '@radix-ui/react-dialog';
import { cn } from './cn';
import { CloseGlyph } from './CloseGlyph';
import { useShellText } from './useShellText';
import { useDialogDismissGuard } from './useDialogDismissGuard';
import { useMediaQuery } from './useMediaQuery';
import { minWidthQuery } from '../breakpoints';
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
export function Sheet({ children, trigger, open, onOpenChange, onEscapeKeyDown, defaultOpen, title, header, headerActions, description, side = 'right', size = 'md', showClose = true, closeLabel, iconMode, scrim = true, modal = true, closeOnOutsideClick = false, permanent, bare = false, className, overlayClass, panelTestId, }) {
    const st = useShellText();
    // Above the `permanent` breakpoint the sheet renders as an inline layout panel; below
    // it (or when `permanent` is unset) it stays the normal overlay dialog. The hook runs
    // unconditionally — a null query disables the subscription.
    const isPermanent = useMediaQuery(permanent != null ? minWidthQuery(permanent) : null);
    const showHeader = !bare && (header != null || title != null || showClose || headerActions != null);
    // Keep a nested layer — a popper (Select, DropdownMenu, Popover, …) or a stacked Dialog —
    // from tearing down the whole sheet when it's dismissed. See useDialogDismissGuard.
    const guardNestedDismiss = useDialogDismissGuard(open);
    // Permanent mode: an inline, non-dismissible column that occupies real layout space.
    // Not a dialog — no portal, overlay, trigger, or close; `title`/`description` render as
    // plain elements (no accessible-name plumbing needed without a modal focus trap).
    if (permanent != null && isPermanent) {
        const showPermanentHeader = !bare && (header != null || title != null || headerActions != null);
        return (_jsx("aside", { "data-testid": panelTestId, className: cn('mrs-sheet', `mrs-sheet--${side}`, `mrs-sheet--${size}`, 'mrs-sheet--permanent', className), children: bare ? (children) : (_jsxs(_Fragment, { children: [showPermanentHeader && (_jsxs("div", { className: "mrs-sheet__header", children: [header != null ? (header) : (title != null && _jsx("h2", { className: "mrs-sheet__title", children: title })), headerActions != null && (_jsx("div", { className: "mrs-sheet__header-actions", children: headerActions }))] })), description != null && _jsx("p", { className: "mrs-sheet__desc", children: description }), _jsx("div", { className: "mrs-sheet__body", children: children })] })) }));
    }
    return (_jsxs(RadixDialog.Root, { open: open, onOpenChange: onOpenChange, defaultOpen: defaultOpen, modal: modal, children: [trigger != null && _jsx(RadixDialog.Trigger, { asChild: true, children: trigger }), _jsxs(RadixDialog.Portal, { children: [scrim && _jsx(RadixDialog.Overlay, { className: cn('mrs-sheet__overlay', overlayClass) }), _jsx(RadixDialog.Content, { "data-testid": panelTestId, className: cn('mrs-sheet', `mrs-sheet--${side}`, `mrs-sheet--${size}`, className), 
                        // Without a scrim, Radix still traps focus when modal; keep the panel from
                        // grabbing focus away from the live page in the non-modal float case. The nested-layer
                        // guard runs first so a nested Select/menu or stacked Dialog dismissal never collapses
                        // the sheet.
                        onEscapeKeyDown: onEscapeKeyDown, onPointerDownOutside: (e) => {
                            guardNestedDismiss(e);
                        }, onInteractOutside: (e) => {
                            if (guardNestedDismiss(e))
                                return;
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
                                e.preventDefault();
                                onOpenChange?.(false);
                                return;
                            }
                            if (!modal)
                                e.preventDefault();
                        }, children: bare ? (_jsxs(_Fragment, { children: [title != null && (_jsx(RadixDialog.Title, { className: "mrs-sr-only", children: title })), description != null && (_jsx(RadixDialog.Description, { className: "mrs-sr-only", children: description })), children] })) : (_jsxs(_Fragment, { children: [header != null && title != null && (_jsx(RadixDialog.Title, { className: "mrs-sr-only", children: title })), showHeader && (_jsxs("div", { className: "mrs-sheet__header", children: [header != null ? (header) : (title != null && (_jsx(RadixDialog.Title, { className: "mrs-sheet__title", children: title }))), (showClose || headerActions != null) && (_jsxs("div", { className: "mrs-sheet__header-actions", children: [headerActions, showClose && (_jsx(RadixDialog.Close, { className: "mrs-sheet__close", "aria-label": closeLabel ?? st('mrs.action.close'), children: _jsx(CloseGlyph, { iconMode: iconMode }) }))] }))] })), description != null && (_jsx(RadixDialog.Description, { className: "mrs-sheet__desc", children: description })), _jsx("div", { className: "mrs-sheet__body", children: children })] })) })] })] }));
}
