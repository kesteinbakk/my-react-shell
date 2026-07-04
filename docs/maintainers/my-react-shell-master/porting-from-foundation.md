# Porting from the SolidJS foundation

**Maintainer guide — not shipped to consumers.**

Much of my-react-shell is a **React re-implementation of the SolidJS `foundation`**
(`~/Developer/zingularis/foundation/src/`) — its app-shell, tab/scroll primitives, kit
composites, and more. **When you port anything from foundation, port it faithfully:**
every feature, behavior, and affordance the foundation version has — unless the user
explicitly approves dropping or changing something. Open the foundation source and match
it; don't reconstruct from memory or the happy path.

- **What legitimately changes is the implementation idiom only:** SolidJS → React
  (signals → hooks, `For`/`Show` → `.map`/conditionals) and foundation's inline Tailwind
  utilities → my-react-shell's `mrs-`-prefixed plain CSS.
- **What must NOT change is the feature set:** scroll affordances, keyboard behavior,
  ARIA wiring, sizing contracts (`min-width: 0`, `shrink-0`, …), edge / empty / overflow
  states, every visible and interactive detail. A silently reduced port reads as finished
  but isn't — the exact failure this rule prevents.
- **A feature that genuinely shouldn't carry over is a choice → STOP and ask**, then
  record the omission. Never drop it silently.

> Example: foundation's scrollable tab strip (`kit/layout/ScrollableTabRow.tsx` —
> `overflow-x` + hidden scrollbar **plus** edge fades, arrow buttons, and overflow
> detection, on a `min-width: 0` sizing contract) is ported here as
> `src/app-shell/ScrollableTabRow.tsx`, with all of those features intact — not the bare
> `overflow-x: auto` an earlier port reduced it to.
