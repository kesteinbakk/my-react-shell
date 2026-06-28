import type { ReactNode } from 'react';
import type { DialogButtonProp } from './Dialog';
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
    /** Confirm button label or configuration. If omitted, uses confirmLabel / onConfirm / tone. */
    useConfirm?: DialogButtonProp;
    /** Cancel button label or configuration. If omitted, uses cancelLabel. */
    useCancel?: DialogButtonProp;
    /** Confirm button label — **required**; pass a translated string via your i18n seam. */
    confirmLabel: string;
    /** Cancel button label — **required**; pass a translated string via your i18n seam. */
    cancelLabel: string;
    /** `danger` makes the confirm button destructive. */
    tone?: 'neutral' | 'danger';
    /** Called when the confirm button is pressed. */
    onConfirm?: () => void;
    /** Disables both buttons while an async confirm is in flight. */
    loading?: boolean;
    className?: string;
}
/**
 * Pre-built confirmation dialog on Radix Dialog (overlay, focus trap, Esc/backdrop
 * close, portal). Styled with the theme tokens; renders its own confirm/cancel
 * buttons.
 */
export declare function ConfirmDialog({ open, onOpenChange, title, description, children, useConfirm, useCancel, confirmLabel, cancelLabel, tone, onConfirm, loading, className, }: ConfirmDialogProps): import("react").JSX.Element;
