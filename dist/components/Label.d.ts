import type { LabelHTMLAttributes, ReactNode } from 'react';
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    /** Renders a subtle required marker after the text (decorative, `aria-hidden`). */
    required?: boolean;
    children?: ReactNode;
}
/**
 * Un-opinionated native `<label>` wrapper. All native label props (`htmlFor`,
 * `aria-*`, …) pass straight through; the only addition is `required`, which appends a
 * subtle, decorative marker after the text (it's `aria-hidden` — convey real validity
 * to assistive tech via the control's own `required`/`aria-invalid`).
 *
 * ```tsx
 * <Label htmlFor="email" required>Email</Label>
 * <Input id="email" type="email" required />
 * ```
 */
export declare function Label({ required, className, children, ...rest }: LabelProps): import("react").JSX.Element;
