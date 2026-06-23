import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from './cn';
/**
 * Un-opinionated surface container: a `--color-surface-primary` panel with a border,
 * rounded corners and the kit's card elevation. Compose with the subcomponents —
 * `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardFooter` — or
 * drop any of them and lay out the body yourself. Every part spreads native `<div>`
 * props (`CardTitle` → `<h3>`, `CardDescription` → `<p>`).
 *
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Plan</CardTitle>
 *     <CardDescription>Your current subscription.</CardDescription>
 *   </CardHeader>
 *   <CardContent>…</CardContent>
 *   <CardFooter><Button>Upgrade</Button></CardFooter>
 * </Card>
 * ```
 */
export function Card({ className, children, ...rest }) {
    return (_jsx("div", { className: cn('mrs-card', className), ...rest, children: children }));
}
/** Header region — group `CardTitle` + `CardDescription` here. */
export function CardHeader({ className, children, ...rest }) {
    return (_jsx("div", { className: cn('mrs-card__header', className), ...rest, children: children }));
}
/** The card heading, rendered as an `<h3>`. */
export function CardTitle({ className, children, ...rest }) {
    return (_jsx("h3", { className: cn('mrs-card__title', className), ...rest, children: children }));
}
/** Supporting line under the title, rendered as a `<p>`. */
export function CardDescription({ className, children, ...rest }) {
    return (_jsx("p", { className: cn('mrs-card__desc', className), ...rest, children: children }));
}
/** The card body. */
export function CardContent({ className, children, ...rest }) {
    return (_jsx("div", { className: cn('mrs-card__content', className), ...rest, children: children }));
}
/** Footer / actions row, separated from the body by a top border. */
export function CardFooter({ className, children, ...rest }) {
    return (_jsx("div", { className: cn('mrs-card__footer', className), ...rest, children: children }));
}
