---
name: typecheck
description: "Run TypeScript checks correctly using pnpm typecheck (not raw tsc).\nTRIGGER when: after editing .ts/.tsx files, fixing type errors, or before completing tasks.\nDO NOT TRIGGER when: no TypeScript files were modified."
---

# TypeScript Checking

## Critical Rule

**ALWAYS use `pnpm typecheck`. NEVER use raw `tsc` or `pnpm typecheck:all`.**

```bash
# ✅ CORRECT - Uses --skipLibCheck to filter dependency noise
pnpm typecheck

# ❌ WRONG - Shows 100+ false errors from node_modules
npx tsc --noEmit
tsc --noEmit
pnpm typecheck:all
```

## Why This Matters

Raw `tsc` shows errors from dependencies (third-party libraries, framework
internals, `vite`, etc.) that are NOT your fault and NOT actionable. The
`pnpm typecheck` script uses `--skipLibCheck` to filter these out.

| Command | Result |
|---------|--------|
| `pnpm typecheck` | Only YOUR errors in `src/` |
| `tsc --noEmit` | 100+ dependency errors you can't fix |

## When to Run

After creating/editing `.ts`/`.tsx` files, changing types/imports, or before reporting task complete.

## Interpreting Results

- No output after "Checking TypeScript errors..." = success
- Errors in `src/` = fix them
- Errors in `node_modules/` = wrong command, use `pnpm typecheck`

## Type Safety

NEVER: Cast to `any` without explicit user approval.
NEVER: Use `tsc --noEmit`, `npx tsc --noEmit`, or `pnpm typecheck:all`.

When casting is unavoidable: inform user why → get approval → minimize scope.
