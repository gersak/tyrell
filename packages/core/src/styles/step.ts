/**
 * Step Component Styles
 */

import { customScrollbarStyles } from './custom-scrollbar.js'

export const stepStyles = `
:host {
  width: var(--ty-wizard-width, 100%);
  height: calc(var(--ty-wizard-height, 700px) - var(--ty-wizard-indicators-height, 120px));
  display: block;
  box-sizing: border-box;
  flex-shrink: 0;
  transition: opacity var(--ty-wizard-transition-duration, 400ms) var(--ty-wizard-transition-easing, ease-in-out);
}

@media (prefers-reduced-motion: reduce) {
  :host {
    transition-duration: 0ms !important;
  }
}

.step-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.step-panel {
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
}

.step-panel.ty-custom-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.step-panel.ty-custom-scroll::-webkit-scrollbar {
  display: none;
}

.step-wrapper:hover .ty-scrollbar-track-y.has-overflow {
  opacity: 1;
}

${customScrollbarStyles}
`;
