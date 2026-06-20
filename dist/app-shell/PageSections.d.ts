/**
 * PageSections — page-level tabbed content, rendered inside the scrolling body
 * of `<AppShell>` (below the pinned `<ShellPageHeader>` chrome).
 *
 * Two display modes (`mode` prop, default `'single'`):
 *   - `single` — only the active section is mounted (traditional tabs).
 *   - `list`   — all sections mounted with headers; click-to-scroll + scroll-spy.
 *
 * **Tab strip.** Rendered inline as a `position: sticky` strip at the top of
 * PageSections (`.mrs-sections__strip`), so the tabs stay pinned while the page
 * scrolls beneath them.
 *
 * **URL persistence (`persistKey` prop).** When set (e.g. `'tab'`), the active
 * section id round-trips to `?<persistKey>=<id>`. Read on mount + reactively
 * after mount (so same-path deep-links update the tab). Write-back uses TanStack
 * `navigate({ …, replace: true })` — never raw `history.replaceState`. TanStack
 * `search` is an OBJECT: read it via `useRouterState({ select: s => s.location.search })`
 * and write it by merging (`search: prev => ({ ...prev, [key]: value })`), never
 * via `window.location.search`. During an in-flight transition the committed
 * `window.location` can lag the router's location, so the router state is the
 * sole source of truth in both directions.
 *
 * **Return-from-descendant memory (single mode only).** When the user leaves a
 * tab page via a sub-route and comes back via breadcrumb, the last-active
 * section is restored from a module-scoped `Map<pathname, sectionId>`.
 *
 * **Scroll container, scrollspy + click-to-scroll (list mode).** The element
 * that scrolls is `<AppShell>`'s body cell (`shell.scrollContainer`), NOT an
 * inner container — PageSections isn't reliably height-bounded, so an inner
 * `overflow` would never engage. The container is resolved REACTIVELY (its ref
 * can arrive after PageSections mounts), via an effect keyed on
 * `shell?.scrollContainer`. Reading it once on mount would skip scrollspy + the
 * deep-link scroll forever.
 *
 * **Section children must be thunks** (`() => ReactNode`); see
 * `PageSection.children`.
 */
import type { ReactNode } from 'react';
import type { PageSectionsProps } from './pageSections/types';
export type { PageSection, PageSectionsMode, PageSectionsProps } from './pageSections/types';
export declare function PageSections(props: PageSectionsProps): ReactNode;
