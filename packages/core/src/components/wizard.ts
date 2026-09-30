/**
 * Wizard Component — stepper with an inline indicator rail (compact
 * "Step N of M" header in narrow containers), sliding panels (carousel, like
 * ty-tabs), and step completion tracking. Expects `ty-step` children.
 * "Dumb" like ty-tabs: it renders and fires events; all navigation and
 * validation is the consumer's.
 */

import { ensureStyles } from '../utils/styles.js';
import { wizardStyles } from '../styles/wizard.js';

/**
 * Wizard container attributes configuration
 */
export interface WizardAttributes {
  width: string;              // Wizard width (px or %)
  height: string;             // Panel height; empty = tallest step
  active: string | null;      // ID of currently active step
  completed: string;          // Comma-separated IDs of completed steps
  orientation: 'horizontal' | 'vertical'; // Rail on top, or on the left
}

/**
 * Wizard step change event detail
 */
export interface WizardStepChangeDetail {
  activeId: string;           // ID of newly active step
  activeIndex: number;        // Index of newly active step
  previousId: string | null;  // ID of previously active step (null if first render)
  previousIndex: number | null; // Index of previously active step
  direction: 'forward' | 'backward' | 'none'; // Direction of navigation
}

const eventHandlers = new WeakMap<TyWizard, {
  stepClickHandlers: Map<string, (e: Event) => void>;
}>();

function getWizardAttributes(el: TyWizard): WizardAttributes {
  return {
    width: el.getAttribute('width') || '100%',
    height: el.getAttribute('height') || '',
    active: el.getAttribute('active'),
    completed: el.getAttribute('completed') || '',
    orientation: (el.getAttribute('orientation') || 'horizontal') as 'horizontal' | 'vertical',
  };
}

function getChildSteps(el: TyWizard): HTMLElement[] {
  return Array.from(el.querySelectorAll('ty-step'));
}

function getStepId(step: HTMLElement): string | null {
  return step.getAttribute('id');
}

function getCompletedStepIds(el: TyWizard): Set<string> {
  const completedAttr = el.getAttribute('completed') || '';
  if (!completedAttr.trim()) return new Set();
  return new Set(completedAttr.split(',').map(id => id.trim()).filter(Boolean));
}

/**
 * Check if wizard has a direct child indicator slot for this step-id.
 * Looks in ty-wizard's light DOM for slot='indicator-{step-id}' elements.
 */
function hasCustomIndicator(wizardEl: TyWizard, stepId: string): boolean {
  return wizardEl.querySelector(`[slot='indicator-${stepId}']`) !== null;
}

function isStepDisabled(step: HTMLElement): boolean {
  return step.hasAttribute('disabled');
}

function findStepIndex(steps: HTMLElement[], stepId: string): number | undefined {
  const index = steps.findIndex(step => getStepId(step) === stepId);
  return index >= 0 ? index : undefined;
}

/** Active step ID, defaulting to the first step if not specified. */
function getActiveStepId(el: TyWizard, steps: HTMLElement[]): string | null {
  const activeAttr = el.getAttribute('active');

  if (activeAttr && findStepIndex(steps, activeAttr) !== undefined) {
    return activeAttr;
  }

  // Default to first step
  if (steps.length > 0) {
    return getStepId(steps[0]);
  }

  return null;
}

function setActiveStep(el: TyWizard, stepId: string): void {
  el.setAttribute('active', stepId);
}

function dispatchStepChangeEvent(
  el: TyWizard,
  activeId: string,
  activeIndex: number,
  previousId: string | null,
  previousIndex: number | null
): void {
  const direction = previousIndex === null ? 'none'
    : activeIndex > previousIndex ? 'forward'
    : activeIndex < previousIndex ? 'backward'
    : 'none';

  const event = new CustomEvent<WizardStepChangeDetail>('ty-wizard-step-change', {
    detail: {
      activeId,
      activeIndex,
      previousId,
      previousIndex,
      direction,
    },
    bubbles: true,
    cancelable: false,
  });
  el.dispatchEvent(event);
}

/** Step indicator click — only dispatches an event; it never navigates. */
function handleStepClick(el: TyWizard, stepId: string, event: Event): void {
  event.preventDefault();
  event.stopPropagation();

  const steps = getChildSteps(el);
  const targetIndex = steps.findIndex(s => getStepId(s) === stepId);
  if (targetIndex < 0) return;

  const currentActive = getActiveStepId(el, steps);
  const currentIndex = currentActive ? findStepIndex(steps, currentActive) ?? null : null;

  // Just dispatch event - user handles the actual navigation
  const direction = currentIndex === null ? 'none'
    : targetIndex > currentIndex ? 'forward'
    : targetIndex < currentIndex ? 'backward'
    : 'none';

  const event2 = new CustomEvent<WizardStepChangeDetail>('ty-wizard-step-change', {
    detail: {
      activeId: stepId,
      activeIndex: targetIndex,
      previousId: currentActive,
      previousIndex: currentIndex,
      direction,
    },
    bubbles: true,
    cancelable: false,
  });
  el.dispatchEvent(event2);
}

function cleanupEventListeners(el: TyWizard): void {
  const handlers = eventHandlers.get(el);
  if (!handlers) return;

  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  handlers.stepClickHandlers.forEach((handler, stepId) => {
    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-step-id='${stepId}']`);
    if (button) {
      button.removeEventListener('pointerdown', handler);
      button.removeEventListener('click', handler);
    }
  });

  handlers.stepClickHandlers.clear();
}

function setupEventListeners(el: TyWizard, shadowRoot: ShadowRoot, steps: HTMLElement[]): void {
  cleanupEventListeners(el);

  const handlers = {
    stepClickHandlers: new Map<string, (e: Event) => void>(),
  };

  steps.forEach((step) => {
    const stepId = getStepId(step);
    if (!stepId) return;

    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-step-id='${stepId}']`);
    if (button) {
      // pointerdown for pointers; click only when it came from the keyboard
      // (Enter/Space report detail 0), so a mouse click doesn't fire twice.
      const handler = (e: Event) => {
        if (e.type === 'click' && (e as MouseEvent).detail !== 0) return;
        handleStepClick(el, stepId, e);
      };
      button.addEventListener('pointerdown', handler);
      button.addEventListener('click', handler);
      handlers.stepClickHandlers.set(stepId, handler);
    }
  });

  eventHandlers.set(el, handlers);
}

/** Update ARIA/state attributes on step indicators without re-rendering. */
function updateStepIndicators(el: TyWizard, shadowRoot: ShadowRoot, activeId: string): void {
  const steps = getChildSteps(el);
  const completedIds = getCompletedStepIds(el);
  steps.forEach((step) => {
    const stepId = getStepId(step);
    if (!stepId) return;

    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-step-id='${stepId}']`);
    const circle = shadowRoot.querySelector<HTMLElement>(`[data-step-id='${stepId}'] .step-circle`);
    const isActive = stepId === activeId;

    if (button) {
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
      button.setAttribute('data-active', String(isActive));
    }

    // Same status logic as rendering (respects the step's status attribute)
    const state = getStepStatus(step, stepId, activeId, completedIds);
    button?.setAttribute('data-state', state);
    circle?.setAttribute('data-state', state);

    const slottedIndicator = el.querySelector(`[slot='indicator-${stepId}']`);
    if (slottedIndicator) {
      slottedIndicator.setAttribute('data-active', String(isActive));
    }
  });
}

/** Mark the active panel. data-active hides off-screen steps (wizard CSS) and
 *  framework conditional rendering. */
function updatePanelInteraction(el: TyWizard, activeId: string): void {
  getChildSteps(el).forEach((step) => {
    const stepId = getStepId(step);
    if (!stepId) return;
    step.setAttribute('data-active', String(stepId === activeId));
  });
}

/**
 * Update only the active step state without re-rendering DOM.
 * This is called when only the active or completed attribute changes.
 */
function updateActiveStepState(el: TyWizard, stepId: string): void {
  const steps = getChildSteps(el);
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  const currentActive = getActiveStepId(el, steps);
  const currentIndex = currentActive ? findStepIndex(steps, currentActive) : undefined;
  const newIndex = findStepIndex(steps, stepId);

  // Only update if different step and valid
  if (currentActive === stepId || newIndex === undefined) return;

  el.style.setProperty('--ty-wizard-active-index', String(newIndex));
  updateStepIndicators(el, shadowRoot, stepId);
  updatePanelInteraction(el, stepId);

  // Reset scroll position of new active panel
  const newPanel = steps[newIndex] as any;
  if (newPanel?.resetScroll) {
    newPanel.resetScroll();
  }

  dispatchStepChangeEvent(
    el,
    stepId,
    newIndex,
    currentActive,
    currentIndex ?? null
  );
}

/** Step status: the explicit `status` attribute wins, otherwise it's derived. */
function getStepStatus(step: HTMLElement, stepId: string, activeId: string | null, completedIds: Set<string>): string {
  const explicitStatus = step.getAttribute('status');
  if (explicitStatus && ['completed', 'active', 'pending', 'error'].includes(explicitStatus)) {
    return explicitStatus;
  }

  const isActive = stepId === activeId;
  const isCompleted = completedIds.has(stepId);
  // Active wins: revisiting a finished step shows where you are.
  return isActive ? 'active' : isCompleted ? 'completed' : 'pending';
}

const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const ALERT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="13"></line><line x1="12" y1="18.5" x2="12" y2="18.6"></line></svg>`;

const STATE_TEXT: Record<string, string> = {
  completed: 'completed',
  active: 'current',
  pending: 'not started',
  error: 'has an error',
};

function renderStepIndicators(wizardEl: TyWizard, steps: HTMLElement[], activeId: string | null, completedIds: Set<string>): string {
  const total = steps.length;
  const activeIndex = Math.max(0, activeId ? steps.findIndex(s => getStepId(s) === activeId) : 0);

  const indicators = steps.map((step, index) => {
    const stepId = getStepId(step);
    if (!stepId) return '';

    const label = step.getAttribute('label') || `Step ${index + 1}`;
    const description = step.getAttribute('description') || '';
    const disabled = isStepDisabled(step);
    const isActive = stepId === activeId;
    const state = getStepStatus(step, stepId, activeId, completedIds);

    const circleContent = hasCustomIndicator(wizardEl, stepId)
      ? `<slot name="indicator-${stepId}"></slot>`
      : state === 'completed' ? CHECK_SVG
      : state === 'error' ? ALERT_SVG
      : `<span aria-hidden="true">${index + 1}</span>`;

    // No aria-controls: the button lives in shadow DOM, the panel (<ty-step>)
    // is light DOM — ARIA id-references don't resolve across a shadow-tree
    // boundary. role=tab + aria-selected here, aria-labelledby on the step.
    // The connector to the next step is this button's ::after, so the
    // tablist owns nothing but tabs.
    return `<button
      class="step-indicator"
      role="tab"
      type="button"
      data-step-id="${stepId}"
      id="step-${stepId}"
      data-state="${state}"
      data-done="${state === 'completed' || (state === 'active' && completedIds.has(stepId))}"
      aria-selected="${isActive}"
      tabindex="${isActive ? '0' : '-1'}"
      data-active="${isActive}"
      ${disabled ? 'disabled aria-disabled="true"' : ''}
    >
      <span class="step-circle" data-state="${state}" part="step-circle">${circleContent}</span>
      <span class="step-text">
        <span class="step-label">${label}</span>
        ${description ? `<span class="step-description">${description}</span>` : ''}
        <span class="sr-only">, step ${index + 1} of ${total}, ${STATE_TEXT[state] ?? state}</span>
      </span>
    </button>`;
  }).join('');

  // Compact header for narrow containers: "Step N of M · Label" + segments.
  const active = steps[activeIndex];
  const activeLabel = active ? (active.getAttribute('label') || `Step ${activeIndex + 1}`) : '';
  const activeDescription = active?.getAttribute('description') || '';
  const segments = steps.map((step) => {
    const stepId = getStepId(step) || '';
    return `<span class="compact-segment" data-state="${getStepStatus(step, stepId, activeId, completedIds)}"></span>`;
  }).join('');

  return `
    <div class="step-indicators-wrapper" part="indicators-wrapper">
      <div class="step-indicators" role="tablist" aria-label="Steps">
        ${indicators}
      </div>
      <div class="step-compact">
        <div class="compact-top">
          <span class="compact-where">
            <span class="compact-count">Step ${total ? activeIndex + 1 : 0} of ${total}</span>
            <span class="compact-label">${activeLabel}</span>
          </span>
          ${activeDescription ? `<span class="compact-description">${activeDescription}</span>` : ''}
        </div>
        <div class="compact-segments" part="progress">${segments}</div>
      </div>
    </div>
  `;
}

/**
 * Render the wizard container with step indicators and panel viewport.
 * The indicator strip is rebuilt on every render; the panel viewport (and its
 * slot) is created once.
 */
function render(el: TyWizard): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  const { width, height } = getWizardAttributes(el);
  const steps = getChildSteps(el);
  const activeId = getActiveStepId(el, steps);
  const completedIds = getCompletedStepIds(el);

  // Each <ty-step> IS its tabpanel (single catch-all <slot> in the viewport)
  // — same pattern and rationale as ty-tabs.
  steps.forEach((step) => {
    const stepId = getStepId(step);
    if (!stepId) return;
    step.setAttribute('role', 'tabpanel');
    step.setAttribute('aria-labelledby', `step-${stepId}`);
    step.setAttribute('tabindex', '0');
  });

  ensureStyles(shadowRoot, { css: wizardStyles, id: 'ty-wizard' });

  el.style.setProperty('--ty-wizard-width', width);
  el.style.setProperty('--ty-wizard-active-index', String(Math.max(0, activeId ? steps.findIndex(s => getStepId(s) === activeId) : 0)));
  // height sizes the panels only; unset = the tallest step.
  if (height) el.style.setProperty('--ty-wizard-panel-height', height);
  else el.style.removeProperty('--ty-wizard-panel-height');

  let container = shadowRoot.querySelector('.wizard-container');
  let viewport = shadowRoot.querySelector('.panels-viewport');

  if (!container || !viewport) {
    shadowRoot.innerHTML = `
      <div class="wizard-container">
        <div class="panels-viewport" part="panels-container">
          <div class="panels-wrapper">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
    container = shadowRoot.querySelector('.wizard-container')!;
    viewport = shadowRoot.querySelector('.panels-viewport')!;
  }

  shadowRoot.querySelector('.step-indicators-wrapper')?.remove();
  const tmp = document.createElement('div');
  tmp.innerHTML = renderStepIndicators(el, steps, activeId, completedIds);
  container.insertBefore(tmp.firstElementChild!, viewport);

  setupEventListeners(el, shadowRoot, steps);
  updateStepIndicators(el, shadowRoot, activeId || '');
  if (activeId) updatePanelInteraction(el, activeId);

  if (!resizeObservers.has(el)) {
    const ro = new ResizeObserver(() => updateCompact(el));
    ro.observe(el);
    resizeObservers.set(el, ro);
    // Label widths change once web fonts arrive; the host size doesn't.
    document.fonts?.ready.then(() => el.isConnected && updateCompact(el));
  }
  updateCompact(el);
}

/**
 * Collapse to the compact header when the rail doesn't fit: its natural
 * width (circles + full label text + minimum connectors) exceeds the header's
 * content box. Vertical wizards collapse under 360px, where rail + panel
 * side by side get cramped.
 */
function updateCompact(el: TyWizard): void {
  const shadowRoot = el.shadowRoot;
  const container = shadowRoot?.querySelector<HTMLElement>('.wizard-container');
  const wrapper = shadowRoot?.querySelector<HTMLElement>('.step-indicators-wrapper');
  const rail = shadowRoot?.querySelector<HTMLElement>('.step-indicators');
  if (!container || !wrapper || !rail) return;

  let compact: boolean;
  if (el.getAttribute('orientation') === 'vertical') {
    compact = el.clientWidth < 360;
  } else {
    // Sum the parts: flex intrinsic sizing with flex-basis 0 undercounts.
    // Labels are overflow:hidden, so scrollWidth is their full text width.
    const buttons = Array.from(rail.querySelectorAll<HTMLElement>('.step-indicator'));
    const px = (v: string) => parseFloat(v) || 0;
    let natural = px(getComputedStyle(rail).columnGap) * Math.max(0, buttons.length - 1);
    buttons.forEach((b, i) => {
      const circle = b.querySelector<HTMLElement>('.step-circle');
      const texts = Array.from(b.querySelectorAll<HTMLElement>('.step-label, .step-description'));
      natural += (circle?.offsetWidth ?? 0) + px(getComputedStyle(b).columnGap)
        + Math.max(0, ...texts.map((t) => t.scrollWidth));
      if (i < buttons.length - 1) {
        const after = getComputedStyle(b, '::after');
        natural += px(getComputedStyle(b).columnGap) + px(after.minWidth) + px(after.marginLeft);
      }
    });
    const cs = getComputedStyle(wrapper);
    const available = wrapper.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    compact = natural > available + 0.5;
  }
  container.classList.toggle('compact', compact);
}

const resizeObservers = new WeakMap<TyWizard, ResizeObserver>();

function cleanup(el: TyWizard): void {
  cleanupEventListeners(el);
  resizeObservers.get(el)?.disconnect();
  resizeObservers.delete(el);
}

/**
 * TyWizard Web Component
 */
export class TyWizard extends HTMLElement {
  static get observedAttributes() {
    return ['width', 'height', 'active', 'completed', 'orientation'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  private _childObserver: MutationObserver | null = null;
  private _childRenderQueued = false;

  connectedCallback() {
    render(this);

    // Frameworks add/remove ty-step children dynamically — the indicator
    // strip renders from light DOM, so watch it. Batched on a microtask;
    // render() only touches shadow DOM, so no observer feedback loop.
    this._childObserver = new MutationObserver((records) => {
      // Re-render for added/removed steps, and for attribute changes on a
      // direct ty-step child (status/label/description/disabled) — frameworks
      // may update a step's status after the wizard's own active/completed,
      // which left a stale indicator (e.g. an error X on a completed step).
      const relevant = records.some((r) =>
        (r.type === 'childList' && r.target === this) ||
        ((r.target as Element).tagName === 'TY-STEP' && (r.target as Element).parentElement === this));
      if (!relevant || this._childRenderQueued) return;
      this._childRenderQueued = true;
      queueMicrotask(() => {
        this._childRenderQueued = false;
        if (this.isConnected) render(this);
      });
    });
    this._childObserver.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['status', 'label', 'description', 'disabled'],
    });
  }

  disconnectedCallback() {
    this._childObserver?.disconnect();
    this._childObserver = null;
    cleanup(this);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    // Smart rendering: only full render when structural attributes change
    if (name === 'active') {
      if (newValue) {
        updateActiveStepState(this, newValue);
      }
      // Always call render after active change to update indicator states
      render(this);
    } else if (name === 'completed') {
      render(this);
    } else {
      render(this);
    }
  }
}

// Register the custom element
if (!customElements.get('ty-wizard')) {
  customElements.define('ty-wizard', TyWizard);
}
