import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixDialog from '@radix-ui/react-dialog';
import { cn } from './cn';
/**
 * General-purpose controlled dialog on Radix Dialog (overlay, focus trap, Esc/backdrop
 * close, portal). Unlike `ConfirmDialog`, it renders no buttons of its own — pass your
 * own body in `children` and any actions in `footer`. Styled with the theme tokens.
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
 * ```
 */
export function Dialog({ open, onOpenChange, title, description, children, footer, showClose = true, closeLabel = 'Close', className, }) {
    return (_jsx(RadixDialog.Root, { open: open, onOpenChange: onOpenChange, children: _jsxs(RadixDialog.Portal, { children: [_jsx(RadixDialog.Overlay, { className: "mrs-dialog__overlay" }), _jsxs(RadixDialog.Content, { className: cn('mrs-dialog', className), children: [_jsx(RadixDialog.Title, { className: "mrs-dialog__title", children: title }), description != null && (_jsx(RadixDialog.Description, { className: "mrs-dialog__desc", children: description })), showClose && (_jsx(RadixDialog.Close, { className: "mrs-dialog__close", "aria-label": closeLabel, children: _jsxs("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("path", { d: "M18 6 6 18" }), _jsx("path", { d: "m6 6 12 12" })] }) })), children != null && _jsx("div", { className: "mrs-dialog__body", children: children }), footer != null && _jsx("div", { className: "mrs-dialog__actions", children: footer })] })] }) }));
}
