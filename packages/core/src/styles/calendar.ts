/**
 * Calendar Orchestration Styles
 * Simple container for navigation + month display
 */

export const calendarStyles = `
.calendar-container {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  box-sizing: border-box;
  font-family: inherit;
  /* Nav is a fixed width and the grid is fit-content, so in any host wider
     than them (a popup, a stretched cell) the default stretch alignment
     left-pinned both. Centring keeps the block centred in whatever space it
     gets — without widening the calendar itself to fill it. */
  align-items: center;
}

@media (max-width: 320px) {
  .calendar-container {
    gap: 0.375rem;
  }
}
`;
