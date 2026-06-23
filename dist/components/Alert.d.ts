import type { ReactNode } from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const alertVariants: (props?: ({
    tone?: "info" | "success" | "warning" | "danger" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type AlertTone = NonNullable<VariantProps<typeof alertVariants>['tone']>;
export interface AlertProps {
    /** Semantic tone. Defaults to `info`. */
    tone?: AlertTone;
    /** Optional bold lead line above the body. */
    title?: ReactNode;
    /** The alert body / description. */
    children?: ReactNode;
    /** Override the default leading icon, or pass `false` to drop it. */
    icon?: ReactNode | false;
    /** When set, renders a dismiss button that calls this handler. */
    onDismiss?: () => void;
    /** Accessible label for the dismiss button. Defaults to `"Dismiss"`. */
    dismissLabel?: string;
    /** ARIA role. `alert` (default) is assertive; use `status` for non-urgent notices. */
    role?: 'alert' | 'status';
    /** Extra classes merged onto the root. */
    className?: string;
}
/**
 * Inline alert / callout box. An opinionated composite on the semantic theme
 * tokens: a tinted surface (`--color-<tone>-bg`), a matching border
 * (`--color-<tone>-border`), and AA-legible on-tint text (`--color-<tone>-strong`),
 * with a per-tone leading icon and an optional dismiss control.
 */
export declare function Alert({ tone, title, children, icon, onDismiss, dismissLabel, role, className, }: AlertProps): import("react").JSX.Element;
export {};
