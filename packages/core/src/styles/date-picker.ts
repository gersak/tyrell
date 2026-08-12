/** Date Picker Component Styles */

import { FLAVORS } from "../types/common.js";

/* Flavor rules only set --date-picker-accent (border), -accent-bold
   (hover/focus border), and -ring (focus shadow); the stub base rules
   consume them. Doubles as the per-instance override API. Neutral is
   skipped — the 'default' flavor is the unstyled --ty-date-picker-* chrome.
   Fallback flavor `fb` is used for custom flavors (suffixed tokens fall
   back to the custom base color, then neutral). */
const datePickerFlavor = (f: string, fb?: string) => {
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
  --date-picker-accent: var(--ty-input-${f}-border, ${c("-soft")});
  --date-picker-accent-bold: ${c("")};
  --date-picker-ring: color-mix(in oklab, ${c("")} 15%, transparent);
}
:host([flavor="${f}+"]) {
  --date-picker-accent: ${c("")};
  --date-picker-accent-bold: ${c("-strong")};
  --date-picker-ring: color-mix(in oklab, ${c("-strong")} 15%, transparent);
}
:host([flavor="${f}-"]) {
  --date-picker-accent: ${c("-faint")};
  --date-picker-accent-bold: ${c("-soft")};
  --date-picker-ring: color-mix(in oklab, ${c("-soft")} 15%, transparent);
}
`;
};

/** Rules for one custom (non-built-in) flavor — see utils/flavor-sheet.ts. */
export const datePickerCustomFlavorCss = (base: string) => datePickerFlavor(base, "neutral");

export const datePickerStyles = `
:host {
  display: block;
  width: auto;
  min-width: 200px;
  font-family: inherit;

  /* Theming tokens — date-picker stub. Thin shim over --ty-input-*: override
     these to retheme just the date-picker trigger, not other inputs. */
  --ty-date-picker-bg: var(--ty-input-bg);
  --ty-date-picker-color: var(--ty-input-color);
  --ty-date-picker-placeholder: var(--ty-input-placeholder);
  --ty-date-picker-border: var(--ty-input-border);
  --ty-date-picker-border-hover: var(--ty-input-border-hover);
  --ty-date-picker-border-focus: var(--ty-input-border-focus);
  --ty-date-picker-shadow-focus: var(--ty-input-shadow-focus);
  --ty-date-picker-disabled-bg: var(--ty-input-disabled-bg);
  --ty-date-picker-disabled-color: var(--ty-input-disabled-color);
  --ty-date-picker-radius: var(--ty-radius-md);

  /* Theming tokens — calendar popup surface. Shared with ty-calendar /
     ty-calendar-month theming. */
  --ty-calendar-surface-bg: var(--ty-surface-floating);
  --ty-calendar-surface-border: var(--ty-input-border);
  --ty-calendar-surface-shadow: var(--ty-shadow-lg, 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1));
  --ty-calendar-surface-radius: var(--ty-radius-lg);

  /* Theming tokens — time section */
  --ty-calendar-time-bg: transparent;
  --ty-calendar-time-border: var(--ty-border-faint);
  --ty-calendar-time-label-color: var(--ty-color-neutral);
  --ty-calendar-time-input-color: var(--ty-input-color);
  --ty-calendar-time-placeholder-color: var(--ty-input-placeholder);
  --ty-calendar-time-icon-color: var(--ty-color-neutral-soft);
}

/* Container structure (reuses dropdown patterns) */
.dropdown-container {
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
  color: #ef4444;
  width: 12px;
  height: 12px;
  vertical-align: middle;
  margin-left: 4px;
}

.dropdown-wrapper {
  position: relative;
  display: block;
  width: 100%;
}

.date-picker-stub ::slotted([slot="start"]) {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 0.5rem;
  color: var(--ty-color-text-soft);
}

.date-picker-stub ::slotted(ty-icon[slot="start"]) {
  width: 1em;
  height: 1em;
}

.date-picker-stub {
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  background: var(--ty-date-picker-bg);
  color: var(--ty-date-picker-color);
  border: 1px solid var(--date-picker-accent, var(--ty-date-picker-border));
  border-radius: var(--ty-date-picker-radius);
  font-family: inherit;
  font-size: var(--ty-font-sm);
  font-weight: var(--ty-font-normal);
  line-height: var(--ty-line-height-tight);
  min-height: var(--ty-size-md);
  padding: var(--ty-spacing-2) var(--ty-spacing-3);
  padding-right: calc(var(--ty-spacing-3) + 1rem + var(--ty-spacing-2));
  transition: var(--ty-transition-all), opacity 0.2s ease;
  outline: none;
}

.date-picker-stub:hover:not([disabled]):not(.open) {
  border-color: var(--date-picker-accent-bold, var(--ty-date-picker-border-hover));
}

.date-picker-stub[disabled] {
  background-color: var(--ty-date-picker-disabled-bg);
  color: var(--ty-date-picker-disabled-color);
  cursor: not-allowed;
  opacity: 0.6;
}

.date-picker-stub:focus,
.date-picker-stub.open {
  border-color: var(--date-picker-accent-bold, var(--ty-date-picker-border-focus));
  box-shadow: 0 0 0 3px var(--date-picker-ring, var(--ty-date-picker-shadow-focus));
}

.date-picker-stub.sm {
  min-height: var(--ty-size-sm);
  font-size: var(--ty-font-xs);
  padding: var(--ty-spacing-1) var(--ty-spacing-2);
  padding-right: calc(var(--ty-spacing-2) + 0.875rem + var(--ty-spacing-1));
}

.date-picker-stub.lg {
  min-height: var(--ty-size-lg);
  font-size: var(--ty-font-base);
  padding: var(--ty-spacing-2) var(--ty-spacing-4);
  padding-right: calc(var(--ty-spacing-4) + 1.125rem + var(--ty-spacing-2));
}

/* Flavor variants — set --date-picker-accent*, consumed by the stub rules above */
${FLAVORS.filter((f) => f !== "neutral").map((f) => datePickerFlavor(f)).join("")}

.stub-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  color: inherit;
  pointer-events: none;
}

.stub-text.placeholder {
  color: var(--ty-date-picker-placeholder);
}

.stub-icons {
  display: flex;
  align-items: center;
  gap: var(--ty-spacing-1);
  position: absolute;
  right: var(--ty-spacing-3);
  top: 50%;
  transform: translateY(-50%);
  height: 1rem;
  pointer-events: none;
  z-index: 2;
}

.stub-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--ty-color-neutral-soft);
  cursor: pointer;
  border-radius: var(--ty-radius-sm);
  transition: var(--ty-local-transition, all 0.15s ease);
  pointer-events: auto;
}

.stub-clear:hover {
  /* Clear is a destructive utility action, not the field's semantic flavor
     — it stays neutral at rest and always warns danger-red on hover,
     regardless of the field's own flavor. (--ty-color-negative/
     --ty-bg-negative-faint used here previously don't exist as tokens —
     this silently fell back to unstyled inherited color.) */
  color: var(--ty-color-danger);
  background-color: var(--ty-bg-danger-soft);
}

.stub-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  color: var(--date-picker-accent, var(--ty-color-neutral-soft));
}

.date-picker-stub:hover .stub-arrow {
  color: var(--date-picker-accent-bold, var(--ty-color-neutral));
}

.date-picker-stub:focus .stub-arrow,
.date-picker-stub.open .stub-arrow {
  color: var(--date-picker-accent-bold, var(--ty-date-picker-border-focus));
}

/* Calendar dialog (showModal positioning system) */
.calendar-dialog {
  position: fixed;
  flex-direction: column;
  max-width: 90vw;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  box-sizing: border-box;
  padding: var(--calendar-padding, 8px);

  opacity: 0;
  transition: opacity 200ms ease;

  transform: translate(var(--calendar-offset-x, 0px), var(--calendar-offset-y, 0px));
  top: -1000px;
  left: -1000px;
}

.calendar-dialog.position-below {
  left: var(--calendar-x);
  top: var(--calendar-y);
}

.calendar-dialog.position-above {
  left: var(--calendar-x);
  bottom: var(--calendar-y);
  top: auto;
  flex-direction: column-reverse;
}

.calendar-dialog.open {
  opacity: 1;
}

.calendar-dialog::backdrop {
  background: transparent
}

.calendar-content {
  background-color: var(--ty-calendar-surface-bg);
  border: 1px solid var(--ty-calendar-surface-border);
  border-radius: var(--ty-calendar-surface-radius);
  box-shadow: var(--ty-calendar-surface-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Native input is invisible — used only to trigger the OS picker */
.native-date-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  cursor: pointer;
  z-index: 1;
}

.native-date-input::-webkit-calendar-picker-indicator {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  cursor: pointer;
}

.time-section {
  display: flex;
  min-height: 2.5rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--ty-calendar-time-border);
  background-color: var(--ty-calendar-time-bg);
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.time-label {
  font-size: var(--ty-font-sm);
  font-weight: 500;
  color: var(--ty-calendar-time-label-color);
  flex-shrink: 0;
}

.time-input {
  width: 3.5rem;
  border: 1px solid var(--ty-input-border);
  border-radius: var(--ty-radius-sm);
  background: var(--ty-input-bg);
  color: var(--ty-calendar-time-input-color);
  font-family: inherit;
  font-size: var(--ty-font-sm);
  font-variant-numeric: tabular-nums;
  text-align: center;
  padding: 0.25rem 0.375rem;
  outline: none;
  transition: var(--ty-transition-all);
}

.time-input:focus {
  border-color: var(--ty-input-border-focus);
  box-shadow: 0 0 0 3px var(--ty-input-shadow-focus);
}

.time-input::placeholder {
  color: var(--ty-calendar-time-placeholder-color);
}

.time-icon {
  display: flex;
  align-items: center;
  color: var(--ty-calendar-time-icon-color);
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
`;
