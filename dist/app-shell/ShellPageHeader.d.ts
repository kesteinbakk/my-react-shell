/**
 * ShellPageHeader — the page-header registration component + the chrome renderer.
 *
 * `<ShellPageHeader>` mounts anywhere in a route's subtree, renders `null`, and
 * registers its spec onto shell context via an effect (deps = the props); the
 * cleanup unregisters. `<AppShell>` renders the registered spec in its pinned
 * chrome slot through `ShellPageHeaderUI`. Because the spec carries thunks
 * (`title`, `actions[]`, `tabs`) rather than computed values, the deps compare
 * thunk identities — consumers should pass stable thunks (`useCallback` or
 * module-level) to avoid re-registration churn, but correctness does not depend
 * on it: re-register is idempotent (pop-old-by-identity, push-new).
 *
 * `findActiveChain` is the breadcrumb's SOLE input: a pure function of
 * `(roots, pathname, dynamicByParent)`. Longest-prefix match per level,
 * descending via `subPages` and merging dynamic children by parent route. It is
 * also imported by `<AppShell>` for the document-title leaf — defined here once.
 *
 * No i18n import (strings are config/prop thunks with English fallbacks) and no
 * icon import (all glyphs via `shell.config.renderIcon`). TanStack Router feeds
 * the pathname; Radix `DropdownMenu` powers the sibling leaf dropdown.
 */
import type { ReactNode } from 'react';
import type { PageEntry, ShellDocumentTitleMode, ShellPageHeaderSearchSlot, ShellPageHeaderSpec } from './shellContract';
import type { ShellContextValue } from './shellContext';
export interface ShellPageHeaderProps {
    title?: () => string;
    /**
     * Action thunks rendered in the band's horizontal strip. An `ActionButton` here
     * always lays out inline (glyph before label) — the band's stylesheet overrides
     * its `layout` prop, since the kit default `vertical` would stack the label under
     * the glyph and blow out the band height. Pass `layout="inline"` anyway for clarity.
     */
    actions?: Array<() => ReactNode>;
    search?: ShellPageHeaderSearchSlot;
    tabs?: () => ReactNode;
    documentTitle?: ShellDocumentTitleMode | (() => string);
    className?: string;
}
/**
 * Registers its spec onto shell context and renders nothing. The effect
 * re-registers whenever a prop changes (deps below), pushing a fresh spec and
 * re-rendering the chrome; the cleanup pops it.
 */
export declare function ShellPageHeader(props: ShellPageHeaderProps): null;
/** One resolved breadcrumb level: the matched entry and its sibling set. */
export interface ChainLevel {
    entry: PageEntry;
    siblings: PageEntry[];
}
/**
 * Resolve the breadcrumb chain for a pathname. PURE — a function of the URL
 * pathname plus the static `roots` tree and the runtime `dynamicByParent` map.
 * At each level it merges the parent's dynamic children into the candidate pool,
 * picks the longest route that prefixes the pathname, then descends via that
 * entry's `subPages`. Stops at a leaf with no further match.
 */
export declare function findActiveChain(roots: PageEntry[], pathname: string, dynamicByParent: Record<string, PageEntry[]>): ChainLevel[];
export interface ShellPageHeaderUIProps {
    spec: ShellPageHeaderSpec;
    shell: ShellContextValue;
    /** Show the leading hamburger (menu mode, drawer nav). Mobile-only via CSS. */
    showMenuButton?: boolean;
    onOpenMenu?: () => void;
}
/**
 * Renders the page-header band: breadcrumbs (optional leading hamburger), the
 * actions cluster, the search input, and an optional pinned tabs row.
 */
export declare function ShellPageHeaderUI(props: ShellPageHeaderUIProps): ReactNode;
