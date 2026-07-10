/**
 * Select Component Styles
 * Layered over the shared multiselect styles (popup, mobile modal, search).
 *
 * Skins:
 * - default FIELD: the base .multiselect-stub already carries the form-field
 *   look (width 100%, --ty-input-* tokens) — only text treatment added here
 * - .compact: content-hugging trigger for toolbars, count badge
 * - .custom-trigger (slot="trigger"): all chrome stripped
 */

export const selectStyles = `
/* ===== COMPACT skin: hugs content (field skin = base styles) ===== */
.multiselect-stub.compact {
  display: inline-flex;
  flex-wrap: nowrap;
  width: auto;
  gap: 0.5rem;
  /* extra right padding = room for the absolutely-positioned chevron */
  padding: 0.5rem 2.25rem 0.5rem 0.875rem;
}

/* Consumer-provided trigger (slot="trigger"): no chrome at all */
.multiselect-stub.custom-trigger {
  display: inline-block;
  border: none;
  background: none;
  padding: 0;
  min-height: 0;
  border-radius: 0;
}
.multiselect-stub.custom-trigger:hover {
  border: none;
}

.select-count {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  border-radius: 9999px;
  background: var(--ty-bg-primary-soft);
  color: var(--ty-text-primary);
  font-size: var(--ty-font-xs);
  font-weight: var(--ty-font-semibold);
  font-style: normal;
}
.select-count[hidden] {
  display: none;
}
/* Selection text (field skin): single line, ellipsis, input colors */
.multiselect-stub .dropdown-placeholder {
  font-style: normal;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--input-color, var(--ty-input-color));
}

/* Empty state: muted placeholder color */
.multiselect-stub .dropdown-placeholder.placeholder-shown {
  color: var(--input-placeholder, var(--ty-input-placeholder));
}
.multiselect-stub .dropdown-placeholder[hidden] {
  display: none;
}

/* Single-select display clone (slot="selected"): the selected ty-option
   projected into the stub — its own :host([cloned]) styling strips the
   list-row chrome; here it just takes the text's flex slot. */
.multiselect-stub slot[name="selected"] {
  display: none;
}
.multiselect-stub.has-clone slot[name="selected"] {
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}
.multiselect-stub.compact.has-clone slot[name="selected"] {
  flex: 0 1 auto;
}

/* start/end slot content (icons etc.) — spacing comes from the stub's flex
   gap; muted like ty-input adornments. end sits before the chevron. */
.multiselect-stub ::slotted([slot="start"]),
.multiselect-stub ::slotted([slot="end"]) {
  flex-shrink: 0;
  color: var(--ty-text-soft);
}

/* Compact skin: the text IS the trigger label — no grow, regular text color */
.multiselect-stub.compact .dropdown-placeholder {
  flex-grow: 0;
  color: var(--ty-text);
}

/* Trigger stays visible while the popup is open (multiselect hides it) */
.dropdown-wrapper:has(.dropdown-chevron.open) .multiselect-stub {
  opacity: 1;
  pointer-events: auto;
}

/* ===== One-panel popup: search header fused with the options list ===== */

/* Single unified shadow around the whole panel (header + list as one silhouette) */
.dropdown-dialog.open {
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.14)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.08));
}

.dropdown-header {
  background: var(--input-bg, var(--ty-input-bg));
  border: 1px solid var(--input-border, var(--ty-input-border));
  border-bottom: 1px solid var(--ty-border-soft);
  border-radius: var(--ty-radius-lg) var(--ty-radius-lg) 0 0;
  padding: 0.25rem 0.5rem;
}
.dropdown-dialog.position-below .dropdown-header {
  margin-bottom: 0;
}
.dropdown-dialog.position-above .dropdown-header {
  margin-top: 0;
  border-top: 1px solid var(--ty-border-soft);
  border-bottom: 1px solid var(--input-border, var(--ty-input-border));
  border-radius: 0 0 var(--ty-radius-lg) var(--ty-radius-lg);
}

/* Magnifier adornment at the start of the search row */
.dropdown-search-icon {
  position: absolute;
  top: 50%;
  left: var(--ty-spacing-3);
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--input-placeholder, var(--ty-input-placeholder));
  pointer-events: none;
}
.dropdown-search-icon svg {
  width: 100%;
  height: 100%;
}

/* Mobile header: flex row, icon flows inline before the input */
.dropdown-mode-mobile .mobile-header-content .dropdown-search-icon {
  position: static;
  transform: none;
  flex-shrink: 0;
}

/* Search input: plain quiet row inside the panel */
.dropdown-search-input {
  border: none;
  border-radius: 0;
  background: transparent;
  min-height: 2.25rem;
  padding-top: 10px;
  padding-bottom: 4px;
  padding-right: var(--ty-spacing-2);
  /* room for the magnifier adornment */
  padding-left: calc(var(--ty-spacing-3) + 1rem + var(--ty-spacing-2));
}
.dropdown-search-input:focus {
  border: none;
  box-shadow: none;
}
/* Trigger already has a chevron - no second one inside the search row */
.dropdown-search-chevron {
  display: none;
}

/* With the search row hidden nothing inside is focusable, so the <dialog>
   itself receives focus on open — suppress its UA focus ring */
.dropdown-dialog:focus,
.dropdown-dialog:focus-visible {
  outline: none;
}

/* Search row hidden ('auto' below threshold / searchable="false"):
   the options panel owns the whole silhouette */
.dropdown-header[hidden] {
  display: none;
}
.dropdown-header[hidden] ~ .dropdown-options-wrapper .dropdown-options {
  border-top: 1px solid var(--input-border, var(--ty-input-border));
  border-radius: var(--ty-radius-lg);
}
.mobile-search-input[hidden],
.mobile-header-content .dropdown-search-icon[hidden] {
  display: none;
}

/* Options: vertical list rows fused under the search header.
   No own shadow/animation - the panel appears as one via dialog opacity. */
.dropdown-options {
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 0;
  padding: 0;
  border-top: none;
  border-radius: 0 0 var(--ty-radius-lg) var(--ty-radius-lg);
  box-shadow: none;
  transform: none;
  transition: none;
  /* ~9-10 visible rows before scrolling (custom scrollbar, native hidden) */
  max-height: 24rem;
}
.dropdown-dialog.position-below .dropdown-options {
  box-shadow: none;
}
.dropdown-dialog.position-above .dropdown-options {
  border-top: 1px solid var(--input-border, var(--ty-input-border));
  border-bottom: none;
  border-radius: var(--ty-radius-lg) var(--ty-radius-lg) 0 0;
}

/* Loading panel continues the fused silhouette exactly like .dropdown-options —
   the base layer styles it as a floating card (radius + shadow), which left a
   see-through gap under the search header while loading. */
.dropdown-loading {
  border-top: none;
  border-radius: 0 0 var(--ty-radius-lg) var(--ty-radius-lg);
  box-shadow: none;
}
.dropdown-dialog.position-above .dropdown-loading {
  border-top: 1px solid var(--input-border, var(--ty-input-border));
  border-bottom: none;
  border-radius: var(--ty-radius-lg) var(--ty-radius-lg) 0 0;
}

/* Selection tick — ty-select only (options keep their own styling otherwise;
   the stamped [selected] attribute is the consumer's styling hook) */
::slotted(ty-option) {
  position: relative;
}
::slotted(ty-option[selected])::after {
  content: "✓";
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ty-color-primary);
  pointer-events: none;
}

/* Mobile modal: same vertical list */
.dropdown-mode-mobile .section-content ::slotted(ty-option) {
  display: block;
  width: 100%;
}
`;
