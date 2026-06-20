import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useRef, useState, } from 'react';
import { createPortal } from 'react-dom';
import { Alert } from './Alert';
const ToastContext = createContext(null);
/** Access the toast API. Throws if called outside `<ToastProvider>`. */
export function useToast() {
    const ctx = useContext(ToastContext);
    if (ctx === null)
        throw new Error('useToast must be used within <ToastProvider>');
    return ctx;
}
/**
 * Mounts the toast store and a fixed viewport (portaled to `document.body`), and
 * exposes the imperative API via `useToast()`. Each toast renders as an `Alert`,
 * so toasts inherit the same tone tokens.
 */
export function ToastProvider({ children, duration = 5000 }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);
    const dismiss = useCallback((id) => {
        setToasts((list) => list.filter((t) => t.id !== id));
    }, []);
    const show = useCallback((message, options) => {
        const id = (idRef.current += 1);
        const ms = options?.duration ?? duration;
        setToasts((list) => [
            ...list,
            { id, tone: options?.tone ?? 'info', title: options?.title, message },
        ]);
        if (ms > 0) {
            setTimeout(() => dismiss(id), ms);
        }
        return id;
    }, [dismiss, duration]);
    const api = useMemo(() => ({
        show,
        info: (message, options) => show(message, { ...options, tone: 'info' }),
        success: (message, options) => show(message, { ...options, tone: 'success' }),
        warning: (message, options) => show(message, { ...options, tone: 'warning' }),
        error: (message, options) => show(message, { ...options, tone: 'danger' }),
        dismiss,
    }), [show, dismiss]);
    return (_jsxs(ToastContext.Provider, { value: api, children: [children, typeof document !== 'undefined' &&
                createPortal(_jsx("div", { className: "mrs-toast-viewport", children: toasts.map((t) => (_jsx("div", { className: "mrs-toast", children: _jsx(Alert, { variant: t.tone, title: t.title, role: "status", onDismiss: () => dismiss(t.id), children: t.message }) }, t.id))) }), document.body)] }));
}
