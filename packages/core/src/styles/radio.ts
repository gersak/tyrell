/**
 * Radio Group + Radio Styles
 *
 * ty-radio-group: optional label + vertical/horizontal stack of radios + error message
 * ty-radio: circle with inner dot when checked
 */

import { FLAVORS } from "../types/common.js";
import { inputStyles } from "./input.js";

/* Flavor rules only set --radio-color (checked border + inner dot); base
   rules below consume it. Doubles as the per-instance override API:
   `ty-radio { --radio-color: … }`. Fallback flavor `fb` is used for custom
   flavors so missing tokens degrade to neutral. */
const radioFlavor = (f: string, fb?: string) => {
  const tok = (s: string) =>
    fb
      ? `var(--ty-color-${f}${s}, var(--ty-color-${fb}${s}))`
      : `var(--ty-color-${f}${s})`;
  return `
:host([flavor="${f}"])  { --radio-color: ${tok("")}; }
:host([flavor="${f}+"]) { --radio-color: ${tok("-strong")}; }
:host([flavor="${f}-"]) { --radio-color: ${tok("-soft")}; }
`;
};

/** Rules for one custom (non-built-in) flavor — see utils/flavor-sheet.ts. */
export const radioCustomFlavorCss = (base: string) => radioFlavor(base, "neutral");

export const radioStyles = `
${inputStyles}

/* Override input's :host. ty-radio is just the circle (inline);
   ty-radio-group is a form-field block. */
:host(ty-radio) {
  display: inline-flex;
  width: auto;
  vertical-align: middle;
}

:host(ty-radio-group) {
  display: block;
  width: 100%;
}

.radio-group-container {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-family: inherit;
  color: var(--ty-color-text);
}

.radio-group-label {
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  font-weight: var(--ty-font-medium);
  color: var(--ty-color-text);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.radio-group-list {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}

.radio-group-list.vertical {
  flex-direction: column;
  align-items: flex-start;
}

.radio-group-list.horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

.radio-group-error {
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  color: var(--ty-color-danger);
}

.radio-group-container .required-icon {
  width: 0.65em;
  height: 0.65em;
  color: var(--ty-color-danger);
}
.radio-group-container .required-icon svg {
  width: 100%;
  height: 100%;
}

/* A radio item is just the circle */
.radio-container {
  display: inline-block;
  cursor: pointer;
  user-select: none;
  outline: none;
  vertical-align: middle;
}

.radio-container.disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.radio-container:focus-visible .radio-circle,
.radio-container.focused .radio-circle {
  box-shadow: 0 0 0 3px var(--ty-input-shadow-focus);
}

.radio-circle {
  position: relative;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--ty-input-border);
  background: var(--ty-input-bg);
  box-sizing: border-box;
  transition: var(--ty-local-transition, border-color 0.15s ease-in-out);
}

/* Default (no flavor attribute) is primary — defaults don't reflect to the
   host attribute, so the base rules' fallback carries the default look. */
.radio-circle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--radio-color, var(--ty-color-primary));
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.15s ease-in-out;
}

.radio-container[aria-checked="true"] .radio-circle {
  border-color: var(--radio-color, var(--ty-color-primary));
}

.radio-container[aria-checked="true"] .radio-circle::after {
  transform: translate(-50%, -50%) scale(1);
}

.radio-container.xs .radio-circle { width: 14px; height: 14px; }
.radio-container.xs .radio-circle::after { width: 6px; height: 6px; }

.radio-container.sm .radio-circle { width: 16px; height: 16px; }
.radio-container.sm .radio-circle::after { width: 7px; height: 7px; }

.radio-container.lg .radio-circle { width: 22px; height: 22px; }
.radio-container.lg .radio-circle::after { width: 10px; height: 10px; }

.radio-container.xl .radio-circle { width: 26px; height: 26px; }
.radio-container.xl .radio-circle::after { width: 12px; height: 12px; }

/* Flavor variants — set --radio-color, consumed by the base rules above */
${FLAVORS.map((f) => radioFlavor(f)).join("")}
`;
