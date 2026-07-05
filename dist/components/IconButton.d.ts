import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { IconButtonSize } from './iconButtonScale';
import type { Tone } from './tone';
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    /**
     * The icon glyph, centered in the square. A direct-child `<svg>` is auto-sized to
     * the step's glyph size (the shared icon-glyph scale) — pass the icon unsized; a
     * composed node (its own nested markup) is centered as-is, never resized.
     */
    children: ReactNode;
    /** Box size step — sm · md · lg · xl. Defaults to `md`. */
    size?: IconButtonSize;
    /** Semantic glyph colour. Defaults to `neutral` (the muted chrome colour). */
    tone?: Tone;
    /** Pressed / toggled state → `aria-pressed` + an accented (primary) fill. */
    active?: boolean;
    /** Optional overlay pinned to the top-right corner — e.g. a `CountPill` badge. */
    badge?: ReactNode;
    /** Accessible name. Required for any non-decorative icon button. */
    'aria-label'?: string;
    className?: string;
}
/**
 * The canonical square **icon-only button** — a ghost button that wraps a single
 * icon glyph in a square hit-area (the box scale, `--mrs-icon-btn-*`), lit on hover /
 * open / focus. One component for every icon trigger in the kit: `DropdownMenu` renders
 * it for its `iconTrigger`, and the app-shell `HeaderActionButton` / `UserPreferences`
 * trigger render it too.
 *
 * It forwards its `ref` and spreads native button props, so it drops straight into a
 * Radix `asChild` trigger (Dropdown / Popover / Tooltip). The glyph is auto-sized to
 * the step's scale — pass the icon unsized:
 *
 * ```tsx
 * <IconButton size="md" aria-label={t('action.settings')} onClick={openSettings}>
 *   <Settings />
 * </IconButton>
 * ```
 */
export declare const IconButton: import("react").ForwardRefExoticComponent<IconButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
