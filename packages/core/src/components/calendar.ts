/**
 * TyCalendar Web Component
 * PORTED FROM: cljs/ty/components/calendar.cljs
 * 
 * A complete calendar orchestration component that combines navigation and month display.
 * Manages selection state, form participation, and event coordination.
 * 
 * Architecture:
 * - year/month/day HTML attributes for intuitive API
 * - Internal state management (private properties)
 * - Distributes properties to child components (navigation + month)
 * - Single 'change' event with complete day context
 * - Form participation via ElementInternals
 * 
 * Features:
 * - Combines ty-calendar-navigation + ty-calendar-month
 * - Date selection with visual feedback
 * - Form integration (works with FormData)
 * - Custom render functions (dayContentFn)
 * - Custom CSS injection
 * - Automatic date validation
 * - Event coordination between components
 * 
 * @example
 * ```html
 * <!-- Basic usage -->
 * <ty-calendar 
 *   year="2025" 
 *   month="10" 
 *   day="15">
 * </ty-calendar>
 * 
 * <!-- Form integration -->
 * <form>
 *   <ty-calendar name="booking-date"></ty-calendar>
 *   <button type="submit">Submit</button>
 * </form>
 * 
 * <!-- With custom rendering -->
 * <ty-calendar id="custom"></ty-calendar>
 * <script type="module">
 *   const cal = document.getElementById('custom');
 *   cal.dayContentFn = (ctx) => {
 *     const el = document.createElement('div');
 *     el.textContent = ctx.dayInMonth;
 *     if (ctx.today) el.style.fontWeight = 'bold';
 *     return el;
 *   };
 * </script>
 * ```
 */

import { ensureStyles } from '../utils/styles.js';
import { calendarStyles } from '../styles/calendar.js';
// Side-effect imports: register the child elements this component createElements
import './calendar-month.js';
import './calendar-navigation.js';
import type { DayContentFn, DayClickDetail, CalendarSize } from './calendar-month.js';
import type { NavigationChangeDetail } from './calendar-navigation.js';
import { parseISODate, type DayContext } from '../utils/calendar-utils.js';
import { getEffectiveLocale, observeLocaleChanges } from '../utils/locale.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Internal calendar state
 */
interface CalendarState {
  displayYear: number;
  displayMonth: number;
  selectedYear?: number;
  selectedMonth?: number;
  selectedDay?: number;
}

/**
 * Calendar change event detail (day selection)
 */
export interface CalendarChangeDetail {
  year: number;
  month: number;
  day: number;
  action: 'select';
  source: 'day-click';
  dayContext: DayContext;
}

/**
 * Calendar navigate event detail (month/year change)
 */
export interface CalendarNavigateDetail {
  month: number;
  year: number;
  action: 'navigate';
  source: 'navigation';
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get current date for defaults
 */
function getCurrentDate(): { year: number; month: number; day: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // 1-based
    day: now.getDate(),
  };
}

/**
 * Validate and parse year from string
 */
function parseYear(yearStr: string | null): number | null {
  if (!yearStr || !/^\d{4}$/.test(yearStr)) return null;
  return parseInt(yearStr, 10);
}

/**
 * Validate and parse month from string (1-12)
 */
function parseMonth(monthStr: string | null): number | null {
  if (!monthStr || !/^\d{1,2}$/.test(monthStr)) return null;
  const month = parseInt(monthStr, 10);
  return month >= 1 && month <= 12 ? month : null;
}

/**
 * Validate and parse day from string (1-31, validated against month)
 */
function parseDay(dayStr: string | null, year: number, month: number): number | null {
  if (!dayStr || !/^\d{1,2}$/.test(dayStr)) return null;
  const day = parseInt(dayStr, 10);

  // Get days in month for validation
  const daysInMonth = new Date(year, month, 0).getDate();

  return day >= 1 && day <= daysInMonth ? day : null;
}

/**
 * Format date as ISO string (YYYY-MM-DD) for form submission
 */
function formatDateISO(year: number, month: number, day: number): string {
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
}

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * TyCalendar Web Component
 */
export class TyCalendar extends HTMLElement {
  // Private state
  private _state: CalendarState;
  private _locale: string = 'en-US';
  private _showNavigation: boolean = true;
  private _stateless: boolean = false;
  private _size: CalendarSize = 'md';
  private _width?: string;
  private _dayContentFn?: DayContentFn;
  private _customCSS?: CSSStyleSheet;
  private _min?: string; // ISO date bound - passed to navigation + month
  private _max?: string; // ISO date bound - passed to navigation + month
  private _flavor: string = 'primary'; // passed to month display only (nav stays neutral chrome)

  // Child component references
  private _navigation?: HTMLElement;
  private _monthDisplay?: HTMLElement;

  // Form integration
  private _internals?: ElementInternals;
  
  // Locale observer cleanup
  private _localeObserver?: () => void;

  /**
   * Form-associated custom element
   */
  static formAssociated = true;

  /**
   * Observed attributes
   */
  static get observedAttributes(): string[] {
    return ['year', 'month', 'day', 'show-navigation', 'stateless', 'locale', 'name', 'size', 'width', 'min', 'max', 'flavor'];
  }

  constructor() {
    super();

    // Initialize state with current date
    const current = getCurrentDate();
    this._state = {
      displayYear: current.year,
      displayMonth: current.month,
    };

    this.attachShadow({ mode: 'open' });

    // Attach ElementInternals for form participation
    if ('attachInternals' in this) {
      this._internals = this.attachInternals();
    }
  }

  // ==========================================================================
  // Lifecycle Methods
  // ==========================================================================

  connectedCallback() {
    // Parse initial attributes
    this.initializeFromAttributes();

    // ✅ CHECK: Properties set before custom element upgrade
    // When scripts run before element is fully upgraded, properties are set as plain properties
    // without triggering setters. We need to migrate them to private fields.
    
    // Check for dayContentFn set before upgrade
    const plainDayContentFn = (this as any).dayContentFn;
    if (plainDayContentFn && !this._dayContentFn) {
      this._dayContentFn = plainDayContentFn;
      delete (this as any).dayContentFn; // Clean up plain property
    }

    // Check for customCSS set before upgrade
    const plainCustomCSS = (this as any).customCSS;
    if (plainCustomCSS && !this._customCSS) {
      this._customCSS = plainCustomCSS;
      delete (this as any).customCSS; // Clean up plain property
    }

    // Check for value set before upgrade
    const plainValue = (this as any).value;
    if (plainValue && typeof plainValue === 'string' && plainValue !== this.value) {
      // Parse and set the value properly
      const match = plainValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);
        
        this._state.selectedYear = year;
        this._state.selectedMonth = month;
        this._state.selectedDay = day;
        this._state.displayYear = year;
        this._state.displayMonth = month;
        
        // Update attributes if not in stateless mode
        if (!this._stateless) {
          this.setAttribute('year', year.toString());
          this.setAttribute('month', month.toString());
          this.setAttribute('day', day.toString());
        }
      }
      delete (this as any).value; // Clean up plain property
    }

    // Render the calendar
    this.render();

    // Set initial form value if date is selected
    this.updateFormValue();
    
    // Setup locale observer to watch for ancestor lang changes
    this._localeObserver = observeLocaleChanges(this, () => {
      this.render();
    });
  }

  disconnectedCallback() {
    // Cleanup locale observer
    if (this._localeObserver) {
      this._localeObserver();
      this._localeObserver = undefined;
    }
    
    // Cleanup references
    this._navigation = undefined;
    this._monthDisplay = undefined;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'year':
      case 'month':
      case 'day':
        this.syncStateFromAttributes();
        this.syncChildComponents();
        this.updateFormValue();
        break;

      case 'show-navigation':
        this._showNavigation = newValue !== 'false';
        this.render();
        break;

      case 'stateless':
        this._stateless = newValue !== null && newValue !== 'false';
        // No re-render needed, just changes behavior
        break;

      case 'locale':
        this._locale = newValue || 'en-US';
        this.syncChildComponents();
        break;

      case 'size':
        if (newValue === 'sm' || newValue === 'md' || newValue === 'lg') {
          this._size = newValue;
          // Clear width when size is set (mutually exclusive)
          this._width = undefined;
          this.removeAttribute('width');
          this.syncChildComponents();
        }
        break;

      case 'width':
        this._width = newValue || undefined;
        // Clear size when width is set (mutually exclusive)
        if (newValue) {
          this._size = 'md'; // Reset to default
          this.removeAttribute('size');
        }
        this.syncChildComponents();
        break;

      case 'name':
        // Name change triggers form value update
        this.updateFormValue();
        break;

      case 'min':
      case 'max':
        this[name === 'min' ? '_min' : '_max'] = newValue || undefined;
        this.syncChildComponents();
        this.updateValidity(); // bounds change can (in)validate current selection
        break;

      case 'flavor':
        this._flavor = newValue || 'primary';
        this.syncChildComponents();
        break;
    }
  }

  // ==========================================================================
  // Property Getters/Setters
  // ==========================================================================

  get min(): string | undefined {
    return this._min;
  }

  set min(value: string | undefined) {
    // Reflect to attribute; attributeChangedCallback syncs children
    if (value) this.setAttribute('min', value);
    else this.removeAttribute('min');
  }

  get max(): string | undefined {
    return this._max;
  }

  set max(value: string | undefined) {
    if (value) this.setAttribute('max', value);
    else this.removeAttribute('max');
  }

  get flavor(): string {
    return this._flavor;
  }

  set flavor(value: string) {
    if (value) this.setAttribute('flavor', value);
    else this.removeAttribute('flavor');
  }

  get year(): number | undefined {
    return this._state.selectedYear;
  }

  set year(value: number | undefined) {
    if (value !== undefined) {
      // In stateless mode, only update display
      if (this._stateless) {
        this._state.displayYear = value;
        this.setAttribute('year', value.toString());
      } else {
        // In stateful mode, update both selection and display
        this._state.selectedYear = value;
        this._state.displayYear = value;
        this.setAttribute('year', value.toString());
      }
    } else {
      if (!this._stateless) {
        delete this._state.selectedYear;
      }
      this.removeAttribute('year');
    }
    this.syncChildComponents();
    if (!this._stateless) {
      this.updateFormValue();
    }
  }

  get month(): number | undefined {
    return this._state.selectedMonth;
  }

  set month(value: number | undefined) {
    if (value !== undefined) {
      // In stateless mode, only update display
      if (this._stateless) {
        this._state.displayMonth = value;
        this.setAttribute('month', value.toString());
      } else {
        // In stateful mode, update both selection and display
        this._state.selectedMonth = value;
        this._state.displayMonth = value;
        this.setAttribute('month', value.toString());
      }
    } else {
      if (!this._stateless) {
        delete this._state.selectedMonth;
      }
      this.removeAttribute('month');
    }
    this.syncChildComponents();
    if (!this._stateless) {
      this.updateFormValue();
    }
  }

  get day(): number | undefined {
    return this._state.selectedDay;
  }

  set day(value: number | undefined) {
    if (value !== undefined) {
      this._state.selectedDay = value;
      this.setAttribute('day', value.toString());
    } else {
      delete this._state.selectedDay;
      this.removeAttribute('day');
    }
    this.syncChildComponents();
    this.updateFormValue();
  }

  get locale(): string {
    return getEffectiveLocale(this, this.getAttribute('locale'));
  }

  set locale(value: string) {
    this._locale = value;
    this.setAttribute('locale', value);
  }

  get showNavigation(): boolean {
    return this._showNavigation;
  }

  set showNavigation(value: boolean) {
    this._showNavigation = value;
    this.setAttribute('show-navigation', value.toString());
  }

  get stateless(): boolean {
    return this._stateless;
  }

  set stateless(value: boolean) {
    this._stateless = value;
    if (value) {
      this.setAttribute('stateless', '');
    } else {
      this.removeAttribute('stateless');
    }
  }

  get size(): CalendarSize {
    return this._size;
  }

  set size(value: CalendarSize) {
    if (this._size !== value) {
      this._size = value;
      // Clear width when size is set (mutually exclusive)
      this._width = undefined;
      this.removeAttribute('width');
      this.setAttribute('size', value);
      this.syncChildComponents();
    }
  }

  get width(): string | undefined {
    return this._width;
  }

  set width(value: string | undefined) {
    if (this._width !== value) {
      this._width = value;
      if (value) {
        // Clear size when width is set (mutually exclusive)
        this._size = 'md'; // Reset to default
        this.removeAttribute('size');
        this.setAttribute('width', value);
      } else {
        this.removeAttribute('width');
      }
      this.syncChildComponents();
    }
  }

  get dayContentFn(): DayContentFn | undefined {
    return this._dayContentFn;
  }

  set dayContentFn(fn: DayContentFn | undefined) {
    this._dayContentFn = fn;
    this.syncChildComponents();
  }

  get customCSS(): CSSStyleSheet | undefined {
    return this._customCSS;
  }

  set customCSS(sheet: CSSStyleSheet | undefined) {
    this._customCSS = sheet;
    this.syncChildComponents();
  }

  get value(): string {
    const { selectedYear, selectedMonth, selectedDay } = this._state;
    if (selectedYear && selectedMonth && selectedDay) {
      return formatDateISO(selectedYear, selectedMonth, selectedDay);
    }
    return '';
  }

  set value(isoDate: string) {
    if (!isoDate) {
      // Clear selection
      delete this._state.selectedYear;
      delete this._state.selectedMonth;
      delete this._state.selectedDay;
      
      // In normal mode, also clear attributes
      if (!this._stateless) {
        this.removeAttribute('year');
        this.removeAttribute('month');
        this.removeAttribute('day');
      }
    } else {
      // Parse ISO date (YYYY-MM-DD)
      const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);

        // Update internal selection state
        this._state.selectedYear = year;
        this._state.selectedMonth = month;
        this._state.selectedDay = day;
        
        // Update display to show this month
        this._state.displayYear = year;
        this._state.displayMonth = month;

        // In normal mode, update attributes
        // In stateless mode, skip attribute updates (parent controls attributes)
        if (!this._stateless) {
          this.setAttribute('year', year.toString());
          this.setAttribute('month', month.toString());
          this.setAttribute('day', day.toString());
        }
      }
    }
    this.syncChildComponents();
    
    // In normal mode, update form value
    if (!this._stateless) {
      this.updateFormValue();
    }
  }

  // ==========================================================================
  // State Management
  // ==========================================================================

  /**
   * Initialize state from HTML attributes on first load
   */
  private initializeFromAttributes(): void {
    const yearStr = this.getAttribute('year');
    const monthStr = this.getAttribute('month');
    const dayStr = this.getAttribute('day');
    const localeStr = this.getAttribute('locale');
    const showNavStr = this.getAttribute('show-navigation');
    const statelessStr = this.getAttribute('stateless');
    const sizeStr = this.getAttribute('size');
    const widthStr = this.getAttribute('width');

    // Date bounds
    this._min = this.getAttribute('min') || undefined;
    this._max = this.getAttribute('max') || undefined;

    // Parse year
    const year = parseYear(yearStr);
    if (year) {
      this._state.displayYear = year;
    }

    // Parse month
    const month = parseMonth(monthStr);
    if (month) {
      this._state.displayMonth = month;
    }

    // Parse day (only if year and month are valid)
    if (year && month) {
      const day = parseDay(dayStr, year, month);
      if (day) {
        this._state.selectedYear = year;
        this._state.selectedMonth = month;
        this._state.selectedDay = day;
      }
    }

    // Locale
    if (localeStr) {
      this._locale = localeStr;
    }

    // Show navigation
    if (showNavStr) {
      this._showNavigation = showNavStr !== 'false';
    }

    // Stateless mode
    if (statelessStr !== null) {
      this._stateless = statelessStr !== 'false';
    }

    // Size
    if (sizeStr && (sizeStr === 'sm' || sizeStr === 'md' || sizeStr === 'lg')) {
      this._size = sizeStr;
    }

    // Width
    if (widthStr) {
      this._width = widthStr;
    }
  }

  /**
   * Sync state from changed attributes
   */
  private syncStateFromAttributes(): void {
    const yearStr = this.getAttribute('year');
    const monthStr = this.getAttribute('month');
    const dayStr = this.getAttribute('day');

    const year = parseYear(yearStr);
    const month = parseMonth(monthStr);

    // Update display year/month
    if (year) this._state.displayYear = year;
    if (month) this._state.displayMonth = month;

    // Update selection (only if all three are valid)
    if (year && month) {
      const day = parseDay(dayStr, year, month);
      if (day) {
        this._state.selectedYear = year;
        this._state.selectedMonth = month;
        this._state.selectedDay = day;
      } else {
        // Clear selection if day is invalid
        delete this._state.selectedYear;
        delete this._state.selectedMonth;
        delete this._state.selectedDay;
      }
    } else {
      // Clear selection if year or month is invalid
      delete this._state.selectedYear;
      delete this._state.selectedMonth;
      delete this._state.selectedDay;
    }
  }

  /**
   * Update child components with current state
   */
  private syncChildComponents(): void {
    // Update navigation
    if (this._navigation) {
      (this._navigation as any).displayMonth = this._state.displayMonth;
      (this._navigation as any).displayYear = this._state.displayYear;
      (this._navigation as any).locale = this.locale;
      (this._navigation as any).size = this._size;
      (this._navigation as any).min = this._min ?? '';
      (this._navigation as any).max = this._max ?? '';
      // Always sync width (set or clear)
      (this._navigation as any).width = this._width;
    }

    // Update month display
    if (this._monthDisplay) {
      (this._monthDisplay as any).displayMonth = this._state.displayMonth;
      (this._monthDisplay as any).displayYear = this._state.displayYear;
      (this._monthDisplay as any).locale = this.locale;
      (this._monthDisplay as any).size = this._size;
      (this._monthDisplay as any).min = this._min;
      (this._monthDisplay as any).max = this._max;
      (this._monthDisplay as any).flavor = this._flavor;
      // Always sync width (set or clear)
      (this._monthDisplay as any).width = this._width;

      // Pass render functions
      if (this._dayContentFn) {
        (this._monthDisplay as any).dayContentFn = this._dayContentFn;
      }

      // Pass custom CSS
      if (this._customCSS) {
        (this._monthDisplay as any).customCSS = this._customCSS;
      }

      // Update selection value (convert to Date timestamp)
      const { selectedYear, selectedMonth, selectedDay } = this._state;
      if (selectedYear && selectedMonth && selectedDay) {
        const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
        (this._monthDisplay as any).value = date.getTime();
      } else {
        (this._monthDisplay as any).value = null;
      }
    }
  }

  /**
   * Update form value using ElementInternals
   */
  private updateFormValue(): void {
    // Skip form participation in stateless mode
    if (this._stateless) return;
    
    if (!this._internals) return;

    const elementName = this.getAttribute('name');
    const { selectedYear, selectedMonth, selectedDay } = this._state;

    if (elementName && selectedYear && selectedMonth && selectedDay) {
      const isoDate = formatDateISO(selectedYear, selectedMonth, selectedDay);
      this._internals.setFormValue(isoDate);
    } else {
      this._internals.setFormValue('');
    }

    this.updateValidity();
  }

  /**
   * Selection outside [min, max] => rangeUnderflow/rangeOverflow.
   * UI can't produce this (days are disabled), but programmatic values can.
   */
  private updateValidity(): void {
    if (!this._internals) return;

    const { selectedYear, selectedMonth, selectedDay } = this._state;
    if (selectedYear && selectedMonth && selectedDay) {
      const sel = Date.UTC(selectedYear, selectedMonth - 1, selectedDay);
      const min = this._min ? parseISODate(this._min) : null;
      const max = this._max ? parseISODate(this._max) : null;

      if (min && sel < Date.UTC(min.year, min.month - 1, min.day)) {
        this._internals.setValidity(
          { rangeUnderflow: true },
          `Date must be ${this._min} or later`,
        );
        return;
      }
      if (max && sel > Date.UTC(max.year, max.month - 1, max.day)) {
        this._internals.setValidity(
          { rangeOverflow: true },
          `Date must be ${this._max} or earlier`,
        );
        return;
      }
    }

    this._internals.setValidity({});
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  /**
   * Handle navigation change (month/year navigation)
   */
  private handleNavigationChange(event: CustomEvent<NavigationChangeDetail>): void {
    event.preventDefault();
    event.stopPropagation();

    const { month, year } = event.detail;

    // Update display state
    this._state.displayMonth = month;
    this._state.displayYear = year;

    // Sync child components
    this.syncChildComponents();

    // Emit navigate event
    const navigateDetail: CalendarNavigateDetail = {
      month,
      year,
      action: 'navigate',
      source: 'navigation',
    };

    this.dispatchEvent(new CustomEvent('navigate', {
      detail: navigateDetail,
      bubbles: true,
      composed: true,
      cancelable: false,
    }));
  }

  /**
   * Handle day click (day selection)
   */
  private handleDayClick(event: CustomEvent<DayClickDetail>): void {
    event.preventDefault();
    event.stopPropagation();

    const { dayContext, year, month, day } = event.detail;

    // In stateless mode, just re-dispatch the event without updating internal state
    if (this._stateless) {
      // Re-dispatch day-click event for parent to handle
      this.dispatchEvent(new CustomEvent('day-click', {
        detail: event.detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      }));
      return;
    }

    // Normal mode: update selection state
    this._state.selectedYear = year;
    this._state.selectedMonth = month;
    this._state.selectedDay = day;
    this._state.displayYear = year;
    this._state.displayMonth = month;

    // Update HTML attributes
    this.setAttribute('year', year.toString());
    this.setAttribute('month', month.toString());
    this.setAttribute('day', day.toString());

    // Update form value
    this.updateFormValue();

    // Sync child components
    this.syncChildComponents();

    // Emit change event
    const changeDetail: CalendarChangeDetail = {
      year,
      month,
      day,
      action: 'select',
      source: 'day-click',
      dayContext,
    };

    this.dispatchEvent(new CustomEvent('change', {
      detail: changeDetail,
      bubbles: true,
      composed: true,
      cancelable: false,
    }));
  }

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  /**
   * Force re-render of the calendar
   * Useful after updating dayContentFn or other dynamic properties
   */
  refresh(): void {
    this.syncChildComponents();
    
    // Force month display to re-render (for async data updates)
    if (this._monthDisplay && typeof (this._monthDisplay as any).refresh === 'function') {
      (this._monthDisplay as any).refresh();
    }
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  /**
   * Create navigation element
   */
  private createNavigation(): HTMLElement {
    const nav = document.createElement('ty-calendar-navigation');

    // Set properties
    (nav as any).displayMonth = this._state.displayMonth;
    (nav as any).displayYear = this._state.displayYear;
    (nav as any).locale = this.locale;
    (nav as any).size = this._size;
    (nav as any).min = this._min ?? '';
    (nav as any).max = this._max ?? '';

    // Only set width if explicitly provided
    if (this._width) {
      (nav as any).width = this._width;
    }

    // Listen for change events
    nav.addEventListener('change', (e) => this.handleNavigationChange(e as CustomEvent<NavigationChangeDetail>));

    // Store reference
    this._navigation = nav;

    return nav;
  }

  /**
   * Create month display element
   */
  private createMonthDisplay(): HTMLElement {
    const month = document.createElement('ty-calendar-month');

    // Set properties
    (month as any).displayMonth = this._state.displayMonth;
    (month as any).displayYear = this._state.displayYear;
    (month as any).locale = this.locale;
    (month as any).size = this._size;
    (month as any).min = this._min;
    (month as any).max = this._max;
    (month as any).flavor = this._flavor;

    // Only set width if explicitly provided
    if (this._width) {
      (month as any).width = this._width;
    }

    // Set selection value if exists
    const { selectedYear, selectedMonth, selectedDay } = this._state;
    if (selectedYear && selectedMonth && selectedDay) {
      const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
      (month as any).value = date.getTime();
    }

    // Pass render functions
    if (this._dayContentFn) {
      (month as any).dayContentFn = this._dayContentFn;
    }

    // Pass custom CSS
    if (this._customCSS) {
      (month as any).customCSS = this._customCSS;
    }

    // Listen for day-click events
    month.addEventListener('day-click', (e) => this.handleDayClick(e as CustomEvent<DayClickDetail>));

    // Store reference
    this._monthDisplay = month;

    return month;
  }

  /**
   * Main render function
   */
  private render(): void {
    const root = this.shadowRoot;
    if (!root) return;

    // Ensure styles are loaded
    ensureStyles(root, { css: calendarStyles, id: 'ty-calendar' });

    // Clear and rebuild
    root.innerHTML = '';

    // Create main container
    const container = document.createElement('div');
    container.className = 'calendar-container';

    // Add navigation if requested
    if (this._showNavigation) {
      const nav = this.createNavigation();
      container.appendChild(nav);
    }

    // Add month display
    const month = this.createMonthDisplay();
    container.appendChild(month);

    root.appendChild(container);
  }
}

// Register the custom element
if (!customElements.get('ty-calendar')) {
  customElements.define('ty-calendar', TyCalendar);
}