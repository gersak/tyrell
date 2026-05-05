/**
 * Date Picker Component Styles
 * PORTED FROM: cljs/ty/components/date_picker.css
 */

export const datePickerStyles = `
/* Date Picker Component Styles */
:host {
  display: block;
  width: auto;
  min-width: 200px;

  /* ==========================================================================
     Theming Tokens — Date Picker Stub
     Thin shim over --ty-input-*. Override these to retheme just the date-picker
     trigger without affecting other inputs.
     ========================================================================== */
  --ty-date-picker-bg: var(--ty-input-bg);
  --ty-date-picker-color: var(--ty-input-color);
  --ty-date-picker-placeholder: var(--ty-input-placeholder);
  --ty-date-picker-border: var(--ty-input-border);
  --ty-date-picker-border-hover: var(--ty-input-border-hover);
  --ty-date-picker-border-focus: var(--ty-input-border-focus);
  --ty-date-picker-shadow-focus: var(--ty-input-shadow-focus);
  --ty-date-picker-disabled-bg: var(--ty-input-disabled-bg);
  --ty-date-picker-disabled-color: var(--ty-input-disabled-color);
  --ty-date-picker-radius: var(--ty-radius-md);

  /* ==========================================================================
     Theming Tokens — Calendar Popup Surface
     Shared with ty-calendar / ty-calendar-month theming.
     ========================================================================== */
  --ty-calendar-surface-bg: var(--ty-surface-floating);
  --ty-calendar-surface-border: var(--ty-input-border);
  --ty-calendar-surface-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1);
  --ty-calendar-surface-radius: var(--ty-radius-lg);

  /* ==========================================================================
     Theming Tokens — Time Section
     ========================================================================== */
  --ty-calendar-time-bg: var(--ty-bg-neutral-faint);
  --ty-calendar-time-border: var(--ty-input-border);
  --ty-calendar-time-label-color: var(--ty-color-neutral);
  --ty-calendar-time-input-color: var(--ty-input-color);
  --ty-calendar-time-placeholder-color: var(--ty-input-placeholder);
  --ty-calendar-time-icon-color: var(--ty-color-neutral-soft);
}

/* Container structure (reuses dropdown patterns) */
.dropdown-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.dropdown-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ty-label-color);
  margin-bottom: 6px;
  line-height: 1.25;
  padding-left: 12px;
}

.required-icon {
  display: inline-flex;
  align-items: center;
  color: #ef4444;
  width: 12px;
  height: 12px;
  vertical-align: middle;
  margin-left: 4px;
}

.dropdown-wrapper {
  position: relative;
  display: block;
  width: 100%;
}

/* Start-slot icon (leading content inside the date-picker stub) */
.date-picker-stub ::slotted([slot="start"]) {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 0.5rem;
  color: var(--ty-color-text-soft);
}

.date-picker-stub ::slotted(ty-icon[slot="start"]) {
  width: 1em;
  height: 1em;
}

/* Date picker stub (styled like dropdown) */
.date-picker-stub {
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  background: var(--ty-date-picker-bg);
  color: var(--ty-date-picker-color);
  border: 1px solid var(--ty-date-picker-border);
  border-radius: var(--ty-date-picker-radius);
  font-family: var(--ty-font-sans);
  font-size: var(--ty-font-sm);
  font-weight: var(--ty-font-normal);
  line-height: var(--ty-line-height-tight);
  min-height: var(--ty-size-md);
  padding: var(--ty-spacing-2) var(--ty-spacing-3);
  padding-right: calc(var(--ty-spacing-3) + 1rem + var(--ty-spacing-2));
  transition: var(--ty-transition-all), opacity 0.2s ease;
  outline: none;
}

.date-picker-stub:hover:not([disabled]):not(.open) {
  border-color: var(--ty-date-picker-border-hover);
}

.date-picker-stub[disabled] {
  background-color: var(--ty-date-picker-disabled-bg);
  color: var(--ty-date-picker-disabled-color);
  cursor: not-allowed;
  opacity: 0.6;
}

.date-picker-stub:focus,
.date-picker-stub.open {
  border-color: var(--ty-date-picker-border-focus);
  box-shadow: 0 0 0 3px var(--ty-date-picker-shadow-focus);
}

/* Size variants */
.date-picker-stub.xs {
  min-height: var(--ty-size-xs);
  font-size: var(--ty-font-xs);
  padding: var(--ty-spacing-1) var(--ty-spacing-2);
  padding-right: calc(var(--ty-spacing-2) + 0.875rem + var(--ty-spacing-1));
}

.date-picker-stub.sm {
  min-height: var(--ty-size-sm);
  font-size: var(--ty-font-xs);
  padding: var(--ty-spacing-1) var(--ty-spacing-2);
  padding-right: calc(var(--ty-spacing-2) + 0.875rem + var(--ty-spacing-1));
}

.date-picker-stub.lg {
  min-height: var(--ty-size-lg);
  font-size: var(--ty-font-base);
  padding: var(--ty-spacing-2) var(--ty-spacing-4);
  padding-right: calc(var(--ty-spacing-4) + 1.125rem + var(--ty-spacing-2));
}

.date-picker-stub.xl {
  min-height: var(--ty-size-xl);
  font-size: var(--ty-font-lg);
  padding: var(--ty-spacing-3) var(--ty-spacing-4);
  padding-right: calc(var(--ty-spacing-4) + 1.25rem + var(--ty-spacing-3));
}

/* Flavor variants */
/* Primary - Main brand focus state */
.date-picker-stub.primary {
  border-color: var(--ty-input-primary-border, var(--ty-color-primary));
}

.date-picker-stub.primary:hover:not([disabled]) {
  border-color: var(--ty-color-primary-mild);
}

.date-picker-stub.primary:focus,
.date-picker-stub.primary.open {
  border-color: var(--ty-color-primary-mild);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Secondary - Supporting action focus state */
.date-picker-stub.secondary {
  border-color: var(--ty-input-secondary-border, var(--ty-color-secondary));
}

.date-picker-stub.secondary:hover:not([disabled]) {
  border-color: var(--ty-color-secondary-mild);
}

.date-picker-stub.secondary:focus,
.date-picker-stub.secondary.open {
  border-color: var(--ty-color-secondary-mild);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* Success - Valid/confirmed input state */
.date-picker-stub.success {
  border-color: var(--ty-input-success-border, var(--ty-color-success));
}

.date-picker-stub.success:hover:not([disabled]) {
  border-color: var(--ty-color-success-mild);
}

.date-picker-stub.success:focus,
.date-picker-stub.success.open {
  border-color: var(--ty-color-success-mild);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Danger - Error/invalid input state */
.date-picker-stub.danger {
  border-color: var(--ty-input-danger-border, var(--ty-color-danger));
}

.date-picker-stub.danger:hover:not([disabled]) {
  border-color: var(--ty-color-danger-mild);
}

.date-picker-stub.danger:focus,
.date-picker-stub.danger.open {
  border-color: var(--ty-color-danger-mild);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Warning - Caution/attention needed input state */
.date-picker-stub.warning {
  border-color: var(--ty-input-warning-border, var(--ty-color-warning));
}

.date-picker-stub.warning:hover:not([disabled]) {
  border-color: var(--ty-color-warning-mild);
}

.date-picker-stub.warning:focus,
.date-picker-stub.warning.open {
  border-color: var(--ty-color-warning-mild);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

/* Text content */
.stub-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  color: inherit;
  pointer-events: none;
}

.stub-text.placeholder {
  color: var(--ty-date-picker-placeholder);
}

/* Icons */
.stub-icons {
  display: flex;
  align-items: center;
  gap: var(--ty-spacing-1);
  position: absolute;
  right: var(--ty-spacing-3);
  top: 50%;
  transform: translateY(-50%);
  height: 1rem;
  pointer-events: none;
  z-index: 2;
}

.stub-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--ty-color-neutral-soft);
  cursor: pointer;
  border-radius: var(--ty-radius-sm);
  transition: all 0.15s ease;
  pointer-events: auto;
}

.stub-clear:hover {
  color: var(--ty-color-negative);
  background-color: var(--ty-bg-negative-faint);
}

.stub-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  color: var(--ty-color-neutral-soft);
}

.date-picker-stub:hover .stub-arrow {
  color: var(--ty-color-neutral);
}

.date-picker-stub:focus .stub-arrow,
.date-picker-stub.open .stub-arrow {
  color: var(--ty-date-picker-border-focus);
}

/* Calendar dialog (showModal positioning system) */
.calendar-dialog {
  position: fixed;
  flex-direction: column;
  max-width: 90vw;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  box-sizing: border-box;
  padding: var(--calendar-padding, 8px);

  /* Hidden by default */
  opacity: 0;
  transition: opacity 200ms ease;

  transform: translate(var(--calendar-offset-x, 0px), var(--calendar-offset-y, 0px));
  top: -1000px;
  left: -1000px;
}

/* Direction-based positioning with CSS classes */
.calendar-dialog.position-below {
  left: var(--calendar-x);
  top: var(--calendar-y);
}

.calendar-dialog.position-above {
  left: var(--calendar-x);
  bottom: var(--calendar-y);
  top: auto;
  flex-direction: column-reverse;
}

.calendar-dialog.open {
  opacity: 1;
}

.calendar-dialog::backdrop {
  background: transparent
}

/* Calendar content container */
.calendar-content {
  background-color: var(--ty-calendar-surface-bg);
  border: 1px solid var(--ty-calendar-surface-border);
  border-radius: var(--ty-calendar-surface-radius);
  box-shadow: var(--ty-calendar-surface-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Native date input for mobile */
/* Native input is invisible — used only to trigger the OS picker */
.native-date-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  cursor: pointer;
  z-index: 1;
}

.native-date-input::-webkit-calendar-picker-indicator {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  cursor: pointer;
}

/* Time input section */
.time-section {
  display: flex;
  min-height: 2.5rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--ty-calendar-time-border);
  background-color: var(--ty-calendar-time-bg);
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.time-label {
  font-size: var(--ty-font-sm);
  font-weight: 500;
  color: var(--ty-calendar-time-label-color);
  flex-shrink: 0;
}

.time-input {
  width: 3.5rem;
  border: none;
  border-radius: var(--ty-radius-sm);
  background: transparent;
  color: var(--ty-calendar-time-input-color);
  font-family: var(--ty-font-sans);
  font-size: var(--ty-font-sm);
  text-align: center;
  outline: none;
}

.time-input::placeholder {
  color: var(--ty-calendar-time-placeholder-color);
}

.time-icon {
  display: flex;
  align-items: center;
  color: var(--ty-calendar-time-icon-color);
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
`;
