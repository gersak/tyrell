/**
 * Copy Component Styles
 * Read-only field with copy-to-clipboard functionality
 * Extends input styles with copy-specific styling
 */

import { FLAVORS } from "../types/common.js";

/* Flavor rules only set --copy-color (button), --copy-color-hover, and
   --copy-bg-hover (wrapper hover); the base rules below consume them.
   Doubles as the per-instance override API. Fallback flavor `fb` is used
   for custom flavors so missing tokens degrade to neutral. */
const copyFlavor = (f: string, fb?: string) => {
  const c = (s: string) =>
    fb
      ? `var(--ty-color-${f}${s}, var(--ty-color-${fb}${s}))`
      : `var(--ty-color-${f}${s})`;
  const bg = (s: string) =>
    fb
      ? `var(--ty-bg-${f}${s}, var(--ty-bg-${fb}${s}))`
      : `var(--ty-bg-${f}${s})`;
  return `
:host([flavor="${f}"])  { --copy-color: ${c("")}; --copy-color-hover: ${c("-strong")}; --copy-bg-hover: ${bg("-soft")}; }
:host([flavor="${f}+"]) { --copy-color: ${c("-strong")}; --copy-color-hover: ${c("-strong")}; --copy-bg-hover: ${bg("-soft")}; }
:host([flavor="${f}-"]) { --copy-color: ${c("-soft")}; --copy-color-hover: ${c("")}; --copy-bg-hover: ${bg("-soft")}; }
`;
};

/** Rules for one custom (non-built-in) flavor — see utils/flavor-sheet.ts. */
export const copyCustomFlavorCss = (base: string) => copyFlavor(base, "neutral");

export const copyStyles = `
/* Copy field value display */
.copy-field-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

/* Multiline variant */
.copy-field-value.multiline {
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

/* Keep the copy button pinned to the top-right when content wraps to multiple lines */
.input-wrapper:has(.copy-field-value.multiline) {
  align-items: flex-start;
  padding-top: 8px;
  padding-bottom: 8px;
}

/* Horizontal scroll variant - scroll long content instead of clipping with ellipsis */
.copy-field-value.horizontal-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  text-overflow: clip;
  white-space: nowrap;
}

/* Multiline + horizontal scroll (e.g. code blocks): preserve lines, scroll both axes */
.copy-field-value.multiline.horizontal-scroll {
  white-space: pre;
  word-break: normal;
  overflow-y: auto;
}

/* Hide scrollbars on scrollable value - content still scrolls, chrome stays clean */
.copy-field-value.multiline,
.copy-field-value.horizontal-scroll {
  scrollbar-width: none; /* Firefox */
}
.copy-field-value.multiline::-webkit-scrollbar,
.copy-field-value.horizontal-scroll::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* Code format */
.copy-field-value {
  font-size: 0.8em;
}

/* Hover state — flavor-soft background (primary by default) */
.input-wrapper:not(.disabled):hover {
  background: var(--copy-bg-hover, var(--ty-bg-primary-soft));
  transition: var(--ty-local-transition, background 0.2s ease);
}

/* Copy button */
.copy-button {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--copy-color, var(--ty-text-soft));
  transition: var(--ty-local-transition, color 0.2s ease, transform 0.2s ease);
  padding: 0;
  margin: 0;
}

.copy-button:hover:not(.disabled) {
  color: var(--copy-color-hover, var(--ty-text));
  transform: scale(1.1);
}

.copy-button.success {
  color: var(--ty-color-success);
  animation: copy-feedback 0.3s ease;
}

.copy-button.error {
  color: var(--ty-color-danger);
  animation: copy-feedback 0.3s ease;
}

@keyframes copy-feedback {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.copy-button svg {
  width: 18px;
  height: 18px;
}

.input-wrapper.disabled .copy-button {
  cursor: not-allowed;
  opacity: 0.5;
}

.input-wrapper.disabled {
  cursor: not-allowed;
}

/* ===== SEMANTIC FLAVORS (set --copy-*, consumed above) ===== */
${FLAVORS.map((f) => copyFlavor(f)).join("")}
`
