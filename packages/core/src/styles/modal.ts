/**
 * Modal Styles
 * 
 * CSS for the modal component wrapper.
 * The modal is a pure wrapper - all content styling is user-defined.
 */

export const modalStyles = `
:host {
  display: contents;
  /* Don't interfere with layout */
}

/* Part of the modal wrapper functionality, not user content styling */
.close-button {
  position: absolute;
  top: -8px;
  right: -8px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: var(--ty-transition-colors);
  z-index: 1;
  color: #d8d8d8;

  /* Remove all default browser styling that could cause outlines/borders */
  outline: none;
  box-shadow: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  /* Remove mobile tap highlights and focus rings */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.close-button:hover {
  color: white;
}

/* Explicitly remove focus and active states for all interaction modes */
.close-button:focus,
.close-button:focus-visible,
.close-button:focus-within,
.close-button:active {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
}

/* Override hover color even in focus/active states */
.close-button:hover,
.close-button:focus:hover,
.close-button:active:hover {
  color: white;
}

.close-button.hide {
  visibility: hidden;
}

/* Pure wrapper: only essential modal functionality, no styling of user content */
.ty-modal-dialog {
  /* Reset default dialog styles */
  padding: 18px;
  border: none;
  margin: 0;
  background: transparent;

  /* Centered */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  z-index: 1000;
  overflow: hidden;

  /* No sizing - let user content determine size */
  max-width: 85vw;
  max-height: 90vh;

  outline: none;
}

/* Panel zoom-in synced with the backdrop fade (shadcn-style zoom-in-95).
   Enter-only: animating exit on a native <dialog> means delaying close(). */
.ty-modal-dialog[open] {
  animation: ty-modal-enter var(--ty-modal-duration, 200ms) ease-out;
}

@keyframes ty-modal-enter {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.93);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Backdrop is part of modal functionality, not user content */
.ty-modal-dialog::backdrop {
  background: var(--ty-modal-backdrop, rgba(0, 0, 0, 0.5));
  backdrop-filter: var(--ty-modal-backdrop-blur, blur(2px));
  animation: ty-modal-backdrop-enter var(--ty-modal-duration, 200ms) ease-out;
}

/* When backdrop is disabled */
.ty-modal-dialog:not([data-backdrop])::backdrop {
  background: transparent;
  backdrop-filter: none;
}

/* sheet: full screen on phones, sliding up from the bottom. Opt-in, and only
   below 768px (the select's mobile line); wider screens keep the centered dialog. The panel is forced to
   fill the sheet (!important beats its own width, inline style included),
   since a sheet that leaves page showing around the panel isn't one. */
@media (max-width: 768px) {
  .ty-modal-dialog[data-sheet] {
    inset: 0;
    transform: none;
    width: 100%;
    height: 100dvh;
    max-width: none;
    max-height: none;
    padding: env(safe-area-inset-top) env(safe-area-inset-right)
             env(safe-area-inset-bottom) env(safe-area-inset-left);
    background: var(--ty-surface-floating);
    box-sizing: border-box;
  }

  .ty-modal-dialog[data-sheet][open] {
    animation-name: ty-modal-sheet-enter;
  }

  .ty-modal-dialog[data-sheet] .modal-content {
    height: 100%;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .ty-modal-dialog[data-sheet] ::slotted(*) {
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: none !important;
    min-height: 100% !important;
    margin: 0 !important;
    border: none !important;
    border-radius: 0 !important;
  }

  /* On the panel, not out on the backdrop */
  .ty-modal-dialog[data-sheet] .close-button {
    top: calc(env(safe-area-inset-top) + 8px);
    right: calc(env(safe-area-inset-right) + 8px);
    color: var(--ty-text-soft);
  }

  .ty-modal-dialog[data-sheet] .close-button:hover,
  .ty-modal-dialog[data-sheet] .close-button:focus:hover,
  .ty-modal-dialog[data-sheet] .close-button:active:hover {
    color: var(--ty-text);
  }
}

@keyframes ty-modal-sheet-enter {
  from {
    transform: translateY(100%);
  }

  to {
    transform: none;
  }
}

/* Minimal container - no styling imposed on user content */
.modal-content {
  color: var(--ty-text);
}

@keyframes ty-modal-backdrop-enter {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ty-modal-dialog[open],
  .ty-modal-dialog[data-sheet][open],
  .ty-modal-dialog::backdrop {
    animation: none;
  }
}
`;
