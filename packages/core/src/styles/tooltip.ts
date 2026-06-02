/**
 * Tooltip Styles
 * 
 * Bold, button-like tooltips with high contrast and semantic colors.
 * Designed to grab attention and provide clear, readable information.
 */

import type { StyleContent } from '../types/common.js';

export const tooltipStyles: StyleContent = {
  id: 'ty-tooltip',
  css: `
/* Tooltip host element - display contents to not affect layout */
:host {
  display: contents;
}

/* Tooltip container - positioned element */
#tooltip-container {
  position: fixed;
  top: var(--y, 0px);
  left: var(--x, 0px);
  z-index: var(--ty-z-tooltip, 9999);

  /* Hidden by default */
  visibility: hidden;
  opacity: 0;
  transition: opacity 200ms, visibility 200ms;

  /* Prevent interaction */
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  
  /* Bold shadow for depth */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 
              0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

/* When open */
#tooltip-container.open {
  visibility: visible;
  opacity: 1;
}

/* Base tooltip styling - Dark inverted style (like buttons) */
#tooltip-container {
  /* Bold, high-contrast styling. Defaults route through the neutral ramp
   * so the tooltip inverts cleanly: dark in light mode, light in dark mode.
   * Consumers can pin it to a fixed look via --ty-tooltip-bg/-color. */
  background: var(--ty-tooltip-bg, var(--ty-color-neutral-strong));
  color: var(--ty-tooltip-color, var(--ty-color-neutral-faint));
  
  /* Comfortable padding */
  padding: var(--ty-tooltip-padding, 8px 12px);
  border-radius: var(--ty-tooltip-radius, 6px);
  
  /* No border - solid color provides contrast */
  border: none;
  
  /* Sizing */
  max-width: var(--ty-tooltip-max-width, 250px);
  
  /* Typography - clear and readable */
  font-size: var(--ty-font-sm, 14px);
  font-weight: var(--ty-font-semibold, 600);
  line-height: 1.5;
  text-align: center;
}

/* Content slot */
#tooltip-container ::slotted(*) {
  /* Ensure slotted content inherits styles */
  color: inherit;
  font-size: inherit;
  line-height: inherit;
}

/* ============================================ */
/* Flavor Variants - Bold, Button-like Colors  */
/* ============================================ */

/* Primary - Bold blue (like primary button) */
#tooltip-container[data-flavor="primary"] {
  background: var(--ty-color-primary, #3b82f6);
  color: #ffffff;
}

/* Success - Bold green */
#tooltip-container[data-flavor="success"] {
  background: var(--ty-color-success, #10b981);
  color: #ffffff;
}

/* Danger - Bold red */
#tooltip-container[data-flavor="danger"] {
  background: var(--ty-color-danger, #ef4444);
  color: #ffffff;
}

/* Warning - Bold orange/amber */
#tooltip-container[data-flavor="warning"] {
  background: var(--ty-color-warning, #f59e0b);
  color: #ffffff;
}

/* Neutral - Medium gray (default alternative) */
#tooltip-container[data-flavor="neutral"] {
  background: var(--ty-color-neutral, #6b7280);
  color: #ffffff;
}

/* Light - For dark backgrounds */
#tooltip-container[data-flavor="light"] {
  background: var(--ty-surface-floating, var(--ty-surface-elevated, #ffffff));
  color: var(--ty-color-neutral-strong, #111827);
  box-shadow: var(--ty-shadow-lg,
              0 10px 15px -3px rgba(0, 0, 0, 0.15),
              0 4px 6px -4px rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(0, 0, 0, 0.05));
}

/* Dark - Inverted style (default) */
#tooltip-container[data-flavor="dark"] {
  background: var(--ty-tooltip-bg, var(--ty-color-neutral-strong));
  color: var(--ty-color-neutral-faint);
}

/* Secondary - Purple/indigo */
#tooltip-container[data-flavor="secondary"] {
  background: var(--ty-color-secondary, #8b5cf6);
  color: #ffffff;
}
`,
};
