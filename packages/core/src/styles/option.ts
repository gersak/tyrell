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

:host([cloned]) .option-content {
  padding: 0px;
  background: transparent;
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
