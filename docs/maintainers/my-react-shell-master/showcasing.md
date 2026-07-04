# Demos & visual showcasing

**Maintainer guide — not shipped to consumers.** The demo pair and the pre-approved
cross-edit carve-out are described in [docs/concept.md](../../concept.md) → *The demo
pair*. This guide is the lockstep mechanics.

**This repo contains no showcase or demo files** — only the library modules and a
dev-only harness. Any file whose purpose is to *show off* a feature (a gallery, showcase
page, marketing landing) belongs in **`my-react-shell-demo`**, not here. Any showcase
material that lands here is to be **moved** to the demo.

**Never pimp a demo.** Everything a demo renders (`my-react-shell-demo` and
`my-react-shell-theme-demo`) must be **exactly what the library exports out of the box**,
with its real, shipped appearance. Never add demo-local CSS, style overrides, bespoke
components, or hand-tuned values that make a module *look* better than it ships — a
flattered demo misrepresents the library. If something looks wrong in a demo, the fix
belongs in the **shell** (or a task against it), never papered over in the demo.
Demo-only scaffolding — page layout, nav, explanatory copy, how examples are arranged and
labelled — is fine; faking the *product* (exported components, tokens, defaults) is not.

`my-react-shell-demo` mirrors the foundation showcase: a **landing page of cards** each
pointing to an area, behind a **full router with navigation** — one route per area,
reachable from the cards and the nav. It is also the **agent test / bug-reproduction
surface**: because it consumes the published modules over the real `link:` loop, it is
where you confirm a consumer-visible change in-browser and reproduce a reported bug. The
route map, demo-vs-harness split, and "never start the dev server" rules are in
[docs/demo.md](../../demo.md). The in-repo dev-harness exists only for development and
behavior verification (test routes that catch what typecheck can't); it is not where
features are shown to the user.

## Lockstep duties

**Theme edits must reach the demo's color-palette page.**
`my-react-shell-demo/src/sections/PaletteReference.tsx` shows every `--color-*` token,
per palette, in light + dark. Token *values* reflect automatically (the page reads the
live computed color from each `.theme-<name>-<mode>` class — eyeball to confirm), **but
adding, removing, or renaming a `--color-*` token requires updating that page's
`PALETTE_GROUPS` list**, or the token won't appear (or renders as a stray "unset" hatch).

**New and changed components must reach the demo's kit pages.** The opinionated kit
(`my-react-shell/components`) is showcased section-by-section across the demo's kit pages
(`my-react-shell-demo/src/pages/` — `ButtonsTogglesPage`, `InputsSelectsPage`,
`SpecializedPickersPage`, `TablesDataPage`, `ContainersLayoutPage`, `SurfacesPage`,
`CardsGridPage`, `CardGridsPage`, `CardsOldPage`, `TagsAvatarsPage`, `FeedbackStatusPage`,
`OverlaysDialogsPage`, `DisclosurePage`). A component change that never reaches the demo
is unfinished. Keep the two in lockstep:

- **A new component won't appear until you add its `PageSection`** to the relevant kit
  page's `sections` array — import it, render a live example, mirroring existing entries
  (an `id`, `label`, `icon` key, short `Lead` blurb). Route-to-page-file map:
  [docs/demo.md](../../demo.md). The section's scroll-spy tab also needs that same `icon`
  key registered in **both** the `ICONS` (lucide) and `EMOJIS` maps in
  `my-react-shell-demo/src/shell-config.tsx`, or the tab falls back to a generic glyph.
- **A changed component** — new prop/variant/behavior worth seeing — updates its existing
  section so the demo renders the new surface.

(The un-opinionated primitives are kit components too — they belong on the kit pages like
every other component, rendered from `my-react-shell/components`.)
