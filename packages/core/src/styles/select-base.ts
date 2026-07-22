/**
 * Select Field Styles — shared chrome for ty-select (both single and
 * multiple modes). Formerly split across ty-dropdown / ty-multiselect;
 * those were consolidated into ty-select and this file kept the name.
 */

import { FLAVORS } from "../types/common.js";
import { customScrollbarStyles } from "./custom-scrollbar.js";

/* Flavor rules only set --select-accent (border), --select-accent-bold
   (hover/open border), and --select-ring (open focus ring); the .select-stub
   rules below consume them. Doubles as the per-instance override API:
   `ty-select { --select-accent: … }`. Neutral is skipped — it IS the default
   unstyled chrome (--ty-input-* tokens), same convention as
   ty-input/ty-date-picker. Fallback flavor `fb` is used for custom flavors
   so missing tokens degrade to neutral. */
const selectFlavor = (f: string, fb?: string) => {
  const c = (s: string) =>
    fb
      ? s
        ? `var(--ty-color-${f}${s}, var(--ty-color-${f}, var(--ty-color-${fb}${s})))`
        : `var(--ty-color-${f}, var(--ty-color-${fb}))`
      : s
        ? `var(--ty-color-${f}${s}, var(--ty-color-${f}))`
        : `var(--ty-color-${f})`;
  return `
:host([flavor="${f}"]) {
  --select-accent: var(--ty-input-${f}-border, ${c("-soft")});
  --select-accent-bold: ${c("")};
  --select-ring: color-mix(in oklab, ${c("")} 15%, transparent);
}
:host([flavor="${f}+"]) {
  --select-accent: ${c("")};
  --select-accent-bold: ${c("-strong")};
  --select-ring: color-mix(in oklab, ${c("-strong")} 15%, transparent);
}
:host([flavor="${f}-"]) {
  --select-accent: ${c("-faint")};
  --select-accent-bold: ${c("-soft")};
  --select-ring: color-mix(in oklab, ${c("-soft")} 15%, transparent);
}
`;
};

/** Rules for one custom (non-built-in) flavor — see utils/flavor-sheet.ts. */
export const selectCustomFlavorCss = (base: string) => selectFlavor(base, "neutral");

export const selectBaseStyles = `
/* Select-field-specific styles extending dropdown base styles */

:host {
  font-family: var(--ty-font-sans);
  --mobile-border-color: var(--ty-border, #5858587d);
}

/* ===== DIALOG POSITIONING SUPPORT ===== */

.dropdown-dialog {
  position: fixed;
  width: var(--dropdown-width, 200px);
  max-width: 100vw;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  box-sizing: border-box;
  padding: var(--dropdown-padding, 20px);
  /* Modal handles z-index automatically */

  /* Hidden by default */
  opacity: 0;
  transition: opacity 400ms ease;

  transform: translate(var(--dropdown-offset-x, 0px), var(--dropdown-offset-y, 0px));
  top: -1000px;
  left: -1000px;
}

/* When opened via showModal(), apply flex layout and direction */
.dropdown-dialog[open] {
  display: flex;
  flex-direction: column;
}

/* Direction-based positioning with CSS classes */
.dropdown-dialog.position-below {
  left: var(--dropdown-x);
  top: var(--dropdown-y);
}

.dropdown-dialog.position-above {
  left: var(--dropdown-x);
  bottom: var(--dropdown-y);
  top: auto;
  flex-direction: column-reverse;
}

.dropdown-dialog.position-above .dropdown-header {
  margin-top: 4px;
}

.dropdown-dialog.position-below .dropdown-header {
  margin-bottom: 4px;
}

.dropdown-dialog.position-below .dropdown-options {
  /* Optional: Add upward-pointing shadow for below positioning */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1), var(--ty-shadow-md);
}

/* Animate when .open class is added */
.dropdown-dialog.open {
  opacity: 1;
}

.dropdown-dialog.open .dropdown-options {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.dropdown-dialog::backdrop {
  background: transparent;
}

/* ===== DIALOG HEADER ===== */

.dropdown-header {
  display: flex;
  align-items: center;
  gap: var(--ty-spacing-2);
  position: relative;
}

.dropdown-search-input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: var(--input-bg, var(--ty-input-bg));
  color: var(--input-color, var(--ty-input-color));
  border: 1px solid var(--input-border, var(--ty-input-border));
  border-radius: var(--ty-radius-md);
  font-family: var(--ty-font-sans);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-weight: var(--ty-font-normal);
  min-height: var(--ty-size-md);
  padding: var(--ty-spacing-2) var(--ty-spacing-3);
  padding-right: calc(var(--ty-spacing-3) + 1rem + var(--ty-spacing-2));
  transition: var(--ty-transition-all);
  outline: none;
}

.dropdown-search-input:focus {
  border-color: var(--input-border-focus, var(--ty-input-border-focus));
  box-shadow: 0 0 0 3px var(--input-shadow-focus, var(--ty-input-shadow-focus));
}

.dropdown-search-input:disabled {
  background-color: var(--input-disabled-bg, var(--ty-input-disabled-bg));
  color: var(--input-disabled-color, var(--ty-input-disabled-color));
  cursor: not-allowed;
  opacity: 0.6;
}

.dropdown-search-input::placeholder {
  color: var(--input-placeholder, var(--ty-input-placeholder));
}

.dropdown-search-chevron {
  position: absolute;
  top: 50%;
  right: var(--ty-spacing-3);
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--input-placeholder, var(--ty-input-placeholder));
  transition: var(--ty-transition-transform);
  pointer-events: none;
}

.dropdown-search-chevron.open {
  transform: translateY(-50%) rotate(180deg);
}

.dropdown-search-chevron svg {
  width: 100%;
  height: 100%;
}

/* ===== SELECT FIELD-SPECIFIC STYLES ===== */

/* Select stub modifications */
.select-stub {
  min-height: var(--ty-size-md);
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
  padding: 0 2.5rem 0 0.75rem;
  /* Transitions - includes opacity for open state */
  transition: var(--ty-transition-all), opacity 0.2s ease;
  outline: none;
  background: var(--input-bg, var(--ty-input-bg));
  color: var(--input-color, var(--ty-input-color));
  border: 1px solid var(--select-accent, var(--input-border, var(--ty-input-border)));
  border-radius: var(--ty-radius-md);
  font-family: var(--ty-font-sans);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  cursor: pointer;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

/* ===== SIZE MODIFIERS =====
   buildStubClasses() always stamps exactly one size class on .select-stub.
   min-height comes from the shared --ty-size-* tokens (same ones ty-input
   and ty-date-picker consume) so a given size is the same height on every
   field. Right padding stays 2.5rem for chevron room. Zero vertical
   padding — same fix as ty-input: with align-items:center on a flex
   container, ANY vertical padding adds on top of min-height instead of
   being absorbed by it, so a padded stub silently overflows past the
   shared field height (measured +3px at sm/md before this was zeroed).
   min-height + centering alone gets the exact height. */
.select-stub.sm {
  min-height: var(--ty-size-sm);
  padding: 0 2.5rem 0 0.625rem;
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
}

/* md matches the base rule; listed for parity/overrides */
.select-stub.md {
  min-height: var(--ty-size-md);
  padding: 0 2.5rem 0 0.75rem;
}

.select-stub.lg {
  min-height: var(--ty-size-lg);
  padding: 0 2.5rem 0 0.875rem;
  font-size: var(--ty-font-base);
  line-height: var(--ty-leading-base);
  letter-spacing: var(--ty-tracking-base);
}

.select-stub:hover {
  border-color: var(--select-accent-bold, var(--input-border-hover, var(--ty-input-border-hover)));
}

.select-stub[disabled] {
  background-color: var(--input-disabled-bg, var(--ty-input-disabled-bg));
  color: var(--input-disabled-color, var(--ty-input-disabled-color));
  cursor: not-allowed;
  opacity: 0.6;
}

/* Hide stub when dropdown is open */
.dropdown-wrapper:has(.dropdown-chevron.open) .select-stub {
  opacity: 0;
  pointer-events: none;
}

/* Open state — same escalation as ty-input's .focused: bolder border + ring.
   Applies whenever the stub stays visible while open (field skin without
   the opacity-hide above kicking in — e.g. single-select with no tags). */
.dropdown-wrapper:has(.dropdown-chevron.open) .select-stub,
.select-stub:focus,
.select-stub:focus-visible {
  border-color: var(--select-accent-bold, var(--input-border-focus, var(--ty-input-border-focus)));
  box-shadow: 0 0 0 3px var(--select-ring, var(--input-shadow-focus, var(--ty-input-shadow-focus)));
}

/* Custom trigger (slot="trigger"): setupTriggerSlot() toggles this class when
   the consumer assigns their own content — the slot's fallback (start/selected/
   placeholder/end/chevron, i.e. the whole default field skin) is entirely
   replaced at that point, so the wrapping .select-stub itself must go bare.
   Without this, the stub's own border/background/padding and the open/focus
   ring above still wrapped the custom content in a second, unwanted outline. */
.select-stub.custom-trigger {
  min-height: 0;
  padding: 0;
  border: none;
  background: transparent;
}
.select-stub.custom-trigger:hover,
.dropdown-wrapper:has(.dropdown-chevron.open) .select-stub.custom-trigger,
.select-stub.custom-trigger:focus,
.select-stub.custom-trigger:focus-visible {
  border-color: transparent;
  box-shadow: none;
}

/* Hide stub chips when mobile dialog is open (let modal show them) */
.dropdown-mode-mobile .dropdown-wrapper:has(.mobile-dialog[open]) .select-chips {
  display: none;
}

/* When tags are present, reduce padding to make room */
.select-stub.has-tags {
  padding: 0.25rem 2.5rem 0.25rem 0.5rem;
  width: 100%;
}

.select-stub.has-tags slot[name="selected"] {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

/* ===== CHEVRON INDICATOR ===== */

.dropdown-chevron {
  position: absolute;
  top: 50%;
  right: var(--ty-spacing-3);
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--input-placeholder, var(--ty-input-placeholder));
  transition: var(--ty-transition-transform);
  pointer-events: none;
}

.dropdown-chevron.open {
  transform: translateY(-50%) rotate(180deg);
}

.dropdown-chevron svg {
  width: 100%;
  height: 100%;
}


/* Tags container */
.select-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  min-width: 0;
}

.dropdown-placeholder {
  flex-grow: 1;
  color: var(--input-placeholder, var(--ty-input-placeholder, #9ca3af));
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-weight: var(--ty-font-light);
  font-style: italic;
}

/* Placeholder styling when tags are present */
.dropdown-placeholder.hidden {
  display: none;
}

/* Options area styling - Override for select */
.dropdown-options {
  opacity: 0;
  background: var(--input-bg, var(--ty-input-bg));
  border: 1px solid var(--input-border, var(--ty-input-border));
  border-radius: var(--ty-radius-lg);
  max-height: 16rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
  box-sizing: border-box;
  position: relative;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Animation properties */
  transform: translateY(-8px) scale(0.95);
  transition:
    opacity 200ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1);

  /* Select-specific: flex wrap for tags */
  display: flex;
  flex-wrap: wrap;
  padding: 0.5rem;
  gap: 0.5rem;

}

/* Hide native scrollbar only when custom scrollbar is active */
.dropdown-options.ty-custom-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.dropdown-options.ty-custom-scroll::-webkit-scrollbar {
  display: none;
}

/* Options wrapper - positioned container for scrollbar track */
.dropdown-options-wrapper {
  position: relative;
}

/* Show custom scrollbar on hover */
.dropdown-options-wrapper:hover .ty-scrollbar-track-y.has-overflow {
  opacity: 1;
}

/* Make ty-tags in dropdown clickable with pointer cursor */
.dropdown-options ty-tag {
  user-select: none;
  transition: transform 0.1s ease;
}

.dropdown-options ty-tag:hover {
  transform: scale(1.02);
}

.dropdown-options ty-tag:active {
  transform: scale(0.98);
}

/* Visual feedback for selected tags in options */
.dropdown-options ty-tag[selected] {
  opacity: 0.5;
}

/* Ensure ty-tag components in the select field have proper sizing */
.select-chips ty-tag {
  max-width: 150px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .select-chips ty-tag {
    max-width: 100px;
  }
}


/* Ensure proper spacing in container layouts */
.select-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* ===== DROPDOWN WRAPPER & LABEL ===== */

.dropdown-wrapper {
  position: relative;
  display: block;
  width: 100%;
}

.ty-field-label {
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-weight: var(--ty-font-medium);
  color: var(--ty-label-color);
  margin-bottom: 6px;
  padding-left: 12px;
  display: flex;
  align-items: center;
}

/* Required indicator - using SVG icon */
.required-icon {
  display: inline-flex;
  align-items: center;
  color: #ef4444;
  width: 12px;
  height: 12px;
  vertical-align: middle;
  margin-left: 4px;
}

.required-icon svg {
  width: 100%;
  height: 100%;
}

:host([disabled]) .select-container {
  pointer-events: none;
}

/* ============================================================================
   MOBILE MODAL STYLES
   ============================================================================ */

.dropdown-mode-mobile .mobile-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100dvh; /* dvh, not vh — shrinks with the on-screen keyboard so the
                     dialog never sits partly behind it */
  max-width: 100vw;
  max-height: 100dvh;
  margin: 0;
  padding: 0;
  padding-top: 6dvh; /* Sit higher than the old 10vh, but 4dvh left the
                         floating label with no headroom — it sits above
                         .mobile-search-header via position:absolute, so it
                         needs room inside this padding, not just inside the
                         content box, or it crowds the very top of the screen */
  border: none;
  background: transparent; /* Backdrop handles background */
  /* Note: Don't set display - browser controls <dialog> visibility */
  align-items: flex-start;
  justify-content: center;
  opacity: 0;
  transition: opacity 300ms ease;
}

/* When opened via showModal(), add flex layout */
.dropdown-mode-mobile .mobile-dialog[open] {
  display: flex;
}

.dropdown-mode-mobile .mobile-dialog.open {
  opacity: 1;
}

/* Native dialog backdrop with blur */
.dropdown-mode-mobile .mobile-dialog::backdrop {
  background: rgba(0, 0, 0, 0.65); /* was 0.5 — needed more depth to reliably
                                       carry white header text/icons over a
                                       light page blurred behind it */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dropdown-mode-mobile .mobile-dialog-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: calc(100% - 32px); /* Side margins */
  max-width: 400px; /* Constrained width like dropdown */
  min-height: 200px;
  max-height: 90dvh; /* leaves room below the 6dvh padding-top, shrinks with keyboard */
  opacity: 0;
  transform: scale(0.95);
  transition: 
    opacity 300ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-mode-mobile .mobile-dialog.open .mobile-dialog-content {
  opacity: 1;
  transform: scale(1);
}

.dropdown-mode-mobile .mobile-search-input:focus {
  border-color: var(--ty-border);
}

/* Mobile search header - label floats above, search + close below */
.dropdown-mode-mobile .mobile-search-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  padding: 0;
  background: transparent;
  position: relative;
}

.dropdown-mode-mobile .mobile-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  /* When search is disabled, updateSearchVisibility() hides the icon+input
     (see select.ts) but leaves the close button as the row's only child —
     without this it falls back to flex-start and strands the button on the
     left. Harmless when search IS shown: the input's flex:1 already
     consumes all remaining space, so justify-content never gets a say. */
  justify-content: flex-end;
}

.dropdown-mode-mobile .mobile-header-label {
  position: absolute;
  bottom: 100%;
  left: 2px;
  margin-bottom: 8px; /* was 4px — too tight against the search row */
  font-size: var(--ty-font-base); /* was --ty-font-lg — read as oversized/heavy paired with 700 */
  line-height: var(--ty-leading-base);
  letter-spacing: var(--ty-tracking-base);
  font-weight: 600; /* was 700 — 700 at font-lg read as clunky */
  /* This sits on the dialog's ::backdrop (rgba(0,0,0,.65) + blur) — a fixed
     DARK overlay regardless of theme, not the theme's own surface color.
     A theme-toggling token (light mode → black) fights that: black text on
     a dark blurred backdrop is the wrong combination. Fixed white, same
     reasoning as ty-tooltip's deliberately theme-independent default in
     tyrell.css — this element's job is to pop against a dark backdrop in
     both themes, not to track the page's light/dark state. */
  color: #ffffff;
  pointer-events: none;
}

/* Close button — borderless ghost icon button (was a bordered circle badge,
   which read as a heavy, disconnected "chip" next to the plain search icon).
   Matches ty-button's ghost treatment: transparent at rest, soft neutral
   fill on hover/active, no border ever. */
.dropdown-mode-mobile .mobile-close-button {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  /* Same reasoning as .mobile-header-label: fixed white, not a theme token —
     this sits on the dark ::backdrop blur in both themes, never on a theme
     surface. */
  color: #ffffff;
  cursor: pointer;
  transition: var(--ty-transition-all);
  padding: 0;
}

/* Hover/active fills also go fixed-white-tinted rather than theme neutral —
   --ty-bg-neutral-soft is a LIGHT fill in light mode, which would swallow
   the white icon it's meant to sit behind. */
.dropdown-mode-mobile .mobile-close-button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.dropdown-mode-mobile .mobile-close-button:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.25);
}

.dropdown-mode-mobile .mobile-close-button svg {
  width: 18px;
  height: 18px;
}

/* Mobile search input (matches dropdown.ts) */
.dropdown-mode-mobile .mobile-search-input {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  background: var(--ty-surface-floating);
  color: var(--ty-text);
  border: 2px solid;
  border-color: var(--mobile-border-color);
  border-radius: var(--ty-radius-md);
  font-family: var(--ty-font-sans);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-weight: var(--ty-font-normal);
  padding: var(--ty-spacing-2) var(--ty-spacing-3);
  height: 40px;
  transition: var(--ty-transition-all);
  outline: none;
}

.dropdown-mode-mobile .mobile-search-input::placeholder {
  color: var(--ty-text-faint);
}

.dropdown-mode-mobile .mobile-search-input:focus {
  border-color: var(--ty-border);
}

/* ============================================================================
   MOBILE BODY & SECTIONS - UPDATED STRUCTURE
   ============================================================================ */

/* Mobile body - contains both sections */
.dropdown-mode-mobile .mobile-body {
  position: relative;
  display: flex;
  flex-direction: column;
  height: var(--body-height, 350px);
  max-height: 350px;
  overflow: hidden;
  background: var(--ty-surface-floating);
  border-radius: var(--ty-radius-lg);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 2px solid;
  border-color: var(--mobile-border-color);
}

/* ===== SECTION HEADERS - Labels, not buttons ===== */

.dropdown-mode-mobile .section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  flex-shrink: 0;
  padding: 0 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ty-text-bold);
  background: transparent;
  cursor: default;
  user-select: none;
}

.dropdown-mode-mobile .section-header .section-title {
  flex: 1;
}

.dropdown-mode-mobile .section-header .section-count {
  font-weight: 500;
  color: var(--ty-text-faint);
  margin-left: 0.25rem;
}

/* ===== SELECTED STRIP - pinned, capped height, collapses when empty ===== */

.dropdown-mode-mobile .mobile-selected-section {
  display: flex;
  flex-direction: column;
  background: var(--ty-input-bg);
  overflow: hidden;
  flex: 0 0 auto;
  max-height: 40%;
  transition: max-height 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Empty: collapse to header only */
.dropdown-mode-mobile .mobile-selected-section[data-empty="true"] {
  max-height: 36px;
  flex: 0 0 36px;
}

.dropdown-mode-mobile .mobile-selected-section .section-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.75rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-content: flex-start;
  /* Soft fade at bottom edge — hints at scrollable overflow */
  -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 12px), transparent);
  mask-image: linear-gradient(to bottom, black calc(100% - 12px), transparent);
}

/* ===== AVAILABLE LIST - takes remaining space ===== */

.dropdown-mode-mobile .mobile-available-section {
  display: flex;
  flex-direction: column;
  background: var(--ty-input-bg);
  overflow: hidden;
  flex: 1 1 auto;
  min-height: 0;
}

.dropdown-mode-mobile .mobile-available-section .section-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.75rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-content: flex-start;
}

/* ===== EMPTY STATES =====
   Selected strip collapses (no text needed).
   Available shows the empty message only when there are zero tags total. */

.dropdown-mode-mobile .empty-state {
  display: none;
  width: 100%;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--ty-text-faint);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-style: italic;
}

.dropdown-mode-mobile .mobile-available-section[data-empty="true"] .empty-state {
  display: block;
}

.dropdown-mode-mobile .mobile-selected-section[data-empty="true"] .section-content,
.dropdown-mode-mobile .mobile-available-section[data-empty="true"] slot {
  display: none;
}

/* ===== TAG STYLING IN MOBILE ===== */

.dropdown-mode-mobile .section-content ::slotted(ty-tag) {
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s ease;
  margin: 2px 0; /* Vertical spacing like dropdown options */
  /* Fade + scale entry — replays on each (re)insertion when a tag moves
     between selected and available slots */
  animation: ty-select-tag-enter 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

@media (hover: hover) {
  .dropdown-mode-mobile .section-content ::slotted(ty-tag:hover) {
    transform: scale(1.02);
  }
}

.dropdown-mode-mobile .section-content ::slotted(ty-tag:active) {
  transform: scale(0.96);
}

/* Dimmed appearance for hidden filtered tags */
.dropdown-mode-mobile .section-content ::slotted(ty-tag[hidden]) {
  display: none !important;
}

@keyframes ty-select-tag-enter {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .dropdown-mode-mobile .section-content ::slotted(ty-tag) {
    animation: none;
  }
}

/* ==================== LOADING STATE ====================
   Spinner overlay shown inside the options area while the parent
   (external-search mode) is fetching. Search input stays usable.

   Carries its own surface so it stays visible even when the host
   has restyled the popup with a transparent or unusual background.
   Override with --ty-loader-bg / --ty-loader-radius / --ty-loader-border.
*/
.dropdown-loading {
  display: none;
  align-items: center;
  justify-content: center;
  gap: var(--ty-spacing-2);
  padding: var(--ty-spacing-4) var(--ty-spacing-3);
  color: var(--ty-text-soft);
  font-size: var(--ty-font-sm);
  min-height: 4rem;
  /* Match the .dropdown-options popup look — same background, border, radius, shadow */
  background: var(--ty-loader-bg, var(--input-bg, var(--ty-input-bg)));
  border: 1px solid var(--ty-loader-border, var(--input-border, var(--ty-input-border)));
  border-radius: var(--ty-loader-radius, var(--ty-radius-lg));
  box-shadow: var(--ty-loader-shadow, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04));
  box-sizing: border-box;
}

.dropdown-options-wrapper.loading .dropdown-loading {
  display: flex;
}

/* Slot is transparent for layout — fallback (spinner + text) and user-provided
   slotted content both act as direct flex children of .dropdown-loading. */
.dropdown-loading > slot[name="loading"] {
  display: contents;
}

/* Mobile: full-screen dialog is the surface — drop the card chrome,
   stack vertically, scale up so it feels native to a fullscreen view.
   Slotted content adapts automatically since the slot is display:contents. */
.dropdown-mode-mobile .dropdown-loading {
  background: transparent;
  border: none;
  box-shadow: none;
  flex: 1;
  flex-direction: column;
  gap: var(--ty-spacing-3);
  padding: var(--ty-spacing-8) var(--ty-spacing-4);
  min-height: 12rem;
}

.dropdown-mode-mobile .dropdown-loading-spinner {
  width: 2rem;
  height: 2rem;
}

.dropdown-mode-mobile .dropdown-loading-text {
  font-size: var(--ty-font-base);
}

.dropdown-options-wrapper.loading .dropdown-options,
.dropdown-options-wrapper.loading > slot#options-slot,
.dropdown-options-wrapper.loading .empty-state {
  display: none;
}

.dropdown-loading-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  animation: ty-select-spin 0.7s linear infinite;
  /* Active-state indicator — full accent, not the soft resting shade */
  color: var(--select-accent-bold, var(--ty-color-primary));
}

.dropdown-loading-spinner svg {
  width: 100%;
  height: 100%;
}

.dropdown-loading-text {
  color: var(--ty-text-soft);
}

@keyframes ty-select-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .dropdown-loading-spinner {
    animation-duration: 1.6s;
  }
}

/* Custom scrollbar styles */
${customScrollbarStyles}

/* ===== FLAVOR VARIANTS (set --select-accent*, consumed above) ===== */
${FLAVORS.filter((f) => f !== "neutral").map((f) => selectFlavor(f)).join("")}
`;

