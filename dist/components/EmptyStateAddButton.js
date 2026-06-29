import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn';
const emptyStateAddButtonVariants = cva('mrs-empty-add-btn', {
    variants: {
        tone: {
            neutral: 'mrs-empty-add-btn--neutral',
            primary: 'mrs-empty-add-btn--primary',
            success: 'mrs-empty-add-btn--success',
            warning: 'mrs-empty-add-btn--warning',
            danger: 'mrs-empty-add-btn--danger',
            info: 'mrs-empty-add-btn--info',
        },
        size: {
            sm: 'mrs-empty-add-btn--sm',
            md: 'mrs-empty-add-btn--md',
            lg: 'mrs-empty-add-btn--lg',
        },
        showBorder: {
            true: 'mrs-empty-add-btn--border',
        },
    },
    defaultVariants: { tone: 'success', size: 'sm', showBorder: true },
});
/** Default icon is a plus sign. */
const DefaultAddIcon = ({ px }) => (_jsxs("svg", { width: px, height: px, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M12 5v14" }), _jsx("path", { d: "M5 12h14" })] }));
const ICON_PX = {
    sm: 32,
    md: 48,
    lg: 64,
};
/* ── Component ────────────────────────────────────────────────────────────── */
/**
 * Add button tailored for empty states.
 *
 * This is a replacement for the typical "You do not have any items yet" text
 * that agents often put on empty lists. When using this button such text must
 * be replaced by the button, not kept in addition to the button.
 *
 * Two shapes from one component:
 *   - `showBorder` (default `true`) → in-list / inline shape: full-width
 *     dashed rectangle wrapping the button + label. Use for sidebar / list
 *     empty states where the surface is constrained.
 *   - `showBorder={false}` → "hero" shape: just the button + label (+
 *     optional description), centered without an outer frame. Use for
 *     full-page void states.
 *
 * The inner circle is the click target in both shapes — the `showBorder`
 * prop only controls the *outer* rectangle.
 */
export const EmptyStateAddButton = forwardRef(function EmptyStateAddButton(props, ref) {
    const { onClick, label, description, hint, disabled = false, type = 'button', size = 'sm', icon, tone = 'success', showBorder = true, className, ...rest } = props;
    const px = ICON_PX[size];
    return (_jsx("div", { className: cn(emptyStateAddButtonVariants({ tone, size, showBorder }), className), title: hint, children: _jsxs("div", { className: "mrs-empty-add-btn__inner", children: [_jsx("button", { ref: ref, type: type, onClick: onClick, disabled: disabled, "aria-label": label, className: "mrs-empty-add-btn__btn", ...rest, children: _jsx("span", { className: "mrs-empty-add-btn__icon", children: icon ?? _jsx(DefaultAddIcon, { px: px }) }) }), _jsx("span", { className: "mrs-empty-add-btn__label", children: label }), description != null && (_jsx("p", { className: "mrs-empty-add-btn__desc", children: description }))] }) }));
});
