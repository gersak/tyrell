/**
 * Button Component Styles
 *
 * Three appearance variants × five semantic flavors × three tones (+/base/-).
 * Each variant uses ONE token system:
 *
 *   - solid    → flat per-segment tokens --ty-solid-{flavor}{,-hover,-active,
 *               -strong,-soft,-fg}. Derived in tyrell-theme.css via OKLCH on
 *               3 axes (color / hover-active / theme chroma-hue); literal in
 *               tyrell.css. The component does no color math for the fill.
 *               Depth chrome (border + drop shadow) IS computed here, from
 *               the fill, via relative color — see the button.solid rule.
 *   - outlined → --ty-color-{flavor}-{strong|base|soft} (text === border at
 *               rest); hover/active/focus always resolve to -strong,
 *               whatever the resting tone was — see outlinedFlavor().
 *   - ghost    → same as outlined, text only (no border), --ty-bg-{flavor}-soft
 *               background on hover.
 *
 * Neutral is the exception in both outlined and ghost: its `+` tone reads
 * --ty-solid-neutral-strong (the ink dial solid buttons use — the only
 * value that actually inverts light↔dark for full contrast) instead of the
 * generic --ty-color-neutral-strong text-emphasis token. Base/soft neutral
 * stay on the generic token like every other flavor.
 *
 * Per-instance overrides via host CSS variables:
 *   --ty-button-bg, --ty-button-bg-hover, --ty-button-color, --ty-button-border,
 *   --ty-solid-border-color, --ty-solid-border-width
 */

import { FLAVORS } from '../types/common.js'

/* Each generator takes an optional fallback flavor `fb`: token references
   then become var(--ty-*-f, var(--ty-*-fb)). Built-ins pass no fallback
   (their tokens always exist); buttonCustomFlavorCss() passes 'neutral' so a
   custom flavor with missing tokens degrades to neutral instead of an
   invisible button. */

const tokenRef = (prefix: string, f: string, suffix: string, fb?: string) =>
  fb
    ? `var(${prefix}-${f}${suffix}, var(${prefix}-${fb}${suffix}))`
    : `var(${prefix}-${f}${suffix})`

/* Nudge a fill by an interaction offset (hover/active), tone-aware: each
   tone's states derive from the TONE's own fill, not the base fill —
   otherwise tone- hover jumps from the soft fill to near-base darkness.
   States deliberately do NOT re-derive the text color: fg is decided by
   the tone's REST fill and stays stable through interaction — the ±0.04/
   0.08 L nudges keep AA for any rest-passing fill, and re-deriving would
   flicker black↔white whenever a nudge crosses the fg threshold. */
const nudged = (fillExpr: string, offsetDial: string) =>
  `oklch(from ${fillExpr} calc(l + var(--ty-${offsetDial})) c h)`

/* Fill-relative nudge: moves TOWARD mid-lightness by the dial's magnitude,
   whatever the fill. Needed for neutral+ — full-contrast ink sits at an L
   extreme in both modes (near-black light / near-white dark), where the
   MODE-directional dials clip into the L ceiling/floor and vanish. */
const nudgedMid = (fillExpr: string, offsetDial: string) =>
  `oklch(from ${fillExpr} calc(l + sign(0.5 - l) * abs(var(--ty-${offsetDial}))) c h)`

/* Solid rules assign --_solid-bg (the CURRENT fill — swapped by hover/
   active) and --_solid-rest (the tone's RESTING fill — set only by rest/
   tone rules, never by state rules). The base button.solid rule holds the
   single set of formulas that consume them: background follows --_solid-bg;
   the depth border derives from --_solid-rest so it stays STATIONARY while
   the fill steps up on hover — the fill rises toward the lit edge instead
   of dragging the edge along with it. */
const solidFlavor = (f: string, fb?: string) => {
  const solid = (suffix: string) => tokenRef('--ty-solid', f, suffix, fb)
  // Neutral reads its own, stronger border offset (no hue separates ink
  // from the canvas — see --ty-button-border-l-neutral in tyrell.css).
  // Colored flavors must RESET to the plain dial: the bare button.solid
  // rule (which matches every solid button) sets the neutral chain.
  const borderL =
    f === 'neutral'
      ? ' --_border-l: var(--ty-button-border-l-neutral, var(--ty-button-border-l, -0.15));'
      : ' --_border-l: var(--ty-button-border-l, -0.15);'
  // Neutral+ is full-contrast ink at an L extreme — its hover/active must
  // move toward mid (fill-relative), not in the mode's direction.
  const plusNudge = f === 'neutral' ? nudgedMid : nudged
  return `
button.solid.${f} { --_ring: ${tokenRef('--ty-color', f, '', fb)}; --_solid-bg: var(--ty-button-bg, var(--_muted-solid-bg, ${solid('')})); --_solid-rest: var(--ty-button-bg, var(--_muted-solid-bg, ${solid('')}));${borderL} color: var(--ty-button-color, var(--_muted-solid-fg, ${solid('-fg')})); }
button.solid.${f}.tone-plus  { --_solid-bg: var(--ty-button-bg, var(--_muted-solid-bg, ${solid('-strong')})); --_solid-rest: var(--ty-button-bg, var(--_muted-solid-bg, ${solid('-strong')})); color: var(--ty-button-color, var(--_muted-solid-fg, ${solid('-strong-fg')})); }
button.solid.${f}.tone-minus { --_solid-bg: var(--ty-button-bg, var(--_muted-solid-bg, ${solid('-soft')})); --_solid-rest: var(--ty-button-bg, var(--_muted-solid-bg, ${solid('-soft')})); color: var(--ty-button-color, var(--_muted-solid-fg, ${solid('-soft-fg')})); }
button.solid.${f}:hover:not(:disabled)  { --_solid-bg: var(--ty-button-bg-hover, ${solid('-hover')}); }
button.solid.${f}:active:not(:disabled) { --_solid-bg: ${solid('-active')}; }
button.solid.${f}.tone-plus:hover:not(:disabled)   { --_solid-bg: var(--ty-button-bg-hover, ${plusNudge(solid('-strong'), 'solid-hover-l')}); }
button.solid.${f}.tone-plus:active:not(:disabled)  { --_solid-bg: ${plusNudge(solid('-strong'), 'solid-active-l')}; }
button.solid.${f}.tone-minus:hover:not(:disabled)  { --_solid-bg: var(--ty-button-bg-hover, ${nudged(solid('-soft'), 'solid-hover-l')}); }
button.solid.${f}.tone-minus:active:not(:disabled) { --_solid-bg: ${nudged(solid('-soft'), 'solid-active-l')}; }
`
}

const outlinedFlavor = (f: string, fb?: string) => {
  const color = (suffix: string) => tokenRef('--ty-color', f, suffix, fb)
  // Neutral+ only: bare text/border need page contrast, which the
  // per-flavor ladder is FOR (it deliberately inverts per mode) — pointing
  // base/soft at the solid ink ramp was a real bug (dark-mode contrast
  // against the canvas measured 1.01/1.20 — invisible; WCAG minimum is
  // 4.5). Strong stays on ink: at 0.93 dark / 0.15 light it's still 16.5:1,
  // and matches solid's "+" for the loud-CTA identity that was the ask.
  const textInk = (suffix: string) => (f === 'neutral' && suffix === '-strong' ? `var(--ty-solid-neutral${suffix})` : color(suffix))
  return `
button.outlined.${f} {
  color:        var(--ty-button-color,  var(--_muted-outlined-line, ${textInk('')}));
  border-color: var(--ty-button-border, var(--_muted-outlined-line, ${textInk('')}));
}
button.outlined.${f}.tone-plus {
  color:        var(--ty-button-color,  var(--_muted-outlined-line, ${textInk('-strong')}));
  border-color: var(--ty-button-border, var(--_muted-outlined-line, ${textInk('-strong')}));
}
button.outlined.${f}.tone-minus {
  color:        var(--ty-button-color,  var(--_muted-outlined-line, ${textInk('-soft')}));
  border-color: var(--ty-button-border, var(--_muted-outlined-line, ${textInk('-soft')}));
}
button.outlined.${f}:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, ${tokenRef('--ty-bg', f, '-soft', fb)});
}
/* Rest is whatever tone you picked; hover/active/focus always escalates to
   the SAME peak — most-emphasized ("+") color, regardless of starting
   tone. tone-plus is already there at rest, so this is a no-op for it.
   :hover only, :not(.muted) — muted's hover-reveal is a DIFFERENT contract
   (reveal the plain button's RESTING color, tested directly against it);
   this rule would outrank that fallback and show strong instead.
   :active/:focus-visible apply to muted too (no exclusion) — muted's own
   reveal-on-press mechanism has much lower specificity than this rule, so
   it simply wins outright, landing muted and plain on the same escalated
   color when both are pressed — which is what muted's OWN test expects. */
button.outlined.${f}:not(.muted):hover:not(:disabled),
button.outlined.${f}:active:not(:disabled),
button.outlined.${f}:focus-visible {
  color:        var(--ty-button-color, ${textInk('-strong')});
  border-color: var(--ty-button-border, ${textInk('-strong')});
}
`
}

const ghostFlavor = (f: string, fb?: string) => {
  const color = (suffix: string) => tokenRef('--ty-color', f, suffix, fb)
  // Neutral+ only: bare text needs page contrast — same reasoning and same
  // measured bug as outlinedFlavor above (base/soft on the solid ink ramp
  // read 1.01/1.20 against the dark canvas; WCAG minimum is 4.5). Strong
  // stays on ink: still 16.5:1, and matches solid's "+" loud-CTA identity.
  const ink = (suffix: string) => (f === 'neutral' && suffix === '-strong' ? `var(--ty-solid-neutral${suffix})` : color(suffix))
  return `
button.ghost.${f}            { color: var(--ty-button-color, var(--_muted-ghost-fg, ${ink('')})); }
button.ghost.${f}.tone-plus  { color: var(--ty-button-color, var(--_muted-ghost-fg, ${ink('-strong')})); }
button.ghost.${f}.tone-minus { color: var(--ty-button-color, var(--_muted-ghost-fg, ${ink('-soft')})); }
button.ghost.${f}:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, ${tokenRef('--ty-bg', f, '-soft', fb)});
}
/* See outlinedFlavor above — same escalation-to-peak, same :hover-only
   :not(.muted) split, text only. */
button.ghost.${f}:not(.muted):hover:not(:disabled),
button.ghost.${f}:active:not(:disabled),
button.ghost.${f}:focus-visible {
  color: var(--ty-button-color, ${ink('-strong')});
}
`
}

/** Rules for one custom (non-built-in) flavor across all three appearances. */
export const buttonCustomFlavorCss = (base: string) =>
  solidFlavor(base, 'neutral') + outlinedFlavor(base, 'neutral') + ghostFlavor(base, 'neutral')

export const buttonStyles = `
:host {
  display: inline-block;
  font-family: var(--ty-font-sans);
}

:host([wide]) {
  display: flex;
  flex-grow: 1;
}

button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ty-spacing-1);
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  /* Mode-flipped weight dial (tyrell.css): medium in light, normal in dark —
     light-on-dark text blooms, a fixed semibold read heavy there. Override
     with --ty-weight-action at any scope. */
  font-weight: var(--ty-weight-action, var(--ty-font-medium));
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: var(--ty-local-transition, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease);
  background: transparent;
  color: var(--ty-color-neutral);
  border: 1px solid transparent;
}

button:not(.action) {
  min-width: 4rem;
}

button:not(.pill) {
  border-radius: var(--ty-radius-md);
}

button.xs:not(.pill) { border-radius: var(--ty-button-radius-xs, var(--ty-radius-md)); }
button.sm:not(.pill) { border-radius: var(--ty-button-radius-sm, var(--ty-radius-md)); }
button.md:not(.pill) { border-radius: var(--ty-button-radius-md, var(--ty-radius-md)); }
button.lg:not(.pill) { border-radius: var(--ty-button-radius-lg, var(--ty-radius-md)); }
button.xl:not(.pill) { border-radius: var(--ty-button-radius-xl, var(--ty-radius-md)); }

button:focus-visible {
  outline: none;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Spinner overlays the button center; original content kept in flow but
   hidden via visibility so width/height are preserved (no layout shift). */
.loader-icon {
  display: none;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  color: currentColor;
}
.loader-icon svg {
  width: 100%;
  height: 100%;
}
button.loading {
  cursor: wait;
}
button.loading > *:not(.loader-icon) {
  visibility: hidden;
}
button.loading > .loader-icon {
  display: inline-flex;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ty-button-spin 0.7s linear infinite;
}
@keyframes ty-button-spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  button.loading > .loader-icon {
    animation-duration: 1.6s;
  }
}

::slotted(*) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

::slotted(ty-icon) {
  flex-shrink: 0;
}

:host([wide]) button {
  flex-grow: 1;
}

/* Buttons run a 4px ladder (24-40px). Shared scale with fields
   (--ty-size-sm/md/lg — see tyrell.css): field sm = button md (32px),
   field md = button lg (36px), field lg = button xl (40px) — a button
   and a field of the paired size sit flush, same height, in a row. */

button.xs {
  padding: 0 var(--ty-spacing-2);
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  gap: var(--ty-spacing-1);
  height: 1.5rem; /* 24px */
}

button.sm {
  padding: 0 var(--ty-spacing-2);
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  gap: var(--ty-spacing-1);
  height: 1.75rem; /* 28px */
}

button.md {
  padding: 0.375rem var(--ty-spacing-3);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  gap: var(--ty-spacing-2);
  height: 2rem; /* 32px — matches field sm */
}

button.lg {
  padding: 0.375rem var(--ty-spacing-4);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  gap: var(--ty-spacing-2);
  height: 2.25rem; /* 36px — matches field md */
}

button.xl {
  padding: var(--ty-spacing-2) var(--ty-spacing-6);
  font-size: var(--ty-font-base);
  line-height: var(--ty-leading-base);
  letter-spacing: var(--ty-tracking-base);
  gap: var(--ty-spacing-2);
  height: 2.5rem; /* 40px — matches field lg */
}

/* Action = icon-only square */
button.action {
  gap: 0px !important;
  height: 2rem;
  width: 2rem;
  padding: 0px !important;
}

button.action ::slotted(ty-icon) {
  height: 1rem;
  width: 1rem;
}

button.action.xs { height: 1.375rem; width: 1.375rem; }
button.action.xs ::slotted(ty-icon) { height: 0.75rem; width: 0.75rem; }

button.action.sm { height: 1.5rem; width: 1.5rem; }
button.action.sm ::slotted(ty-icon) { height: 0.875rem; width: 0.875rem; }

button.action.lg { height: 2.25rem; width: 2.25rem; }
button.action.lg ::slotted(ty-icon) { height: 1.125rem; width: 1.125rem; }

button.action.xl { height: 2.5rem; width: 2.5rem; }
button.action.xl ::slotted(ty-icon) { height: 1.25rem; width: 1.25rem; }

/* MUTED: show the neutral tokens at rest instead of the flavor color; reveal the
   real flavor on interaction. Implemented as a fallback tier the flavor
   rules above already read (--_muted-*), which sits behind the public
   --ty-button-{bg,color,border} override slots and ahead of the flavor's
   own token — so a custom brand color still wins, muted or not. Unsetting
   --_muted-* on interaction falls the var() chain through to whatever's
   next (the user's override, or the real flavor color).
   Hover reveal is gated to real pointers (touch has no hover); :active /
   :focus-visible cover the tap case so touch still gets the color on press. */

/* --_muted-solid-* reads the SOLID neutral ink tokens — a fill's L doesn't
   need page contrast. --_muted-outlined-line / --_muted-ghost-fg are bare
   text/border and DO — they stay on the regular text ladder (it already
   inverts correctly per mode), except tone-plus, which is legible AND
   loud on the ink dial (16.5:1 dark, matches solid's "+" identity). Base/
   soft on ink measured 1.01/1.20 dark contrast against the canvas —
   invisible; WCAG minimum is 4.5. */
button.muted {
  --_muted-solid-bg: var(--ty-solid-neutral);
  --_muted-solid-fg: var(--ty-solid-neutral-fg);
  --_muted-outlined-line: var(--ty-color-neutral);
  --_muted-ghost-fg: var(--ty-color-neutral);
}
button.muted.tone-plus {
  --_muted-solid-bg: var(--ty-solid-neutral-strong);
  /* fg must track the tone's fill: neutral+ is inverted ink in dark mode
     (white fill), so inheriting base neutral's white fg would be
     white-on-white. */
  --_muted-solid-fg: var(--ty-solid-neutral-strong-fg);
  --_muted-outlined-line: var(--ty-solid-neutral-strong);
  --_muted-ghost-fg: var(--ty-solid-neutral-strong);
}
button.muted.tone-minus {
  --_muted-solid-bg: var(--ty-solid-neutral-soft);
  --_muted-solid-fg: var(--ty-solid-neutral-soft-fg);
  --_muted-outlined-line: var(--ty-color-neutral-soft);
  --_muted-ghost-fg: var(--ty-color-neutral-soft);
}
@media (hover: hover) and (pointer: fine) {
  button.muted:hover:not(:disabled) {
    --_muted-solid-bg: unset;
    --_muted-solid-fg: unset;
    --_muted-outlined-line: unset;
    --_muted-ghost-fg: unset;
  }
}
button.muted:active:not(:disabled),
button.muted:focus-visible:not(:disabled) {
  --_muted-solid-bg: unset;
  --_muted-solid-fg: unset;
  --_muted-outlined-line: unset;
  --_muted-ghost-fg: unset;
}

button.pill {
  border-radius: 9999px;
  padding-left: 1.25em;
  padding-right: 1.25em;
}

button.pill.xs { padding-left: 1em; padding-right: 1em; }
button.pill.sm { padding-left: 1.125em; padding-right: 1.125em; }
button.pill.lg { padding-left: 1.5em; padding-right: 1.5em; }
button.pill.xl { padding-left: 1.75em; padding-right: 1.75em; }

button.pill:has(ty-icon:only-child),
button.pill:has(slot[name="start"]:only-child),
button.pill:has(slot[name="end"]:only-child) {
  padding: 0;
  aspect-ratio: 1;
  min-width: var(--ty-size-md);
}

button.pill.xs:has(ty-icon:only-child) { min-width: 1.375rem; min-height: 1.375rem; }
button.pill.sm:has(ty-icon:only-child) { min-width: 1.5rem; min-height: 1.5rem; }
button.pill.md:has(ty-icon:only-child) { min-width: 2rem; min-height: 2rem; }
button.pill.lg:has(ty-icon:only-child) { min-width: 2.25rem; min-height: 2.25rem; }
button.pill.xl:has(ty-icon:only-child) { min-width: 2.5rem; min-height: 2.5rem; }

/* SOLID — flat: one variable per segment. No color math here; all the
   --ty-solid-{flavor}-{hover,active,strong,soft} tokens are DERIVED in
   tyrell-theme.css (OKLCH) or set literally in tyrell.css. Override any
   single token to recolor that one segment. Bare .solid = custom-flavor
   fallback, themable via --ty-button-{bg,bg-hover,color}. */

button.solid {
  --_ring: var(--ty-color-neutral);
  --_solid-bg: var(--ty-button-bg, var(--ty-solid-neutral));
  --_solid-rest: var(--ty-button-bg, var(--ty-solid-neutral));
  /* Bare .solid is the flavorless default = neutral ink, so it takes the
     neutral border offset; colored flavor rules reset this to the plain
     dial. */
  --_border-l: var(--ty-button-border-l-neutral, var(--ty-button-border-l, -0.15));
  background: var(--_solid-bg);
  color: var(--ty-button-color, var(--ty-solid-neutral-fg));
  /* Depth chrome — border + drop shadow, both scaled by --ty-button-depth.
     (A top-edge sheen — inset 0 1px 0 <lightened fill> — used to live here
     too; dropped, it read as a dizzying bright line rather than a subtle
     highlight.) depth 0 = border matches fill exactly and the shadow goes
     transparent — pixel-flat, but the 1px border stays in the layout so
     toggling depth never shifts geometry (and solid now shares the same
     box as outlined/ghost, which always had a 1px border).
     --ty-button-border-l flips sign with the mode (tyrell.css): dark mode
     runs a LIGHTER-than-fill hairline (fills read washed-out against dark
     surfaces without a lit edge), light mode a slightly darker one.
     Direct escape hatches outrank the derivation: --ty-solid-border-color
     pins the border to ANY color (the L-offset dials stop mattering), and
     --ty-solid-border-width changes thickness (widths ≠ 1px do shift
     geometry — that's inherent).
     Browsers without relative color drop these declarations: border falls
     back to the base button's 1px transparent, shadows to none. */
  border: var(--ty-solid-border-width, 1px) solid
    var(--ty-solid-border-color,
        oklch(from var(--_solid-rest, var(--_solid-bg)) calc(l + var(--_border-l, -0.15) * var(--ty-button-depth, 0.35)) c h));
  box-shadow: 0 1px 2px oklch(0 0 0 / calc(0.4 * var(--ty-button-depth, 0.35)));
}
button.solid.tone-plus  { --_solid-bg: var(--ty-button-bg, var(--ty-solid-neutral-strong)); --_solid-rest: var(--ty-button-bg, var(--ty-solid-neutral-strong)); color: var(--ty-button-color, var(--ty-solid-neutral-strong-fg)); }
button.solid.tone-minus { --_solid-bg: var(--ty-button-bg, var(--ty-solid-neutral-soft)); --_solid-rest: var(--ty-button-bg, var(--ty-solid-neutral-soft)); color: var(--ty-button-color, var(--ty-solid-neutral-soft-fg)); }
button.solid:hover:not(:disabled)  { --_solid-bg: var(--ty-button-bg-hover, var(--ty-solid-neutral-hover)); }
button.solid:active:not(:disabled) { --_solid-bg: var(--ty-solid-neutral-active); }
button.solid.tone-plus:hover:not(:disabled) {
  --_solid-bg: var(--ty-button-bg-hover, oklch(from var(--ty-solid-neutral-strong) calc(l + sign(0.5 - l) * abs(var(--ty-solid-hover-l))) c h));
}
button.solid.tone-plus:active:not(:disabled) {
  --_solid-bg: oklch(from var(--ty-solid-neutral-strong) calc(l + sign(0.5 - l) * abs(var(--ty-solid-active-l))) c h);
}
button.solid.tone-minus:hover:not(:disabled) {
  --_solid-bg: var(--ty-button-bg-hover, oklch(from var(--ty-solid-neutral-soft) calc(l + var(--ty-solid-hover-l)) c h));
}
button.solid.tone-minus:active:not(:disabled) {
  --_solid-bg: oklch(from var(--ty-solid-neutral-soft) calc(l + var(--ty-solid-active-l)) c h);
}

${FLAVORS.map((f) => solidFlavor(f)).join('')}
button.solid:focus-visible {
  box-shadow: 0 0 0 2px var(--ty-focus-ring-gap), 0 0 0 4px var(--_ring);
}

/* OUTLINED — transparent bg, text === border (uses --ty-color-*).
   Bare .outlined rule = fallback for custom flavors. Text is bound to
   border color, so the fallback chain prefers --ty-button-border, then
   --ty-button-color. */

button.outlined {
  background: transparent;
  color:        var(--ty-button-border, var(--ty-button-color, var(--ty-color-neutral)));
  border-color: var(--ty-button-border, var(--ty-button-color, var(--ty-color-neutral)));
}
button.outlined:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-neutral-soft));
}

${FLAVORS.map((f) => outlinedFlavor(f)).join('')}

/* GHOST — text only, hover bg (uses --ty-color-* + --ty-bg-*-soft).
   Bare .ghost rule = fallback for custom flavors. */

button.ghost {
  background: transparent;
  border: none;
  color: var(--ty-button-color, var(--ty-color-neutral));
}
button.ghost:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-neutral-soft));
}

${FLAVORS.map((f) => ghostFlavor(f)).join('')}`;
