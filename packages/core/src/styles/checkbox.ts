/**
 * Checkbox Component Styles — self-contained (no inputStyles import).
 *
 * The checkbox is "just the tick": a single checkmark whose color/opacity
 * carries the state. Full flavor color when checked, faint when unchecked,
 * dash at mid-opacity when indeterminate, grayscale when disabled.
 */

export const checkboxStyles = `
:host {
  display: inline-flex;
  width: auto;
  vertical-align: middle;
}

.checkbox-container {
  display: inline-flex;
  align-items: center;
  outline: none;
  transition: all 0.15s ease-in-out;
  user-select: none;
  cursor: pointer;
  border-radius: 6px;
  gap: var(--ty-spacing-1);
  color: var(--ty-text-faint);
}

.checkbox-container[aria-checked="true"] {
  color: var(--ty-text);
}

/* Visible focus ring (keyboard) — .focused is toggled by the component */
.checkbox-container.focused,
.checkbox-container:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ty-color-primary) 25%, transparent);
}

.checkbox-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transition: color 0.15s ease-in-out;
  pointer-events: none;
  /* Let the container handle the click */
}

/* ===== SIZES ===== */

.checkbox-container svg {
  width: 16px;
  height: 16px;
}

.checkbox-container.xs svg {
  width: 12px;
  height: 12px;
}

.checkbox-container.sm svg {
  width: 14px;
  height: 14px;
}

.checkbox-container.lg svg {
  width: 20px;
  height: 20px;
}

.checkbox-container.xl svg {
  width: 24px;
  height: 24px;
}

/* ===== SEMANTIC FLAVORS ===== */

.checkbox-container.primary {
  color: var(--ty-color-primary-soft);
}

.checkbox-container.primary[aria-checked="true"] {
  color: var(--ty-color-primary);
}

.checkbox-container.secondary {
  color: var(--ty-color-secondary-soft);
}

.checkbox-container.secondary[aria-checked="true"] {
  color: var(--ty-color-secondary);
}

.checkbox-container.success {
  color: var(--ty-color-success-soft);
}

.checkbox-container.success[aria-checked="true"] {
  color: var(--ty-color-success);
}

.checkbox-container.danger {
  color: var(--ty-color-danger-soft);
}

.checkbox-container.danger[aria-checked="true"] {
  color: var(--ty-color-danger);
}

.checkbox-container.warning {
  color: var(--ty-color-warning-soft);
}

.checkbox-container.warning[aria-checked="true"] {
  color: var(--ty-color-warning);
}

.checkbox-container.neutral {
  color: var(--ty-color-neutral-soft);
}

.checkbox-container.neutral[aria-checked="true"] {
  color: var(--ty-color-neutral);
}

/* ===== STATES ===== */

/* Clean tick: no box outline, just the checkmark. Inactive = faint tick. */
.checkbox-container:not([aria-checked="true"]) {
  opacity: 0.35;
}

/* Indeterminate (dash) sits between unchecked and checked */
.checkbox-container[aria-checked="mixed"] {
  opacity: 0.7;
}

/* Disabled must stay distinguishable from merely-unchecked: grayscale kills
   the flavor color, and disabled-unchecked drops below the unchecked 0.35. */
.checkbox-container.disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.5;
  filter: grayscale(1);
}

.checkbox-container.disabled:not([aria-checked="true"]) {
  opacity: 0.2;
}

/* Error state */
.checkbox-container.error .checkbox-icon {
  color: var(--ty-color-danger);
}

.checkbox-container.error:focus {
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ty-color-danger) 15%, transparent);
}
`;
