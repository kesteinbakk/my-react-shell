import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixDialog from '@radix-ui/react-dialog';
import { cn } from './cn';
import { CloseGlyph } from './CloseGlyph';
import { useShellText } from './useShellText';
import { useDialogDismissGuard } from './useDialogDismissGuard';
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
export function Dialog({ open, onOpenChange, title, titleActions, headerActions, description, children, footer, useCancel, usePrimary, size = 'md', bleed = false, showClose = true, closeLabel, iconMode, closeOnBackdrop = true, closeOnEsc = true, onOpenAutoFocus, className, }) {
    const st = useShellText();
    const getButtonClass = (tone) => {
        switch (tone) {
            case 'danger':
                return 'mrs-dialog__btn--danger';
            case 'warning':
                return 'mrs-dialog__btn--warning';
            case 'info':
                return 'mrs-dialog__btn--info';
            case 'success':
                return 'mrs-dialog__btn--success';
            case 'primary':
                return 'mrs-dialog__btn--primary';
            case 'neutral':
                return 'mrs-dialog__btn--ghost';
        }
    };
    const renderButton = (prop, defaultTone, style) => {
        const config = typeof prop === 'string' ? { label: prop } : prop;
        const tone = config.tone ?? defaultTone;
        const onClick = config.onClick ?? (() => onOpenChange(false));
        const loading = config.loading ?? false;
        return (_jsx("button", { type: "button", className: cn('mrs-dialog__btn', getButtonClass(tone)), style: style, onClick: onClick, disabled: loading, "aria-busy": loading || undefined, children: config.label }));
    };
    // Keep a nested layer — a popper (Select, DropdownMenu, Popover, …) or a stacked Dialog —
    // from tearing down the whole dialog when it's dismissed. See useDialogDismissGuard.
    const guardNestedDismiss = useDialogDismissGuard(open);
    const hasActions = useCancel != null || usePrimary != null || footer != null;
    const renderedFooter = hasActions ? (_jsxs(_Fragment, { children: [footer, usePrimary != null && renderButton(usePrimary, 'primary'), useCancel != null && renderButton(useCancel, 'neutral', { marginRight: 'auto', order: -1 })] })) : null;
    return (_jsx(RadixDialog.Root, { open: open, onOpenChange: onOpenChange, children: _jsxs(RadixDialog.Portal, { children: [_jsx(RadixDialog.Overlay, { className: "mrs-dialog__overlay" }), _jsxs(RadixDialog.Content, { className: cn('mrs-dialog', `mrs-dialog--${size}`, bleed && 'mrs-dialog--bleed', className), onPointerDownOutside: (e) => {
                        if (guardNestedDismiss(e))
                            return;
                        if (!closeOnBackdrop)
                            e.preventDefault();
                    }, onInteractOutside: (e) => {
                        if (guardNestedDismiss(e))
                            return;
                        if (!closeOnBackdrop)
                            e.preventDefault();
                    }, onEscapeKeyDown: closeOnEsc ? undefined : (e) => e.preventDefault(), onOpenAutoFocus: onOpenAutoFocus, children: [bleed ? (_jsxs(_Fragment, { children: [_jsx(RadixDialog.Title, { className: "mrs-dialog__title mrs-sr-only", children: title }), description != null && (_jsx(RadixDialog.Description, { className: "mrs-sr-only", children: description })), children] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mrs-dialog__header", children: [_jsx(RadixDialog.Title, { className: "mrs-dialog__title", children: title }), titleActions != null && (_jsx("div", { className: "mrs-dialog__title-actions", children: titleActions }))] }), description != null && (_jsx(RadixDialog.Description, { className: "mrs-dialog__desc", children: description })), children != null && _jsx("div", { className: "mrs-dialog__body", children: children }), renderedFooter != null && _jsx("div", { className: "mrs-dialog__actions", children: renderedFooter })] })), (showClose || headerActions != null) && (_jsxs("div", { className: "mrs-dialog__close-container", children: [headerActions, showClose && (_jsx(RadixDialog.Close, { className: "mrs-dialog__close", "aria-label": closeLabel ?? st('mrs.action.close'), children: _jsx(CloseGlyph, { iconMode: iconMode }) }))] }))] })] }) }));
}
