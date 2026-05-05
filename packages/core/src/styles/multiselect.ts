/**
 * Multiselect Component Styles
 * PORTED FROM: clj/ty/components/multiselect.css
 */

import { customScrollbarStyles } from "./custom-scrollbar.js";

export const multiselectStyles = `
/* Multiselect-specific styles extending dropdown base styles */

:host {
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

/* ===== MULTISELECT-SPECIFIC STYLES ===== */

/* Multiselect stub modifications */
.multiselect-stub {
  min-height: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  /* Transitions - includes opacity for open state */
  transition: var(--ty-transition-all), opacity 0.2s ease;
  outline: none;
  background: var(--input-bg, var(--ty-input-bg));
  color: var(--input-color, var(--ty-input-color));
  border: 1px solid var(--input-border, var(--ty-input-border));
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

.multiselect-stub:hover {
  border-color: var(--input-border-hover, var(--ty-input-border-hover));
}

.multiselect-stub[disabled] {
  background-color: var(--input-disabled-bg, var(--ty-input-disabled-bg));
  color: var(--input-disabled-color, var(--ty-input-disabled-color));
  cursor: not-allowed;
  opacity: 0.6;
}

/* Hide stub when dropdown is open */
.dropdown-wrapper:has(.dropdown-chevron.open) .multiselect-stub {
  opacity: 0;
  pointer-events: none;
}

/* Hide stub chips when mobile dialog is open (let modal show them) */
.dropdown-mode-mobile .dropdown-wrapper:has(.mobile-dialog[open]) .multiselect-chips {
  display: none;
}

/* When tags are present, reduce padding to make room */
.multiselect-stub.has-tags {
  padding: 0.25rem 2.5rem 0.25rem 0.5rem;
  width: 100%;
}

.multiselect-stub.has-tags slot[name="selected"] {
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
.multiselect-chips {
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

/* Options area styling - Override for multiselect */
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

  /* Multiselect-specific: flex wrap for tags */
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

/* Ensure ty-tag components in multiselect have proper sizing */
.multiselect-chips ty-tag {
  max-width: 150px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .multiselect-chips ty-tag {
    max-width: 100px;
  }
}


/* Ensure proper spacing in container layouts */
.multiselect-container {
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

.dropdown-label {
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

:host([disabled]) .multiselect-container {
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
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  margin: 0;
  padding: 0;
  padding-top: 10vh; /* Position content from top */
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
  background: rgba(0, 0, 0, 0.5);
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
  max-height: calc(90vh - 10vh);
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
}

/* Header for non-searchable (label + close button) */
.dropdown-mode-mobile .mobile-header-nosearch {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 16px;
  padding: 0;
  background: transparent;
  position: relative;
  min-height: 40px;
}

.dropdown-mode-mobile .mobile-header-label {
  position: absolute;
  bottom: 100%;
  left: 6px;
  margin-bottom: 4px;
  font-size: var(--ty-font-lg);
  line-height: var(--ty-leading-lg);
  letter-spacing: var(--ty-tracking-lg);
  font-weight: 700;
  color: var(--ty-color-neutral);
  pointer-events: none;
}

/* Close button - circular with border (matches dropdown.ts) */
.dropdown-mode-mobile .mobile-close-button {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ty-surface-floating);
  border: 2px solid var(--mobile-border-color);
  border-radius: 50%;
  color: var(--ty-text-strong);
  cursor: pointer;
  transition: var(--ty-transition-all);
  padding: 0;
}

.dropdown-mode-mobile .mobile-close-button:hover {
  background: var(--ty-bg-neutral);
  border-color: var(--ty-border);
  color: var(--ty-text-strong);
}

.dropdown-mode-mobile .mobile-close-button:active {
  transform: scale(0.9);
}

.dropdown-mode-mobile .mobile-close-button svg {
  width: 24px;
  height: 24px;
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

/* ===== SECTION HEADERS - Fixed 48px height ===== */

.dropdown-mode-mobile .section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  flex-shrink: 0;
  padding: 0 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ty-text);
  background: var(--ty-bg-neutral-soft);
  border-bottom: 1px solid var(--ty-border-faint);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

/* Expanded section is mild (already viewing it), collapsed is normal (draws attention) */
.dropdown-mode-mobile [data-expanded="false"] .section-header {
  color: var(--ty-text);
}

.dropdown-mode-mobile [data-expanded="true"] .section-header {
  color: var(--ty-text-mild);
}

.dropdown-mode-mobile .section-header:hover {
  background: var(--ty-bg-neutral);
}

.dropdown-mode-mobile .section-header:active {
  background: var(--ty-bg-neutral-mild);
}

.dropdown-mode-mobile .section-header .section-title {
  flex: 1;
}

.dropdown-mode-mobile .section-header .section-count {
  font-weight: 400;
  opacity: 0.7;
  margin-left: 0.25rem;
}

/* Chevron indicator (only for selected section) */
.dropdown-mode-mobile .section-header .section-chevron {
  width: 16px;
  height: 16px;
  color: var(--ty-text-faint);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-mode-mobile .section-header .section-chevron svg {
  width: 100%;
  height: 100%;
}

/* Rotate chevron when expanded */
.dropdown-mode-mobile .mobile-selected-section[data-expanded="true"] .section-chevron {
  transform: rotate(180deg);
}

/* Available section header - not clickable */
.dropdown-mode-mobile .mobile-available-section .section-header {
  cursor: default;
}

.dropdown-mode-mobile .mobile-available-section .section-header:hover {
  background: var(--ty-bg-neutral-soft);
}

/* ===== SELECTED SECTION - Expandable with smooth transition ===== */

.dropdown-mode-mobile .mobile-selected-section {
  display: flex;
  flex-direction: column;
  background: var(--ty-surface-elevated);
  border-bottom: 2px solid var(--ty-border);
  overflow: hidden;
  transition: max-height 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Collapsed state - just header (48px) */
.dropdown-mode-mobile .mobile-selected-section[data-expanded="false"] {
  max-height: 48px;
  flex: 0 0 48px;
}

/* Expanded state - takes remaining space */
.dropdown-mode-mobile .mobile-selected-section[data-expanded="true"] {
  max-height: 1000px; /* Large enough for content */
  flex: 1;
}

.dropdown-mode-mobile .mobile-selected-section .section-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-content: flex-start;
}

/* ===== AVAILABLE SECTION ===== */

.dropdown-mode-mobile .mobile-available-section {
  display: flex;
  flex-direction: column;
  background: var(--ty-surface-floating);
  overflow: hidden;
  transition: max-height 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Collapsed state - just header (48px) */
.dropdown-mode-mobile .mobile-available-section[data-expanded="false"] {
  max-height: 48px;
  flex: 0 0 48px;
}

/* Expanded state - takes remaining space */
.dropdown-mode-mobile .mobile-available-section[data-expanded="true"] {
  max-height: 1000px; /* Large enough for content */
  flex: 1;
}

.dropdown-mode-mobile .mobile-available-section .section-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-content: flex-start;
}

/* ===== EMPTY STATES ===== */

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

/* Show empty state when no tags present */
.dropdown-mode-mobile .mobile-selected-section[data-empty="true"] .empty-state,
.dropdown-mode-mobile .mobile-available-section[data-empty="true"] .empty-state {
  display: block;
}

/* Hide slot content when empty */
.dropdown-mode-mobile .mobile-selected-section[data-empty="true"] slot,
.dropdown-mode-mobile .mobile-available-section[data-empty="true"] slot {
  display: none;
}

/* ===== TAG STYLING IN MOBILE ===== */

.dropdown-mode-mobile .section-content ::slotted(ty-tag) {
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s ease;
  margin: 2px 0; /* Vertical spacing like dropdown options */
}

.dropdown-mode-mobile .section-content ::slotted(ty-tag:hover) {
  transform: scale(1.02);
}

.dropdown-mode-mobile .section-content ::slotted(ty-tag:active) {
  transform: scale(0.98);
}

/* Dimmed appearance for hidden filtered tags */
.dropdown-mode-mobile .section-content ::slotted(ty-tag[hidden]) {
  display: none !important;
}

/* Custom scrollbar styles */
${customScrollbarStyles}
`;

