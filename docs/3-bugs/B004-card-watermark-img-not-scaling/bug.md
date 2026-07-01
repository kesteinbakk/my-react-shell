# B004 — card-watermark-img-not-scaling

**Status:** awaiting-user-confirmation | **Branch:** main
**Filed:** 2026-07-01 — reported from a production consumer: card watermarks appear as a tiny
icon in the centre of the card on Windows (PC) and Android, while the same production build
renders them correctly (a large, faint, oversized glyph) on macOS. Also renders correctly in
the dev harness on macOS. Reproduced and fixed against `my-react-shell-demo` in headless
Chromium (Blink — the same engine as the failing platforms).

## Symptom

A card (`StatCard` / `ContentCard` / `PaperCard` / `DynamicGridCard`) with a `ReactNode`
`watermark` and `autoscaleWatermark` left at its default (`true`) shows the watermark at its
intrinsic small size (~20px), centred, instead of scaling it up to the big faint watermark
size — but only on some platforms:

| Platform / browser | Result |
| --- | --- |
| macOS (Safari), dev **and** prod | correct — large faint watermark |
| Windows (Chrome/Edge), prod | broken — tiny centred icon |
| Android (Chrome), prod | broken — tiny centred icon |

Same production build across all of them, so it is a rendering difference, not a build
difference.

## Expected

`autoscaleWatermark` (default `true`) scales a small `ReactNode` glyph up to watermark scale
(oversized and faint), mirroring the string-emoji watermark — identically on every platform.

## Actual

The glyph stays at its intrinsic size on Windows/Android. On macOS it scales as expected.

## Root cause (confirmed)

The autoscale is CSS-only: an element watermark gets the `…__watermark--glyph` class, which
sets a large `font-size` on the container and then sizes the glyph child relative to it. The
rules covered only two child shapes:

```css
.mrs-<card>__watermark--glyph svg  { width: 1em; height: 1em; }
.mrs-<card>__watermark--glyph span { font-size: 1em !important; }
```

There was **no rule for `<img>`**. Two things then combine:

1. **The consumer's emoji policy is platform-conditional.** The icons module's `EmojiRenderer`
   seam (and the real consumer's `renderIcon`) draws each emoji as a **bundled `<img>` asset**
   on non-Apple platforms and falls back to the **native character** (in a `<span>`) on Apple
   platforms (Apple's native emoji are used directly). So the *same* card renders a `<span>`
   glyph on macOS (which the `span` rule scales — correct) and an `<img>` glyph on
   Windows/Android (which no rule scaled).

2. **A consumer CSS reset collapses the unscaled `<img>` to zero width.** The art-layer
   container is `position: absolute; width: auto` (shrink-to-fit) under `--glyph`. With the
   consumer's `img { max-width: 100% }` (Tailwind preflight) in play, resolving the container's
   shrink-to-fit width against the image's `max-width: 100%` collapses the image's used width to
   `0` (height still resolved). Net effect: the emoji `<img>` renders essentially invisible /
   tiny rather than at watermark scale.

Confirmed in Blink by measuring, inside the real `--glyph` container:
- native-char `<span>` → **120px** (scaled — the macOS path),
- emoji `<img>` (before fix) → **width 0px, height 120px** (`computed max-width: 100%`),
- emoji `<img>` (after adding `img { width:1em } + max-width:none`) → **120px × 120px**.

## Fix (shell-side)

All four cards' `--glyph` rules in `src/components/components.css` now size `<img>` alongside
`<svg>`, and neutralise the consumer reset:

```css
.mrs-<card>__watermark--glyph svg,
.mrs-<card>__watermark--glyph img {
  width: 1em !important;
  height: 1em !important;
  max-width: none;      /* beats a consumer `img { max-width: 100% }` reset (e.g. Tailwind preflight) */
  object-fit: contain;  /* keep a non-square asset undistorted */
}
```

`!important` on width/height (mirroring the pre-existing `span` rule) also makes the autoscale
robust to an icon kit that sizes its glyph via an **inline `style`** rather than attributes.

## Verification

- Blink measurement (above): all four cards scale an emoji `<img>` watermark to full watermark
  size; an inline-styled (`style="width:20px"`) glyph also scales.
- Visual: `my-react-shell-demo` → **Cards grid → StatCard → Watermark** now includes an
  "Emoji-image glyph" card whose bundled Noto rocket `<img>` renders as a large faint watermark
  (screenshot captured during the fix).

## Awaiting user confirmation

Behaviour-level closure requires the user to reproduce on their real **Windows/Android**
production environment and confirm the watermark now scales. An agent cannot flip this to
`resolved`.

## Prior attempts

None — first diagnosis.
