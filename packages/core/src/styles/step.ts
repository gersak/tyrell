/**
 * Step Component Styles
 */

import { customScrollbarStyles } from './custom-scrollbar.js'

export const stepStyles = `
:host {
  /* Panel height: the wizard's height attribute, or the content (auto). */
  height: var(--ty-wizard-panel-height, auto);
  display: block;
  box-sizing: border-box;
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
