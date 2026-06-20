import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
/**
 * Merge class names for the component kit: `clsx` resolves conditionals, and
 * `tailwind-merge` de-dupes any Tailwind utilities a consumer passes through a
 * `className` override so they win over the kit's own classes cleanly.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
