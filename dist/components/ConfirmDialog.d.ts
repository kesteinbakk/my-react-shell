import type { ReactNode } from 'react';
export interface ConfirmDialogProps {
    /** Controlled open state. */
    open: boolean;
    /** Open-state change handler (backdrop / Esc / Cancel call this with `false`). */
    onOpenChange: (open: boolean) => void;
    /** Dialog heading — required (also the accessible name). */
    title: ReactNode;
    /** Supporting line under the title. */
    description?: ReactNode;
    /** Optional custom body, rendered below the description. */
    children?: ReactNode;
    /** Confirm button label. Defaults to `"Confirm"`. */
    confirmLabel?: string;
    /** Cancel button label. Defaults to `"Cancel"`. */
    cancelLabel?: string;
    /** `danger` makes the confirm button destructive. */
    variant?: 'default' | 'danger';
    /** Called when the confirm button is pressed. */
    onConfirm: () => void;
    /** Disables both buttons while an async confirm is in flight. */
    loading?: boolean;
    className?: string;
}
/**
 * Pre-built confirmation dialog on Radix Dialog (overlay, focus trap, Esc/backdrop
 * close, portal). Styled with the theme tokens; renders its own confirm/cancel
 * buttons (the kit doesn't ship a general Button — that stays consumer-owned).
 */
export declare function ConfirmDialog({ open, onOpenChange, title, description, children, confirmLabel, cancelLabel, variant, onConfirm, loading, className, }: ConfirmDialogProps): import("react").JSX.Element;
