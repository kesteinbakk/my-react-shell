import type { ReactNode } from 'react';
/**
 * The built-in theme accent vocabulary — the swatch set offered by the Theme tab
 * unless the consumer passes its own `swatches`. Each name resolves to the shared
 * `--color-accent-<name>` token (shipped by `my-react-shell/styles.css`), so a
 * swatch stays theme-adaptive: the same picked value tracks light/dark and palette.
 */
export declare const ACCENT_SWATCHES: readonly ["indigo", "violet", "purple", "pink", "rose", "orange", "amber", "emerald", "teal", "sky"];
export interface ColorPickerProps {
    /**
     * Selected color as a directly-usable CSS color string — either a theme swatch
     * reference `var(--color-accent-<name>)` (theme-adaptive) or a custom `#rrggbb`
     * hex. Drop it straight into a `style`/`background`. Omit for "nothing picked yet".
     */
    value?: string;
    /** Emits the new CSS color string (a swatch `var(...)` or a `#rrggbb` hex). */
    onChange: (value: string) => void;
    /**
     * Accent swatch names offered in the Theme tab. Defaults to {@link ACCENT_SWATCHES};
     * each renders as `var(--color-accent-<name>)`. Pass `[]` to hide the Theme tab
     * (custom-only).
     */
    swatches?: readonly string[];
    /** Show the full-range (custom hex) tab. Default `true`. Set `false` for swatch-only. */
    allowCustom?: boolean;
    /** Field label above the trigger. */
    label?: ReactNode;
    /** Helper text below the label. */
    description?: ReactNode;
    /** Popover alignment relative to the trigger. Default `start`. */
    align?: 'start' | 'center' | 'end';
    /** Trigger text when nothing is selected. Default `'Pick a color'`. */
    placeholder?: string;
    disabled?: boolean;
    /** Accessible label for the trigger (falls back to `label` when a string). */
    'aria-label'?: string;
    /** Tab labels (English defaults; pass translated strings via your `t()`). */
    swatchesLabel?: ReactNode;
    customLabel?: ReactNode;
    className?: string;
}
/**
 * <ColorPicker> — a compact, controlled color picker with two modes behind a popover
 * trigger: **Theme** (pick a theme accent swatch — semantic, theme-adaptive) and
 * **Custom** (a full hue/saturation range + hex input, via `react-colorful`).
 *
 * Controlled via `value` / `onChange`; `value` is always a directly-usable CSS color
 * string (`var(--color-accent-<name>)` for a swatch, `#rrggbb` for custom). Persists
 * nothing itself. The full-range tab uses the `react-colorful` optional peer — install
 * it when you use this component (swatch styling and the popover stay shell-owned).
 */
export declare function ColorPicker({ value, onChange, swatches, allowCustom, label, description, align, placeholder, disabled, swatchesLabel, customLabel, className, ...rest }: ColorPickerProps): import("react").JSX.Element;
