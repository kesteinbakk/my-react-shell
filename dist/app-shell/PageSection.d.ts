import type { ReactNode } from 'react';
import type { ShellIcon } from './shellContract';
export interface PageSectionProps {
    /** The section title text or element. */
    title: ReactNode;
    /** Optional icon: a string key resolved by the shell config's renderIcon, or a custom ReactNode. */
    icon?: Exclude<ReactNode, string> | ShellIcon;
    /** Optional actions (elements/buttons) to display on the right side of the header. */
    actions?: ReactNode[];
    /** Custom CSS class name for the card container. */
    className?: string;
    /** The main content area of the section. */
    children: ReactNode;
}
/**
 * A standalone component rendering a section card matching the App Shell's
 * PageSections card style. Hosts a header (optional icon + title + actions)
 * and a content body surface.
 */
export declare function PageSection({ title, icon, actions, className, children, }: PageSectionProps): import("react").JSX.Element;
