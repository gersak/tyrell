/**
 * Popup Component - click-triggered popup positioned against its PARENT element
 * (the anchor). Stays open for interaction; closes on outside click or ESC.
 */

import { findBestPosition, preferenceChain, type Placement } from '../utils/positioning.js';
import { lockScroll, unlockScroll } from '../utils/scroll-lock.js';
import { ensureStyles } from '../utils/styles.js';
import { popupStyles } from '../styles/popup.js';

/**
 * Popup attributes configuration
 */
export interface PopupAttributes {
  manual: boolean;        // Override click trigger
  disableClose: boolean;  // Disable auto-close
  placement: Placement;   // Position preference
  offset: number;         // Spacing from anchor
}

// WeakMaps for state management
const anchorClickHandlers = new WeakMap<TyPopup, (e: Event) => void>();
const anchorKeyClickHandlers = new WeakMap<TyPopup, (e: Event) => void>();
const outsideClickHandlers = new WeakMap<TyPopup, (e: Event) => void>();
/** Pending close-out (exit transition) per popup, so a reopen can cancel it. */
const closeTimers = new WeakMap<TyPopup, ReturnType<typeof setTimeout>>();
const escapeHandlers = new WeakMap<TyPopup, (e: KeyboardEvent) => void>();
const closeRequestHandlers = new WeakMap<TyPopup, (e: CustomEvent) => void>();
const popupIds = new WeakMap<TyPopup, string>(); // Store popup ID for scroll locking
/** The anchor the listeners went on: once the popup is removed on its own,
 *  parentElement no longer finds it. */
const anchors = new WeakMap<TyPopup, HTMLElement>();
/** Escape guard of an open disable-close popup (see guardEscape). */
const escapeGuards = new WeakMap<TyPopup, (e: KeyboardEvent) => void>();
/** Opened by a pointer press whose click hasn't come yet. */
const pointerPresses = new WeakSet<TyPopup>();

function parseBoolAttr(el: Element, name: string): boolean {
  return el.hasAttribute(name);
}

function parseIntAttr(el: Element, name: string, defaultValue: number): number {
  const value = el.getAttribute(name);
  if (value === null) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getPopupAttributes(el: TyPopup): PopupAttributes {
  return {
    manual: parseBoolAttr(el, 'manual'),
    disableClose: parseBoolAttr(el, 'disable-close'),
    placement: (el.getAttribute('placement') || 'bottom') as Placement,
    offset: parseIntAttr(el, 'offset', 8),
  };
}

/**
 * Get the parent element as anchor (like tooltip)
 */
function getAnchorElement(el: TyPopup): HTMLElement | null {
  return el.parentElement;
}

function getPopupDialog(shadowRoot: ShadowRoot): HTMLDialogElement | null {
  return shadowRoot.querySelector<HTMLDialogElement>('.popup-dialog');
}

/**
 * Get or create a unique popup ID for scroll locking
 */
function getPopupId(el: TyPopup): string {
  let id = popupIds.get(el);
  if (!id) {
    id = `popup-${el.id || Math.random().toString(36).substr(2, 9)}`;
    popupIds.set(el, id);
  }
  return id;
}

function updatePosition(el: TyPopup): void {
  const { placement, offset } = getPopupAttributes(el);
  const shadowRoot = el.shadowRoot;
  const anchor = getAnchorElement(el);
  const dialog = shadowRoot ? getPopupDialog(shadowRoot) : null;

  if (!anchor || !dialog) return;

  // Handles all 12 placements. The old hand-written chain only matched the four
  // bare sides, so 'bottom-start' & co. fell through to the default and the
  // requested alignment was silently dropped.
  const preferences: Placement[] = preferenceChain(placement);

  const positionData = findBestPosition({
    targetEl: anchor,
    floatingEl: dialog,
    preferences,
    offset,
    padding: 8,
    containerPadding: 16,
  });

  el.style.setProperty('--popup-x', `${positionData.x}px`);
  el.style.setProperty('--popup-y', `${positionData.y}px`);

  // Resolved side (post-flip) drives the directional entrance slide in CSS
  dialog.dataset.side = positionData.placement.split('-')[0];

  // Add position class like dropdown does (this applies the variables)
  dialog.classList.add('position-calculated');
}

/**
 * Close popup with clean animation -> position reset -> hide sequence
 */
function closePopup(el: TyPopup, force = false): void {
  const { disableClose } = getPopupAttributes(el);
  if (!force && disableClose) return;

  const shadowRoot = el.shadowRoot;
  const dialog = shadowRoot ? getPopupDialog(shadowRoot) : null;
  if (!dialog) return;

  // Don't unlock scroll here: the dialog's `open` watcher (render) does,
  // once it is closed

  dialog.classList.remove('open');
  dialog.classList.remove('preparing-animation');

  const anchor = getAnchorElement(el);
  if (anchor?.hasAttribute('aria-haspopup')) anchor.setAttribute('aria-expanded', 'false');

  // Wait out the exit transition: the longest of the dialog's transition
  // durations, so a custom --ty-popup-duration isn't cut short.
  const exitMs = Math.max(0, ...getComputedStyle(dialog).transitionDuration
    .split(',').map((d) => parseFloat(d) * (d.trim().endsWith('ms') ? 1 : 1000)));
  clearTimeout(closeTimers.get(el));
  closeTimers.set(el, setTimeout(() => {
    closeTimers.delete(el);
    dialog.classList.remove('position-calculated');
    dialog.close(); // the `open` watcher unlocks; the 'close' listener emits 'close'
  }, exitMs + 20));
}

/**
 * Open popup with dialog open but hidden → position → animate sequence
 */
function openPopup(el: TyPopup): void {
  const shadowRoot = el.shadowRoot;
  const dialog = shadowRoot ? getPopupDialog(shadowRoot) : null;
  // Out of the document showModal() throws, after the scroll lock below
  if (!dialog || !el.isConnected) return;

  // Already open (or opening): one popup, one 'open' event. Called while it
  // is closing out, cancel the close and show it again.
  const anchor = getAnchorElement(el);
  if (dialog.open) {
    const pending = closeTimers.get(el);
    if (pending !== undefined) {
      clearTimeout(pending);
      closeTimers.delete(el);
      dialog.classList.add('open');
      if (anchor?.hasAttribute('aria-haspopup')) anchor.setAttribute('aria-expanded', 'true');
    }
    return;
  }

  // Lock scroll using the stored popup ID
  const popupId = getPopupId(el);
  lockScroll(popupId);

  // Step 1: showModal() immediately - dialog gets [open] attribute and proper layout
  dialog.showModal();
  guardEscape(el);

  if (anchor?.hasAttribute('aria-haspopup')) anchor.setAttribute('aria-expanded', 'true');

  // Step 2: Wait for layout to settle, then measure and position
  requestAnimationFrame(() => {
    // Now dialog has [open] and accurate dimensions
    // Calculate and apply position while dialog is hidden by CSS
    updatePosition(el);

    // Step 3: Add scale transform for animation prep
    dialog.classList.add('preparing-animation');
    // Commit the prep pose before .open so the entrance starts from it.
    // (A call: the CDN build's terser drops a bare property read.)
    dialog.getBoundingClientRect();

    // Step 4: Third RAF - THEN add open class for smooth scale animation
    requestAnimationFrame(() => {
      // Now animate: scale(0.95) → scale(1) + opacity + visibility
      dialog.classList.add('open');

      // showModal() looked for something to focus while the content was
      // still hidden for positioning, found nothing and left focus on the
      // page: a screen reader stayed outside the popup. Move focus in now
      // it shows: the [autofocus] control, else the dialog itself.
      if (!el.matches(':focus-within')) {
        const target = el.querySelector<HTMLElement>('[autofocus]');
        target?.focus({ preventScroll: true });
        if (!el.matches(':focus-within')) {
          dialog.focus({ preventScroll: true });
          // A control that inherits the visibility change through a
          // transition of its own (ty-input's) is still hidden in this
          // frame: try it again once that transition is under way.
          if (target) {
            requestAnimationFrame(() => requestAnimationFrame(() => {
              if (dialog.open && shadowRoot!.activeElement === dialog) target.focus({ preventScroll: true });
            }));
          }
        }
      }

      el.dispatchEvent(new CustomEvent('open'));
    });
  });
}

function togglePopup(el: TyPopup): void {
  const shadowRoot = el.shadowRoot;
  const dialog = shadowRoot ? getPopupDialog(shadowRoot) : null;
  if (!dialog) return;

  if (dialog.classList.contains('open')) {
    closePopup(el);
  } else {
    openPopup(el);
  }
}

function handleAnchorClick(el: TyPopup, event: Event): void {
  event.preventDefault();
  event.stopPropagation();
  togglePopup(el);
}

function handleOutsideClick(el: TyPopup, event: Event): void {
  event.stopPropagation();
  const shadowRoot = el.shadowRoot;
  const dialog = shadowRoot ? getPopupDialog(shadowRoot) : null;

  // Close if clicking on dialog backdrop (not popup content)
  if (dialog && event.target === dialog) {
    event.preventDefault();
    closePopup(el);
  }
}

/**
 * The key comes from inside a modal dialog nested in the popup that is still
 * open (a date-picker calendar, a ty-select list, a ty-modal). That one is on
 * top, so the key is its own: leave it alone, propagation included, since
 * those components listen on document. Same rule as ty-modal's.
 */
function fromNestedDialog(el: TyPopup, event: Event): boolean {
  const dialog = el.shadowRoot ? getPopupDialog(el.shadowRoot) : null;
  for (const node of event.composedPath()) {
    if (node === dialog) return false;
    if (node instanceof HTMLDialogElement && node.matches(':modal')) return true;
  }
  return false;
}

/**
 * disable-close: no Escape closes it. With focus outside the popup (none of
 * its content took it, or a focused button got disabled) Escape is the
 * browser's close request, and after a couple of them the browser stops
 * letting `cancel` be prevented. A canceled keydown makes no close request
 * at all, so catch it at the document first. Not for a modal dialog on top
 * of this one: that Escape is its own. On while the popup is open, so a
 * disable-close set meanwhile counts too.
 */
function guardEscape(el: TyPopup): void {
  if (escapeGuards.has(el)) return;
  const guard = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && getPopupAttributes(el).disableClose && !fromNestedDialog(el, e)) e.preventDefault();
  };
  escapeGuards.set(el, guard);
  document.addEventListener('keydown', guard, true);
}

function unguardEscape(el: TyPopup): void {
  const guard = escapeGuards.get(el);
  if (!guard) return;
  document.removeEventListener('keydown', guard, true);
  escapeGuards.delete(el);
}

function handleEscape(el: TyPopup, event: KeyboardEvent): void {
  if (fromNestedDialog(el, event)) return;
  event.stopPropagation();
  if (event.key === 'Escape') {
    const { disableClose } = getPopupAttributes(el);
    if (disableClose) {
      event.preventDefault();
    } else {
      closePopup(el);
    }
  }
}

/**
 * Handle close requests from inside popup content
 */
function handleCloseRequest(el: TyPopup, event: CustomEvent): void {
  event.stopPropagation();
  closePopup(el, true);
}

/**
 * Setup click listener on anchor element (unless manual=true)
 */
function setupAnchorEvents(el: TyPopup): void {
  const { manual } = getPopupAttributes(el);
  const anchor = getAnchorElement(el);

  if (!anchor || manual) return;

  // Screen reader gets no other signal that clicking this opens something —
  // the popup itself is a real <dialog> (showModal()), which already gives
  // it role="dialog" + focus-trap for free, so only the trigger needs this.
  anchor.setAttribute('aria-haspopup', 'dialog');
  if (!anchor.hasAttribute('aria-expanded')) anchor.setAttribute('aria-expanded', 'false');

  // Remove any existing listeners first
  const previous = anchors.get(el) ?? anchor;
  const existingHandler = anchorClickHandlers.get(el);
  if (existingHandler) {
    previous.removeEventListener('pointerdown', existingHandler);
  }
  const existingKeyHandler = anchorKeyClickHandlers.get(el);
  if (existingKeyHandler) {
    previous.removeEventListener('click', existingKeyHandler);
  }
  anchors.set(el, anchor);

  const handler = (e: Event) => {
    pointerPresses.add(el);
    handleAnchorClick(el, e);
  };
  anchorClickHandlers.set(el, handler);
  anchor.addEventListener('pointerdown', handler);

  // pointerdown covers mouse/touch; keyboard activation (Enter/Space on a
  // focused anchor) and anchor.click() fire only 'click', with detail === 0
  // — without this, a keyboard-only user could focus the anchor but had no
  // way to open the popup (same gap fixed in ty-tabs). A ty-button anchor
  // emits a CustomEvent click instead, the native one in detail.originalEvent
  // (a <label> around it gets there too).
  const keyHandler = (e: Event) => {
    // The click that ends a pointer press: it already toggled on pointerdown.
    // Detail alone can't tell: a ty-button re-presses its inner button, with
    // detail 0, for a press on its padding or border.
    if (pointerPresses.delete(el)) return;
    const d = (e as CustomEvent).detail;
    const click: Event = typeof d === 'number' ? e : d?.originalEvent ?? e;
    if ((click as MouseEvent).detail !== 0) return;
    // A key press on a control in the popup content bubbles up to the anchor
    // too. Not a press on the anchor: a mouse press there doesn't toggle either.
    if (click.composedPath().includes(el)) return;
    handleAnchorClick(el, e);
  };
  anchorKeyClickHandlers.set(el, keyHandler);
  anchor.addEventListener('click', keyHandler);
}

function cleanupAnchorEvents(el: TyPopup): void {
  const anchor = anchors.get(el);
  anchors.delete(el);
  const handler = anchorClickHandlers.get(el);

  if (anchor && handler) {
    anchor.removeEventListener('pointerdown', handler);
    anchorClickHandlers.delete(el);
  }
  const keyHandler = anchorKeyClickHandlers.get(el);
  if (anchor && keyHandler) {
    anchor.removeEventListener('click', keyHandler);
    anchorKeyClickHandlers.delete(el);
  }
  anchor?.removeAttribute('aria-haspopup');
  anchor?.removeAttribute('aria-expanded');
}

function render(el: TyPopup): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  const existingDialog = getPopupDialog(shadowRoot);

  ensureStyles(shadowRoot, { css: popupStyles, id: 'ty-popup' });

  if (!existingDialog) {
    const dialog = document.createElement('dialog');
    const container = document.createElement('div');
    const content = document.createElement('slot');

    dialog.className = 'popup-dialog';
    // Focusable itself, for content without a control to focus (openPopup)
    dialog.tabIndex = -1;
    container.className = 'popup-container';
    content.id = 'popup-content';

    shadowRoot.appendChild(dialog);
    dialog.appendChild(container);
    container.appendChild(content);

    el.style.setProperty('--popup-x', '0px');
    el.style.setProperty('--popup-y', '0px');

    const outsideHandler = (e: Event) => handleOutsideClick(el, e);
    outsideClickHandlers.set(el, outsideHandler);
    dialog.addEventListener('pointerdown', outsideHandler);

    const escapeHandler = (e: KeyboardEvent) => handleEscape(el, e);
    escapeHandlers.set(el, escapeHandler);
    el.addEventListener('keydown', escapeHandler);

    // Enter or Space on the dialog itself (focused on open) would bubble on
    // to an anchor <button> around the popup, whose default action clicks
    // it: a submit, or the popup closing. They mean nothing to the dialog.
    const inertKeys = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.composedPath()[0] === dialog) e.preventDefault();
    };
    for (const type of ['keydown', 'keypress', 'keyup'] as const) dialog.addEventListener(type, inertKeys);

    // The browser's own close request (Escape with focus outside the
    // popup, the Android back gesture) skips the keydown handler above.
    // Left to it, the dialog closes; the observer below tidies up.
    dialog.addEventListener('cancel', (e) => {
      if (getPopupAttributes(el).disableClose) e.preventDefault();
    });

    // Closed, by us or not (Escape: the browser's cancel; a ty-modal around
    // it closing): tidy up as the `open` attribute goes. The `close` event
    // comes a task later: the page would stay locked that long, and a popup
    // reopened meanwhile would lose its new lock to it.
    new MutationObserver(() => {
      if (dialog.open) return;
      // Closed before the close-out timer ran (Escape). Left pending, the
      // timer would shut it again right after a reopen.
      clearTimeout(closeTimers.get(el));
      closeTimers.delete(el);
      // A press whose click never came (a touch that turned into a pan)
      pointerPresses.delete(el);
      unguardEscape(el);
      unlockScroll(getPopupId(el));
      dialog.classList.remove('open');
      dialog.classList.remove('preparing-animation');
      const anchor = getAnchorElement(el);
      if (anchor?.hasAttribute('aria-haspopup')) anchor.setAttribute('aria-expanded', 'false');
    }).observe(dialog, { attributes: true, attributeFilter: ['open'] });

    dialog.addEventListener('close', () => {
      // ponytail: non-bubbling, like native <dialog> — bubbling close from
      // a popup inside a ty-modal would trip the modal's own close listener.
      el.dispatchEvent(new CustomEvent('close'));
    });
  }

  el.closePopup = () => closePopup(el, true);
  el.openPopup = () => openPopup(el);
  el.togglePopup = () => togglePopup(el);

  // render() runs again on every attribute change: one listener, not one each
  const existingCloseRequest = closeRequestHandlers.get(el);
  if (existingCloseRequest) el.removeEventListener('ty:close-popup', existingCloseRequest as EventListener);
  const closeRequestHandler = (e: CustomEvent) => handleCloseRequest(el, e);
  closeRequestHandlers.set(el, closeRequestHandler);
  el.addEventListener('ty:close-popup', closeRequestHandler as EventListener);

  setupAnchorEvents(el);
}

function cleanup(el: TyPopup): void {
  // Force unlock scroll if popup is being removed
  const popupId = popupIds.get(el);
  if (popupId) {
    unlockScroll(popupId);
    popupIds.delete(el);
  }

  cleanupAnchorEvents(el);

  const shadowRoot = el.shadowRoot;
  const dialog = shadowRoot ? getPopupDialog(shadowRoot) : null;

  if (dialog) {
    const outsideHandler = outsideClickHandlers.get(el);
    if (outsideHandler) {
      dialog.removeEventListener('pointerdown', outsideHandler);
      outsideClickHandlers.delete(el);
    }
    // Removed while open (with a ty-modal around it, or moved): out of the
    // document it leaves the top layer but stays open. Close it; the `open`
    // observer tidies up.
    if (dialog.open) dialog.close();
  }

  const escapeHandler = escapeHandlers.get(el);
  if (escapeHandler) {
    el.removeEventListener('keydown', escapeHandler);
    escapeHandlers.delete(el);
  }
  unguardEscape(el);

  const closeRequestHandler = closeRequestHandlers.get(el);
  if (closeRequestHandler) {
    el.removeEventListener('ty:close-popup', closeRequestHandler as EventListener);
    closeRequestHandlers.delete(el);
  }
}

/**
 * TyPopup Web Component
 */
export class TyPopup extends HTMLElement {
  /** Programmatic API methods */
  closePopup?: () => void;
  openPopup?: () => void;
  togglePopup?: () => void;

  static get observedAttributes() {
    return ['manual', 'disable-close', 'placement', 'offset'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    render(this);
  }

  disconnectedCallback() {
    cleanup(this);
  }

  attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null) {
    render(this);

    switch (name) {
      case 'placement':
      case 'offset':
        // Update position immediately if open and placement-related attributes change
        render(this);
        break;

      case 'manual':
      case 'disable-close':
        // Recreate anchor events if manual changes
        cleanupAnchorEvents(this);
        setupAnchorEvents(this);
        break;
    }
  }
}

if (!customElements.get('ty-popup')) {
  customElements.define('ty-popup', TyPopup);
}
