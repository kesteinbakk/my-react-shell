/**
 * usePageHeader — register a route's page chrome (title / actions / search / tabs /
 * documentTitle / className) onto the shell band.
 *
 * The breadcrumb band itself renders **automatically** from the URL chain — a page
 * does not call this hook just to show breadcrumbs. Call it only to *add* chrome.
 * The hook splits identity from content: a register-once mount effect fixes this
 * contributor's slot under a stable **render-order token** (so the deepest-mounted
 * `usePageHeader` wins — see `shellContext.registerPageHeader`), while a separate
 * effect updates the spec **in place** on any option change — never re-registering,
 * so the winner can't flip at runtime when a component re-renders with fresh inline
 * thunks. The chrome stays reactive while remaining deterministic.
 *
 * **Footgun-proof by design.** The content effect pushes a new spec to the shell
 * band (a `setState`) only when the spec's *resolved values* actually change — never
 * merely because an option's identity did. This matters because pushing a spec
 * re-renders the band, which re-renders this hook's own subtree; if that push fired
 * on every render (as it would for an inline `title: () => t('…')` thunk, a fresh
 * `search: { … }` object, or a fresh `actions: []` array — all recreated each
 * render) the band and the route would re-render each other without end, tripping
 * React's "Maximum update depth exceeded" guard (the loop surfaces at the breadcrumb
 * leaf's Radix Popper anchor, but the engine is the every-render push). By comparing
 * *values* rather than identities, unstable options are tolerated — exactly what a
 * consumer expects — while a title/search/action whose underlying value genuinely
 * changes still updates the band. The band resolves the winning spec's thunks on its
 * own render, so it never needs a fresh thunk *identity* pushed to it, only a fresh
 * value signal.
 *
 * Churn is tolerated, not endorsed: in DEV the content effect warns once per instance
 * (naming the offending field) when an option's identity churns without its value
 * changing, so a consumer can memoize away the wasted per-render work.
 *
 * Replaces foundation's `<ShellPageHeader>` registration component with a hook (the
 * React-idiomatic shape, consistent with the sibling `useDynamicPages`).
 */
import type { PageHeaderOptions } from './shellContract';
/** Register page chrome onto the shell band. No-op band-wise if every field is absent. */
export declare function usePageHeader(options: PageHeaderOptions): void;
