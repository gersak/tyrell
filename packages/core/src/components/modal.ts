/**
 * Modal Component
 * 
 * Pure wrapper for modal dialogs using the native <dialog> element.
 * Provides backdrop, focus management, scroll locking, and keyboard interaction
 * without imposing any styling on content.
 * 
 * Features:
 * - Native dialog element wrapper
 * - Dual API: declarative (open attribute) and imperative (show/hide methods)
 * - Cancellable `beforeclose` lifecycle event for unsaved-state flows
 * - Auto-hiding close button on hover (desktop only)
 * - Scroll locking with unique modal IDs
 * - Customizable backdrop via CSS variables
 * 
 * @example
 * <ty-modal id="my-modal">
 *   <div class="ty-elevated p-6 rounded-lg max-w-md">
 *     <h3 class="text-lg font-semibold mb-4">Modal Title</h3>
 *     <p class="ty-text- mb-4">Modal content here</p>
 *     <ty-button onclick="this.closest('ty-modal').hide()">
 *       Close
 *     </ty-button>
 *   </div>
 * </ty-modal>
 */

import { lockScroll, unlockScroll } from '../utils/scroll-lock.js';
import { ensureStyles } from '../utils/styles.js';
import { modalStyles } from '../styles/modal.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Modal attributes configuration
 */
export interface ModalAttributes {
  open: boolean;                    // Controls modal visibility
  backdrop: boolean;                // Show backdrop behind modal
  closeOnOutsideClick: boolean;     // Close on backdrop click
  closeOnEscape: boolean;           // Close on ESC key
}

/**
 * How a modal close was triggered.
 */
export type ModalCloseReason =
  | 'programmatic'   // .hide() called
  | 'backdrop'       // user clicked the backdrop
  | 'escape'         // user pressed ESC
  | 'close-button'   // user clicked the built-in X
  | 'native';        // <dialog>.close() fired without us routing it

/**
 * Modal close event detail
 */
export interface ModalCloseDetail {
  reason: ModalCloseReason;
  returnValue?: string;               // Optional return value from dialog
}

/**
 * Modal beforeclose event detail — fired *before* the modal closes. The event
 * is cancellable; consumers can call `event.preventDefault()` to abort the
 * close, render their own UI (e.g. a styled "Discard changes?" prompt), and
 * later call `.hide()` themselves when ready.
 */
export interface ModalBeforeCloseDetail {
  reason: ModalCloseReason;
}

// ============================================================================
// WeakMaps for State Management
// ============================================================================

const backdropClickHandlers = new WeakMap<TyModal, (e: Event) => void>();
const escapeKeyHandlers = new WeakMap<TyModal, (e: KeyboardEvent) => void>();
const closeButtonHandlers = new WeakMap<TyModal, (e: Event) => void>();
const hoverEnterHandlers = new WeakMap<TyModal, (e: Event) => void>();
const hoverLeaveHandlers = new WeakMap<TyModal, (e: Event) => void>();
const modalIds = new WeakMap<TyModal, string>(); // Store unique modal ID for scroll locking

// ============================================================================
// Constants
// ============================================================================

/**
 * SVG icon for the close button (Lucide X icon)
 */
const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse boolean attribute
 * Boolean attribute semantics: presence -> true, explicit 'false' -> false
 * Matches ClojureScript implementation
 */
function parseBoolAttr(el: Element, name: string): boolean {
  if (!el.hasAttribute(name)) {
    return false;
  }
  
  const value = el.getAttribute(name);
  
  // Explicit "false" string means false
  if (value !== null && value.toLowerCase() === 'false') {
    return false;
  }
  
  // Attribute present (even empty) means true
  return true;
}

/**
 * Read modal attributes with defaults
 */
function getModalAttributes(el: TyModal): ModalAttributes {
  return {
    open: parseBoolAttr(el, 'open'),
    backdrop: el.hasAttribute('backdrop') ? parseBoolAttr(el, 'backdrop') : true,
    closeOnOutsideClick: el.hasAttribute('close-on-outside-click')
      ? parseBoolAttr(el, 'close-on-outside-click')
      : true,
    closeOnEscape: el.hasAttribute('close-on-escape')
      ? parseBoolAttr(el, 'close-on-escape')
      : true,
  };
}

/**
 * Get the modal dialog element from shadow root
 */
function getModalDialog(shadowRoot: ShadowRoot): HTMLDialogElement | null {
  return shadowRoot.querySelector<HTMLDialogElement>('.ty-modal-dialog');
}

/**
 * Get or create a unique modal ID for scroll locking
 */
function getModalId(el: TyModal): string {
  let id = modalIds.get(el);
  if (!id) {
    id = `modal-${el.id || Math.random().toString(36).substr(2, 9)}`;
    modalIds.set(el, id);
  }
  return id;
}

/**
 * Check if device is mobile (for hover behavior)
 */
function isMobile(): boolean {
  return window.innerWidth < 768 || navigator.maxTouchPoints > 0;
}

/**
 * Dispatch custom modal event
 */
function dispatchModalEvent(el: TyModal, eventType: string, detail: unknown): void {
  const event = new CustomEvent(eventType, {
    detail,
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(event);
}

// ============================================================================
// Dialog Structure Creation
// ============================================================================

/**
 * Ensure the internal dialog structure exists in shadow DOM
 */
function ensureInternalDialog(shadowRoot: ShadowRoot): HTMLDialogElement {
  let dialog = getModalDialog(shadowRoot);
  
  if (!dialog) {
    dialog = document.createElement('dialog');
    const closeButton = document.createElement('button');
    const contentDiv = document.createElement('div');
    const slot = document.createElement('slot');
    
    // Setup dialog structure
    dialog.className = 'ty-modal-dialog';
    
    // Setup close button with SVG icon
    closeButton.className = 'close-button';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close modal');
    closeButton.innerHTML = CLOSE_ICON;
    
    // Setup content container
    contentDiv.className = 'modal-content';
    contentDiv.appendChild(slot);
    
    // Assemble: dialog > [close-button, content-div]
    dialog.appendChild(closeButton);
    dialog.appendChild(contentDiv);
    shadowRoot.appendChild(dialog);
  }
  
  return dialog;
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Close modal with cancellable beforeclose lifecycle.
 *
 *   1. Emit `beforeclose` (cancellable, bubbles, composed). Consumers can
 *      `event.preventDefault()` to abort the close — render your own UI for
 *      unsaved-state flows.
 *   2. Remove the `open` attribute, which triggers the actual close.
 *
 * Callers pass `reason` so consumers can decide differently based on intent
 * (e.g. "OK to discard via ESC, but not via .hide() during a save").
 */
function closeModal(
  el: TyModal,
  reason: ModalCloseReason = 'programmatic',
  opts?: { force?: boolean }
): void {
  const shadowRoot = el.shadowRoot;
  const dialog = shadowRoot ? getModalDialog(shadowRoot) : null;

  if (!dialog || !dialog.open) return;

  // `force: true` bypasses the cancellable event. Used by consumers AFTER
  // they've shown their own confirm UI and the user said "yes, close" —
  // calling `.hide()` again without force would re-trigger their intercept.
  if (!opts?.force) {
    const beforeClose = new CustomEvent<ModalBeforeCloseDetail>('beforeclose', {
      detail: { reason },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    el.dispatchEvent(beforeClose);
    if (beforeClose.defaultPrevented) return;
  }

  // Remove open attribute (triggers actual close).
  el.removeAttribute('open');
}

/**
 * Open modal programmatically
 */
function openModal(el: TyModal): void {
  el.setAttribute('open', 'true');
}

/**
 * Handle backdrop click
 */
function handleBackdropClick(el: TyModal, event: Event): void {
  event.stopPropagation();
  const shadowRoot = el.shadowRoot;
  const dialog = shadowRoot ? getModalDialog(shadowRoot) : null;
  
  // Only close if clicking on dialog backdrop (not content)
  if (dialog && event.target === dialog) {
    event.preventDefault();
    closeModal(el, 'backdrop');
  }
}

/**
 * Handle escape key press
 */
function handleEscapeKey(el: TyModal, event: KeyboardEvent): void {
  event.stopPropagation();
  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal(el, 'escape');
  }
}

/**
 * Handle close button click
 */
function handleCloseButtonClick(el: TyModal, event: Event): void {
  event.preventDefault();
  event.stopPropagation();
  closeModal(el, 'close-button');
}

/**
 * Handle hover enter on modal content (hide close button)
 */
function handleHoverEnter(_el: TyModal, event: Event): void {
  const content = event.currentTarget as HTMLElement;
  const dialog = content.closest('.ty-modal-dialog');
  if (dialog) {
    const closeButton = dialog.querySelector<HTMLElement>('.close-button');
    if (closeButton) {
      closeButton.classList.add('hide');
    }
  }
}

/**
 * Handle hover leave on modal content (show close button)
 */
function handleHoverLeave(_el: TyModal, event: Event): void {
  const content = event.currentTarget as HTMLElement;
  const dialog = content.closest('.ty-modal-dialog');
  if (dialog) {
    const closeButton = dialog.querySelector<HTMLElement>('.close-button');
    if (closeButton) {
      closeButton.classList.remove('hide');
    }
  }
}

/**
 * Setup backdrop click handling
 */
function setupBackdropClick(el: TyModal, dialog: HTMLDialogElement, enabled: boolean): void {
  // Remove existing listener
  const existingHandler = backdropClickHandlers.get(el);
  if (existingHandler) {
    dialog.removeEventListener('click', existingHandler);
    backdropClickHandlers.delete(el);
  }
  
  // Add new listener if enabled
  if (enabled) {
    const handler = (e: Event) => handleBackdropClick(el, e);
    backdropClickHandlers.set(el, handler);
    dialog.addEventListener('click', handler);
  }
}

/**
 * Setup escape key handling
 */
function setupEscapeKey(el: TyModal, dialog: HTMLDialogElement, enabled: boolean): void {
  // Remove existing listener
  const existingHandler = escapeKeyHandlers.get(el);
  if (existingHandler) {
    dialog.removeEventListener('keydown', existingHandler);
    escapeKeyHandlers.delete(el);
  }
  
  // Add new listener if enabled
  if (enabled) {
    const handler = (e: KeyboardEvent) => handleEscapeKey(el, e);
    escapeKeyHandlers.set(el, handler);
    dialog.addEventListener('keydown', handler);
  }
}

/**
 * Setup close button click handling and visibility
 */
function setupCloseButton(el: TyModal, dialog: HTMLDialogElement, showButton: boolean): void {
  const closeButton = dialog.querySelector<HTMLButtonElement>('.close-button');
  if (!closeButton) return;
  
  // Show or hide close button based on close-on-outside-click setting
  if (showButton) {
    closeButton.style.display = '';
  } else {
    closeButton.style.display = 'none';
  }
  
  // Remove existing listener
  const existingHandler = closeButtonHandlers.get(el);
  if (existingHandler) {
    closeButton.removeEventListener('click', existingHandler);
    closeButtonHandlers.delete(el);
  }
  
  // Add click listener only if button is visible
  if (showButton) {
    const handler = (e: Event) => handleCloseButtonClick(el, e);
    closeButtonHandlers.set(el, handler);
    closeButton.addEventListener('click', handler);
  }
}

/**
 * Setup close button hover handlers (desktop only)
 */
function setupCloseButtonHover(el: TyModal, dialog: HTMLDialogElement): void {
  const modalContent = dialog.querySelector<HTMLElement>('.modal-content');
  if (!modalContent) return;
  
  // Remove existing listeners
  const existingEnterHandler = hoverEnterHandlers.get(el);
  const existingLeaveHandler = hoverLeaveHandlers.get(el);
  
  if (existingEnterHandler) {
    modalContent.removeEventListener('mouseenter', existingEnterHandler);
    hoverEnterHandlers.delete(el);
  }
  
  if (existingLeaveHandler) {
    modalContent.removeEventListener('mouseleave', existingLeaveHandler);
    hoverLeaveHandlers.delete(el);
  }
  
  // Add hover listeners only on desktop
  if (!isMobile()) {
    const enterHandler = (e: Event) => handleHoverEnter(el, e);
    const leaveHandler = (e: Event) => handleHoverLeave(el, e);
    
    hoverEnterHandlers.set(el, enterHandler);
    hoverLeaveHandlers.set(el, leaveHandler);
    
    modalContent.addEventListener('mouseenter', enterHandler);
    modalContent.addEventListener('mouseleave', leaveHandler);
  }
}

// ============================================================================
// Core Render Function
// ============================================================================

/**
 * Render the modal structure and sync state
 */
function render(el: TyModal): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;
  
  const attributes = getModalAttributes(el);
  const dialog = ensureInternalDialog(shadowRoot);
  const modalId = getModalId(el);
  
  // Ensure styles are loaded
  ensureStyles(shadowRoot, { css: modalStyles, id: 'ty-modal' });
  
  // Apply dialog class
  dialog.className = 'ty-modal-dialog';
  
  // Apply backdrop attribute
  if (attributes.backdrop) {
    dialog.setAttribute('data-backdrop', 'true');
  } else {
    dialog.removeAttribute('data-backdrop');
  }
  
  // Setup event handlers
  setupBackdropClick(el, dialog, attributes.closeOnOutsideClick);
  setupEscapeKey(el, dialog, attributes.closeOnEscape);
  setupCloseButton(el, dialog, attributes.closeOnOutsideClick);
  setupCloseButtonHover(el, dialog);
  
  // Sync open state with native dialog
  if (attributes.open) {
    if (!dialog.open) {
      // Lock scroll
      lockScroll(modalId);
      
      // Show dialog
      if (attributes.backdrop) {
        dialog.showModal();
      } else {
        dialog.show();
      }
      
      // Dispatch open event
      dispatchModalEvent(el, 'open', {});
    }
  } else {
    if (dialog.open) {
      // Unlock scroll
      unlockScroll(modalId);
      
      // Close dialog
      dialog.close();
      
      // Dispatch close event
      dispatchModalEvent(el, 'close', { 
        reason: 'programmatic' 
      } as ModalCloseDetail);
    }
  }
  
  // Handle dialog's native close event.
  //
  // Child components (ty-dropdown, ty-multiselect, ty-date-picker) dispatch a
  // bubbling+composed `close` custom event when their popups close. Those
  // events bubble up to *this* dialog and trigger `onclose` too — without this
  // guard, opening a dropdown inside a modal and closing the dropdown would
  // close the whole modal. The native dialog `close` event is not composed
  // and targets the dialog itself, so we only react when `event.target` is
  // the dialog.
  dialog.onclose = (event: Event) => {
    if (event.target !== dialog) return;

    // Ensure scroll is unlocked
    unlockScroll(modalId);

    // Sync the open attribute
    if (el.hasAttribute('open')) {
      el.removeAttribute('open');
      dispatchModalEvent(el, 'close', {
        reason: 'native',
        returnValue: dialog.returnValue || undefined
      } as ModalCloseDetail);
    }
  };
}

/**
 * Cleanup all resources when component disconnects
 */
function cleanup(el: TyModal): void {
  const modalId = modalIds.get(el);
  const shadowRoot = el.shadowRoot;
  const dialog = shadowRoot ? getModalDialog(shadowRoot) : null;
  
  // Force unlock scroll if modal removed while open
  if (modalId) {
    unlockScroll(modalId);
    modalIds.delete(el);
  }
  
  if (!dialog) return;
  
  // Cleanup backdrop click handler
  const backdropHandler = backdropClickHandlers.get(el);
  if (backdropHandler) {
    dialog.removeEventListener('click', backdropHandler);
    backdropClickHandlers.delete(el);
  }
  
  // Cleanup escape key handler
  const escapeHandler = escapeKeyHandlers.get(el);
  if (escapeHandler) {
    dialog.removeEventListener('keydown', escapeHandler);
    escapeKeyHandlers.delete(el);
  }
  
  // Cleanup close button handler
  const closeButton = dialog.querySelector<HTMLButtonElement>('.close-button');
  if (closeButton) {
    const closeHandler = closeButtonHandlers.get(el);
    if (closeHandler) {
      closeButton.removeEventListener('click', closeHandler);
      closeButtonHandlers.delete(el);
    }
  }
  
  // Cleanup hover handlers
  const modalContent = dialog.querySelector<HTMLElement>('.modal-content');
  if (modalContent) {
    const enterHandler = hoverEnterHandlers.get(el);
    const leaveHandler = hoverLeaveHandlers.get(el);
    
    if (enterHandler) {
      modalContent.removeEventListener('mouseenter', enterHandler);
      hoverEnterHandlers.delete(el);
    }
    
    if (leaveHandler) {
      modalContent.removeEventListener('mouseleave', leaveHandler);
      hoverLeaveHandlers.delete(el);
    }
  }
}

// ============================================================================
// Component Definition
// ============================================================================

/**
 * TyModal Web Component
 */
export class TyModal extends HTMLElement {
  /** Programmatic API methods */
  show?: () => void;
  /**
   * Close the modal. Without `force`, fires `beforeclose` first — consumers
   * can `preventDefault()` to abort. With `force: true`, bypasses the
   * cancellable event; used when the consumer has already obtained user
   * consent through their own UI.
   */
  hide?: (opts?: { force?: boolean }) => void;
  
  /** Observed attributes */
  static get observedAttributes() {
    return ['open', 'backdrop', 'close-on-outside-click', 'close-on-escape'];
  }
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    render(this);
    
    // Add public API methods
    this.show = () => openModal(this);
    this.hide = (opts?: { force?: boolean }) => closeModal(this, 'programmatic', opts);
  }
  
  disconnectedCallback() {
    cleanup(this);
  }
  
  attributeChangedCallback(_name: string, _oldValue: string | null, _newValue: string | null) {
    // Re-render on attribute changes
    render(this);
  }
}

// Register the custom element
if (!customElements.get('ty-modal')) {
  customElements.define('ty-modal', TyModal);
}