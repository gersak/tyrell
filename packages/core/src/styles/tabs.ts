/**
 * Tabs Component Styles — ty-tabs container: top/bottom placement, animated
 * active marker, carousel viewport. Customizable via CSS Parts (::part).
 */

export const tabsStyles = `
:host {
  display: block;
  width: var(--tabs-width, 100%);
  height: var(--tabs-height, 400px);
  box-sizing: border-box;
}

.tabs-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

.tabs-container[data-placement="bottom"] {
  flex-direction: column-reverse;
}

/* Tab buttons container — exposed as a CSS Part for full styling control */
.tab-buttons {
  display: flex;
  gap: 0;
  flex-shrink: 0;
  position: relative;
  /* For absolute positioned marker */
  
  /* Default minimal styling - customize via ::part(buttons-container) */
  border-bottom: 1px solid var(--ty-border);
  background: transparent;
}

.tabs-container[data-placement="bottom"] .tab-buttons {
  border-bottom: none;
  border-top: 1px solid var(--ty-border);
}

/* Marker wrapper — exposed as a CSS Part for custom marker styling */
.marker-wrapper {
  position: absolute;
  z-index: 0;
  /* Behind buttons */
  pointer-events: none;
  /* Don't block clicks */
  transition: left var(--transition-duration, 300ms) var(--transition-easing, ease-in-out),
    width var(--transition-duration, 300ms) var(--transition-easing, ease-in-out),
    height var(--transition-duration, 300ms) var(--transition-easing, ease-in-out),
    top var(--transition-duration, 300ms) var(--transition-easing, ease-in-out);
}

.default-marker {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background: var(--ty-color-primary);
  pointer-events: none;
}

/* Hide default marker when custom marker is slotted */
.marker-wrapper:has(::slotted([slot="marker"])) .default-marker {
  display: none;
}

::slotted([slot="marker"]) {
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.tab-button {
  min-width: 120px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
  color: var(--ty-text-soft);
  transition: var(--ty-local-transition, color 200ms, background-color 200ms);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: var(--ty-font-bold);
  font-size: var(--ty-font-sm);
  position: relative;
  /* Establish stacking context */
  z-index: 10;
  /* Above marker */
}

.tab-button[aria-selected=true] {
  color: var(--ty-text-strong);
}

.tab-button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.tab-button:focus-visible {
  outline: 2px solid var(--ty-color-primary);
  outline-offset: -2px;
}

.tab-button.overflow-hidden {
  display: none;
}

/* Overflow "more" trigger + menu */
.tab-overflow-trigger {
  flex-shrink: 0;
  width: 40px;
  min-width: 40px;
  padding: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--ty-text-soft);
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
}

.tab-overflow-trigger:hover {
  color: var(--ty-text-strong);
}

.tab-overflow-trigger:focus-visible {
  outline: 2px solid var(--ty-color-primary);
  outline-offset: -2px;
}

.tab-overflow-menu {
  display: flex;
  flex-direction: column;
  min-width: 160px;
  max-height: 300px;
  overflow-y: auto;
  padding: var(--ty-spacing-2, 4px);
  background: var(--ty-surface-floating);
  border-radius: var(--ty-radius-md);
  box-shadow: var(--ty-shadow-md, 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1));
}

.tab-overflow-item {
  padding: var(--ty-spacing-2, 6px) var(--ty-spacing-3, 12px);
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: var(--ty-radius-md);
  color: var(--ty-text);
  font: inherit;
  font-size: var(--ty-font-sm);
  white-space: nowrap;
}

.tab-overflow-item:hover {
  background: var(--ty-bg-neutral-soft);
  color: var(--ty-text-strong);
}

.tab-overflow-item[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Panels viewport — exposed as a CSS Part */
.panels-viewport {
  position: relative;
  flex: 1;
  overflow: hidden;
  /* Critical: hides off-screen panels */
  min-height: 0;
  /* Allows flex child to shrink */
}

/* Panels wrapper slides horizontally */
.panels-wrapper {
  display: flex;
  height: 100%;
  transition: transform var(--transition-duration, 300ms) var(--transition-easing, ease-in-out);
}

@media (prefers-reduced-motion: reduce) {
  .panels-wrapper {
    transition-duration: 0ms !important;
  }

  .marker-wrapper {
    transition-duration: 0ms !important;
  }
}

::slotted(ty-tab) {
  /* Carousel page width. --tabs-page-width is the measured pixel width, set by
     the ResizeObserver for percentage-width tabs so every panel is exactly one
     page wide. It is deliberately NOT --tabs-width: that one sizes :host, and
     feeding a measured pixel value back into the host's own width is a
     self-referential loop (see setupResizeObserver). */
  width: var(--tabs-page-width, var(--tabs-width, 100%));
  height: 100%;
  flex-shrink: 0;
}
`;
