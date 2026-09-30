/**
 * Wizard Component Styles
 *
 * Inline rail: indicator + label side by side, connectors between steps that
 * fill as steps complete. One accent (active = where you are); completed is
 * solid ink with a check, pending a faint ring, error a danger ring with "!".
 * When the labels don't fit, the rail collapses to "Step N of M" over a
 * segment bar (measured in JS, see updateCompact).
 *
 * CSS Parts (::part): indicators-wrapper, step-circle, progress (segment bar),
 * panels-container.
 */

export const wizardStyles = `
:host {
  display: block;
  width: var(--ty-wizard-width, 100%);   /* set by width attribute — not a public token */
  box-sizing: border-box;

  /* State accents. Completed is ink, not green: one accent marks where you
   * are, color is kept for "here" and for problems. */
  --ty-wizard-active-accent:    var(--ty-color-primary);
  --ty-wizard-completed-accent: var(--ty-text-strong, var(--ty-color-neutral-strong));
  --ty-wizard-error-accent:     var(--ty-color-danger);
  --ty-wizard-pending-accent:   color-mix(in oklab, var(--ty-text, currentColor) 35%, transparent);

  /* Container chrome. One surface, hairline divider, no shadow by default:
   * the wizard is a layout primitive, the page decides elevation. */
  --ty-wizard-bg:     var(--ty-surface-elevated);
  --ty-wizard-border: var(--ty-border);
  --ty-wizard-radius: var(--ty-radius-lg, 12px);
  --ty-wizard-shadow: none;

  --ty-wizard-header-bg:      transparent;
  --ty-wizard-header-border:  var(--ty-wizard-border);
  --ty-wizard-header-padding: 14px 20px;

  --ty-wizard-progress-track:  var(--ty-border);
  --ty-wizard-progress-fill:   var(--ty-wizard-completed-accent);
  --ty-wizard-progress-height: 1.5px;

  /* Panel slide — same motion as ty-tabs. */
  --ty-wizard-transition-duration: var(--ty-transition-duration, 300ms);
  --ty-wizard-transition-easing:   var(--ty-transition-easing, ease-in-out);

  --ty-wizard-circle-size:         24px;
  --ty-wizard-circle-border-width: 1.5px;

  --ty-wizard-panels-bg: transparent;

  --ty-wizard-focus-outline: var(--ty-wizard-active-accent);
}

.wizard-container {
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
  flex-shrink: 0;
  padding: var(--ty-wizard-header-padding);
  border-bottom: 1px solid var(--ty-wizard-header-border);
  background: var(--ty-wizard-header-bg);
}

/* ---------- Rail ---------- */

.step-indicators {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  /* Content basis: labels keep their width, extra space goes to connectors
     (equally). If they don't fit at all, JS switches to the compact header. */
  flex: 1 1 auto;
  min-width: 0;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  outline: none;
}

.step-indicator:last-child {
  flex: 0 0 auto;
}

/* Connector to the next step — a pseudo-element, so the tablist owns only tabs. */
.step-indicator:not(:last-child)::after {
  content: "";
  flex: 1 1 auto;
  min-width: 16px;
  height: var(--ty-wizard-progress-height);
  border-radius: 1px;
  margin-left: 4px;
  background: var(--ty-wizard-progress-track);
  transition: background var(--ty-wizard-transition-duration) var(--ty-wizard-transition-easing);
}

.step-indicator[data-done="true"]:not(:last-child)::after {
  background: var(--ty-wizard-progress-fill);
}

.step-indicator[aria-disabled="true"] {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

.step-indicator:focus-visible .step-circle {
  outline: 2px solid var(--ty-wizard-focus-outline);
  outline-offset: 2px;
}

.step-circle {
  width: var(--ty-wizard-circle-size);
  height: var(--ty-wizard-circle-size);
  border-radius: 50%;
  border: var(--ty-wizard-circle-border-width) solid;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;
  font-size: calc(var(--ty-wizard-circle-size) * 0.46);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  transition: var(--ty-local-transition, background-color var(--ty-wizard-transition-duration) var(--ty-wizard-transition-easing), border-color var(--ty-wizard-transition-duration) var(--ty-wizard-transition-easing), color var(--ty-wizard-transition-duration) var(--ty-wizard-transition-easing));
}

.step-circle svg {
  width: 58%;
  height: 58%;
}

.step-circle[data-state="completed"] {
  background: var(--ty-wizard-completed-accent);
  border-color: var(--ty-wizard-completed-accent);
  /* Derived from the accent this circle paints, so any override stays legible. */
  color: oklch(
    from var(--ty-wizard-completed-accent)
      clamp(0, (var(--ty-solid-fg-threshold, 0.57) - l) * 1000, 1) 0 0
  );
}

.step-circle[data-state="active"] {
  background: color-mix(in oklab, var(--ty-wizard-active-accent) 12%, var(--ty-wizard-bg));
  border-color: var(--ty-wizard-active-accent);
  /* Nudged toward the text color so the number clears 4.5:1 on its tint. */
  color: color-mix(in oklab, var(--ty-wizard-active-accent) 75%, var(--ty-text-strong, currentColor));
}

.step-circle[data-state="pending"] {
  background: transparent;
  border-color: var(--ty-wizard-pending-accent);
  color: var(--ty-text-soft, var(--ty-color-neutral));
}

.step-circle[data-state="error"] {
  background: color-mix(in oklab, var(--ty-wizard-error-accent) 12%, var(--ty-wizard-bg));
  border-color: var(--ty-wizard-error-accent);
  color: color-mix(in oklab, var(--ty-wizard-error-accent) 75%, var(--ty-text-strong, currentColor));
}

.step-text {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}

.step-label {
  font-size: var(--ty-font-sm, 14px);
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--ty-text-soft, var(--ty-color-neutral));
  transition: var(--ty-local-transition, color 200ms);
}

.step-indicator[data-state="completed"] .step-label,
.step-indicator[data-state="active"] .step-label {
  color: var(--ty-text-strong, var(--ty-color-neutral-strong));
}

.step-indicator[aria-selected="true"] .step-label {
  font-weight: 600;
}

.step-indicator[data-state="error"] .step-label {
  color: var(--ty-wizard-error-accent);
}

/* Only where you are (or what's wrong) gets a second line. Hidden ones keep
 * their width (height 0), so connectors don't shift as you move. */
.step-description {
  height: 0;
  visibility: hidden;
  font-size: var(--ty-font-xs, 12px);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--ty-text-soft, var(--ty-color-neutral));
}

.step-indicator[aria-selected="true"] .step-description,
.step-indicator[data-state="error"] .step-description {
  height: auto;
  /* inherit, not visible: the rail is visibility:hidden in compact mode. */
  visibility: inherit;
}

.step-indicator:hover:not([aria-selected="true"]) .step-label {
  color: var(--ty-text-strong, var(--ty-color-neutral-strong));
}

/* Custom indicator content via slots */
::slotted([slot^="indicator-"]) {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---------- Compact header (narrow containers) ---------- */

.step-compact {
  display: none;
  flex-direction: column;
  gap: 10px;
}

.compact-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.compact-where {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  white-space: nowrap;
}

.compact-count {
  font-size: var(--ty-font-xs, 12px);
  color: var(--ty-text-soft, var(--ty-color-neutral));
}

.compact-count::after {
  content: "·";
  margin-left: 6px;
  color: var(--ty-text-faint, var(--ty-color-neutral));
}

.compact-label {
  font-size: var(--ty-font-sm, 14px);
  font-weight: 600;
  color: var(--ty-text-strong, var(--ty-color-neutral-strong));
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-description {
  font-size: var(--ty-font-xs, 12px);
  color: var(--ty-text-faint, var(--ty-color-neutral));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-segments {
  display: flex;
  gap: 4px;
}

.compact-segment {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: var(--ty-wizard-progress-track);
  transition: background var(--ty-wizard-transition-duration) var(--ty-wizard-transition-easing);
}

.compact-segment[data-state="completed"] { background: var(--ty-wizard-progress-fill); }
.compact-segment[data-state="active"]    { background: var(--ty-wizard-active-accent); }
.compact-segment[data-state="error"]     { background: var(--ty-wizard-error-accent); }

/* .compact is set from JS when the rail's natural width doesn't fit (or a
   vertical wizard is under 360px). The rail stays laid out, hidden, so it
   can still be measured. */
.wizard-container.compact { flex-direction: column; }
.wizard-container.compact .step-indicators {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
  width: max-content;
}
.wizard-container.compact .step-compact { display: flex; }
.wizard-container.compact .step-indicators-wrapper {
  padding: var(--ty-wizard-header-padding);
  border-right: none;
  border-bottom: 1px solid var(--ty-wizard-header-border);
  min-width: 0;
}

/* ---------- Vertical ---------- */

:host([orientation="vertical"]) .wizard-container:not(.compact) {
  flex-direction: row;
}

:host([orientation="vertical"]) .wizard-container:not(.compact) .step-indicators-wrapper {
  border-bottom: none;
  border-right: 1px solid var(--ty-wizard-header-border);
  padding: 20px 18px;
  min-width: 170px;
  box-sizing: border-box;
}

:host([orientation="vertical"]) .step-indicators {
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}

:host([orientation="vertical"]) .step-indicator {
  flex: 0 0 auto;
  align-items: flex-start;
  gap: 10px;
  position: relative;
  padding-bottom: 26px;
}

:host([orientation="vertical"]) .step-indicator:last-child {
  padding-bottom: 0;
}

:host([orientation="vertical"]) .step-text {
  /* Center the label's line box on the circle (label line-height is 1.3). */
  padding-top: calc((var(--ty-wizard-circle-size) - var(--ty-font-sm, 14px) * 1.3) / 2);
}

:host([orientation="vertical"]) .step-indicator:not(:last-child)::after {
  position: absolute;
  left: calc(var(--ty-wizard-circle-size) / 2 - var(--ty-wizard-progress-height) / 2);
  top: calc(var(--ty-wizard-circle-size) + 4px);
  bottom: 4px;
  width: var(--ty-wizard-progress-height);
  height: auto;
  min-width: 0;
  margin: 0;
}

/* ---------- Panels ---------- */

.panels-viewport {
  position: relative;
  flex: 1;
  min-width: 0;
  height: var(--ty-wizard-panel-height, auto);
  overflow: hidden;
  background: var(--ty-wizard-panels-bg);
}

/* Carousel, like ty-tabs: steps sit side by side and the row slides. A flex
 * row is as tall as its tallest step, so the wizard doesn't jump between
 * steps (the height attribute overrides). */
.panels-wrapper {
  display: flex;
  height: 100%;
  transform: translateX(calc(var(--ty-wizard-active-index, 0) * -100%));
  transition: transform var(--ty-wizard-transition-duration) var(--ty-wizard-transition-easing);
  will-change: transform;
}

::slotted(ty-step) {
  flex: 0 0 100%;
  min-width: 0;
  transition: visibility 0s linear 0s;
}

/* Off-screen steps leave the tab order once the slide has finished. */
::slotted(ty-step:not([data-active="true"])) {
  visibility: hidden;
  pointer-events: none;
  transition: visibility 0s linear var(--ty-wizard-transition-duration);
}

@media (prefers-reduced-motion: reduce) {
  .panels-wrapper,
  ::slotted(ty-step),
  ::slotted(ty-step:not([data-active="true"])),
  .step-circle,
  .compact-segment,
  .step-indicator::after {
    transition-duration: 0ms !important;
    transition-delay: 0ms !important;
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
