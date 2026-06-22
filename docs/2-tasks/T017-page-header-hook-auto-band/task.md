# T017 — page header: `usePageHeader` hook + automatic band + `hideCrumb`

- **Status:** finished (code + docs landed on `main`; evaluering + both demos migrated, typecheck/tests green. Remaining: user's in-browser visual parity check — the demo showcase + evaluering setup-leaf actions.)
- **Filed:** 2026-06-22
- **Working branch:** `main` (worktree `quirky-perlman-5a8c08`)
- **Supersedes:** **T016** (page-header-register-once). T016's determinism fix
  (register-once + in-place update, descendant-wins) folds into this task as the
  internal tiebreak; the narrow fix is no longer shipped on its own.
- **Spans 4 repos:** `my-react-shell` (this), `evaluering`, `my-react-shell-demo`,
  `my-react-shell-theme-demo` — all on the `link:` dev-loop, so shell edits HMR into
  every consumer live (no tag bump for dev).

## Why (origin)

T016 set out to kill the "last-writer-wins" header flicker. Investigating it surfaced a
deeper design problem the narrow fix would have entrenched:

1. **Band visibility is coupled to component mounting.** The breadcrumb band renders
   only when a `<ShellPageHeader>` spec is registered (`pageHeaderSpec ? <band/> : …`).
   A page that wants nothing but the standard URL-derived breadcrumbs must still mount
   an empty `<ShellPageHeader />` just to make the band appear. Evidence: **`my-react-shell-demo`
   mounts 12 bare `<ShellPageHeader/>` and passes props on zero of them**; evaluering's
   layouts mount bare headers purely "to render the band." This reads as cargo-cult but
   is structurally forced.
2. **The override is implicit and was non-deterministic.** A layout supplies an
   always-on baseline band; a leaf layers its own `actions` "on top." Both are mounted
   at once and the leaf must win — but React fires effects child→parent, so the T016
   register-once fix made the *layout* win, hiding the leaf's actions (a regression).
   Evaluering carries ~18 comment blocks of careful workarounds for this.

Both problems share one root: **band visibility should derive from whether the route has
breadcrumbs / page chrome, not from whether a component is mounted.** Fixing that root
lets page chrome move to a hook, removes the ghost mounts, and makes the override a
non-issue in the common case.

User decisions taken (in chat): **Option 3** (decouple band visibility + hook), **clean
break** (remove `<ShellPageHeader>` entirely — no deprecation shim), migrate **all**
consumers (evaluering + both demos) including stripping contradicting local guides.

## New public API (`my-react-shell/app-shell`)

### Removed (clean break)
- `ShellPageHeader` component and its `ShellPageHeaderProps` type — dropped from the
  barrel. There is no compat shim; every consumer migrates in this task.

### Added
- **`usePageHeader(options): void`** — the page-chrome registration hook. Same field
  shape as the old component props (thunk convention preserved for i18n + reactivity):
  ```ts
  interface PageHeaderOptions {
    title?: () => string
    actions?: Array<() => ReactNode>
    search?: ShellPageHeaderSearchSlot
    tabs?: () => ReactNode
    documentTitle?: ShellDocumentTitleMode | (() => string)
    className?: string
  }
  export function usePageHeader(options: PageHeaderOptions): void
  ```
  Call it from any component under `<AppShell>`. Internally: registers a spec once on
  mount, updates it in place on change (T016 mechanics), unregisters on unmount; the
  winning spec is the **deepest-mounted** one (see Determinism).
- **`PageEntry.hideCrumb?: () => boolean`** — new optional, reactive predicate. When it
  returns `true`, that level is **omitted from the rendered breadcrumb trail** while
  remaining structurally in the chain: the URL is unchanged, the chain still descends
  through it, and its descendants stay navigable. The consumer supplies the access
  logic (`hideCrumb: () => !canAccess('/company')`); the shell stays role-agnostic, per
  the auth-seam philosophy. Guard: the **leaf (current page) is never hidden**, so the
  trail can't go empty.

### Changed behavior (internal + render)
- **Automatic band visibility.** `<AppShell>` renders the page-header band when **any**
  of: the URL resolves to a breadcrumb chain (`findActiveChain(...).length > 0`), a
  `usePageHeader` call contributed page chrome (actions/search/tabs/title), or the
  mobile menu button needs hosting. No registered spec is required to show breadcrumbs.
  This lifts foundation's existing `showBand()` content-gate up to be *the* gate. At `/`
  (empty chain, no chrome) → no band, as today.
- **Determinism (descendant-wins).** The internal `registerPageHeader` keys each
  contributor by a **render-order token** (captured at render via a module counter +
  ref guard; React renders parent→child, so ancestor < descendant). The winning spec is
  the entry with the highest token — i.e. the deepest-mounted `usePageHeader`, matching
  foundation's parent-first `onMount` order. In-place updates (T016) mean a re-render
  never reorders. The old dev "multiple mounted" `console.warn` is **dropped** — with
  auto-band there is normally one contributor per route, and collisions now resolve
  predictably rather than surprisingly.

### Retained unchanged
- `useDynamicPages` (still how dynamic crumb levels are registered), `findActiveChain`
  (pure, still exported), breadcrumb overflow/collapse, the search slot, document-title
  resolution, `defineShellConfig`, all chrome components.

## Foundation divergence (record in `strategy.md`)

Per the faithful-port rule, these are **deliberate React-side divergences** from the
Solid `foundation`, approved by the user:
- `usePageHeader` **hook** replaces foundation's `<ShellPageHeader>` registration
  *component* (React-idiomatic; consistent with the sibling `useDynamicPages` hook).
- `PageEntry.hideCrumb` is **net-new** — foundation has no per-level hide mechanism.
- **Automatic band visibility** — foundation gates the band on a registered spec; we
  derive it from chain/chrome content (a lift of foundation's own `showBand()` gate).

A new `strategy.md` decision entry records these so the divergence is intentional and
documented, not silent.

## Plan

### Phase 1 — shell library (`my-react-shell`)
1. **`shellContract.ts`** — add `PageEntry.hideCrumb?: () => boolean` (+ JSDoc); add
   `PageHeaderOptions` type; remove component-only `ShellPageHeaderProps`. Keep
   `ShellPageHeaderSpec` (internal spec) and `ShellPageHeaderSearchSlot`.
2. **`shellContext.ts`** — `registerPageHeader` takes/stores a render-order token;
   `pageHeaderSpec` = the entry with the max token; JSDoc updated. (Internal contract.)
3. **`usePageHeader.ts`** (new) — the hook: render-order token (module counter + ref
   guard, StrictMode-safe), register-once identity effect + in-place content effect
   (T016 mechanics), unregister on unmount.
4. **`ShellPageHeader.tsx`** — remove the `ShellPageHeader` component; keep
   `ShellPageHeaderUI`, `findActiveChain`, `Breadcrumbs`. In `Breadcrumbs`/
   `buildCrumbSlots`: filter out non-leaf chain levels whose `hideCrumb()` is true
   (leaf always kept) **before** slot/collapse building.
5. **`AppShell.tsx`** — compute the active chain at the shell level; gate the band on
   `chain.length > 0 || hasPageChrome || mobileMenuButtonNeeded`; render
   `ShellPageHeaderUI` with the winning spec (or a chrome-less spec when only crumbs
   exist); drop the spec-required gate and the dev warning. Verify document-title memo
   still reads the winning spec correctly.
6. **`index.ts`** — barrel: remove `ShellPageHeader` + `ShellPageHeaderProps`; add
   `usePageHeader` + `PageHeaderOptions`.
7. **`app-shell.css`** — expected unchanged (band styling identical); verify.
8. `pnpm build:lib` (dist rebuild; pre-commit guard also rebuilds).

### Phase 2 — docs (this repo) — **"very clearly documented"**
9. **`api-reference.md`** — replace the `ShellPageHeader` entry with `usePageHeader` +
   `PageHeaderOptions`; document automatic band visibility; document
   `PageEntry.hideCrumb`; update the example. (≈ lines 32, 687–714.)
10. **`guides/app-shell.md`** — rewrite "The page header" + breadcrumb sections to the
    hook + auto-band + `hideCrumb` model, with worked examples (a leaf adding actions; a
    layout registering crumbs via `useDynamicPages`; hiding an access-gated ancestor
    crumb). Remove the T016-era "mount exactly one" note I added.
11. **`CLAUDE.md`** — module description (≈ 85–86) + "How consumers use my-react-shell"
    code block (≈ 330–351): import/usage shows `usePageHeader`, no `<ShellPageHeader>`.
12. **`.claude/skills/my-react-shell/SKILL.md`** — import table + breadcrumb-behavior
    gotchas updated to the new API.
13. **`strategy.md`** — new decision entry recording the three foundation divergences.
14. **`README.md`** — light touch if it names `ShellPageHeader`.
15. `concept.md` — verify the app-shell blurb still reads correctly (likely no change).

### Phase 3 — evaluering (manual rewrite to new best practice)
16. **Layout shells** (`ProjectShell`, `TenantShell`, `SetupShell`, `SetupTemplatesShell`):
    drop the bare `<ShellPageHeader/>` mounts (band auto-shows from the `useDynamicPages`
    crumbs); keep the `useDynamicPages` registrations; **strip the band-ownership /
    "mount only one" / "last-writer-wins" comment blocks** (now false).
17. **Views with actions** (~14: ProjectsView, TenantsPage, MembersView, NotificationsView,
    PartyDetailView, PointerAuthoringView, PartiesView, ProjectMembersView, CriteriaView,
    TemplatesPage, KgvView, MultiVendorDetail, EvalHelpButton, …): `<ShellPageHeader
    actions={x}/>` → `usePageHeader({ actions: x })`; trim the stable-thunk/last-writer
    comments to what's still true. (Call-site action composition — e.g. EvalHelpButton
    merging help into the leaf's array — is preserved; merge semantics are out of scope.)
18. **`AuditLogPage`** bare header → removed (band auto-shows).
19. **`CriteriaLevel`** `useDynamicPages` recursion — unchanged.
20. **`hideCrumb` adoption** — apply to evaluering's real access-gated ancestor case
    (e.g. the tenant/customer crumb when a user can reach a project but not the bare
    tenant page). **Confirm the exact case with the user during impl** rather than
    inventing a gate.
21. **Tests** (10 `*.test.tsx`) — update renders/assertions that mount `<ShellPageHeader>`
    or assert via it to the hook.
22. **`evaluering/docs/guides/app-shell-structure.md`** — rewrite to the new pattern;
    strip the last-writer-wins / chrome-vs-header / "mount one band per subtree" howtos.
    Audit evaluering task docs/skill for stale page-header guidance and fix.

### Phase 4 — demos
23. **`my-react-shell-demo`** — remove the 12 bare `<ShellPageHeader/>` (band
    auto-shows); keep the `useDynamicPages` cities. **Add a real showcase** of
    `usePageHeader({ actions, search, tabs })` (the current demo never exercised them)
    and a **`hideCrumb`** example on the nested route (an access-style hidden level).
    Update explanatory prose (NestedLevel JSDoc, page comments) + shell-config / icon
    maps if a new showcase section is added.
24. **`my-react-shell-theme-demo`** — 2 `<ShellPageHeader title={pageTitle}/>` →
    `usePageHeader({ title: pageTitle })`.

### Phase 5 — verify & commit
25. `pnpm typecheck` / `build:lib` in the shell; typecheck + tests in evaluering; both
    demos typecheck and run on the link loop.
26. **Verify in-browser (user-owned dev server):** demo nested route shows breadcrumbs
    with no mounted header; a demo page's `usePageHeader` actions render and update live;
    `hideCrumb` omits the chosen level while keeping descendants navigable; evaluering
    setup-leaf actions render over the auto band (the original regression case) and the
    breadcrumb is correct.
27. Commit per-repo (every repo edited this session). No push without instruction.

## Design points decided (flag at sign-off to change)
- **Band-show rule:** chain has crumbs **OR** page chrome exists **OR** mobile menu
  button needed; else no band (preserves `/` behavior, drops ghost mounts).
- **`usePageHeader` keeps thunks** (`title: () => t(…)`, `actions: [() => <Btn/>]`) —
  consistent with `PageEntry.label` and the rest of the config; not plain values.
- **`hideCrumb`** = display-omit only, reactive, leaf never hidden; consumer owns the
  predicate.
- **Determinism = render-order descendant-wins**; dev warning dropped.

## Out of scope
- **Merge semantics** for page chrome (a layout's actions auto-merging with a leaf's).
  Composition stays at the call site (the leaf assembles its own `actions`). Revisit
  only if a real need appears.
- Any change to `useDynamicPages`, `findActiveChain`, the search slot, document-title
  modes, breadcrumb overflow/collapse, or theme/other modules.
- A compat shim for `<ShellPageHeader>` (explicitly declined — clean break).
