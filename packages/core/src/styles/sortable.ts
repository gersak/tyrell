/**
 * Sortable Styles — ty-sortable host (shadow) and the light-DOM rules its
 * items need before a gesture starts (touch-action is read at pointerdown).
 */

export const sortableStyles = `
:host {
  display: block;
  position: relative;
  box-sizing: border-box;
  --ty-sortable-indicator-color: var(--ty-color-primary, #3b82f6);
  --ty-sortable-blocked-color: var(--ty-color-danger, #ef4444);
  --ty-sortable-indicator-size: 2px;
  --ty-sortable-source-opacity: 0.4;
  --ty-sortable-source-outline: none;
  --ty-sortable-ghost-scale: 1.02;
  --ty-sortable-ghost-rotate: 0deg;
  --ty-sortable-ghost-shadow: var(--ty-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1));
  --ty-sortable-duration: 200ms;
}

:host([hidden]) {
  display: none;
}

@media (any-pointer: coarse) {
  :host {
    --ty-sortable-indicator-size: 3px;
  }
}

/* An empty list being dragged over has no gap to draw a line in. */
:host(:state(over):state(empty)) {
  outline: 2px dashed var(--ty-sortable-indicator-color);
  outline-offset: -2px;
}

:host(:state(blocked)) {
  outline: 2px dashed var(--ty-sortable-blocked-color);
  outline-offset: -2px;
  cursor: not-allowed;
}

.live {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
`

/**
 * Adopted into every root (document or shadow root) that contains a
 * ty-sortable. touch-action must be on the element before the finger lands:
 * the browser decides whether a gesture pans at pointerdown.
 */
export const sortableLightStyles = `
ty-sortable [data-handle] {
  touch-action: none;
  cursor: grab;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
ty-sortable img,
ty-sortable a {
  -webkit-user-drag: none;
}
@media (any-pointer: coarse) {
  ty-sortable:not(:state(handles)) > * {
    touch-action: manipulation;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
}
ty-sortable input,
ty-sortable textarea,
ty-sortable [contenteditable] {
  -webkit-user-select: text;
  user-select: text;
}
/* The dragged copy. Its list's --ty-sortable-* properties are carried over
   to the layer it lives in. Page CSS can restyle it, e.g. with a surface:
   [data-ty-sortable-ghost] { background: var(--ty-surface-floating); } */
[data-ty-sortable-ghost] {
  box-shadow: var(--ty-sortable-ghost-shadow, 0 10px 20px rgba(0, 0, 0, 0.15));
  opacity: 0.95;
}
`

/**
 * Adopted into the document on the first drag. While a mouse drags: the
 * grabbing hand everywhere, not-allowed over a list that refuses the item.
 */
export const sortableCursorStyles = `
body:has(> [data-ty-sortable-layer][data-cursor="grabbing"]),
body:has(> [data-ty-sortable-layer][data-cursor="grabbing"]) * {
  cursor: grabbing !important;
}
body:has(> [data-ty-sortable-layer][data-cursor="blocked"]),
body:has(> [data-ty-sortable-layer][data-cursor="blocked"]) * {
  cursor: not-allowed !important;
}
`
