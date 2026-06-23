import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixSlider from '@radix-ui/react-slider';
import { TONE_COLOR } from './tone';
import { cn } from './cn';
/**
 * Un-opinionated range slider on Radix Slider — a track with one or more draggable
 * thumbs, keyboard- and form-aware. Pass a one-element `value` for a single thumb or a
 * two-element `value` for a range; the filled portion and thumbs paint with `tone`
 * (default `primary`). Controlled via `value` / `onValueChange`, or uncontrolled via
 * `defaultValue`.
 *
 * ```tsx
 * <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} aria-label="Volume" />
 * <Slider value={range} onValueChange={setRange} min={0} max={1000} step={10} />
 * ```
 */
export function Slider({ value, defaultValue, onValueChange, onValueCommit, min = 0, max = 100, step = 1, minStepsBetweenThumbs, tone = 'primary', orientation = 'horizontal', disabled, name, className, ...rest }) {
    // One thumb per value entry; default to a single thumb when neither is given.
    const thumbs = value ?? defaultValue ?? [min];
    return (_jsxs(RadixSlider.Root, { value: value, defaultValue: defaultValue, onValueChange: onValueChange, onValueCommit: onValueCommit, min: min, max: max, step: step, minStepsBetweenThumbs: minStepsBetweenThumbs, orientation: orientation, disabled: disabled, name: name, className: cn('mrs-slider', className), style: { ['--mrs-slider-tone']: TONE_COLOR[tone] }, children: [_jsx(RadixSlider.Track, { className: "mrs-slider__track", children: _jsx(RadixSlider.Range, { className: "mrs-slider__range" }) }), thumbs.map((_, i) => (_jsx(RadixSlider.Thumb, { className: "mrs-slider__thumb", "aria-label": rest['aria-label'] }, i)))] }));
}
