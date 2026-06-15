---
name: error-handling
description: "Error handling patterns and display mechanisms.\nTRIGGER when: writing try/catch, showing toast notifications, handling error states, using ErrorBoundary, or adding error UI.\nDO NOT TRIGGER when: only throwing errors in utility functions without UI concerns."
---

# Error Handling

## Core Rules

1. **Never hardcode error messages** - Use translations
2. **Never swallow errors silently** - Log or display them
3. **Choose the right display mechanism**

---

## Display Decision

| Situation | Use |
|-----------|-----|
| Operation failed (save, delete) | `toast.error()` |
| Operation success | `toast.success()` |
| User blocked until resolved | Modal |
| Component crash | ErrorBoundary |
| Form validation | Field `error` prop |
| Non-critical failure | console.error only |

---

## Toast Pattern

`toast` and `ErrorBoundary` come from your project's UI kit — in the Zingularis
ecosystem that's `~/foundation/kit`; in another stack it's your equivalent (React:
a toast library + an error-boundary component / `react-error-boundary`). The
decision rules in this skill are framework-independent; only the imports and the
boundary API differ.

```tsx
import { toast } from '~/foundation/kit';

const handleSave = async () => {
  try {
    await saveMutation.mutate(data);
    toast.success(t('changes.saved'));
  } catch (error) {
    console.error('[handleSave] Failed:', error);
    toast.error(t('errors.saveFailed'));
  }
};
```

### Toast Behavior

| Type | Auto-dismiss |
|------|-------------|
| `error` | Never (user dismisses) |
| `warning` | 6 seconds |
| `success` | 3 seconds |
| `info` | 4 seconds |

---

## ErrorBoundary

Wrap major sections for unhandled crashes. `reset` re-mounts the subtree, so the retry button is justified only when the crash could be transient (a render that hit a momentarily-undefined value, a one-off fetch failure). If the boundary wraps something that crashed deterministically (bad props, unsupported state), a reset re-runs the identical render and crashes again — drop the button and show only the message + a next step. See "Retry actions" below.

```tsx
import { ErrorBoundary } from '~/foundation/kit';

<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>{t('errors.componentCrashed')}</p>
      {/* retry only because a component re-mount can clear a transient render error */}
      <Button onClick={reset}>{t('common.retry')}</Button>
    </div>
  )}
>
  <MyComponent />
</ErrorBoundary>
```

---

## REST API Errors

NEVER: Return human-readable error strings
ALWAYS: Return error codes, translate on client

```typescript
// FORBIDDEN
return json({ success: false, error: "User not found" });

// REQUIRED
return json({ success: false, error: "USER_NOT_FOUND" }, { status: 404 });
```

### Response Structure

```typescript
interface ApiResponse<T> {
  success: boolean;     // REQUIRED
  data?: T;             // Success only
  error?: string;       // Error CODE on failure
  details?: Record<string, unknown>;  // Optional context
}
```

NEVER: Both `error` AND `code` fields
NEVER: `error` with human message

### Error Translation

```typescript
// src/lib/errors.ts
export function translateError(code: string | undefined): string {
  const { t } = useTranslation("errors");
  if (!code) return t("REQUEST_FAILED");

  const translated = t(code);
  if (translated === code) {
    console.warn(`[translateError] Missing translation for: ${code}`);
    return t("REQUEST_FAILED");
  }
  return translated;
}
```

### Client Handling

```tsx
const result = await api.post<User>('/api/users', data);

if (!result.success) {
  toast.error(translateError(result.error));
  return;
}

toast.success(t('user.created'));
```

---

## Convex Error Handling

Server: Throw exceptions. Client: Wrapper hooks show toasts automatically — no try/catch needed.

Full Convex error patterns → `convex-zing-conventions` skill (Zingularis only).

---

## Action preflight — guard up front, don't let backend gates be the user's first signal

Backend `apiError` / `ConvexError` throws are enforcement-of-last-resort: adversarial requests, race conditions, server-as-source-of-truth. They are NOT the user's first feedback channel.

When a flow can fail because of trust score, role, plan tier, quota, existing state, or feature flag — AND the frontend has the gating inputs in scope (role/permission state, existing-list queries, capability flags) — disable / hide / explain inline before submit. Submit-and-throw is reserved for: gating data genuinely unreachable from the client, by-design race resolution, or defense against tampered requests.

Toast on error is a backstop, not the UX. Letting a TP=52 user fill in a form and click Create only to learn the operation was a non-starter is the recurring failure mode.

---

## Retry actions — only when retrying can change the outcome

A "Try Again" / retry control is a promise that re-running will help. Show it **only** for transient failures (network drop, timeout, server 5xx, aborted request) — where the same request can succeed next time.

Do **not** attach retry to deterministic failures: validation, permission / trust / quota gate, not-found, conflict, unsupported input, missing translation. Retrying re-runs the identical request and fails identically — the button is false hope and trains users to mash it.

Gate on the signal, not the surface: branch on the error's `retryable` (or code class), not on "this is an ErrorBoundary so it gets a reset button." A non-retryable error gets only **dismiss** + a next step (go back, fix the input, contact support) — never a retry.

---

## Forbidden Patterns

```tsx
// Hardcoded message
toast.error('Something went wrong');

// Empty catch (swallows error)
try { await doSomething(); } catch (e) {}

// Native dialogs
alert('Error!');

// Raw server-error string in JSX — leaks tracebacks, request IDs, internal paths
<Alert variant="danger">{error()?.message}</Alert>
<InfoBox variant="danger">{queryHook.error()}</InfoBox>
```

User-facing copy comes from translated error keys (Zingularis: `errorCode.<CODE>`), toast or hand-crafted. Raw `Error.message` goes to `console.error` (and your project's error log), never the UI.

When migrating an inline error renderer to toast: grep the same component for `error()?.message`, `error.message`, and `<*Alert variant="danger">` — drop the inline renderer in the same change. A toast added on top of a still-rendering raw banner is the recurring failure mode.

Hooks must not return `Error.message`. Return a structured shape (`{ code }`, `{ retryable }`) or a boolean — the caller translates by code. A hook that leaks `.message` propagates the anti-pattern to every consumer.
