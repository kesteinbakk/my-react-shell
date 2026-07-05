import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from './cn';
/**
 * The canonical square **icon-only button** — a ghost button that wraps a single
 * icon glyph in a fixed square hit-area (the box scale, `--mrs-icon-btn-*`), lit on
 * hover / open / focus. One component for every icon trigger in the kit; `DropdownMenu`
 * renders it for its `iconTrigger`.
 *
 * It forwards its `ref` and spreads native button props, so it drops straight into a
 * Radix `asChild` trigger (Dropdown / Popover / Tooltip). The glyph is auto-sized to
 * the step's scale — pass the icon unsized:
 *
 * ```tsx
 * <IconButton size="md" aria-label={t('action.settings')} onClick={openSettings}>
 *   <Settings />
 * </IconButton>
 * ```
 */
export const IconButton = forwardRef(function IconButton({ children, size = 'md', active, type = 'button', className, ...rest }, ref) {
    return (_jsx("button", { ref: ref, ...rest, type: type, "data-size": size, "aria-pressed": active, className: cn('mrs-icon-btn', className), children: _jsx("span", { className: "mrs-icon-btn__glyph", children: children }) }));
});
