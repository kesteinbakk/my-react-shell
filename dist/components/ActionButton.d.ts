import type { ReactNode } from 'react';
export type ActionButtonVariant = 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type ActionButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ActionButtonLayout = 'vertical' | 'inline';
export type ActionType = 'add' | 'edit' | 'delete' | 'copy' | 'share' | 'download' | 'upload' | 'save' | 'search' | 'refresh' | 'settings' | 'star' | 'close' | 'more';
export interface ActionPreset {
    /** Default semantic colour for the action. */
    variant: ActionButtonVariant;
    /** Default emoji, shown in emoji mode (`showEmoji`) or as a fallback glyph. */
    emoji: string;
    /** Default English label — the accessible name, and the visible text when `showLabel`. */
    label: string;
}
/**
 * The shipped action presets: the "correct" glyph (SVG + emoji), colour, and
 * default label for each common action. Override any of them per call.
 */
export declare const actionPresets: Record<ActionType, ActionPreset>;
interface ActionButtonBaseProps {
    /** Click handler. */
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    /** Visible label text (vertical: below the glyph; inline: after it). Overrides the preset label. */
    label?: string;
    /** Show the preset's default label as visible text without retyping it. Ignored if `label` is set. */
    showLabel?: boolean;
    /** Render the emoji instead of the SVG icon. Wire to `useIconMode().isEmoji` for the icons↔emojis seam. */
    showEmoji?: boolean;
    /** Native tooltip shown on hover (the `title` attribute). */
    hint?: string;
    /** Colour variant. Defaults to the preset's variant, or `neutral` for a custom icon. */
    variant?: ActionButtonVariant;
    /** Size — drives padding, glyph size, and label size. Defaults to `sm`. */
    size?: ActionButtonSize;
    /** `vertical` (glyph over label, default) or `inline` (glyph left of label). */
    layout?: ActionButtonLayout;
    /** When true the label takes the variant colour; otherwise it stays neutral. */
    coloredLabel?: boolean;
    /** Disabled state. */
    disabled?: boolean;
    /** Button `type` attribute. Defaults to `button`. */
    type?: 'button' | 'submit' | 'reset';
    /** Accessible name. Falls back to the visible label, then `hint`, then the preset label. */
    'aria-label'?: string;
    /** Extra classes, merged via `cn()`. */
    className?: string;
}
/** Preset action: `action` supplies the glyph, emoji, colour, and default label. */
export interface ActionButtonPresetProps extends ActionButtonBaseProps {
    action: ActionType;
    /** Override the preset glyph with a custom node (e.g. a lucide icon or `<Icon>`). */
    icon?: ReactNode;
    /** Override the preset emoji. */
    emoji?: string;
    /** For `action="star"`: filled + `aria-pressed` when true. */
    active?: boolean;
}
/** Custom action: bring your own `icon` node (and optionally an `emoji`). */
export interface ActionButtonIconProps extends ActionButtonBaseProps {
    icon: ReactNode;
    emoji?: string;
    action?: never;
    active?: never;
}
export type ActionButtonProps = ActionButtonPresetProps | ActionButtonIconProps;
/**
 * An opinionated icon/emoji + label action button on the semantic theme tokens.
 *
 * Use a **preset** for the common actions — each ships the correct glyph (SVG +
 * emoji), colour, and default label:
 * ```tsx
 * <ActionButton action="delete" onClick={onDelete} />
 * <ActionButton action="add" showLabel onClick={onAdd} />
 * <ActionButton action="star" active={fav} onClick={toggleFav} />
 * ```
 *
 * Or bring a **custom** glyph for anything else:
 * ```tsx
 * <ActionButton icon={<Download />} label="Export" variant="info" onClick={onExport} />
 * ```
 *
 * It never imports the i18n or icons modules: pass translated text via `label`,
 * and wire `showEmoji={useIconMode().isEmoji}` to follow the icons↔emojis seam.
 */
export declare function ActionButton(props: ActionButtonProps): import("react").JSX.Element;
export interface ActionButtonGroupProps {
    children?: ReactNode;
    /** Stack the buttons vertically instead of in a row. */
    vertical?: boolean;
    className?: string;
}
/** A flex container for a set of `ActionButton`s — a toolbar row (or column). */
export declare function ActionButtonGroup({ children, vertical, className }: ActionButtonGroupProps): import("react").JSX.Element;
export {};
