/** Option Component Styles */

export const optionStyles = `
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

/* Cloned copy (projected into the select's trigger field): host defaults to
   inline like any unstyled custom element, which ignores width/overflow —
   force a block box so the parent's flex-basis:0 truncation (select.ts
   .select-stub.has-clone slot[name="selected"]) actually clips it, and
   collapse the content to a single ellipsized line instead of wrapping. */
:host([cloned]) {
  display: block;
  min-width: 0;
  overflow: hidden;
}
:host([cloned]) .option-content {
  display: block;
  padding: 0px;
  background: transparent;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.option-content:hover {
  background: var(--ty-bg-neutral-soft);
}

.option-content[highlighted] {
  background: var(--ty-bg-neutral-soft);
  color: var(--ty-text-strong);
  font-weight: var(--ty-font-semibold);
}

/* Selected: quiet — bolder text color only, no background slab, no weight change */
.option-content[selected] {
  background: transparent;
  color: var(--ty-text-bold);
}

/* Lucide check — right-aligned, visible only on selected options */
.option-check {
  display: none;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-left: auto;
  color: var(--ty-color-primary);
}

.option-content[selected] .option-check {
  display: block;
}

/* Never show the check on the copy cloned into the select's trigger field */
:host([cloned]) .option-check {
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
