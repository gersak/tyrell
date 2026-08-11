/** Input Component Styles */

import { FLAVORS } from "../types/common.js";

/* Flavor rules only set --input-accent (border), --input-accent-bold
   (hover/focus border), and --input-ring (focus shadow); the wrapper base
   rules consume them. They double as the per-instance override API:
   `ty-input { --input-accent: … }`. Neutral is skipped — it IS the default
   chrome (--ty-input-* tokens), and input's auto-danger-on-error logic
   relies on neutral being the unstyled state.

   Fallback flavor `fb` is used for custom flavors: suffixed tokens fall
   back to the custom base color first (a flavor defining only
   --ty-color-X still gets sensible hover/focus), then to neutral.

   Emphasis ladder mirrors the neutral chrome (faint rest → soft hover →
   focus + ring): a flavored field rests on its -soft shade and only
   escalates to the full color on hover/focus — a resting field shouldn't
   shout its full-saturation border (tones shift the whole ladder). */
const inputFlavor = (f: string, fb?: string) => {
  const c = (s: string) =>
    fb
      ? s
        ? `var(--ty-color-${f}${s}, var(--ty-color-${f}, var(--ty-color-${fb}${s})))`
        : `var(--ty-color-${f}, var(--ty-color-${fb}))`
      : s
        ? `var(--ty-color-${f}${s}, var(--ty-color-${f}))`
        : `var(--ty-color-${f})`;
  return `
:host([flavor="${f}"]) {
  --input-accent: var(--ty-input-${f}-border, ${c("-soft")});
  --input-accent-bold: ${c("")};
  --input-ring: color-mix(in oklab, ${c("")} 15%, transparent);
}
:host([flavor="${f}+"]) {
  --input-accent: ${c("")};
  --input-accent-bold: ${c("-strong")};
  --input-ring: color-mix(in oklab, ${c("-strong")} 15%, transparent);
}
:host([flavor="${f}-"]) {
  --input-accent: ${c("-faint")};
  --input-accent-bold: ${c("-soft")};
  --input-ring: color-mix(in oklab, ${c("-soft")} 15%, transparent);
}
`;
};

/** Rules for one custom (non-built-in) flavor — see utils/flavor-sheet.ts. */
export const inputCustomFlavorCss = (base: string) => inputFlavor(base, "neutral");

export const inputStyles = `
:host {
  display: block;
  font-family: var(--ty-font-sans);
  width: 100%;
}

:host([size="sm"]) {
  font-size: 14px;
}

:host([size="lg"]) {
  font-size: 18px;
}

.input-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.ty-field-label {
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-weight: var(--ty-font-medium);
  color: var(--ty-label-color);
  margin-bottom: 6px;
  padding-left: 12px;
  display: flex;
  align-items: center;
}

.required-icon {
  display: inline-flex;
  align-items: center;
  color: var(--ty-color-danger);
  width: 12px;
  height: 12px;
  margin-left: 4px;
  vertical-align: middle;
}

.required-icon svg {
  width: 100%;
  height: 100%;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--input-accent, var(--input-border, var(--ty-input-border)));
  border-radius: var(--ty-radius-base);
  background: var(--input-bg, var(--input-bg, var(--ty-input-bg)));
  transition: var(--ty-local-transition, all 0.15s ease-in-out);

  min-height: var(--ty-size-md);
  padding: 0 12px;
}

/* Wrapper states — --input-accent* are set by the flavor rules below;
   without a flavor attribute they're unset and the default chrome chain
   (per-instance --input-* var, then --ty-input-* token) applies. */
/* :not(.focused) — hover must never override focus. Without the guard this
   rule out-ranks .focused by specificity, so hovering a FOCUSED unflavored
   input swapped its primary focus border for the dimmer neutral hover
   border (focus ring stayed, border dimmed — read as a glitch). Same
   pattern as date-picker's :hover:not(.open). */
.input-wrapper:hover:not(.disabled):not(.focused) {
  border-color: var(--input-accent-bold, var(--input-border-hover, var(--ty-input-border-hover)));
}

.input-wrapper.focused {
  border-color: var(--input-accent-bold, var(--input-border-focus, var(--ty-input-border-focus)));
  box-shadow: 0 0 0 3px var(--input-ring, var(--input-shadow-focus, var(--ty-input-shadow-focus)));
}

.input-wrapper.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background: var(--input-disabled-bg, var(--ty-input-disabled-bg));
  border-color: var(--input-disabled-border, var(--ty-input-disabled-border));
}

::slotted([slot="start"]),
::slotted([slot="end"]) {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--ty-color-text-soft);
}

/* Password reveal toggle (rendered for type="password") */
.password-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--input-placeholder, var(--ty-input-placeholder));
  transition: var(--ty-local-transition, color 0.15s ease-in-out);
}
.password-toggle:hover {
  color: var(--input-color, var(--ty-input-color));
}
.password-toggle:focus-visible {
  outline: 2px solid var(--input-accent, var(--ty-color-primary));
  outline-offset: 2px;
  border-radius: 2px;
}
.password-toggle svg {
  width: 1rem;
  height: 1rem;
}

::slotted(ty-icon) {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}

.error-message {
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  color: var(--ty-color-danger);
  margin-top: 4px;
  padding-left: 12px;
}

.input-wrapper.error {
  border-color: var(--ty-color-danger);
  background: var(--ty-bg-danger-soft);
}

.input-wrapper.error.focused {
  border-color: var(--ty-color-danger-bold);
  box-shadow: 0 0 0 3px var(--input-shadow-focus, var(--ty-input-shadow-focus));
}

input {
  /* Linear-paired typography */
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  border: none;
  outline: none;
  background: transparent;
  color: var(--input-color, var(--ty-input-color));
  font-family: inherit;
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-weight: var(--ty-font-normal);
  padding: 0;
  margin: 0;
}

/* Remove number input spinner arrows */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input:disabled {
  cursor: not-allowed;
  color: var(--input-disabled-color, var(--ty-input-disabled-color));
}

input::placeholder {
  color: var(--input-placeholder, var(--ty-input-placeholder));
  font-weight: 400;
}

.input-wrapper.sm {
  min-height: var(--ty-size-sm);
  padding: 0 10px;
  border-radius: var(--ty-input-radius-sm, var(--ty-radius-base));
}

.input-wrapper.sm input {
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
}

.input-wrapper.md {
  min-height: var(--ty-size-md);
  padding: 0 12px;
  border-radius: var(--ty-input-radius-md, var(--ty-radius-base));
}

.input-wrapper.md input {
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
}

.input-wrapper.lg {
  min-height: var(--ty-size-lg);
  padding: 0 14px;
  border-radius: var(--ty-input-radius-lg, var(--ty-radius-base));
}

.input-wrapper.lg input {
  font-size: var(--ty-font-base);
  line-height: var(--ty-leading-base);
  letter-spacing: var(--ty-tracking-base);
}

/* Semantic flavor modifiers set --input-accent*, consumed above */
${FLAVORS.filter((f) => f !== "neutral").map((f) => inputFlavor(f)).join("")}

input:focus-visible {
  outline: none;
}

@media (prefers-contrast: high) {
  .input-wrapper {
    border-width: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .input-wrapper {
    transition: none;
  }
}

@media (max-width: 640px) {
  .input-wrapper.lg {
    min-height: 40px;
    padding: 0 12px;
  }

  .input-wrapper.lg input {
    font-size: var(--ty-font-sm);
    line-height: var(--ty-leading-sm);
    letter-spacing: var(--ty-tracking-sm);
  }

  .input-wrapper.xl {
    min-height: 44px;
    padding: 0 14px;
  }

  .input-wrapper.xl input {
    font-size: var(--ty-font-base);
    line-height: var(--ty-leading-base);
    letter-spacing: var(--ty-tracking-base);
  }
}

@media (max-width: 480px) {
  .input-wrapper.xl {
    min-height: 40px;
    padding: 0 12px;
  }

  .input-wrapper.xl input {
    font-size: var(--ty-font-sm);
    line-height: var(--ty-leading-sm);
    letter-spacing: var(--ty-tracking-sm);
  }
}
`
