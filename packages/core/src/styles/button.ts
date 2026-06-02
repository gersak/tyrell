/**
 * Button Component Styles
 *
 * Three appearance variants × six semantic flavors × three tones (+/base/-).
 * Each variant uses ONE token system:
 *   - solid    → --ty-solid-{flavor}-{strong|base|soft}  (bg) + --ty-solid-{flavor}-fg (text)
 *   - outlined → --ty-color-{flavor}-{strong|base|soft}  (text === border)
 *   - ghost    → --ty-color-{flavor}-{strong|base|soft}  (text), --ty-bg-{flavor}-soft (hover)
 *
 * Per-instance overrides via host CSS variables:
 *   --ty-button-bg, --ty-button-bg-hover, --ty-button-color, --ty-button-border
 */

export const buttonStyles = `
:host {
  display: inline-block;
  font-family: var(--ty-font-sans);
}

:host([wide]) {
  display: flex;
  flex-grow: 1;
}

button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ty-spacing-1);
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  font-weight: var(--ty-font-semibold);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  background: transparent;
  color: var(--ty-color-neutral);
  border: 1px solid transparent;
}

button:not(.action) {
  min-width: 4rem;
}

button:not(.pill) {
  border-radius: var(--ty-radius-md);
}

button.xs:not(.pill) { border-radius: var(--ty-button-radius-xs, var(--ty-radius-md)); }
button.sm:not(.pill) { border-radius: var(--ty-button-radius-sm, var(--ty-radius-md)); }
button.md:not(.pill) { border-radius: var(--ty-button-radius-md, var(--ty-radius-md)); }
button.lg:not(.pill) { border-radius: var(--ty-button-radius-lg, var(--ty-radius-md)); }
button.xl:not(.pill) { border-radius: var(--ty-button-radius-xl, var(--ty-radius-md)); }

button:focus-visible {
  outline: none;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* ===== LOADING STATE =====
   Spinner overlays the button center; original content kept in flow but
   hidden via visibility so width/height are preserved (no layout shift).
*/
.loader-icon {
  display: none;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  color: currentColor;
}
.loader-icon svg {
  width: 100%;
  height: 100%;
}
button.loading {
  cursor: wait;
}
button.loading > *:not(.loader-icon) {
  visibility: hidden;
}
button.loading > .loader-icon {
  display: inline-flex;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ty-button-spin 0.7s linear infinite;
}
@keyframes ty-button-spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  button.loading > .loader-icon {
    animation-duration: 1.6s;
  }
}

::slotted(*) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

::slotted(ty-icon) {
  flex-shrink: 0;
}

:host([wide]) button {
  flex-grow: 1;
}

/* ===== SIZES ===== */

button.xs {
  padding: 0 var(--ty-spacing-2);
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  gap: var(--ty-spacing-1);
  height: 1.375rem;
}

button.sm {
  padding: 0 var(--ty-spacing-2);
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  gap: var(--ty-spacing-1);
  height: 1.5rem;
}

button.md {
  padding: 0.375rem var(--ty-spacing-3);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  gap: var(--ty-spacing-2);
  height: 1.8rem;
}

button.lg {
  padding: 0.375rem var(--ty-spacing-4);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  gap: var(--ty-spacing-2);
  height: 2.1rem;
}

button.xl {
  padding: var(--ty-spacing-2) var(--ty-spacing-6);
  font-size: var(--ty-font-base);
  line-height: var(--ty-leading-base);
  letter-spacing: var(--ty-tracking-base);
  gap: var(--ty-spacing-2);
  height: 2.3rem;
}

/* ===== ACTION (icon-only square) ===== */

button.action {
  gap: 0px !important;
  height: 2rem;
  width: 2rem;
  padding: 0px !important;
}

button.action ::slotted(ty-icon) {
  height: 1rem;
  width: 1rem;
}

button.action.xs { height: 1.375rem; width: 1.375rem; }
button.action.xs ::slotted(ty-icon) { height: 0.75rem; width: 0.75rem; }

button.action.sm { height: 1.5rem; width: 1.5rem; }
button.action.sm ::slotted(ty-icon) { height: 0.875rem; width: 0.875rem; }

button.action.lg { height: 2.25rem; width: 2.25rem; }
button.action.lg ::slotted(ty-icon) { height: 1.125rem; width: 1.125rem; }

button.action.xl { height: 2.5rem; width: 2.5rem; }
button.action.xl ::slotted(ty-icon) { height: 1.25rem; width: 1.25rem; }

/* ===== PILL ===== */

button.pill {
  border-radius: 9999px;
  padding-left: 1.25em;
  padding-right: 1.25em;
}

button.pill.xs { padding-left: 1em; padding-right: 1em; }
button.pill.sm { padding-left: 1.125em; padding-right: 1.125em; }
button.pill.lg { padding-left: 1.5em; padding-right: 1.5em; }
button.pill.xl { padding-left: 1.75em; padding-right: 1.75em; }

button.pill:has(ty-icon:only-child),
button.pill:has(slot[name="start"]:only-child),
button.pill:has(slot[name="end"]:only-child) {
  padding: 0;
  aspect-ratio: 1;
  min-width: var(--ty-size-md);
}

button.pill.xs:has(ty-icon:only-child) { min-width: 1.375rem; min-height: 1.375rem; }
button.pill.sm:has(ty-icon:only-child) { min-width: 1.5rem; min-height: 1.5rem; }
button.pill.md:has(ty-icon:only-child) { min-width: 2rem; min-height: 2rem; }
button.pill.lg:has(ty-icon:only-child) { min-width: 2.25rem; min-height: 2.25rem; }
button.pill.xl:has(ty-icon:only-child) { min-width: 2.5rem; min-height: 2.5rem; }

/* ============================================================
   SOLID — saturated brand fill (uses --ty-solid-{flavor}-* tokens)
   Bare .solid rule = fallback for custom flavors (theme via --ty-button-*).
   ============================================================ */

button.solid {
  border: none;
  background: var(--ty-button-bg, var(--ty-solid-neutral));
  color:      var(--ty-button-color, var(--ty-solid-neutral-fg));
}
button.solid:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-button-bg, var(--ty-solid-neutral-strong)));
}

/* Primary */
button.solid.primary {
  background: var(--ty-button-bg, var(--ty-solid-primary));
  color:      var(--ty-button-color, var(--ty-solid-primary-fg));
}
button.solid.primary.tone-plus  { background: var(--ty-button-bg, var(--ty-solid-primary-strong)); }
button.solid.primary.tone-minus { background: var(--ty-button-bg, var(--ty-solid-primary-soft)); }
button.solid.primary:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-solid-primary-strong));
}
button.solid.primary:focus-visible {
  box-shadow: 0 0 0 2px var(--ty-focus-ring-gap), 0 0 0 4px var(--ty-color-primary);
}

/* Secondary */
button.solid.secondary {
  background: var(--ty-button-bg, var(--ty-solid-secondary));
  color:      var(--ty-button-color, var(--ty-solid-secondary-fg));
}
button.solid.secondary.tone-plus  { background: var(--ty-button-bg, var(--ty-solid-secondary-strong)); }
button.solid.secondary.tone-minus { background: var(--ty-button-bg, var(--ty-solid-secondary-soft)); }
button.solid.secondary:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-solid-secondary-strong));
}
button.solid.secondary:focus-visible {
  box-shadow: 0 0 0 2px var(--ty-focus-ring-gap), 0 0 0 4px var(--ty-color-secondary);
}

/* Success */
button.solid.success {
  background: var(--ty-button-bg, var(--ty-solid-success));
  color:      var(--ty-button-color, var(--ty-solid-success-fg));
}
button.solid.success.tone-plus  { background: var(--ty-button-bg, var(--ty-solid-success-strong)); }
button.solid.success.tone-minus { background: var(--ty-button-bg, var(--ty-solid-success-soft)); }
button.solid.success:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-solid-success-strong));
}
button.solid.success:focus-visible {
  box-shadow: 0 0 0 2px var(--ty-focus-ring-gap), 0 0 0 4px var(--ty-color-success);
}

/* Danger */
button.solid.danger {
  background: var(--ty-button-bg, var(--ty-solid-danger));
  color:      var(--ty-button-color, var(--ty-solid-danger-fg));
}
button.solid.danger.tone-plus  { background: var(--ty-button-bg, var(--ty-solid-danger-strong)); }
button.solid.danger.tone-minus { background: var(--ty-button-bg, var(--ty-solid-danger-soft)); }
button.solid.danger:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-solid-danger-strong));
}
button.solid.danger:focus-visible {
  box-shadow: 0 0 0 2px var(--ty-focus-ring-gap), 0 0 0 4px var(--ty-color-danger);
}

/* Warning */
button.solid.warning {
  background: var(--ty-button-bg, var(--ty-solid-warning));
  color:      var(--ty-button-color, var(--ty-solid-warning-fg));
}
button.solid.warning.tone-plus  { background: var(--ty-button-bg, var(--ty-solid-warning-strong)); }
button.solid.warning.tone-minus { background: var(--ty-button-bg, var(--ty-solid-warning-soft)); }
button.solid.warning:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-solid-warning-strong));
}
button.solid.warning:focus-visible {
  box-shadow: 0 0 0 2px var(--ty-focus-ring-gap), 0 0 0 4px var(--ty-color-warning);
}

/* Neutral */
button.solid.neutral {
  background: var(--ty-button-bg, var(--ty-solid-neutral));
  color:      var(--ty-button-color, var(--ty-solid-neutral-fg));
}
button.solid.neutral.tone-plus  { background: var(--ty-button-bg, var(--ty-solid-neutral-strong)); }
button.solid.neutral.tone-minus { background: var(--ty-button-bg, var(--ty-solid-neutral-soft)); }
button.solid.neutral:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-solid-neutral-strong));
}
button.solid.neutral:focus-visible {
  box-shadow: 0 0 0 2px var(--ty-focus-ring-gap), 0 0 0 4px var(--ty-color-neutral);
}

/* ============================================================
   OUTLINED — transparent bg, text === border (uses --ty-color-*)
   Bare .outlined rule = fallback for custom flavors. For outlined,
   text is bound to border color (the rule "text === border"), so the
   fallback chain prefers --ty-button-border, then --ty-button-color.
   ============================================================ */

button.outlined {
  background: transparent;
  color:        var(--ty-button-border, var(--ty-button-color, var(--ty-color-neutral)));
  border-color: var(--ty-button-border, var(--ty-button-color, var(--ty-color-neutral)));
}
button.outlined:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-neutral-soft));
}

/* Primary */
button.outlined.primary {
  color:        var(--ty-button-color,  var(--ty-color-primary));
  border-color: var(--ty-button-border, var(--ty-color-primary));
}
button.outlined.primary.tone-plus {
  color:        var(--ty-button-color,  var(--ty-color-primary-strong));
  border-color: var(--ty-button-border, var(--ty-color-primary-strong));
}
button.outlined.primary.tone-minus {
  color:        var(--ty-button-color,  var(--ty-color-primary-soft));
  border-color: var(--ty-button-border, var(--ty-color-primary-soft));
}
button.outlined.primary:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-primary-soft));
}

/* Secondary */
button.outlined.secondary {
  color:        var(--ty-button-color,  var(--ty-color-secondary));
  border-color: var(--ty-button-border, var(--ty-color-secondary));
}
button.outlined.secondary.tone-plus {
  color:        var(--ty-button-color,  var(--ty-color-secondary-strong));
  border-color: var(--ty-button-border, var(--ty-color-secondary-strong));
}
button.outlined.secondary.tone-minus {
  color:        var(--ty-button-color,  var(--ty-color-secondary-soft));
  border-color: var(--ty-button-border, var(--ty-color-secondary-soft));
}
button.outlined.secondary:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-secondary-soft));
}

/* Success */
button.outlined.success {
  color:        var(--ty-button-color,  var(--ty-color-success));
  border-color: var(--ty-button-border, var(--ty-color-success));
}
button.outlined.success.tone-plus {
  color:        var(--ty-button-color,  var(--ty-color-success-strong));
  border-color: var(--ty-button-border, var(--ty-color-success-strong));
}
button.outlined.success.tone-minus {
  color:        var(--ty-button-color,  var(--ty-color-success-soft));
  border-color: var(--ty-button-border, var(--ty-color-success-soft));
}
button.outlined.success:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-success-soft));
}

/* Danger */
button.outlined.danger {
  color:        var(--ty-button-color,  var(--ty-color-danger));
  border-color: var(--ty-button-border, var(--ty-color-danger));
}
button.outlined.danger.tone-plus {
  color:        var(--ty-button-color,  var(--ty-color-danger-strong));
  border-color: var(--ty-button-border, var(--ty-color-danger-strong));
}
button.outlined.danger.tone-minus {
  color:        var(--ty-button-color,  var(--ty-color-danger-soft));
  border-color: var(--ty-button-border, var(--ty-color-danger-soft));
}
button.outlined.danger:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-danger-soft));
}

/* Warning */
button.outlined.warning {
  color:        var(--ty-button-color,  var(--ty-color-warning));
  border-color: var(--ty-button-border, var(--ty-color-warning));
}
button.outlined.warning.tone-plus {
  color:        var(--ty-button-color,  var(--ty-color-warning-strong));
  border-color: var(--ty-button-border, var(--ty-color-warning-strong));
}
button.outlined.warning.tone-minus {
  color:        var(--ty-button-color,  var(--ty-color-warning-soft));
  border-color: var(--ty-button-border, var(--ty-color-warning-soft));
}
button.outlined.warning:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-warning-soft));
}

/* Neutral */
button.outlined.neutral {
  color:        var(--ty-button-color,  var(--ty-color-neutral));
  border-color: var(--ty-button-border, var(--ty-color-neutral));
}
button.outlined.neutral.tone-plus {
  color:        var(--ty-button-color,  var(--ty-color-neutral-strong));
  border-color: var(--ty-button-border, var(--ty-color-neutral-strong));
}
button.outlined.neutral.tone-minus {
  color:        var(--ty-button-color,  var(--ty-color-neutral-soft));
  border-color: var(--ty-button-border, var(--ty-color-neutral-soft));
}
button.outlined.neutral:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-neutral-soft));
}

/* ============================================================
   GHOST — text only, hover bg (uses --ty-color-* + --ty-bg-*-soft)
   Bare .ghost rule = fallback for custom flavors.
   ============================================================ */

button.ghost {
  background: transparent;
  border: none;
  color: var(--ty-button-color, var(--ty-color-neutral));
}
button.ghost:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-neutral-soft));
}

/* Primary */
button.ghost.primary            { color: var(--ty-button-color, var(--ty-color-primary)); }
button.ghost.primary.tone-plus  { color: var(--ty-button-color, var(--ty-color-primary-strong)); }
button.ghost.primary.tone-minus { color: var(--ty-button-color, var(--ty-color-primary-soft)); }
button.ghost.primary:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-primary-soft));
}

/* Secondary */
button.ghost.secondary            { color: var(--ty-button-color, var(--ty-color-secondary)); }
button.ghost.secondary.tone-plus  { color: var(--ty-button-color, var(--ty-color-secondary-strong)); }
button.ghost.secondary.tone-minus { color: var(--ty-button-color, var(--ty-color-secondary-soft)); }
button.ghost.secondary:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-secondary-soft));
}

/* Success */
button.ghost.success            { color: var(--ty-button-color, var(--ty-color-success)); }
button.ghost.success.tone-plus  { color: var(--ty-button-color, var(--ty-color-success-strong)); }
button.ghost.success.tone-minus { color: var(--ty-button-color, var(--ty-color-success-soft)); }
button.ghost.success:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-success-soft));
}

/* Danger */
button.ghost.danger            { color: var(--ty-button-color, var(--ty-color-danger)); }
button.ghost.danger.tone-plus  { color: var(--ty-button-color, var(--ty-color-danger-strong)); }
button.ghost.danger.tone-minus { color: var(--ty-button-color, var(--ty-color-danger-soft)); }
button.ghost.danger:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-danger-soft));
}

/* Warning */
button.ghost.warning            { color: var(--ty-button-color, var(--ty-color-warning)); }
button.ghost.warning.tone-plus  { color: var(--ty-button-color, var(--ty-color-warning-strong)); }
button.ghost.warning.tone-minus { color: var(--ty-button-color, var(--ty-color-warning-soft)); }
button.ghost.warning:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-warning-soft));
}

/* Neutral */
button.ghost.neutral            { color: var(--ty-button-color, var(--ty-color-neutral)); }
button.ghost.neutral.tone-plus  { color: var(--ty-button-color, var(--ty-color-neutral-strong)); }
button.ghost.neutral.tone-minus { color: var(--ty-button-color, var(--ty-color-neutral-soft)); }
button.ghost.neutral:hover:not(:disabled) {
  background: var(--ty-button-bg-hover, var(--ty-bg-neutral-soft));
}
`;
