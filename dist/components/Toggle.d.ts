import type { ReactNode } from 'react';
/**
 * Structural style: `ghost` is fill-on-press, `outline` keeps a bordered box,
 * `plain` is a bare icon — no border, background, or press/hover fill (keeps the
 * focus ring for a11y).
 */
export type ToggleVariant = 'ghost' | 'outline' | 'plain';
export type ToggleSize = 'sm' | 'md' | 'lg';
export interface ToggleProps {
    /** Pressed state (controlled). */
    pressed?: boolean;
    /** Initial pressed state when uncontrolled. */
    defaultPressed?: boolean;
    /** Fired when the pressed state changes. */
    onPressedChange?: (pressed: boolean) => void;
    /** Structural style. Defaults to `ghost`. */
    variant?: ToggleVariant;
    /** Control size. Defaults to `md`. */
    size?: ToggleSize;
    disabled?: boolean;
    /** Button contents — typically an icon glyph. */
    children?: ReactNode;
    /** Accessible label — required when the contents are icon-only. */
    'aria-label'?: string;
    className?: string;
}
/**
 * Un-opinionated two-state button on Radix Toggle — a single control that flips between
 * pressed and unpressed, themed against the tokens. The pressed state fills with
 * `--color-primary-bg`; `variant` chooses fill-only (`ghost`) or bordered (`outline`).
 * Controlled via `pressed` / `onPressedChange`, or uncontrolled via `defaultPressed`.
 *
 * ```tsx
 * <Toggle pressed={bold} onPressedChange={setBold} aria-label="Bold"><BoldIcon /></Toggle>
 * ```
 */
export declare function Toggle({ pressed, defaultPressed, onPressedChange, variant, size, disabled, children, className, ...rest }: ToggleProps): import("react").JSX.Element;
