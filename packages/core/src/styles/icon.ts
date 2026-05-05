/**
 * Icon Component Styles
 * PORTED FROM: clj/ty/components/icon.css
 */

export const iconStyles = `
:host {
  /* Display & Layout - CRITICAL: No containment to prevent paint deferral */
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  
  /* Dimensions with CSS variable support for flexibility */
  width: var(--ty-icon-size, 1em);
  height: var(--ty-icon-size, 1em);
  
  /* Enforce square aspect ratio */
  aspect-ratio: 1 / 1;
  
  
  /* Color & Transitions */
  color: inherit;
  transition: color var(--ty-transition-fast);
  
  /* Flex Behavior */
  flex-shrink: 0;
  
  /* Visibility - Force immediate rendering */
  visibility: visible !important;
  opacity: 1;
  
  /* ANTI-FLICKER: Force browser to paint immediately */
  will-change: contents;
  
  /* Prevent any sub-pixel rendering issues */
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
}

/* The SVG element inside shadow DOM (registry / fallback path) */
:host svg {
  width: 100%;
  height: 100%;
  display: block;

  /* Force immediate SVG rendering */
  will-change: auto;
  transform: translateZ(0);
}

/* Slotted SVG (server-side path: <ty-icon><svg>...</svg></ty-icon>).
   ::slotted() targets light-DOM children so they fill the host the same way
   shadow-DOM SVG does. Color is inherited from :host via currentColor. */
::slotted(svg),
::slotted(img) {
  width: 100%;
  height: 100%;
  display: block;
}

/* When used in slots, ensure proper display */
:host([slot]) {
  display: inline-flex;
}

/* Size variants via CSS classes on the host */
:host(.icon-xs) {
  width: 0.75em;
  height: 0.75em;
}

:host(.icon-sm) {
  width: 0.875em;
  height: 0.875em;
}

:host(.icon-md) {
  width: 1em;
  height: 1em;
}

:host(.icon-lg) {
  width: 1.25em;
  height: 1.25em;
}

:host(.icon-xl) {
  width: 1.5em;
  height: 1.5em;
}

:host(.icon-2xl) {
  width: 2em;
  height: 2em;
}

/* Fixed pixel sizes */
:host(.icon-12) {
  width: 12px;
  height: 12px;
}

:host(.icon-14) {
  width: 14px;
  height: 14px;
}

:host(.icon-16) {
  width: 16px;
  height: 16px;
}

:host(.icon-18) {
  width: 18px;
  height: 18px;
}

:host(.icon-20) {
  width: 20px;
  height: 20px;
}

:host(.icon-24) {
  width: 24px;
  height: 24px;
}

:host(.icon-32) {
  width: 32px;
  height: 32px;
}

:host(.icon-48) {
  width: 48px;
  height: 48px;
}

:host(.icon-64) {
  width: 64px;
  height: 64px;
}

:host(.icon-80) {
  width: 80px;
  height: 80px;
}

:host(.icon-96) {
  width: 96px;
  height: 96px;
}

/* Spinning animation - default tempo */
:host(.icon-spin) {
  animation: icon-spin 1s linear infinite;
}

/* Spinning animation - slow tempo */
:host(.icon-spin.icon-tempo-slow) {
  animation: icon-spin 2s linear infinite;
}

/* Spinning animation - fast tempo */
:host(.icon-spin.icon-tempo-fast) {
  animation: icon-spin 0.5s linear infinite;
}

@keyframes icon-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Pulse animation - default tempo */
:host(.icon-pulse) {
  animation: icon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Pulse animation - slow tempo */
:host(.icon-pulse.icon-tempo-slow) {
  animation: icon-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Pulse animation - fast tempo */
:host(.icon-pulse.icon-tempo-fast) {
  animation: icon-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes icon-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

/* Accessibility: ensure icons are not announced by screen readers by default */
:host {
  -webkit-user-select: none;
  user-select: none;
}

/* Allow pointer events to pass through by default */
:host(:not(.icon-clickable)) {
  pointer-events: none;
}

/* Clickable icons */
:host(.icon-clickable) {
  cursor: pointer;
  pointer-events: auto;
  transition: color var(--ty-transition-fast), transform var(--ty-transition-fast);
}

:host(.icon-clickable:hover) {
  transform: scale(1.1);
}

:host(.icon-clickable:active) {
  transform: scale(0.95);
}

/* Disabled state */
:host(.icon-disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Block display variant */
:host(.icon-block) {
  display: block;
}
`;

