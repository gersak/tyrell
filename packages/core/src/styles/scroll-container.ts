/**
 * TyScrollContainer styles
 * Component-specific styles + shared custom scrollbar styles
 */

import { customScrollbarStyles } from './custom-scrollbar.js'

export const scrollContainerStyles = `
:host {
  display: block;
  position: relative;
  overflow: hidden;
}

.scroll-wrapper {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

:host([overflow-x]) .scroll-wrapper {
  overflow-x: auto;
}

:host([max-height]) .scroll-wrapper {
  max-height: var(--scroll-max-height);
}

/* hide-scrollbar: hides native, no custom */
:host([hide-scrollbar]) .scroll-wrapper {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:host([hide-scrollbar]) .scroll-wrapper::-webkit-scrollbar {
  display: none;
}

/* scroll-anchoring: we manage scroll position in JS, so turn off the browser's
   native scroll anchoring to avoid double-compensation. */
:host([scroll-anchoring]) .scroll-wrapper {
  overflow-anchor: none;
}

/* custom-scrollbar: hides native */
:host([custom-scrollbar]) .scroll-wrapper {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:host([custom-scrollbar]) .scroll-wrapper::-webkit-scrollbar {
  display: none;
}

:host([custom-scrollbar]:hover) .ty-scrollbar-track-y.has-overflow,
:host([custom-scrollbar]:hover) .ty-scrollbar-track-x.has-overflow {
  opacity: 1;
}

/* Corner gap when both axes are present */
:host([custom-scrollbar][overflow-x]) .ty-scrollbar-track-y {
  bottom: var(--ty-scrollbar-width, 8px);
}

:host([custom-scrollbar]) .ty-scrollbar-track-x {
  right: var(--ty-scrollbar-width, 8px);
}

.shadow-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.shadow-top,
.shadow-bottom,
.shadow-left,
.shadow-right {
  position: absolute;
  opacity: 0;
  transition: var(--ty-scroll-shadow-transition, opacity 0.2s ease-out);
  pointer-events: none;
}

.shadow-top {
  top: -40px;
  left: 0;
  right: 0;
  height: 80px;
  background: var(--ty-scroll-shadow-top, radial-gradient(
    ellipse 100% 30% at center,
    color-mix(in oklab, var(--ty-color-neutral-bold) 12%, transparent),
    transparent,
    transparent
  ));
  clip-path: inset(50% 0 0 0);
}

.shadow-bottom {
  bottom: -30px;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--ty-scroll-shadow-bottom, radial-gradient(
    ellipse 100% 20% at center,
    color-mix(in oklab, var(--ty-color-neutral-bold) 18%, transparent),
    transparent,
    transparent
  ));
  clip-path: inset(0 0 50% 0);
}

.shadow-left {
  left: -30px;
  top: 0;
  bottom: 0;
  width: 60px;
  background: var(--ty-scroll-shadow-left, radial-gradient(
    ellipse 30% 100% at center,
    color-mix(in oklab, var(--ty-color-neutral-bold) 12%, transparent),
    transparent,
    transparent
  ));
  clip-path: inset(0 0 0 50%);
}

.shadow-right {
  right: -30px;
  top: 0;
  bottom: 0;
  width: 60px;
  background: var(--ty-scroll-shadow-right, radial-gradient(
    ellipse 30% 100% at center,
    color-mix(in oklab, var(--ty-color-neutral-bold) 12%, transparent),
    transparent,
    transparent
  ));
  clip-path: inset(0 50% 0 0);
}

.shadow-left,
.shadow-right {
  display: none;
}

:host([overflow-x]) .shadow-left,
:host([overflow-x]) .shadow-right {
  display: block;
}

.shadow-top.visible,
.shadow-bottom.visible,
.shadow-left.visible,
.shadow-right.visible {
  opacity: 1;
}

:host([shadow="false"]) .shadow-overlay {
  display: none;
}

/* Touch devices - restore native scrollbar */
@media (pointer: coarse) and (hover: none) {
  :host([custom-scrollbar]) .scroll-wrapper {
    scrollbar-width: thin;
    scrollbar-color: var(--ty-border, color-mix(in oklab, var(--ty-color-neutral-bold) 25%, transparent)) transparent;
  }
  :host([custom-scrollbar]) .scroll-wrapper::-webkit-scrollbar {
    display: block;
    width: 4px;
    height: 4px;
  }
  :host([custom-scrollbar]) .scroll-wrapper::-webkit-scrollbar-thumb {
    background: var(--ty-border, color-mix(in oklab, var(--ty-color-neutral-bold) 25%, transparent));
    border-radius: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shadow-top,
  .shadow-bottom,
  .shadow-left,
  .shadow-right {
    transition-duration: 0ms !important;
  }
}

${customScrollbarStyles}
`;
