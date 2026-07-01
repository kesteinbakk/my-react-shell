import type { ButtonHTMLAttributes } from 'react';
import type { ActionButtonLayout, ActionButtonSize, ActionButtonTone } from './ActionButton';
export interface CopyButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'value' | 'onCopy'> {
    /** The text written to the clipboard on click. **Required** — no default. */
    value: string;
    /** Visible label (idle state). Optional — absent → icon only. Pass a translated string. */
    label?: string;
    /**
     * Visible label shown briefly after a successful copy — replaces `label`. Optional; absent →
     * the visible label is unchanged and the confirmation is the green check (and ✅ in emoji mode)
     * alone. Pass a translated string.
     */
    copiedLabel?: string;
    /**
     * Fired after each copy attempt resolves: `true` on success, `false` if the clipboard write
     * failed or the Clipboard API is unavailable (e.g. an insecure context). The kit can't toast —
     * surface a failure through your own i18n/toast seam here.
     */
    onCopy?: (ok: boolean) => void;
    /** How long the copied confirmation shows, in ms. Defaults to `1500`. `<= 0` keeps it until the next copy. */
    copiedDuration?: number;
    /** Render the emoji instead of the SVG (📋 idle, ✅ copied) — wire to `useIconMode().isEmoji`. */
    showEmoji?: boolean;
    /** Native tooltip shown on hover (the `title` attribute). */
    hint?: string;
    /** Idle tone. Defaults to the `copy` preset (`neutral`); the copied state is always `success`. */
    tone?: ActionButtonTone;
    /** Size — drives padding, glyph size, and label size. Defaults to `sm`. */
    size?: ActionButtonSize;
    /** `vertical` (glyph over label, default) or `inline` (glyph left of label). */
    layout?: ActionButtonLayout;
    /** Let the idle label take the tone colour. The copied label is always coloured (green). */
    coloredLabel?: boolean;
}
/**
 * A copy-to-clipboard action button, built on {@link ActionButton}. Click → writes `value`
 * to the clipboard → shows a transient green **check** (and `success` tone) confirmation,
 * then returns to the `copy` glyph.
 *
 * The label is **optional**: with none it's an icon-only button (give it an `aria-label` or
 * `hint` for a non-decorative action). It never imports the i18n or icons modules — pass
 * translated `label` / `copiedLabel` / `aria-label`, and wire `showEmoji={useIconMode().isEmoji}`
 * to follow the icons↔emojis seam.
 *
 * ```tsx
 * <CopyButton value={inviteUrl} aria-label={t('action.copyLink')} />
 * <CopyButton value={apiKey} label={t('action.copy')} copiedLabel={t('action.copied')} />
 * <CopyButton value={code} label={t('action.copy')} onCopy={(ok) => { if (!ok) toast.error(t('copy.failed')) }} />
 * ```
 */
export declare const CopyButton: import("react").ForwardRefExoticComponent<CopyButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
