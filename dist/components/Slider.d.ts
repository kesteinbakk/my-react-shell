import { type CSSProperties } from 'react';
import { type Tone } from './tone';
export interface SliderProps {
    /** Selected value(s) (controlled). One number = a single thumb; two = a range. */
    value?: number[];
    /** Initial value(s) when uncontrolled. */
    defaultValue?: number[];
    /** Fired continuously as the value changes. */
    onValueChange?: (value: number[]) => void;
    /** Fired once when the user finishes dragging / keying. */
    onValueCommit?: (value: number[]) => void;
    /** Minimum value. Defaults to `0`. */
    min?: number;
    /** Maximum value. Defaults to `100`. */
    max?: number;
    /** Step increment. Defaults to `1`. */
    step?: number;
    /** Minimum distance between thumbs in a range. */
    minStepsBetweenThumbs?: number;
    /** Track / range fill colour. Defaults to `primary`. */
    tone?: Tone;
    /** Layout orientation. Defaults to `horizontal`. */
    orientation?: 'horizontal' | 'vertical';
    disabled?: boolean;
    /** Form field name (one input per thumb is submitted). */
    name?: string;
    /** Accessible label applied to every thumb. */
    'aria-label'?: string;
    className?: string;
    style?: CSSProperties;
}
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
export declare function Slider({ value, defaultValue, onValueChange, onValueCommit, min, max, step, minStepsBetweenThumbs, tone, orientation, disabled, name, className, style, ...rest }: SliderProps): import("react").JSX.Element;
