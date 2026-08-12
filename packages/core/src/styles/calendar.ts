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
}

@media (max-width: 320px) {
  .calendar-container {
    gap: 0.375rem;
  }
}
`;
