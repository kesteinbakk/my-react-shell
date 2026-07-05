import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SegmentedControl } from '../components';
import { useShellContextOptional } from './shellContext';
export function ShellAppModeControl({ variant }) {
    const shell = useShellContextOptional();
    if (shell === null)
        return null;
    const runtime = shell.appMode;
    const config = shell.config.appMode;
    if (runtime === null || config === undefined)
        return null;
    if (!runtime.visible)
        return null;
    // "Only one choice → don't show" — a single (or zero) available mode has nothing
    // to switch between, so the control is omitted (the value is still readable).
    if (runtime.modes.length < 2)
        return null;
    // Menu mode sits in a narrow sidebar column → stretch full-width at the small
    // size; header mode gets its natural width at the default size.
    const menu = variant === 'menu';
    const iconSize = menu ? 14 : 16;
    const renderIcon = shell.config.renderIcon;
    const options = runtime.modes.map((mode) => {
        const iconKey = config.icon?.(mode);
        return {
            value: mode,
            label: config.label(mode),
            icon: iconKey ? renderIcon(iconKey, iconSize) : undefined,
            iconPosition: config.iconPosition,
            tone: config.tone?.(mode) ?? undefined,
        };
    });
    const currentOption = options.find((option) => option.value === runtime.appMode);
    const ariaLabel = config.ariaLabel?.();
    return (_jsxs("div", { className: `mrs-shell__app-mode mrs-shell__app-mode--${variant}`, "data-readonly": !runtime.selectable, children: [_jsx("div", { className: "mrs-shell__app-mode-segmented", children: _jsx(SegmentedControl, { options: options, value: runtime.appMode, onChange: runtime.selectable ? runtime.setAppMode : () => { }, "aria-label": ariaLabel, size: menu ? 'sm' : 'md', fullWidth: menu }) }), !menu && (_jsx("div", { className: "mrs-shell__app-mode-dropdown", children: runtime.selectable ? (_jsxs(DropdownMenu.Root, { children: [_jsx(DropdownMenu.Trigger, { asChild: true, children: _jsxs("button", { type: "button", className: "mrs-shell__app-mode-trigger", "aria-label": ariaLabel, children: [currentOption?.icon, _jsx("span", { className: "mrs-shell__app-mode-trigger-label", children: currentOption?.label }), renderIcon('chevronDown', 16)] }) }), _jsx(DropdownMenu.Portal, { children: _jsx(DropdownMenu.Content, { className: "mrs-shell__app-mode-menu", align: "end", children: options.map((option) => (_jsxs(DropdownMenu.Item, { className: "mrs-shell__app-mode-menu-item", "data-current": option.value === runtime.appMode, onSelect: () => runtime.setAppMode(option.value), children: [option.icon, option.label] }, option.value))) }) })] })) : (_jsxs("span", { className: "mrs-shell__app-mode-trigger mrs-shell__app-mode-trigger--static", children: [currentOption?.icon, _jsx("span", { className: "mrs-shell__app-mode-trigger-label", children: currentOption?.label })] })) }))] }));
}
