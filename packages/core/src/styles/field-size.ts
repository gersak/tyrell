/**
 * Field Size Ladder
 * One source of truth for how `size` scales every field component.
 * Components consume the --ty-field-* vars; nothing hardcodes a size.
 */

/* --ty-field-leading is an even pixel value at every rung, not the matching
   --ty-leading-* token: a single-line field centers its line box inside the
   field height, so an odd line box (--ty-leading-sm is 21px) leaves a half
   pixel that Chrome rounds down and the text sits 1px low. Multi-line text
   (textarea, copy multiline) keeps the real leading tokens.

   Base block = the DEFAULT_SIZE ladder rung, because a component left at its
   default never gets a `size` attribute to match on (setProperty reflects,
   defaults don't). :host([size]) rules override it. */
export const fieldSizeVars = `
:host {
  --ty-field-height: var(--ty-size-sm, 2rem);
  --ty-field-pad-x: 10px;
  --ty-field-font: var(--ty-font-sm);
  --ty-field-leading: 20px;
  --ty-field-tracking: var(--ty-tracking-sm);
  --ty-field-label-font: var(--ty-font-xs);
  --ty-field-label-leading: var(--ty-leading-xs);
  --ty-field-label-gap: 5px;
  /* Text that sits OUTSIDE the field box (label, error message) has to line up
     with the value INSIDE it. The value is inset by the wrapper's 1px border
     plus --ty-field-pad-x; outside text only ever cleared the padding, so it
     started exactly 1px to the left of the value it labelled — at every rung,
     on every field. Resolved per rung: the calc reads whichever --ty-field-pad-x
     is winning on the host. */
  --ty-field-outer-pad-x: calc(var(--ty-field-pad-x) + 1px);
  --ty-field-control: 24px;
  --ty-field-icon: 16px;
}

:host([size="xs"]) {
  --ty-field-height: var(--ty-size-xs, 1.75rem);
  --ty-field-pad-x: 8px;
  --ty-field-font: var(--ty-font-xs);
  --ty-field-leading: 16px;
  --ty-field-tracking: var(--ty-tracking-xs);
  --ty-field-label-font: var(--ty-font-xs);
  --ty-field-label-leading: var(--ty-leading-xs);
  --ty-field-label-gap: 4px;
  --ty-field-control: 20px;
  --ty-field-icon: 14px;
}

:host([size="md"]) {
  --ty-field-height: var(--ty-size-md, 2.25rem);
  --ty-field-pad-x: 12px;
  --ty-field-font: var(--ty-font-sm);
  --ty-field-leading: 20px;
  --ty-field-tracking: var(--ty-tracking-sm);
  --ty-field-label-font: var(--ty-font-sm);
  --ty-field-label-leading: var(--ty-leading-sm);
  --ty-field-label-gap: 6px;
  --ty-field-control: 28px;
  --ty-field-icon: 18px;
}

:host([size="lg"]) {
  --ty-field-height: var(--ty-size-lg, 2.5rem);
  --ty-field-pad-x: 14px;
  --ty-field-font: var(--ty-font-base);
  --ty-field-leading: 24px;
  --ty-field-tracking: var(--ty-tracking-base);
  --ty-field-label-font: var(--ty-font-sm);
  --ty-field-label-leading: var(--ty-leading-sm);
  --ty-field-label-gap: 6px;
  --ty-field-control: 32px;
  --ty-field-icon: 20px;
}

:host([size="xl"]) {
  --ty-field-height: var(--ty-size-xl, 2.75rem);
  --ty-field-pad-x: 16px;
  --ty-field-font: var(--ty-font-lg);
  --ty-field-leading: 28px;
  --ty-field-tracking: var(--ty-tracking-base);
  --ty-field-label-font: var(--ty-font-base);
  --ty-field-label-leading: var(--ty-leading-base);
  --ty-field-label-gap: 8px;
  --ty-field-control: 36px;
  --ty-field-icon: 22px;
}

/* Narrow viewports drop the two biggest rungs one step — same ladder, no
   component-specific overrides.

   A stepped-down rung must carry the WHOLE rung: --ty-field-control is the
   in-field button box (ty-copy's copy button, the date-picker's icon), and it
   sets the wrapper's content height. Leave it at the original rung and the
   field ends up taller than --ty-field-height — the ladder silently breaks on
   exactly one component. */
@media (max-width: 640px) {
  :host([size="lg"]) {
    --ty-field-height: var(--ty-size-md, 2.25rem);
    --ty-field-pad-x: 12px;
    --ty-field-font: var(--ty-font-sm);
    --ty-field-leading: 20px;
    --ty-field-control: 28px;
    --ty-field-icon: 18px;
  }

  :host([size="xl"]) {
    --ty-field-height: var(--ty-size-lg, 2.5rem);
    --ty-field-pad-x: 14px;
    --ty-field-font: var(--ty-font-base);
    --ty-field-leading: 24px;
    --ty-field-control: 32px;
    --ty-field-icon: 20px;
  }
}

@media (max-width: 480px) {
  :host([size="xl"]) {
    --ty-field-height: var(--ty-size-md, 2.25rem);
    --ty-field-pad-x: 12px;
    --ty-field-font: var(--ty-font-sm);
    --ty-field-leading: 20px;
    --ty-field-control: 28px;
    --ty-field-icon: 18px;
  }
}
`
