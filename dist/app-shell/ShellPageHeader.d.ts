/**
 * ShellPageHeader internals — the breadcrumb chain (pure) + the chrome renderer.
 *
 * The page-chrome registration API is the `usePageHeader` hook (see
 * `usePageHeader.ts`); this file holds what `<AppShell>` renders in the band.
 *
 * `findActiveChain` is the breadcrumb's SOLE input: a pure function of
 * `(roots, pathname, dynamicByParent)`. Longest-prefix match per level, descending
 * via `subPages` and merging dynamic children by parent route. `<AppShell>` also
 * uses it for the document-title leaf and the automatic band-visibility gate — so
 * the band renders whenever the URL resolves to a chain, no component required.
 * `ShellPageHeaderUI` renders the band (breadcrumbs + actions + search + pinned
 * tabs). A level whose `PageEntry.hideCrumb()` returns true is dropped from the
 * rendered trail (never the leaf) — see `Breadcrumbs`.
 *
 * No i18n import (strings are config/prop thunks with English fallbacks) and no
 * icon import (all glyphs via `shell.config.renderIcon`). TanStack Router feeds
 * the pathname; Radix `DropdownMenu` powers the sibling leaf dropdown.
 */
import type { ReactNode } from 'react';
import type { PageEntry, ShellPageHeaderSpec } from './shellContract';
import type { ShellContextValue } from './shellContext';
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
