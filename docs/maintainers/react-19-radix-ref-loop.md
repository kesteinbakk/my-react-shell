# Recurring Issue: Maximum Update Depth Exceeded (React 19 + Radix UI)

## The Symptom

Consumers (or internal components) occasionally hit an infinite render loop, crashing the application with:
```text
Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```
The stack trace typically points to `setRef`, `composeRefs`, or `dispatchSetState` inside a Radix UI primitive (often near a `<button>` or a `Slot` / `asChild` usage).

## The Root Cause

This is a **known structural conflict** between **React 19** and **Radix UI's `composeRefs` utility**. 

### The React 19 Change
React 19 changed how callback `ref`s behave: they now support returning a **cleanup function**. When a component unmounts or the ref updates, React 19 calls the cleanup function returned by the previous ref execution (if any) before calling the new ref.

### The Radix UI Conflict
When you use the `asChild` pattern, Radix's `Slot` component merges its own internal ref with the child's ref using a utility called `composeRefs`. 

`composeRefs` works by returning a **new inline callback function** on every render. Because the function is new every render, React 19 sees a "new" ref. It attempts to run the cleanup for the old ref and then runs the new one. 

If the child component's ref (or any composed ref) happens to trigger a state update (`setState` or `useState` setter), that state update triggers a re-render. The re-render causes `composeRefs` to generate *another* new inline function, causing React 19 to re-evaluate the ref, triggering another state update. This results in an **infinite loop**.

## How to Avoid It (For Consumers)

You do **not** need to stop using Radix UI or `asChild`, but you must follow these rules when using `my-react-shell` components that support `asChild` (e.g., `Tooltip.Trigger`, `DropdownMenu.Trigger`, `Popover.Trigger`):

1. **Never pass inline callback refs to `asChild` components:**
   ```tsx
   // ❌ BAD: Inline callback ref triggers a state update, causing an infinite loop.
   <Tooltip.Trigger asChild>
     <Button ref={(el) => setAnchorEl(el)}>Hover me</Button>
   </Tooltip.Trigger>
   ```

2. **Memoize callback refs:**
   If you absolutely must use a callback ref that updates state, wrap it in `useCallback` so its identity is stable across renders:
   ```tsx
   // ✅ GOOD: Stable ref identity prevents the React 19 loop.
   const handleRef = useCallback((el) => {
     setAnchorEl(el);
   }, []);

   <Tooltip.Trigger asChild>
     <Button ref={handleRef}>Hover me</Button>
   </Tooltip.Trigger>
   ```

3. **Use `useRef` where possible:**
   A standard `useRef` object is completely safe because its identity is stable:
   ```tsx
   // ✅ GOOD: useRef is stable.
   const anchorRef = useRef<HTMLButtonElement>(null);

   <Tooltip.Trigger asChild>
     <Button ref={anchorRef}>Hover me</Button>
   </Tooltip.Trigger>
   ```

## Do We Need to Rewrite Core `my-react-shell`?

**No, a full rewrite to remove Radix UI is not necessary.** 

The `asChild` pattern is highly valuable for composition. However, to permanently solve this for our consumers, we can adopt one of these library-level mitigations in the future:

1. **Wait for / Bump Upstream Radix Fixes:** 
   The Radix UI team is actively patching this across their primitives. As they release React 19-compatible `composeRefs` implementations, we should aggressively bump our `@radix-ui/*` dependencies.
2. **Provide a `useSafeRef` Hook:** 
   We can export a custom hook in `my-react-shell` that consumers can use to safely wrap their state-updating refs.
3. **Patch `Slot` Internally:** 
   If the upstream fixes are too slow, we could theoretically provide our own patched `Slot` implementation that memoizes the `composeRefs` output and use that within our wrappers, though this is high-effort.

**For now**, the best approach is to strictly enforce (via PR reviews or a custom ESLint rule) that consumers of `my-react-shell` never use inline callback refs on elements that may be cloned by `asChild`.
