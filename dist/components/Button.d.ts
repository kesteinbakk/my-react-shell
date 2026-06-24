import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Tone } from './tone';
export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Structural style. Defaults to `solid`. */
    variant?: ButtonVariant;
    /** Semantic colour. Defaults to `primary`. */
    tone?: Tone;
    /** Size — drives padding + font size. Defaults to `md`. */
    size?: ButtonSize;
    /** Stretch to the container width. */
    fullWidth?: boolean;
    /** Optional leading glyph (icon / emoji), before the label. */
    leadingIcon?: ReactNode;
    /** Optional trailing glyph, after the label. */
    trailingIcon?: ReactNode;
    children?: ReactNode;
}
/**
 * The kit's button. Two orthogonal axes — **`variant`** (structural: `solid` · `soft`
 * · `outline` · `ghost` · `link`) and **`tone`** (semantic colour) — plus **`size`**.
 * Renders a native `<button>`; all native button props (`onClick`, `disabled`,
 * `type`, `aria-*`, …) pass straight through, and the `ref` is forwarded to the
 * `<button>` — so it can be a Radix trigger (Popover / Tooltip / Dropdown `asChild`).
 *
 * ```tsx
 * <Button>Save</Button>                                  // solid primary (default)
 * <Button variant="outline">Cancel</Button>             // outline primary
 * <Button tone="danger">Delete</Button>                 // solid danger
 * <Button variant="ghost" tone="neutral">Dismiss</Button>
 * ```
 */
export declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
