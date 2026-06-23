import type { ButtonHTMLAttributes, ReactNode } from 'react';
export interface HeaderMenuButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    /** Label text shown in the button. */
    children: ReactNode;
    /** Optional icon rendered before the label. */
    leadingIcon?: ReactNode;
}
/**
 * A ghost neutral button for the header action zone — a `<DropdownMenu trigger>`
 * that labels itself (text + optional leading icon) and provides a built-in
 * trailing chevron. Handles all native button attributes; passes them through to
 * the underlying `<button>` so `aria-label`, `title`, `disabled`, etc. work.
 *
 * ```tsx
 * <DropdownMenu
 *   trigger={<HeaderMenuButton>Visning</HeaderMenuButton>}
 *   items={...}
 * />
 * <DropdownMenu
 *   trigger={
 *     <HeaderMenuButton leadingIcon={<MyIcon size={16} />}>Visning</HeaderMenuButton>
 *   }
 *   items={...}
 * />
 * ```
 */
export declare function HeaderMenuButton({ children, leadingIcon, type, className, ...rest }: HeaderMenuButtonProps): import("react").JSX.Element;
