# New Projects Setup Guide

When creating a new consumer application (or test harness) that consumes `my-react-shell`, follow these essential setup steps to ensure everything functions properly, especially on the local `link:` dev-loop.

## Dependency Management
- **Package Manager**: Use `pnpm`. Make sure your new project runs on pnpm to stay consistent with the ecosystem.
- **Git Dependency**: The shell is installed as a git dependency pointing to the pinned release tag. For local development, this is often redirected via `pnpm link --dir ../my-react-shell` (or `"my-react-shell": "link:../my-react-shell"` in `package.json`).

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
    defaultMaxWidth: '2xl', // Options: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'
  }
})
```

---
*For a deeper dive into the architectural reasoning behind these requirements, refer to the [Distribution Model](distribution-model.md) guide.*
