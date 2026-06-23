import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn';
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
export function Label({ required = false, className, children, ...rest }) {
    return (_jsxs("label", { className: cn('mrs-label', className), ...rest, children: [children, required && (_jsx("span", { className: "mrs-label__required", "aria-hidden": "true", children: "*" }))] }));
}
