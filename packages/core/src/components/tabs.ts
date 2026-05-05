/**
 * Tabs Component
 * 
 * A carousel-based tabs component with smooth animations and fixed container dimensions.
 * Features horizontal sliding transitions, smart positioning marker, and independent panel scrolling.
 * 
 * Features:
 * - Carousel animation with smooth sliding transitions
 * - Fixed dimensions prevent layout shift between tabs
 * - Animated marker that follows active tab button
 * - Rich label support via slots (icons, badges, custom content)
 * - Custom marker slot for complete active tab styling control
 * - Independent panel scrolling with scroll position reset
 * - ResizeObserver for responsive percentage widths
 * - Smart rendering - only updates DOM when necessary
 * - Accessibility with ARIA roles and attributes
 * - Top/bottom placement for tab buttons
 * 
 * @example
 * <!-- Basic tabs with text labels -->
 * <ty-tabs width="800px" height="600px" active="general">
 *   <ty-tab id="general" label="General Settings">
 *     <div class="p-6">General content...</div>
 *   </ty-tab>
 *   <ty-tab id="advanced" label="Advanced Settings">
 *     <div class="p-6">Advanced content...</div>
 *   </ty-tab>
 * </ty-tabs>
 * 
 * @example
 * <!-- Rich labels with icons and badges -->
 * <ty-tabs width="800px" height="600px">
 *   <!-- Rich label as direct child -->
 *   <span slot="label-profile" class="flex items-center gap-2">
 *     <ty-icon name="user" size="sm"></ty-icon>
 *     Profile
 *   </span>
 *   
 *   <span slot="label-notifications" class="flex items-center gap-2">
 *     <ty-icon name="bell" size="sm"></ty-icon>
 *     Notifications
 *     <span class="ty-bg-danger ty-text-danger++ px-2 py-0.5 rounded-full text-xs">5</span>
 *   </span>
 *   
 *   <!-- Tab panels -->
 *   <ty-tab id="profile">...</ty-tab>
 *   <ty-tab id="notifications">...</ty-tab>
 * </ty-tabs>
 * 
 * @example
 * <!-- Custom marker styling -->
 * <ty-tabs width="100%" height="400px">
 *   <!-- Gradient marker slot -->
 *   <div slot="marker" style="
 *     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 *     border-radius: 0.5rem;
 *     box-shadow: 0 2px 8px rgba(0,0,0,0.15);
 *   "></div>
 *   
 *   <ty-tab id="tab1" label="Dashboard">...</ty-tab>
 *   <ty-tab id="tab2" label="Analytics">...</ty-tab>
 * </ty-tabs>
 */

import { ensureStyles } from '../utils/styles.js';
import { tabsStyles } from '../styles/tabs.js';

// ============================================================================
// Types
// ============================================================================

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

/**
 * Marker position for animated indicator
 */
interface MarkerPosition {
  left: number;   // Left offset in pixels
  top: number;    // Top offset in pixels
  width: number;  // Width in pixels
  height: number; // Height in pixels
}

// ============================================================================
// WeakMaps for State Management
// ============================================================================

const eventHandlers = new WeakMap<TyTabs, {
  tabClickHandlers: Map<string, (e: Event) => void>;
}>();

const resizeObservers = new WeakMap<TyTabs, ResizeObserver>();

// ============================================================================
// Helper Functions - Attribute Parsing
// ============================================================================

/**
 * Extract tabs configuration from element attributes
 */
function getTabsAttributes(el: TyTabs): TabsAttributes {
  return {
    width: el.getAttribute('width') || '100%',
    height: el.getAttribute('height') || '400px',
    active: el.getAttribute('active'),
    placement: (el.getAttribute('placement') || 'top') as 'top' | 'bottom',
  };
}

/**
 * Get all ty-tab child elements
 */
function getChildTabs(el: TyTabs): HTMLElement[] {
  return Array.from(el.querySelectorAll('ty-tab'));
}

/**
 * Get ID from a ty-tab element
 */
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

/**
 * Check if tab is disabled
 */
function isTabDisabled(tab: HTMLElement): boolean {
  return tab.hasAttribute('disabled');
}

/**
 * Check if user provided custom marker content via slot
 */
function hasCustomMarker(el: TyTabs): boolean {
  return el.querySelector('[slot="marker"]') !== null;
}

// ============================================================================
// Helper Functions - Active Tab Management
// ============================================================================

/**
 * Find index of tab with given ID
 */
function findTabIndex(tabs: HTMLElement[], tabId: string): number | undefined {
  const index = tabs.findIndex(tab => getTabId(tab) === tabId);
  return index >= 0 ? index : undefined;
}

/**
 * Get the active tab ID, defaulting to first tab if not specified
 */
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

/**
 * Set the active tab by ID
 */
function setActiveTab(el: TyTabs, tabId: string): void {
  el.setAttribute('active', tabId);
}

/**
 * Dispatch ty-tab-change event
 */
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

// ============================================================================
// Event Handlers - Tab Button Click
// ============================================================================

/**
 * Handle tab button click
 */
function handleTabClick(el: TyTabs, tabId: string, event: Event): void {
  event.preventDefault();
  event.stopPropagation();
  
  // Set the active attribute (which will trigger state update)
  setActiveTab(el, tabId);
}

/**
 * Cleanup existing event listeners
 */
function cleanupEventListeners(el: TyTabs): void {
  const handlers = eventHandlers.get(el);
  if (!handlers) return;
  
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;
  
  // Remove all tab click handlers
  handlers.tabClickHandlers.forEach((handler, tabId) => {
    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-tab-id='${tabId}']`);
    if (button) {
      button.removeEventListener('pointerdown', handler);
    }
  });
  
  handlers.tabClickHandlers.clear();
}

/**
 * Setup event listeners for tab button clicks
 */
function setupEventListeners(el: TyTabs, shadowRoot: ShadowRoot, tabs: HTMLElement[]): void {
  // Clean up any existing listeners first
  cleanupEventListeners(el);
  
  // Initialize handlers storage
  const handlers = {
    tabClickHandlers: new Map<string, (e: Event) => void>(),
  };
  
  // Add click listener for each tab button
  tabs.forEach((tab) => {
    const tabId = getTabId(tab);
    if (!tabId) return;
    
    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-tab-id='${tabId}']`);
    if (button) {
      const handler = (e: Event) => handleTabClick(el, tabId, e);
      button.addEventListener('pointerdown', handler);
      handlers.tabClickHandlers.set(tabId, handler);
    }
  });
  
  // Store handlers for cleanup
  eventHandlers.set(el, handlers);
}

// ============================================================================
// Transform & Positioning Updates
// ============================================================================

/**
 * Update the transform on panels-wrapper based on active index and measured width
 */
function updateTransform(el: TyTabs, activeIndex: number): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;
  
  const panelsWrapper = shadowRoot.querySelector<HTMLElement>('.panels-wrapper');
  if (!panelsWrapper) return;
  
  // Measure the actual width of the container
  const containerWidth = el.offsetWidth;
  const offsetPx = activeIndex * containerWidth;
  
  // Apply transform directly in pixels
  panelsWrapper.style.transform = `translateX(-${offsetPx}px)`;
}

/**
 * Update ARIA attributes on tab buttons without re-rendering
 */
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
      // Add data-active attribute for styling slotted content
      button.setAttribute('data-active', String(isActive));
      
      // Also set data-active on the slotted label element in light DOM
      const slottedLabel = el.querySelector(`[slot='label-${tabId}']`);
      if (slottedLabel) {
        slottedLabel.setAttribute('data-active', String(isActive));
      }
    }
  });
}

/**
 * Update pointer-events, opacity, and data-active on tab panels without re-rendering
 */
function updatePanelInteraction(el: TyTabs, activeId: string): void {
  const tabs = getChildTabs(el);
  
  tabs.forEach((tab) => {
    const tabId = getTabId(tab);
    if (!tabId) return;
    
    const isActive = tabId === activeId;
    
    // Set data-active attribute for framework conditional rendering
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

/**
 * Calculate marker position and dimensions based on active tab button.
 * Returns position object with left, top, width, height in pixels, or null if button not found.
 */
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

/**
 * Update marker wrapper position and dimensions to match active tab button
 */
function updateMarker(el: TyTabs, activeId: string): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;
  
  const marker = shadowRoot.querySelector<HTMLElement>('.marker-wrapper');
  if (!marker) return;
  
  const position = calculateMarkerPosition(el, shadowRoot, activeId);
  if (!position) return;
  
  marker.style.left = `${position.left}px`;
  marker.style.top = `${position.top}px`;
  marker.style.width = `${position.width}px`;
  marker.style.height = `${position.height}px`;
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
  
  // Update CSS variable for transform
  el.style.setProperty('--active-index', String(newIndex));
  
  // Update transform directly
  updateTransform(el, newIndex);
  
  // Update ARIA attributes on buttons
  updateAriaAttributes(el, shadowRoot, tabId);
  
  // Update pointer-events on panels
  updatePanelInteraction(el, tabId);
  
  // Update marker position to match new active tab
  updateMarker(el, tabId);
  
  // Reset scroll position of new active panel
  const newPanel = tabs[newIndex] as any;
  if (newPanel?.resetScroll) {
    newPanel.resetScroll();
  }
  
  // Dispatch change event
  dispatchTabChangeEvent(
    el,
    tabId,
    newIndex,
    previousId,
    currentIndex ?? null
  );
}

// ============================================================================
// ResizeObserver for Responsive Width
// ============================================================================

/**
 * Setup ResizeObserver for percentage widths and marker updates
 */
function setupResizeObserver(el: TyTabs): void {
  // Clean up old observer
  const oldObserver = resizeObservers.get(el);
  if (oldObserver) {
    oldObserver.disconnect();
  }
  
  const { width } = getTabsAttributes(el);
  
  // Only setup observer for percentage widths
  if (width.includes('%')) {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const measuredWidth = entry.contentRect.width;
      const tabs = getChildTabs(el);
      const activeId = getActiveTabId(el, tabs);
      const activeIndex = activeId ? findTabIndex(tabs, activeId) : 0;
      
      // Update CSS variable with measured width
      el.style.setProperty('--tabs-width', `${measuredWidth}px`);
      
      // Update transform with new width
      if (activeIndex !== undefined) {
        updateTransform(el, activeIndex);
      }
      
      // Update marker position (tab button positions may have changed)
      if (activeId) {
        updateMarker(el, activeId);
      }
    });
    
    observer.observe(el);
    resizeObservers.set(el, observer);
  }
}

/**
 * Cleanup ResizeObserver
 */
function cleanupResizeObserver(el: TyTabs): void {
  const observer = resizeObservers.get(el);
  if (observer) {
    observer.disconnect();
    resizeObservers.delete(el);
  }
}

// ============================================================================
// Rendering Functions
// ============================================================================

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
      aria-controls="panel-${tabId}"
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
      aria-controls="panel-${tabId}"
      aria-selected="${active}"
      tabindex="${active ? '0' : '-1'}"
      data-active="${active}"
      ${disabled ? 'disabled aria-disabled="true"' : ''}
    >
      ${labelType === 'slot' ? `<slot name="label-${tabId}"></slot>` : textLabel}
    </button>`;
  }).join('');
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
  
  // Check if structure already exists
  const existingContainer = shadowRoot.querySelector('.tabs-container');
  const existingButtons = shadowRoot.querySelector('.tab-buttons');
  const existingViewport = shadowRoot.querySelector('.panels-viewport');
  
  // Ensure styles are loaded
  ensureStyles(shadowRoot, { css: tabsStyles, id: 'ty-tabs' });
  
  // Dev warning for too many tabs
  if (tabs.length > 7) {
    console.warn(
      `[ty-tabs] More than 7 tabs detected (${tabs.length} tabs). ` +
      'This may cause overflow and poor UX. ' +
      'Consider using sidebar navigation, accordion menu, or other patterns.'
    );
  }
  
  // Set CSS variables for dimensions
  el.style.setProperty('--tabs-width', width.includes('%') ? '100%' : width);
  el.style.setProperty('--tabs-height', height);
  el.style.setProperty('--active-index', String(activeIndex));
  
  if (existingContainer && existingButtons && existingViewport) {
    // === SMART UPDATE: Structure exists, only update what changed ===
    
    // Update placement if changed
    existingContainer.setAttribute('data-placement', placement);
    
    // SMART UPDATE: Preserve marker wrapper, only update buttons
    const allButtons = existingButtons.querySelectorAll('.tab-button');
    allButtons.forEach(button => button.remove());
    
    // Generate and append new buttons after the marker wrapper
    const buttonsHtml = renderButtonsOnly(el, tabs, activeId);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = buttonsHtml;
    
    Array.from(tempDiv.children).forEach(button => {
      existingButtons.appendChild(button);
    });
    
    // Re-setup event listeners (buttons were recreated)
    setupEventListeners(el, shadowRoot, tabs);
    
    // Update ARIA and data-active attributes on initial render
    updateAriaAttributes(el, shadowRoot, activeId || '');
    
    // Measure button height and update marker after update
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
      
      // Update transform with measured width
      updateTransform(el, activeIndex);
      
      // Update marker position to match active tab
      if (activeId) {
        updateMarker(el, activeId);
      }
    });
    
    // Setup event listeners
    setupEventListeners(el, shadowRoot, tabs);

    // Update ARIA and data-active attributes on initial render
    updateAriaAttributes(el, shadowRoot, activeId || '');

    // Setup ResizeObserver for responsive width
    setupResizeObserver(el);

    // Update tab panel states
    if (activeId) {
      updatePanelInteraction(el, activeId);
    }

    // Listen for marker slot changes to hide default marker
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

/**
 * Cleanup when tabs component is disconnected
 */
function cleanup(el: TyTabs): void {
  cleanupEventListeners(el);
  cleanupResizeObserver(el);
}

// ============================================================================
// Component Definition
// ============================================================================

/**
 * TyTabs Web Component
 */
export class TyTabs extends HTMLElement {
  /** Observed attributes */
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
      // Active tab changed - update state, then do smart render
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

// Register the custom element
if (!customElements.get('ty-tabs')) {
  customElements.define('ty-tabs', TyTabs);
}
