import type { ReactNode } from 'react';
export interface InfoBoxProps {
    /** Optional leading icon. */
    icon?: ReactNode;
    /** Optional bold lead line. */
    title?: ReactNode;
    /** Body content. */
    children?: ReactNode;
    className?: string;
}
/**
 * A neutral, low-emphasis contextual box — notes, help text, inline context.
 * For semantic success / warning / danger / info tones use `Alert` instead;
 * `InfoBox` is intentionally tone-free so it never competes with a real alert.
 */
export declare function InfoBox({ icon, title, children, className }: InfoBoxProps): import("react").JSX.Element;
