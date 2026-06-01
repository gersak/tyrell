/**
 * Tag Component Styles
 * PORTED FROM: clj/ty/components/tag.css
 */

export const tagStyles = `
/* Tag Component Styles using centralized ty.variables.css */

/* Host element */

/* Hidden attribute support */
:host([hidden]) {
  display: none !important;
}

/* Main container */
.tag-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ty-spacing-1);
  /* Default pill shape - can be overridden */
  border-radius: var(--ty-radius-full);
  font-weight: var(--ty-font-medium);
  text-align: center;
  white-space: nowrap;
  user-select: none;
  box-sizing: border-box;

  /* Default MD size — anchor at 28px, even +4 steps for other sizes */
  padding: 0 0.625rem;                            /* 0 10px */
  font-size: var(--ty-font-xs);                   /* 14px */
  line-height: var(--ty-leading-xs);              /* 21px */
  letter-spacing: var(--ty-tracking-xs);          /* -0.013em */
  min-height: 28px;

  /* Transitions using centralized values */
  transition: var(--ty-transition-all);

  /* Colors via custom properties — override on :host for full control */
  background: var(--tag-bg, transparent);
  color: var(--tag-color, var(--ty-text));
  border: 1px solid;
  border-color: var(--tag-border-color, var(--ty-border));
}

/* Non-pill variant - rectangular with rounded corners */
:host([pill="false"]) .tag-container,
:host([not-pill]) .tag-container {
  border-radius: var(--ty-radius-md);
  /* 6px instead of full pill */
}

/* Tags with value attribute but NOT selected should be clickable */
:host([value]:not([selected])) .tag-container:not([aria-disabled="true"]) {
  cursor: pointer;
}

:host([selected]) .tag-container:not([aria-disabled="true"]) {
  cursor: initial;
}

.tag-container[tabindex]:not([aria-disabled="true"]):hover {
  background: var(--ty-bg-neutral-soft);
  transform: translateY(-1px);
  box-shadow: var(--ty-shadow-sm);
}

.tag-container[tabindex]:not([aria-disabled="true"]):active {
  transform: translateY(0);
  box-shadow: var(--ty-shadow-sm);
}

.tag-container[tabindex]:focus {
  outline: none;
}

/* Disabled state */
.tag-container[aria-disabled="true"] {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* Slot containers */
.tag-start,
.tag-content,
.tag-end {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tag-content {
  flex: 1;
  min-width: 0;
}

/* Dismiss button */
.tag-dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  border-radius: var(--ty-radius-full);
  transition: var(--ty-transition-all);
  opacity: 0.7;
  flex-shrink: 0;
  /* Default MD dismiss button size */
  width: var(--ty-spacing-4);
  /* 16px */
  height: var(--ty-spacing-4);
}

.tag-dismiss:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

.tag-dismiss svg {
  width: 100%;
  height: 100%;
}

/* Size variants - override defaults */
:host([size="xs"]) .tag-container {
  padding: 0 0.375rem;                            /* 0 6px */
  font-size: var(--ty-font-xs);                   /* 12px */
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  min-height: 20px;
}

:host([size="xs"]) .tag-dismiss {
  width: var(--ty-spacing-3);
  height: var(--ty-spacing-3);
  margin-left: var(--ty-spacing-2);
}

:host([size="sm"]) .tag-container {
  padding: 0 var(--ty-spacing-2);                 /* 0 8px */
  font-size: var(--ty-font-xs);                   /* 12px */
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  min-height: 24px;
}

:host([size="sm"]) .tag-dismiss {
  width: var(--ty-spacing-3);
  height: var(--ty-spacing-3);
  margin-left: var(--ty-spacing-2);
}

/* MD is now the default - no need for explicit [size="md"] selector */
/* All default styles above apply to MD size (min-height: 24px) */

:host([size="lg"]) .tag-container {
  padding: 0 var(--ty-spacing-3);                 /* 0 12px */
  font-size: var(--ty-font-sm);                   /* 14px */
  line-height: var(--ty-leading-sm);              /* 21px */
  letter-spacing: var(--ty-tracking-sm);          /* -0.013em */
  min-height: 32px;
}

:host([size="lg"]) .tag-dismiss {
  width: var(--ty-spacing-5);
  height: var(--ty-spacing-5);
  margin-left: var(--ty-spacing-4);
}

:host([size="xl"]) .tag-container {
  padding: 0 0.875rem;                            /* 0 14px */
  font-size: var(--ty-font-sm);                   /* 14px */
  line-height: var(--ty-leading-sm);              /* 21px */
  letter-spacing: var(--ty-tracking-sm);          /* -0.013em */
  min-height: 36px;
}

:host([size="xl"]) .tag-dismiss {
  width: var(--ty-spacing-5);
  height: var(--ty-spacing-5);
  margin-left: var(--ty-spacing-4);
}

/* ===== FLAVOR VARIANTS =====
   Each flavor sets --tag-bg / --tag-color / --tag-border-color on :host.
   Append '+' to flavor for a stronger shade (mild background, strong color),
   or '-' for a softer shade (soft background, base color). */

/* ----- PRIMARY ----- */
:host([flavor="primary"]) {
  --tag-bg: var(--ty-bg-primary);
  --tag-color: var(--ty-color-primary-strong);
  --tag-border-color: var(--ty-border-primary);
}
:host([flavor="primary+"]) {
  --tag-bg: var(--ty-bg-primary-bold);
  --tag-color: var(--ty-color-primary-strong);
  --tag-border-color: var(--ty-color-primary);
}
:host([flavor="primary-"]) {
  --tag-bg: var(--ty-bg-primary-soft);
  --tag-color: var(--ty-color-primary);
  --tag-border-color: var(--ty-border-primary);
}
:host([flavor="primary"]) .tag-container[tabindex]:hover,
:host([flavor="primary+"]) .tag-container[tabindex]:hover,
:host([flavor="primary-"]) .tag-container[tabindex]:hover {
  background: var(--ty-bg-primary-bold);
}
:host([flavor="primary"]) .tag-container[tabindex]:focus,
:host([flavor="primary+"]) .tag-container[tabindex]:focus,
:host([flavor="primary-"]) .tag-container[tabindex]:focus {
  box-shadow: 0 0 0 3px var(--ty-color-primary-faint);
}

/* ----- SECONDARY ----- */
:host([flavor="secondary"]) {
  --tag-bg: var(--ty-bg-secondary);
  --tag-color: var(--ty-color-secondary-strong);
  --tag-border-color: var(--ty-border-secondary);
}
:host([flavor="secondary+"]) {
  --tag-bg: var(--ty-bg-secondary-bold);
  --tag-color: var(--ty-color-secondary-strong);
  --tag-border-color: var(--ty-color-secondary);
}
:host([flavor="secondary-"]) {
  --tag-bg: var(--ty-bg-secondary-soft);
  --tag-color: var(--ty-color-secondary);
  --tag-border-color: var(--ty-border-secondary);
}
:host([flavor="secondary"]) .tag-container[tabindex]:hover,
:host([flavor="secondary+"]) .tag-container[tabindex]:hover,
:host([flavor="secondary-"]) .tag-container[tabindex]:hover {
  background: var(--ty-bg-secondary-bold);
}
:host([flavor="secondary"]) .tag-container[tabindex]:focus,
:host([flavor="secondary+"]) .tag-container[tabindex]:focus,
:host([flavor="secondary-"]) .tag-container[tabindex]:focus {
  box-shadow: 0 0 0 3px var(--ty-color-secondary-faint);
}

/* ----- SUCCESS ----- */
:host([flavor="success"]) {
  --tag-bg: var(--ty-bg-success);
  --tag-color: var(--ty-color-success-strong);
  --tag-border-color: var(--ty-border-success);
}
:host([flavor="success+"]) {
  --tag-bg: var(--ty-bg-success-bold);
  --tag-color: var(--ty-color-success-strong);
  --tag-border-color: var(--ty-color-success);
}
:host([flavor="success-"]) {
  --tag-bg: var(--ty-bg-success-soft);
  --tag-color: var(--ty-color-success);
  --tag-border-color: var(--ty-border-success);
}
:host([flavor="success"]) .tag-container[tabindex]:hover,
:host([flavor="success+"]) .tag-container[tabindex]:hover,
:host([flavor="success-"]) .tag-container[tabindex]:hover {
  background: var(--ty-bg-success-bold);
}
:host([flavor="success"]) .tag-container[tabindex]:focus,
:host([flavor="success+"]) .tag-container[tabindex]:focus,
:host([flavor="success-"]) .tag-container[tabindex]:focus {
  box-shadow: 0 0 0 3px var(--ty-color-success-faint);
}

/* ----- DANGER ----- */
:host([flavor="danger"]) {
  --tag-bg: var(--ty-bg-danger);
  --tag-color: var(--ty-color-danger-strong);
  --tag-border-color: var(--ty-border-danger);
}
:host([flavor="danger+"]) {
  --tag-bg: var(--ty-bg-danger-bold);
  --tag-color: var(--ty-color-danger-strong);
  --tag-border-color: var(--ty-color-danger);
}
:host([flavor="danger-"]) {
  --tag-bg: var(--ty-bg-danger-soft);
  --tag-color: var(--ty-color-danger);
  --tag-border-color: var(--ty-border-danger);
}
:host([flavor="danger"]) .tag-container[tabindex]:hover,
:host([flavor="danger+"]) .tag-container[tabindex]:hover,
:host([flavor="danger-"]) .tag-container[tabindex]:hover {
  background: var(--ty-bg-danger-bold);
}
:host([flavor="danger"]) .tag-container[tabindex]:focus,
:host([flavor="danger+"]) .tag-container[tabindex]:focus,
:host([flavor="danger-"]) .tag-container[tabindex]:focus {
  box-shadow: 0 0 0 3px var(--ty-color-danger-faint);
}

/* ----- WARNING ----- */
:host([flavor="warning"]) {
  --tag-bg: var(--ty-bg-warning);
  --tag-color: var(--ty-color-warning-strong);
  --tag-border-color: var(--ty-border-warning);
}
:host([flavor="warning+"]) {
  --tag-bg: var(--ty-bg-warning-bold);
  --tag-color: var(--ty-color-warning-strong);
  --tag-border-color: var(--ty-color-warning);
}
:host([flavor="warning-"]) {
  --tag-bg: var(--ty-bg-warning-soft);
  --tag-color: var(--ty-color-warning);
  --tag-border-color: var(--ty-border-warning);
}
:host([flavor="warning"]) .tag-container[tabindex]:hover,
:host([flavor="warning+"]) .tag-container[tabindex]:hover,
:host([flavor="warning-"]) .tag-container[tabindex]:hover {
  background: var(--ty-bg-warning-bold);
}
:host([flavor="warning"]) .tag-container[tabindex]:focus,
:host([flavor="warning+"]) .tag-container[tabindex]:focus,
:host([flavor="warning-"]) .tag-container[tabindex]:focus {
  box-shadow: 0 0 0 3px var(--ty-color-warning-faint);
}

:host([flavor="info"]) .tag-container[tabindex]:focus {
  box-shadow: 0 0 0 3px var(--ty-color-info-faint);
}

/* ----- NEUTRAL ----- */
:host([flavor="neutral"]) {
  --tag-color: var(--ty-text-bold);
  --tag-bg: var(--ty-bg-neutral-soft);
  --tag-border-color: var(--ty-border-bold);
}

:host([flavor="neutral+"]) {
  --tag-bg: var(--ty-bg-neutral-bold);
  --tag-color: var(--ty-text-bold);
  --tag-border-color: var(--ty-border-strong);
}
:host([flavor="neutral-"]) {
  --tag-bg: var(--ty-bg-neutral-soft);
  --tag-color: var(--ty-text-soft);
  --tag-border-color: var(--ty-border-mildstrong);
}
:host([flavor="neutral"]) .tag-container[tabindex]:hover,
:host([flavor="neutral+"]) .tag-container[tabindex]:hover,
:host([flavor="neutral-"]) .tag-container[tabindex]:hover {
  background: var(--ty-bg-neutral-soft);
}
:host([flavor="neutral"]) .tag-container[tabindex]:focus,
:host([flavor="neutral+"]) .tag-container[tabindex]:focus,
:host([flavor="neutral-"]) .tag-container[tabindex]:focus {
  box-shadow: 0 0 0 3px var(--ty-border-soft);
}

/* Slotted content styling */
.tag-start ::slotted(*),
.tag-content ::slotted(*),
.tag-end ::slotted(*) {
  display: flex;
  align-items: center;
}

/* Icon sizing for slotted icons */
.tag-start ::slotted(ty-icon),
.tag-end ::slotted(ty-icon) {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}

/* Count/badge styling using centralized spacing */
.tag-end ::slotted(.count) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--ty-spacing-6);
  /* 24px */
  height: var(--ty-spacing-5);
  /* 20px */
  padding: 0 var(--ty-spacing-2);
  /* 0 8px */
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--ty-radius-full);
  font-size: var(--ty-font-xs);
  font-weight: var(--ty-font-semibold);
  line-height: var(--ty-line-height-none);
  flex-shrink: 0;
}

/* Special handling for long text content */
.tag-content {
  overflow: hidden;
  text-overflow: ellipsis;
}

:host([data-type="user"]) .tag-container {
  min-width: var(--ty-spacing-20);
  /* 80px for user tags */
}

/* Dark mode is handled automatically by the centralized variables */
`;
