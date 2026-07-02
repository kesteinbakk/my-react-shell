import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixDialog from '@radix-ui/react-dialog';
import { cn } from './cn';
import { CloseGlyph } from './CloseGlyph';
import { useDialogDismissGuard } from './useDialogDismissGuard';
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
export function Sheet({ children, trigger, open, onOpenChange, defaultOpen, title, header, headerActions, description, side = 'right', size = 'md', showClose = true, closeLabel, iconMode, scrim = true, modal = true, bare = false, className, overlayClass, panelTestId, }) {
    const showHeader = !bare && (header != null || title != null || showClose || headerActions != null);
    // Keep a nested popper (Select, DropdownMenu, Popover, …) dismissal from tearing down the
    // whole sheet. See useDialogDismissGuard for the full mechanism.
    const guardPopperOutside = useDialogDismissGuard(open);
    return (_jsxs(RadixDialog.Root, { open: open, onOpenChange: onOpenChange, defaultOpen: defaultOpen, modal: modal, children: [trigger != null && _jsx(RadixDialog.Trigger, { asChild: true, children: trigger }), _jsxs(RadixDialog.Portal, { children: [scrim && _jsx(RadixDialog.Overlay, { className: cn('mrs-sheet__overlay', overlayClass) }), _jsx(RadixDialog.Content, { "data-testid": panelTestId, className: cn('mrs-sheet', `mrs-sheet--${side}`, `mrs-sheet--${size}`, className), 
                        // Without a scrim, Radix still traps focus when modal; keep the panel from
                        // grabbing focus away from the live page in the non-modal float case. The popper
                        // guard runs first so a nested Select/menu dismissal never collapses the sheet.
                        onPointerDownOutside: (e) => {
                            guardPopperOutside(e);
                        }, onInteractOutside: (e) => {
                            if (guardPopperOutside(e))
                                return;
                            if (!modal)
                                e.preventDefault();
                        }, children: bare ? (_jsxs(_Fragment, { children: [title != null && (_jsx(RadixDialog.Title, { className: "mrs-sr-only", children: title })), description != null && (_jsx(RadixDialog.Description, { className: "mrs-sr-only", children: description })), children] })) : (_jsxs(_Fragment, { children: [header != null && title != null && (_jsx(RadixDialog.Title, { className: "mrs-sr-only", children: title })), showHeader && (_jsxs("div", { className: "mrs-sheet__header", children: [header != null ? (header) : (title != null && (_jsx(RadixDialog.Title, { className: "mrs-sheet__title", children: title }))), (showClose || headerActions != null) && (_jsxs("div", { className: "mrs-sheet__header-actions", children: [headerActions, showClose && (_jsx(RadixDialog.Close, { className: "mrs-sheet__close", "aria-label": closeLabel, children: _jsx(CloseGlyph, { iconMode: iconMode }) }))] }))] })), description != null && (_jsx(RadixDialog.Description, { className: "mrs-sheet__desc", children: description })), _jsx("div", { className: "mrs-sheet__body", children: children })] })) })] })] }));
}
