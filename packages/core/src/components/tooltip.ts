/**
 * Tooltip Component
 * 
 * Shows helpful content on hover/focus with smart positioning.
 * Follows the same shadow DOM pattern as other components.
 * 
 * @example
 * <ty-tooltip placement="top" flavor="primary" delay="600">
 *   Helpful tooltip text
 * </ty-tooltip>
 */

import { findBestPosition, placementPreferences, type Placement, type CleanupFn } from '../utils/positioning.js';
import { ensureStyles } from '../utils/styles.js';
import { tooltipStyles } from '../styles/tooltip.js';
import type { Flavor } from '../types/common.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Tooltip flavors: dark (default) / light / info plus any Flavor —
 * built-in semantic colors or a custom flavor backed by --ty-*-X tokens.
 */
export type TooltipFlavor = 'dark' | 'light' | 'info' | Flavor;

/**
 * Tooltip attributes configuration
 */
export interface TooltipAttributes {
  placement: Placement;
  offset: number;
  delay: number;
  disabled: boolean;
  flavor: TooltipFlavor;
}

/**
 * Timeout state for show/hide delays
 */
interface TimeoutState {
  showTimeout: number | null;
  hideTimeout: number | null;
}

// ============================================================================
// WeakMaps for State Management
// ============================================================================

const autoUpdateCleanup = new WeakMap<TyTooltip, CleanupFn>();
const eventCleanup = new WeakMap<TyTooltip, CleanupFn>();
const timeoutState = new WeakMap<TyTooltip, TimeoutState>();
const popoverElements = new WeakMap<TyTooltip, HTMLElement>();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalize the flavor attribute. Any plain identifier (with optional +/-
 * shade suffix) is accepted — built-ins and custom flavors alike get their
 * colors from tokens in applyFlavorStyles(). Anything else (including
 * would-be CSS injection through the attribute) falls back to 'dark'.
 */
function validateFlavor(flavor: string | null): TooltipFlavor {
  const full = flavor || 'dark';
  const base = full.replace(/[+-]$/, '');
  return /^[A-Za-z][A-Za-z0-9_-]*$/.test(base) ? (full as TooltipFlavor) : 'dark';
}

/**
 * Get timeout state for element
 */
function getTimeoutState(el: TyTooltip): TimeoutState {
  let state = timeoutState.get(el);
  if (!state) {
    state = { showTimeout: null, hideTimeout: null };
    timeoutState.set(el, state);
  }
  return state;
}

/**
 * Parse boolean attribute
 */
function parseBoolAttr(el: Element, name: string): boolean {
  return el.hasAttribute(name);
}

/**
 * Parse integer attribute
 */
function parseIntAttr(el: Element, name: string, defaultValue: number): number {
  const value = el.getAttribute(name);
  if (value === null) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Read all tooltip attributes from element
 */
function getTooltipAttributes(el: TyTooltip): TooltipAttributes {
  return {
    placement: (el.getAttribute('placement') || 'top') as Placement,
    offset: parseIntAttr(el, 'offset', 8),
    delay: parseIntAttr(el, 'delay', 600),
    disabled: parseBoolAttr(el, 'disabled'),
    flavor: validateFlavor(el.getAttribute('flavor')),
  };
}

/**
 * Get the parent element (anchor)
 */
function getAnchorElement(el: TyTooltip): HTMLElement | null {
  return el.parentElement;
}

/**
 * Get or create popover element using Popover API
 * The popover is created in document.body for top-layer placement
 */
function getOrCreatePopover(el: TyTooltip): HTMLElement {
  let popover = popoverElements.get(el);

  if (!popover) {
    // Create popover element
    popover = document.createElement('div');
    popover.id = `ty-tooltip-${Math.random().toString(36).substr(2, 9)}`;
    popover.setAttribute('popover', 'manual');
    popover.className = 'ty-tooltip-popover';

    // Get initial attributes
    const { flavor } = getTooltipAttributes(el);
    popover.setAttribute('data-flavor', flavor);

    // Copy content from slot
    const content = el.textContent || '';
    popover.textContent = content;

    // Apply inline styles (since popover is outside shadow DOM, we need inline styles)
    const styles = `
      position: fixed;
      margin: 0;
      padding: 8px 12px;
      background: var(--ty-tooltip-bg, #1f2937);
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: var(--ty-font-sm, 14px);
      font-weight: var(--ty-font-semibold, 600);
      line-height: 1.5;
      max-width: 250px;
      text-align: center;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      user-select: none;
      pointer-events: none;
    `;

    popover.style.cssText = styles;

    // Apply flavor-specific styles
    applyFlavorStyles(popover, flavor);

    // Append to body
    document.body.appendChild(popover);

    // Store reference
    popoverElements.set(el, popover);
  }

  return popover;
}

/**
 * Apply flavor-specific styles to popover.
 *
 * dark / light / info are hand-written extras; every other flavor —
 * built-in semantic or custom — is one token formula, with neutral
 * fallbacks so a custom flavor with missing tokens degrades gracefully.
 * flavor has passed validateFlavor's identifier guard, so interpolating
 * it into var() names is safe.
 */
function applyFlavorStyles(popover: HTMLElement, flavor: TooltipFlavor): void {
  // Reset to defaults first
  popover.style.removeProperty('background');
  popover.style.removeProperty('color');
  popover.style.removeProperty('border-color');

  switch (flavor) {
    case 'dark':
      // Default look — routed through the documented --ty-tooltip-* escape
      // hatch so consumers can retheme without a flavor.
      popover.style.background = 'var(--ty-tooltip-bg, var(--ty-bg-neutral-soft, #4b5563))';
      popover.style.color = 'var(--ty-tooltip-color, var(--ty-color-neutral-strong, #f3f4f6))';
      popover.style.borderColor = 'var(--ty-border-strong, #6b7280)';
      break;
    case 'light':
      popover.style.background = 'var(--ty-surface-elevated, #ffffff)';
      popover.style.color = 'var(--ty-text-strong, #111827)';
      popover.style.borderColor = 'var(--ty-border, #e5e7eb)';
      break;
    case 'info':
      popover.style.background = 'var(--ty-bg-info, #06b6d4)';
      popover.style.color = 'var(--ty-text-strong, #f0f9ff)';
      popover.style.borderColor = 'var(--ty-border-info, #22d3ee)';
      break;
    default: {
      const base = flavor.replace(/[+-]$/, '');
      const shade = flavor.slice(base.length);
      const bgSfx = shade === '+' ? '-bold' : shade === '-' ? '-soft' : '';
      popover.style.background = `var(--ty-bg-${base}${bgSfx}, var(--ty-bg-neutral))`;
      popover.style.color = `var(--ty-color-${base}-strong, var(--ty-color-neutral-strong))`;
      popover.style.borderColor = `var(--ty-border-${base}, var(--ty-color-${base}))`;
      break;
    }
  }
}

/**
 * Update tooltip position based on current anchor/popover state
 */
function updatePosition(el: TyTooltip): void {
  const { placement, offset } = getTooltipAttributes(el);
  const anchor = getAnchorElement(el);
  const popover = popoverElements.get(el);

  if (!anchor || !popover) {
    console.warn('[ty-tooltip] updatePosition: missing anchor or popover');
    return;
  }

  // Calculate preferences based on placement
  const preferences = placement === 'top' ? placementPreferences.tooltip :
    placement === 'bottom' ? ['bottom', 'top', 'left', 'right'] as Placement[] :
      placement === 'left' ? ['left', 'right', 'top', 'bottom'] as Placement[] :
        placement === 'right' ? ['right', 'left', 'top', 'bottom'] as Placement[] :
          placementPreferences.tooltip;

  // Use positioning engine to find best position
  const position = findBestPosition({
    targetEl: anchor,
    floatingEl: popover,
    preferences,
    offset,
  });

  // Apply position directly to popover
  popover.style.left = `${position.x}px`;
  popover.style.top = `${position.y}px`;
}

/**
 * Cleanup auto-update system
 */
function cleanupAutoUpdate(el: TyTooltip): void {
  const cleanup = autoUpdateCleanup.get(el);
  if (cleanup) {
    cleanup();
    autoUpdateCleanup.delete(el);
  }
}

/**
 * Setup auto-update system for position tracking
 * Note: This does NOT calculate initial position - call updatePosition() separately
 */
function setupAutoUpdate(el: TyTooltip): void {
  const anchor = getAnchorElement(el);
  const popover = popoverElements.get(el);

  if (!anchor || !popover) {
    console.warn('[ty-tooltip] setupAutoUpdate: missing anchor or popover');
    return;
  }

  // Debounced update function
  let timeoutId: number | null = null;
  const debouncedUpdate = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      updatePosition(el);
    }, 10);
  };

  // Setup ResizeObserver for anchor and popover
  const resizeObserver = new ResizeObserver(debouncedUpdate);
  resizeObserver.observe(anchor);
  resizeObserver.observe(popover);

  // Scroll handler with requestAnimationFrame
  let scrollRafId: number | null = null;
  const handleScroll = () => {
    if (scrollRafId === null) {
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;
        updatePosition(el);
      });
    }
  };

  // Listen for scroll and resize
  window.addEventListener('scroll', handleScroll, true);
  window.addEventListener('resize', debouncedUpdate);

  // Store cleanup function
  const cleanup = () => {
    resizeObserver.disconnect();
    window.removeEventListener('scroll', handleScroll, true);
    window.removeEventListener('resize', debouncedUpdate);
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    if (scrollRafId !== null) {
      cancelAnimationFrame(scrollRafId);
    }
  };

  autoUpdateCleanup.set(el, cleanup);
}

/**
 * Clear all timeouts
 */
function clearTimeouts(el: TyTooltip): void {
  const state = getTimeoutState(el);
  if (state.showTimeout !== null) {
    clearTimeout(state.showTimeout);
    state.showTimeout = null;
  }
  if (state.hideTimeout !== null) {
    clearTimeout(state.hideTimeout);
    state.hideTimeout = null;
  }
}

/**
 * Show tooltip immediately using Popover API
 */
function showTooltip(el: TyTooltip): void {
  const { disabled } = getTooltipAttributes(el);
  if (disabled) return;

  // Create popover if it doesn't exist
  const popover = getOrCreatePopover(el);

  try {
    // Show using Popover API
    popover.showPopover();
    el._open = true;

    // Position and setup observers
    updatePosition(el);
    setupAutoUpdate(el);
  } catch (e) {
    console.warn('[ty-tooltip] Failed to show popover', e);
  }
}

/**
 * Hide tooltip immediately using Popover API
 */
function hideTooltip(el: TyTooltip): void {
  const popover = popoverElements.get(el);
  if (!popover) return;

  try {
    popover.hidePopover();
    el._open = false;
    cleanupAutoUpdate(el);
  } catch (e) {
    // Already hidden, ignore
  }
}

/**
 * Schedule tooltip to show after delay
 */
function scheduleShow(el: TyTooltip): void {
  const state = getTimeoutState(el);
  const { delay } = getTooltipAttributes(el);

  clearTimeouts(el);
  state.showTimeout = window.setTimeout(() => showTooltip(el), delay);
}

/**
 * Schedule tooltip to hide after delay
 */
function scheduleHide(el: TyTooltip): void {
  const state = getTimeoutState(el);

  clearTimeouts(el);
  state.hideTimeout = window.setTimeout(() => hideTooltip(el), 200);
}

/**
 * Setup event listeners on anchor element
 */
function setupEvents(el: TyTooltip): void {
  const anchor = getAnchorElement(el);
  if (!anchor) return;

  const handleEnter = () => scheduleShow(el);
  const handleLeave = () => scheduleHide(el);
  const handleFocus = () => scheduleShow(el);
  const handleBlur = () => scheduleHide(el);

  // Add event listeners
  anchor.addEventListener('mouseenter', handleEnter);
  anchor.addEventListener('mouseleave', handleLeave);
  anchor.addEventListener('focusin', handleFocus);
  anchor.addEventListener('focusout', handleBlur);

  // Store cleanup function
  eventCleanup.set(el, () => {
    anchor.removeEventListener('mouseenter', handleEnter);
    anchor.removeEventListener('mouseleave', handleLeave);
    anchor.removeEventListener('focusin', handleFocus);
    anchor.removeEventListener('focusout', handleBlur);
  });
}

/**
 * Cleanup all resources including popover element
 */
function cleanup(el: TyTooltip): void {
  clearTimeouts(el);
  cleanupAutoUpdate(el);

  const cleanup = eventCleanup.get(el);
  if (cleanup) {
    cleanup();
    eventCleanup.delete(el);
  }

  // Remove popover from body
  const popover = popoverElements.get(el);
  if (popover) {
    popover.remove();
    popoverElements.delete(el);
  }

  timeoutState.delete(el);
}

// ============================================================================
// Component Definition
// ============================================================================

/**
 * TyTooltip Web Component
 */
export class TyTooltip extends HTMLElement {
  /** Internal open state */
  _open = false;

  /** Observed attributes */
  static get observedAttributes() {
    return ['placement', 'offset', 'delay', 'disabled', 'flavor'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Initialize open state
    this._open = false;

    // Inject styles (for :host display: contents)
    ensureStyles(this.shadowRoot!, tooltipStyles);

    // Setup events on anchor
    setupEvents(this);
  }

  disconnectedCallback() {
    cleanup(this);
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    // Restyle the popover on flavor change even while hidden — it's cached
    // in popoverElements once created, so a change made while closed would
    // otherwise be silently lost until the element is torn down.
    if (name === 'flavor') {
      const popover = popoverElements.get(this);
      if (popover) {
        const flavor = validateFlavor(newValue);
        applyFlavorStyles(popover, flavor);
      }
    }

    // Close tooltip if disabled
    if (name === 'disabled' && newValue !== null) {
      hideTooltip(this);
    }
  }
}

// Register the custom element
if (!customElements.get('ty-tooltip')) {
  customElements.define('ty-tooltip', TyTooltip);
}
