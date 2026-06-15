---
name: react-testing
description: "Test patterns for React + Vitest (Testing Library render, hook + state testing) and Convex backend tests via convex-test.\nTRIGGER when: writing *.test.ts(x) in a React project, using describe/it/expect, or running pnpm test.\nDO NOT TRIGGER when: not writing/running tests, or the project is SolidJS (use solid-testing)."
---

# Testing (React)

## When to Write Tests

**Required:**
- Auth flows (login, logout, session, permissions)
- Backend operations (Convex queries/mutations/actions, API calls)
- Security-critical logic (validation, access control, tenant isolation)
- Complex state management (multi-step flows, wizards)

**Optional:**
- Simple UI components without logic
- Refactors (only if behavior changes)

**Never:**
- Manual test routes, documentation, config changes

---

## Cover the Whole Contract, and Keep It Reachable

"We have a test" hides three gaps — all have shipped real bugs:

- **Half-covered contract.** You test the write side (the mutation that persists) but not the request side (the payload sent to an API, the options object). A bug in the untested half ships green. Test **both** sides of any request/response or options/persist pair.
- **Logic too buried to test.** A payload or descriptor built inline in a handler or component body never gets unit-tested. If a behavior isn't reachable from a test, that's the signal to **extract the pure piece into a helper** and test that — not to skip it.
- **Unit-green ≠ flow-works.** Per-layer shape tests prove each layer alone; they say nothing about whether the layers connect. Anything that passes a value from one step to the next (across requests, encode/decode hops) isn't covered until a test drives the **whole chain**. A data-flow bug passes every unit test and still breaks for the user — drive the real chain in an integration test, not more shape assertions.

For shape/contract bugs, write the test **first**, watch it go red against the unfixed code, then green — a test you've never seen fail proves nothing. Where a strict type on the object sent to an external party makes the bug class impossible, prefer that to a runtime assertion.

---

## Test File Location

ALWAYS: Place `*.test.ts(x)` next to the source file. Frontend tests under `src/**`, Convex backend tests under `convex/**` (these usually run as separate Vitest projects — jsdom vs edge-runtime).

---

## Test Structure

ALWAYS: `describe()` to group, `it()` per behavior, test **user behavior not implementation**.

```tsx
describe('Button', () => {
  it('calls onClick when clicked', () => { /* user behavior */ });
});

// FORBIDDEN — testing internal state
expect(result.current.internalFlag).toBe(true);
```

---

## React Component Test

Render with `@testing-library/react`; query the way a user perceives the UI (`getByRole`, `getByText`, `getByPlaceholderText`), not by test ids. Drive interaction with `@testing-library/user-event` (preferred — models real events) or `fireEvent`. Wrap in the providers the component needs.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('calls onClick when clicked', async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Click</Button>);
  await userEvent.click(screen.getByRole('button', { name: 'Click' }));
  expect(onClick).toHaveBeenCalled();
});
```

`vitest.setup.ts` should wire `@testing-library/jest-dom/vitest` (for `toBeInTheDocument` etc.) and call `cleanup()` in `afterEach` so renders don't leak between tests.

---

## Hooks & State

Test a hook directly with `renderHook`; trigger updates inside `act` (user-event/RTL queries already wrap in `act`). State updates after render need `rerender` or an awaited query.

```tsx
import { renderHook, act } from '@testing-library/react';

it('updates on increment', () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

---

## Async

Use `findBy*` (async query) or `waitFor` — never a bare `setTimeout`.

```tsx
expect(await screen.findByText('Data loaded')).toBeInTheDocument();
```

---

## Mocking the Convex seam

Components read data through Convex hooks (`useQuery` / `useMutation` / `useAction`) and auth through `@convex-dev/auth/react`. Mock those module seams; rewire the fns per test with `vi.hoisted` so the `vi.mock` factory can close over them.

```tsx
const mocks = vi.hoisted(() => ({ requestCode: vi.fn(), signIn: vi.fn() }));
vi.mock('convex/react', () => ({ useAction: () => mocks.requestCode }));
vi.mock('@convex-dev/auth/react', () => ({ useAuthActions: () => ({ signIn: mocks.signIn }) }));

import SignIn from './SignIn'; // import AFTER the mocks so it binds to them
beforeEach(() => { mocks.requestCode.mockReset(); mocks.signIn.mockReset(); });
```

NEVER mock implementation details — mock the external seam (the Convex client, the auth provider), not your own functions.

---

## Backend / Convex function tests (`convex-test`)

Backend tests exercise the real Convex functions in an edge-runtime isolate via `convex-test` — no DOM. This is where **access control and tenant isolation are proven**: cross-tenant denial must be an automated, release-gating test, not inspection.

```ts
import { convexTest } from 'convex-test';
import { api } from './_generated/api';
import schema from './schema';

it('denies cross-tenant reads', async () => {
  const t = convexTest(schema);
  const asOther = t.withIdentity({ subject: otherUserId });
  await expect(asOther.query(api.projects.get, { projectId })).rejects.toThrow();
});
```

`convex-test` must be inlined for Vitest (`server.deps.inline: ['convex-test']`). Test every authz outcome: granted, denied-by-role, denied-by-tenant, no-identity.

---

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm test` | Single run (the project's `vitest run`) |
| `pnpm test:watch` | Watch mode (dev) |

Run the exact scripts your project defines — don't assume `test:run` / `test:ui` exist.
