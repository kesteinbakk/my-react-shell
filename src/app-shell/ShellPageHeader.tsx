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

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type {
  PageEntry,
  ShellBreadcrumbCollapseConfig,
  ShellPageHeaderSearchSlot,
  ShellPageHeaderSpec,
} from './shellContract'
import type { ShellContextValue } from './shellContext'

/* ── Breadcrumb chain (pure) ─────────────────────────────────────────────── */

/** One resolved breadcrumb level: the matched entry and its sibling set. */
export interface ChainLevel {
  entry: PageEntry
  siblings: PageEntry[]
}

/**
 * Resolve the breadcrumb chain for a pathname. PURE — a function of the URL
 * pathname plus the static `roots` tree and the runtime `dynamicByParent` map.
 * At each level it merges the parent's dynamic children into the candidate pool,
 * picks the longest route that prefixes the pathname, then descends via that
 * entry's `subPages`. Stops at a leaf with no further match.
 */
export function findActiveChain(
  roots: PageEntry[],
  pathname: string,
  dynamicByParent: Record<string, PageEntry[]>,
): ChainLevel[] {
  const chain: ChainLevel[] = []
  let pool = roots
  // The parent route whose dynamic children merge into the next level. '' keys
  // the top-level dynamic registrations (parent is the shell root).
  let parentKey = ''

  while (true) {
    const dynamicHere = dynamicByParent[parentKey] ?? []
    const merged = [...pool, ...dynamicHere]

    let best: PageEntry | undefined
    for (const entry of merged) {
      if (
        pathname === entry.route ||
        (entry.route !== '/' && pathname.startsWith(entry.route + '/'))
      ) {
        if (best === undefined || entry.route.length > best.route.length) {
          best = entry
        }
      }
    }
    if (best === undefined) break

    chain.push({ entry: best, siblings: merged })
    parentKey = best.route
    pool = best.subPages ?? []
    if (pool.length === 0 && !(parentKey in dynamicByParent)) break
  }

  return chain
}

/* ── Chrome renderer (rendered by AppShell in the pinned slot) ───────────── */

export interface ShellPageHeaderUIProps {
  spec: ShellPageHeaderSpec
  shell: ShellContextValue
  /** Show the leading hamburger (menu mode, drawer nav). Mobile-only via CSS. */
  showMenuButton?: boolean
  onOpenMenu?: () => void
}

/**
 * Renders the page-header band: breadcrumbs (optional leading hamburger), the
 * actions cluster, the search input, and an optional pinned tabs row.
 */
export function ShellPageHeaderUI(props: ShellPageHeaderUIProps): ReactNode {
  const { spec, shell, showMenuButton, onOpenMenu } = props
  const config = shell.config

  const pathname = useRouterState({ select: s => s.location.pathname })
  const chain = useMemo(
    () => findActiveChain(config.pages, pathname, shell.dynamicPages),
    [config.pages, pathname, shell.dynamicPages],
  )

  const leaf = chain.at(-1)
  // The resolved leaf truly matches the current path (not just an ancestor).
  const leafMatchesPath = leaf !== undefined && leaf.entry.route === pathname

  // DEV warning when the route resolves to no registered leaf: the breadcrumb
  // can only show ancestors, never this page. Surfaced once per resolution.
  // Exempt: dynamic parents (the child is transient/data-driven, not a config
  // bug) and the site root (a chrome-only header at "/" is the correct pattern
  // since registering "/" as a page now throws).
  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (leafMatchesPath) return
    if (leaf && leaf.entry.route in shell.dynamicPages) return
    if (!leaf && pathname === '/') return
    const ancestor = leaf ? leaf.entry.route : '(none)'
    console.warn(
      `[AppShell] No registered page for "${pathname}" (nearest ancestor: ${ancestor}). ` +
        'Register it in shell config `pages` or via useDynamicPages.',
    )
  }, [pathname, leafMatchesPath, leaf, shell.dynamicPages])

  const border = config.shellPageHeader?.border ?? true
  const hasActions = (spec.actions?.length ?? 0) > 0

  const className = spec.className
    ? `mrs-page-header ${spec.className}`
    : 'mrs-page-header'

  return (
    <div className={className} data-border={border}>
      <div className="mrs-page-header__row">
        <Breadcrumbs
          chain={chain}
          shell={shell}
          spec={spec}
          leafMatchesPath={leafMatchesPath}
          showMenuButton={showMenuButton}
          onOpenMenu={onOpenMenu}
        />

        {hasActions ? (
          <div className="mrs-page-header__actions">
            {spec.actions!.map((thunk, i) => (
              <span key={i}>{thunk()}</span>
            ))}
          </div>
        ) : null}

        {spec.search ? <SearchInput slot={spec.search} shell={shell} /> : null}
      </div>

      {spec.tabs ? (
        <div className="mrs-page-header__tabs">{spec.tabs()}</div>
      ) : null}
    </div>
  )
}

/* ── Breadcrumbs ─────────────────────────────────────────────────────────── */

interface BreadcrumbsProps {
  chain: ChainLevel[]
  shell: ShellContextValue
  spec: ShellPageHeaderSpec
  leafMatchesPath: boolean
  showMenuButton?: boolean
  onOpenMenu?: () => void
}

/** Default middle-collapse: keep the first crumb + the last two (incl. leaf). */
const DEFAULT_BREADCRUMB_COLLAPSE: Required<ShellBreadcrumbCollapseConfig> = {
  leading: 1,
  trailing: 2,
}

/**
 * One rendered breadcrumb position: a resolved chain level (carrying its original
 * index so the leaf can be identified) or the "…" overflow placeholder holding the
 * hidden ancestor levels.
 */
type CrumbSlot =
  | { kind: 'level'; level: ChainLevel; index: number }
  | { kind: 'overflow'; hidden: ChainLevel[] }

/**
 * Collapse the middle of a long chain. With `collapse === false`, every level is
 * shown. Otherwise, when the chain has more than `leading + trailing` levels, the
 * middle ones fold into a single overflow slot. `trailing` is clamped to ≥ 1 so the
 * leaf always survives, `leading` to ≥ 0.
 */
function buildCrumbSlots(
  chain: ChainLevel[],
  collapse: ShellBreadcrumbCollapseConfig | false | undefined,
): CrumbSlot[] {
  const all: CrumbSlot[] = chain.map((level, index) => ({
    kind: 'level',
    level,
    index,
  }))
  if (collapse === false) return all

  const leading = Math.max(
    0,
    collapse?.leading ?? DEFAULT_BREADCRUMB_COLLAPSE.leading,
  )
  const trailing = Math.max(
    1,
    collapse?.trailing ?? DEFAULT_BREADCRUMB_COLLAPSE.trailing,
  )
  if (chain.length <= leading + trailing) return all

  const hidden = chain.slice(leading, chain.length - trailing)
  return [
    ...all.slice(0, leading),
    { kind: 'overflow', hidden },
    ...all.slice(chain.length - trailing),
  ]
}

function Breadcrumbs(props: BreadcrumbsProps): ReactNode {
  const { chain, shell, spec, leafMatchesPath, showMenuButton, onOpenMenu } =
    props
  const config = shell.config

  const homeLabel = config.labels?.home?.() ?? 'Home'
  const navLabel = config.labels?.breadcrumb?.() ?? 'Breadcrumb'
  const openMenuLabel = config.labels?.openMenu?.() ?? 'Open menu'

  // Drop access-hidden ancestor levels (`PageEntry.hideCrumb()` returns true). The
  // leaf (current page) is never hidden, so the rendered trail can't go empty; the
  // hidden level stays in the chain for descent, so its descendants stay navigable.
  const visibleChain = chain.filter((level, i) => {
    const isLeaf = i === chain.length - 1
    return isLeaf || level.entry.hideCrumb?.() !== true
  })
  const lastIndex = visibleChain.length - 1

  // The spec title overrides only the leaf label, and only when the resolved
  // leaf is the current page (Hard Rule #2: title never adds a level).
  const leafOverride =
    spec.title && leafMatchesPath ? spec.title() : undefined

  const slots = buildCrumbSlots(
    visibleChain,
    config.shellPageHeader?.breadcrumbCollapse,
  )

  return (
    <nav className="mrs-breadcrumbs" aria-label={navLabel}>
      {showMenuButton ? (
        <button
          type="button"
          className="mrs-page-header__hamburger"
          aria-label={openMenuLabel}
          onClick={onOpenMenu}
        >
          {config.renderIcon('menu', 20)}
        </button>
      ) : null}

      <Link to="/" className="mrs-breadcrumbs__home" title={homeLabel}>
        {config.renderIcon('home', 18)}
      </Link>

      {slots.map(slot => {
        const chevron = (
          <span className="mrs-breadcrumbs__chevron">
            {config.renderIcon('chevronRight', 14)}
          </span>
        )

        if (slot.kind === 'overflow') {
          return (
            <span key="overflow" className="mrs-breadcrumbs__crumb">
              {chevron}
              <OverflowCrumb shell={shell} hidden={slot.hidden} />
            </span>
          )
        }

        const { level, index } = slot
        const isLeaf = index === lastIndex
        const label =
          isLeaf && leafOverride !== undefined
            ? leafOverride
            : level.entry.label()
        return (
          <span key={level.entry.id} className="mrs-breadcrumbs__crumb">
            {chevron}
            {isLeaf ? (
              level.siblings.length > 1 ? (
                <LeafDropdown
                  shell={shell}
                  label={label}
                  siblings={level.siblings}
                  selectedId={level.entry.id}
                />
              ) : (
                <span className="mrs-breadcrumbs__leaf" title={label}>
                  <span className="mrs-breadcrumbs__label">{label}</span>
                </span>
              )
            ) : level.entry.disableCrumbLink?.() ? (
              <span className="mrs-breadcrumbs__link" title={label}>
                <span className="mrs-breadcrumbs__label">{label}</span>
              </span>
            ) : (
              <Link
                to={level.entry.route}
                className="mrs-breadcrumbs__link"
                title={label}
              >
                <span className="mrs-breadcrumbs__label">{label}</span>
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

/* ── Overflow crumb (collapsed middle) ───────────────────────────────────── */

interface OverflowCrumbProps {
  shell: ShellContextValue
  hidden: ChainLevel[]
}

/**
 * The "…" placeholder standing in for the collapsed middle of a long chain. Opens a
 * dropdown listing the hidden ancestor crumbs, each a link back up the chain.
 */
function OverflowCrumb(props: OverflowCrumbProps): ReactNode {
  const { shell, hidden } = props
  const navigate = useNavigate()
  const moreLabel = shell.config.labels?.more?.() ?? 'More'

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="mrs-breadcrumbs__overflow"
          aria-label={moreLabel}
        >
          …
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="mrs-breadcrumbs__menu">
          {hidden.map(level => (
            <DropdownMenu.Item
              key={level.entry.id}
              className="mrs-breadcrumbs__menu-item"
              disabled={level.entry.disableCrumbLink?.() === true}
              onSelect={() => navigate({ to: level.entry.route })}
            >
              {shell.config.renderIcon(level.entry.icon, 16)}
              {level.entry.label()}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

/* ── Leaf dropdown (sibling switcher) ────────────────────────────────────── */

interface LeafDropdownProps {
  shell: ShellContextValue
  label: string
  siblings: PageEntry[]
  selectedId: string
}

function LeafDropdown(props: LeafDropdownProps): ReactNode {
  const { shell, label, siblings, selectedId } = props
  const navigate = useNavigate()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="mrs-breadcrumbs__leaf" title={label}>
          <span className="mrs-breadcrumbs__label">{label}</span>
          <span className="mrs-breadcrumbs__caret">
            {shell.config.renderIcon('chevronDown', 16)}
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="mrs-breadcrumbs__menu">
          {siblings.map(s => (
            <DropdownMenu.Item
              key={s.id}
              className="mrs-breadcrumbs__menu-item"
              data-current={s.id === selectedId}
              onSelect={() => navigate({ to: s.route })}
            >
              {shell.config.renderIcon(s.icon, 16)}
              {s.label()}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

/* ── Search input ────────────────────────────────────────────────────────── */

interface SearchInputProps {
  slot: ShellPageHeaderSearchSlot
  shell: ShellContextValue
}

function SearchInput(props: SearchInputProps): ReactNode {
  const { slot, shell } = props
  const [value, setValue] = useState(slot.initialValue ?? '')
  const placeholder = slot.placeholder?.()

  return (
    <div className="mrs-page-header__search">
      <span className="mrs-page-header__search-icon">
        {shell.config.renderIcon('search', 16)}
      </span>
      <input
        type="search"
        className="mrs-page-header__search-input"
        value={value}
        placeholder={placeholder}
        onInput={e => {
          const next = e.currentTarget.value
          setValue(next)
          slot.onChange(next)
        }}
      />
    </div>
  )
}
