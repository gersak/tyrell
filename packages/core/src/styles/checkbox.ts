/**
 * Checkbox Component Styles — self-contained (no inputStyles import).
 *
 * The checkbox is "just the tick": a single checkmark whose color/opacity
 * carries the state. Full flavor color when checked, faint when unchecked,
 * dash at mid-opacity when indeterminate, grayscale when disabled.
 */

import { FLAVORS } from "../types/common.js";

/* Flavor rules only set --checkbox-color (checked) / --checkbox-color-off
   (unchecked) / --checkbox-ring (focus ring); the base rules below consume
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
:host([flavor="${f}"])  { --checkbox-color: ${tok("")}; --checkbox-color-off: ${tok("-soft")}; --checkbox-ring: color-mix(in oklab, ${tok("")} 25%, transparent); }
:host([flavor="${f}+"]) { --checkbox-color: ${tok("-strong")}; --checkbox-color-off: ${tok("-soft")}; --checkbox-ring: color-mix(in oklab, ${tok("-strong")} 25%, transparent); }
:host([flavor="${f}-"]) { --checkbox-color: ${tok("-soft")}; --checkbox-color-off: ${tok("-faint")}; --checkbox-ring: color-mix(in oklab, ${tok("-soft")} 25%, transparent); }
`;
};

/** Rules for one custom (non-built-in) flavor — see utils/flavor-sheet.ts. */
export const checkboxCustomFlavorCss = (base: string) => checkboxFlavor(base, "neutral");

export const checkboxStyles = `
:host {
  display: inline-flex;
  width: auto;
  vertical-align: middle;
}

.checkbox-container {
  display: inline-flex;
  align-items: center;
  outline: none;
  transition: var(--ty-local-transition, all 0.15s ease-in-out);
  user-select: none;
  cursor: pointer;
  border-radius: 6px;
  gap: var(--ty-spacing-1);
  /* Default (no flavor attribute) is neutral — defaults don't reflect to the
     host attribute, so the fallbacks here carry the default look. */
  color: var(--checkbox-color-off, var(--ty-color-neutral-soft));
}

.checkbox-container[aria-checked="true"] {
  color: var(--checkbox-color, var(--ty-color-neutral));
}

/* Visible focus ring (keyboard) — .focused is toggled by the component.
   Matches the checked-state color so a danger checkbox gets a red ring,
   not a fixed primary one. */
.checkbox-container.focused,
.checkbox-container:focus-visible {
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

/* Clean tick: no box outline, just the checkmark. Inactive = faint tick. */
.checkbox-container:not([aria-checked="true"]) {
  opacity: 0.35;
}

/* Indeterminate (dash) sits between unchecked and checked */
.checkbox-container[aria-checked="mixed"] {
  opacity: 0.7;
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
  opacity: 0.2;
}

.checkbox-container.error .checkbox-icon {
  color: var(--ty-color-danger);
}

.checkbox-container.error:focus {
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ty-color-danger) 15%, transparent);
}
`;
