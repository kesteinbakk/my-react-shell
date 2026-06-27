import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useEffect, useId, useState } from 'react';
import { cn } from './cn';
import { useDebounce } from './useDebounce';
const CheckIcon = () => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "4 5 16 13", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", style: { width: '0.8em', height: '0.65em' }, children: _jsx("polyline", { points: "20 6 9 17 4 12" }) }));
const SearchIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "11", cy: "11", r: "8" }), _jsx("path", { d: "m21 21-4.3-4.3" })] }));
/**
 * An opinionated search input component with built-in debouncing, left magnifier glass icon,
 * end icon support, and a loaded icon state (fades in a green check mark).
 */
export const SearchInput = forwardRef(function SearchInput(props, ref) {
    const { icon, endIcon, onDebounceSearch, debounceMs = 500, value, defaultValue, inputSize = 'md', onChange, loadedIconState, className, ...rest } = props;
    const id = useId();
    const [inputValue, setInputValue] = useState(value ?? defaultValue ?? '');
    // Handle controlled value changes
    useEffect(() => {
        if (value !== undefined) {
            setInputValue(value);
        }
    }, [value]);
    const scheduleDebounced = useDebounce((val) => {
        onDebounceSearch?.(val);
    }, debounceMs);
    const handleChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        onChange?.(e);
        scheduleDebounced(val);
    };
    const [showLoaded, setShowLoaded] = useState(false);
    const loadedEnabled = typeof loadedIconState === 'boolean' ? loadedIconState : !!loadedIconState?.enabled;
    const loadedIcon = (typeof loadedIconState === 'object' && loadedIconState !== null && loadedIconState.icon) || _jsx(CheckIcon, {});
    const loadedDuration = (typeof loadedIconState === 'object' && loadedIconState !== null && typeof loadedIconState.duration === 'number')
        ? Number(loadedIconState.duration)
        : 2000;
    const transitionMs = (typeof loadedIconState === 'object' && loadedIconState !== null && typeof loadedIconState.transitionMs === 'number')
        ? Number(loadedIconState.transitionMs)
        : 300;
    useEffect(() => {
        if (loadedEnabled) {
            setShowLoaded(true);
            if (loadedDuration > 0) {
                const timer = setTimeout(() => {
                    setShowLoaded(false);
                }, loadedDuration);
                return () => clearTimeout(timer);
            }
        }
        else {
            setShowLoaded(false);
        }
    }, [loadedEnabled, loadedDuration]);
    const hasEndIcon = endIcon != null || showLoaded;
    return (_jsxs("div", { className: cn('mrs-search-input-wrapper', `mrs-search-input-wrapper--${inputSize}`, hasEndIcon && 'mrs-search-input-wrapper--has-end-icon'), style: {
            '--mrs-search-transition-duration': `${transitionMs}ms`,
        }, children: [_jsx("span", { className: cn('mrs-search-input-icon-start', `mrs-search-input-icon-start--${inputSize}`), "aria-hidden": "true", children: icon ?? _jsx(SearchIcon, {}) }), _jsx("input", { ref: ref, id: id, type: "text", value: inputValue, onChange: handleChange, className: cn('mrs-search-input', `mrs-search-input--${inputSize}`, hasEndIcon && 'mrs-search-input--has-end-icon', className), ...rest }), endIcon != null && !showLoaded && (_jsx("span", { className: cn('mrs-search-input-icon-end', `mrs-search-input-icon-end--${inputSize}`), children: endIcon })), _jsx("span", { className: cn('mrs-search-input-loaded-icon', `mrs-search-input-loaded-icon--${inputSize}`, showLoaded && 'mrs-search-input-loaded-icon--active'), "aria-hidden": "true", children: loadedIcon })] }));
});
