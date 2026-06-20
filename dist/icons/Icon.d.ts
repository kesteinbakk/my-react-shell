/**
 * <Icon> — the thin icons↔emojis swap.
 *
 * Give it a glyph node (e.g. a sized lucide icon) and that glyph's emoji
 * equivalent; <Icon> renders one or the other based on the active icon-mode (from
 * <IconModeProvider>; defaults to `icon` when there is no provider). This is the
 * whole "icon kit" my-react-shell ships — no registry, no `lucide-react` dependency.
 * The consumer supplies the glyph and the emoji, and typically wraps this in its own
 * key→glyph map (see the demo's `renderIcon`).
 */
import type { ReactNode } from 'react';
export interface IconProps {
    /** The glyph node shown in `icon` mode — typically a sized lucide icon. */
    icon: ReactNode;
    /** The emoji shown in `emoji` mode. */
    emoji: string;
    /** Pixel size for the emoji glyph; match your icon's size. Default `20`. */
    size?: number;
    /** Accessible label. Omit to render the glyph decoratively (`aria-hidden`). */
    label?: string;
    /** Class on the wrapper span (applied in both modes). */
    className?: string;
}
export declare function Icon({ icon, emoji, size, label, className }: IconProps): ReactNode;
