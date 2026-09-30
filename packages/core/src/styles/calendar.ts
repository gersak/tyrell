/**
 * Calendar Orchestration Styles
 * Container for navigation + month display, plus the month/year grid
 * ty-calendar shows in place of the day grid.
 */

import { calendarMonthFlavorCss } from './calendar-month.js';

const selectedBg = 'var(--ty-calendar-selected-bg, var(--ty-calendar-accent, var(--calendar-month-selected-bg, var(--ty-solid-primary, var(--ty-color-primary)))))';
const selectedFg = 'var(--ty-calendar-selected-color, var(--calendar-month-selected-color, var(--ty-solid-primary-fg, white)))';

export const calendarStyles = `
.calendar-container {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  box-sizing: border-box;
  font-family: inherit;
}

@media (max-width: 320px) {
  .calendar-container {
    gap: 0.375rem;
  }
}

/* Month/year view: 3 x 4 months. min-height is set inline to the day
   grid's height, so the popup doesn't jump when the view flips. */
.month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 1fr;
  gap: 0.375rem;
  box-sizing: border-box;
  padding: 0.75rem;
  min-width: 280px;
  width: var(--calendar-width, auto);
}

.month-grid.size-sm { padding: 0.5rem; min-width: 240px; gap: 0.25rem; }
.month-grid.size-lg { padding: 1rem; min-width: 360px; gap: 0.5rem; }

.month-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0;
  border: none;
  border-radius: var(--ty-calendar-day-radius, 0.5rem);
  background: transparent;
  color: var(--ty-calendar-day-color, var(--ty-text));
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  outline: none;
  transition: var(--ty-local-transition, background-color 0.15s ease, color 0.15s ease);
}

.month-grid.size-sm .month-cell { font-size: 0.75rem; min-height: 2rem; }
.month-grid.size-lg .month-cell { font-size: 1rem; min-height: 3rem; }

.month-cell:hover {
  color: var(--ty-calendar-day-hover-color, var(--ty-text-strong));
  background-color: var(--ty-calendar-day-hover-bg, var(--ty-bg-neutral));
  font-weight: 500;
}

.month-cell:focus-visible {
  box-shadow: 0 0 0 2px var(--calendar-month-accent, var(--ty-color-primary));
}

/* Current month: accent + dot, like today in the day grid */
.month-cell.current {
  color: var(--ty-calendar-today-color, var(--ty-calendar-today-accent, var(--calendar-month-accent, var(--ty-color-primary))));
  font-weight: 600;
}

.month-cell.current::after {
  content: "";
  position: absolute;
  top: calc(50% + 0.72em);
  left: 50%;
  width: 4px;
  height: 4px;
  margin-left: -2px;
  border-radius: 50%;
  background: currentColor;
}

.month-cell.selected {
  background-color: ${selectedBg};
  color: ${selectedFg};
  font-weight: 600;
}

.month-cell.selected:hover {
  background-color: var(--ty-calendar-selected-hover-bg, var(--calendar-month-selected-hover-bg, color-mix(in oklab, ${selectedBg} 85%, ${selectedFg})));
}

.month-cell:disabled {
  color: var(--ty-calendar-disabled-color, var(--ty-text-faint));
  opacity: var(--ty-calendar-disabled-opacity, 0.7);
  text-decoration: line-through;
  text-decoration-color: color-mix(in oklab, currentColor 60%, transparent);
  cursor: default;
  pointer-events: none;
}

${calendarMonthFlavorCss}
`;
