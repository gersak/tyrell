/**
 * TyResizeObserver styles
 * Minimal styling - just ensures component participates in layout
 */

export const resizeObserverStyles = `
:host {
  /* Default to block display, user can override */
  display: block;
  position: relative;
}

::slotted(*) {
  /* No default styling - preserve natural layout */
}
`
