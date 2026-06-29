# New Projects Setup Guide

When creating a new consumer application (or test harness) that consumes `my-react-shell`, follow these essential setup steps to ensure everything functions properly, especially on the local `link:` dev-loop.

## Dependency Management
- **Package Manager**: Use `pnpm`. Make sure your new project runs on pnpm to stay consistent with the ecosystem.
- **Git Dependency**: The shell is installed as a git dependency pointing to the pinned release tag. For local development, this is often redirected via `pnpm link --dir ../my-react-shell` (or `"my-react-shell": "link:../my-react-shell"` in `package.json`).
- **`tw-animate-css`**: Must be installed as a direct dependency. `my-react-shell/styles.css` is raw Tailwind v4 source that `@import`s `tw-animate-css`; without it the consumer's Tailwind pipeline fails at build time.

## CSS Setup

Import the shell stylesheets in a single CSS entry file (e.g. `src/index.css`) that your Tailwind pipeline processes, rather than spreading them across JS files:

```css
@import 'my-react-shell/styles.css';           /* Tailwind v4 source — token contract + palettes + tw-animate-css */
@import 'my-react-shell/app-shell/styles.css'; /* Prebuilt — app-shell chrome */
```

Then in your app entry (e.g. `src/main.tsx`) import the prebuilt component stylesheet separately, since it is plain CSS and does not go through Tailwind:

```ts
import 'my-react-shell/components/styles.css'
```

`my-react-shell/styles.css` is the only file that requires Tailwind v4 and `tw-animate-css` — the `components/styles.css` and `app-shell/styles.css` files are already compiled and have no build-time dependencies.

## Vite Configuration (`vite.config.ts`)

When developing against the local `link:` loop, two specific Vite configurations are required:

### 1. Fonts failing to load with `403 (Forbidden)`
When running locally with the `link:` loop, you might see errors like this in the console or network tab:
`GET http://localhost:2000/@fs/.../my-react-shell/node_modules/.../geist-latin-wght-normal.woff2 net::ERR_ABORTED 403 (Forbidden)`

**Why this happens:** The consumer app uses the font CSS exported from `my-react-shell`, which references font files in the shell's `node_modules` (e.g. `@fontsource-variable/geist`). Vite's default security policy restricts serving files outside the consumer's workspace root, causing the 403 error.

**The Fix:** You must explicitly allow Vite to serve files from the shell's directory by updating the consumer's `vite.config.ts`:
```ts
server: {
  fs: {
    // Both '.' and the relative path to my-react-shell are required
    allow: ['.', '../my-react-shell'],
  },
},
```

### 2. React Deduplication (`Invalid hook call`)
Because the linked checkout carries its own `node_modules/react`, Vite's dev pre-bundler will resolve two distinct React copies, causing an `Invalid hook call` crash at first paint.

**The Fix:** Collapse them to a single copy via Vite's `resolve.dedupe`:
```ts
resolve: {
  dedupe: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    // Include `@tanstack/react-router` and Radix primitives if using the app-shell module
  ],
},
```
*(For a full list of modules that need deduping depending on what you import, see the `Local dev-loop` section in `distribution-model.md`.)*

### 3. `beforeunload` dialog on every HMR reload

When using `@convex-dev/auth`, you will see a "Vil du laste inn nettstedet på nytt?" (or equivalent) Chrome dialog on every Vite HMR full-page reload during development.

**Why this happens:** `@convex-dev/auth` registers a `window` `beforeunload` listener while `isRefreshingToken` is `true`. Convex server restarts (e.g. from schema pushes) retrigger token refreshes, and Vite HMR fires during that window — so the dialog appears constantly.

**The fix:** Override `window.addEventListener` in dev to swallow `beforeunload` registrations. Add this to your app entry file (`src/main.tsx`) **before** `createRoot().render()`:

```ts
// Dev: suppress @convex-dev/auth's beforeunload listener (fires on every HMR
// reload during a Convex server restart / token refresh window).
if (import.meta.env.DEV) {
  const _add = window.addEventListener.bind(window)
  ;(window as unknown as Record<string, unknown>).addEventListener = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    if (type === 'beforeunload') return
    return _add(type, listener, options as AddEventListenerOptions)
  }
}
```

This is safe: the app uses debounced autosave, so no real unsaved-change scenario relies on the dialog.

## Pre-commit Hooks
- **Commit Guard**: Ensure you install the pre-commit hook that blocks committing the dev-loop `link:`/`file:` dependency. This prevents breaking CI or other developers' clones.

## Page Width & Container Constraints
**CRITICAL**: Do NOT wrap your main content pages in hardcoded Tailwind max-width classes (like `max-w-6xl` or `container`). 
`AppShell` automatically wraps your page content in `.mrs-shell__container`, which provides centralized max-width, centering, and responsive padding.

If you add your own max-width wrapper inside your pages, it will conflict with the shell and prevent elements (like card grids) from correctly expanding on large monitors.
To configure the page width for your entire application, pass `pageContainer.defaultMaxWidth` to `defineShellConfig`:
```ts
export const shellConfig = defineShellConfig({
  // ...
  pageContainer: {
    defaultMaxWidth: 'x-wide', // Options: 'narrow' (1024px) | 'medium' (1280px) | 'wide' (1440px - exactly fits four 312px cards) | 'x-wide' (1600px) | 'full'
  }
})
```

---
*For a deeper dive into the architectural reasoning behind these requirements, refer to the [Distribution Model](distribution-model.md) guide.*
