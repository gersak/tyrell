/**
 * Input Component Styles
 * PORTED FROM: clj/ty/components/input.css
 * Phase A: Regular input styles only (no checkbox, no numeric formatting)
 */

export const inputStyles = `
:host {
  display: block;
  font-family: var(--ty-font-sans);
  width: 100%;
}

:host([size="xl"]) {
  font-size: 20px;
}


:host([size="xs"]) {
  font-size: 12px;
}


:host([size="sm"]) {
  font-size: 14px;
}

:host([size="lg"]) {
  font-size: 18px;
}

.input-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

/* ===== LABEL STYLING ===== */

.input-label {
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-weight: var(--ty-font-medium);
  color: var(--ty-label-color);
  margin-bottom: 6px;
  padding-left: 12px;
  display: flex;
  align-items: center;
}

/* Required indicator - using SVG icon */
.required-icon {
  display: inline-flex;
  align-items: center;
  color: var(--ty-color-danger);
  width: 12px;
  height: 12px;
  margin-left: 4px;
  vertical-align: middle;
}

.required-icon svg {
  width: 100%;
  height: 100%;
}

/* ===== INPUT WRAPPER WITH SLOTS ===== */

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* No gap by default */
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--input-border, var(--ty-input-border));
  border-radius: var(--ty-radius-base);
  background: var(--input-bg, var(--input-bg, var(--ty-input-bg)));
  transition: all 0.15s ease-in-out;
  
  /* Default size (md) */
  min-height: 40px;
  padding: 0 12px;
}

/* Wrapper states */
.input-wrapper:hover:not(.disabled) {
  border-color: var(--input-border-hover, var(--ty-input-border-hover));
}

.input-wrapper.focused {
  border-color: var(--input-border-focus, var(--ty-input-border-focus));
  box-shadow: 0 0 0 3px var(--input-shadow-focus, var(--ty-input-shadow-focus));
}

.input-wrapper.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background: var(--input-disabled-bg, var(--ty-input-disabled-bg));
  border-color: var(--input-disabled-border, var(--ty-input-disabled-border));
}

/* ===== SLOT STYLING ===== */

/* Style slotted content directly (no wrappers needed) */
::slotted([slot="start"]),
::slotted([slot="end"]) {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--ty-color-text-soft);
}

/* Icon sizing for slotted icons */
::slotted(ty-icon) {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}

/* ===== ERROR MESSAGE STYLING ===== */

.error-message {
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  color: var(--ty-color-danger);
  margin-top: 4px;
  padding-left: 12px;
}

/* Error state for wrapper */
.input-wrapper.error {
  border-color: var(--ty-color-danger);
  background: var(--ty-bg-danger-soft);
}

.input-wrapper.error.focused {
  border-color: var(--ty-color-danger-mild);
  box-shadow: 0 0 0 3px var(--input-shadow-focus, var(--ty-input-shadow-focus));
}

/* ===== INPUT BASE STYLING ===== */

input {
  /* Reset and base styles — Linear-paired typography */
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  border: none;
  outline: none;
  background: transparent;
  color: var(--input-color, var(--ty-input-color));
  font-family: inherit;
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-weight: var(--ty-font-normal);
  padding: 0;
  margin: 0;
}

/* Remove number input spinner arrows */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Disabled state */
input:disabled {
  cursor: not-allowed;
  color: var(--input-disabled-color, var(--ty-input-disabled-color));
}

/* Placeholder styling */
input::placeholder {
  color: var(--input-placeholder, var(--ty-input-placeholder));
  font-weight: 400;
}

/* ===== SIZE MODIFIERS ===== */

/* Extra Small */
.input-wrapper.xs {
  min-height: 32px;
  padding: 0 8px;
  border-radius: var(--ty-input-radius-xs, var(--ty-radius-base));
}

.input-wrapper.xs input {
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
}

/* Small */
.input-wrapper.sm {
  min-height: 36px;
  padding: 0 10px;
  border-radius: var(--ty-input-radius-sm, var(--ty-radius-base));
}

.input-wrapper.sm input {
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
}

/* Medium (default) */
.input-wrapper.md {
  min-height: 40px;
  padding: 0 12px;
  border-radius: var(--ty-input-radius-md, var(--ty-radius-base));
}

.input-wrapper.md input {
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
}

/* Large */
.input-wrapper.lg {
  min-height: 44px;
  padding: 0 14px;
  border-radius: var(--ty-input-radius-lg, var(--ty-radius-base));
}

.input-wrapper.lg input {
  font-size: var(--ty-font-base);
  line-height: var(--ty-leading-base);
  letter-spacing: var(--ty-tracking-base);
}

/* Extra Large */
.input-wrapper.xl {
  min-height: 48px;
  padding: 0 16px;
  border-radius: var(--ty-input-radius-xl, var(--ty-radius-base));
}

.input-wrapper.xl input {
  font-size: var(--ty-font-lg);
  line-height: var(--ty-leading-lg);
  letter-spacing: var(--ty-tracking-lg);
}

/* ===== SEMANTIC FLAVOR MODIFIERS ===== */

/* Primary */
.input-wrapper.primary {
  border-color: var(--ty-input-primary-border, var(--ty-color-primary));
}

.input-wrapper.primary:hover:not(.disabled) {
  border-color: var(--ty-color-primary-mild);
}

.input-wrapper.primary.focused {
  border-color: var(--ty-color-primary-mild);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Secondary */
.input-wrapper.secondary {
  border-color: var(--ty-input-secondary-border, var(--ty-color-secondary));
}

.input-wrapper.secondary.focused {
  border-color: var(--ty-color-secondary-mild);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* Success */
.input-wrapper.success {
  border-color: var(--ty-input-success-border);
}

.input-wrapper.success:hover:not(.disabled) {
  border-color: var(--ty-color-success-mild);
}

.input-wrapper.success.focused {
  border-color: var(--ty-color-success-mild);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Danger */
.input-wrapper.danger {
  border-color: var(--ty-input-danger-border);
}

.input-wrapper.danger:hover:not(.disabled) {
  border-color: var(--ty-color-danger-mild);
}

.input-wrapper.danger.focused {
  border-color: var(--ty-color-danger-mild);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Warning */
.input-wrapper.warning {
  border-color: var(--ty-input-warning-border);
}

.input-wrapper.warning:hover:not(.disabled) {
  border-color: var(--ty-color-warning-mild);
}

.input-wrapper.warning.focused {
  border-color: var(--ty-color-warning-mild);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

/* Neutral (default) */
.input-wrapper.neutral.focused {
  border-color: var(--input-border-focus, var(--ty-input-border-focus));
  box-shadow: 0 0 0 3px var(--input-shadow-focus, var(--ty-input-shadow-focus));
}

/* ===== ACCESSIBILITY ENHANCEMENTS ===== */

input:focus-visible {
  outline: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .input-wrapper {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .input-wrapper {
    transition: none;
  }
}

/* ===== RESPONSIVE BEHAVIOR ===== */

@media (max-width: 640px) {
  .input-wrapper.lg {
    min-height: 40px;
    padding: 0 12px;
  }

  .input-wrapper.lg input {
    font-size: var(--ty-font-sm);
    line-height: var(--ty-leading-sm);
    letter-spacing: var(--ty-tracking-sm);
  }

  .input-wrapper.xl {
    min-height: 44px;
    padding: 0 14px;
  }

  .input-wrapper.xl input {
    font-size: var(--ty-font-base);
    line-height: var(--ty-leading-base);
    letter-spacing: var(--ty-tracking-base);
  }
}

@media (max-width: 480px) {
  .input-wrapper.xl {
    min-height: 40px;
    padding: 0 12px;
  }

  .input-wrapper.xl input {
    font-size: var(--ty-font-sm);
    line-height: var(--ty-leading-sm);
    letter-spacing: var(--ty-tracking-sm);
  }
}

/* ===== CHECKBOX STYLING ===== */

.checkbox-container {
  display: inline-flex;
  align-items: center;
  outline: none;
  transition: all 0.15s ease-in-out;
  user-select: none;
  cursor: pointer;

  /* Default size (md) - matching input sizes */
  border-radius: 6px;
  gap: var(--ty-spacing-1);
  color: var(--ty-text-faint);
}

.checkbox-container[aria-checked="true"] {
  color: var(--ty-text);
}

/* Ensure slotted label content inherits the color from container */
.checkbox-container ::slotted(*) {
  color: inherit;
  transition: color 0.15s ease-in-out;
}

.checkbox-container label {
  cursor: pointer;
}

.checkbox-container label {
  font-size: var(--ty-font-sm);
}

.checkbox-container.sm label {
  font-size: var(--ty-font-xs);
}

.checkbox-container.lg label {
  font-size: var(--ty-font-base);
}

.checkbox-container.xl label {
  font-size: var(--ty-font-lg);
}

/* Checkbox input container - different layout for checkboxes */
.input-container.checkbox-layout {
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: auto;
  /* Don't force full width for checkboxes */
}

.input-container.checkbox-layout .input-label {
  margin-bottom: 0;
  padding-left: 0;
  order: 2;
  cursor: pointer;
  flex: 1;
}

.input-container.checkbox-layout .checkbox-container {
  order: 1;
  flex-shrink: 0;
}

/* Error message positioning for checkboxes */
.input-container.checkbox-layout .error-message {
  padding-left: 0;
  margin-left: 52px;
  /* Align with label text */
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

.checkbox-container svg {
  width: 24px;
  height: 24px;
}

/* ===== CHECKBOX SIZE MODIFIERS ===== */

.checkbox-container.xs svg {
  width: 16px;
  height: 16px;
}

/* Adjust error message margin for XS */
.input-container.checkbox-layout .checkbox-container.xs~.error-message {
  margin-left: 44px;
}


.checkbox-container.sm svg {
  width: 20px;
  height: 20px;
}

/* Adjust error message margin for SM */
.input-container.checkbox-layout .checkbox-container.sm~.error-message {
  margin-left: 48px;
}


.checkbox-container.md svg {
  width: 24px;
  height: 24px;
}


.checkbox-container.lg svg {
  width: 28px;
  height: 28px;
}

.checkbox-container.xl svg {
  width: 32px;
  height: 32px;
}


.checkbox-container.xl svg {
  font-size: 20px;
}

/* Adjust error message margin for LG */
.input-container.checkbox-layout .checkbox-container.lg~.error-message {
  margin-left: 56px;
}


/* Adjust error message margin for XL */
.input-container.checkbox-layout .checkbox-container.xl~.error-message {
  margin-left: 60px;
  /* 48px + 12px gap */
}

/* ===== CHECKBOX SEMANTIC FLAVORS ===== */

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


/* Neutral */
.checkbox-container.neutral {
  color: var(--ty-color-neutral-soft);
}

.checkbox-container.neutral[aria-checked="true"] {
  color: var(--ty-color-neutral);
}

/* Disabled state */
.checkbox-container.disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-container.disabled .checkbox-icon {
  color: var(--ty-color-neutral-faint);
}

/* Error state */
.checkbox-container.error .checkbox-icon {
  color: var(--ty-color-danger);
}

.checkbox-container.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Required state */
.checkbox-container.required .checkbox-icon {
  /* Could add specific styling for required checkboxes */
}

/* ===== RESPONSIVE CHECKBOX BEHAVIOR ===== */

@container (max-width: 480px) {
  .checkbox-container.lg {
    width: 40px;
    height: 40px;
  }

  .checkbox-container.lg svg {
    width: 20px;
    height: 20px;
  }

  .checkbox-container.xl {
    width: 44px;
    height: 44px;
  }

  .checkbox-container.xl svg {
    width: 22px;
    height: 22px;
  }
}

@container (max-width: 320px) {
  .checkbox-container.xl {
    width: 40px;
    height: 40px;
  }

  .checkbox-container.xl svg {
    width: 20px;
    height: 20px;
  }
}

/* Fallback for browsers without container query support */
@media (max-width: 640px) {
  .checkbox-container.lg {
    width: 40px;
    height: 40px;
  }

  .checkbox-container.lg svg {
    width: 20px;
    height: 20px;
  }

  .checkbox-container.xl {
    width: 44px;
    height: 44px;
  }

  .checkbox-container.xl svg {
    width: 22px;
    height: 22px;
  }
}

@media (max-width: 480px) {
  .checkbox-container.xl {
    width: 40px;
    height: 40px;
  }

  .checkbox-container.xl svg {
    width: 20px;
    height: 20px;
  }
}
`
