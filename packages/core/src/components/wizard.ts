/**
 * Wizard Component
 *
 * A carousel-based wizard/stepper component with smooth animations, progress tracking, and completion state.
 * Features horizontal sliding transitions between steps, animated progress line, and step completion tracking.
 * Behaves like tabs - a "dumb" component that only renders and fires events. All navigation and validation
 * is controlled by the user.
 *
 * Features:
 * - Carousel animation with smooth sliding transitions between steps
 * - Fixed dimensions prevent layout shift between steps
 * - Animated progress line showing completion status
 * - Step indicators with completed/active/pending states
 * - Rich indicator support via slots (icons, custom content)
 * - Independent panel scrolling with scroll position reset
 * - ResizeObserver for responsive percentage widths
 * - Smart rendering - only updates DOM when necessary
 * - Accessibility with ARIA roles and attributes
 * - Fires events on step clicks - user controls navigation
 *
 * @example
 * <!-- Basic wizard with text labels -->
 * <ty-wizard width="900px" height="600px" active="welcome">
 *   <ty-step id="welcome" label="Welcome">
 *     <div class="p-6">
 *       <h1>Welcome!</h1>
 *       <button onclick="goToStep('account')">Next</button>
 *     </div>
 *   </ty-step>
 *   <ty-step id="account" label="Account Setup">
 *     <div class="p-6">
 *       <h2>Account Setup</h2>
 *       <button onclick="goToStep('welcome')">Previous</button>
 *       <button onclick="goToStep('complete')">Next</button>
 *     </div>
 *   </ty-step>
 * </ty-wizard>
 *
 * @example
 * <!-- Wizard with custom indicators -->
 * <ty-wizard width="100%" height="700px" active="welcome" completed="welcome,account">
 *   <!-- Custom indicator icons -->
 *   <div slot="indicator-welcome">
 *     <ty-icon name="hand" size="sm"></ty-icon>
 *   </div>
 *   <div slot="indicator-account">
 *     <span class="text-lg font-bold">1</span>
 *   </div>
 *
 *   <ty-step id="welcome" label="Welcome">...</ty-step>
 *   <ty-step id="account" label="Account">...</ty-step>
 *   <ty-step id="profile" label="Profile">...</ty-step>
 * </ty-wizard>
 */

import { ensureStyles } from '../utils/styles.js';
import { wizardStyles } from '../styles/wizard.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Wizard container attributes configuration
 */
export interface WizardAttributes {
  width: string;              // Content area width (accepts px or %)
  height: string;             // Total container height including step indicators
  active: string | null;      // ID of currently active step
  completed: string;          // Comma-separated IDs of completed steps
  orientation: 'horizontal' | 'vertical'; // Step indicator layout (horizontal only for now)
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

// ============================================================================
// WeakMaps for State Management
// ============================================================================

const eventHandlers = new WeakMap<TyWizard, {
  stepClickHandlers: Map<string, (e: Event) => void>;
}>();

const resizeObservers = new WeakMap<TyWizard, ResizeObserver>();

// ============================================================================
// Helper Functions - Attribute Parsing
// ============================================================================

/**
 * Extract wizard configuration from element attributes
 */
function getWizardAttributes(el: TyWizard): WizardAttributes {
  return {
    width: el.getAttribute('width') || '100%',
    height: el.getAttribute('height') || '700px',
    active: el.getAttribute('active'),
    completed: el.getAttribute('completed') || '',
    orientation: (el.getAttribute('orientation') || 'horizontal') as 'horizontal' | 'vertical',
  };
}

/**
 * Get all ty-step child elements
 */
function getChildSteps(el: TyWizard): HTMLElement[] {
  return Array.from(el.querySelectorAll('ty-step'));
}

/**
 * Get ID from a ty-step element
 */
function getStepId(step: HTMLElement): string | null {
  return step.getAttribute('id');
}

/**
 * Get completed step IDs as a Set
 */
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

/**
 * Check if step is disabled
 */
function isStepDisabled(step: HTMLElement): boolean {
  return step.hasAttribute('disabled');
}

// ============================================================================
// Helper Functions - Active Step Management
// ============================================================================

/**
 * Find index of step with given ID
 */
function findStepIndex(steps: HTMLElement[], stepId: string): number | undefined {
  const index = steps.findIndex(step => getStepId(step) === stepId);
  return index >= 0 ? index : undefined;
}

/**
 * Get the active step ID, defaulting to first step if not specified
 */
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

/**
 * Set the active step by ID
 */
function setActiveStep(el: TyWizard, stepId: string): void {
  el.setAttribute('active', stepId);
}

/**
 * Calculate progress percentage for the progress line overlay
 */
function calculateProgressPercent(
  steps: HTMLElement[],
  activeId: string | null,
  completedIds: Set<string>
): number {
  if (steps.length <= 1 || !activeId) return 0;

  const activeIndex = steps.findIndex(s => getStepId(s) === activeId);

  // Progress bar shows progress up to the currently active step
  return (activeIndex / (steps.length - 1)) * 100;
}

/**
 * Dispatch ty-wizard-step-change event
 */
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

// ============================================================================
// Event Handlers - Step Indicator Click
// ============================================================================

/**
 * Handle step indicator click - only dispatch event (like tabs)
 */
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

/**
 * Cleanup existing event listeners
 */
function cleanupEventListeners(el: TyWizard): void {
  const handlers = eventHandlers.get(el);
  if (!handlers) return;

  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  // Remove all step click handlers
  handlers.stepClickHandlers.forEach((handler, stepId) => {
    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-step-id='${stepId}']`);
    if (button) {
      button.removeEventListener('pointerdown', handler);
    }
  });

  handlers.stepClickHandlers.clear();
}

/**
 * Setup event listeners for step indicator clicks
 */
function setupEventListeners(el: TyWizard, shadowRoot: ShadowRoot, steps: HTMLElement[]): void {
  // Clean up any existing listeners first
  cleanupEventListeners(el);

  // Initialize handlers storage
  const handlers = {
    stepClickHandlers: new Map<string, (e: Event) => void>(),
  };

  // Add click listener for each step indicator
  steps.forEach((step) => {
    const stepId = getStepId(step);
    if (!stepId) return;

    const button = shadowRoot.querySelector<HTMLButtonElement>(`[data-step-id='${stepId}']`);
    if (button) {
      const handler = (e: Event) => handleStepClick(el, stepId, e);
      button.addEventListener('pointerdown', handler);
      handlers.stepClickHandlers.set(stepId, handler);
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
function updateTransform(el: TyWizard, activeIndex: number): void {
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
 * Update progress line overlay width
 */
function updateProgressLine(el: TyWizard): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  const progressOverlay = shadowRoot.querySelector<HTMLElement>('.progress-overlay');
  if (!progressOverlay) return;

  const steps = getChildSteps(el);
  const activeId = getActiveStepId(el, steps);
  const completedIds = getCompletedStepIds(el);

  const progressPercent = calculateProgressPercent(steps, activeId, completedIds);
  progressOverlay.style.width = `${progressPercent}%`;
}

/**
 * Update ARIA attributes on step indicators without re-rendering
 */
function updateStepIndicators(el: TyWizard, shadowRoot: ShadowRoot, activeId: string): void {
  const steps = getChildSteps(el);
  const completedIds = getCompletedStepIds(el);
  const activeIndex = activeId ? steps.findIndex(s => getStepId(s) === activeId) : 0;

  steps.forEach((step, index) => {
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

    if (circle) {
      // Use same status logic as rendering (respects user's status attribute)
      const state = getStepStatus(step, stepId, activeId, completedIds);
      circle.setAttribute('data-state', state);
    }

    // Also set data-active on the slotted indicator element in light DOM
    const slottedIndicator = el.querySelector(`[slot='indicator-${stepId}']`);
    if (slottedIndicator) {
      slottedIndicator.setAttribute('data-active', String(isActive));
    }
  });
}

/**
 * Update pointer-events, opacity, and data-active on step panels without re-rendering
 */
function updatePanelInteraction(el: TyWizard, activeId: string): void {
  const steps = getChildSteps(el);

  steps.forEach((step) => {
    const stepId = getStepId(step);
    if (!stepId) return;

    const isActive = stepId === activeId;

    // Set data-active attribute for framework conditional rendering
    step.setAttribute('data-active', String(isActive));

    if (isActive) {
      (step as HTMLElement).style.pointerEvents = 'auto';
      (step as HTMLElement).style.opacity = '1';
    } else {
      (step as HTMLElement).style.pointerEvents = 'none';
      (step as HTMLElement).style.opacity = '0';
    }
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

  // Update CSS variable for transform
  el.style.setProperty('--ty-wizard-active-index', String(newIndex));

  // Update transform directly
  updateTransform(el, newIndex);

  // Update step indicator states (visual + ARIA)
  updateStepIndicators(el, shadowRoot, stepId);

  // Update progress line overlay
  updateProgressLine(el);

  // Update pointer-events on panels
  updatePanelInteraction(el, stepId);

  // Reset scroll position of new active panel
  const newPanel = steps[newIndex] as any;
  if (newPanel?.resetScroll) {
    newPanel.resetScroll();
  }

  // Dispatch change event
  dispatchStepChangeEvent(
    el,
    stepId,
    newIndex,
    currentActive,
    currentIndex ?? null
  );
}

// ============================================================================
// ResizeObserver for Responsive Width
// ============================================================================

/**
 * Setup ResizeObserver for percentage widths
 */
function setupResizeObserver(el: TyWizard): void {
  // Clean up old observer
  const oldObserver = resizeObservers.get(el);
  if (oldObserver) {
    oldObserver.disconnect();
  }

  const { width } = getWizardAttributes(el);

  // Only setup observer for percentage widths
  if (width.includes('%')) {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const measuredWidth = entry.contentRect.width;
      const steps = getChildSteps(el);
      const activeId = getActiveStepId(el, steps);
      const activeIndex = activeId ? findStepIndex(steps, activeId) : 0;

      // Update CSS variable with measured width
      el.style.setProperty('--ty-wizard-width', `${measuredWidth}px`);

      // Update transform with new width
      if (activeIndex !== undefined) {
        updateTransform(el, activeIndex);
      }
    });

    observer.observe(el);
    resizeObservers.set(el, observer);
  }
}

/**
 * Cleanup ResizeObserver
 */
function cleanupResizeObserver(el: TyWizard): void {
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
 * Get step status - use user's explicit status attribute or fall back to automatic detection
 */
function getStepStatus(step: HTMLElement, stepId: string, activeId: string | null, completedIds: Set<string>): string {
  // Check if user provided explicit status
  const explicitStatus = step.getAttribute('status');
  if (explicitStatus && ['completed', 'active', 'pending', 'error'].includes(explicitStatus)) {
    return explicitStatus;
  }

  // Fall back to automatic detection
  const isActive = stepId === activeId;
  const isCompleted = completedIds.has(stepId);
  return isCompleted ? 'completed' : isActive ? 'active' : 'pending';
}

/**
 * Generate HTML for step indicators with progress line
 */
function renderStepIndicators(wizardEl: TyWizard, steps: HTMLElement[], activeId: string | null, completedIds: Set<string>): string {
  const activeIndex = activeId ? steps.findIndex(s => getStepId(s) === activeId) : 0;

  const indicators = steps.map((step, index) => {
    const stepId = getStepId(step);
    if (!stepId) return '';

    const label = step.getAttribute('label') || `Step ${index + 1}`;
    const description = step.getAttribute('description') || '';
    const disabled = isStepDisabled(step);
    const isActive = stepId === activeId;
    const hasCustom = hasCustomIndicator(wizardEl, stepId);

    // User can override status via attribute
    const state = getStepStatus(step, stepId, activeId, completedIds);

    // Icon content varies by state
    let circleContent = '';
    if (hasCustom) {
      circleContent = `<slot name="indicator-${stepId}"></slot>`;
    } else if (state === 'completed') {
      // Checkmark for completed
      circleContent = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (state === 'error') {
      // X icon for error
      circleContent = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    } else {
      // Number for active/pending
      circleContent = `<span style="font-size: 12px; font-weight: 700;">${index + 1}</span>`;
    }

    return `<button
      class="step-indicator"
      role="tab"
      data-step-id="${stepId}"
      id="step-${stepId}"
      aria-controls="panel-${stepId}"
      aria-selected="${isActive}"
      tabindex="${isActive ? '0' : '-1'}"
      data-active="${isActive}"
      ${disabled ? 'disabled aria-disabled="true"' : ''}
    >
      <div class="step-circle" data-state="${state}" part="step-circle">
        ${circleContent}
      </div>
      <div class="step-text">
        <span class="step-label">${label}</span>
        ${description ? `<span class="step-description">${description}</span>` : ''}
      </div>
    </button>`;
  }).join('');

  const progressPercent = calculateProgressPercent(steps, activeId, completedIds);

  const stepCount = steps.length;

  return `
    <div class="step-indicators-wrapper" part="indicators-wrapper">
      <div class="step-indicators" style="--ty-wizard-step-count: ${stepCount}">
        <div class="progress-line" part="progress-line" role="progressbar" aria-valuenow="${Math.round(progressPercent)}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-overlay" style="width: ${progressPercent}%"></div>
        </div>
        ${indicators}
      </div>
    </div>
  `;
}

/**
 * Render the wizard container with step indicators and panel viewport.
 * Smart rendering: checks if structure exists and only updates when needed.
 */
function render(el: TyWizard): void {
  const shadowRoot = el.shadowRoot;
  if (!shadowRoot) return;

  const { width, height } = getWizardAttributes(el);
  const steps = getChildSteps(el);
  const activeId = getActiveStepId(el, steps);
  const activeIndex = activeId ? (findStepIndex(steps, activeId) ?? 0) : 0;
  const completedIds = getCompletedStepIds(el);

  // Check if structure already exists
  const existingContainer = shadowRoot.querySelector('.wizard-container');
  const existingIndicators = shadowRoot.querySelector('.step-indicators-wrapper');
  const existingViewport = shadowRoot.querySelector('.panels-viewport');

  // Ensure styles are loaded
  ensureStyles(shadowRoot, { css: wizardStyles, id: 'ty-wizard' });

  // Set CSS variables for dimensions and step count
  el.style.setProperty('--ty-wizard-width', width.includes('%') ? '100%' : width);
  el.style.setProperty('--ty-wizard-height', height);
  el.style.setProperty('--ty-wizard-active-index', String(activeIndex));
  el.style.setProperty('--ty-wizard-step-count', String(steps.length));

  if (existingContainer && existingIndicators && existingViewport) {
    // === SMART UPDATE: Structure exists, only update what changed ===

    // Remove old indicators and replace
    existingIndicators.remove();
    const newIndicatorsHtml = renderStepIndicators(el, steps, activeId, completedIds);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newIndicatorsHtml;
    existingContainer.insertBefore(tempDiv.firstElementChild!, existingViewport);

    // Re-setup event listeners (indicators were recreated)
    setupEventListeners(el, shadowRoot, steps);

    // Update ARIA and data-active attributes
    updateStepIndicators(el, shadowRoot, activeId || '');

    // Measure indicators height
    requestAnimationFrame(() => {
      const indicators = shadowRoot.querySelector('.step-indicators-wrapper');
      if (indicators) {
        const indicatorsHeight = (indicators as HTMLElement).offsetHeight;
        el.style.setProperty('--ty-wizard-indicators-height', `${indicatorsHeight}px`);
      }

      // Update transform with current active index
      updateTransform(el, activeIndex);

      // Update progress line
      updateProgressLine(el);
    });

    // Update panel interaction states
    if (activeId) {
      updatePanelInteraction(el, activeId);
    }

  } else {
    // === FULL RENDER: First time or structure missing ===

    shadowRoot.innerHTML = `
      <div class="wizard-container">
        ${renderStepIndicators(el, steps, activeId, completedIds)}
        <div class="panels-viewport" part="panels-container">
          <div class="panels-wrapper">
            <slot></slot>
          </div>
        </div>
      </div>
    `;

    // Measure indicators height, update transform and progress after render
    requestAnimationFrame(() => {
      const indicators = shadowRoot.querySelector('.step-indicators-wrapper');
      if (indicators) {
        const indicatorsHeight = (indicators as HTMLElement).offsetHeight;
        el.style.setProperty('--ty-wizard-indicators-height', `${indicatorsHeight}px`);
      }

      // Update transform with measured width
      updateTransform(el, activeIndex);

      // Update progress line
      updateProgressLine(el);
    });

    // Setup event listeners
    setupEventListeners(el, shadowRoot, steps);

    // Update ARIA and data-active attributes on initial render
    updateStepIndicators(el, shadowRoot, activeId || '');

    // Setup ResizeObserver for responsive width
    setupResizeObserver(el);

    // Update step panel states
    if (activeId) {
      updatePanelInteraction(el, activeId);
    }
  }
}

/**
 * Cleanup when wizard component is disconnected
 */
function cleanup(el: TyWizard): void {
  cleanupEventListeners(el);
  cleanupResizeObserver(el);
}

// ============================================================================
// Component Definition
// ============================================================================

/**
 * TyWizard Web Component
 */
export class TyWizard extends HTMLElement {
  /** Observed attributes */
  static get observedAttributes() {
    return ['width', 'height', 'active', 'completed', 'orientation'];
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
      // Active step changed - update state, then do smart render
      if (newValue) {
        updateActiveStepState(this, newValue);
      }
      // Always call render after active change to update indicator states
      render(this);
    } else if (name === 'completed') {
      // Completed steps changed - update progress line and indicators
      render(this);
    } else {
      // Other attributes changed (width, height, linear, orientation) - full render
      render(this);
    }
  }
}

// Register the custom element
if (!customElements.get('ty-wizard')) {
  customElements.define('ty-wizard', TyWizard);
}
