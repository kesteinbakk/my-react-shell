import type { ReactNode } from 'react';
/** Output format of the free picker — what `onChange` emits and `value` is read as. */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';
export interface ColorPickerProps {
    /**
     * Selected color (controlled). A CSS color string: in free mode it is in `format`
     * (`#rrggbb`, `rgb(…)`, or `hsl(…)`); in constrained mode it is whichever entry of
     * `colors` is selected. Omit for "nothing picked yet".
     */
    value?: string;
    /** Emits the new color string (in `format`, or the picked `colors` entry verbatim). */
    onChange: (value: string) => void;
    /**
     * Constrain selection to a fixed set of colors, shown as a swatch grid. Each may be
     * **any** CSS color string (hex, `rgb()`, `hsl()`, `var(--token)`, a named color).
     * Omit (or pass `[]`) for a free full-range pick.
     */
    colors?: readonly string[];
    /** Output format of the free picker. Default `'hex'`. Ignored when `colors` is set. */
    format?: ColorFormat;
    /** Field label above the trigger. */
    label?: ReactNode;
    /** Helper text below the label. */
    description?: ReactNode;
    /** Popover alignment relative to the trigger. Default `start`. */
    align?: 'start' | 'center' | 'end';
    /** Trigger text when nothing is selected. Default `'Pick a color'`. */
    placeholder?: string;
    disabled?: boolean;
    /** Accessible label for the trigger (falls back to a string `label`). */
    'aria-label'?: string;
    /** Stretch to fill the available container width. Defaults to `false`. */
    fullWidth?: boolean;
    className?: string;
}
/**
 * <ColorPicker> — a general, controlled color picker behind a compact popover trigger.
 *
 * - **Free** (default): a full hue/saturation range (via `react-colorful`, an optional
 *   peer). `onChange` emits a CSS color string in `format` (`hex` · `rgb` · `hsl`).
 * - **Constrained**: pass a `colors` set and the picker is limited to that set, shown as
 *   a swatch grid; `onChange` emits the picked entry verbatim.
 *
 * Controlled via `value` / `onChange`; persists nothing. `value` is always a
 * directly-usable CSS color string — drop it into a `style`/`background`.
 */
export declare function ColorPicker({ value, onChange, colors, format, label, description, align, placeholder, disabled, fullWidth, className, ...rest }: ColorPickerProps): import("react").JSX.Element;
