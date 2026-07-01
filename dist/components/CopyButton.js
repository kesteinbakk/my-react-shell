import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, useEffect, useState } from 'react';
import { ActionButton } from './ActionButton';
/* ── Copied-state check glyph ──────────────────────────────────────────────── */
/** Glyph px per size — mirrors `ActionButton`'s internal `ICON_PX` so the copied
 *  check matches the idle `copy` glyph exactly. Keep the two in sync. */
const CHECK_PX = { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 };
/** A check-mark in the same hand-rolled, lucide-shaped idiom as `ActionButton`'s
 *  preset glyphs (viewBox 0 0 24 24, `currentColor`, stroke width 2). */
function CopyCheckGlyph({ px }) {
    return (_jsx("svg", { width: px, height: px, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polyline", { points: "20 6 9 17 4 12" }) }));
}
/* ── Component ────────────────────────────────────────────────────────────── */
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
export const CopyButton = forwardRef(function CopyButton(props, ref) {
    const { value, label, copiedLabel, onCopy, copiedDuration = 1500, showEmoji = false, hint, tone, size = 'sm', layout = 'vertical', coloredLabel = false, onClick, ...rest } = props;
    const [copied, setCopied] = useState(false);
    // Bumped on every successful copy so a re-click while still "copied" restarts the timer.
    const [copyNonce, setCopyNonce] = useState(0);
    useEffect(() => {
        if (!copied || copiedDuration <= 0)
            return;
        const timer = setTimeout(() => setCopied(false), copiedDuration);
        return () => clearTimeout(timer);
    }, [copied, copyNonce, copiedDuration]);
    const handleClick = (e) => {
        onClick?.(e);
        void (async () => {
            let ok = false;
            try {
                if (navigator.clipboard?.writeText != null) {
                    await navigator.clipboard.writeText(value);
                    ok = true;
                }
            }
            catch {
                ok = false;
            }
            onCopy?.(ok);
            if (ok) {
                setCopied(true);
                setCopyNonce((n) => n + 1);
            }
        })();
    };
    // Copied: the check glyph + ✅ + success tone (coloured label so a visible label reads green).
    // Idle: the `copy` preset (📋 + copy SVG + neutral), honouring the consumer's tone / label.
    const stateProps = copied
        ? {
            icon: _jsx(CopyCheckGlyph, { px: CHECK_PX[size] }),
            emoji: '✅',
            tone: 'success',
            coloredLabel: true,
            label: copiedLabel ?? label,
        }
        : {
            action: 'copy',
            tone,
            coloredLabel,
            label,
        };
    return (_jsx(ActionButton, { ref: ref, ...stateProps, showEmoji: showEmoji, size: size, layout: layout, hint: hint, onClick: handleClick, ...rest }));
});
