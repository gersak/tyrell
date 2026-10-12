/**
 * Tab Component Styles
 */

import { customScrollbarStyles } from './custom-scrollbar.js'

export const tabStyles = `
:host {
  width: 100%;
  height: 100%;
  display: block;
  box-sizing: border-box;
  flex-shrink: 0;
  /* ty-tabs hides inactive panels with opacity + visibility. visibility
     transitions as "visible until the fade ends", so a panel leaving fades out
     and only then drops out of the tab order. */
  transition:
    opacity var(--ty-tabs-transition-duration, 400ms) var(--ty-tabs-transition-easing, ease-in-out),
    visibility var(--ty-tabs-transition-duration, 400ms);
}

@media (prefers-reduced-motion: reduce) {
  :host {
    transition-duration: 0ms !important;
  }
}

.tab-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.tab-panel {
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
}

/* Lazy tabs: placeholder while loading, message + Retry when it failed. */
.tab-loading,
.tab-error {
  display: none;
  box-sizing: border-box;
  min-height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
}

.tab-panel[data-load="loading"] .tab-loading,
.tab-panel[data-load="failed"] .tab-error {
  display: flex;
}

/* Fades in late, so a fast load never flashes it. */
.tab-panel[data-load="loading"] .tab-loading {
  animation: ty-tab-status-in 200ms ease-out 150ms both;
}

@keyframes ty-tab-status-in {
  from { opacity: 0; }
}

.tab-spinner {
  display: inline-flex;
  width: 20px;
  height: 20px;
  color: var(--ty-text-soft);
  animation: var(--ty-loader-animation, ty-tab-spin 0.7s linear infinite);
}

.tab-spinner svg {
  width: 100%;
  height: 100%;
}

@keyframes ty-tab-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .tab-spinner {
    animation-duration: 1.6s;
  }
}

.tab-error {
  color: var(--ty-text-soft);
  font-size: 14px;
}

.tab-retry {
  font: inherit;
  font-size: 13px;
  padding: 4px 14px;
  border: 1px solid var(--ty-border);
  border-radius: 9999px;
  background: transparent;
  color: var(--ty-text-strong);
  cursor: pointer;
}

.tab-retry:hover {
  border-color: var(--ty-text-soft);
}

.tab-retry:focus-visible {
  outline: 2px solid var(--ty-color-primary);
  outline-offset: 2px;
}

.tab-panel.ty-custom-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tab-panel.ty-custom-scroll::-webkit-scrollbar {
  display: none;
}

.tab-wrapper:hover .ty-scrollbar-track-y.has-overflow {
  opacity: 1;
}

${customScrollbarStyles}
`;
