/** Calendar Month Styles */

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
  const solid = (s: string) =>
    fb
      ? `var(--ty-solid-${f}${s}, var(--ty-solid-${fb}${s}))`
      : `var(--ty-solid-${f}${s})`;
  /* Selected is a solid fill on the same tokens as a solid button, so a
     selected day and a primary button always match. Hover for the +/-
     tones (no dedicated -hover token) mixes the fill toward its own
     foreground: darker in light mode, lighter in dark mode. */
  return `
:host([flavor="${f}"]) {
  --calendar-month-accent: ${color("")};
  --calendar-month-selected-bg: ${solid("")};
  --calendar-month-selected-color: ${solid("-fg")};
  --calendar-month-selected-hover-bg: ${solid("-hover")};
}
:host([flavor="${f}+"]) {
  --calendar-month-accent: ${color("-strong")};
  --calendar-month-selected-bg: ${solid("-strong")};
  --calendar-month-selected-color: ${solid("-strong-fg")};
  --calendar-month-selected-hover-bg: color-mix(in oklab, ${solid("-strong")} 85%, ${solid("-strong-fg")});
}
:host([flavor="${f}-"]) {
  --calendar-month-accent: ${color("-soft")};
  --calendar-month-selected-bg: ${solid("-soft")};
  --calendar-month-selected-color: ${solid("-soft-fg")};
  --calendar-month-selected-hover-bg: color-mix(in oklab, ${solid("-soft")} 85%, ${solid("-soft-fg")});
}
`;
};

/** Built-in flavor rules — also used by ty-calendar's month/year grid, so
    the selected month and the selected day share one fill. */
export const calendarMonthFlavorCss = FLAVORS.map((f) => calendarMonthFlavor(f)).join("");

/** Rules for one custom (non-built-in) flavor — see utils/flavor-sheet.ts. */
export const calendarMonthCustomFlavorCss = (base: string) => calendarMonthFlavor(base, "neutral");

export const calendarMonthStyles = `
/* Theming tokens are applied as var(--ty-calendar-*, <default>) at point
   of use (not declared on :host) so consumers can override any of them
   from outside the shadow root. The 3 accent aliases — --ty-calendar-accent,
   --ty-calendar-today-accent, --ty-calendar-muted — still cascade into the
   derived defaults, so overriding one retints the related cells. */

.calendar-flex-container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 0;
  padding: 0.75rem;
  border-radius: var(--ty-radius-md);
  font-family: inherit;
  user-select: none;
  width: var(--calendar-width, fit-content);
  /* Same public knob the nav reads — one value sizes the whole calendar. */
  min-width: var(--ty-calendar-width, 280px);
  max-width: var(--calendar-max-width, none);
}

/* Rows: header + 6 day rows */
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

.calendar-cell {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  position: relative;
  box-sizing: border-box;
}

.calendar-header-cell {
  text-align: center;
  font-weight: 500;
  padding: 0.25rem;
}

.calendar-day-cell {
  aspect-ratio: 1;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  margin: 0.125rem;

  /* Visual: ghost cells — no boxes; the border is a theming hook only */
  border-radius: var(--ty-calendar-day-radius, 0.5rem);
  border: 1px solid var(--ty-calendar-day-border, transparent);
  background-color: var(--ty-calendar-day-bg, transparent);
  color: var(--ty-calendar-day-color, var(--ty-calendar-muted, var(--ty-text)));
  cursor: pointer;
  transition: var(--ty-local-transition, background-color 0.15s ease, color 0.15s ease);

  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

/* Hover: a visible neutral pill, no border flash */
.calendar-day-cell:hover {
  color: var(--ty-calendar-day-hover-color, var(--ty-text-strong));
  background-color: var(--ty-calendar-day-hover-bg, var(--ty-bg-neutral));
  border-color: var(--ty-calendar-day-hover-border, transparent);
  font-weight: 500;
}

/* Keyboard focus ring (roving tabindex — see calendar-month.ts's render()).
   :focus-visible, not :focus, so mouse/pointerdown activation doesn't flash
   a ring; only Tab-in / arrow-key navigation does. */
.calendar-day-cell:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--calendar-month-accent, var(--ty-color-primary));
}

/* Today: accent number plus a dot under it (built-in content only). The dot
   is currentColor, so it turns light on the selected fill. */
.calendar-day-cell.today {
  background-color: var(--ty-calendar-today-bg, transparent);
  color: var(--ty-calendar-today-color, var(--ty-calendar-today-accent, var(--calendar-month-accent, var(--ty-color-primary))));
  border-color: var(--ty-calendar-today-border, transparent);
  font-weight: 600;
}

.calendar-day-cell.today:hover {
  background-color: var(--ty-calendar-day-hover-bg, var(--ty-bg-neutral));
}

.calendar-day-cell.today.default-content::after {
  content: "";
  position: absolute;
  /* Anchored to the number (em), not the cell, so the gap holds at every size */
  top: calc(50% + 0.72em);
  left: 50%;
  width: 4px;
  height: 4px;
  margin-left: -2px;
  border-radius: 50%;
  background: currentColor;
}

/* Weekend: no distinction by default (hook kept for theming) */
.calendar-day-cell.weekend {
  color: var(--ty-calendar-weekend-color, var(--ty-calendar-day-color, var(--ty-text)));
}

/* Other month: recedes at rest, comes back on hover. Deliberately below the
   4.5:1 text minimum — these days are secondary context (the current month
   is the content), and they stay clickable. Override with
   --ty-calendar-other-month-color for a stronger value. */
.calendar-day-cell.other-month {
  color: var(--ty-calendar-other-month-color, color-mix(in oklab, var(--ty-text-faint) 65%, transparent));
}

.calendar-day-cell.other-month:hover {
  color: var(--ty-calendar-day-hover-color, var(--ty-text-soft, var(--ty-text-)));
  background-color: var(--ty-calendar-day-hover-bg, var(--ty-bg-neutral-soft));
}

/* Disabled - outside min/max bounds */
/* Out of min/max range: still legible (so the range reads at a glance),
   struck through so it can't be mistaken for an adjacent-month day. */
.calendar-day-cell.disabled {
  color: var(--ty-calendar-disabled-color, var(--ty-text-faint));
  opacity: var(--ty-calendar-disabled-opacity, 0.7);
  text-decoration: line-through;
  text-decoration-color: color-mix(in oklab, currentColor 60%, transparent);
  cursor: default;
  pointer-events: none;
}

/* Selected: the one strong element in the grid — a solid fill on the solid
   button tokens. Override order: --ty-calendar-selected-bg, then
   --ty-calendar-accent, then flavor, then primary. Hover darkens the fill
   and keeps the shape (no border swap). */
.calendar-day-cell.selected {
  background-color: var(--ty-calendar-selected-bg, var(--ty-calendar-accent, var(--calendar-month-selected-bg, var(--ty-solid-primary, var(--ty-color-primary)))));
  color: var(--ty-calendar-selected-color, var(--calendar-month-selected-color, var(--ty-solid-primary-fg, white)));
  border-color: var(--ty-calendar-selected-border, transparent);
  font-weight: 600;
}

.calendar-day-cell.selected:hover {
  background-color: var(--ty-calendar-selected-hover-bg, var(--calendar-month-selected-hover-bg, color-mix(in oklab, var(--ty-calendar-selected-bg, var(--ty-calendar-accent, var(--calendar-month-selected-bg, var(--ty-solid-primary, var(--ty-color-primary))))) 85%, var(--ty-calendar-selected-color, var(--calendar-month-selected-color, var(--ty-solid-primary-fg, white))))));
  color: var(--ty-calendar-selected-color, var(--calendar-month-selected-color, var(--ty-solid-primary-fg, white)));
  border-color: var(--ty-calendar-selected-hover-border, var(--ty-calendar-selected-border, transparent));
}

.calendar-day-cell.selected.other-month {
  opacity: 0.7;
}

.calendar-size-sm {
  padding: 0.5rem;
  min-width: var(--ty-calendar-width, 240px);
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

.calendar-size-md {
  padding: 0.75rem;
  min-width: var(--ty-calendar-width, 280px);
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

.calendar-size-lg {
  padding: 1rem;
  min-width: var(--ty-calendar-width, 360px);
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

/* Kept for backwards compatibility */
.calendar-day {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

/* Flavor variants set --calendar-month-*, consumed above */
${calendarMonthFlavorCss}
`;
