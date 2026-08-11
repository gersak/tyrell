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
`;
