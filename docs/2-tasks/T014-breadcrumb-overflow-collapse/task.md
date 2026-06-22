# T014 — breadcrumb overflow: per-crumb cap + middle-collapse

- **Status:** in-progress
- **Filed:** 2026-06-22
- **Working branch:** `main` (no worktree — focused edit in `src/app-shell/` + rebuild)
- **Origin:** user report — a deep breadcrumb chain with a long dynamic leaf
  (`🏠 › Ikomm › DEMO: Anskaffelse av ERP-system › Evaluering › Funksjonalitet og
  brukervennlighet › Bestilling › BE-05: Å få varsel per epost når jeg får tildelt
  eller videresendt en oppgave`) wraps every crumb to two lines, mis-aligns the
  chevrons, and breaks the header layout.

## Root cause

The React port of the breadcrumb (`src/app-shell/ShellPageHeader.tsx`) dropped the
foundation's per-crumb `truncate`. `.mrs-breadcrumbs__link` / `__leaf` have no
`white-space:nowrap`, no `overflow`, no `text-overflow:ellipsis`, no width cap, and
the chevrons + home icon are not `flex-shrink:0`. So long labels wrap and a deep
chain blows out horizontally. There are two independent failure modes:

1. **Too many levels** → horizontal blowout.
2. **One very long label** (a dynamic record name — at *any* level, not just the
   leaf) → blowout on its own.

## Decision (user-approved)

Implement **both**, diverging from foundation (which only truncates — no
middle-collapse). The user explicitly asked for the collapse and for *all* crumbs
(not only the leaf) to be capped.

1. **Per-crumb hard cap + ellipsis on every crumb.** `white-space:nowrap;
   overflow:hidden; text-overflow:ellipsis; min-width:0` + a `max-width` driven by a
   CSS custom property (`--mrs-breadcrumb-label-max`, default `14rem`) on every crumb
   label (link, leaf span, leaf-dropdown trigger text). Home icon + chevrons +
   dropdown carets get `flex-shrink:0`. The row never wraps.
2. **Middle-collapse.** When `chain.length > leading + trailing`, render the first
   `leading` crumbs, a single **"…" overflow item**, then the last `trailing`
   crumbs. The "…" is a Radix `DropdownMenu` listing the hidden ancestor crumbs
   (each navigable to its route), reusing the existing dropdown machinery and the
   existing `labels.more` aria-label. Default `leading: 1`, `trailing: 2`.

**Config:** new optional `ShellPageHeaderConfig.breadcrumbCollapse?: { leading?:
number; trailing?: number } | false`. Default `{ leading: 1, trailing: 2 }`; `false`
disables collapse (truncation still applies). `trailing` is clamped to ≥ 1 so the
leaf is always shown; `leading` to ≥ 0.

Count-based (not width/ResizeObserver-based): deterministic, pure, SSR-safe, no
layout thrash, maps 1:1 onto the user's "1-2 / 2-3" request.

## Plan

1. `shellContract.ts` — add `breadcrumbCollapse` to `ShellPageHeaderConfig`.
2. `ShellPageHeader.tsx` — compute a display list from `chain` (leading items +
   overflow marker + trailing items), render the overflow `DropdownMenu`, add
   truncation class names.
3. `app-shell.css` — truncation CSS + the `--mrs-breadcrumb-label-max` cap +
   `flex-shrink:0` on home/chevron + overflow-item styling.
4. `docs/specifications/api-reference.md` — document the config field.
5. `docs/guides/app-shell.md` — breadcrumb overflow behavior section.
6. `pnpm build:lib` (demo link-consumes `dist/`); verify on the demo nested-pages
   route (its 4-level chain triggers collapse with the defaults).

## Out of scope

- Responsive width-based collapse (rejected — see above).
- Any change to `findActiveChain` or the chain-resolution logic (T009 territory).
