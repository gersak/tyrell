/**
 * Calendar Navigation Styles
 * Clean, modern design with proper visual hierarchy and size variants
 */

export const calendarNavigationStyles = `
/* ============================================================================
   Size Variants (CSS Custom Properties)
   ============================================================================ */

/* Theming tokens applied as var(--ty-calendar-nav-*, <default>) at point of
   use (NOT on :host) so consumers can override them from outside — this
   component is nested inside ty-calendar's shadow, so a :host default would
   block inherited overrides. --ty-calendar-accent still cascades in. */

:host([data-size="md"]) {
  --nav-btn-size: 2rem;
  --nav-btn-icon-size: 1.25rem;
  --nav-font-size: 1rem;
  --nav-padding: 0.5rem 0.75rem;
  --nav-default-width: 280px;
}

:host([data-size="sm"]) {
  --nav-btn-size: 1.5rem;
  --nav-btn-icon-size: 1rem;
  --nav-font-size: 0.875rem;
  --nav-padding: 0.375rem 0.5rem;
  --nav-default-width: 240px;
}

:host([data-size="lg"]) {
  --nav-btn-size: 2.5rem;
  --nav-btn-icon-size: 1.5rem;
  --nav-font-size: 1.125rem;
  --nav-padding: 0.625rem 1rem;
  --nav-default-width: 360px;
}

/* ============================================================================
   Main Navigation Header
   ============================================================================ */

.calendar-navigation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--nav-padding);
  font-family: system-ui, sans-serif;
  user-select: none;
  width: var(--nav-width, var(--nav-default-width));
  box-sizing: border-box;
}

/* ============================================================================
   Navigation Groups (Left, Center, Right)
   ============================================================================ */

.nav-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-group-left,
.nav-group-right {
  flex: 0 0 auto;
}

.nav-group-center {
  flex: 1;
  justify-content: center;
}

/* ============================================================================
   Navigation Buttons
   ============================================================================ */

.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--nav-btn-size);
  height: var(--nav-btn-size);
  padding: 0;
  border: none;
  border-radius: var(--ty-radius-base);
  background-color: transparent;
  color: var(--ty-calendar-nav-color, var(--ty-color-neutral));
  cursor: pointer;
  transition: all 0.15s ease;
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

/* SVG sizing */
.nav-btn svg {
  width: var(--nav-btn-icon-size);
  height: var(--nav-btn-icon-size);
  display: block;
}

/* ============================================================================
   Month/Year Display (Center)
   ============================================================================ */

.month-year-display {
  font-size: var(--nav-font-size);
  font-weight: 600;
  color: var(--ty-calendar-nav-title-color, var(--ty-color-neutral-strong));
  text-align: center;
  white-space: nowrap;
  letter-spacing: -0.01em;
}
`;
