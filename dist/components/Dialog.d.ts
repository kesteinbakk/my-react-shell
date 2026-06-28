import type { ReactNode } from 'react';
export interface DialogButtonConfig {
    /** The button label. */
    label: ReactNode;
    /** Click callback. If omitted, defaults to closing the dialog via onOpenChange(false). */
    onClick?: () => void;
    /** Style tone. */
    tone?: 'primary' | 'neutral' | 'danger';
    /** Shows loading state and disables the button. */
    loading?: boolean;
}
export type DialogButtonProp = string | DialogButtonConfig;
/** Outer width of the dialog card. `full` fills the viewport (minus a small inset). */
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export interface DialogProps {
    /** Controlled open state. */
    open: boolean;
    /** Open-state change handler (backdrop / Esc / ✕ call this with `false`). */
    onOpenChange: (open: boolean) => void;
    /** Dialog heading — required (also the accessible name). */
    title: ReactNode;
    /** Optional control rendered on the title row, next to the heading (standard mode). */
    titleActions?: ReactNode;
    /** Optional header action icon buttons displayed next to the close button. */
    headerActions?: ReactNode;
    /** Supporting line under the title. */
    description?: ReactNode;
    /** Dialog body. */
    children?: ReactNode;
    /** Optional content for the bottom actions row (e.g. buttons). */
    footer?: ReactNode;
    /** Render a default Cancel button on the left of the footer with this label or config. */
    useCancel?: DialogButtonProp;
    /** Render a default Primary button on the right of the footer with this label or config. */
    usePrimary?: DialogButtonProp;
    /** Outer width. Defaults to `md`. */
    size?: DialogSize;
    /**
     * Full-bleed content mode: the dialog drops its own padding/spacing and the consumer
     * owns the entire inner layout (e.g. a sticky header band + a scrolling body, an
     * edge-to-edge viewer). `title` is still required and kept as the accessible name
     * (visually hidden); render your own visible header inside `children`. The `footer`
     * slot is ignored in this mode.
     */
    bleed?: boolean;
    /** Render the top-right ✕ close button. Defaults to `true`. */
    showClose?: boolean;
    /** Accessible label for the ✕ close button — **required**; pass a translated string. */
    closeLabel: string;
    /** Close when the backdrop is clicked. Defaults to `true`; set `false` to guard unsaved edits. */
    closeOnBackdrop?: boolean;
    /** Close when Esc is pressed. Defaults to `true`. */
    closeOnEsc?: boolean;
    className?: string;
}
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
export declare function Dialog({ open, onOpenChange, title, titleActions, headerActions, description, children, footer, useCancel, usePrimary, size, bleed, showClose, closeLabel, closeOnBackdrop, closeOnEsc, className, }: DialogProps): import("react").JSX.Element;
