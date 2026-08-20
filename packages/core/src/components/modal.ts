/**
 * Modal Component - wrapper around the native <dialog> element providing
 * backdrop, scroll locking and keyboard interaction, without styling content.
 * Closing runs through a cancellable `beforeclose` event (unsaved-state flows).
 */

import { lockScroll, unlockScroll } from '../utils/scroll-lock.js';
import { ensureStyles } from '../utils/styles.js';
import { modalStyles } from '../styles/modal.js';

// Types

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

// WeakMaps for State Management

const backdropClickHandlers = new WeakMap<TyModal, (e: Event) => void>();
const escapeKeyHandlers = new WeakMap<TyModal, (e: KeyboardEvent) => void>();
const closeButtonHandlers = new WeakMap<TyModal, (e: Event) => void>();
const hoverEnterHandlers = new WeakMap<TyModal, (e: Event) => void>();
const hoverLeaveHandlers = new WeakMap<TyModal, (e: Event) => void>();
const modalIds = new WeakMap<TyModal, string>(); // Store unique modal ID for scroll locking
// Why the modal is closing, handed from closeModal() to the render() pass that
// the `open` attribute removal triggers — otherwise `close` can only ever
// report 'programmatic' and the reason the consumer saw in `beforeclose`
// (backdrop / escape / close-button) is lost.
const pendingCloseReasons = new WeakMap<TyModal, ModalCloseReason>();

// Constants

/** Lucide X icon for the close button. */
const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

// Helper Functions

/**
 * Boolean attribute semantics: presence -> true, explicit 'false' -> false.
 */
function parseBoolAttr(el: Element, name: string): boolean {
  if (!el.hasAttribute(name)) {
    return false;
  }
  
  const value = el.getAttribute(name);
  
  if (value !== null && value.toLowerCase() === 'false') {
    return false;
  }
  
  return true;
}

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

function getModalDialog(shadowRoot: ShadowRoot): HTMLDialogElement | null {
  return shadowRoot.querySelector<HTMLDialogElement>('.ty-modal-dialog');
}

/**
 * Get or create a unique modal ID for scroll locking
 */
function getModalId(el: TyModal): string {
  let id = modalIds.get(el);
  if (!id) {
    id = `modal-${el.id || Math.random().toString(36).slice(2, 11)}`;
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

function dispatchModalEvent(el: TyModal, eventType: string, detail: unknown): void {
  // Non-bubbling, like the native <dialog> events these mirror. A modal opened
  // from inside another modal is a light-DOM descendant of the outer one, so a
  // bubbling `close` would land on the outer modal's own close listener and
  // take both down. Listen on the element itself.
  const event = new CustomEvent(eventType, {
    detail,
    cancelable: true,
  });
  el.dispatchEvent(event);
}

// Dialog Structure Creation

function ensureInternalDialog(shadowRoot: ShadowRoot): HTMLDialogElement {
  let dialog = getModalDialog(shadowRoot);
  
  if (!dialog) {
    dialog = document.createElement('dialog');
    const closeButton = document.createElement('button');
    const contentDiv = document.createElement('div');
    const slot = document.createElement('slot');
    
    dialog.className = 'ty-modal-dialog';
    
    closeButton.className = 'close-button';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close modal');
    closeButton.innerHTML = CLOSE_ICON;
    
    contentDiv.className = 'modal-content';
    contentDiv.appendChild(slot);
    
    dialog.appendChild(closeButton);
    dialog.appendChild(contentDiv);
    shadowRoot.appendChild(dialog);
  }
  
  return dialog;
}

// Event Handlers

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
      cancelable: true,
    });
    el.dispatchEvent(beforeClose);
    if (beforeClose.defaultPrevented) return;
  }

  // Remove open attribute (triggers actual close, which emits `close`).
  pendingCloseReasons.set(el, reason);
  el.removeAttribute('open');
}

function openModal(el: TyModal): void {
  el.setAttribute('open', 'true');
}

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

function handleEscapeKey(el: TyModal, event: KeyboardEvent): void {
  event.stopPropagation();
  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal(el, 'escape');
  }
}

function handleCloseButtonClick(el: TyModal, event: Event): void {
  event.preventDefault();
  event.stopPropagation();
  closeModal(el, 'close-button');
}

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

function setupBackdropClick(el: TyModal, dialog: HTMLDialogElement, enabled: boolean): void {
  const existingHandler = backdropClickHandlers.get(el);
  if (existingHandler) {
    dialog.removeEventListener('click', existingHandler);
    backdropClickHandlers.delete(el);
  }
  
  if (enabled) {
    const handler = (e: Event) => handleBackdropClick(el, e);
    backdropClickHandlers.set(el, handler);
    dialog.addEventListener('click', handler);
  }
}

function setupEscapeKey(el: TyModal, dialog: HTMLDialogElement, enabled: boolean): void {
  const existingHandler = escapeKeyHandlers.get(el);
  if (existingHandler) {
    dialog.removeEventListener('keydown', existingHandler);
    escapeKeyHandlers.delete(el);
  }
  
  if (enabled) {
    const handler = (e: KeyboardEvent) => handleEscapeKey(el, e);
    escapeKeyHandlers.set(el, handler);
    dialog.addEventListener('keydown', handler);
  }
}

function setupCloseButton(el: TyModal, dialog: HTMLDialogElement, showButton: boolean): void {
  const closeButton = dialog.querySelector<HTMLButtonElement>('.close-button');
  if (!closeButton) return;
  
  // Show or hide close button based on close-on-outside-click setting
  if (showButton) {
    closeButton.style.display = '';
  } else {
    closeButton.style.display = 'none';
  }
  
  const existingHandler = closeButtonHandlers.get(el);
  if (existingHandler) {
    closeButton.removeEventListener('click', existingHandler);
    closeButtonHandlers.delete(el);
  }
  
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
  
  if (!isMobile()) {
    const enterHandler = (e: Event) => handleHoverEnter(el, e);
    const leaveHandler = (e: Event) => handleHoverLeave(el, e);
    
    hoverEnterHandlers.set(el, enterHandler);
    hoverLeaveHandlers.set(el, leaveHandler);
    
    modalContent.addEventListener('mouseenter', enterHandler);
    modalContent.addEventListener('mouseleave', leaveHandler);
  }
}

// Core Render Function

function render(el: TyModal): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;
  
  const attributes = getModalAttributes(el);
  const dialog = ensureInternalDialog(shadowRoot);
  const modalId = getModalId(el);
  
  ensureStyles(shadowRoot, { css: modalStyles, id: 'ty-modal' });
  
  dialog.className = 'ty-modal-dialog';
  
  if (attributes.backdrop) {
    dialog.setAttribute('data-backdrop', 'true');
  } else {
    dialog.removeAttribute('data-backdrop');
  }

  // Accessible name: <dialog> has an implicit role="dialog" for free, but
  // nothing gives it a NAME unless the consumer's own slotted heading
  // happens to get wired up manually. Opt-in `label` attribute (same
  // pattern as ty-select/ty-date-picker's `label` prop) — unset stays
  // exactly as before (no regression, just no fix without opting in).
  const label = el.getAttribute('label');
  if (label) {
    dialog.setAttribute('aria-label', label);
  } else {
    dialog.removeAttribute('aria-label');
  }
  
  setupBackdropClick(el, dialog, attributes.closeOnOutsideClick);
  setupEscapeKey(el, dialog, attributes.closeOnEscape);

  // showModal() gives ESC-to-close for free — the browser fires `cancel` and
  // closes the dialog itself, bypassing our keydown handler entirely. That
  // made close-on-escape="false" a no-op. Always intercept `cancel` and route
  // it through closeModal() so the attribute (and `beforeclose`) is honoured.
  dialog.oncancel = (event: Event) => {
    event.preventDefault();
    if (getModalAttributes(el).closeOnEscape) closeModal(el, 'escape');
  };
  setupCloseButton(el, dialog, attributes.closeOnOutsideClick);
  setupCloseButtonHover(el, dialog);
  
  if (attributes.open) {
    if (!dialog.open) {
      lockScroll(modalId);

      if (attributes.backdrop) {
        dialog.showModal();
      } else {
        dialog.show();
      }

      syncBackdropZoom();
      dispatchModalEvent(el, 'open', {});
    }
  } else {
    if (dialog.open) {
      unlockScroll(modalId);

      dialog.close();
      syncBackdropZoom();

      const reason = pendingCloseReasons.get(el) ?? 'programmatic';
      pendingCloseReasons.delete(el);

      dispatchModalEvent(el, 'close', { reason } as ModalCloseDetail);
    }
  }
  
  // Handle dialog's native close event.
  //
  // Child components (ty-select, ty-date-picker) dispatch a
  // bubbling+composed `close` custom event when their popups close. Those
  // events bubble up to *this* dialog and trigger `onclose` too — without this
  // guard, opening a dropdown inside a modal and closing the dropdown would
  // close the whole modal. The native dialog `close` event is not composed
  // and targets the dialog itself, so we only react when `event.target` is
  // the dialog.
  dialog.onclose = (event: Event) => {
    if (event.target !== dialog) return;

    unlockScroll(modalId);

    if (el.hasAttribute('open')) {
      el.removeAttribute('open');
      dispatchModalEvent(el, 'close', {
        reason: 'native',
        returnValue: dialog.returnValue || undefined
      } as ModalCloseDetail);
    }
    syncBackdropZoom();
  };
}

/**
 * Opt-in Vaul-style page zoom: while any modal with `backdrop-zoom` is open,
 * <html> carries .ty-modal-zoom and tyrell.css scales <body> down slightly.
 * The dialog itself lives in the top layer, which escapes ancestor
 * transforms, so only the page behind it moves. State is derived, not
 * counted — the last zooming modal out clears the class, nested modals keep it.
 */
function syncBackdropZoom(): void {
  // Same string-tolerant boolean parsing as the other modal attrs —
  // backdrop-zoom="false" must count as off, not as present.
  const anyOpen = Array.from(
    document.querySelectorAll('ty-modal[open][backdrop-zoom], ty-dialog[open][backdrop-zoom]'),
  ).some((m) => {
    const v = m.getAttribute('backdrop-zoom')!.toLowerCase().trim();
    return v !== 'false' && v !== '0';
  });
  document.documentElement.classList.toggle('ty-modal-zoom', anyOpen);
}

function cleanup(el: TyModal): void {
  const modalId = modalIds.get(el);
  const shadowRoot = el.shadowRoot;
  const dialog = shadowRoot ? getModalDialog(shadowRoot) : null;
  
  // Force unlock scroll if modal removed while open
  if (modalId) {
    unlockScroll(modalId);
    modalIds.delete(el);
  }
  syncBackdropZoom();
  
  if (!dialog) return;
  
  const backdropHandler = backdropClickHandlers.get(el);
  if (backdropHandler) {
    dialog.removeEventListener('click', backdropHandler);
    backdropClickHandlers.delete(el);
  }
  
  const escapeHandler = escapeKeyHandlers.get(el);
  if (escapeHandler) {
    dialog.removeEventListener('keydown', escapeHandler);
    escapeKeyHandlers.delete(el);
  }
  
  const closeButton = dialog.querySelector<HTMLButtonElement>('.close-button');
  if (closeButton) {
    const closeHandler = closeButtonHandlers.get(el);
    if (closeHandler) {
      closeButton.removeEventListener('click', closeHandler);
      closeButtonHandlers.delete(el);
    }
  }
  
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

// Component Definition

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
  
  static get observedAttributes() {
    return ['open', 'backdrop', 'close-on-outside-click', 'close-on-escape', 'label'];
  }

  // Property mirrors for the boolean attributes. Frameworks that
  // property-bind (React, Vue, CLJS wrappers) hand us real booleans —
  // `closeOnOutsideClick = false` — which never reach attributeChangedCallback.
  // Reflect them to the attribute so one code path (getModalAttributes) rules.
  get open(): boolean { return parseBoolAttr(this, 'open'); }
  set open(v: boolean) { v ? this.setAttribute('open', 'true') : this.removeAttribute('open'); }

  get backdrop(): boolean { return getModalAttributes(this).backdrop; }
  set backdrop(v: boolean) { this.setAttribute('backdrop', String(!!v)); }

  get closeOnOutsideClick(): boolean { return getModalAttributes(this).closeOnOutsideClick; }
  set closeOnOutsideClick(v: boolean) { this.setAttribute('close-on-outside-click', String(!!v)); }

  get closeOnEscape(): boolean { return getModalAttributes(this).closeOnEscape; }
  set closeOnEscape(v: boolean) { this.setAttribute('close-on-escape', String(!!v)); }
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    render(this);
    
    this.show = () => openModal(this);
    this.hide = (opts?: { force?: boolean }) => closeModal(this, 'programmatic', opts);
  }
  
  disconnectedCallback() {
    cleanup(this);
  }
  
  attributeChangedCallback(_name: string, _oldValue: string | null, _newValue: string | null) {
    // React (and any framework that conditionally mounts an already-open
    // modal) sets initial attributes BEFORE inserting the element into the
    // document, and showModal() on a disconnected <dialog> throws
    // InvalidStateError. Defer — connectedCallback render()s on insertion
    // and applies `open` then.
    if (!this.isConnected) return;
    render(this);
  }
}

if (!customElements.get('ty-modal')) {
  customElements.define('ty-modal', TyModal);
}

// Also exposed as ty-dialog — the platform/ARIA name (wraps native <dialog>).
// A constructor can only register once, hence the subclass.
if (!customElements.get('ty-dialog')) {
  customElements.define('ty-dialog', class TyDialog extends TyModal { });
}