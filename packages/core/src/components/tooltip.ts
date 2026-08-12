/**
 * Tooltip Component — shows content on hover/focus with smart positioning.
 * The anchor is the tooltip's PARENT element; the popover itself lives in
 * document.body (top layer), not in this element's shadow root.
 */

import { findBestPosition, preferenceChain, type Placement, type CleanupFn } from '../utils/positioning.js';
import { ensureStyles } from '../utils/styles.js';
import { tooltipStyles } from '../styles/tooltip.js';
import type { Flavor } from '../types/common.js';

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

/** Timeout state for show/hide delays. */
interface TimeoutState {
  showTimeout: number | null;
  hideTimeout: number | null;
}

const autoUpdateCleanup = new WeakMap<TyTooltip, CleanupFn>();
const eventCleanup = new WeakMap<TyTooltip, CleanupFn>();
const timeoutState = new WeakMap<TyTooltip, TimeoutState>();
const popoverElements = new WeakMap<TyTooltip, HTMLElement>();
// Cached separately from getAnchorElement()/el.parentElement — by the time
// disconnectedCallback fires the element has already been removed from the
// DOM, so parentElement is null and cleanup() couldn't otherwise find the
// anchor to strip its aria-describedby.
const anchorElements = new WeakMap<TyTooltip, HTMLElement>();

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

function getTimeoutState(el: TyTooltip): TimeoutState {
  let state = timeoutState.get(el);
  if (!state) {
    state = { showTimeout: null, hideTimeout: null };
    timeoutState.set(el, state);
  }
  return state;
}

function parseBoolAttr(el: Element, name: string): boolean {
  return el.hasAttribute(name);
}

function parseIntAttr(el: Element, name: string, defaultValue: number): number {
  const value = el.getAttribute(name);
  if (value === null) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getTooltipAttributes(el: TyTooltip): TooltipAttributes {
  return {
    placement: (el.getAttribute('placement') || 'top') as Placement,
    offset: parseIntAttr(el, 'offset', 8),
    delay: parseIntAttr(el, 'delay', 600),
    disabled: parseBoolAttr(el, 'disabled'),
    flavor: validateFlavor(el.getAttribute('flavor')),
  };
}

/** The anchor is the tooltip's parent element. */
function getAnchorElement(el: TyTooltip): HTMLElement | null {
  return el.parentElement;
}

/**
 * Add `id` to the anchor's aria-describedby without clobbering a value the
 * consumer may already have set for something else (WAI-ARIA APG tooltip
 * pattern: append, don't overwrite).
 */
function addDescribedBy(anchor: HTMLElement, id: string): void {
  const ids = (anchor.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
  if (!ids.includes(id)) {
    ids.push(id);
    anchor.setAttribute('aria-describedby', ids.join(' '));
  }
}

/** Inverse of addDescribedBy — used on teardown. */
function removeDescribedBy(anchor: HTMLElement, id: string): void {
  const ids = (anchor.getAttribute('aria-describedby') || '').split(/\s+/).filter((x) => x && x !== id);
  if (ids.length > 0) {
    anchor.setAttribute('aria-describedby', ids.join(' '));
  } else {
    anchor.removeAttribute('aria-describedby');
  }
}

/**
 * Get or create popover element using Popover API
 * The popover is created in document.body for top-layer placement
 */
function getOrCreatePopover(el: TyTooltip): HTMLElement {
  let popover = popoverElements.get(el);

  if (!popover) {
    popover = document.createElement('div');
    popover.id = `ty-tooltip-${Math.random().toString(36).slice(2, 11)}`;
    popover.setAttribute('popover', 'manual');
    // WAI-ARIA APG tooltip pattern: the popover needs role="tooltip" and
    // the trigger needs aria-describedby pointing at it, or a keyboard/
    // screen-reader user gets no indication the tooltip exists at all —
    // hover-only visibility isn't enough on its own.
    popover.setAttribute('role', 'tooltip');
    popover.className = 'ty-tooltip-popover';

    // Apply inline styles (since popover is outside shadow DOM, we need inline styles)
    const styles = `
      position: fixed;
      margin: 0;
      padding: 8px 12px;
      background: var(--ty-tooltip-bg, #262626);
      color: var(--ty-tooltip-color, #f5f5f5);
      border: none;
      border-radius: 6px;
      font-size: var(--ty-font-xs, 12px);
      font-weight: var(--ty-font-semibold, 600);
      line-height: 1.5;
      max-width: 250px;
      text-align: center;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      user-select: none;
      pointer-events: none;
    `;

    popover.style.cssText = styles;

    document.body.appendChild(popover);
    popoverElements.set(el, popover);

    const anchor = anchorElements.get(el);
    if (anchor) addDescribedBy(anchor, popover.id);
  }

  // Resync on every call (not just creation) — content and flavor can
  // change between shows, and this is eagerly called from connectedCallback
  // (see below) so a keyboard user tabbing straight to the trigger gets a
  // real aria-describedby target immediately, not one that only exists
  // after the (default 600ms) hover delay has already elapsed.
  const { flavor } = getTooltipAttributes(el);
  popover.setAttribute('data-flavor', flavor);
  // innerHTML, not textContent — the tooltip's own docs promise "Content is
  // any HTML nested inside the ty-tooltip element"; textContent silently
  // stripped it. Relocating the developer's own authored markup between two
  // elements they control isn't a new trust boundary (same model ty-select
  // already uses to clone rich option HTML into its trigger).
  popover.innerHTML = el.innerHTML;
  applyFlavorStyles(popover, flavor);

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
      // Default look — theme-INDEPENDENT on purpose (matches Material/
      // Bootstrap/Ant/Shoelace: a tooltip stays a fixed dark chip whether
      // the page is light or dark, so it always pops). Routed through the
      // --ty-tooltip-* tokens (defined once in :root, not redeclared in
      // html.dark) so consumers can retheme without a flavor.
      popover.style.background = 'var(--ty-tooltip-bg, #262626)';
      popover.style.color = 'var(--ty-tooltip-color, #f5f5f5)';
      popover.style.borderColor = 'var(--ty-tooltip-border, #404040)';
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

function updatePosition(el: TyTooltip): void {
  const { placement, offset } = getTooltipAttributes(el);
  const anchor = getAnchorElement(el);
  const popover = popoverElements.get(el);

  if (!anchor || !popover) {
    console.warn('[ty-tooltip] updatePosition: missing anchor or popover');
    return;
  }

  // Handles all 12 placements. The old hand-written chain only matched the four
  // bare sides, so 'top-start' & co. fell through to the default and the
  // requested alignment was silently dropped.
  const preferences: Placement[] = preferenceChain(placement);

  const position = findBestPosition({
    targetEl: anchor,
    floatingEl: popover,
    preferences,
    offset,
  });

  popover.style.left = `${position.x}px`;
  popover.style.top = `${position.y}px`;
}

function cleanupAutoUpdate(el: TyTooltip): void {
  const cleanup = autoUpdateCleanup.get(el);
  if (cleanup) {
    cleanup();
    autoUpdateCleanup.delete(el);
  }
}

/**
 * Setup auto-update for position tracking.
 * Note: This does NOT calculate initial position — call updatePosition() separately.
 */
function setupAutoUpdate(el: TyTooltip): void {
  const anchor = getAnchorElement(el);
  const popover = popoverElements.get(el);

  if (!anchor || !popover) {
    console.warn('[ty-tooltip] setupAutoUpdate: missing anchor or popover');
    return;
  }

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

  const resizeObserver = new ResizeObserver(debouncedUpdate);
  resizeObserver.observe(anchor);
  resizeObserver.observe(popover);

  let scrollRafId: number | null = null;
  const handleScroll = () => {
    if (scrollRafId === null) {
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;
        updatePosition(el);
      });
    }
  };

  window.addEventListener('scroll', handleScroll, true);
  window.addEventListener('resize', debouncedUpdate);

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

/** Show immediately (no delay). */
function showTooltip(el: TyTooltip): void {
  const { disabled } = getTooltipAttributes(el);
  if (disabled) return;

  const popover = getOrCreatePopover(el);

  try {
    popover.showPopover();
    el._open = true;

    updatePosition(el);
    setupAutoUpdate(el);
  } catch (e) {
    console.warn('[ty-tooltip] Failed to show popover', e);
  }
}

/** Hide immediately (no delay). */
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

function scheduleShow(el: TyTooltip): void {
  const state = getTimeoutState(el);
  const { delay } = getTooltipAttributes(el);

  clearTimeouts(el);
  state.showTimeout = window.setTimeout(() => showTooltip(el), delay);
}

function scheduleHide(el: TyTooltip): void {
  const state = getTimeoutState(el);

  clearTimeouts(el);
  state.hideTimeout = window.setTimeout(() => hideTooltip(el), 200);
}

function setupEvents(el: TyTooltip): void {
  const anchor = getAnchorElement(el);
  if (!anchor) return;
  anchorElements.set(el, anchor);

  const handleEnter = () => scheduleShow(el);
  const handleLeave = () => scheduleHide(el);
  const handleFocus = () => scheduleShow(el);
  const handleBlur = () => scheduleHide(el);

  anchor.addEventListener('mouseenter', handleEnter);
  anchor.addEventListener('mouseleave', handleLeave);
  anchor.addEventListener('focusin', handleFocus);
  anchor.addEventListener('focusout', handleBlur);

  eventCleanup.set(el, () => {
    anchor.removeEventListener('mouseenter', handleEnter);
    anchor.removeEventListener('mouseleave', handleLeave);
    anchor.removeEventListener('focusin', handleFocus);
    anchor.removeEventListener('focusout', handleBlur);
  });
}

/** Cleanup all resources, including the popover element. */
function cleanup(el: TyTooltip): void {
  clearTimeouts(el);
  cleanupAutoUpdate(el);

  const eventsCleanup = eventCleanup.get(el);
  if (eventsCleanup) {
    eventsCleanup();
    eventCleanup.delete(el);
  }

  // Strip aria-describedby before removing the popover it points at — by
  // this point (disconnectedCallback) el.parentElement is already null, so
  // this must use the cached anchor, not getAnchorElement(el).
  const popover = popoverElements.get(el);
  const anchor = anchorElements.get(el);
  if (popover && anchor) {
    removeDescribedBy(anchor, popover.id);
  }
  if (popover) {
    popover.remove();
    popoverElements.delete(el);
  }

  anchorElements.delete(el);
  timeoutState.delete(el);
}

/**
 * TyTooltip Web Component
 */
export class TyTooltip extends HTMLElement {
  /** Internal open state */
  _open = false;

  static get observedAttributes() {
    return ['placement', 'offset', 'delay', 'disabled', 'flavor'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._open = false;

    // Styles are needed for :host { display: contents }
    ensureStyles(this.shadowRoot!, tooltipStyles);

    setupEvents(this);

    // Eagerly create the (hidden) popover so role="tooltip" + the anchor's
    // aria-describedby exist from connect, not only after the first show —
    // a keyboard user tabbing to the trigger must not wait out the hover
    // delay just to get an accessible description.
    getOrCreatePopover(this);
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

if (!customElements.get('ty-tooltip')) {
  customElements.define('ty-tooltip', TyTooltip);
}
