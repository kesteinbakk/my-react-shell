import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from './cn';
import { useDialogDismissGuard } from './useDialogDismissGuard';
/**
 * Pre-built confirmation dialog on Radix Dialog (overlay, focus trap, Esc/backdrop
 * close, portal). Styled with the theme tokens; renders its own confirm/cancel
 * buttons.
 */
export function ConfirmDialog({ open, onOpenChange, title, description, children, useConfirm, useCancel, confirmLabel, cancelLabel, tone = 'neutral', onConfirm, loading = false, className, }) {
    const getButtonClass = (t) => {
        if (t === 'danger')
            return 'mrs-dialog__btn--danger';
        if (t === 'primary')
            return 'mrs-dialog__btn--primary';
        return 'mrs-dialog__btn--ghost';
    };
    // Parse cancel config
    const cancelConfig = (() => {
        if (useCancel != null) {
            return typeof useCancel === 'string' ? { label: useCancel } : useCancel;
        }
        return { label: cancelLabel };
    })();
    const cancelClick = cancelConfig.onClick ?? (() => onOpenChange(false));
    const cancelLoading = cancelConfig.loading ?? loading;
    const cancelTone = cancelConfig.tone ?? 'neutral';
    // Parse confirm config
    const confirmConfig = (() => {
        if (useConfirm != null) {
            return typeof useConfirm === 'string' ? { label: useConfirm } : useConfirm;
        }
        return { label: confirmLabel };
    })();
    const confirmClick = confirmConfig.onClick ?? onConfirm ?? (() => onOpenChange(false));
    const confirmLoading = confirmConfig.loading ?? loading;
    const confirmTone = confirmConfig.tone ?? (tone === 'danger' ? 'danger' : 'primary');
    // Keep a nested popper (Select, DropdownMenu, Popover, …) dismissal from tearing down the
    // whole dialog. See useDialogDismissGuard for the full mechanism.
    const guardPopperOutside = useDialogDismissGuard(open);
    return (_jsx(Dialog.Root, { open: open, onOpenChange: onOpenChange, children: _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "mrs-dialog__overlay" }), _jsxs(Dialog.Content, { className: cn('mrs-dialog', className), onPointerDownOutside: (e) => {
                        guardPopperOutside(e);
                    }, onInteractOutside: (e) => {
                        guardPopperOutside(e);
                    }, children: [_jsx(Dialog.Title, { className: "mrs-dialog__title", children: title }), description != null && (_jsx(Dialog.Description, { className: "mrs-dialog__desc", children: description })), children, _jsxs("div", { className: "mrs-dialog__actions", children: [_jsx("button", { type: "button", className: cn('mrs-dialog__btn', getButtonClass(cancelTone)), style: { marginRight: 'auto' }, onClick: cancelClick, disabled: cancelLoading, "aria-busy": cancelLoading || undefined, children: cancelConfig.label }), _jsx("button", { type: "button", className: cn('mrs-dialog__btn', getButtonClass(confirmTone)), onClick: confirmClick, disabled: confirmLoading, "aria-busy": confirmLoading || undefined, children: confirmConfig.label })] })] })] }) }));
}
