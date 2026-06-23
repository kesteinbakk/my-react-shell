import type { HTMLAttributes, ReactNode } from 'react';
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
}
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
}
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children?: ReactNode;
}
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
    children?: ReactNode;
}
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
}
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
}
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
export declare function Card({ className, children, ...rest }: CardProps): import("react").JSX.Element;
/** Header region — group `CardTitle` + `CardDescription` here. */
export declare function CardHeader({ className, children, ...rest }: CardHeaderProps): import("react").JSX.Element;
/** The card heading, rendered as an `<h3>`. */
export declare function CardTitle({ className, children, ...rest }: CardTitleProps): import("react").JSX.Element;
/** Supporting line under the title, rendered as a `<p>`. */
export declare function CardDescription({ className, children, ...rest }: CardDescriptionProps): import("react").JSX.Element;
/** The card body. */
export declare function CardContent({ className, children, ...rest }: CardContentProps): import("react").JSX.Element;
/** Footer / actions row, separated from the body by a top border. */
export declare function CardFooter({ className, children, ...rest }: CardFooterProps): import("react").JSX.Element;
