/**
 * Button Component Styles
 *
 * Three appearance variants × six semantic flavors × three tones (+/base/-).
 * Each variant uses ONE token system:
 *   - solid    → flat per-segment tokens --ty-solid-{flavor}{,-hover,-active,
 *               -strong,-soft,-fg}. Derived in tyrell-brand.css via OKLCH on
 *               3 axes (color / hover-active / theme chroma-hue); literal in
 *               tyrell.css. The component does no color math.
 *   - outlined → --ty-color-{flavor}-{strong|base|soft}  (text === border)
 *   - ghost    → --ty-color-{flavor}-{strong|base|soft}  (text), --ty-bg-{flavor}-soft (hover)
 *
 * Per-instance overrides via host CSS variables:
 *   --ty-button-bg, --ty-button-bg-hover, --ty-button-color, --ty-button-border
 */

import { FLAVORS } from '../types/common.js'

/* One block per flavor, per appearance. Selectors and tokens are formulaic —
   see the section comments below for which token system each appearance uses.

   Each generator takes an optional fallback flavor `fb`: token references
   then become var(--ty-*-f, var(--ty-*-fb)). Built-ins pass no fallback
   (their tokens always exist); buttonCustomFlavorCss() passes 'neutral' so a
   custom flavor with missing tokens degrades to neutral instead of an
   invisible button. */

const tokenRef = (prefix: string, f: string, suffix: string, fb?: string) =>
  fb
    ? `var(${prefix}-${f}${suffix}, var(${prefix}-${fb}${suffix}))`
    : `var(${prefix}-${f}${suffix})`

const solidFlavor = (f: string, fb?: string) => {
  const solid = (suffix: string) => tokenRef('--ty-solid', f, suffix, fb)
  return `
button.solid.${f} { --_ring: ${tokenRef('--ty-color', f, '', fb)}; background: var(--ty-button-bg, ${solid('')}); color: var(--ty-button-color, ${solid('-fg')}); }
button.solid.${f}.tone-plus  { background: var(--ty-button-bg, ${solid('-strong')}); }
button.solid.${f}.tone-minus { background: var(--ty-button-bg, ${solid('-soft')}); }
button.solid.${f}:hover:not(:disabled)  { background: var(--ty-button-bg-hover, ${solid('-hover')}); }
button.solid.${f}:active:not(:disabled) { background: ${solid('-active')}; }
`
}

const outlinedFlavor = (f: string, fb?: string) => {
  const color = (suffix: string) => tokenRef('--ty-color', f, suffix, fb)
  return `
button.outlined.${f} {
  color:        var(--ty-button-color,  ${color('')});
  border-color: var(--ty-button-border, ${color('')});
}
button.outlined.${f}.tone-plus {
  color:        var(--ty-button-color,  ${color('-strong')});
  border-color: var(--ty-button-border, ${color('-strong')});
}
button.outlined.${f}.tone-minus {
  color:        var(--ty-button-color,  ${color('-soft')});
  border-color: var(--ty-button-border, ${color('-soft')});
}
button.outlined.${f}:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, ${tokenRef('--ty-bg', f, '-soft', fb)});
}
`
}

const ghostFlavor = (f: string, fb?: string) => {
  const color = (suffix: string) => tokenRef('--ty-color', f, suffix, fb)
  return `
button.ghost.${f}            { color: var(--ty-button-color, ${color('')}); }
button.ghost.${f}.tone-plus  { color: var(--ty-button-color, ${color('-strong')}); }
button.ghost.${f}.tone-minus { color: var(--ty-button-color, ${color('-soft')}); }
button.ghost.${f}:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, ${tokenRef('--ty-bg', f, '-soft', fb)});
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
  font-weight: var(--ty-font-semibold);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
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

/* ===== LOADING STATE =====
   Spinner overlays the button center; original content kept in flow but
   hidden via visibility so width/height are preserved (no layout shift).
*/
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

/* ===== SIZES =====
   Buttons run a 4px ladder (24-40px). Shared scale with fields
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

/* ===== ACTION (icon-only square) ===== */

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

/* ===== PILL ===== */

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

/* ============================================================
   SOLID — flat: one variable per segment. No color math here; all the
   --ty-solid-{flavor}-{hover,active,strong,soft} tokens are DERIVED in
   tyrell-brand.css (OKLCH) or set literally in tyrell.css. Override any
   single token to recolor that one segment. Bare .solid = custom-flavor
   fallback, themable via --ty-button-{bg,bg-hover,color}.
   ============================================================ */

button.solid {
  border: none;
  --_ring: var(--ty-color-neutral);
  background: var(--ty-button-bg, var(--ty-solid-neutral));
  color:      var(--ty-button-color, var(--ty-solid-neutral-fg));
}
button.solid.tone-plus  { background: var(--ty-button-bg, var(--ty-solid-neutral-strong)); }
button.solid.tone-minus { background: var(--ty-button-bg, var(--ty-solid-neutral-soft)); }
button.solid:hover:not(:disabled)  { background: var(--ty-button-bg-hover, var(--ty-solid-neutral-hover)); }
button.solid:active:not(:disabled) { background: var(--ty-solid-neutral-active); }

${FLAVORS.map((f) => solidFlavor(f)).join('')}
button.solid:focus-visible {
  box-shadow: 0 0 0 2px var(--ty-focus-ring-gap), 0 0 0 4px var(--_ring);
}

/* ============================================================
   OUTLINED — transparent bg, text === border (uses --ty-color-*)
   Bare .outlined rule = fallback for custom flavors. For outlined,
   text is bound to border color (the rule "text === border"), so the
   fallback chain prefers --ty-button-border, then --ty-button-color.
   ============================================================ */

button.outlined {
  background: transparent;
  color:        var(--ty-button-border, var(--ty-button-color, var(--ty-color-neutral)));
  border-color: var(--ty-button-border, var(--ty-button-color, var(--ty-color-neutral)));
}
button.outlined:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-neutral-soft));
}

${FLAVORS.map((f) => outlinedFlavor(f)).join('')}

/* ============================================================
   GHOST — text only, hover bg (uses --ty-color-* + --ty-bg-*-soft)
   Bare .ghost rule = fallback for custom flavors.
   ============================================================ */

button.ghost {
  background: transparent;
  border: none;
  color: var(--ty-button-color, var(--ty-color-neutral));
}
button.ghost:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-neutral-soft));
}

${FLAVORS.map((f) => ghostFlavor(f)).join('')}`;
