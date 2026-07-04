import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from '@tanstack/react-router';
import { useShellContextOptional } from './shellContext';
import { ShellAppModeControl } from './ShellAppModeControl';
export function AppHeader(props) {
    const shell = useShellContextOptional();
    const resolvedTitle = props.title ?? shell?.config.appName;
    if (resolvedTitle === undefined) {
        throw new Error('AppHeader requires a `title` when used outside <AppShell> (no shell config to fall back to)');
    }
    // Use the consumer's custom wordmark only when we are showing the config app
    // name (i.e. no explicit `title` prop override).
    const showConfigBrand = props.title === undefined && shell !== null;
    const appNameRender = shell?.config.appNameRender;
    const brand = showConfigBrand && appNameRender ? appNameRender() : resolvedTitle;
    const homeRoute = props.homeRoute ?? '/';
    const className = props.className
        ? `mrs-app-header ${props.className}`
        : 'mrs-app-header';
    return (_jsxs("header", { className: className, children: [_jsx(Link, { to: homeRoute, className: "mrs-app-header__brand", children: brand }), props.titleAdornment?.(), props.subtitle ? (_jsx("span", { className: "mrs-app-header__subtitle", children: props.subtitle() })) : null, _jsxs("div", { className: "mrs-app-header__right", children: [_jsx(ShellAppModeControl, { variant: "header" }), _jsx("div", { className: "mrs-app-header__actions", children: props.actions.map((thunk, i) => (_jsx("span", { children: thunk() }, i))) })] })] }));
}
