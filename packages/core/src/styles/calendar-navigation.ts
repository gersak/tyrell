/** Calendar Navigation Styles */

export const calendarNavigationStyles = `
/* Theming tokens applied as var(--ty-calendar-nav-*, <default>) at point of
   use (NOT on :host) so consumers can override them from outside — this
   component is nested inside ty-calendar's shadow, so a :host default would
   block inherited overrides. --ty-calendar-accent still cascades in. */

:host([data-size="md"]) {
  --nav-btn-size: 1.875rem;
  --nav-btn-icon-size: 1.125rem;
  --nav-font-size: 1rem;
  --nav-padding: 0.5rem 0.75rem;
  --nav-default-width: 280px;
}

:host([data-size="sm"]) {
  --nav-btn-size: 1.5rem;
  --nav-btn-icon-size: 0.9375rem;
  --nav-font-size: 0.875rem;
  --nav-padding: 0.375rem 0.5rem;
  --nav-default-width: 240px;
}

:host([data-size="lg"]) {
  --nav-btn-size: 2.25rem;
  --nav-btn-icon-size: 1.25rem;
  --nav-font-size: 1.125rem;
  --nav-padding: 0.625rem 1rem;
  --nav-default-width: 360px;
}

.calendar-navigation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--nav-padding);
  font-family: inherit;
  user-select: none;
  /* --ty-calendar-width is the public knob: set it on ty-calendar (or any
     ancestor) and BOTH the nav and the day grid follow it, because custom
     properties inherit through shadow boundaries. --nav-default-width can't
     serve that role — it's declared on :host([data-size]) inside this shadow
     root, and a declaration on the element always beats a value inherited
     into it, so an outside override of it is silently dead. --nav-width
     (set inline by the width attribute) still wins over both. */
  width: var(--nav-width, var(--ty-calendar-width, var(--nav-default-width)));
  box-sizing: border-box;
}

/* Title (left) opens the month/year view; arrows (right) step months, or
   years while that view is open. */
.nav-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 0 0 auto;
}

.nav-title {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  margin-left: -0.375rem;
  padding: 0.25rem 0.375rem;
  border: none;
  border-radius: var(--ty-radius-base);
  background: transparent;
  font-family: inherit;
  font-size: var(--nav-font-size);
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  transition: var(--ty-local-transition, background-color 0.15s ease);
  outline: none;
}

.nav-title:hover,
.nav-title[aria-expanded="true"] {
  background-color: var(--ty-calendar-nav-hover-bg, var(--ty-bg-neutral-soft));
}

.nav-title:focus-visible {
  outline: 2px solid var(--ty-calendar-nav-focus-outline, var(--ty-calendar-accent, var(--ty-color-primary)));
  outline-offset: 2px;
}

.nav-title-month {
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ty-calendar-nav-title-color, var(--ty-text-strong, var(--ty-color-neutral-strong)));
}

.nav-title-year {
  font-weight: 400;
  color: var(--ty-calendar-nav-year-color, var(--ty-text-soft, var(--ty-color-neutral)));
}

.nav-caret {
  display: inline-flex;
  color: var(--ty-calendar-nav-color, var(--ty-color-neutral));
  transition: transform 0.15s ease;
}

.nav-caret svg {
  width: 1em;
  height: 1em;
  display: block;
}

.nav-title[aria-expanded="true"] .nav-caret {
  transform: rotate(180deg);
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--nav-btn-size);
  height: var(--nav-btn-size);
  padding: 0;
  border: 1px solid var(--ty-calendar-nav-border, var(--ty-border));
  border-radius: var(--ty-radius-base);
  background-color: transparent;
  color: var(--ty-calendar-nav-color, var(--ty-color-neutral-strong));
  cursor: pointer;
  transition: var(--ty-local-transition, all 0.15s ease);
  outline: none;
}

.nav-btn:hover {
  background-color: var(--ty-calendar-nav-hover-bg, var(--ty-bg-neutral-soft));
  color: var(--ty-calendar-nav-hover-color, var(--ty-color-neutral-strong));
}

.nav-btn:active {
  background-color: var(--ty-calendar-nav-active-bg, var(--ty-bg-neutral));
  transform: scale(0.95);
}

.nav-btn:disabled {
  opacity: 0.35;
  cursor: default;
  pointer-events: none;
}

.nav-btn:focus-visible {
  outline: 2px solid var(--ty-calendar-nav-focus-outline, var(--ty-calendar-accent, var(--ty-color-primary)));
  outline-offset: 2px;
}

.nav-btn svg {
  width: var(--nav-btn-icon-size);
  height: var(--nav-btn-icon-size);
  display: block;
}
`;
