/**
 * Tabs Component — carousel-based tabs with sliding transitions, an animated
 * active marker, and fixed container dimensions. Expects `ty-tab` children;
 * rich labels come from `slot="label-{tab-id}"` children of `ty-tabs` itself.
 */

import { ensureStyles } from '../utils/styles.js';
import { tabsStyles } from '../styles/tabs.js';

/**
 * Tabs container attributes configuration
 */
export interface TabsAttributes {
  width: string;              // Content area width (accepts px or %)
  height: string;             // Total container height including buttons
  active: string | null;      // ID of currently active tab
  placement: 'top' | 'bottom'; // Position of tab buttons
}

/**
 * Tab change event detail
 */
export interface TabChangeDetail {
  activeId: string;           // ID of newly active tab
  activeIndex: number;        // Index of newly active tab
  previousId: string | null;  // ID of previously active tab (null if first render)
  previousIndex: number | null; // Index of previously active tab
}

/** Marker position for the animated indicator. */
interface MarkerPosition {
  left: number;   // Left offset in pixels
  top: number;    // Top offset in pixels
  width: number;  // Width in pixels
  height: number; // Height in pixels
}

const eventHandlers = new WeakMap<TyTabs, {
  tabClickHandlers: Map<string, (e: Event) => void>;
  tabKeyClickHandlers: Map<string, (e: Event) => void>;
}>();

const resizeObservers = new WeakMap<TyTabs, ResizeObserver>();

function getTabsAttributes(el: TyTabs): TabsAttributes {
  return {
    width: el.getAttribute('width') || '100%',
    height: el.getAttribute('height') || '400px',
    active: el.getAttribute('active'),
    placement: (el.getAttribute('placement') || 'top') as 'top' | 'bottom',
  };
}

function getChildTabs(el: TyTabs): HTMLElement[] {
  return Array.from(el.querySelectorAll('ty-tab'));
}

function getTabId(tab: HTMLElement): string | null {
  return tab.getAttribute('id');
}

/**
 * Check if ty-tabs has a direct child label slot for this tab-id.
 * Looks in ty-tabs' light DOM for slot='label-{tab-id}' elements.
 */
function hasSlotLabel(tabsEl: TyTabs, tabId: string): boolean {
  return tabsEl.querySelector(`[slot='label-${tabId}']`) !== null;
}

/**
 * Determine label type: 'slot' (rich content) or 'text' (simple attribute).
 * Checks ty-tabs element for slot='label-{tab-id}' direct children.
 */
function getTabLabelType(tabsEl: TyTabs, tab: HTMLElement): 'slot' | 'text' {
  const tabId = getTabId(tab);
  if (tabId && hasSlotLabel(tabsEl, tabId)) {
    return 'slot';
  }
  return 'text';
}

function isTabDisabled(tab: HTMLElement): boolean {
  return tab.hasAttribute('disabled');
}

function hasCustomMarker(el: TyTabs): boolean {
  return el.querySelector('[slot="marker"]') !== null;
}

function findTabIndex(tabs: HTMLElement[], tabId: string): number | undefined {
  const index = tabs.findIndex(tab => getTabId(tab) === tabId);
  return index >= 0 ? index : undefined;
}

/** Active tab ID, defaulting to the first tab if not specified. */
function getActiveTabId(el: TyTabs, tabs: HTMLElement[]): string | null {
  const activeAttr = el.getAttribute('active');
  
  if (activeAttr && findTabIndex(tabs, activeAttr) !== undefined) {
    return activeAttr;
  }
  
  // Default to first tab
  if (tabs.length > 0) {
    return getTabId(tabs[0]);
  }
  
  return null;
}

function setActiveTab(el: TyTabs, tabId: string): void {
  el.setAttribute('active', tabId);
}

function dispatchTabChangeEvent(
  el: TyTabs,
  activeId: string,
  activeIndex: number,
  previousId: string | null,
  previousIndex: number | null
): void {
  const event = new CustomEvent<TabChangeDetail>('ty-tab-change', {
    detail: {
      activeId,
      activeIndex,
      previousId,
      previousIndex,
    },
    bubbles: true,
    cancelable: false,
  });
  el.dispatchEvent(event);
}

function handleTabClick(el: TyTabs, tabId: string, event: Event): void {
  event.preventDefault();
  event.stopPropagation();
  
  // Set the active attribute (which will trigger state update)
  setActiveTab(el, tabId);
}

function cleanupEventListeners(el: TyTabs): void {
  const handlers = eventHandlers.get(el);
  if (!handlers) return;
  
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;
  
  handlers.tabClickHandlers.forEach((handler, tabId) => {
    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-tab-id='${tabId}']`);
    if (button) {
      button.removeEventListener('pointerdown', handler);
    }
  });
  handlers.tabKeyClickHandlers.forEach((handler, tabId) => {
    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-tab-id='${tabId}']`);
    if (button) {
      button.removeEventListener('click', handler);
    }
  });

  handlers.tabClickHandlers.clear();
  handlers.tabKeyClickHandlers.clear();
}

function setupEventListeners(el: TyTabs, shadowRoot: ShadowRoot, tabs: HTMLElement[]): void {
  cleanupEventListeners(el);

  const handlers = {
    tabClickHandlers: new Map<string, (e: Event) => void>(),
    tabKeyClickHandlers: new Map<string, (e: Event) => void>(),
  };

  tabs.forEach((tab) => {
    const tabId = getTabId(tab);
    if (!tabId) return;

    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-tab-id='${tabId}']`);
    if (button) {
      const handler = (e: Event) => handleTabClick(el, tabId, e);
      // pointerdown: snappy mouse/touch activation (no native click delay).
      // click, gated to event.detail === 0: native <button> keyboard
      // activation (Enter/Space) fires 'click' with detail 0 — real mouse
      // clicks report detail >= 1 — so this covers keyboard users without
      // double-firing handleTabClick on an actual pointer click (which
      // already fired via pointerdown above). Without this, keyboard-only
      // users could Tab to a tab button but had no way to activate it.
      const keyClickHandler = (e: Event) => {
        if ((e as MouseEvent).detail === 0) handleTabClick(el, tabId, e);
      };
      button.addEventListener('pointerdown', handler);
      button.addEventListener('click', keyClickHandler);
      handlers.tabClickHandlers.set(tabId, handler);
      handlers.tabKeyClickHandlers.set(tabId, keyClickHandler);
    }
  });

  eventHandlers.set(el, handlers);
}

function updateTransform(el: TyTabs, activeIndex: number): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;
  
  const panelsWrapper = shadowRoot.querySelector<HTMLElement>('.panels-wrapper');
  if (!panelsWrapper) return;
  
  const containerWidth = el.offsetWidth;
  const offsetPx = activeIndex * containerWidth;

  panelsWrapper.style.transform = `translateX(-${offsetPx}px)`;
}

/** Update ARIA attributes on tab buttons without re-rendering. */
function updateAriaAttributes(el: TyTabs, shadowRoot: ShadowRoot, activeId: string): void {
  const tabs = getChildTabs(el);
  
  tabs.forEach((tab, idx) => {
    const tabId = getTabId(tab);
    if (!tabId) return;
    
    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-tab-id='${tabId}']`);
    const isActive = tabId === activeId;
    
    if (button) {
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
      // data-active lets consumers style slotted label content
      button.setAttribute('data-active', String(isActive));

      const slottedLabel = el.querySelector(`[slot='label-${tabId}']`);
      if (slottedLabel) {
        slottedLabel.setAttribute('data-active', String(isActive));
      }
    }
  });
}

/** Update pointer-events, opacity and data-active on tab panels without re-rendering. */
function updatePanelInteraction(el: TyTabs, activeId: string): void {
  const tabs = getChildTabs(el);
  
  tabs.forEach((tab) => {
    const tabId = getTabId(tab);
    if (!tabId) return;
    
    const isActive = tabId === activeId;

    // data-active drives framework conditional rendering
    tab.setAttribute('data-active', String(isActive));
    
    if (isActive) {
      (tab as HTMLElement).style.pointerEvents = 'auto';
      (tab as HTMLElement).style.opacity = '1';
    } else {
      (tab as HTMLElement).style.pointerEvents = 'none';
      (tab as HTMLElement).style.opacity = '0';
    }
  });
}

/** Marker position in pixels for the active tab button, or null if not found. */
function calculateMarkerPosition(
  el: TyTabs,
  shadowRoot: ShadowRoot,
  activeId: string
): MarkerPosition | null {
  const button = shadowRoot.querySelector<HTMLElement>(`[data-tab-id='${activeId}']`);
  const buttonsContainer = shadowRoot.querySelector<HTMLElement>('.tab-buttons');
  
  if (!button || !buttonsContainer) return null;
  
  const buttonRect = button.getBoundingClientRect();
  
  // Use offset properties for position relative to container (accounts for padding)
  const left = button.offsetLeft;
  const top = button.offsetTop;
  
  return {
    left,
    top,
    width: buttonRect.width,
    height: buttonRect.height,
  };
}

function updateMarker(el: TyTabs, activeId: string): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;
  
  const marker = shadowRoot.querySelector<HTMLElement>('.marker-wrapper');
  if (!marker) return;
  
  const position = calculateMarkerPosition(el, shadowRoot, activeId);
  if (!position) return;

  // Snap without animating when the marker was never positioned, or was
  // positioned while the tabs were hidden (zero-size rects) — otherwise it
  // visibly glides in from 0,0 on first display.
  const snap = !marker.style.left || marker.offsetWidth === 0;
  if (snap) marker.style.transition = 'none';

  marker.style.left = `${position.left}px`;
  marker.style.top = `${position.top}px`;
  marker.style.width = `${position.width}px`;
  marker.style.height = `${position.height}px`;

  if (snap) {
    marker.offsetWidth; // flush styles so the snap isn't animated
    marker.style.transition = '';
  }
}

/**
 * Update only the active tab state without re-rendering DOM.
 * Called from `attributeChangedCallback` when the `active` attribute changes.
 *
 * `previousId` MUST be the value the attribute held *before* it was changed —
 * never call `getActiveTabId(el, ...)` here, because the attribute has already
 * been updated to `tabId` by the time this runs. Reading it back would always
 * yield the new value, making the change-detection guard below trip on every
 * click and silently suppress `ty-tab-change` dispatch.
 */
function updateActiveTabState(el: TyTabs, tabId: string, previousId: string | null): void {
  const tabs = getChildTabs(el);
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  const currentIndex = previousId ? findTabIndex(tabs, previousId) : undefined;
  const newIndex = findTabIndex(tabs, tabId);

  // Only update if different tab and valid
  if (previousId === tabId || newIndex === undefined) return;

  el.style.setProperty('--active-index', String(newIndex));
  updateTransform(el, newIndex);
  updateAriaAttributes(el, shadowRoot, tabId);
  updatePanelInteraction(el, tabId);
  updateMarker(el, tabId);

  // Reset scroll position of new active panel
  const newPanel = tabs[newIndex] as any;
  if (newPanel?.resetScroll) {
    newPanel.resetScroll();
  }

  dispatchTabChangeEvent(
    el,
    tabId,
    newIndex,
    previousId,
    currentIndex ?? null
  );
}

function setupResizeObserver(el: TyTabs): void {
  const oldObserver = resizeObservers.get(el);
  if (oldObserver) {
    oldObserver.disconnect();
  }
  
  // Observe unconditionally (not just for '%' widths) — overflow can happen
  // at any fixed width too, and needs to react to container resizes.
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    const { width } = getTabsAttributes(el);
    const tabs = getChildTabs(el);
    const activeId = getActiveTabId(el, tabs);
    const activeIndex = activeId ? findTabIndex(tabs, activeId) : 0;

    // Carousel page width (percentage widths only). This MUST NOT be written to
    // --tabs-width: :host is `width: var(--tabs-width, 100%)` with
    // `box-sizing: border-box`, so assigning a measured content-box width back
    // to it makes the new border box equal the old content box — the element
    // shrinks by its own padding + border on every callback, which re-triggers
    // this observer and shrinks it again. It converges toward zero, the button
    // row's clientWidth collapses with it, and updateOverflow then finds that
    // even the first tab "doesn't fit" and banishes everything into the "…"
    // menu. Reloading looked fine only because render() resets --tabs-width to
    // 100% and no resize had happened yet.
    if (width.includes('%')) {
      el.style.setProperty('--tabs-page-width', `${entry.contentRect.width}px`);
    }

    // Update transform with new width
    if (activeIndex !== undefined) {
      updateTransform(el, activeIndex);
    }

    // Update marker position (tab button positions may have changed)
    if (activeId) {
      updateMarker(el, activeId);
    }

    updateOverflow(el);
  });

  observer.observe(el);
  resizeObservers.set(el, observer);
}

function cleanupResizeObserver(el: TyTabs): void {
  const observer = resizeObservers.get(el);
  if (observer) {
    observer.disconnect();
    resizeObservers.delete(el);
  }
}

/**
 * Generate HTML for tab buttons using slots for rich labels.
 * Slots are looked up as direct children of tabs-el with slot='label-{tab-id}'.
 * Also renders marker wrapper with optional default underline (only if no custom marker).
 */
function renderTabButtons(tabsEl: TyTabs, tabs: HTMLElement[], activeId: string | null): string {
  const buttons = tabs.map((tab) => {
    const tabId = getTabId(tab);
    if (!tabId) return '';
    
    const labelType = getTabLabelType(tabsEl, tab);
    const textLabel = labelType === 'text' ? (tab.getAttribute('label') || 'Tab') : '';
    const disabled = isTabDisabled(tab);
    const active = tabId === activeId;
    
    return `<button
      class="tab-button"
      role="tab"
      data-tab-id="${tabId}"
      id="tab-${tabId}"
      aria-selected="${active}"
      tabindex="${active ? '0' : '-1'}"
      data-active="${active}"
      ${disabled ? 'disabled aria-disabled="true"' : ''}
    >
      ${labelType === 'slot' ? `<slot name="label-${tabId}"></slot>` : textLabel}
    </button>`;
  }).join('');
  
  return `
    <div class="tab-buttons" role="tablist" part="buttons-container">
      <div class="marker-wrapper" part="marker-wrapper">
        ${!hasCustomMarker(tabsEl) ? '<div class="default-marker"></div>' : ''}
        <slot name="marker"></slot>
      </div>
      ${buttons}
    </div>
  `;
}

/**
 * Generate HTML for ONLY the button elements (no marker wrapper).
 * Used during smart updates to preserve the marker wrapper.
 */
function renderButtonsOnly(tabsEl: TyTabs, tabs: HTMLElement[], activeId: string | null): string {
  return tabs.map((tab) => {
    const tabId = getTabId(tab);
    if (!tabId) return '';
    
    const labelType = getTabLabelType(tabsEl, tab);
    const textLabel = labelType === 'text' ? (tab.getAttribute('label') || 'Tab') : '';
    const disabled = isTabDisabled(tab);
    const active = tabId === activeId;
    
    return `<button
      class="tab-button"
      role="tab"
      data-tab-id="${tabId}"
      id="tab-${tabId}"
      aria-selected="${active}"
      tabindex="${active ? '0' : '-1'}"
      data-active="${active}"
      ${disabled ? 'disabled aria-disabled="true"' : ''}
    >
      ${labelType === 'slot' ? `<slot name="label-${tabId}"></slot>` : textLabel}
    </button>`;
  }).join('');
}

// Overflow handling: collapse tabs that don't fit into a "more" menu.
const OVERFLOW_TRIGGER_WIDTH = 40;

/** Build a display label for a hidden tab's overflow-menu entry. */
function getTabMenuLabel(tabsEl: TyTabs, tab: HTMLElement): string {
  const tabId = getTabId(tab);
  if (tabId && getTabLabelType(tabsEl, tab) === 'slot') {
    const slotted = tabsEl.querySelector(`[slot='label-${tabId}']`);
    return slotted?.textContent?.trim() || tabId;
  }
  return tab.getAttribute('label') || 'Tab';
}

/** Remove the "more" trigger + its popup, if present. */
function removeOverflowMenu(shadowRoot: ShadowRoot): void {
  shadowRoot.querySelector('.tab-overflow-trigger')?.remove();
}

/**
 * Build the "more" trigger button + its ty-popup menu for the given
 * (already-hidden) tab buttons, and append it to the buttons container.
 * Reuses ty-popup instead of a second floating-menu implementation.
 */
function renderOverflowMenu(
  el: TyTabs,
  container: HTMLElement,
  hiddenButtons: HTMLButtonElement[],
  allTabs: HTMLElement[]
): void {
  if (hiddenButtons.length === 0) return;

  const tabsById = new Map(allTabs.map((tab) => [getTabId(tab), tab]));

  const trigger = document.createElement('button');
  trigger.className = 'tab-overflow-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-label', `${hiddenButtons.length} more tabs`);
  trigger.textContent = '⋯';

  const popup = document.createElement('ty-popup');
  popup.setAttribute('placement', 'bottom');

  const menu = document.createElement('div');
  menu.className = 'tab-overflow-menu';
  menu.setAttribute('role', 'menu');

  hiddenButtons.forEach((btn) => {
    const tabId = btn.dataset.tabId;
    const tab = tabId ? tabsById.get(tabId) : undefined;
    if (!tabId || !tab) return;

    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'tab-overflow-item';
    item.setAttribute('role', 'menuitem');
    item.textContent = getTabMenuLabel(el, tab);
    if (isTabDisabled(tab)) {
      item.disabled = true;
    } else {
      item.addEventListener('click', () => {
        setActiveTab(el, tabId);
        (popup as any).closePopup?.();
      });
    }
    menu.appendChild(item);
  });

  popup.appendChild(menu);
  trigger.appendChild(popup);
  container.appendChild(trigger);
}

/**
 * Measure the tab buttons against the available width and collapse whatever
 * doesn't fit behind a "more" trigger + popup menu. The active tab is always
 * kept visible — if it would be the one to overflow, the last visible button
 * is hidden in its place instead.
 */
function updateOverflow(el: TyTabs): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  const container = shadowRoot.querySelector<HTMLElement>('.tab-buttons');
  if (!container) return;

  removeOverflowMenu(shadowRoot);
  const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('.tab-button'));
  buttons.forEach((b) => b.classList.remove('overflow-hidden'));
  if (buttons.length === 0) return;

  const available = container.clientWidth;
  // A zero/negative measurement means we cannot know what fits — the element is
  // display:none, inside a collapsed parent, or mid-layout. Collapsing on that
  // reading would hide every tab behind "…" and, since nothing re-runs until
  // the next resize, leave it stuck that way after the element becomes visible.
  // Bail and keep the current (all-visible) state instead.
  if (available <= 0) return;

  let total = 0;
  let cutoff = buttons.length;
  for (let i = 0; i < buttons.length; i++) {
    total += buttons[i].offsetWidth;
    if (total > available) { cutoff = i; break; }
  }
  if (cutoff >= buttons.length) return; // everything fits

  // Recompute the cutoff leaving room for the "more" trigger itself.
  total = 0;
  cutoff = buttons.length;
  for (let i = 0; i < buttons.length; i++) {
    total += buttons[i].offsetWidth;
    if (total > available - OVERFLOW_TRIGGER_WIDTH) { cutoff = i; break; }
  }
  cutoff = Math.max(cutoff, 1);

  const tabs = getChildTabs(el);
  const activeId = getActiveTabId(el, tabs);
  const hidden = new Set(buttons.slice(cutoff));

  const activeButton = activeId ? buttons.find((b) => b.dataset.tabId === activeId) : undefined;
  if (activeButton && hidden.has(activeButton)) {
    const lastVisible = buttons[cutoff - 1];
    hidden.delete(activeButton);
    hidden.add(lastVisible);
  }

  buttons.forEach((b) => b.classList.toggle('overflow-hidden', hidden.has(b)));
  renderOverflowMenu(el, container, buttons.filter((b) => hidden.has(b)), tabs);
}

/**
 * Render the tabs container with buttons and panel viewport.
 * Smart rendering: checks if structure exists and only updates when needed.
 */
function render(el: TyTabs): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;
  
  const { width, height, placement } = getTabsAttributes(el);
  const tabs = getChildTabs(el);
  const activeId = getActiveTabId(el, tabs);
  const activeIndex = activeId ? (findTabIndex(tabs, activeId) ?? 0) : 0;

  // Each <ty-tab> IS its tabpanel (no separate wrapper — there's just one
  // catch-all <slot> in the carousel viewport below). role/aria-labelledby/
  // tabindex go directly on the light-DOM host; its `id` attribute is ALSO
  // its tabId (getTabId reads it directly), so it's never touched here.
  // No aria-controls on the tab BUTTON pointing at this: it lives in the
  // shadow root while the panel is in light DOM, and ARIA id-references
  // don't resolve across a shadow-tree boundary — axe's aria-valid-attr-value
  // correctly flags that as invalid even though getElementById can find the
  // target. role=tab + aria-selected + aria-labelledby (this direction) is
  // what's actually load-bearing; caught by axe once ty-tabs got coverage.
  tabs.forEach((tab) => {
    const tabId = getTabId(tab);
    if (!tabId) return;
    tab.setAttribute('role', 'tabpanel');
    tab.setAttribute('aria-labelledby', `tab-${tabId}`);
    tab.setAttribute('tabindex', '0');
  });

  const existingContainer = shadowRoot.querySelector('.tabs-container');
  const existingButtons = shadowRoot.querySelector('.tab-buttons');
  const existingViewport = shadowRoot.querySelector('.panels-viewport');

  ensureStyles(shadowRoot, { css: tabsStyles, id: 'ty-tabs' });

  if (tabs.length > 7) {
    console.warn(
      `[ty-tabs] More than 7 tabs detected (${tabs.length} tabs). ` +
      'This may cause overflow and poor UX. ' +
      'Consider using sidebar navigation, accordion menu, or other patterns.'
    );
  }
  
  el.style.setProperty('--tabs-width', width.includes('%') ? '100%' : width);
  el.style.setProperty('--tabs-height', height);
  el.style.setProperty('--active-index', String(activeIndex));
  
  if (existingContainer && existingButtons && existingViewport) {
    // === SMART UPDATE: Structure exists, only update what changed ===

    existingContainer.setAttribute('data-placement', placement);

    // Preserve the marker wrapper; only the buttons are recreated.
    existingButtons.querySelector('.tab-overflow-trigger')?.remove();
    const allButtons = existingButtons.querySelectorAll('.tab-button');
    allButtons.forEach(button => button.remove());

    const buttonsHtml = renderButtonsOnly(el, tabs, activeId);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = buttonsHtml;
    
    Array.from(tempDiv.children).forEach(button => {
      existingButtons.appendChild(button);
    });

    // Re-setup event listeners (buttons were recreated)
    setupEventListeners(el, shadowRoot, tabs);
    updateAriaAttributes(el, shadowRoot, activeId || '');

    requestAnimationFrame(() => {
      const buttons = shadowRoot.querySelector('.tab-buttons');
      if (buttons) {
        const buttonsHeight = (buttons as HTMLElement).offsetHeight;
        el.style.setProperty('--buttons-height', `${buttonsHeight}px`);
      }
      
      // Update transform with current active index
      updateTransform(el, activeIndex);

      // Update marker position to match active tab
      if (activeId) {
        updateMarker(el, activeId);
      }

      updateOverflow(el);
    });

    // Update panel interaction states
    if (activeId) {
      updatePanelInteraction(el, activeId);
    }
    
  } else {
    // === FULL RENDER: First time or structure missing ===
    
    shadowRoot.innerHTML = `
      <div class="tabs-container" data-placement="${placement}">
        ${renderTabButtons(el, tabs, activeId)}
        <div class="panels-viewport" part="panels-container">
          <div class="panels-wrapper">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
    
    // Measure button height, update transform and marker after render
    requestAnimationFrame(() => {
      const buttons = shadowRoot.querySelector('.tab-buttons');
      if (buttons) {
        const buttonsHeight = (buttons as HTMLElement).offsetHeight;
        el.style.setProperty('--buttons-height', `${buttonsHeight}px`);
      }

      updateTransform(el, activeIndex);

      if (activeId) {
        updateMarker(el, activeId);
      }

      updateOverflow(el);
    });

    setupEventListeners(el, shadowRoot, tabs);
    updateAriaAttributes(el, shadowRoot, activeId || '');
    setupResizeObserver(el);

    if (activeId) {
      updatePanelInteraction(el, activeId);
    }

    // Hide the default marker whenever a custom one is slotted in.
    const markerSlot = shadowRoot.querySelector('slot[name="marker"]') as HTMLSlotElement;
    if (markerSlot) {
      const updateDefaultMarkerVisibility = () => {
        const defaultMarker = shadowRoot.querySelector('.default-marker') as HTMLElement;
        if (defaultMarker) {
          const hasCustom = markerSlot.assignedElements().length > 0;
          defaultMarker.style.display = hasCustom ? 'none' : '';
        }
      };
      markerSlot.addEventListener('slotchange', updateDefaultMarkerVisibility);
      // Check immediately in case content is already slotted
      updateDefaultMarkerVisibility();
    }
  }
}

function cleanup(el: TyTabs): void {
  cleanupEventListeners(el);
  cleanupResizeObserver(el);
}

/**
 * TyTabs Web Component
 */
export class TyTabs extends HTMLElement {
  static get observedAttributes() {
    return ['width', 'height', 'active', 'placement'];
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
  
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    // Smart rendering: only full render when structural attributes change
    if (name === 'active') {
      if (newValue) {
        // Pass `oldValue` explicitly so the change-detection inside
        // `updateActiveTabState` compares against the previous value
        // rather than re-reading the (already updated) attribute.
        updateActiveTabState(this, newValue, oldValue);
      }
      // Always call render after active change to update button states
      render(this);
    } else {
      // Other attributes changed (width, height, placement) - full render
      render(this);
    }
  }
}

if (!customElements.get('ty-tabs')) {
  customElements.define('ty-tabs', TyTabs);
}
