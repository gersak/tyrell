/**
 * Calendar Month Styles
 * Improved design with better visual hierarchy and size variants
 */

export const calendarMonthStyles = `
/* ============================================================================
   Theming Tokens
   Override these to retheme the calendar without touching the global palette.
   Defaults chain back to the global --ty-color-* / --ty-bg-* / --ty-border tokens.
   ============================================================================ */

:host {
  /* Accent aliases — override these three for thin retheming */
  --ty-calendar-accent: var(--ty-color-primary);
  --ty-calendar-today-accent: var(--ty-color-secondary);
  --ty-calendar-muted: var(--ty-color-neutral);

  /* Header (weekday names) */
  --ty-calendar-header-color: var(--ty-color-neutral-strong);

  /* Day cell — base */
  --ty-calendar-day-color: var(--ty-calendar-muted);
  --ty-calendar-day-bg: transparent;
  --ty-calendar-day-border: var(--ty-border);
  --ty-calendar-day-radius: 0.375rem;

  /* Day cell — hover */
  --ty-calendar-day-hover-color: var(--ty-color-neutral-strong);
  --ty-calendar-day-hover-bg: var(--ty-bg-neutral-soft);
  --ty-calendar-day-hover-border: var(--ty-border-bold);

  /* Today */
  --ty-calendar-today-color: var(--ty-color-secondary-strong);
  --ty-calendar-today-bg: var(--ty-bg-secondary-soft);
  --ty-calendar-today-border: var(--ty-calendar-today-accent);

  /* Selected */
  --ty-calendar-selected-color: var(--ty-color-primary-strong);
  --ty-calendar-selected-bg: var(--ty-bg-primary);
  --ty-calendar-selected-border: var(--ty-calendar-accent);
  --ty-calendar-selected-hover-bg: var(--ty-bg-primary-bold);
  --ty-calendar-selected-hover-border: var(--ty-color-primary-bold);

  /* Modifier states */
  --ty-calendar-weekend-color: var(--ty-color-danger-soft);
  --ty-calendar-other-month-color: var(--ty-color-neutral-faint);
  --ty-calendar-other-month-opacity: 0.5;
}

/* ============================================================================
   Base Calendar Container
   ============================================================================ */

.calendar-flex-container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 0;
  padding: 0.75rem;
  border-radius: 0.5rem;
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
  color: var(--ty-calendar-header-color);
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
  font-weight: 600;
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

  /* Visual */
  border-radius: var(--ty-calendar-day-radius);
  border: 1px solid var(--ty-calendar-day-border);
  background-color: var(--ty-calendar-day-bg);
  color: var(--ty-calendar-day-color);
  cursor: pointer;
  transition: all 0.15s ease;

  /* Typography */
  font-weight: 400;
}

/* Hover State - Stronger Feedback */
.calendar-day-cell:hover {
  color: var(--ty-calendar-day-hover-color);
  background-color: var(--ty-calendar-day-hover-bg);
  border-color: var(--ty-calendar-day-hover-border);
}

/* ============================================================================
   Day States
   ============================================================================ */

/* Today - Strong Visual Indicator */
.calendar-day-cell.today {
  background-color: var(--ty-calendar-today-bg);
  color: var(--ty-calendar-today-color);
  border-color: var(--ty-calendar-today-border);
  font-weight: 600;
}

/* Weekend - Subtle Color Shift */
.calendar-day-cell.weekend {
  color: var(--ty-calendar-weekend-color);
}

/* Other Month - Muted */
.calendar-day-cell.other-month {
  color: var(--ty-calendar-other-month-color);
  opacity: var(--ty-calendar-other-month-opacity);
}

.calendar-day-cell.other-month:hover { 
  color: var(--ty-calendar-day-hover-color);
  background-color: var(--ty-calendar-day-hover-bg);
  opacity: 0.7;
}

/* Selected State (for custom usage) */
.calendar-day-cell.selected {
  background-color: var(--ty-calendar-selected-bg);
  color: var(--ty-calendar-selected-color);
  border-color: var(--ty-calendar-selected-border);
  font-weight: 600;
}

.calendar-day-cell.selected:hover {
  background-color: var(--ty-calendar-selected-hover-bg);
  border-color: var(--ty-calendar-selected-hover-border);
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
`;
