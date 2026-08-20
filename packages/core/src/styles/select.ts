/**
 * Select Component Styles
 * Layered over the shared select-field styles (popup, mobile modal, search).
 *
 * Skins:
 * - default FIELD: the base .select-stub already carries the form-field
 *   look (width 100%, --ty-input-* tokens) — only text treatment added here
 * - .compact: content-hugging trigger for toolbars, count badge
 * - .custom-trigger (slot="trigger"): all chrome stripped
 */

export const selectStyles = `
/* Compact skin hugs its content (field skin = base styles) */
.select-stub.compact {
  display: inline-flex;
  flex-wrap: nowrap;
  width: auto;
  gap: 0.5rem;
  /* extra right padding = room for the absolutely-positioned chevron */
  padding: 0.5rem 2.25rem 0.5rem 0.875rem;
}

/* Consumer-provided trigger (slot="trigger"): no chrome at all */
.select-stub.custom-trigger {
  display: inline-block;
  width: auto;
  border: none;
  background: none;
  padding: 0;
  min-height: 0;
  border-radius: 0;
}
.select-stub.custom-trigger:hover {
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
  /* --ty-text-primary never existed as a token — this silently fell back
     to inherited/unset color. Now follows the select's own flavor. */
  background: color-mix(in oklab, var(--select-accent, var(--ty-color-primary)) 15%, transparent);
  color: var(--select-accent-bold, var(--ty-color-primary-strong));
  font-size: var(--ty-font-xs);
  font-weight: var(--ty-font-semibold);
  font-style: normal;
}
.select-count[hidden] {
  display: none;
}

/* Clear (x) button — normal flex child of .select-stub, not absolutely
   positioned like .dropdown-chevron: it just takes its own space in the
   row, no padding-right gutter math needed. Lives in the trigger slot's
   fallback content, so it's automatically absent under slot="trigger". */
.select-clear {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--input-placeholder, var(--ty-input-placeholder));
  cursor: pointer;
  border-radius: var(--ty-radius-sm);
  transition: var(--ty-local-transition, all 0.15s ease);
}
.select-clear[hidden] {
  display: none;
}
.select-clear:hover {
  /* Destructive utility action — neutral at rest, warns danger-red on
     hover regardless of the field's own flavor. */
  color: var(--ty-color-danger);
  background-color: var(--ty-bg-danger-soft);
}
.select-clear svg {
  width: 100%;
  height: 100%;
}

/* Selection text (field skin): single line, ellipsis, input colors.
   flex-basis 0, not auto — .select-stub is flex-wrap:wrap, and auto's
   hypothetical size is the FULL untruncated text width (wrap-line
   assignment happens before shrinking), which pushed fixed-size siblings
   (.select-clear) onto a second line even though the text visibly had
   room after truncating. 0 makes this item contribute ~nothing to the
   line-fit check up front; grow/shrink + overflow:hidden still truncate
   it identically. */
.select-stub .dropdown-placeholder {
  font-style: normal;
  flex: 1 1 0%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--input-color, var(--ty-input-color));
}

.select-stub .dropdown-placeholder.placeholder-shown {
  color: var(--input-placeholder, var(--ty-input-placeholder));
}
.select-stub .dropdown-placeholder[hidden] {
  display: none;
}

/* Single-select display clone (slot="selected"): the selected ty-option
   projected into the stub — its own :host([cloned]) styling strips the
   list-row chrome; here it just takes the text's flex slot. */
.select-stub slot[name="selected"] {
  display: none;
}
.select-stub.has-clone slot[name="selected"] {
  display: block;
  /* flex-basis 0, not auto — same reasoning as .dropdown-placeholder above:
     .select-stub is flex-wrap:wrap, and auto's hypothetical size is the
     clone's full untruncated text width, which pushes .select-clear onto
     a second line. */
  flex: 1 1 0%;
  min-width: 0;
  overflow: hidden;
}
.select-stub.compact.has-clone slot[name="selected"] {
  flex: 0 1 auto;
}

/* start/end slot content (icons etc.) — spacing comes from the stub's flex
   gap; muted like ty-input adornments. end sits before the chevron. */
.select-stub ::slotted([slot="start"]),
.select-stub ::slotted([slot="end"]) {
  flex-shrink: 0;
  color: var(--ty-text-soft);
}

/* Compact skin: the text IS the trigger label — no grow, regular text color.
   flex-basis: auto (not the field skin's 0%) — content-hugging needs its
   natural content width as the starting point; 0% would collapse it since
   grow is also 0 here (nothing left to expand it back out). */
.select-stub.compact .dropdown-placeholder {
  flex: 0 1 auto;
  color: var(--ty-text);
}

/* Trigger stays visible while the popup is open (the popup hides it) */
.dropdown-wrapper:has(.dropdown-chevron.open) .select-stub {
  opacity: 1;
  pointer-events: auto;
}

/* One-panel popup: search header fused with the options list */

/* Single unified shadow around the whole panel (header + list as one silhouette) */
.dropdown-dialog.open {
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.14)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.08));
}

/* Card-style header: the search input keeps its own bordered-field look
   (base styles) and sits inset in the panel, TagPicker-style — no divider,
   whitespace separates it from the list. The header's OWN surface/border is
   part of the floating panel's chrome, not a form field — --ty-surface-
   floating/--ty-floating-border, matching .dropdown-options below it (same
   reasoning as the base-panel fix: --ty-input-* is deliberately faint for
   resting form fields and read as a missing/mismatched edge here). */
.dropdown-header {
  background: var(--ty-surface-floating);
  border: 1px solid var(--ty-floating-border);
  border-bottom: none;
  border-radius: var(--ty-radius-lg) var(--ty-radius-lg) 0 0;
  padding: var(--ty-spacing-2) var(--ty-spacing-2) var(--ty-spacing-1);
}
.dropdown-dialog.position-below .dropdown-header {
  margin-bottom: 0;
}
.dropdown-dialog.position-above .dropdown-header {
  margin-top: 0;
  border-top: none;
  border-bottom: 1px solid var(--ty-floating-border);
  border-radius: 0 0 var(--ty-radius-lg) var(--ty-radius-lg);
  padding: var(--ty-spacing-1) var(--ty-spacing-2) var(--ty-spacing-2);
}

/* Magnifier adornment inside the search field (header padding + field inset) */
.dropdown-search-icon {
  position: absolute;
  top: 50%;
  left: calc(var(--ty-spacing-2) + var(--ty-spacing-3));
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

/* Mobile header: flex row, icon flows inline before the input. Same 32x32
   footprint as .mobile-close-button (18px glyph centered in the box, not a
   bare 18px glyph flush at the edge) so the row has two matching bookends —
   a bare icon on one side and a 32px circle on the other read as lopsided
   even with equal flex gap on both sides. Matching them also centers the
   search input's flex:1 fill symmetrically between the two. Fixed white +
   18px glyph, same reasoning as .mobile-header-label — this sits on the
   dark ::backdrop blur in both themes, not a theme surface. */
.dropdown-mode-mobile .mobile-header-content .dropdown-search-icon {
  position: static;
  transform: none;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #ffffff;
}
.dropdown-mode-mobile .mobile-header-content .dropdown-search-icon svg {
  width: 18px;
  height: 18px;
}

/* Search input: bordered field from base styles; just size + icon room */
.dropdown-search-input {
  min-height: 2.25rem;
  padding-right: var(--ty-spacing-2);
  /* room for the magnifier adornment */
  padding-left: calc(var(--ty-spacing-3) + 1rem + var(--ty-spacing-2));
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
  border-top: 1px solid var(--ty-floating-border);
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
  /* Card-style list: rounded rows sit inset from the panel edges */
  padding: var(--ty-spacing-1);
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
  border-top: 1px solid var(--ty-floating-border);
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
  border-top: 1px solid var(--ty-floating-border);
  border-bottom: none;
  border-radius: var(--ty-radius-lg) var(--ty-radius-lg) 0 0;
}

/* Selection tick lives inside ty-option (lucide check on [selected]) */

/* Mobile modal: same vertical list */
.dropdown-mode-mobile .section-content ::slotted(ty-option) {
  display: block;
  width: 100%;
}
`;
