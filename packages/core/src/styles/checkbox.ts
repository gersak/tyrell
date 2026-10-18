/**
 * Checkbox Component Styles — self-contained (no inputStyles import).
 *
 * The checkbox is "just the tick": a single checkmark whose color/opacity
 * carries the state. Full flavor color when checked, faint when unchecked,
 * dash at mid-opacity when indeterminate, grayscale when disabled.
 */

import { FLAVORS } from "../types/common.js";

/* Flavor rules only set --checkbox-color (checked) / --checkbox-ring (focus
   ring). Unchecked stays neutral for every flavor — a tinted unchecked tick
   was the dimmest thing on the page. The base rules below consume
   them. Doubles as the per-instance override API: `ty-checkbox {
   --checkbox-color: … }`. --checkbox-ring pre-resolves the color-mix() here
   (rather than inlining a nested var(...,fallback) as a color-mix argument
   directly in the box-shadow rule) — that nested form fails at
   computed-value time in some engines. Fallback flavor `fb` is used for
   custom flavors so missing tokens degrade to neutral. */
const checkboxFlavor = (f: string, fb?: string) => {
  const tok = (s: string) =>
    fb
      ? `var(--ty-color-${f}${s}, var(--ty-color-${fb}${s}))`
      : `var(--ty-color-${f}${s})`;
  return `
:host([flavor="${f}"])  { --checkbox-color: ${tok("-strong")}; --checkbox-ring: color-mix(in oklab, ${tok("")} 25%, transparent); }
:host([flavor="${f}+"]) { --checkbox-color: ${tok("-strong")}; --checkbox-ring: color-mix(in oklab, ${tok("-strong")} 25%, transparent); }
:host([flavor="${f}-"]) { --checkbox-color: ${tok("")}; --checkbox-ring: color-mix(in oklab, ${tok("")} 25%, transparent); }
`;
};

/** Rules for one custom (non-built-in) flavor — see utils/flavor-sheet.ts. */
export const checkboxCustomFlavorCss = (base: string) => checkboxFlavor(base, "neutral");

export const checkboxStyles = `
:host {
  display: inline-flex;
  width: auto;
  /* The host is exactly one line box of the surrounding text (inherited
     font + line-height) and the tick is centered in it. A tick bigger than
     the line overhangs it equally above and below instead of growing it, so
     the control sits on the first line's middle in a flex row (start or
     center), inline in text, and next to a wrapping label — and never
     pushes the label. */
  height: 1.25em;
  height: 1lh;
  align-items: center;
  vertical-align: baseline;
  overflow: visible;
}

/* Zero-width text strut: gives the host the same baseline as the
   surrounding text, so inline (vertical-align: baseline) its line box
   coincides with the text's line box exactly. */
:host::before {
  content: "\\200b";
  width: 0;
}

.checkbox-container {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  outline: none;
  transition: var(--ty-local-transition, all 0.15s ease-in-out);
  user-select: none;
  cursor: pointer;
  border-radius: 6px;
  gap: var(--ty-spacing-1);
  /* Default (no flavor attribute) is neutral — defaults don't reflect to the
     host attribute, so the fallbacks here carry the default look. */
  /* Unchecked: faint neutral tick (30% of body text) so it recedes
     next to the label; checked jumps to full body text. */
  color: var(--checkbox-color-off, color-mix(in oklab, var(--ty-text) 30%, transparent));
  /* Room for the hover pill around the tick; the pill may overhang the
     line by a few px at sizes bigger than the line. */
  box-sizing: border-box;
  padding: 2px;
  border-radius: 5px;
}

.checkbox-container:hover {
  background: var(--checkbox-hover-bg, color-mix(in oklab, var(--ty-text) 8%, transparent));
}

/* Hover previews the tick, but stays well short of checked (100%): at 80%
   a hovered unchecked box read as already checked. The pill carries the
   hover feedback; the tick only hints. */
.checkbox-container:not([aria-checked="true"]):not([aria-checked="mixed"]):hover {
  color: var(--checkbox-color-off-hover, color-mix(in oklab, var(--ty-text) 50%, transparent));
}

/* Checked is the flavor's STRONG tone (neutral: body text) so it sits far
   from the mid-tone unchecked tick in lightness, not only in hue. */
.checkbox-container[aria-checked="true"] {
  color: var(--checkbox-color, var(--ty-text));
}

/* Visible focus ring (keyboard) — .focused is toggled by the component
   (not :focus-visible: Chromium matches that when a <label> click focuses
   the box). Matches the checked-state color so a danger checkbox gets a
   red ring, not a fixed primary one. */
.checkbox-container.focused {
  box-shadow: 0 0 0 3px var(--checkbox-ring, color-mix(in oklab, var(--ty-color-primary) 25%, transparent));
}

.checkbox-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transition: var(--ty-local-transition, color 0.15s ease-in-out);
  pointer-events: none;
  /* Let the container handle the click */
}

.checkbox-container svg {
  width: 16px;
  height: 16px;
}

.checkbox-container.xs svg {
  width: 12px;
  height: 12px;
}

.checkbox-container.sm svg {
  width: 14px;
  height: 14px;
}

.checkbox-container.lg svg {
  width: 20px;
  height: 20px;
}

.checkbox-container.xl svg {
  width: 24px;
  height: 24px;
}

/* Semantic flavors set --checkbox-color[-off], consumed above */
${FLAVORS.map((f) => checkboxFlavor(f)).join("")}

/* Clean tick: no box, just the mark. Checked and mixed carry the flavor
   color; unchecked is the neutral tick set on the container above. */
.checkbox-container[aria-checked="mixed"] {
  color: var(--checkbox-color, var(--ty-text));
}

/* Disabled must stay distinguishable from merely-unchecked: grayscale kills
   the flavor color, and disabled-unchecked drops below the unchecked 0.35. */
.checkbox-container.disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.5;
  filter: grayscale(1);
}

.checkbox-container.disabled:not([aria-checked="true"]) {
  opacity: 0.45;
}

.checkbox-container.disabled:hover {
  background: none;
}

.checkbox-container.error .checkbox-icon {
  color: var(--ty-color-danger);
}

.checkbox-container.error:focus {
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ty-color-danger) 15%, transparent);
}
`;
