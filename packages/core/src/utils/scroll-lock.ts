/**
 * Page scroll lock, reference-counted so multiple components can lock at once.
 *
 * Two parts: overflow: hidden on <html> (the document scroller), and a guard
 * for apps that scroll their own container (a full-height layout with an
 * inner overflow: auto div), which <html> overflow doesn't reach. The guard
 * cancels wheel, touchmove and scroll keys that would scroll anything outside
 * the open dialog they come from (every lock holder is a top-layer <dialog>):
 * scrollers inside the dialog keep working until their edge, nothing chains
 * out of it, and events from the page behind scroll nothing. Keys a control
 * uses itself (text fields, selects, Space on buttons, arrows in widgets) are
 * left alone.
 */

interface LockState {
  locked: boolean;
  scrollY: number;
  activeLocks: Set<string>;
}

const lockState: LockState = {
  locked: false,
  scrollY: 0,
  activeLocks: new Set<string>(),
};

let savedStyle = { overflow: '', paddingRight: '' };

// Debug flag (exposed globally for testing)
declare global {
  interface Window {
    tyScrollDebug?: boolean;
  }
}

function getBodyEl(): HTMLElement {
  return document.body;
}

function getDocEl(): HTMLElement {
  return document.documentElement;
}

function getScrollY(): number {
  return window.scrollY || getDocEl().scrollTop || 0;
}

function getScrollbarWidth(): number {
  return window.innerWidth - getDocEl().clientWidth;
}

// Scroll guard

type Axis = 'x' | 'y';

const KEY_SCROLL: Record<string, [Axis, number]> = {
  ArrowDown: ['y', 1], ArrowUp: ['y', -1], PageDown: ['y', 1], PageUp: ['y', -1],
  End: ['y', 1], Home: ['y', -1], ' ': ['y', 1], ArrowRight: ['x', 1], ArrowLeft: ['x', -1],
};

const TEXT_INPUT = /^(?:text|search|email|url|tel|password|number|date|datetime-local|month|week|time|range|color)$/;

/** The key does its own thing on this element: leave it alone. */
function keyBelongsTo(el: Element, key: string): boolean {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  if (el instanceof HTMLElement && el.isContentEditable) return true;
  if (el instanceof HTMLInputElement) {
    if (TEXT_INPUT.test(el.type)) return true;
    if (el.type === 'radio' && key.startsWith('Arrow')) return true;
  }
  if (key === ' ' && el.matches('button, input, summary, a[href], [role]')) return true;
  // Custom widgets (listbox, tabs, slider, grid, menu…) navigate with these
  if (key !== ' ' && el.matches('[role]:not([role=dialog]):not([role=document]):not([role=presentation]):not([role=none])')) return true;
  return false;
}

function canScroll(el: Element, axis: Axis, dir: number): boolean {
  const style = getComputedStyle(el);
  const overflow = axis === 'y' ? style.overflowY : style.overflowX;
  if (!/^(?:auto|scroll|overlay)$/.test(overflow) && !(el instanceof HTMLTextAreaElement)) return false;
  const pos = axis === 'y' ? el.scrollTop : Math.abs(el.scrollLeft);
  const max = axis === 'y' ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
  if (max < 1) return false;
  return dir > 0 ? pos < max - 1 : pos > 0;
}

const HAS_POPOVER = typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;

function isOpenPopover(el: Element): boolean {
  return HAS_POPOVER && el.hasAttribute('popover') && el.matches(':popover-open');
}

/**
 * Would this event scroll something inside its dialog? Walks the composed
 * path (shadow roots and slots included) up to the first open dialog or
 * popover; outside of one, nothing may scroll.
 */
function scrollsInside(event: Event, axis: Axis, dir: number): boolean {
  if (!dir) return true;
  const path = event.composedPath().filter((n): n is Element => n instanceof Element);
  const root = path.findIndex((n) => (n instanceof HTMLDialogElement && n.open) || isOpenPopover(n));
  return root >= 0 && path.slice(0, root + 1).some((n) => canScroll(n, axis, dir));
}

function guardWheel(e: WheelEvent): void {
  if (e.ctrlKey) return; // pinch zoom
  const axis: Axis = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey ? 'x' : 'y';
  const delta = axis === 'y' && !e.shiftKey ? e.deltaY : e.deltaX || e.deltaY;
  if (e.cancelable && !scrollsInside(e, axis, Math.sign(delta))) e.preventDefault();
}

let touchX = 0;
let touchY = 0;

function guardTouchStart(e: TouchEvent): void {
  if (e.touches.length !== 1) return;
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
}

function guardTouchMove(e: TouchEvent): void {
  if (e.touches.length !== 1 || !e.cancelable) return; // pinch zoom
  const { clientX, clientY } = e.touches[0];
  const dx = touchX - clientX;
  const dy = touchY - clientY;
  touchX = clientX;
  touchY = clientY;
  const axis: Axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
  if (!scrollsInside(e, axis, Math.sign(axis === 'y' ? dy : dx))) e.preventDefault();
}

function guardKey(e: KeyboardEvent): void {
  const scroll = KEY_SCROLL[e.key];
  if (!scroll || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  const target = e.composedPath()[0];
  if (target instanceof Element && keyBelongsTo(target, e.key)) return;
  const [axis, dir] = scroll;
  if (!scrollsInside(e, axis, e.key === ' ' && e.shiftKey ? -dir : dir)) e.preventDefault();
}

const WHEEL_OPTS: AddEventListenerOptions = { capture: true, passive: false };

function addGuard(): void {
  window.addEventListener('wheel', guardWheel, WHEEL_OPTS);
  window.addEventListener('touchstart', guardTouchStart, { capture: true, passive: true });
  window.addEventListener('touchmove', guardTouchMove, WHEEL_OPTS);
  window.addEventListener('keydown', guardKey, true);
}

function removeGuard(): void {
  window.removeEventListener('wheel', guardWheel, WHEEL_OPTS);
  window.removeEventListener('touchstart', guardTouchStart, { capture: true });
  window.removeEventListener('touchmove', guardTouchMove, WHEEL_OPTS);
  window.removeEventListener('keydown', guardKey, true);
}

/**
 * Lock body scrolling using overflow: hidden on <html>.
 *
 * Avoids position: fixed on <body> which breaks centered/max-width body layouts
 * by snapping the body to the left edge. Using <html> instead leaves body layout
 * untouched while still preventing scroll.
 */
function lockBodyFixed(): void {
  if (lockState.locked) return;

  const scrollbarWidth = getScrollbarWidth();
  const docEl = getDocEl();

  if (window.tyScrollDebug) {
    console.log('🔒 Locking body scroll:', { scrollbarWidth });
  }

  lockState.scrollY = getScrollY();
  lockState.locked = true;

  savedStyle = { overflow: docEl.style.overflow, paddingRight: docEl.style.paddingRight };
  docEl.style.overflow = 'hidden';

  // Compensate for scrollbar disappearing to prevent layout shift
  if (scrollbarWidth > 0) {
    docEl.style.paddingRight = `${scrollbarWidth}px`;
  }

  docEl.classList.add('ty-scroll-locked');
  addGuard();
}

/**
 * Unlock body scrolling
 */
function unlockBodyFixed(): void {
  if (!lockState.locked) return;

  const docEl = getDocEl();

  if (window.tyScrollDebug) {
    console.log('🔓 Unlocking body scroll');
  }

  removeGuard();
  docEl.classList.remove('ty-scroll-locked');
  // Back to the page's own inline values, not to none
  docEl.style.overflow = savedStyle.overflow;
  docEl.style.paddingRight = savedStyle.paddingRight;

  lockState.locked = false;
}

/**
 * Lock scrolling for a specific component.
 * 
 * Multiple components can lock scrolling simultaneously.
 * Scroll remains locked until ALL components unlock.
 * 
 * @param componentId - Unique identifier for the component
 */
export function lockScroll(componentId: string): void {
  if (lockState.activeLocks.has(componentId)) return;

  lockState.activeLocks.add(componentId);

  if (lockState.activeLocks.size === 1) {
    lockBodyFixed();
  }
}

/**
 * Unlock scrolling for a specific component.
 * 
 * Scroll remains locked if other components still have locks active.
 * 
 * @param componentId - Unique identifier for the component
 */
export function unlockScroll(componentId: string): void {
  if (!lockState.activeLocks.has(componentId)) return;

  lockState.activeLocks.delete(componentId);

  if (lockState.activeLocks.size === 0) {
    unlockBodyFixed();
  }
}

/**
 * Emergency unlock - removes all scroll locks immediately.
 * 
 * Use this for cleanup or error recovery scenarios.
 */
export function forceUnlockAll(): void {
  lockState.activeLocks.clear();
  unlockBodyFixed();
}

/**
 * Enable scroll lock debugging - useful for testing and development
 */
export function enableDebug(): void {
  console.log('🔍 CSS Scroll lock debugging enabled');
  window.tyScrollDebug = true;
}

/**
 * Disable scroll lock debugging
 */
export function disableDebug(): void {
  console.log('🔍 CSS Scroll lock debugging disabled');
  window.tyScrollDebug = false;
}

/**
 * Get the set of currently active component locks.
 * 
 * @returns Set of component IDs that currently have scroll locked
 */
export function getActiveLocks(): Set<string> {
  return new Set(lockState.activeLocks);
}

/**
 * Check if scrolling is currently locked.
 * 
 * @returns true if any component has scroll locked
 */
export function isLocked(): boolean {
  return lockState.locked;
}

/**
 * Check if scrolling is locked by a specific component.
 * 
 * @param componentId - Component identifier to check
 * @returns true if this specific component has scroll locked
 */
export function isLockedBy(componentId: string): boolean {
  return lockState.activeLocks.has(componentId);
}

/**
 * Get the complete lock state for debugging.
 * 
 * @returns Current state including scroll position and active locks
 */
export function getLockState(): Readonly<{
  locked: boolean;
  scrollY: number;
  activeLocks: string[];
}> {
  return {
    locked: lockState.locked,
    scrollY: lockState.scrollY,
    activeLocks: Array.from(lockState.activeLocks),
  };
}
