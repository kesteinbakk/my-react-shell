import type { ReactNode } from 'react';
import { type AlertTone } from './Alert';
export type ToastTone = AlertTone;
export interface ToastOptions {
    /** Semantic tone. Defaults to `info`. */
    tone?: ToastTone;
    /** Optional bold lead line. */
    title?: ReactNode;
    /** Auto-dismiss after N ms; `0` keeps it until dismissed. Falls back to the
     *  provider's `duration`. */
    duration?: number;
}
type ToneOptions = Omit<ToastOptions, 'tone'>;
export interface ToastApi {
    show: (message: ReactNode, options?: ToastOptions) => number;
    info: (message: ReactNode, options?: ToneOptions) => number;
    success: (message: ReactNode, options?: ToneOptions) => number;
    warning: (message: ReactNode, options?: ToneOptions) => number;
    error: (message: ReactNode, options?: ToneOptions) => number;
    dismiss: (id: number) => void;
}
/** Access the toast API. Throws if called outside `<ToastProvider>`. */
export declare function useToast(): ToastApi;
export interface ToastProviderProps {
    children: ReactNode;
    /** Default auto-dismiss in ms (a per-toast `duration` overrides). Defaults to 3000. */
    duration?: number;
}
/**
 * Mounts the toast store and a fixed viewport (portaled to `document.body`), and
 * exposes the imperative API via `useToast()`. Each toast renders as an `Alert`,
 * so toasts inherit the same tone tokens.
 */
export declare function ToastProvider({ children, duration }: ToastProviderProps): import("react").JSX.Element;
export {};
