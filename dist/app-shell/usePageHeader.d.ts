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
 * Replaces foundation's `<ShellPageHeader>` registration component with a hook (the
 * React-idiomatic shape, consistent with the sibling `useDynamicPages`).
 */
import type { PageHeaderOptions } from './shellContract';
/** Register page chrome onto the shell band. No-op band-wise if every field is absent. */
export declare function usePageHeader(options: PageHeaderOptions): void;
