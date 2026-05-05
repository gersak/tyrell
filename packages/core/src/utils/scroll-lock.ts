/**
 * CSS-based scroll prevention using position: fixed.
 * 
 * Prevents body/page scrolling by temporarily fixing the body position
 * while preserving scroll position. Much more reliable than event prevention.
 * 
 * Key benefits:
 * - No event manipulation complexity
 * - No interference with component keyboard navigation
 * - Preserves scroll position perfectly
 * - Standard industry technique
 * - Multiple component support with proper cleanup
 */

// ============================================================================
// Types
// ============================================================================

interface LockState {
  locked: boolean;
  scrollY: number;
  activeLocks: Set<string>;
}

// ============================================================================
// Global State Management
// ============================================================================

const lockState: LockState = {
  locked: false,
  scrollY: 0,
  activeLocks: new Set<string>(),
};

// Debug flag (exposed globally for testing)
declare global {
  interface Window {
    tyScrollDebug?: boolean;
  }
}

// ============================================================================
// DOM Helper Functions
// ============================================================================

/**
 * Get the document body element
 */
function getBodyEl(): HTMLElement {
  return document.body;
}

/**
 * Get the document element (html)
 */
function getDocEl(): HTMLElement {
  return document.documentElement;
}

/**
 * Get current vertical scroll position
 */
function getScrollY(): number {
  return window.scrollY || getDocEl().scrollTop || 0;
}

/**
 * Calculate the width of the browser's scrollbar
 */
function getScrollbarWidth(): number {
  // window.innerWidth - documentElement.clientWidth
  return window.innerWidth - getDocEl().clientWidth;
}

// ============================================================================
// Core Lock/Unlock Functions
// ============================================================================

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

  docEl.style.overflow = 'hidden';

  // Compensate for scrollbar disappearing to prevent layout shift
  if (scrollbarWidth > 0) {
    docEl.style.paddingRight = `${scrollbarWidth}px`;
  }

  docEl.classList.add('ty-scroll-locked');
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

  docEl.classList.remove('ty-scroll-locked');
  docEl.style.overflow = '';
  docEl.style.paddingRight = '';

  lockState.locked = false;
}

// ============================================================================
// Public API
// ============================================================================

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

  // Add this component to active locks
  lockState.activeLocks.add(componentId);

  // Lock body if this is the first lock
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

  // Remove this component from active locks
  lockState.activeLocks.delete(componentId);

  // Unlock body if this was the last lock
  if (lockState.activeLocks.size === 0) {
    unlockBodyFixed();
  }
  console.log('Lock status', lockState.activeLocks)
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

// ============================================================================
// Debug API
// ============================================================================

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

// ============================================================================
// State Inspection
// ============================================================================

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
