# Module-authoring contract

How to add a new drop-in module to my-react-shell. A module is one optional,
self-contained capability an app imports à la carte — theme, providers, the auth
seam, i18n. This guide is the authority for the shape every new module upholds:
where it lives, how it stays self-contained, the two flavors it can take, and the
checklist to land it. The single API reference (`docs/specifications/api-reference.md`)
is the authority for each module's exact exports; the per-module guides
(`docs/guides/<module>.md`) carry the *why* + deeper contract where one exists.

## The module pattern

Every module satisfies three rules:

- **Independently importable.** A module is reachable either from the package
  **barrel** (`import { ThemeProvider } from 'my-react-shell'`) or from a sub-path
  (`my-react-shell/providers`, `my-react-shell/auth/convex`, `my-react-shell/i18n`).
  The barrel is the **Convex-free theme core** — `theme` is the only module exported
  there. Everything else lives at a sub-path.
- **Self-contained.** A module never hard-depends on another module's **runtime**.
  `theme` works without `i18n`; `auth` without `theme`. `AppProviders` *composes*
  modules for convenience, but each stands alone. The only thing a module may share
  with another is a small **pure type** (see The shared `core`).
- **Contract + default + bring-your-own.** Where an app must supply something, the
  module exports a TypeScript **contract** and — where sensible — a shipped default,
  with optional or heavy peers behind a sub-path.

## The two flavors

A module is one of two shapes. Pick the one that matches whether the app must supply
anything.

- **Batteries-included drop-in.** Import the provider and use it; no app input
  required. `theme` (import `ThemeProvider`, done) and the Convex client provider in
  `providers` are this flavor.
- **Seam + default + bring-your-own.** The module exports a TS **contract** the app
  fills, a shipped default, and a BYO path. `auth` is the template:
  `src/auth/seam.ts` exports the `AuthProvider` contract (a `ComponentType`, erased
  at runtime), `src/auth/convex-auth.tsx` ships the Convex Auth default behind the
  `my-react-shell/auth/convex` sub-path, and a consumer needing Better Auth / SSO /
  MFA implements the seam itself and passes it to `<AppProviders authProvider={…}>`.
  `i18n` follows the same shape: pass `messages` for the default, or
  `<I18nProvider resolve={…}>` / satisfy the exported contract to bring your own.

When a module needs app input, model it on the auth seam: a small exported type, a
default implementation, and a documented BYO path.

## The shared `core`

Small pure types shared **across** modules live in an internal `src/core/`.

**`src/core/` is currently empty by design.** No type is shared across modules yet,
so the folder holds nothing. A type is promoted into `core` **only when a second
module genuinely needs it** — the rule-of-two, applied to types. Do not create
placeholder types or a `core` barrel in anticipation; a type stays local to its own
module until a real second consumer appears. This is a standing decision: `core` is
populated on demand, never pre-seeded.

Until then, a type that only one module uses stays in that module (as the
`AuthProvider` seam lives in `src/auth/seam.ts`, re-exported from
`my-react-shell/providers` for the consumer that composes it).

## Optional and heavy peers behind sub-paths

Anything that pulls an **optional or heavy** dependency lives behind a sub-path, so
the main barrel stays dependency-light. Precedents:

- `convex` → the Convex client providers at `my-react-shell/providers`.
- `@convex-dev/auth` (and `@auth/core`) → the Convex Auth default at
  `my-react-shell/auth/convex`.

A theme-only consumer importing the barrel installs none of these. To declare a peer
optional, add it to **`peerDependencies`** and mark it optional in
**`peerDependenciesMeta`**, then add it as a **`devDependency`** so the dev-harness
and the library build (`tsc -p tsconfig.lib.json`) compile:

```jsonc
'peerDependencies': {
  'your-optional-dep': '^1.0.0'
},
'peerDependenciesMeta': {
  'your-optional-dep': { 'optional': true }
},
'devDependencies': {
  'your-optional-dep': '1.0.0'
}
```

## Checklist to add a module

1. **Create `src/<module>/`.** Mirror the existing modules' shape: a `Provider.tsx`,
   a `context.ts`, a `hook.ts`, and an `index.ts` that is the sub-path **barrel**
   (the file the `exports` entry points at). Keep names module-specific —
   `I18nProvider.tsx` / `i18nContext.ts` / `useTranslation.ts` / `index.ts` for i18n,
   `ThemeProvider.tsx` / `themeContext.ts` / `useTheme.ts` for theme.
2. **Add the `exports` sub-path** in `package.json` pointing at the compiled output:

   ```jsonc
   './<module>': {
     'types': './dist/<module>/index.d.ts',
     'import': './dist/<module>/index.js'
   }
   ```

   Theme is the exception — it is the barrel (`exports['.']`), not a sub-path.
3. **Confirm `tsconfig.lib.json` includes it.** It already includes all of `src/`
   (`'include': ['src']`) and excludes only the dev-harness, so a new `src/<module>/`
   is emitted to `dist/` with no config change.
4. **Declare any optional peer** as above (`peerDependencies` +
   `peerDependenciesMeta` optional + a `devDependency`). A zero-dependency module
   (like i18n) needs no peer change.
5. **Document it in the API reference** (`docs/specifications/api-reference.md`) — a
   section with every export, signatures, and minimal usage. This is **mandatory** and
   kept in lockstep with the code; mirror the change into the `my-react-shell` skill's
   bundled `api-reference.md` so consumer agents get it. **Ship a
   `docs/guides/<module>.md` too** only when there's a *why* / contract / bring-your-own
   story beyond the reference (as `auth`, `i18n`, `theme`, `app-shell` have); skip it
   when a guide would only restate the reference (as `components` does).
6. **Contribute it back (rule of two).** A capability becomes a module when a second
   app needs it. Once landed, every app picks it up on the next version bump.

## Porting from the SolidJS foundation

Many modules here are React re-implementations of the SolidJS `foundation`
(`~/Developer/zingularis/foundation/src/`). A port carries the **whole feature
set** — every behavior, affordance, edge case, ARIA wiring, and sizing contract the
foundation version has. Only the **implementation idiom** changes (SolidJS → React,
inline Tailwind → `mrs-`-prefixed CSS). Dropping a feature because it "looked
optional" is a silent reduction that reads as finished but isn't; if something
genuinely shouldn't carry over, that is a choice → **stop and ask**, then record the
omission. This is the canonical rule in the project `CLAUDE.md` → *Porting from the
SolidJS foundation* — read it before porting.

## The optional `~/config` IoC convention

A consumer **may** centralize its own configuration — constants, active language,
shell config, storage keys — under a `~/config` folder and pass those values into the
modules' providers (inversion of control: the app owns the config, the modules
receive it). my-react-shell does **not** require this. It is a consumer-side
convenience for keeping config in one place, **not a contract** any module depends on
or checks for. A module always takes its config through its provider's props
(`messages`, `authProvider`, the theme palette), never by reaching for a `~/config`
file.
