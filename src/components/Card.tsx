import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode
}
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode
}
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
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
export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div className={cn('mrs-card', className)} {...rest}>
      {children}
    </div>
  )
}

/** Header region — group `CardTitle` + `CardDescription` here. */
export function CardHeader({ className, children, ...rest }: CardHeaderProps) {
  return (
    <div className={cn('mrs-card__header', className)} {...rest}>
      {children}
    </div>
  )
}

/** The card heading, rendered as an `<h3>`. */
export function CardTitle({ className, children, ...rest }: CardTitleProps) {
  return (
    <h3 className={cn('mrs-card__title', className)} {...rest}>
      {children}
    </h3>
  )
}

/** Supporting line under the title, rendered as a `<p>`. */
export function CardDescription({ className, children, ...rest }: CardDescriptionProps) {
  return (
    <p className={cn('mrs-card__desc', className)} {...rest}>
      {children}
    </p>
  )
}

/** The card body. */
export function CardContent({ className, children, ...rest }: CardContentProps) {
  return (
    <div className={cn('mrs-card__content', className)} {...rest}>
      {children}
    </div>
  )
}

/** Footer / actions row, separated from the body by a top border. */
export function CardFooter({ className, children, ...rest }: CardFooterProps) {
  return (
    <div className={cn('mrs-card__footer', className)} {...rest}>
      {children}
    </div>
  )
}
