/** Option Component Styles */

export const optionStyles = `
/* Options the author hid and options a ty-select search left out, at any
   depth in the select (a framework component's element around each option
   too). !important beats the select's mobile list display:block. The
   select's trigger sets the variable: a hidden option can still be the
   value it shows. */
:host([hidden]),
:host([filtered-out]) {
  display: var(--ty-option-hidden-display, none) !important;
}

.option-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ty-spacing-2);
  box-sizing: border-box;
  width: 100%;

  cursor: pointer;
  user-select: none;

  transition: var(--ty-transition-all);

  /* Linear-paired typography */
  color: var(--ty-text);
  font-family: inherit;
  font-size: var(--ty-font-sm);
  line-height: var(--ty-leading-sm);
  letter-spacing: var(--ty-tracking-sm);
  padding: var(--ty-spacing-2) var(--ty-spacing-3);
  border-radius: var(--ty-radius-md);
}

/* Shown in the select's trigger (the select sets inTrigger): one ellipsized
   line on the field size ladder (styles/field-size.ts), no row chrome. The
   select sizes the host. */
.option-content.in-trigger {
  display: block;
  padding: 0px;
  background: transparent;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: var(--ty-field-font, var(--ty-font-sm));
  line-height: var(--ty-field-leading, var(--ty-leading-sm));
  letter-spacing: var(--ty-field-tracking, var(--ty-tracking-sm));
}

.option-content:hover {
  background: var(--ty-bg-neutral-soft);
}

.option-content[highlighted] {
  background: var(--ty-bg-neutral-soft);
  color: var(--ty-text-strong);
}

/* Selected: quiet — bolder text color only, no background slab, no weight change */
.option-content[selected] {
  background: transparent;
  color: var(--ty-text-bold);
}

/* Lucide check — right-aligned. Its box is always reserved so selecting
   (or highlighting) never changes the row's width and rewraps the text. */
.option-check {
  display: block;
  visibility: hidden;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-left: auto;
  color: var(--ty-color-primary);
}

.option-content[selected] .option-check {
  visibility: visible;
}

.option-content.in-trigger .option-check {
  display: none;
}

.option-content[selected]:hover {
  background: var(--ty-bg-neutral-soft);
}

.option-content[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-content[hidden] {}

.option-content * {
  pointer-events: none;
}
`
