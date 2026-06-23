import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import { cn } from './cn';
const buttonVariants = cva('mrs-btn', {
    variants: {
        variant: {
            solid: 'mrs-btn--solid',
            soft: 'mrs-btn--soft',
            outline: 'mrs-btn--outline',
            ghost: 'mrs-btn--ghost',
            link: 'mrs-btn--link',
        },
        tone: {
            primary: 'mrs-btn--primary',
            neutral: 'mrs-btn--neutral',
            info: 'mrs-btn--info',
            success: 'mrs-btn--success',
            warning: 'mrs-btn--warning',
            danger: 'mrs-btn--danger',
        },
        size: {
            sm: 'mrs-btn--sm',
            md: 'mrs-btn--md',
            lg: 'mrs-btn--lg',
        },
        fullWidth: { true: 'mrs-btn--full' },
    },
    defaultVariants: { variant: 'solid', tone: 'primary', size: 'md' },
});
/**
 * The kit's button. Two orthogonal axes — **`variant`** (structural: `solid` · `soft`
 * · `outline` · `ghost` · `link`) and **`tone`** (semantic colour) — plus **`size`**.
 * Renders a native `<button>`; all native button props (`onClick`, `disabled`,
 * `type`, `aria-*`, …) pass straight through.
 *
 * ```tsx
 * <Button>Save</Button>                                  // solid primary (default)
 * <Button variant="outline">Cancel</Button>             // outline primary
 * <Button tone="danger">Delete</Button>                 // solid danger
 * <Button variant="ghost" tone="neutral">Dismiss</Button>
 * ```
 */
export function Button({ variant = 'solid', tone = 'primary', size = 'md', fullWidth = false, leadingIcon, trailingIcon, type = 'button', className, children, ...rest }) {
    return (_jsxs("button", { type: type, className: cn(buttonVariants({ variant, tone, size, fullWidth: fullWidth || undefined }), className), ...rest, children: [leadingIcon != null && (_jsx("span", { className: "mrs-btn__icon", "aria-hidden": "true", children: leadingIcon })), children != null && _jsx("span", { className: "mrs-btn__label", children: children }), trailingIcon != null && (_jsx("span", { className: "mrs-btn__icon", "aria-hidden": "true", children: trailingIcon }))] }));
}
