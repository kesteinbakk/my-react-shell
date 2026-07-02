import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from './cn';
import { TONE_COLOR } from './tone';
import { useDialogDismissGuard } from './useDialogDismissGuard';
const iconProps = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};
/**
 * Per-tone leading glyph. `primary`/`neutral` are intentionally icon-less — a plain
 * confirm needs no callout — while the four semantic tones each get a matching mark
 * (shared visual language with `Alert`). Override or drop via the `icon` prop.
 */
const DEFAULT_TONE_ICONS = {
    primary: null,
    neutral: null,
    info: (_jsxs("svg", { ...iconProps, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("path", { d: "M12 16v-4" }), _jsx("path", { d: "M12 8h.01" })] })),
    success: (_jsxs("svg", { ...iconProps, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("path", { d: "m9 12 2 2 4-4" })] })),
    warning: (_jsxs("svg", { ...iconProps, children: [_jsx("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" }), _jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" })] })),
    danger: (_jsxs("svg", { ...iconProps, children: [_jsx("polygon", { points: "7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86" }), _jsx("path", { d: "M12 8v4" }), _jsx("path", { d: "M12 16h.01" })] })),
};
/**
 * Pre-built confirmation dialog on Radix Dialog (overlay, focus trap, Esc/backdrop
 * close, portal). Styled with the theme tokens; renders its own confirm/cancel buttons.
 *
 * The confirm button defaults to `OK` and always shows on the right. The cancel button
 * is opt-in on the left — it renders only when at least one of `showCancel`, `onCancel`,
 * `cancelLabel`, or `useCancel` is provided. `tone` colours a leading icon and the
 * confirm button.
 */
export function ConfirmDialog({ open, onOpenChange, title, description, children, tone = 'neutral', icon, useConfirm, confirmLabel = 'OK', cancelLabel, useCancel, showCancel = false, onConfirm, onCancel, loading = false, className, }) {
    const getButtonClass = (t) => {
        switch (t) {
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
    // Cancel is opt-in: any of these props asks for it.
    const cancelRequested = showCancel || useCancel != null || cancelLabel != null || onCancel != null;
    const cancelConfig = (() => {
        if (useCancel != null) {
            return typeof useCancel === 'string' ? { label: useCancel } : useCancel;
        }
        return { label: cancelLabel ?? 'Cancel' };
    })();
    const cancelClick = cancelConfig.onClick ?? onCancel ?? (() => onOpenChange(false));
    const cancelLoading = cancelConfig.loading ?? loading;
    const cancelTone = cancelConfig.tone ?? 'neutral';
    const confirmConfig = (() => {
        if (useConfirm != null) {
            return typeof useConfirm === 'string' ? { label: useConfirm } : useConfirm;
        }
        return { label: confirmLabel };
    })();
    const confirmClick = confirmConfig.onClick ?? onConfirm ?? (() => onOpenChange(false));
    const confirmLoading = confirmConfig.loading ?? loading;
    // The confirm button stays primary except for danger/warning, which adopt the tone.
    const derivedConfirmTone = tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'primary';
    const confirmTone = confirmConfig.tone ?? derivedConfirmTone;
    const leadingIcon = icon === false ? null : (icon ?? DEFAULT_TONE_ICONS[tone]);
    // Keep a nested popper (Select, DropdownMenu, Popover, …) dismissal from tearing down the
    // whole dialog. See useDialogDismissGuard for the full mechanism.
    const guardPopperOutside = useDialogDismissGuard(open);
    return (_jsx(Dialog.Root, { open: open, onOpenChange: onOpenChange, children: _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "mrs-dialog__overlay" }), _jsxs(Dialog.Content, { className: cn('mrs-dialog', className), onPointerDownOutside: (e) => {
                        guardPopperOutside(e);
                    }, onInteractOutside: (e) => {
                        guardPopperOutside(e);
                    }, children: [_jsxs("div", { className: "mrs-dialog__title-row", children: [leadingIcon != null && (_jsx("span", { className: "mrs-dialog__tone-icon", style: { color: TONE_COLOR[tone] }, "aria-hidden": "true", children: leadingIcon })), _jsx(Dialog.Title, { className: "mrs-dialog__title", children: title })] }), description != null && (_jsx(Dialog.Description, { className: "mrs-dialog__desc", children: description })), children, _jsxs("div", { className: "mrs-dialog__actions", children: [_jsx("button", { type: "button", className: cn('mrs-dialog__btn', getButtonClass(confirmTone)), onClick: confirmClick, disabled: confirmLoading, "aria-busy": confirmLoading || undefined, children: confirmConfig.label }), cancelRequested && (_jsx("button", { type: "button", className: cn('mrs-dialog__btn', getButtonClass(cancelTone)), style: { marginRight: 'auto', order: -1 }, onClick: cancelClick, disabled: cancelLoading, "aria-busy": cancelLoading || undefined, children: cancelConfig.label }))] })] })] }) }));
}
