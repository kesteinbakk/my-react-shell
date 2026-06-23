import type { ReactNode } from 'react';
export interface DialogProps {
    /** Controlled open state. */
    open: boolean;
    /** Open-state change handler (backdrop / Esc / ✕ call this with `false`). */
    onOpenChange: (open: boolean) => void;
    /** Dialog heading — required (also the accessible name). */
    title: ReactNode;
    /** Supporting line under the title. */
    description?: ReactNode;
    /** Dialog body. */
    children?: ReactNode;
    /** Optional content for the bottom actions row (e.g. buttons). */
    footer?: ReactNode;
    /** Render the top-right ✕ close button. Defaults to `true`. */
    showClose?: boolean;
    /** Accessible label for the ✕ close button. Defaults to `"Close"`. */
    closeLabel?: string;
    className?: string;
}
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
export declare function Dialog({ open, onOpenChange, title, description, children, footer, showClose, closeLabel, className, }: DialogProps): import("react").JSX.Element;
