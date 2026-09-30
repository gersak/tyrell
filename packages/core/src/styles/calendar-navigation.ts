/** Calendar Navigation Styles */

export const calendarNavigationStyles = `
/* Theming tokens applied as var(--ty-calendar-nav-*, <default>) at point of
   use (NOT on :host) so consumers can override them from outside — this
   component is nested inside ty-calendar's shadow, so a :host default would
   block inherited overrides. --ty-calendar-accent still cascades in. */

:host([data-size="md"]) {
  --nav-btn-size: 2rem;
  --nav-btn-icon-size: 1.25rem;
  --nav-font-size: 0.875rem;
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
  --nav-font-size: 0.875rem;
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

/* Navigation groups: left, center, right */
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
  /* Flex items default to min-width:auto, i.e. they refuse to shrink below
     their content. A long month name ("September 2026") therefore widened
     this group and shoved the arrow groups outward — the nav visibly
     re-laid-out as you paged month to month. min-width:0 lets the centre
     take exactly the leftover space, so the arrows stay pinned whatever the
     label says, and an over-long label ellipsizes instead of pushing. */
  min-width: 0;
}

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

/* 14px uppercase at every size, not a per-size type scale: the label is the
   widest thing in the bar and the only one whose width depends on the data
   ("May" vs "September"), so scaling it up on lg was what made the arrows
   shuffle around. Small caps read as chrome, stay legible, and leave the
   centre column comfortably wider than the longest localized month name.
   Ellipsis is a backstop for a narrow --nav-width, not the sizing strategy. */
.month-year-display {
  font-size: var(--nav-font-size);
  font-weight: 600;
  color: var(--ty-calendar-nav-title-color, var(--ty-color-neutral-strong));
  text-align: center;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;
