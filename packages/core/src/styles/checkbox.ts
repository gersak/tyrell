/**
 * Checkbox Component Styles
 *
 * Imports inputStyles (which has the visual rules), then overrides :host
 * to be inline-flex so the checkbox sizes to its visual instead of
 * inheriting `display: block; width: 100%` from input's :host rule.
 */

import { inputStyles } from "./input.js";

export const checkboxStyles = `
${inputStyles}

/* Override input's :host to be inline (sized to its visual) */
:host {
  display: inline-flex;
  width: auto;
  vertical-align: middle;
}
`;
