/**
 * Wizard Component Styles
 *
 * CSS Parts (::part): indicators-wrapper, progress-line, step-circle,
 * panels-container. Theming knobs are declared on :host below; per-state
 * circles read the matching accent var directly (no `-bg` indirection), and
 * the brand-layer flavor seeds cascade through for per-shade control.
 */

export const wizardStyles = `
/* Theming tokens — every default chains back to the brand layer / global
   scale tokens. */

:host {
  display: block;
  width: var(--ty-wizard-width, 100%);   /* set by width attribute — not a public token */
  height: var(--ty-wizard-height, 700px); /* set by height attribute — not a public token */
  box-sizing: border-box;

  /* State accents — the primary override surface. One variable retints the
   * matching circle background, border, and glow. */
  --ty-wizard-active-accent:    var(--ty-color-primary);
  --ty-wizard-completed-accent: var(--ty-color-success);
  --ty-wizard-error-accent:     var(--ty-color-danger);
  --ty-wizard-pending-accent:   var(--ty-color-neutral);

  /* Container chrome — routes through global scales. Override --ty-radius-lg
   * or --ty-shadow-md app-wide and the wizard follows; override these locally
   * to give the wizard a distinct look. */
  --ty-wizard-bg:     var(--ty-surface-floating);
  --ty-wizard-border: var(--ty-border);
  --ty-wizard-radius: var(--ty-radius-lg, 12px);
  --ty-wizard-shadow: var(--ty-shadow-md, 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1));

  --ty-wizard-header-bg:      var(--ty-surface-content);
  --ty-wizard-header-border:  var(--ty-border-soft, var(--ty-border));
  --ty-wizard-header-padding: 24px 24px 16px;

  --ty-wizard-progress-track:  var(--ty-border);
  --ty-wizard-progress-fill:   var(--ty-wizard-completed-accent);
  --ty-wizard-progress-height: 2px;

  /* Motion — routes through global motion tokens if defined. */
  --ty-wizard-transition-duration: var(--ty-transition-duration, 300ms);
  --ty-wizard-transition-easing:   var(--ty-transition-easing, ease-in-out);

  --ty-wizard-circle-size:         32px;
  --ty-wizard-circle-border-width: 2px;

  --ty-wizard-panels-bg: var(--ty-surface-elevated);

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

.step-indicators-wrapper {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: relative;
  padding: var(--ty-wizard-header-padding);
  border-bottom: 1px solid var(--ty-wizard-header-border);
  background: var(--ty-wizard-header-bg);
}

/* Progress line, behind the step circles */
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

.step-indicators {
  display: flex;
  align-items: flex-start;
  position: relative;
}

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
  transition: var(--ty-local-transition, all var(--ty-wizard-transition-duration) var(--ty-wizard-transition-easing));
  box-sizing: border-box;
  flex-shrink: 0;
}

.step-circle[data-state="completed"] {
  background: var(--ty-wizard-completed-accent);
  border-color: var(--ty-color-success-strong);
  /* Derived from the accent this circle actually paints, not from
     --ty-solid-success-fg: the two diverge in dark mode (--ty-solid-l
     dims solid fills by 0.25 L), which stranded white text at 3.5:1. */
  color: oklch(
    from var(--ty-wizard-completed-accent)
      clamp(0, (var(--ty-solid-fg-threshold, 0.6) - l) * 1000, 1) 0 0
  );
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--ty-wizard-completed-accent) 12%, transparent);
}

.step-circle[data-state="active"] {
  background: var(--ty-wizard-active-accent);
  border-color: var(--ty-color-primary-strong);
  color: oklch(
    from var(--ty-wizard-active-accent)
      clamp(0, (var(--ty-solid-fg-threshold, 0.6) - l) * 1000, 1) 0 0
  );
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--ty-wizard-active-accent) 12%, transparent);
}

.step-circle[data-state="pending"] {
  background: var(--ty-surface-elevated);
  border-color: var(--ty-border);
  color: var(--ty-color-neutral);
}

.step-circle[data-state="error"] {
  background: var(--ty-wizard-error-accent);
  border-color: var(--ty-color-danger-strong);
  color: oklch(
    from var(--ty-wizard-error-accent)
      clamp(0, (var(--ty-solid-fg-threshold, 0.6) - l) * 1000, 1) 0 0
  );
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--ty-wizard-error-accent) 12%, transparent);
}

.step-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.step-label {
  font-size: var(--ty-font-sm, 14px);
  font-weight: var(--ty-font-semibold, 600);
  color: var(--ty-color-neutral);
  transition: var(--ty-local-transition, color 200ms);
}

.step-indicator[aria-selected="true"] .step-label {
  color: var(--ty-color-neutral-strong);
}

.step-indicator[aria-selected="false"] .step-label {
  color: var(--ty-color-neutral);
}

.step-description {
  font-size: var(--ty-font-xs, 12px);
  font-weight: var(--ty-font-normal, 400);
  color: var(--ty-color-neutral);
  transition: var(--ty-local-transition, color 200ms);
  text-align: center;
  max-width: 120px;
}

.step-indicator[aria-selected="true"] .step-description {
  color: var(--ty-color-neutral-bold);
}

/* Custom indicator content via slots */
::slotted([slot^="indicator-"]) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.panels-viewport {
  position: relative;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  background: var(--ty-wizard-panels-bg);
}

/* Panels wrapper slides horizontally */
.panels-wrapper {
  display: flex;
  height: 100%;
  transition: transform var(--ty-wizard-transition-duration) var(--ty-wizard-transition-easing);
  will-change: transform;
}

::slotted(ty-step) {
  width: var(--ty-wizard-width, 100%);
  height: 100%;
  flex-shrink: 0;
}

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
