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

  /* Default minimal styling - customize via ::part(buttons-container) */
  background: transparent;
}

/* Separator drawn as a pseudo-element, not a border: a border sits OUTSIDE the
   strip's box, so the marker (absolutely positioned inside the strip) could only
   ever stop just above it, reading as two stacked lines. As an overlaid line it
   lands inside the marker's range, and .tab-strip's z-index lets the marker
   cover it. */
.tab-buttons::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  /* --ty-tabs-separator: transparent removes the line (e.g. with a pill marker) */
  background: var(--ty-tabs-separator, var(--ty-border));
  pointer-events: none;
}

.tabs-container[data-placement="bottom"] .tab-buttons::after {
  bottom: auto;
  top: 0;
}

/* Scrollable strip holding the buttons + marker. Tabs never collapse — the
   strip scrolls (scrollbar hidden; touch/wheel still work) and activation
   glides the active tab into view. The "…" trigger sits OUTSIDE this strip,
   pinned at the edge. position:relative makes it the offsetParent for the
   marker, so the marker scrolls with the buttons and can't desync. */
.tab-strip {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  position: relative;
  /* Paints the marker + buttons over .tab-buttons::after (the separator line) */
  z-index: 1;
  overflow-x: auto;
  scrollbar-width: none;
  /* Edge fades — a mask, not overlays, so it works over any background.
     --fade-left/right are set from the scroll listener: 0px at a hard edge,
     28px when more tabs continue past that side. */
  --fade-left: 0px;
  --fade-right: 0px;
  -webkit-mask-image: linear-gradient(to right,
    transparent, black var(--fade-left),
    black calc(100% - var(--fade-right)), transparent);
  mask-image: linear-gradient(to right,
    transparent, black var(--fade-left),
    black calc(100% - var(--fade-right)), transparent);
}

.tab-strip::-webkit-scrollbar {
  display: none;
}

/* When every tab fits there is nothing to scroll, so drop the clipping —
   both overflow and the mask cut a custom marker's box-shadow off at the
   strip edge. Set by updateOverflow(); clipping stays the pre-measurement
   default so overflowing tabs can't spill for a frame on first render. */
.tab-strip.unclipped {
  overflow: visible;
  -webkit-mask-image: none;
  mask-image: none;
}

/* Marker wrapper — exposed as a CSS Part for custom marker styling */
.marker-wrapper {
  position: absolute;
  z-index: 0;
  /* Behind buttons */
  pointer-events: none;
  /* Don't block clicks */
  transition: left var(--ty-tabs-transition-duration, 300ms) var(--ty-tabs-transition-easing, ease-in-out),
    width var(--ty-tabs-transition-duration, 300ms) var(--ty-tabs-transition-easing, ease-in-out),
    height var(--ty-tabs-transition-duration, 300ms) var(--ty-tabs-transition-easing, ease-in-out),
    top var(--ty-tabs-transition-duration, 300ms) var(--ty-tabs-transition-easing, ease-in-out);
}

.default-marker {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: var(--ty-color-primary);
  pointer-events: none;
}

/* Bottom placement: marker rides the top edge, next to the content it marks */
.tabs-container[data-placement="bottom"] .default-marker {
  bottom: auto;
  top: 0;
}

::slotted([slot="marker"]) {
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.tab-button {
  /* Material's floor for SCROLLABLE tabs. 120px is the fixed-tab number and it
     manufactured overflow: five short labels claimed 600px whether they needed
     it or not. Equal-width rhythm is what the "fixed" attribute is for. */
  min-width: var(--ty-tab-min-width, 72px);
  /* Scrollable tabs keep their natural width and let the strip scroll — that is
     the whole contract. Without this they are flex items with the default
     shrink of 1, so they squeeze toward the floor and their labels ellipsize
     before the strip ever overflows. Squeezing is what "fixed" is for. */
  flex-shrink: 0;
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

/* Fixed tabs: the bar is divided between them instead of scrolling. Material
   calls this "fixed tabs" — for a small, known set of short labels. No
   min-width floor, no overflow, no "…". */
.tabs-container[data-fixed] .tab-button {
  flex: 1 1 0;
  min-width: 0;
}

/* Fixed tabs only. A scrollable tab is never narrower than its label, so
   ellipsizing there would hide text the user could simply scroll to. */
.tabs-container[data-fixed] .tab-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* Overflow "more" trigger (pill) + menu */
.tab-overflow-trigger {
  flex-shrink: 0;
  align-self: center;
  min-width: 36px;
  height: 24px;
  margin: 0 8px;
  padding: 0 10px;
  border: 1px solid var(--ty-border);
  border-radius: 9999px;
  background: transparent;
  cursor: pointer;
  color: var(--ty-text-soft);
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  transition: color 200ms, border-color 200ms;
}

.tab-overflow-trigger:hover {
  color: var(--ty-text-strong);
  border-color: var(--ty-text-soft);
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

.tab-overflow-item[data-active="true"] {
  color: var(--ty-color-primary);
  font-weight: var(--ty-font-bold);
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
  transition: transform var(--ty-tabs-transition-duration, 300ms) var(--ty-tabs-transition-easing, ease-in-out);
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
