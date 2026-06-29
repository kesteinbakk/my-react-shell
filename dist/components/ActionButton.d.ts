import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Tone } from './tone';
export type ActionButtonTone = Tone;
export type ActionButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ActionButtonLayout = 'vertical' | 'inline';
export type ActionType = 'add' | 'edit' | 'delete' | 'copy' | 'share' | 'download' | 'upload' | 'save' | 'search' | 'refresh' | 'settings' | 'star' | 'close' | 'more';
export interface ActionPreset {
    /** Default semantic tone for the action. */
    tone: ActionButtonTone;
    /** Default emoji, shown in emoji mode (`showEmoji`) or as a fallback glyph. */
    emoji: string;
}
/**
 * The shipped action presets: the "correct" glyph (SVG + emoji) and colour for each
 * common action. Override any of them per call. Presets carry **no text** — the kit
 * never renders a hardcoded language; pass a translated `label` (visible) and/or
 * `aria-label`/`hint` (accessible name) via your i18n seam.
 */
export declare const actionPresets: Record<ActionType, ActionPreset>;
interface ActionButtonBaseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    /** Click handler. */
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    /** Visible label text (vertical: below the glyph; inline: after it). No default — pass a translated string; absent → icon only. */
    label?: string;
    /** Render the emoji instead of the SVG icon. Wire to `useIconMode().isEmoji` for the icons↔emojis seam. */
    showEmoji?: boolean;
    /** Native tooltip shown on hover (the `title` attribute). */
    hint?: string;
    /** Semantic tone. Defaults to the preset's tone, or `neutral` for a custom icon. */
    tone?: ActionButtonTone;
    /** Size — drives padding, glyph size, and label size. Defaults to `sm`. */
    size?: ActionButtonSize;
    /**
     * `vertical` (glyph over label, default) or `inline` (glyph left of label). The
     * `vertical` default is for standalone toolbars / action grids. Actions placed in
     * `ShellPageHeader`'s band always render **inline** regardless of this prop — the
     * band's stylesheet forces it, because a stacked label blows out the band height.
     */
    layout?: ActionButtonLayout;
    /** When true the label takes the variant colour; otherwise it stays neutral. */
    coloredLabel?: boolean;
    /** Disabled state. */
    disabled?: boolean;
    /** Button `type` attribute. Defaults to `button`. */
    type?: 'button' | 'submit' | 'reset';
    /** Accessible name. Falls back to the visible `label`, then `hint`. No language default — absent → unnamed (icon only). */
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
 * emoji) and colour. Presets carry **no text**; pass a translated `label` (visible)
 * and/or `aria-label`/`hint` (accessible name) yourself:
 * ```tsx
 * <ActionButton action="delete" aria-label={t('action.delete')} onClick={onDelete} />
 * <ActionButton action="add" label={t('action.add')} onClick={onAdd} />
 * <ActionButton action="star" active={fav} aria-label={t('action.favorite')} onClick={toggleFav} />
 * ```
 *
 * Or bring a **custom** glyph for anything else:
 * ```tsx
 * <ActionButton icon={<Download />} label={t('action.export')} tone="info" onClick={onExport} />
 * ```
 *
 * It never imports the i18n or icons modules: pass translated text via `label` /
 * `aria-label`, and wire `showEmoji={useIconMode().isEmoji}` to follow the
 * icons↔emojis seam. With no `label`/`aria-label`/`hint` the button is icon-only and
 * has **no accessible name** — supply one for any non-decorative action.
 */
export declare const ActionButton: import("react").ForwardRefExoticComponent<ActionButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
export interface ActionButtonGroupProps {
    children?: ReactNode;
    /** Stack the buttons vertically instead of in a row. */
    vertical?: boolean;
    className?: string;
}
/** A flex container for a set of `ActionButton`s — a toolbar row (or column). */
export declare function ActionButtonGroup({ children, vertical, className }: ActionButtonGroupProps): import("react").JSX.Element;
export {};
