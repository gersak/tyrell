/**
 * Styles for ty-textarea component
 * Enhanced textarea with auto-resize functionality
 */

export const textareaStyles = `
:host {
  display: block;
  font-family: var(--ty-font-sans);
  width: 100%;
}

.textarea-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  /* For absolute positioned dummy element */
}

.textarea-wrapper {
  position: relative;
  width: 100%;
}

/* Custom scrollbar track positioning within textarea border */
.textarea-wrapper .ty-scrollbar-track-y {
  top: 2px;
  right: 2px;
  bottom: 2px;
  border-radius: 0 4px 4px 0;
}

/* ===== LABEL STYLING ===== */

.textarea-label {
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-weight: var(--ty-font-medium);
  color: var(--ty-label-color);
  margin-bottom: 6px;
  padding-left: 12px;
}

/* Required indicator - using SVG icon instead of CSS */
.required-icon {
  display: inline-flex;
  align-items: center;
  color: var(--ty-color-danger);
  width: 12px;
  height: 12px;
  vertical-align: middle;
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

/* Error state for textareas */
textarea.error {
  border-color: var(--ty-color-danger);
  background: var(--ty-bg-danger-soft);
}

textarea.error:focus {
  border-color: var(--ty-color-danger-mild);
  box-shadow: 0 0 0 3px var(--input-shadow-focus, var(--ty-input-shadow-focus));
}

/* ===== TEXTAREA BASE STYLING ===== */

textarea {
  /* Base appearance — elegant and minimal like input */
  box-sizing: border-box;
  width: 100%;
  border: 1px solid var(--input-border, var(--ty-input-border));
  border-radius: 6px;
  background: var(--input-bg, var(--ty-input-bg));
  color: var(--input-color, var(--ty-input-color));
  font-family: inherit;
  /* Linear-paired typography */
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-weight: var(--ty-font-normal);
  transition: all 0.15s ease-in-out;
  outline: none;

  /* Default size (md) - refined spacing */
  min-height: 80px;
  /* Larger than input for multiline */
  padding: 12px 12px;
  /* Slightly larger padding for text areas */

  /* Auto-resize specific styles */
  overflow: hidden;
  /* Hide scrollbars since we're auto-resizing */
  resize: none;
  /* Disable manual resize by default */

  /* Ensure consistent text wrapping */
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Hide native scrollbar for webkit when custom scrollbar is active
   (scrollbar-width: none handles Firefox; this handles Chrome/Safari) */
:host([data-custom-scroll]) textarea::-webkit-scrollbar {
  display: none;
}

/* Focus state - elegant blue glow like input */
textarea:focus {
  border-color: var(--input-border-focus, var(--ty-input-border-focus));
  box-shadow: 0 0 0 3px var(--input-shadow-focus, var(--ty-input-shadow-focus));
  background: var(--input-bg, var(--ty-input-bg));
}

/* Hover state - subtle feedback */
textarea:hover:not(:disabled) {
  border-color: var(--input-border-hover, var(--ty-input-border-hover));
}

/* Disabled state - refined opacity */
textarea:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background: var(--input-disabled-bg, var(--ty-input-disabled-bg));
  border-color: var(--input-disabled-border, var(--ty-input-disabled-border));
  color: var(--input-disabled-color, var(--ty-input-disabled-color));
}

/* Placeholder styling - subtle and elegant */
textarea::placeholder {
  color: var(--input-placeholder, var(--ty-input-placeholder));
  font-weight: 400;
}

/* ===== RESIZE CONTROL OPTIONS ===== */

/* Allow manual resizing */
textarea.resize-both {
  resize: both;
}

textarea.resize-horizontal {
  resize: horizontal;
}

textarea.resize-vertical {
  resize: vertical;
}

textarea.resize-none {
  resize: none;
}

/* Auto-resize mode (default) disables manual resize */
textarea:not(.resize-both):not(.resize-horizontal):not(.resize-vertical) {
  resize: none;
}

/* ===== DUMMY ELEMENT FOR AUTO-RESIZE ===== */

.textarea-dummy {
  /* Hidden element that measures text height */
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  visibility: hidden !important;
  white-space: pre-wrap !important;
  word-break: break-word !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  pointer-events: none !important;
  z-index: -1 !important;

  /* Ensure it has the same text behavior as textarea */
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

/* ===== SIZE MODIFIERS ===== */

/* Extra Small */
textarea.xs {
  min-height: 64px;
  padding: 8px 10px;
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
}

/* Small */
textarea.sm {
  min-height: 72px;
  padding: 10px 10px;
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
}

/* Medium (default) */
textarea.md {
  min-height: 80px;
  padding: 12px 12px;
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
}

/* Large */
textarea.lg {
  min-height: 96px;
  padding: 14px 14px;
  font-size: var(--ty-font-base);
  line-height: var(--ty-leading-base);
  letter-spacing: var(--ty-tracking-base);
}

/* Extra Large */
textarea.xl {
  min-height: 112px;
  padding: 16px 16px;
  font-size: var(--ty-font-lg);
  line-height: var(--ty-leading-lg);
  letter-spacing: var(--ty-tracking-lg);
}

/* ===== ACCESSIBILITY ENHANCEMENTS ===== */

textarea:focus-visible {
  outline: none;
  /* We use box-shadow instead */
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  textarea {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  textarea {
    transition: none;
  }

  .textarea-dummy {
    transition: none;
  }
}

/* ===== CONTAINER-AWARE RESPONSIVE BEHAVIOR ===== */

/* Scale down on smaller containers using container queries */
@container (max-width: 480px) {
  textarea.lg {
    font-size: var(--ty-font-sm);
    line-height: var(--ty-leading-sm);
    letter-spacing: var(--ty-tracking-sm);
    padding: 12px 12px;
    min-height: 80px;
  }

  textarea.xl {
    font-size: var(--ty-font-base);
    line-height: var(--ty-leading-base);
    letter-spacing: var(--ty-tracking-base);
    padding: 14px 14px;
    min-height: 96px;
  }
}

@container (max-width: 320px) {
  textarea.xl {
    font-size: var(--ty-font-sm);
    line-height: var(--ty-leading-sm);
    letter-spacing: var(--ty-tracking-sm);
    padding: 12px 12px;
    min-height: 80px;
  }
}

/* Fallback for browsers without container query support */
@media (max-width: 640px) {
  textarea.lg {
    font-size: var(--ty-font-sm);
    line-height: var(--ty-leading-sm);
    letter-spacing: var(--ty-tracking-sm);
    padding: 12px 12px;
    min-height: 80px;
  }

  textarea.xl {
    font-size: var(--ty-font-base);
    line-height: var(--ty-leading-base);
    letter-spacing: var(--ty-tracking-base);
    padding: 14px 14px;
    min-height: 96px;
  }
}

@media (max-width: 480px) {
  textarea.xl {
    font-size: var(--ty-font-sm);
    line-height: var(--ty-leading-sm);
    letter-spacing: var(--ty-tracking-sm);
    padding: 12px 12px;
    min-height: 80px;
  }
}

/* ===== ANIMATION AND TRANSITIONS ===== */

/* Smooth height transitions for auto-resize */
textarea {
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    height 0.1s ease-out;
  /* Smooth height changes */
}

/* Disable height transition on focus to avoid jarring effect */
textarea:focus {
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out,
    background-color 0.15s ease-in-out;
}

/* For users who prefer reduced motion, disable height transitions */
@media (prefers-reduced-motion: reduce) {
  textarea {
    transition: none;
  }
}
`
