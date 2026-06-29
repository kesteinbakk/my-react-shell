import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Tone } from './tone';
export type EmptyStateAddButtonTone = Tone;
export type EmptyStateAddButtonSize = 'sm' | 'md' | 'lg';
export interface EmptyStateAddButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    /** Click handler. */
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    /**
     * Label displayed below the button.
     * Use a descriptive label about what is being added, for instance "Add new message".
     */
    label: string;
    /**
     * Optional secondary description rendered below the label. Use when the
     * empty state is a "hero" surface that needs to explain *why* (e.g.
     * "No conversations yet — pick an identity to start chatting").
     */
    description?: ReactNode;
    /** Native tooltip shown on hover (the `title` attribute). */
    hint?: string;
    /** Disabled state. */
    disabled?: boolean;
    /** Button `type` attribute. Defaults to `button`. */
    type?: 'button' | 'submit' | 'reset';
    /** Size of the button (sm, md, lg). Default: sm (80px button) */
    size?: EmptyStateAddButtonSize;
    /**
     * Icon shown inside the button. Defaults to a plus sign. Pass a custom icon
     * to communicate the *what* alongside the "add" affordance.
     */
    icon?: ReactNode;
    /**
     * Semantic tone. Defaults to `success` so the standard "add" affordance reads green.
     * Use `primary` (or another theme accent) when the empty state belongs to
     * a domain with its own brand color.
     */
    tone?: EmptyStateAddButtonTone;
    /**
     * Whether to render the outer full-width dashed-border container.
     * Default: `true` — gives the in-list / inline empty-state look. Set
     * `false` for "hero" empty states (full-page void with title +
     * description) where the outer rectangle would be visual noise.
     */
    showBorder?: boolean;
    /** Extra classes, merged via `cn()`. */
    className?: string;
}
/**
 * Add button tailored for empty states.
 *
 * This is a replacement for the typical "You do not have any items yet" text
 * that agents often put on empty lists. When using this button such text must
 * be replaced by the button, not kept in addition to the button.
 *
 * Two shapes from one component:
 *   - `showBorder` (default `true`) → in-list / inline shape: full-width
 *     dashed rectangle wrapping the button + label. Use for sidebar / list
 *     empty states where the surface is constrained.
 *   - `showBorder={false}` → "hero" shape: just the button + label (+
 *     optional description), centered without an outer frame. Use for
 *     full-page void states.
 *
 * The inner circle is the click target in both shapes — the `showBorder`
 * prop only controls the *outer* rectangle.
 */
export declare const EmptyStateAddButton: import("react").ForwardRefExoticComponent<EmptyStateAddButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
