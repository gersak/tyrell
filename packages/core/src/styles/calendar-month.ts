/**
 * Calendar Month Styles
 * Improved design with better visual hierarchy and size variants
 */

import { FLAVORS } from "../types/common.js";

/* Flavor rules set --calendar-month-* local vars, wired in as the fallback
   BEHIND every existing --ty-calendar-* public override (so those keep
   working exactly as before) and AHEAD of the hardcoded primary default.
   Doubles as the per-instance override API for a specific flavor: e.g.
   `ty-calendar-month { --calendar-month-accent: ... }`. Fallback flavor
   `fb` is used for custom flavors so missing tokens degrade to neutral. */
const calendarMonthFlavor = (f: string, fb?: string) => {
  const color = (s: string) =>
    fb
      ? `var(--ty-color-${f}${s}, var(--ty-color-${fb}${s}))`
      : `var(--ty-color-${f}${s})`;
  const bg = (s: string) =>
    fb
      ? `var(--ty-bg-${f}${s}, var(--ty-bg-${fb}${s}))`
      : `var(--ty-bg-${f}${s})`;
  return `
:host([flavor="${f}"]) {
  --calendar-month-accent: ${color("")};
  --calendar-month-selected-bg: ${bg("")};
  --calendar-month-selected-color: ${color("-strong")};
  --calendar-month-selected-hover-bg: ${bg("-bold")};
}
:host([flavor="${f}+"]) {
  --calendar-month-accent: ${color("-strong")};
  --calendar-month-selected-bg: ${bg("-bold")};
  --calendar-month-selected-color: ${color("-strong")};
  --calendar-month-selected-hover-bg: ${bg("-bold")};
}
:host([flavor="${f}-"]) {
  --calendar-month-accent: ${color("-soft")};
  --calendar-month-selected-bg: ${bg("-soft")};
  --calendar-month-selected-color: ${color("")};
  --calendar-month-selected-hover-bg: ${bg("")};
}
`;
};

/** Rules for one custom (non-built-in) flavor — see utils/flavor-sheet.ts. */
export const calendarMonthCustomFlavorCss = (base: string) => calendarMonthFlavor(base, "neutral");

export const calendarMonthStyles = `
/* ============================================================================
   Theming Tokens
   Override these to retheme the calendar without touching the global palette.
   Defaults chain back to the global --ty-color-* / --ty-bg-* / --ty-border tokens.
   ============================================================================ */

/* Theming tokens are applied as var(--ty-calendar-*, <default>) at point
   of use (not declared on :host) so consumers can override any of them
   from outside the shadow root. The 3 accent aliases — --ty-calendar-accent,
   --ty-calendar-today-accent, --ty-calendar-muted — still cascade into the
   derived defaults, so overriding one retints the related cells. */

/* ============================================================================
   Base Calendar Container
   ============================================================================ */

.calendar-flex-container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 0;
  padding: 0.75rem;
  border-radius: var(--ty-radius-md);
  font-family: system-ui, sans-serif;
  user-select: none;
  width: var(--calendar-width, fit-content);
  min-width: 280px;
  max-width: var(--calendar-max-width, none);
}

/* ============================================================================
   Rows (Header + 6 Day Rows)
   ============================================================================ */

.calendar-row {
  display: flex;
  flex: 1;
  min-height: 0;
}

.calendar-header-row {
  flex: 0 0 auto;
  color: var(--ty-calendar-header-color, var(--ty-color-neutral-soft));
}

.calendar-day-row {
  flex: 1;
  min-height: 2rem;
  margin-bottom: 0.125rem;
}

/* ============================================================================
   Base Cell Styles
   ============================================================================ */

.calendar-cell {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  position: relative;
  box-sizing: border-box;
}

/* ============================================================================
   Header Cells
   ============================================================================ */

.calendar-header-cell {
  text-align: center;
  font-weight: 500;
  text-transform: uppercase;
  padding: 0.25rem;
  letter-spacing: 0.05em;
}

/* ============================================================================
   Day Cells - Square with Better Visual Hierarchy
   ============================================================================ */

.calendar-day-cell {
  /* Square cells */
  aspect-ratio: 1;

  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  /* Spacing */
  margin: 0.125rem;

  /* Visual: ghost cells — no boxes; the border is a theming hook only */
  border-radius: var(--ty-calendar-day-radius, 0.5rem);
  border: 1px solid var(--ty-calendar-day-border, transparent);
  background-color: var(--ty-calendar-day-bg, transparent);
  color: var(--ty-calendar-day-color, var(--ty-calendar-muted, var(--ty-text)));
  cursor: pointer;
  transition: var(--ty-local-transition, background-color 0.15s ease, color 0.15s ease);

  /* Typography */
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

/* Hover: soft rounded pill, no border flash */
.calendar-day-cell:hover {
  color: var(--ty-calendar-day-hover-color, var(--ty-text-strong));
  background-color: var(--ty-calendar-day-hover-bg, var(--ty-bg-neutral-soft));
  border-color: var(--ty-calendar-day-hover-border, transparent);
}

/* Keyboard focus ring (roving tabindex — see calendar-month.ts's render()).
   :focus-visible, not :focus, so mouse/pointerdown activation doesn't flash
   a ring; only Tab-in / arrow-key navigation does. */
.calendar-day-cell:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--calendar-month-accent, var(--ty-color-primary));
}

/* ============================================================================
   Day States
   ============================================================================ */

/* Today: accent number, no slab — never collides with hover, and the
   selected pill wins when today is picked */
.calendar-day-cell.today {
  background-color: var(--ty-calendar-today-bg, transparent);
  color: var(--ty-calendar-today-color, var(--ty-calendar-today-accent, var(--calendar-month-accent, var(--ty-color-primary))));
  border-color: var(--ty-calendar-today-border, transparent);
  font-weight: 600;
}

/* Weekend: no distinction by default (hook kept for theming) */
.calendar-day-cell.weekend {
  color: var(--ty-calendar-weekend-color, var(--ty-calendar-day-color, var(--ty-text)));
}

/* Other Month - Muted.
   Was color: var(--ty-color-neutral-faint) at opacity 0.5 — -faint alone is
   only ~2.5:1 against the content surface (already under the 4.5:1 AA text
   minimum), and blending it toward the background via opacity made it
   worse (~1.5:1 in light mode). --ty-calendar-other-month-color is its own
   token (tyrell.css :root / html.dark) calibrated to actually pass, with
   opacity dropped rather than layered on top. */
.calendar-day-cell.other-month {
  color: var(--ty-calendar-other-month-color, #6b7280);
}

.calendar-day-cell.other-month:hover { 
  color: var(--ty-calendar-day-hover-color, var(--ty-color-neutral-strong));
  background-color: var(--ty-calendar-day-hover-bg, var(--ty-bg-neutral-soft));
  opacity: 0.7;
}

/* Disabled - outside min/max bounds */
.calendar-day-cell.disabled {
  color: var(--ty-calendar-disabled-color, var(--ty-color-neutral-faint));
  opacity: var(--ty-calendar-disabled-opacity, 0.35);
  cursor: default;
  pointer-events: none;
}

/* Selected: the one strong element in the grid */
.calendar-day-cell.selected {
  background-color: var(--ty-calendar-selected-bg, var(--calendar-month-selected-bg, var(--ty-bg-primary)));
  color: var(--ty-calendar-selected-color, var(--calendar-month-selected-color, var(--ty-color-primary-strong)));
  border-color: var(--ty-calendar-selected-border, var(--ty-calendar-accent, var(--calendar-month-accent, transparent)));
  font-weight: 600;
}

.calendar-day-cell.selected:hover {
  background-color: var(--ty-calendar-selected-hover-bg, var(--calendar-month-selected-hover-bg, var(--ty-bg-primary-bold)));
  border-color: var(--ty-calendar-selected-hover-border, transparent);
}

.calendar-day-cell.selected.other-month {
  opacity: 0.7;
}

/* ============================================================================
   Size Variants
   ============================================================================ */

/* Small - Compact (240px min-width) */
.calendar-size-sm {
  padding: 0.5rem;
  min-width: 240px;
}

.calendar-size-sm .calendar-header-cell {
  font-size: 0.625rem;
  padding: 0.125rem;
}

.calendar-size-sm .calendar-day-cell {
  font-size: 0.75rem;
  margin: 0.0625rem;
}

.calendar-size-sm .calendar-day-row {
  min-height: 1.5rem;
}

/* Medium - Default (280px min-width) */
.calendar-size-md {
  padding: 0.75rem;
  min-width: 280px;
}

.calendar-size-md .calendar-header-cell {
  font-size: 0.6875rem;
  padding: 0.25rem;
}

.calendar-size-md .calendar-day-cell {
  font-size: 0.8125rem;
  margin: 0.125rem;
}

.calendar-size-md .calendar-day-row {
  min-height: 2rem;
}

/* Large - Spacious (360px min-width) */
.calendar-size-lg {
  padding: 1rem;
  min-width: 360px;
}

.calendar-size-lg .calendar-header-cell {
  font-size: 0.75rem;
  padding: 0.375rem;
}

.calendar-size-lg .calendar-day-cell {
  font-size: 0.875rem;
  margin: 0.1875rem;
}

.calendar-size-lg .calendar-day-row {
  min-height: 2.5rem;
}

/* ============================================================================
   Backwards Compatibility
   ============================================================================ */

.calendar-day {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

/* ============================================================================
   Flavor Variants (set --calendar-month-*, consumed above)
   ============================================================================ */
${FLAVORS.map((f) => calendarMonthFlavor(f)).join("")}
`;
