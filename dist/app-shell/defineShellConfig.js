/**
 * defineShellConfig — builder + validator for the shell config.
 *
 * Validates the author-facing input synchronously (throwing `ShellConfigError`
 * at module-load time, when the consumer imports its shell config) and returns a
 * frozen, branded `ShellConfig`. The brand is defense in depth: a re-import or
 * dynamic factory can forge a raw object that satisfies the structural type, so
 * `<AppShell>` re-checks the symbol at runtime.
 */
import { SHELL_CONFIG_BRAND } from './shellContract';
const MAX_WIDTHS = ['narrow', 'medium', 'wide', 'x-wide', 'full'];
const TABS_VARIANTS = ['underline', 'pill'];
export class ShellConfigError extends Error {
    constructor(message) {
        super(`[AppShell config] ${message}`);
        this.name = 'ShellConfigError';
    }
}
function validatePageEntry(entry, parentRoute, seenIds, seenRoutes) {
    if (typeof entry.id !== 'string' || entry.id === '') {
        throw new ShellConfigError('every page needs a non-empty string `id`.');
    }
    const idOwner = seenIds.get(entry.id);
    if (idOwner !== undefined) {
        throw new ShellConfigError(`duplicate page id "${entry.id}" (already declared by route "${idOwner}").`);
    }
    if (typeof entry.route !== 'string' || !entry.route.startsWith('/')) {
        throw new ShellConfigError(`page "${entry.id}" needs a \`route\` starting with "/".`);
    }
    if (parentRoute === null && entry.route === '/') {
        throw new ShellConfigError(`page "${entry.id}" uses route "/" which is reserved for home. ` +
            'Remove it from `pages` — home is always reachable via the brand link and the breadcrumb house icon.');
    }
    const routeOwner = seenRoutes.get(entry.route);
    if (routeOwner !== undefined) {
        throw new ShellConfigError(`duplicate route "${entry.route}" (already declared by page "${routeOwner}").`);
    }
    if (typeof entry.label !== 'function') {
        throw new ShellConfigError(`page "${entry.id}" needs a \`label\` thunk (() => string).`);
    }
    if (typeof entry.icon !== 'string' || entry.icon === '') {
        throw new ShellConfigError(`page "${entry.id}" needs a non-empty string \`icon\`.`);
    }
    if (parentRoute !== null) {
        if (entry.route === parentRoute || !entry.route.startsWith(`${parentRoute}/`)) {
            throw new ShellConfigError(`sub-page "${entry.id}" route "${entry.route}" must be nested under its parent "${parentRoute}/".`);
        }
    }
    seenIds.set(entry.id, entry.route);
    seenRoutes.set(entry.route, entry.id);
    if (entry.subPages !== undefined) {
        if (!Array.isArray(entry.subPages)) {
            throw new ShellConfigError(`page "${entry.id}" \`subPages\` must be an array.`);
        }
        for (const sub of entry.subPages) {
            validatePageEntry(sub, entry.route, seenIds, seenRoutes);
        }
    }
}
export function defineShellConfig(input) {
    if (input === null || typeof input !== 'object') {
        throw new ShellConfigError('config must be an object.');
    }
    if (typeof input.appName !== 'string' || input.appName === '') {
        throw new ShellConfigError('`appName` must be a non-empty string.');
    }
    if (input.appNameRender !== undefined && typeof input.appNameRender !== 'function') {
        throw new ShellConfigError('`appNameRender` must be a function when present.');
    }
    if (typeof input.renderIcon !== 'function') {
        throw new ShellConfigError('`renderIcon` is required and must be a function (the module ships no icon kit).');
    }
    // `pages` may be empty: a card-dashboard app has no fixed top-level nav for
    // non-admin roles (it navigates via the home cards + breadcrumbs). Still must
    // be an array — a missing/non-array `pages` is an authoring error.
    if (!Array.isArray(input.pages)) {
        throw new ShellConfigError('`pages` must be an array.');
    }
    const seenIds = new Map();
    const seenRoutes = new Map();
    for (const page of input.pages) {
        validatePageEntry(page, null, seenIds, seenRoutes);
    }
    if (input.pageContainer !== undefined && !MAX_WIDTHS.includes(input.pageContainer.defaultMaxWidth)) {
        throw new ShellConfigError(`\`pageContainer.defaultMaxWidth\` must be one of ${MAX_WIDTHS.join(', ')}.`);
    }
    if (input.tabs !== undefined && !TABS_VARIANTS.includes(input.tabs.variant)) {
        throw new ShellConfigError(`\`tabs.variant\` must be one of ${TABS_VARIANTS.join(', ')}.`);
    }
    if (input.shellPageHeader !== undefined && typeof input.shellPageHeader.border !== 'boolean') {
        throw new ShellConfigError('`shellPageHeader.border` must be a boolean.');
    }
    if (input.appMode !== undefined) {
        const m = input.appMode;
        if (!Array.isArray(m.modes) || m.modes.length === 0) {
            throw new ShellConfigError('`appMode.modes` must be a non-empty array.');
        }
        for (const mode of m.modes) {
            if (typeof mode !== 'string' || mode === '') {
                throw new ShellConfigError('`appMode.modes` entries must be non-empty strings.');
            }
        }
        if (new Set(m.modes).size !== m.modes.length) {
            throw new ShellConfigError('`appMode.modes` must not contain duplicate values.');
        }
        if (typeof m.label !== 'function') {
            throw new ShellConfigError('`appMode.label` must be a function `(mode) => string`.');
        }
        if (m.defaultMode !== undefined && !m.modes.includes(m.defaultMode)) {
            throw new ShellConfigError(`\`appMode.defaultMode\` "${m.defaultMode}" is not one of \`appMode.modes\`.`);
        }
        if (m.ariaLabel !== undefined && typeof m.ariaLabel !== 'function') {
            throw new ShellConfigError('`appMode.ariaLabel` must be a function when present.');
        }
        if (m.visible !== undefined && typeof m.visible !== 'boolean') {
            throw new ShellConfigError('`appMode.visible` must be a boolean when present.');
        }
        if (m.selectable !== undefined && typeof m.selectable !== 'boolean') {
            throw new ShellConfigError('`appMode.selectable` must be a boolean when present.');
        }
    }
    return Object.freeze({ ...input, [SHELL_CONFIG_BRAND]: true });
}
