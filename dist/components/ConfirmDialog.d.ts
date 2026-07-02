import type { ReactNode } from 'react';
import type { DialogButtonProp } from './Dialog';
import type { Tone } from './tone';
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
    /**
     * Semantic tone. Drives the leading tone icon and the confirm button colour: the
     * confirm button stays `primary` for every tone **except** `danger` and `warning`,
     * which adopt the tone. Defaults to `neutral` (primary button, no icon).
     */
    tone?: Tone;
    /**
     * Override the tone's leading icon, or pass `false` to drop it. Defaults to the
     * per-tone glyph (`info`/`success`/`warning`/`danger`; none for `primary`/`neutral`).
     */
    icon?: ReactNode | false;
    /**
     * Confirm button label or configuration. Defaults to the shell's built-in,
     * locale-aware "OK" (`mrs.action.ok`); pass a string for any other label. A
     * `DialogButtonConfig` overrides the tone-derived button colour.
     */
    useConfirm?: DialogButtonProp;
    /** Confirm button label. Defaults to the built-in `mrs.action.ok`. Superseded by `useConfirm`. */
    confirmLabel?: string;
    /**
     * Cancel button label or configuration. Its presence renders the cancel button — see
     * `showCancel`. Superseded by `useCancel` when set.
     */
    cancelLabel?: string;
    /** Cancel button label or configuration. Its presence renders the cancel button. */
    useCancel?: DialogButtonProp;
    /** Force-render the cancel button even when no `cancelLabel`/`onCancel`/`useCancel` is set. */
    showCancel?: boolean;
    /** Called when the confirm button is pressed. */
    onConfirm?: () => void;
    /** Called when the cancel button is pressed. Its presence renders the cancel button. */
    onCancel?: () => void;
    /** Disables both buttons while an async confirm is in flight. */
    loading?: boolean;
    className?: string;
}
/**
 * Pre-built confirmation dialog on Radix Dialog (overlay, focus trap, Esc/backdrop
 * close, portal). Styled with the theme tokens; renders its own confirm/cancel buttons.
 *
 * The confirm button defaults to the built-in, locale-aware "OK" (`mrs.action.ok`) and
 * always shows on the right. The cancel button is opt-in on the left — it renders only
 * when at least one of `showCancel`, `onCancel`, `cancelLabel`, or `useCancel` is
 * provided (label defaulting to `mrs.action.cancel`). `tone` colours a leading icon and
 * the confirm button.
 */
export declare function ConfirmDialog({ open, onOpenChange, title, description, children, tone, icon, useConfirm, confirmLabel, cancelLabel, useCancel, showCancel, onConfirm, onCancel, loading, className, }: ConfirmDialogProps): import("react").JSX.Element;
