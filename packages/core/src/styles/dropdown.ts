/**
 * Dropdown Component Styles
 *
 * ARCHITECTURE:
 * - Shared styles: Apply to both desktop and mobile
 * - Desktop styles: Scoped under .dropdown-mode-desktop
 * - Mobile styles: Scoped under .dropdown-mode-mobile
 *
 * This prevents CSS conflicts between desktop dialog and mobile modal implementations.
 */

import { customScrollbarStyles } from "./custom-scrollbar.js";

export const dropdownStyles = `
/* ==================== SHARED STYLES ==================== */
/* These apply to BOTH desktop and mobile modes */

:host {
  display: block;
  width: auto;
  min-width: 200px;
}

:host {
  --mobile-border-color: var(--ty-border, #5858587d);
}

.dropdown-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

/* Label styling */
.dropdown-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ty-label-color);
  margin-bottom: 6px;
  line-height: 1.25;
  padding-left: 12px;
}

.required-icon {
  display: inline-flex;
  align-items: center;
  color: #ef4444;
  width: 12px;
  height: 12px;
  vertical-align: middle;
  margin-left: 4px;
}

.dropdown-wrapper {
  position: relative;
  display: block;
  width: 100%;
}

/* ==================== DESKTOP MODE STYLES ==================== */
/* All styles scoped under .dropdown-mode-desktop */

/* Stub (trigger button) */
.dropdown-mode-desktop .dropdown-stub {
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
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
  transition: var(--ty-transition-all), opacity 0.2s ease;
  outline: none;
}

.dropdown-mode-desktop .dropdown-stub:hover {
  border-color: var(--input-border-hover, var(--ty-input-border-hover));
}

.dropdown-mode-desktop .dropdown-stub[disabled] {
  background-color: var(--input-disabled-bg, var(--ty-input-disabled-bg));
  color: var(--input-disabled-color, var(--ty-input-disabled-color));
  cursor: not-allowed;
  opacity: 0.6;
}

.dropdown-mode-desktop .dropdown-stub:focus {
  border-color: var(--input-border-hover, var(--ty-input-border-hover));
}

/* Hide stub when dropdown is open */
.dropdown-mode-desktop .dropdown-wrapper:has(.dropdown-chevron.open) .dropdown-stub {
  opacity: 0;
  pointer-events: none;
}

/* Size variants */
.dropdown-mode-desktop .dropdown-stub.xs {
  min-height: var(--ty-size-xs);
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  padding: var(--ty-spacing-1) var(--ty-spacing-2);
  padding-right: calc(var(--ty-spacing-2) + 1rem + var(--ty-spacing-1));
}

.dropdown-mode-desktop .dropdown-stub.sm {
  min-height: var(--ty-size-sm);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  padding: var(--ty-spacing-1) var(--ty-spacing-2);
  padding-right: calc(var(--ty-spacing-2) + 1rem + var(--ty-spacing-1));
}

.dropdown-mode-desktop .dropdown-stub.md {
  min-height: var(--ty-size-md);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  padding: var(--ty-spacing-2) var(--ty-spacing-3);
  padding-right: calc(var(--ty-spacing-3) + 1rem + var(--ty-spacing-2));
}

.dropdown-mode-desktop .dropdown-stub.lg {
  min-height: var(--ty-size-lg);
  font-size: var(--ty-font-base);
  line-height: var(--ty-leading-base);
  letter-spacing: var(--ty-tracking-base);
  padding: var(--ty-spacing-3) var(--ty-spacing-4);
  padding-right: calc(var(--ty-spacing-4) + 1rem + var(--ty-spacing-3));
}

.dropdown-mode-desktop .dropdown-stub.xl {
  min-height: var(--ty-size-xl);
  font-size: var(--ty-font-lg);
  line-height: var(--ty-leading-lg);
  letter-spacing: var(--ty-tracking-lg);
  padding: var(--ty-spacing-4) var(--ty-spacing-5);
  padding-right: calc(var(--ty-spacing-5) + 1rem + var(--ty-spacing-4));
}

/* Clearable adjustments */
.dropdown-mode-desktop .dropdown-stub.xs.clearable.has-selection {
  padding-right: calc(var(--ty-spacing-2) + 2rem + var(--ty-spacing-2));
}

.dropdown-mode-desktop .dropdown-stub.sm.clearable.has-selection {
  padding-right: calc(var(--ty-spacing-2) + 2rem + var(--ty-spacing-2));
}

.dropdown-mode-desktop .dropdown-stub.md.clearable.has-selection {
  padding-right: calc(var(--ty-spacing-3) + 2rem + var(--ty-spacing-3));
}

.dropdown-mode-desktop .dropdown-stub.lg.clearable.has-selection {
  padding-right: calc(var(--ty-spacing-4) + 2rem + var(--ty-spacing-4));
}

.dropdown-mode-desktop .dropdown-stub.xl.clearable.has-selection {
  padding-right: calc(var(--ty-spacing-5) + 2rem + var(--ty-spacing-5));
}

/* Start-slot icon (leading content inside the stub trigger) */
.dropdown-mode-desktop .dropdown-stub ::slotted([slot="start"]),
.dropdown-mode-mobile .dropdown-stub ::slotted([slot="start"]) {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 0.5rem;
  color: var(--ty-color-text-soft);
}

.dropdown-mode-desktop .dropdown-stub ::slotted(ty-icon[slot="start"]),
.dropdown-mode-mobile .dropdown-stub ::slotted(ty-icon[slot="start"]) {
  width: 1em;
  height: 1em;
}

/* Placeholder */
.dropdown-mode-desktop .dropdown-placeholder {
  color: var(--input-placeholder, var(--ty-input-placeholder));
  font-weight: var(--ty-font-light);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-style: italic;
  pointer-events: none;
}

.dropdown-mode-desktop .dropdown-stub.has-selection .dropdown-placeholder {
  display: none;
}

/* Selected content */
.dropdown-mode-desktop .dropdown-stub slot[name="selected"] {
  display: block;
}

.dropdown-mode-desktop .dropdown-stub.has-selection slot[name="selected"] {
  width: 100%;
}

.dropdown-mode-desktop .dropdown-stub slot[name="selected"] * {
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  line-height: inherit;
  outline: none;
  appearance: none;
}

/* Chevron */
.dropdown-mode-desktop .dropdown-chevron {
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

.dropdown-mode-desktop .dropdown-chevron.open {
  transform: translateY(-50%) rotate(180deg);
}

.dropdown-mode-desktop .dropdown-chevron svg {
  width: 100%;
  height: 100%;
}

/* Clear button */
.dropdown-mode-desktop .dropdown-clear-btn {
  position: absolute;
  top: 50%;
  right: calc(var(--ty-spacing-3) + 1rem + var(--ty-spacing-2));
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--input-placeholder, var(--ty-input-placeholder));
  cursor: pointer;
  transition: var(--ty-transition-colors);
  display: none;
}

.dropdown-mode-desktop .dropdown-clear-btn:hover {
  color: var(--ty-color-danger);
}

.dropdown-mode-desktop .dropdown-clear-btn:active {
  transform: translateY(-50%) scale(0.9);
}

.dropdown-mode-desktop .dropdown-clear-btn svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* Dialog */
.dropdown-mode-desktop .dropdown-dialog {
  position: fixed;
  width: var(--dropdown-width, 200px);
  max-width: 100vw;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  box-sizing: border-box;
  padding: var(--dropdown-padding, 20px);
  opacity: 0;
  transition: opacity 400ms ease;
  transform: translate(var(--dropdown-offset-x, 0px), var(--dropdown-offset-y, 0px));
  top: -1000px;
  left: -1000px;
}

/* When opened via showModal(), apply flex layout and direction */
.dropdown-mode-desktop .dropdown-dialog[open] {
  display: flex;
  flex-direction: column;
}

.dropdown-mode-desktop .dropdown-dialog.position-below {
  left: var(--dropdown-x);
  top: var(--dropdown-y);
}

.dropdown-mode-desktop .dropdown-dialog.position-above {
  left: var(--dropdown-x);
  bottom: var(--dropdown-y);
  top: auto;
  flex-direction: column-reverse;
}

.dropdown-mode-desktop .dropdown-dialog.position-above .dropdown-header {
  margin-top: 4px;
}

.dropdown-mode-desktop .dropdown-dialog.position-below .dropdown-header {
  margin-bottom: 4px;
}

.dropdown-mode-desktop .dropdown-dialog.position-below .dropdown-options {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1), var(--ty-shadow-md);
}

.dropdown-mode-desktop .dropdown-dialog.open {
  display: flex;
  opacity: 1;
}

.dropdown-mode-desktop .dropdown-dialog.open .dropdown-options {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.dropdown-mode-desktop .dropdown-dialog::backdrop {
  background: transparent;
}

/* Dialog header */
.dropdown-mode-desktop .dropdown-header {
  display: flex;
  align-items: center;
  gap: var(--ty-spacing-2);
  position: relative;
}

.dropdown-mode-desktop .dropdown-search-input {
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

.dropdown-mode-desktop .dropdown-search-input:focus {
  border-color: var(--input-border-focus, var(--ty-input-border-focus));
  box-shadow: 0 0 0 3px var(--input-shadow-focus, var(--ty-input-shadow-focus));
}

.dropdown-mode-desktop .dropdown-search-input:disabled {
  background-color: var(--input-disabled-bg, var(--ty-input-disabled-bg));
  color: var(--input-disabled-color, var(--ty-input-disabled-color));
  cursor: not-allowed;
  opacity: 0.6;
}

.dropdown-mode-desktop .dropdown-search-input::placeholder {
  color: var(--input-placeholder, var(--ty-input-placeholder));
}

/* Search input sizes */
.dropdown-mode-desktop .dropdown-search-input.xs {
  min-height: var(--ty-size-xs);
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  padding: var(--ty-spacing-1) var(--ty-spacing-2);
  padding-right: calc(var(--ty-spacing-2) + 1rem + var(--ty-spacing-1));
}

.dropdown-mode-desktop .dropdown-search-input.sm {
  min-height: var(--ty-size-sm);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  padding: var(--ty-spacing-1) var(--ty-spacing-2);
  padding-right: calc(var(--ty-spacing-2) + 1rem + var(--ty-spacing-1));
}

.dropdown-mode-desktop .dropdown-search-input.md {
  min-height: var(--ty-size-md);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  padding: var(--ty-spacing-2) var(--ty-spacing-3);
  padding-right: calc(var(--ty-spacing-3) + 1rem + var(--ty-spacing-2));
}

.dropdown-mode-desktop .dropdown-search-input.lg {
  min-height: var(--ty-size-lg);
  font-size: var(--ty-font-base);
  line-height: var(--ty-leading-base);
  letter-spacing: var(--ty-tracking-base);
  padding: var(--ty-spacing-3) var(--ty-spacing-4);
  padding-right: calc(var(--ty-spacing-4) + 1rem + var(--ty-spacing-3));
}

.dropdown-mode-desktop .dropdown-search-input.xl {
  min-height: var(--ty-size-xl);
  font-size: var(--ty-font-lg);
  line-height: var(--ty-leading-lg);
  letter-spacing: var(--ty-tracking-lg);
  padding: var(--ty-spacing-4) var(--ty-spacing-5);
  padding-right: calc(var(--ty-spacing-5) + 1rem + var(--ty-spacing-4));
}

.dropdown-mode-desktop .dropdown-search-chevron {
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

.dropdown-mode-desktop .dropdown-search-chevron.open {
  transform: translateY(-50%) rotate(180deg);
}

.dropdown-mode-desktop .dropdown-search-chevron svg {
  width: 100%;
  height: 100%;
}

/* Options container */
.dropdown-mode-desktop .dropdown-options {
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
  transform: translateY(-20px) scale(0.90);
  transition:
    opacity 100ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1);

}

/* Hide native scrollbar only when custom scrollbar is active */
.dropdown-mode-desktop .dropdown-options.ty-custom-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.dropdown-mode-desktop .dropdown-options.ty-custom-scroll::-webkit-scrollbar {
  display: none;
}

/* Options wrapper - positioned container for scrollbar track */
.dropdown-mode-desktop .dropdown-options-wrapper {
  position: relative;
}

/* Show custom scrollbar on hover over options */
.dropdown-mode-desktop .dropdown-options-wrapper:hover .ty-scrollbar-track-y.has-overflow {
  opacity: 1;
}

/* Option elements */
.dropdown-mode-desktop .dropdown-options ::slotted(option) {
  padding: var(--ty-spacing-2) var(--ty-spacing-3);
  color: var(--input-color, var(--ty-input-color));
  cursor: pointer;
  transition:
    var(--ty-transition-colors),
    transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
  background: none;
  font-size: inherit;
  font-family: inherit;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
  transform: translateX(0);
}

.dropdown-mode-desktop .dropdown-options ::slotted(option:hover) {
  background-color: var(--ty-bg-neutral-soft);
}

.dropdown-mode-desktop .dropdown-options ::slotted(option[highlighted]) {
  background-color: var(--ty-bg-primary-soft);
  color: var(--ty-color-primary-mild);
}

.dropdown-mode-desktop .dropdown-options ::slotted(option[selected]) {
  background-color: var(--ty-color-primary);
  color: #ffffff;
}

.dropdown-mode-desktop .dropdown-options ::slotted(option[hidden]),
.dropdown-mode-desktop .dropdown-options ::slotted(ty-option[hidden]),
.dropdown-mode-desktop .dropdown-options ::slotted(ty-tag[hidden]) {
  display: none;
}

/* ==================== MOBILE MODE STYLES ==================== */
/* All styles scoped under .dropdown-mode-mobile */
/* Floating modal design (centered card with backdrop) */

/* Stub (trigger button) - same as desktop but scoped */
.dropdown-mode-mobile .dropdown-stub {
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
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

.dropdown-mode-mobile .dropdown-stub:hover {
  border-color: var(--input-border-hover, var(--ty-input-border-hover));
}

.dropdown-mode-mobile .dropdown-stub[disabled] {
  background-color: var(--input-disabled-bg, var(--ty-input-disabled-bg));
  color: var(--input-disabled-color, var(--ty-input-disabled-color));
  cursor: not-allowed;
  opacity: 0.6;
}

/* Size variants */
.dropdown-mode-mobile .dropdown-stub.xs {
  min-height: var(--ty-size-xs);
  font-size: var(--ty-font-xs);
  line-height: var(--ty-leading-xs);
  letter-spacing: var(--ty-tracking-xs);
  padding: var(--ty-spacing-1) var(--ty-spacing-2);
  padding-right: calc(var(--ty-spacing-2) + 1rem + var(--ty-spacing-1));
}

.dropdown-mode-mobile .dropdown-stub.sm {
  min-height: var(--ty-size-sm);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  padding: var(--ty-spacing-1) var(--ty-spacing-2);
  padding-right: calc(var(--ty-spacing-2) + 1rem + var(--ty-spacing-1));
}

.dropdown-mode-mobile .dropdown-stub.md {
  min-height: var(--ty-size-md);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  padding: var(--ty-spacing-2) var(--ty-spacing-3);
  padding-right: calc(var(--ty-spacing-3) + 1rem + var(--ty-spacing-2));
}

.dropdown-mode-mobile .dropdown-stub.lg {
  min-height: var(--ty-size-lg);
  font-size: var(--ty-font-base);
  line-height: var(--ty-leading-base);
  letter-spacing: var(--ty-tracking-base);
  padding: var(--ty-spacing-3) var(--ty-spacing-4);
  padding-right: calc(var(--ty-spacing-4) + 1rem + var(--ty-spacing-3));
}

.dropdown-mode-mobile .dropdown-stub.xl {
  min-height: var(--ty-size-xl);
  font-size: var(--ty-font-lg);
  line-height: var(--ty-leading-lg);
  letter-spacing: var(--ty-tracking-lg);
  padding: var(--ty-spacing-4) var(--ty-spacing-5);
  padding-right: calc(var(--ty-spacing-5) + 1rem + var(--ty-spacing-4));
}

/* Placeholder */
.dropdown-mode-mobile .dropdown-placeholder {
  color: var(--input-placeholder, var(--ty-input-placeholder));
  font-weight: var(--ty-font-light);
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-style: italic;
  pointer-events: none;
}

.dropdown-mode-mobile .dropdown-stub.has-selection .dropdown-placeholder {
  display: none;
}

/* Selected content */
.dropdown-mode-mobile .dropdown-stub slot[name="selected"] {
  display: block;
}

.dropdown-mode-mobile .dropdown-stub.has-selection slot[name="selected"] {
  width: 100%;
}

.dropdown-mode-mobile .dropdown-stub slot[name="selected"] * {
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  line-height: inherit;
  outline: none;
  appearance: none;
}

/* Chevron */
.dropdown-mode-mobile .dropdown-chevron {
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

.dropdown-mode-mobile .dropdown-chevron svg {
  width: 100%;
  height: 100%;
}

/* Mobile dialog - full screen overlay with centered floating card */
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
  padding-top: 10vh;
  border: none;
  background: transparent;
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

/* Mobile content container - floating card */
.dropdown-mode-mobile .mobile-dialog-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: calc(100% - 32px);
  max-width: 400px;
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

/* Close button - circular with border */
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

/* Mobile search input */
.dropdown-mode-mobile .mobile-search-input {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  background: var(--ty-surface-floating);
  color: var(--ty-text);
  border: 1px solid var(--ty-border-soft);
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
  border: 2px solid;
  border-color: var(--mobile-border-color);
}

.dropdown-mode-mobile .mobile-search-input::placeholder {
  color: var(--ty-text-faint);
}

/* Mobile options container - floating card with elevation */
.dropdown-mode-mobile .mobile-options-container {
  position: relative;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: var(--ty-surface-floating); /* Floating card background */
  border-radius: var(--ty-radius-lg);
  border: 1px solid var(--ty-border-soft);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 2px solid;
  border-color: var(--mobile-border-color);
}

/* Hide scrollbar but keep functionality */
.dropdown-mode-mobile .mobile-options-container {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.dropdown-mode-mobile .mobile-options-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* Mobile option styling - native <option> only */
.dropdown-mode-mobile .mobile-options-container ::slotted(option) {
  display: block;
  padding: var(--ty-spacing-2) var(--ty-spacing-3);
  margin: 2px 8px;
  color: var(--ty-text);
  cursor: pointer;
  transition: var(--ty-transition-all);
  border: none;
  background: transparent;
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  font-family: inherit;
  width: calc(100% - 16px);
  text-align: left;
  box-sizing: border-box;
  border-radius: var(--ty-radius-sm);
  min-height: 36px;
}

.dropdown-mode-mobile .mobile-options-container ::slotted(option:active) {
  background-color: var(--ty-bg-neutral-soft);
}

.dropdown-mode-mobile .mobile-options-container ::slotted(option[highlighted]) {
  background-color: var(--ty-bg-primary-soft);
  color: var(--ty-color-primary-mild);
}

.dropdown-mode-mobile .mobile-options-container ::slotted(option[selected]) {
  background: var(--ty-bg-primary);
  color: var(--ty-color-primary-strong);
}

.dropdown-mode-mobile .mobile-options-container ::slotted(option[hidden]),
.dropdown-mode-mobile .mobile-options-container ::slotted(ty-option[hidden]),
.dropdown-mode-mobile .mobile-options-container ::slotted(ty-tag[hidden]) {
  display: none;
}

/* ==================== FLAVOR VARIANTS ==================== */
/* Apply to both modes */

:host([flavor="primary"]) .dropdown-stub,
:host([flavor="primary"]) .dropdown-search-input {
  border-color: var(--ty-color-primary);
}

:host([flavor="primary"]) .dropdown-stub:hover,
:host([flavor="primary"]) .dropdown-search-input:focus {
  border-color: var(--ty-color-primary-mild);
  box-shadow: 0 0 0 3px var(--ty-color-primary-faint);
}

:host([flavor="secondary"]) .dropdown-stub,
:host([flavor="secondary"]) .dropdown-search-input {
  border-color: var(--ty-color-secondary);
}

:host([flavor="secondary"]) .dropdown-stub:hover,
:host([flavor="secondary"]) .dropdown-search-input:focus {
  border-color: var(--ty-color-secondary-mild);
  box-shadow: 0 0 0 3px var(--ty-color-secondary-faint);
}

:host([flavor="success"]) .dropdown-stub,
:host([flavor="success"]) .dropdown-search-input {
  border-color: var(--ty-color-success);
}

:host([flavor="success"]) .dropdown-stub:hover,
:host([flavor="success"]) .dropdown-search-input:focus {
  border-color: var(--ty-color-success-mild);
  box-shadow: 0 0 0 3px var(--ty-color-success-faint);
}

:host([flavor="danger"]) .dropdown-stub,
:host([flavor="danger"]) .dropdown-search-input {
  border-color: var(--ty-color-danger);
}

:host([flavor="danger"]) .dropdown-stub:hover,
:host([flavor="danger"]) .dropdown-search-input:focus {
  border-color: var(--ty-color-danger-mild);
  box-shadow: 0 0 0 3px var(--ty-color-danger-faint);
}

:host([flavor="warning"]) .dropdown-stub,
:host([flavor="warning"]) .dropdown-search-input {
  border-color: var(--ty-color-warning);
}

:host([flavor="warning"]) .dropdown-stub:hover,
:host([flavor="warning"]) .dropdown-search-input:focus {
  border-color: var(--ty-color-warning-mild);
  box-shadow: 0 0 0 3px var(--ty-color-warning-faint);
}

/* ==================== READONLY STATE ==================== */

:host([readonly]) .dropdown-chevron {
  display: none;
}

:host([readonly]) .dropdown-stub {
  padding-right: var(--ty-spacing-3);
}

:host([readonly]) .dropdown-stub,
:host([readonly]) .dropdown-stub slot[name="selected"] {
  cursor: initial;
}

/* Custom scrollbar styles */
${customScrollbarStyles}
`;
