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

.ty-field-label {
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

/* Password reveal toggle (rendered for type="password") */
.password-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--input-placeholder, var(--ty-input-placeholder));
  transition: color 0.15s ease-in-out;
}
.password-toggle:hover {
  color: var(--input-color, var(--ty-input-color));
}
.password-toggle:focus-visible {
  outline: 2px solid var(--ty-color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}
.password-toggle svg {
  width: 1rem;
  height: 1rem;
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
  border-color: var(--ty-color-danger-bold);
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
  border-color: var(--ty-color-primary-bold);
}

.input-wrapper.primary.focused {
  border-color: var(--ty-color-primary-bold);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ty-color-primary) 15%, transparent);
}

/* Secondary */
.input-wrapper.secondary {
  border-color: var(--ty-input-secondary-border, var(--ty-color-secondary));
}

.input-wrapper.secondary.focused {
  border-color: var(--ty-color-secondary-bold);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ty-color-secondary) 15%, transparent);
}

/* Success */
.input-wrapper.success {
  border-color: var(--ty-input-success-border);
}

.input-wrapper.success:hover:not(.disabled) {
  border-color: var(--ty-color-success-bold);
}

.input-wrapper.success.focused {
  border-color: var(--ty-color-success-bold);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ty-color-success) 15%, transparent);
}

/* Danger */
.input-wrapper.danger {
  border-color: var(--ty-input-danger-border);
}

.input-wrapper.danger:hover:not(.disabled) {
  border-color: var(--ty-color-danger-bold);
}

.input-wrapper.danger.focused {
  border-color: var(--ty-color-danger-bold);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ty-color-danger) 15%, transparent);
}

/* Warning */
.input-wrapper.warning {
  border-color: var(--ty-input-warning-border);
}

.input-wrapper.warning:hover:not(.disabled) {
  border-color: var(--ty-color-warning-bold);
}

.input-wrapper.warning.focused {
  border-color: var(--ty-color-warning-bold);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ty-color-warning) 15%, transparent);
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
`
