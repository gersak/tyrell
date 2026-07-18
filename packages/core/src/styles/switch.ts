/**
 * Switch Component Styles
 * Track + thumb visual, ARIA role="switch".
 *
 * Reuses input-container/error-message rules from input styles for label
 * and error layout consistency.
 */

import { FLAVORS } from "../types/common.js";
import { inputStyles } from "./input.js";

/* Flavor rules only set --switch-track; the single checked-state rule below
   consumes it. The var doubles as the per-instance override API:
   `ty-switch { --switch-track: … }` (outer-document host rules beat :host).
   Optional fallback flavor `fb` is used for custom flavors so missing
   tokens degrade to neutral instead of an unstyled track. */
const switchFlavor = (f: string, fb?: string) => {
  const tok = (s: string) =>
    fb
      ? `var(--ty-color-${f}${s}, var(--ty-color-${fb}${s}))`
      : `var(--ty-color-${f}${s})`;
  return `
:host([flavor="${f}"])  { --switch-track: ${tok("")}; }
:host([flavor="${f}+"]) { --switch-track: ${tok("-strong")}; }
:host([flavor="${f}-"]) { --switch-track: ${tok("-soft")}; }
`;
};

/** Rules for one custom (non-built-in) flavor — see utils/flavor-sheet.ts. */
export const switchCustomFlavorCss = (base: string) => switchFlavor(base, "neutral");

export const switchStyles = `
${inputStyles}

/* Override input's :host so the switch sizes to its visual */
:host {
  display: inline-flex;
  width: auto;
  vertical-align: middle;
}

/* ===== SWITCH CONTAINER (just the visual) ===== */
.switch-container {
  display: inline-block;
  cursor: pointer;
  user-select: none;
  outline: none;
  vertical-align: middle;
}

.switch-container.disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.switch-container:focus-visible .switch-track,
.switch-container.focused .switch-track {
  box-shadow: 0 0 0 3px var(--ty-input-shadow-focus);
}

/* ===== TRACK ===== */
.switch-track {
  position: relative;
  flex-shrink: 0;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  background: var(--ty-color-neutral-soft, var(--ty-input-border));
  transition: background-color 0.18s ease-in-out;
  box-sizing: border-box;
}

/* ===== THUMB ===== */
.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.18s ease-in-out, background-color 0.18s ease-in-out;
}

/* ===== CHECKED STATE ===== */
/* Default (no flavor attribute) is primary — defaults don't reflect to the
   host attribute, so the base rule's fallback carries the default look. */
.switch-container[aria-checked="true"] .switch-track {
  background: var(--switch-track, var(--ty-color-primary));
}

.switch-container[aria-checked="true"] .switch-thumb {
  transform: translateX(16px);
}

/* ===== SIZE VARIANTS ===== */
.switch-container.xs .switch-track { width: 26px; height: 14px; }
.switch-container.xs .switch-thumb { width: 10px; height: 10px; }
.switch-container.xs[aria-checked="true"] .switch-thumb { transform: translateX(12px); }

.switch-container.sm .switch-track { width: 30px; height: 16px; }
.switch-container.sm .switch-thumb { width: 12px; height: 12px; }
.switch-container.sm[aria-checked="true"] .switch-thumb { transform: translateX(14px); }

/* md is default — already set above */

.switch-container.lg .switch-track { width: 44px; height: 24px; }
.switch-container.lg .switch-thumb { width: 20px; height: 20px; }
.switch-container.lg[aria-checked="true"] .switch-thumb { transform: translateX(20px); }

.switch-container.xl .switch-track { width: 52px; height: 28px; }
.switch-container.xl .switch-thumb { width: 24px; height: 24px; }
.switch-container.xl[aria-checked="true"] .switch-thumb { transform: translateX(24px); }

/* ===== FLAVOR VARIANTS (set --switch-track, consumed above) ===== */
${FLAVORS.map((f) => switchFlavor(f)).join("")}

`;
