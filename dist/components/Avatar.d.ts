import { type ReactNode } from 'react';
export type AvatarSize = 'sm' | 'md' | 'lg';
export interface AvatarProps {
    /** Image URL. Falls back to `fallback` if absent or it fails to load. */
    src?: string;
    alt?: string;
    /** Initials / short text shown when there's no image. */
    fallback?: ReactNode;
    size?: AvatarSize;
    className?: string;
}
/** Avatar — image with an initials / text fallback (on image error too). */
export declare function Avatar({ src, alt, fallback, size, className }: AvatarProps): import("react").JSX.Element;
export interface AvatarGroupProps {
    children?: ReactNode;
    /** Max avatars shown before a `+N` overflow badge. */
    max?: number;
    className?: string;
}
/** Overlapping stack of avatars with an optional `+N` overflow badge. */
export declare function AvatarGroup({ children, max, className }: AvatarGroupProps): import("react").JSX.Element;
