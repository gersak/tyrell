/**
 * Wizard Component Styles
 *
 * CSS Parts (for styling via ::part):
 * - indicators-wrapper: The header containing step indicators
 * - progress-line: The background progress track
 * - step-circle: Individual step circle indicators
 * - panels-container: The content viewport
 *
 * Theming — two override granularities:
 *
 * 1. Accent aliases (broad retheming — one variable shifts a whole state):
 *    --ty-wizard-active-accent, --ty-wizard-completed-accent,
 *    --ty-wizard-error-accent, --ty-wizard-pending-accent
 *
 * 2. Fine-grained tokens (surgical control — see :host block below):
 *    --ty-wizard-{region}-{property}
 */

export const wizardStyles = `
/* ============================================================================
   Theming Tokens
   All defaults chain back to global --ty-color-* / --ty-surface-* tokens.
   Override on the host element or a wrapping container.
   ============================================================================ */

:host {
  display: block;
  width: var(--ty-wizard-width, 100%);   /* set by width attribute — not a public token */
  height: var(--ty-wizard-height, 700px); /* set by height attribute — not a public token */
  box-sizing: border-box;

  /* Accent aliases — override one to shift the matching circle, glow, and progress fill */
  --ty-wizard-active-accent:    var(--ty-color-primary);
  --ty-wizard-completed-accent: var(--ty-color-success);
  --ty-wizard-error-accent:     var(--ty-color-danger);
  --ty-wizard-pending-accent:   var(--ty-color-neutral);

  /* Container */
  --ty-wizard-bg:     var(--ty-surface-floating);
  --ty-wizard-border: var(--ty-border);
  --ty-wizard-radius: 12px;
  --ty-wizard-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);

  /* Header strip */
  --ty-wizard-header-bg:      var(--ty-surface-content);
  --ty-wizard-header-border:  var(--ty-border-soft, var(--ty-border));
  --ty-wizard-header-padding: 24px 24px 16px;

  /* Progress line */
  --ty-wizard-progress-track:  var(--ty-border);
  --ty-wizard-progress-fill:   var(--ty-wizard-completed-accent);
  --ty-wizard-progress-height: 2px;

  /* Transitions */
  --ty-wizard-transition-duration: 300ms;
  --ty-wizard-transition-easing:   ease-in-out;

  /* Circle geometry */
  --ty-wizard-circle-size:         32px;
  --ty-wizard-circle-border-width: 2px;

  /* Step circle — completed */
  --ty-wizard-completed-bg:     var(--ty-wizard-completed-accent);
  --ty-wizard-completed-border: var(--ty-color-success-strong);
  --ty-wizard-completed-color:  white;
  --ty-wizard-completed-glow:   color-mix(in srgb, var(--ty-wizard-completed-accent) 10%, transparent);

  /* Step circle — active */
  --ty-wizard-active-bg:     var(--ty-wizard-active-accent);
  --ty-wizard-active-border: var(--ty-color-primary-strong);
  --ty-wizard-active-color:  white;
  --ty-wizard-active-glow:   color-mix(in srgb, var(--ty-wizard-active-accent) 10%, transparent);

  /* Step circle — pending */
  --ty-wizard-pending-bg:     var(--ty-surface-elevated);
  --ty-wizard-pending-border: var(--ty-border);
  --ty-wizard-pending-color:  var(--ty-text-soft);

  /* Step circle — error */
  --ty-wizard-error-bg:     var(--ty-wizard-error-accent);
  --ty-wizard-error-border: var(--ty-color-danger-strong);
  --ty-wizard-error-color:  white;
  --ty-wizard-error-glow:   color-mix(in srgb, var(--ty-wizard-error-accent) 10%, transparent);

  /* Labels */
  --ty-wizard-label-color:          var(--ty-text);
  --ty-wizard-label-active-color:   var(--ty-text-strong);
  --ty-wizard-label-inactive-color: var(--ty-text-soft);
  --ty-wizard-label-size:           var(--ty-font-sm, 14px);
  --ty-wizard-label-weight:         var(--ty-font-semibold, 600);

  /* Descriptions */
  --ty-wizard-description-color:        var(--ty-text-soft);
  --ty-wizard-description-active-color: var(--ty-text);
  --ty-wizard-description-size:         var(--ty-font-xs, 12px);

  /* Panels viewport */
  --ty-wizard-panels-bg: var(--ty-surface-elevated);

  /* Focus */
  --ty-wizard-focus-outline: var(--ty-wizard-active-accent);
}

.wizard-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  border-radius: var(--ty-wizard-radius);
  border: 1px solid var(--ty-wizard-border);
  background: var(--ty-wizard-bg);
  box-shadow: var(--ty-wizard-shadow);
  overflow: hidden;
}

/* ===================================== */
/* Step Indicators Wrapper               */
/* ===================================== */

.step-indicators-wrapper {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: relative;
  padding: var(--ty-wizard-header-padding);
  border-bottom: 1px solid var(--ty-wizard-header-border);
  background: var(--ty-wizard-header-bg);
}

/* ===================================== */
/* Progress Line (behind step circles)   */
/* ===================================== */

.progress-line {
  position: absolute;
  /*
   * With equal-width indicators (flex: 1), each takes 100%/N of the width.
   * Circle centers sit at 50%/N from the left edge of each indicator.
   * Inset = 50% / step-count from each side keeps the line between circle centres.
   */
  left: calc(50% / var(--ty-wizard-step-count, 4));
  right: calc(50% / var(--ty-wizard-step-count, 4));
  top: calc(var(--ty-wizard-circle-size, 32px) / 2 - 1px);
  height: var(--ty-wizard-progress-height);
  background: var(--ty-wizard-progress-track);
  z-index: 0;
  pointer-events: none;
  transition: opacity var(--ty-wizard-transition-duration) var(--ty-wizard-transition-easing);
}

.progress-overlay {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--ty-wizard-progress-fill);
  transition: width var(--ty-wizard-transition-duration) var(--ty-wizard-transition-easing);
  will-change: width;
}

/* ===================================== */
/* Step Indicators Container             */
/* ===================================== */

.step-indicators {
  display: flex;
  align-items: flex-start;
  position: relative;
}

/* ===================================== */
/* Individual Step Indicator             */
/* ===================================== */

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
  transition: opacity 200ms;
  flex: 1;
  min-width: 0;
}

.step-indicator[aria-disabled="true"] {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.step-indicator:focus-visible {
  outline: 2px solid var(--ty-wizard-focus-outline);
  outline-offset: 4px;
  border-radius: 50%;
}

/* ===================================== */
/* Step Circle                           */
/* ===================================== */

.step-circle {
  width: var(--ty-wizard-circle-size);
  height: var(--ty-wizard-circle-size);
  border-radius: 50%;
  border: var(--ty-wizard-circle-border-width) solid;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  transition: all var(--ty-wizard-transition-duration) var(--ty-wizard-transition-easing);
  box-sizing: border-box;
  flex-shrink: 0;
}

.step-circle[data-state="completed"] {
  background: var(--ty-wizard-completed-bg);
  border-color: var(--ty-wizard-completed-border);
  color: var(--ty-wizard-completed-color);
  box-shadow: 0 0 0 4px var(--ty-wizard-completed-glow);
}

.step-circle[data-state="active"] {
  background: var(--ty-wizard-active-bg);
  border-color: var(--ty-wizard-active-border);
  color: var(--ty-wizard-active-color);
  box-shadow: 0 0 0 4px var(--ty-wizard-active-glow);
}

.step-circle[data-state="pending"] {
  background: var(--ty-wizard-pending-bg);
  border-color: var(--ty-wizard-pending-border);
  color: var(--ty-wizard-pending-color);
}

.step-circle[data-state="error"] {
  background: var(--ty-wizard-error-bg);
  border-color: var(--ty-wizard-error-border);
  color: var(--ty-wizard-error-color);
  box-shadow: 0 0 0 4px var(--ty-wizard-error-glow);
}

/* ===================================== */
/* Step Text Container                   */
/* ===================================== */

.step-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

/* ===================================== */
/* Step Label                            */
/* ===================================== */

.step-label {
  font-size: var(--ty-wizard-label-size);
  font-weight: var(--ty-wizard-label-weight);
  color: var(--ty-wizard-label-color);
  transition: color 200ms;
}

.step-indicator[aria-selected="true"] .step-label {
  color: var(--ty-wizard-label-active-color);
}

.step-indicator[aria-selected="false"] .step-label {
  color: var(--ty-wizard-label-inactive-color);
}

/* ===================================== */
/* Step Description                      */
/* ===================================== */

.step-description {
  font-size: var(--ty-wizard-description-size);
  font-weight: var(--ty-font-normal, 400);
  color: var(--ty-wizard-description-color);
  transition: color 200ms;
  text-align: center;
  max-width: 120px;
}

.step-indicator[aria-selected="true"] .step-description {
  color: var(--ty-wizard-description-active-color);
}

/* ===================================== */
/* Custom Indicator Content via Slots    */
/* ===================================== */

::slotted([slot^="indicator-"]) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* ===================================== */
/* Panels Viewport                       */
/* ===================================== */

.panels-viewport {
  position: relative;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  background: var(--ty-wizard-panels-bg);
}

/* ===================================== */
/* Panels Wrapper (slides horizontally)  */
/* ===================================== */

.panels-wrapper {
  display: flex;
  height: 100%;
  transition: transform var(--ty-wizard-transition-duration) var(--ty-wizard-transition-easing);
  will-change: transform;
}

/* ===================================== */
/* Slotted Step Panels                   */
/* ===================================== */

::slotted(ty-step) {
  width: var(--ty-wizard-width, 100%);
  height: 100%;
  flex-shrink: 0;
}

/* ===================================== */
/* Accessibility & Motion Preferences    */
/* ===================================== */

@media (prefers-reduced-motion: reduce) {
  .panels-wrapper {
    transition-duration: 0ms !important;
  }

  .progress-overlay {
    transition-duration: 0ms !important;
  }

  .step-circle {
    transition-duration: 0ms !important;
  }

  .progress-line {
    transition-duration: 0ms !important;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
`;
