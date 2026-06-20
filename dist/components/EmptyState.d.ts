import type { ReactNode } from 'react';
export interface EmptyStateProps {
    /** Optional illustrative icon above the title. */
    icon?: ReactNode;
    /** The headline — required. */
    title: ReactNode;
    /** Supporting line under the title. */
    description?: ReactNode;
    /** Optional action slot (e.g. a button) under the text. */
    action?: ReactNode;
    className?: string;
}
/**
 * Centered empty / zero-state: an optional icon, a title, a description, and an
 * optional action — for "nothing here yet" surfaces.
 */
export declare function EmptyState({ icon, title, description, action, className }: EmptyStateProps): import("react").JSX.Element;
