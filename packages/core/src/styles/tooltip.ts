/**
 * Tooltip Styles
 *
 * The tooltip popover is created in document.body (top-layer Popover API)
 * and styled inline by the component — see applyFlavorStyles() in
 * components/tooltip.ts. The shadow root only needs the host to not affect
 * layout.
 */

import type { StyleContent } from '../types/common.js';

export const tooltipStyles: StyleContent = {
  id: 'ty-tooltip',
  css: `
/* Tooltip host element - display contents to not affect layout */
:host {
  display: contents;
}
`,
};
