# my-react-shell — demo & verification surface

`my-react-shell` ships **no showcase** of its own: this
repo is the library plus a dev-only harness. The place to **see** the modules and to
**test** a change end-to-end is the sister project **`my-react-shell-demo`**
(`~/Developer/my-react-shell-demo`) — a real consumer app that installs this library
over the local `link:` loop and renders every shipped module through its public
import paths.

For agents working in this repo it is the **manual-verification and bug-reproduction
surface**: after a change that affects anything consumer-visible — a theme token, a
kit component, the app-shell chrome, the i18n seam, the icons swap — drive the
matching demo page to confirm it renders correctly; to reproduce a reported bug, open
the page that exercises the implicated module.

## Demo vs. the in-repo dev-harness

Two verification surfaces, two jobs:

- **In-repo dev-harness** (`src/main.tsx`, `src/routes/**`) — low-level **test routes**
  that exercise provider internals typecheck can't catch: FOUC-free theme application,
  system-follow, provider composition. Excluded from the library emit; consumers never
  receive it. Use it for provider/composition internals.
- **`my-react-shell-demo`** — the **full consumer-facing surface**. Every module is
  imported the way a real app imports it (`my-react-shell`, `/app-shell`,
  `/components`, `/icons`, `/i18n`), over the `link:` dev-loop against the committed
  `dist/`. Use it to verify what a consumer actually sees, and to reproduce bugs filed
  against a module's rendered behavior.

> A bug found while building a demo page is a real port/implementation gap, not a demo
> artifact — several app-shell breadcrumb regressions were caught exactly this way.

## What it covers

A TanStack Router app (code-based route tree, no router plugin) whose sidebar nav and
URL-derived breadcrumbs come from the **app-shell** module. The top-level routes:

| Route | Module exercised |
|-------|------------------|
| `/` | **theme** — intro + active-palette card + follow-system switch |
| `/components` | **kit** — un-opinionated primitives (`Button`, `Input`, `Checkbox`, …) |
| `/inputs-actions` | **kit** — `ActionButton`/`ActionButtonGroup`, `InputField`, `SegmentedControl`, `Select` |
| `/tables-cards` | **kit** — `Table`, `PhiCard`, `StatCard` |
| `/tags-avatars` | **kit** — `Badge`, `Chip`/`ChipGroup`, `Avatar`/`AvatarGroup` |
| `/feedback-overlays` | **kit** — `Alert`, `Spinner`/`SectionSpinner`, `InfoBox`, `EmptyState`, `ConfirmDialog`, `Toast` |
| `/palette` | **theme** — every `--color-*` token, per palette, light + dark (`PaletteReference`) |
| `/i18n` | the **i18n** `t()` seam (`I18nProvider` + `useTranslation`) |
| `/feedback` | error-handling & feedback patterns |
| `/nested/**` | **app-shell** deep breadcrumbs — `pages → subPages → subPages → useDynamicPages` (four levels) |

The **theme** module re-themes every page live from the sidebar footer (palette +
light/dark); the **icons** seam flips the whole shell between glyphs and emojis via
`UserPreferences`. The **providers** and **auth** modules are not shown — they need a
Convex backend, and the demo is deliberately no-auth / no-backend.

## How an agent uses it

- **Never start the dev server.** The user owns it (project [CLAUDE.md](../CLAUDE.md)
  → *Dev servers*); if it's down, report and stop — don't run `pnpm dev`. Its dev port
  is in the registry (`~/Developer/scripts/projects.toml`, the `port` field for
  `my-react-shell-demo`); the agent-preview port is that + 500.
- **Browser tools are user-instruction only** (root `CLAUDE.md`) — open the preview /
  screenshot only when the user asks you to look.
- **To verify a change:** navigate to the route that renders the affected module and
  confirm the new surface; for anything theme-touching, eyeball light + dark and at
  least one non-default palette.
- **To reproduce a reported bug:** open the page exercising the implicated module (the
  table above), reproduce there first, then fix in this repo and re-verify.

## Keeping the demo in lockstep

The library and its showcase ship together — a consumer-visible change that never
reaches the demo is unfinished. The operational lockstep rules live in this repo's
[CLAUDE.md](../CLAUDE.md) (*Demos & visual showcasing*); in short:

- **A new or changed kit component** → add or update its `PageSection` in the relevant
  kit page's `sections` array (`InputsActionsPage`, `TablesCardsPage`,
  `TagsAvatarsPage`, `FeedbackOverlaysPage`), and register the section's `icon` key in
  **both** the `ICONS` and `EMOJIS` maps in `my-react-shell-demo/src/shell-config.tsx`,
  or its scroll-spy tab falls back to a generic glyph.
- **A new or renamed `--color-*` token** → add it to `PALETTE_GROUPS` in
  `my-react-shell-demo/src/sections/PaletteReference.tsx`, or it won't appear on the
  palette page.
