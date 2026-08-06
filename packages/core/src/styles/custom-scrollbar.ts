/**
 * Shared CSS for CustomScrollbar utility
 * Include this in any component that uses CustomScrollbar
 */

export const customScrollbarStyles = `
/* ===================================== */
/* Custom Scrollbar - Vertical Track     */
/* ===================================== */

.ty-scrollbar-track-y {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--ty-scrollbar-width, 8px);
  z-index: 3;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease-out;
  cursor: pointer;
}

.ty-scrollbar-track-y.has-overflow {
  pointer-events: auto;
}

.ty-scrollbar-track-y.has-overflow:hover,
.ty-scrollbar-track-y.has-overflow.scrolling,
.ty-scrollbar-track-y.dragging {
  opacity: 1;
}

.ty-scrollbar-track-y::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--ty-scrollbar-track, transparent);
  border-radius: var(--ty-scrollbar-radius, 4px);
  opacity: 0;
  transition: opacity 0.15s ease-out;
}

.ty-scrollbar-track-y:hover::before,
.ty-scrollbar-track-y.dragging::before {
  opacity: 1;
  background: var(--ty-scrollbar-track-hover, color-mix(in oklab, var(--ty-color-neutral-bold) 8%, transparent));
}

.ty-scrollbar-thumb-y {
  position: absolute;
  right: 0;
  width: 100%;
  min-height: var(--ty-scrollbar-thumb-min-height, 30px);
  background: var(--ty-scrollbar-thumb, color-mix(in oklab, var(--ty-color-neutral-bold) 40%, transparent));
  border-radius: var(--ty-scrollbar-radius, 4px);
  transition: var(--ty-local-transition, background 0.15s ease-out);
  box-sizing: border-box;
  border: 1px solid transparent;
}

.ty-scrollbar-thumb-y:hover,
.ty-scrollbar-track-y.dragging .ty-scrollbar-thumb-y {
  background: var(--ty-scrollbar-thumb-hover, color-mix(in oklab, var(--ty-color-neutral-bold) 55%, transparent));
}

.ty-scrollbar-thumb-y:active,
.ty-scrollbar-track-y.dragging .ty-scrollbar-thumb-y {
  background: var(--ty-scrollbar-thumb-active, color-mix(in oklab, var(--ty-color-neutral-bold) 70%, transparent));
}

/* ===================================== */
/* Custom Scrollbar - Horizontal Track   */
/* ===================================== */

.ty-scrollbar-track-x {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--ty-scrollbar-width, 8px);
  z-index: 3;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease-out;
  cursor: pointer;
}

.ty-scrollbar-track-x.has-overflow {
  pointer-events: auto;
}

.ty-scrollbar-track-x.has-overflow:hover,
.ty-scrollbar-track-x.has-overflow.scrolling,
.ty-scrollbar-track-x.dragging {
  opacity: 1;
}

.ty-scrollbar-track-x::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--ty-scrollbar-track, transparent);
  border-radius: var(--ty-scrollbar-radius, 4px);
  opacity: 0;
  transition: opacity 0.15s ease-out;
}

.ty-scrollbar-track-x:hover::before,
.ty-scrollbar-track-x.dragging::before {
  opacity: 1;
  background: var(--ty-scrollbar-track-hover, color-mix(in oklab, var(--ty-color-neutral-bold) 8%, transparent));
}

.ty-scrollbar-thumb-x {
  position: absolute;
  bottom: 0;
  height: 100%;
  min-width: var(--ty-scrollbar-thumb-min-height, 30px);
  background: var(--ty-scrollbar-thumb, color-mix(in oklab, var(--ty-color-neutral-bold) 40%, transparent));
  border-radius: var(--ty-scrollbar-radius, 4px);
  transition: var(--ty-local-transition, background 0.15s ease-out);
  box-sizing: border-box;
  border: 1px solid transparent;
}

.ty-scrollbar-thumb-x:hover,
.ty-scrollbar-track-x.dragging .ty-scrollbar-thumb-x {
  background: var(--ty-scrollbar-thumb-hover, color-mix(in oklab, var(--ty-color-neutral-bold) 55%, transparent));
}

.ty-scrollbar-thumb-x:active,
.ty-scrollbar-track-x.dragging .ty-scrollbar-thumb-x {
  background: var(--ty-scrollbar-thumb-active, color-mix(in oklab, var(--ty-color-neutral-bold) 70%, transparent));
}

/* ===================================== */
/* Touch devices - hide custom scrollbar */
/* ===================================== */

@media (pointer: coarse) and (hover: none) {
  .ty-scrollbar-track-y,
  .ty-scrollbar-track-x {
    display: none !important;
  }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ty-scrollbar-track-y,
  .ty-scrollbar-track-x,
  .ty-scrollbar-thumb-y,
  .ty-scrollbar-thumb-x {
    transition-duration: 0ms !important;
  }
}
`;
