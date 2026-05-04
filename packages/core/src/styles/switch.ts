/**
 * Switch Component Styles
 * Track + thumb visual, ARIA role="switch".
 *
 * Reuses input-container/error-message rules from input styles for label
 * and error layout consistency.
 */

import { inputStyles } from "./input.js";

export const switchStyles = `
${inputStyles}

/* Override input's :host so the switch sizes to its visual */
:host {
  display: inline-flex;
  width: auto;
  vertical-align: middle;
}

/* ===== SWITCH CONTAINER (just the visual) ===== */
.switch-container {
  display: inline-block;
  cursor: pointer;
  user-select: none;
  outline: none;
  vertical-align: middle;
}

.switch-container.disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.switch-container:focus-visible .switch-track,
.switch-container.focused .switch-track {
  box-shadow: 0 0 0 3px var(--ty-input-shadow-focus);
}

/* ===== TRACK ===== */
.switch-track {
  position: relative;
  flex-shrink: 0;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  background: var(--ty-color-neutral-soft, var(--ty-input-border));
  transition: background-color 0.18s ease-in-out;
  box-sizing: border-box;
}

/* ===== THUMB ===== */
.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.18s ease-in-out, background-color 0.18s ease-in-out;
}

/* ===== CHECKED STATE ===== */
.switch-container[aria-checked="true"] .switch-track {
  background: var(--ty-color-primary);
}

.switch-container[aria-checked="true"] .switch-thumb {
  transform: translateX(16px);
}

/* ===== SIZE VARIANTS ===== */
.switch-container.xs .switch-track { width: 26px; height: 14px; }
.switch-container.xs .switch-thumb { width: 10px; height: 10px; }
.switch-container.xs[aria-checked="true"] .switch-thumb { transform: translateX(12px); }

.switch-container.sm .switch-track { width: 30px; height: 16px; }
.switch-container.sm .switch-thumb { width: 12px; height: 12px; }
.switch-container.sm[aria-checked="true"] .switch-thumb { transform: translateX(14px); }

/* md is default — already set above */

.switch-container.lg .switch-track { width: 44px; height: 24px; }
.switch-container.lg .switch-thumb { width: 20px; height: 20px; }
.switch-container.lg[aria-checked="true"] .switch-thumb { transform: translateX(20px); }

.switch-container.xl .switch-track { width: 52px; height: 28px; }
.switch-container.xl .switch-thumb { width: 24px; height: 24px; }
.switch-container.xl[aria-checked="true"] .switch-thumb { transform: translateX(24px); }

/* ===== FLAVOR VARIANTS (checked-state colors) ===== */
.switch-container.primary[aria-checked="true"] .switch-track { background: var(--ty-color-primary); }
.switch-container.secondary[aria-checked="true"] .switch-track { background: var(--ty-color-secondary); }
.switch-container.success[aria-checked="true"] .switch-track { background: var(--ty-color-success); }
.switch-container.danger[aria-checked="true"] .switch-track { background: var(--ty-color-danger); }
.switch-container.warning[aria-checked="true"] .switch-track { background: var(--ty-color-warning); }
.switch-container.neutral[aria-checked="true"] .switch-track { background: var(--ty-color-neutral); }

`;
