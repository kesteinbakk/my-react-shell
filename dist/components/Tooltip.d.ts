import type { ReactNode } from 'react';
export interface TooltipProps {
    /** The tooltip bubble content. */
    content: ReactNode;
    /** The trigger element — wrapped in the Radix trigger (`asChild`). */
    children: ReactNode;
    /** Side the bubble opens toward. Defaults to `top`. */
    side?: 'top' | 'right' | 'bottom' | 'left';
    /** Alignment along the trigger edge. Defaults to `center`. */
    align?: 'start' | 'center' | 'end';
    /** Gap (px) between the trigger and the bubble. Defaults to `6`. */
    sideOffset?: number;
    /** Hover delay (ms) before the bubble opens. Defaults to `300`. */
    delayDuration?: number;
    /** Controlled open state. Omit for hover/focus-driven open. */
    open?: boolean;
    /** Open-state change handler. */
    onOpenChange?: (open: boolean) => void;
    /** Extra classes on the bubble, merged via `cn()`. */
    className?: string;
}
/**
 * Ergonomic single-component tooltip on Radix Tooltip — pass the trigger as
 * `children` and the bubble as `content`. Mounts its own `Provider` internally,
 * so consumers needn't wrap the app. The bubble portals out and is styled with
 * the theme tokens. Optionally controlled via `open` / `onOpenChange`.
 *
 * ```tsx
 * <Tooltip content="Copy to clipboard">
 *   <Button>Copy</Button>
 * </Tooltip>
 * ```
 */
export declare function Tooltip({ content, children, side, align, sideOffset, delayDuration, open, onOpenChange, className, }: TooltipProps): import("react").JSX.Element;
