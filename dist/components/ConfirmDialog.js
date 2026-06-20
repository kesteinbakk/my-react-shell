import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from './cn';
/**
 * Pre-built confirmation dialog on Radix Dialog (overlay, focus trap, Esc/backdrop
 * close, portal). Styled with the theme tokens; renders its own confirm/cancel
 * buttons (the kit doesn't ship a general Button — that stays consumer-owned).
 */
export function ConfirmDialog({ open, onOpenChange, title, description, children, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default', onConfirm, loading = false, className, }) {
    return (_jsx(Dialog.Root, { open: open, onOpenChange: onOpenChange, children: _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "mrs-dialog__overlay" }), _jsxs(Dialog.Content, { className: cn('mrs-dialog', className), children: [_jsx(Dialog.Title, { className: "mrs-dialog__title", children: title }), description != null && (_jsx(Dialog.Description, { className: "mrs-dialog__desc", children: description })), children, _jsxs("div", { className: "mrs-dialog__actions", children: [_jsx("button", { type: "button", className: "mrs-dialog__btn mrs-dialog__btn--ghost", onClick: () => onOpenChange(false), disabled: loading, children: cancelLabel }), _jsx("button", { type: "button", className: cn('mrs-dialog__btn', variant === 'danger' ? 'mrs-dialog__btn--danger' : 'mrs-dialog__btn--primary'), onClick: onConfirm, disabled: loading, children: confirmLabel })] })] })] }) }));
}
