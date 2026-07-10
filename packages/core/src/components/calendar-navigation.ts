/**
 * TyCalendarNavigation Web Component
 * PORTED FROM: cljs/ty/components/calendar_navigation.cljs
 * 
 * A pure presentation component for calendar month/year navigation.
 * Stateless - all state comes from properties, changes emitted via events.
 * 
 * Features:
 * - Year/Month navigation (prev/next month, prev/next year)
 * - Localized month name display
 * - Custom event emission on navigation
 * - Property-driven API (no internal state)
 * - Inline SVG icons
 * - Shadow DOM encapsulation
 * 
 * @example
 * ```html
 * <!-- Basic usage -->
 * <ty-calendar-navigation 
 *   display-month="10" 
 *   display-year="2025"
 *   locale="en-US">
 * </ty-calendar-navigation>
 * 
 * <!-- Listen for changes -->
 * <script type="module">
 *   const nav = document.querySelector('ty-calendar-navigation');
 *   nav.addEventListener('change', (e) => {
 *     console.log('New month:', e.detail.month);
 *     console.log('New year:', e.detail.year);
 *   });
 * </script>
 * ```
 */

import { ensureStyles } from '../utils/styles.js';
import { calendarNavigationStyles } from '../styles/calendar-navigation.js';
import { getMonthName, parseISODate } from '../utils/calendar-utils.js';
import { getEffectiveLocale, observeLocaleChanges } from '../utils/locale.js';
import { TyComponent } from '../base/ty-component.js';
import type { PropertyChange } from '../utils/property-manager.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Navigation change event detail
 */
export interface NavigationChangeDetail {
  month: number;  // 1-12
  year: number;   // e.g., 2025
}

/**
 * Internal navigation state (minimal - just for current display)
 */
interface NavigationState {
  displayMonth: number;
  displayYear: number;
}

// ============================================================================
// SVG Icons (Material Design)
// ============================================================================

const CHEVRON_LEFT_SVG = `<?xml version='1.0' encoding='UTF-8'?>
<svg width='24' viewBox='0 0 24 24' height='24' xmlns='http://www.w3.org/2000/svg' stroke-width='0' stroke='currentColor' fill='currentColor'>
<path fill='none' d='M0 0h24v24H0V0z'/>
<path d='M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z'/>
</svg>`;

const CHEVRON_RIGHT_SVG = `<?xml version='1.0' encoding='UTF-8'?>
<svg width='24' viewBox='0 0 24 24' height='24' xmlns='http://www.w3.org/2000/svg' stroke-width='0' stroke='currentColor' fill='currentColor'>
<path fill='none' d='M0 0h24v24H0V0z'/>
<path d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/>
</svg>`;

const CHEVRONS_LEFT_SVG = `<?xml version='1.0' encoding='UTF-8'?>
<svg width='24' viewBox='0 0 24 24' height='24' enable-background='new 0 0 24 24' xmlns='http://www.w3.org/2000/svg' stroke-width='0' stroke='currentColor' fill='currentColor'>
<g>
<rect width='24' height='24' fill='none'/>
</g>
<g>
<g>
<polygon points='17.59,18 19,16.59 14.42,12 19,7.41 17.59,6 11.59,12'/>
<polygon points='11,18 12.41,16.59 7.83,12 12.41,7.41 11,6 5,12'/>
</g>
</g>
</svg>`;

const CHEVRONS_RIGHT_SVG = `<?xml version='1.0' encoding='UTF-8'?>
<svg width='24' viewBox='0 0 24 24' height='24' enable-background='new 0 0 24 24' xmlns='http://www.w3.org/2000/svg' stroke-width='0' stroke='currentColor' fill='currentColor'>
<g>
<rect width='24' height='24' fill='none'/>
</g>
<g>
<g>
<polygon points='6.41,6 5,7.41 9.58,12 5,16.59 6.41,18 12.41,12'/>
<polygon points='13,6 11.59,7.41 16.17,12 11.59,16.59 13,18 19,12'/>
</g>
</g>
</svg>`;

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * TyCalendarNavigation Web Component
 */
export class TyCalendarNavigation extends TyComponent<NavigationState> {
  // ============================================================================
  // PROPERTY CONFIGURATION - Single source of truth
  // ============================================================================
  protected static properties = {
    // Display properties
    'display-month': {
      type: 'number' as const,
      visual: true,
      default: () => new Date().getMonth() + 1, // 1-based
      validate: (v: any) => {
        const num = Number(v);
        return Number.isInteger(num) && num >= 1 && num <= 12;
      },
      coerce: (v: any) => {
        const num = Number(v);
        if (isNaN(num) || num < 1 || num > 12) {
          console.warn(`[ty-calendar-navigation] Invalid month '${v}'. Using current month.`);
          return new Date().getMonth() + 1;
        }
        return num;
      }
    },
    'display-year': {
      type: 'number' as const,
      visual: true,
      default: () => new Date().getFullYear(),
      validate: (v: any) => {
        const num = Number(v);
        return Number.isInteger(num) && num >= 1 && num <= 9999;
      },
      coerce: (v: any) => {
        const num = Number(v);
        if (isNaN(num) || num < 1 || num > 9999) {
          console.warn(`[ty-calendar-navigation] Invalid year '${v}'. Using current year.`);
          return new Date().getFullYear();
        }
        return num;
      }
    },
    
    // Locale property
    locale: {
      type: 'string' as const,
      visual: true,
      default: 'en-US'
    },
    
    // Size property
    size: {
      type: 'string' as const,
      visual: true,
      default: 'md',
      validate: (v: any) => ['sm', 'md', 'lg'].includes(v),
      coerce: (v: any) => {
        if (!['sm', 'md', 'lg'].includes(v)) {
          console.warn(`[ty-calendar-navigation] Invalid size '${v}'. Using 'md'.`);
          return 'md';
        }
        return v;
      }
    },
    
    // Width property
    width: {
      type: 'string' as const,
      visual: true,
      default: ''
    },

    // Navigation bounds — ISO dates. Buttons that would move the display
    // entirely outside [min, max] months are disabled; year jumps clamp.
    min: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
    max: {
      type: 'string' as const,
      visual: true,
      default: ''
    }
  };
  
  // ============================================================================
  // INTERNAL STATE
  // ============================================================================
  private _state: NavigationState;
  private _localeObserver?: () => void; // Cleanup function for locale observer
  
  constructor() {
    super(); // TyComponent handles attachShadow
    
    // Initialize state with current date
    const today = new Date();
    this._state = {
      displayMonth: today.getMonth() + 1,
      displayYear: today.getFullYear()
    };
    
    // Initialize styles in shadow root
    const shadow = this.shadowRoot!;
    ensureStyles(shadow, { css: calendarNavigationStyles, id: 'ty-calendar-navigation' });
  }
  
  // ==========================================================================
  // Lifecycle Hooks (TyComponent)
  // ==========================================================================
  
  /**
   * Called when component connects to DOM
   */
  protected onConnect(): void {
    // Sync state from properties
    this._state.displayMonth = this.displayMonth;
    this._state.displayYear = this.displayYear;
    
    // Setup locale observer to watch for ancestor lang changes
    this._localeObserver = observeLocaleChanges(this, () => {
      this.render();
    });
    
    // Initial render
    this.render();
  }
  
  /**
   * Called when component disconnects from DOM
   */
  protected onDisconnect(): void {
    // Cleanup locale observer
    if (this._localeObserver) {
      this._localeObserver();
      this._localeObserver = undefined;
    }
  }
  
  /**
   * Called when properties change
   * Update internal state BEFORE render
   */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    for (const { name, newValue } of changes) {
      switch (name) {
        case 'display-month':
          this._state.displayMonth = newValue as number;
          break;
        case 'display-year':
          this._state.displayYear = newValue as number;
          break;
        case 'locale':
        case 'size':
        case 'width':
          // These properties just affect rendering
          // TyComponent will call render() automatically for visual properties
          break;
      }
    }
  }
  
  // ==========================================================================
  // Property Accessors - Simple wrappers using TyComponent
  // ==========================================================================
  
  get displayMonth(): number {
    return this.getProperty('display-month');
  }
  
  set displayMonth(value: number) {
    this.setProperty('display-month', value);
  }
  
  get displayYear(): number {
    return this.getProperty('display-year');
  }
  
  set displayYear(value: number) {
    this.setProperty('display-year', value);
  }
  
  get locale(): string {
    // Use getEffectiveLocale to check ancestor lang attributes
    return getEffectiveLocale(this, this.getProperty('locale'));
  }
  
  set locale(value: string) {
    this.setProperty('locale', value);
  }
  
  get size(): 'sm' | 'md' | 'lg' {
    return this.getProperty('size') as 'sm' | 'md' | 'lg';
  }
  
  set size(value: 'sm' | 'md' | 'lg') {
    this.setProperty('size', value);
  }
  
  get width(): string {
    return this.getProperty('width');
  }

  set width(value: string) {
    this.setProperty('width', value);
  }

  get min(): string {
    return this.getProperty('min');
  }

  set min(value: string) {
    this.setProperty('min', value ?? '');
  }

  get max(): string {
    return this.getProperty('max');
  }

  set max(value: string) {
    this.setProperty('max', value ?? '');
  }
  
  // ==========================================================================
  // Event Dispatching
  // ==========================================================================
  
  /**
   * Emit change event with new month/year
   */
  private emitChangeEvent(month: number, year: number): void {
    const detail: NavigationChangeDetail = {
      month,
      year,
    };
    
    const event = new CustomEvent('change', {
      detail,
      bubbles: true,
      cancelable: true,
    });
    
    this.dispatchEvent(event);
  }
  
  // ==========================================================================
  // Navigation Logic
  // ==========================================================================

  /**
   * Month index (year * 12 + month - 1) — flat, comparable month math.
   */
  private static monthIndex(year: number, month: number): number {
    return year * 12 + (month - 1);
  }

  /**
   * min/max as month indices (null when unset/invalid)
   */
  private boundIndices(): { minIdx: number | null; maxIdx: number | null } {
    const min = parseISODate(this.min);
    const max = parseISODate(this.max);
    return {
      minIdx: min ? TyCalendarNavigation.monthIndex(min.year, min.month) : null,
      maxIdx: max ? TyCalendarNavigation.monthIndex(max.year, max.month) : null,
    };
  }

  /**
   * Clamp a target month index to [min, max]
   */
  private clampIndex(idx: number): number {
    const { minIdx, maxIdx } = this.boundIndices();
    if (minIdx !== null && idx < minIdx) return minIdx;
    if (maxIdx !== null && idx > maxIdx) return maxIdx;
    return idx;
  }

  /**
   * Navigate by month/year delta, clamped to bounds.
   * Year jumps near a bound land ON the bound month instead of overshooting.
   */
  private navigateBy(deltaMonths: number): void {
    const current = TyCalendarNavigation.monthIndex(
      this._state.displayYear,
      this._state.displayMonth
    );
    const target = this.clampIndex(current + deltaMonths);
    if (target === current) return; // Already at the bound

    this.emitChangeEvent((target % 12) + 1, Math.floor(target / 12));
  }

  /**
   * True when navigating by deltaMonths can't move the display (bound reached)
   */
  private isNavDisabled(deltaMonths: number): boolean {
    const current = TyCalendarNavigation.monthIndex(
      this._state.displayYear,
      this._state.displayMonth
    );
    return this.clampIndex(current + deltaMonths) === current;
  }
  
  // ==========================================================================
  // Rendering
  // ==========================================================================
  
  /**
   * Create navigation button
   */
  private createButton(
    className: string,
    title: string,
    svg: string,
    onClick: () => void,
    disabled = false
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = className;
    button.title = title;
    button.innerHTML = svg;
    button.disabled = disabled;
    button.addEventListener('click', onClick);
    return button;
  }
  
  /**
   * Main render function
   */
  protected render(): void {
    const root = this.shadowRoot;
    if (!root) return;
    
    // Ensure styles are loaded
    ensureStyles(root, { css: calendarNavigationStyles, id: 'ty-calendar-navigation' });
    
    // Apply size as data attribute for CSS targeting
    const size = this.size;
    this.setAttribute('data-size', size);
    
    // Apply width property as CSS custom property
    const width = this.width;
    if (width) {
      this.style.setProperty('--nav-width', width);
    } else {
      this.style.removeProperty('--nav-width');
    }
    
    // Get localized month name using current state
    const monthName = getMonthName(this._state.displayMonth, this.locale, 'long');
    
    // Clear and rebuild
    root.innerHTML = '';
    
    // Create main header container
    const header = document.createElement('div');
    header.className = 'calendar-navigation-header';
    
    // Left group: [⟪ ‹]
    const leftGroup = document.createElement('div');
    leftGroup.className = 'nav-group nav-group-left';
    
    leftGroup.appendChild(
      this.createButton(
        'nav-btn nav-year-prev',
        'Previous year',
        CHEVRONS_LEFT_SVG,
        () => this.navigateBy(-12),
        this.isNavDisabled(-12)
      )
    );

    leftGroup.appendChild(
      this.createButton(
        'nav-btn nav-month-prev',
        'Previous month',
        CHEVRON_LEFT_SVG,
        () => this.navigateBy(-1),
        this.isNavDisabled(-1)
      )
    );
    
    // Center group: [Month Year]
    const centerGroup = document.createElement('div');
    centerGroup.className = 'nav-group nav-group-center';
    
    const monthYearDisplay = document.createElement('div');
    monthYearDisplay.className = 'month-year-display';
    monthYearDisplay.textContent = `${monthName} ${this._state.displayYear}`;
    centerGroup.appendChild(monthYearDisplay);
    
    // Right group: [› ⟫]
    const rightGroup = document.createElement('div');
    rightGroup.className = 'nav-group nav-group-right';
    
    rightGroup.appendChild(
      this.createButton(
        'nav-btn nav-month-next',
        'Next month',
        CHEVRON_RIGHT_SVG,
        () => this.navigateBy(1),
        this.isNavDisabled(1)
      )
    );

    rightGroup.appendChild(
      this.createButton(
        'nav-btn nav-year-next',
        'Next year',
        CHEVRONS_RIGHT_SVG,
        () => this.navigateBy(12),
        this.isNavDisabled(12)
      )
    );
    
    // Assemble header
    header.appendChild(leftGroup);
    header.appendChild(centerGroup);
    header.appendChild(rightGroup);
    
    root.appendChild(header);
  }
}

// Register the custom element
if (!customElements.get('ty-calendar-navigation')) {
  customElements.define('ty-calendar-navigation', TyCalendarNavigation);
}