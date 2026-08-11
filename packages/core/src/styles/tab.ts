/**
 * Tab Component Styles
 */

import { customScrollbarStyles } from './custom-scrollbar.js'

export const tabStyles = `
:host {
  width: var(--tabs-width, 100%);
  height: calc(var(--tabs-height, 400px) - var(--buttons-height, 48px));
  display: block;
  box-sizing: border-box;
  flex-shrink: 0;
  transition: opacity var(--transition-duration, 400ms) var(--transition-easing, ease-in-out);
}

@media (prefers-reduced-motion: reduce) {
  :host {
    transition-duration: 0ms !important;
  }
}

.tab-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.tab-panel {
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
}

.tab-panel.ty-custom-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tab-panel.ty-custom-scroll::-webkit-scrollbar {
  display: none;
}

.tab-wrapper:hover .ty-scrollbar-track-y.has-overflow {
  opacity: 1;
}

${customScrollbarStyles}
`;
