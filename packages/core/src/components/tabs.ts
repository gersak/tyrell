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
  fixed: boolean;             // Split the bar into equal shares instead of scrolling
}

/**
 * Tab change event detail. Fired whenever the shown tab changes after the
 * first one is shown — never for the initial tab.
 */
export interface TabChangeDetail {
  activeId: string;           // ID of newly shown tab
  activeIndex: number;        // Index of newly shown tab
  previousId: string | null;  // ID of the tab shown before (null if it no longer exists)
  previousIndex: number | null; // Its index, or null if it no longer exists
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
  tabKeydownHandlers: Map<string, (e: Event) => void>;
}>();

const resizeObservers = new WeakMap<TyTabs, ResizeObserver>();

// The tab actually on screen. Kept here, not in the `active` attribute: a
// server morph (Datastar, idiomorph) rewrites or drops attributes, and the
// component must keep showing what it showed. `active` is a request; this is
// the state.
const shownTabs = new WeakMap<TyTabs, string | null>();

// Per-instance sheet: `:host` sizing from the width/height attributes, and the
// rule that hides every panel but the shown one. Lives in the shadow root, so
// a morph that rewrites the host's `style` or the children's attributes can't
// touch it (see flavor-sheet.ts for the same pattern).
const instanceSheets = new WeakMap<TyTabs, CSSStyleSheet>();

// The app's first `active` correction (mount, then apply state — React
// effects, Datastar data-attr) snaps instead of sliding over from tab 0.
// Holds the page's input count from when the first tab was shown: once the
// user has pressed anything, a correction is the app reacting to them (a Next
// button) and animates like a click.
const pendingInitialSnap = new WeakMap<TyTabs, number>();
let userInputs = 0;
const countInput = () => { userInputs++; };
addEventListener('pointerdown', countInput, { capture: true, passive: true });
addEventListener('keydown', countInput, { capture: true, passive: true });

// `active` named a tab that wasn't a child yet when the first tab was shown
// (a classic <script> in <head> upgrades ty-tabs before the parser has
// created its children). Moving to it when it arrives is still the initial
// tab: snap, no event.
const awaitedTabs = new WeakMap<TyTabs, string>();

let snapCount = 0;

function getTabsAttributes(el: TyTabs): Pick<TabsAttributes, 'placement' | 'fixed'> {
  return {
    placement: (el.getAttribute('placement') || 'top') as 'top' | 'bottom',
    fixed: el.hasAttribute('fixed'),
  };
}

/** Direct children only — a nested ty-tabs owns its own ty-tab children. */
function getChildTabs(el: TyTabs): HTMLElement[] {
  return Array.from(el.querySelectorAll(':scope > ty-tab'));
}

function getTabId(tab: HTMLElement): string | null {
  return tab.getAttribute('id');
}

/**
 * Find the rich label element for a tab-id.
 * DIRECT children only — a slot in ty-tabs' shadow root can only be filled by a
 * direct child of ty-tabs, so a `slot="label-x"` buried inside a ty-tab would be
 * detected but never rendered, blanking the button.
 */
function getSlotLabel(tabsEl: TyTabs, tabId: string): Element | null {
  return tabsEl.querySelector(`:scope > [slot='label-${tabId}']`);
}

function hasSlotLabel(tabsEl: TyTabs, tabId: string): boolean {
  return getSlotLabel(tabsEl, tabId) !== null;
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
  return el.querySelector(':scope > [slot="marker"]') !== null;
}

function findTabIndex(tabs: HTMLElement[], tabId: string): number | undefined {
  const index = tabs.findIndex(tab => getTabId(tab) === tabId);
  return index >= 0 ? index : undefined;
}

/**
 * Shown tab id read fresh. Deferred work (rAF, resize) must use this rather
 * than values captured when it was scheduled — the shown tab can change in
 * between.
 */
function currentActive(el: TyTabs): string | null {
  return shownTabs.get(el) ?? null;
}

/**
 * The tab that should be shown: a valid `active`, else the tab already shown
 * (a missing or unknown `active` — e.g. a morph dropped it — keeps the
 * current tab), else the first tab.
 */
function getActiveTabId(el: TyTabs, tabs: HTMLElement[]): string | null {
  const ids = tabs.map(getTabId).filter((id): id is string => !!id);
  const activeAttr = el.getAttribute('active');
  if (activeAttr && ids.includes(activeAttr)) return activeAttr;

  const shown = shownTabs.get(el);
  if (shown && ids.includes(shown)) return shown;

  return ids[0] ?? null;
}

/**
 * User activation (click, keys, "…" menu). Applied and dispatched
 * synchronously: with Datastar's `data-attr:active="$tab"` +
 * `data-on:ty-tab-change`, a deferred event lets data-attr write the old
 * signal value back over the click before the handler updates it.
 */
function activateTab(el: TyTabs, tabId: string): void {
  el.setAttribute('active', tabId);
  syncShownTab(el, true);
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
  activateTab(el, tabId);
}

function cleanupEventListeners(el: TyTabs): void {
  const handlers = eventHandlers.get(el);
  if (!handlers) return;
  
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;
  
  handlers.tabClickHandlers.forEach((handler, tabId) => {
    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-tab-id='${tabId}']`);
    if (button) {
      button.removeEventListener('click', handler);
    }
  });
  handlers.tabKeydownHandlers.forEach((handler, tabId) => {
    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-tab-id='${tabId}']`);
    if (button) {
      button.removeEventListener('keydown', handler);
    }
  });

  handlers.tabClickHandlers.clear();
  handlers.tabKeydownHandlers.clear();
}

function handleTabKeydown(el: TyTabs, shadowRoot: ShadowRoot, tabId: string, e: KeyboardEvent): void {
  if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
  const ids = Array.from(
    shadowRoot.querySelectorAll<HTMLButtonElement>('.tab-buttons [data-tab-id]:not([disabled])'),
  ).map((b) => b.getAttribute('data-tab-id')!);
  const i = ids.indexOf(tabId);
  if (i < 0 || ids.length === 0) return;
  e.preventDefault();
  const next =
    e.key === 'Home' ? ids[0]
    : e.key === 'End' ? ids[ids.length - 1]
    : e.key === 'ArrowRight' ? ids[(i + 1) % ids.length]
    : ids[(i - 1 + ids.length) % ids.length];
  if (next === tabId) return;
  handleTabClick(el, next, e);
  requestAnimationFrame(() => {
    shadowRoot.querySelector<HTMLButtonElement>(`.tab-buttons [data-tab-id='${next}']`)?.focus();
  });
}

function setupEventListeners(el: TyTabs, shadowRoot: ShadowRoot, tabs: HTMLElement[]): void {
  cleanupEventListeners(el);

  const handlers = {
    tabClickHandlers: new Map<string, (e: Event) => void>(),
    tabKeydownHandlers: new Map<string, (e: Event) => void>(),
  };

  tabs.forEach((tab) => {
    const tabId = getTabId(tab);
    if (!tabId) return;

    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-tab-id='${tabId}']`);
    if (button) {
      // 'click', not pointerdown: the browser fires click only for a tap or
      // mouse click, never for a finger drag, so swiping the strip to scroll
      // it doesn't activate whichever tab the drag started on. A mouse click
      // also leaves focus on the button (pointerdown + preventDefault
      // cancelled that), so arrow keys work right after clicking. Enter/Space
      // on a focused button fire click too, covering keyboard activation.
      const handler = (e: Event) => handleTabClick(el, tabId, e);
      // Arrow keys / Home / End (WAI-ARIA tabs, automatic activation). The
      // buttons use a roving tabindex — only the active one is tabbable — so
      // without this, keyboard users could never reach the other tabs.
      const keydownHandler = (e: Event) => handleTabKeydown(el, shadowRoot, tabId, e as KeyboardEvent);
      button.addEventListener('click', handler);
      button.addEventListener('keydown', keydownHandler);
      handlers.tabClickHandlers.set(tabId, handler);
      handlers.tabKeydownHandlers.set(tabId, keydownHandler);
    }
  });

  eventHandlers.set(el, handlers);
}

/**
 * Carousel position. A percentage of the wrapper's own width — one panel —
 * so it needs no measuring and stays aligned through resizes.
 */
function carouselTransform(activeIndex: number): string {
  // `* -100`, not `-${…}`: index 0 must read back as the browser stores it
  // ("translateX(0%)"), or the realign check in syncShownTab never matches.
  return `translateX(${activeIndex * -100}%)`;
}

/**
 * Land the next carousel/panel change without the slide and fade. Held for
 * two frames rather than a forced style flush: Chromium 138 still faded a
 * panel corrected before the first frame, because the flush didn't see the
 * instance sheet's rule change yet. Tokened, so an earlier snap ending can't
 * cut a later one short.
 */
function snapNextChange(container: HTMLElement | null): void {
  if (!container) return;
  const token = String(++snapCount);
  container.setAttribute('data-snap', token);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (container.getAttribute('data-snap') === token) container.removeAttribute('data-snap');
  }));
}

function updateTransform(el: TyTabs, activeIndex: number): void {
  const panelsWrapper = el.shadowRoot?.querySelector<HTMLElement>('.panels-wrapper');
  if (panelsWrapper) panelsWrapper.style.transform = carouselTransform(activeIndex);
}

/** Write an attribute on a light-DOM child only when it differs — no mutation churn for observers (or morphers) watching it. */
function setAttr(node: Element, name: string, value: string): void {
  if (node.getAttribute(name) !== value) node.setAttribute(name, value);
}

/**
 * Keep the instance sheet in sync: `:host` size from the width/height
 * attributes, and the rule hiding every panel but `shownId`.
 *
 * The size is `!important` so an attribute beats page CSS; without the
 * attribute there's no declaration and page CSS (or the 100% / 400px
 * defaults) decides. Values go through CSSOM, never into CSS text, so an
 * attribute can't inject rules.
 *
 * The hide rule is `!important` too — the inline styles it replaces couldn't
 * be overridden by page CSS either.
 */
function syncInstanceSheet(el: TyTabs, shownId: string | null): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  let sheet = instanceSheets.get(el);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(':host {} ::slotted(ty-tab) {}');
    const hide = (sheet.cssRules[1] as CSSStyleRule).style;
    hide.setProperty('opacity', '0', 'important');
    hide.setProperty('visibility', 'hidden', 'important');
    hide.setProperty('pointer-events', 'none', 'important');
    shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, sheet];
    instanceSheets.set(el, sheet);
  }

  const host = (sheet.cssRules[0] as CSSStyleRule).style;
  for (const prop of ['width', 'height']) {
    const value = el.getAttribute(prop);
    if (value) host.setProperty(prop, value, 'important');
    else host.removeProperty(prop);
  }

  (sheet.cssRules[1] as CSSStyleRule).selectorText = shownId
    ? `::slotted(ty-tab:not(#${CSS.escape(shownId)}))`
    : '::slotted(ty-tab)';
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

      const slottedLabel = getSlotLabel(el, tabId);
      if (slottedLabel) {
        setAttr(slottedLabel, 'data-active', String(isActive));
      }
    }
  });
}

/**
 * Panel visibility (via the instance sheet) and the panels' best-effort
 * `data-active` hint. Panels get no inline style and no ARIA attributes —
 * a morph would strip them; ty-tab carries its tabpanel role internally.
 */
function updatePanelInteraction(el: TyTabs, activeId: string | null): void {
  syncInstanceSheet(el, activeId);

  getChildTabs(el).forEach((tab) => {
    const tabId = getTabId(tab);
    // A leaving panel stays visible while it fades out; inert takes it out
    // of the tab order and the a11y tree right away.
    (tab as any).setShown?.(!!tabId && tabId === activeId);
    if (!tabId) return;
    setAttr(tab, 'data-active', String(tabId === activeId));
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

  // offsetLeft/Top/Width/Height are all layout-space, relative to the
  // offsetParent's border box — unlike getBoundingClientRect(), they don't
  // reflect an ancestor's CSS transform. ty-modal's entrance animation scales
  // the whole dialog in from 0.93, and a rect taken mid-animation used to get
  // baked into the marker's size permanently: nothing re-measures it
  // afterwards, since a transform never fires ResizeObserver.
  const left = button.offsetLeft;
  const top = button.offsetTop;
  const width = button.offsetWidth;
  const height = button.offsetHeight;

  return { left, top, width, height };
}

function updateMarker(el: TyTabs, activeId: string, forceSnap = false): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  const marker = shadowRoot.querySelector<HTMLElement>('.marker-wrapper');
  if (!marker) return;

  const position = calculateMarkerPosition(el, shadowRoot, activeId);
  if (!position) return;

  // Snap without animating when the marker was never positioned, or was
  // positioned while the tabs were hidden (zero-size rects) — otherwise it
  // visibly glides in from 0,0 on first display. `forceSnap` covers the
  // related case where the first paint already had a real position (tab 0,
  // by getActiveTabId's default) and `active` is corrected right after.
  const snap = forceSnap || !marker.style.left || marker.offsetWidth === 0;
  if (snap) marker.style.transition = 'none';

  marker.style.left = `${position.left}px`;
  marker.style.top = `${position.top}px`;
  marker.style.width = `${position.width}px`;
  marker.style.height = `${position.height}px`;

  if (snap) {
    // Flush styles so the snap isn't animated. A call: the CDN build's
    // terser drops a bare property read.
    marker.getBoundingClientRect();
    marker.style.transition = '';
  }
}

/**
 * Bring the shown tab in line with getActiveTabId() — the one place the
 * shown tab changes. Fires `ty-tab-change` when it moves from one tab to
 * another, then lets a lazy tab fire `ty-tab-load`; showing the first tab
 * (on connect, or when tabs first arrive) fires nothing.
 *
 * `user` is a click/key/menu activation: it animates and never snaps.
 * External changes (`active` set by app or server, children morphed) snap
 * for the first tab shown and for the first correction after it, as long as
 * the user hasn't pressed anything since.
 */
function syncShownTab(el: TyTabs, user = false): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  const tabs = getChildTabs(el);
  const previousId = shownTabs.get(el) ?? null;
  const tabId = getActiveTabId(el, tabs);
  const newIndex = (tabId ? findTabIndex(tabs, tabId) : undefined) ?? 0;
  const container = shadowRoot.querySelector<HTMLElement>('.tabs-container');

  if (tabId === previousId) {
    // Same tab, but tabs added, removed or reordered before it moved its
    // slot: realign the carousel. Not a navigation — snap, no event.
    const wrapper = shadowRoot.querySelector<HTMLElement>('.panels-wrapper');
    if (wrapper && wrapper.style.transform !== carouselTransform(newIndex)) {
      snapNextChange(container);
      wrapper.style.transform = carouselTransform(newIndex);
    }
    return;
  }

  shownTabs.set(el, tabId);
  const initial = previousId === null;
  const arrived = !user && tabId !== null && awaitedTabs.get(el) === tabId;
  awaitedTabs.delete(el);
  const requested = el.getAttribute('active');
  if (initial && requested && requested !== tabId) awaitedTabs.set(el, requested);

  const snap = !user && (initial || arrived || pendingInitialSnap.get(el) === userInputs);
  if (initial) pendingInitialSnap.set(el, userInputs);
  else if (!arrived) pendingInitialSnap.delete(el);

  if (snap) snapNextChange(container);
  updateTransform(el, newIndex);
  updateAriaAttributes(el, shadowRoot, tabId || '');
  updatePanelInteraction(el, tabId);

  // First tab: render()'s frame measures the marker once layout exists.
  if (!tabId || initial) return;

  updateMarker(el, tabId, snap);
  scrollActiveIntoView(el, tabId, !snap);

  // The "…" menu is not rebuilt on activation, so re-mark it here.
  shadowRoot.querySelectorAll<HTMLElement>('.tab-overflow-item').forEach((item) => {
    item.setAttribute('data-active', String(item.dataset.tabId === tabId));
  });

  (tabs[newIndex] as any)?.resetScroll?.();

  if (arrived) return; // still the initial tab

  const previousIndex = findTabIndex(tabs, previousId!);
  dispatchTabChangeEvent(el, tabId, newIndex, previousIndex === undefined ? null : previousId, previousIndex ?? null);

  // A lazy tab with no content fires ty-tab-load. Not for the first tab.
  (tabs[newIndex] as any)?._requestLoad?.(newIndex);
}

function setupResizeObserver(el: TyTabs): void {
  const oldObserver = resizeObservers.get(el);
  if (oldObserver) {
    oldObserver.disconnect();
  }

  // Observe unconditionally (not just for '%' widths) — overflow can happen
  // at any fixed width too, and needs to react to container resizes. The
  // carousel is percentage-based, so it needs nothing here.
  const observer = new ResizeObserver(() => {
    const activeId = currentActive(el);

    // Overflow before marker: the "…" trigger appearing/vanishing reflows the
    // strip, and the marker must be measured against the final layout.
    updateOverflow(el);

    if (activeId) {
      updateMarker(el, activeId);
      scrollActiveIntoView(el, activeId, false);
    }
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
      ${labelType === 'slot' ? `<slot name="label-${tabId}"></slot>` : `<span class="tab-label">${textLabel}</span>`}
    </button>`;
  }).join('');
  
  return `
    <div class="tab-buttons" part="buttons-container">
      <div class="tab-strip" role="tablist" part="strip">
        <div class="marker-wrapper" part="marker-wrapper">
          ${!hasCustomMarker(tabsEl) ? '<div class="default-marker"></div>' : ''}
          <slot name="marker"></slot>
        </div>
        ${buttons}
      </div>
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
      ${labelType === 'slot' ? `<slot name="label-${tabId}"></slot>` : `<span class="tab-label">${textLabel}</span>`}
    </button>`;
  }).join('');
}

/** Build a display label for a tab's overflow-menu entry. */
function getTabMenuLabel(tabsEl: TyTabs, tab: HTMLElement): string {
  const tabId = getTabId(tab);
  if (tabId && getTabLabelType(tabsEl, tab) === 'slot') {
    const slotted = getSlotLabel(tabsEl, tabId);
    return slotted?.textContent?.trim() || tabId;
  }
  return tab.getAttribute('label') || 'Tab';
}

/** Remove the "more" trigger + its popup, if present. */
function removeOverflowMenu(shadowRoot: ShadowRoot): void {
  shadowRoot.querySelector('.tab-overflow-trigger')?.remove();
}

/**
 * Build the "more" trigger button + its ty-popup jump menu listing ALL tabs
 * (active one marked), and append it to the buttons container — outside the
 * scrollable strip, so it stays pinned at the edge.
 * Reuses ty-popup instead of a second floating-menu implementation.
 */
function renderOverflowMenu(el: TyTabs, container: HTMLElement, allTabs: HTMLElement[]): void {
  const activeId = getActiveTabId(el, allTabs);

  const trigger = document.createElement('button');
  trigger.className = 'tab-overflow-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-label', `${allTabs.length} tabs`);
  trigger.textContent = '⋯';

  const popup = document.createElement('ty-popup');
  popup.setAttribute('placement', 'bottom');

  const menu = document.createElement('div');
  menu.className = 'tab-overflow-menu';
  menu.setAttribute('role', 'menu');

  allTabs.forEach((tab) => {
    const tabId = getTabId(tab);
    if (!tabId) return;

    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'tab-overflow-item';
    item.setAttribute('role', 'menuitem');
    item.setAttribute('data-tab-id', tabId);
    item.setAttribute('data-active', String(tabId === activeId));
    item.textContent = getTabMenuLabel(el, tab);
    if (isTabDisabled(tab)) {
      item.disabled = true;
    } else {
      item.addEventListener('click', () => {
        activateTab(el, tabId);
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
 * Tabs never collapse: the strip scrolls horizontally (scrollbar hidden) and
 * activating a tab glides it into view. This only decides whether the "…"
 * jump menu is needed — shown when the strip actually overflows. scrollWidth/
 * clientWidth are both integer-rounded the same way, so summing fractional
 * button widths (the old false-positive "…" with room to spare) can't happen.
 */
function updateOverflow(el: TyTabs): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  const container = shadowRoot.querySelector<HTMLElement>('.tab-buttons');
  const strip = shadowRoot.querySelector<HTMLElement>('.tab-strip');
  if (!container || !strip) return;

  // Fixed tabs divide the bar between them, so there is nothing to overflow,
  // nothing to scroll and nothing to fade. Leave the strip unclipped so a
  // custom marker's shadow can breathe.
  if (getTabsAttributes(el).fixed) {
    removeOverflowMenu(shadowRoot);
    strip.classList.add('unclipped');
    strip.style.removeProperty('--fade-left');
    strip.style.removeProperty('--fade-right');
    return;
  }

  // Taking the trigger away widens the strip, so the browser clamps scrollLeft
  // down by the trigger's width — and putting the trigger back does NOT undo
  // that. Since this runs on every activation, the loss showed up as the strip
  // jerking ~52px toward the start and gliding back. Restore it once the layout
  // has settled, below.
  const savedScrollLeft = strip.scrollLeft;
  removeOverflowMenu(shadowRoot);

  // A zero measurement means the element is display:none or mid-layout —
  // we can't know whether it overflows, so leave the trigger off.
  if (strip.clientWidth <= 0) return;

  // Content extent comes from the buttons, not scrollWidth: an unclipped strip
  // has no scrolling box, so scrollWidth would just echo clientWidth and we'd
  // never notice it started overflowing again.
  const buttons = strip.querySelectorAll<HTMLElement>('.tab-button');
  const last = buttons[buttons.length - 1];
  const contentWidth = last ? last.offsetLeft + last.offsetWidth : 0;
  const stripWidth = strip.clientWidth;
  const hidden = contentWidth - stripWidth;

  // Clipping the strip is what cuts a custom marker's box-shadow off, so only
  // clip when the tabs actually need to scroll.
  strip.classList.toggle('unclipped', hidden <= 1);

  if (hidden <= 1) { // everything fits
    strip.scrollLeft = savedScrollLeft;
    updateEdgeFades(strip);
    return;
  }

  renderOverflowMenu(el, container, getChildTabs(el));

  // The trigger pays for itself out of the strip's width. When the tabs
  // overflowed by less than it costs, adding it hides MORE than it reveals —
  // the sliver that was one small scroll away is now a whole tab plus the
  // trigger's own footprint. Measure what it actually took and back out.
  const triggerCost = container.clientWidth - strip.clientWidth;
  if (hidden <= triggerCost) {
    removeOverflowMenu(shadowRoot);
  }

  strip.scrollLeft = savedScrollLeft;
  updateEdgeFades(strip);
}

/**
 * Fade the strip's edges where more tabs continue past them — left fade when
 * scrolled away from the start, right fade while there's content beyond the
 * viewport. Driven by --fade-left/right consumed by the strip's mask-image.
 */
function updateEdgeFades(strip: HTMLElement): void {
  const maxScroll = strip.scrollWidth - strip.clientWidth;
  // Never fade more than is actually hidden: a full 28px veil over a 4px
  // sliver of overflow obscures far more than it hints at.
  const fade = (distance: number) => `${distance > 1 ? Math.min(28, distance) : 0}px`;
  strip.style.setProperty('--fade-left', fade(strip.scrollLeft));
  strip.style.setProperty('--fade-right', fade(maxScroll - strip.scrollLeft));
}

/**
 * Center the active tab button in the strip, clamped at both ends. With tabs
 * [1..6] and 4 visible: activating 3 shows [2,3,4,5]; activating 5 wants
 * [4,5,…] but clamps at the right edge, showing [3,4,5,6]. The recenter
 * motion itself is the "more tabs over here" affordance. Smooth on
 * user-driven activation, instant on first render / resize.
 */
function scrollActiveIntoView(el: TyTabs, activeId: string, smooth: boolean): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  const strip = shadowRoot.querySelector<HTMLElement>('.tab-strip');
  const button = shadowRoot.querySelector<HTMLElement>(`[data-tab-id='${activeId}']`);
  if (!strip || !button || strip.clientWidth <= 0) return;

  const centered = button.offsetLeft + button.offsetWidth / 2 - strip.clientWidth / 2;
  const target = Math.max(0, Math.min(centered, strip.scrollWidth - strip.clientWidth));

  if (Math.round(target) !== Math.round(strip.scrollLeft)) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    strip.scrollTo({ left: target, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }
}

/**
 * Render the tabs container with buttons and panel viewport.
 * Smart rendering: checks if structure exists and only updates when needed.
 */
function render(el: TyTabs): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;
  
  const { placement, fixed } = getTabsAttributes(el);
  const tabs = getChildTabs(el);
  const activeId = getActiveTabId(el, tabs);
  const activeIndex = activeId ? (findTabIndex(tabs, activeId) ?? 0) : 0;

  // Each <ty-tab> IS its tabpanel — role + accessible name sit on its shadow
  // .tab-panel (the focus target), where a morph can't strip them. The name
  // comes from here because rich `label-{id}` slots live on ty-tabs. No
  // aria-controls on the tab BUTTON: ARIA id-references don't resolve across
  // a shadow-tree boundary.
  tabs.forEach((tab) => (tab as any).setPanelLabel?.(getTabMenuLabel(el, tab)));

  const existingContainer = shadowRoot.querySelector('.tabs-container');
  const existingButtons = shadowRoot.querySelector('.tab-buttons');
  const existingStrip = shadowRoot.querySelector<HTMLElement>('.tab-strip');
  const existingViewport = shadowRoot.querySelector('.panels-viewport');

  // Base sheet first: the instance sheet (created by updatePanelInteraction)
  // must come after it.
  ensureStyles(shadowRoot, { css: tabsStyles, id: 'ty-tabs' });

  if (existingContainer && existingButtons && existingStrip && existingViewport) {
    // === SMART UPDATE: Structure exists, only update what changed ===

    existingContainer.setAttribute('data-placement', placement);
    existingContainer.toggleAttribute('data-fixed', fixed);

    // Preserve the marker wrapper; only the buttons are recreated. Removing
    // every button momentarily empties the strip, which clamps its scrollLeft
    // to 0 — capture it first and restore after re-append, so the ensure-
    // visible glide below starts from where the user actually was.
    // Save BEFORE the trigger goes: removing it widens the strip, which clamps
    // scrollLeft down by the trigger's width. Reading it afterwards would save
    // the already-clamped value and "restore" the strip 52px short.
    const savedScrollLeft = existingStrip.scrollLeft;
    existingButtons.querySelector('.tab-overflow-trigger')?.remove();
    const allButtons = existingStrip.querySelectorAll('.tab-button');
    allButtons.forEach(button => button.remove());

    const buttonsHtml = renderButtonsOnly(el, tabs, activeId);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = buttonsHtml;

    Array.from(tempDiv.children).forEach(button => {
      existingStrip.appendChild(button);
    });
    existingStrip.scrollLeft = savedScrollLeft;

    // Re-setup event listeners (buttons were recreated)
    setupEventListeners(el, shadowRoot, tabs);
    updateAriaAttributes(el, shadowRoot, activeId || '');

    // Tabs arriving into an empty ty-tabs: the first one just appears.
    const firstShow = !shownTabs.get(el);
    requestAnimationFrame(() => {
      // Re-read rather than close over render-time values — see the full
      // render branch below for why a stale replay corrupts the state.
      const currentId = currentActive(el);

      // Overflow before marker: inserting/removing the "…" trigger reflows the
      // strip, and the marker must be measured against the final layout.
      updateOverflow(el);

      if (currentId) {
        updateMarker(el, currentId, firstShow);
        scrollActiveIntoView(el, currentId, !firstShow);
      }
    });

    updatePanelInteraction(el, activeId);

  } else {
    // === FULL RENDER: First time or structure missing ===

    shadowRoot.innerHTML = `
      <div class="tabs-container" data-placement="${placement}"${fixed ? ' data-fixed' : ''}>
        ${renderTabButtons(el, tabs, activeId)}
        <div class="panels-viewport" part="panels-container">
          <div class="panels-wrapper" style="transform: ${carouselTransform(activeIndex)}">
            <slot></slot>
          </div>
        </div>
      </div>
    `;

    // Position the marker once layout exists
    requestAnimationFrame(() => {
      // Re-read the shown tab instead of closing over render-time values:
      // `active` can change between render() and this frame (the common
      // "mount, then apply the real active tab" pattern), and syncShownTab
      // has already moved the marker, carousel, aria and panel visibility to
      // the new tab. Replaying the stale tab here drags the marker back to
      // the old tab while everything else stays on the new one.
      const currentId = currentActive(el);

      // Overflow before marker — see the smart-update branch.
      updateOverflow(el);

      if (currentId) {
        updateMarker(el, currentId);
        scrollActiveIntoView(el, currentId, false); // first paint: snap, no glide
      }
    });

    setupEventListeners(el, shadowRoot, tabs);
    updateAriaAttributes(el, shadowRoot, activeId || '');

    // The strip survives smart updates (only buttons are recreated), so one
    // listener per full render is enough. Keeps the edge fades in sync while
    // the user drags/wheels and during the smooth recenter glide.
    const strip = shadowRoot.querySelector<HTMLElement>('.tab-strip');
    strip?.addEventListener('scroll', () => updateEdgeFades(strip), { passive: true });

    updatePanelInteraction(el, activeId);

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
    return ['width', 'height', 'active', 'placement', 'fixed'];
  }
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  private _childObserver: MutationObserver | null = null;
  private _updateQueued = false;
  private _structureDirty = false;

  /** ID of the tab currently shown (`active` may be stale or missing after a morph). */
  get activeTab(): string | null {
    return shownTabs.get(this) ?? null;
  }

  connectedCallback() {
    render(this);
    syncShownTab(this);
    // Here, not in render(): a re-inserted element takes render()'s smart
    // path, and disconnectedCallback has dropped the observer.
    setupResizeObserver(this);

    // Frameworks and server morphs add/remove ty-tab children — the button
    // strip renders from light DOM, so watch it. render() only touches
    // shadow DOM, so no observer feedback loop.
    this._childObserver = new MutationObserver(() => this._queueUpdate(true));
    this._childObserver.observe(this, { childList: true });
  }

  disconnectedCallback() {
    this._childObserver?.disconnect();
    this._childObserver = null;
    cleanup(this);
  }

  /**
   * External changes (`active` set by app or server, children added or
   * removed, a ty-tab's id/label/disabled changed — ty-tab reports those)
   * settle in one microtask: a morph sets attributes and swaps children in
   * one go, and the shown tab must be decided once the whole batch has
   * landed — `active` may name a tab that is appended after it.
   */
  _queueUpdate(structure: boolean): void {
    this._structureDirty ||= structure;
    if (this._updateQueued) return;
    this._updateQueued = true;
    queueMicrotask(() => {
      this._updateQueued = false;
      if (!this.isConnected) return;
      // Child changes made after this was queued are still waiting for their
      // own observer microtask, which would run after this one. Take them now.
      if (this._childObserver?.takeRecords().length) this._structureDirty = true;
      if (this._structureDirty) {
        this._structureDirty = false;
        render(this);
      }
      syncShownTab(this);
    });
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    // Before connect, connectedCallback renders everything at once.
    if (!this.isConnected) return;
    // `active` only moves the shown tab — no re-render: rebuilding the
    // buttons and the "…" trigger momentarily widens the strip and the
    // ensure-visible glide twitches back ~52px.
    if (name === 'active') {
      // A new request replaces the one still waiting for its tab.
      if (oldValue !== newValue) awaitedTabs.delete(this);
      this._queueUpdate(false);
    } else render(this);
  }
}

if (!customElements.get('ty-tabs')) {
  customElements.define('ty-tabs', TyTabs);
}
