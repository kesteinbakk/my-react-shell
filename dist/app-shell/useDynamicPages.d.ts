/**
 * useDynamicPages — register runtime breadcrumb children under a parent route.
 *
 * Routes with a dynamic set of sub-pages (e.g. one per Convex record) call this
 * to feed the breadcrumb chain `findActiveChain` reads. It takes a PLAIN config
 * object (not a thunk): the caller already re-renders when its data updates, so
 * the hook just runs an effect that maps the items to context entries and
 * registers them, returning the unregister. The effect is keyed on a serialized
 * digest of the items so it re-registers on content change, not on every render
 * (callers typically pass a fresh array each render).
 *
 * A plain `useEffect` (post-commit) is correct here: SPA has no SSR HTML, so the
 * SolidJS `createComputed` (synchronous, SSR-correct registration) is moot — the
 * chain fills in on the same first paint cycle. Each string `label` is wrapped
 * as `() => label` to stay `PageEntry`-shaped; a missing `icon` defaults to
 * `'circle'`; optional `hideCrumb` and `disableCrumbLink` predicates pass through
 * unchanged — see their `PageEntry` docs for semantics.
 * Throws (via `useShellContext`) when used outside `<AppShell>`.
 */
/** One runtime page — a plain-data shape the hook lifts into a `PageEntry`. */
export interface DynamicPageInput {
    id: string;
    label: string;
    route: string;
    icon?: string;
    /**
     * Reactive predicate to omit this level from the rendered breadcrumb trail while
     * keeping it structurally in the chain (its descendants stay navigable). Use it to
     * hide an access-gated ancestor — e.g. a workspace crumb a member can reach the
     * children of but can't open. The leaf is never hidden. See `PageEntry.hideCrumb`.
     */
    hideCrumb?: () => boolean;
    /**
     * Reactive predicate to render this ancestor as a plain label instead of a
     * clickable link. The crumb still appears in the trail; it simply has no click
     * target. Use when the parent route has no standalone page worth navigating to.
     * No effect on the leaf. See `PageEntry.disableCrumbLink`.
     */
    disableCrumbLink?: () => boolean;
}
export interface DynamicPagesConfig {
    parent: string;
    items: DynamicPageInput[];
}
/** Register `config.items` as breadcrumb children of `config.parent`. */
export declare function useDynamicPages(config: DynamicPagesConfig): void;
