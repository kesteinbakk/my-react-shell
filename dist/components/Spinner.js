import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from './cn';
import { useShellText } from './useShellText';
/** Inline loading indicator — a rotating ring on the current text color. */
export function Spinner({ size = 'md', label, className }) {
    const st = useShellText();
    return (_jsx("span", { role: "status", "aria-label": label ?? st('mrs.state.loading'), className: cn('mrs-spinner', `mrs-spinner--${size}`, className) }));
}
/** Full-height centered spinner for a page / route loading state. */
export function PageSpinner({ size = 'lg', label, className }) {
    return (_jsx("div", { className: cn('mrs-spinner-page', className), children: _jsx(Spinner, { size: size, label: label }) }));
}
/** Centered spinner for a content section or card body. */
export function SectionSpinner({ size = 'md', label, className }) {
    return (_jsx("div", { className: cn('mrs-spinner-section', className), children: _jsx(Spinner, { size: size, label: label }) }));
}
