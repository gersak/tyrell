/**
 * TyCalendar Web Component — orchestrates ty-calendar-navigation +
 * ty-calendar-month: owns selection state, distributes properties to the
 * children, and participates in forms via ElementInternals.
 */

import { ensureStyles } from '../utils/styles.js';
import { calendarStyles } from '../styles/calendar.js';
// Side-effect imports: register the child elements this component createElements
import './calendar-month.js';
import './calendar-navigation.js';
import type { DayContentFn, DayClickDetail, CalendarSize } from './calendar-month.js';
import type { NavigationChangeDetail, CalendarView } from './calendar-navigation.js';
import { parseISODate, getMonthName, type DayContext } from '../utils/calendar-utils.js';
import { getEffectiveLocale, observeLocaleChanges } from '../utils/locale.js';
import { ValidityController } from '../utils/validity.js';

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

function getCurrentDate(): { year: number; month: number; day: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // 1-based
    day: now.getDate(),
  };
}

function parseYear(yearStr: string | null): number | null {
  if (!yearStr || !/^\d{4}$/.test(yearStr)) return null;
  return parseInt(yearStr, 10);
}

function parseMonth(monthStr: string | null): number | null {
  if (!monthStr || !/^\d{1,2}$/.test(monthStr)) return null;
  const month = parseInt(monthStr, 10);
  return month >= 1 && month <= 12 ? month : null;
}

/**
 * Parse a day string, validated against the given month's length.
 */
function parseDay(dayStr: string | null, year: number, month: number): number | null {
  if (!dayStr || !/^\d{1,2}$/.test(dayStr)) return null;
  const day = parseInt(dayStr, 10);

  const daysInMonth = new Date(year, month, 0).getDate();

  return day >= 1 && day <= daysInMonth ? day : null;
}

/** Format date as ISO string (YYYY-MM-DD) for form submission */
function formatDateISO(year: number, month: number, day: number): string {
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
}

/**
 * TyCalendar Web Component
 */
export class TyCalendar extends HTMLElement {
  private _state: CalendarState;
  private _showNavigation: boolean = true;
  private _stateless: boolean = false;
  private _size: CalendarSize = 'md';
  private _width?: string;
  private _dayContentFn?: DayContentFn;
  private _customCSS?: CSSStyleSheet;
  private _min?: string; // ISO date bound - passed to navigation + month
  private _max?: string; // ISO date bound - passed to navigation + month
  private _flavor: string = 'primary'; // passed to month display only (nav stays neutral chrome)

  private _navigation?: HTMLElement;
  private _monthDisplay?: HTMLElement;
  private _container?: HTMLElement;

  // Day grid, or the month/year grid opened from the title
  private _view: CalendarView = 'days';
  private _monthGrid?: HTMLElement;
  private _dayGridHeight = 0;

  private _internals?: ElementInternals;
  private _validity?: ValidityController;
  
  // Locale observer cleanup
  private _localeObserver?: () => void;

  static formAssociated = true;

  static get observedAttributes(): string[] {
    return ['value', 'year', 'month', 'day', 'show-navigation', 'stateless', 'locale', 'name', 'size', 'width', 'min', 'max', 'flavor'];
  }

  constructor() {
    super();

    const current = getCurrentDate();
    this._state = {
      displayYear: current.year,
      displayMonth: current.month,
    };

    this.attachShadow({ mode: 'open' });

    if ('attachInternals' in this) {
      this._internals = this.attachInternals();
      this._validity = new ValidityController(this, this._internals);
    }
  }

  connectedCallback() {
    this.initializeFromAttributes();

    // Properties set before custom element upgrade: when scripts run before
    // the element is upgraded, properties are set as plain properties without
    // triggering setters. We need to migrate them to private fields.
    
    // Check for dayContentFn set before upgrade
    const plainDayContentFn = (this as any).dayContentFn;
    if (plainDayContentFn && !this._dayContentFn) {
      this._dayContentFn = plainDayContentFn;
      delete (this as any).dayContentFn;
    }

    // Check for customCSS set before upgrade
    const plainCustomCSS = (this as any).customCSS;
    if (plainCustomCSS && !this._customCSS) {
      this._customCSS = plainCustomCSS;
      delete (this as any).customCSS;
    }

    // Check for value set before upgrade
    const plainValue = (this as any).value;
    if (plainValue && typeof plainValue === 'string' && plainValue !== this.value) {
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
      delete (this as any).value;
    }

    this.render();

    this.updateFormValue();
    
    // Setup locale observer to watch for ancestor lang changes
    this._localeObserver = observeLocaleChanges(this, () => {
      this.render();
    });
  }

  disconnectedCallback() {
    if (this._localeObserver) {
      this._localeObserver();
      this._localeObserver = undefined;
    }
    
    this._navigation = undefined;
    this._monthDisplay = undefined;
    this._monthGrid = undefined;
    this._container = undefined;
    this._view = 'days';
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;

    switch (name) {
      // `value` is the ISO-date form of year/month/day — the setter fans it
      // out to those attributes (and syncs children), so no extra work here.
      case 'value':
        this.value = newValue || '';
        break;

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
        // Attribute is the source of truth — `get locale` resolves it via
        // getEffectiveLocale; children just need a re-sync.
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
      const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);

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

    if (!this._stateless) {
      this.updateFormValue();
    }
  }

  /**
   * Initialize state from HTML attributes on first load
   */
  private initializeFromAttributes(): void {
    const yearStr = this.getAttribute('year');
    const monthStr = this.getAttribute('month');
    const dayStr = this.getAttribute('day');
    const showNavStr = this.getAttribute('show-navigation');
    const statelessStr = this.getAttribute('stateless');
    const sizeStr = this.getAttribute('size');
    const widthStr = this.getAttribute('width');

    this._min = this.getAttribute('min') || undefined;
    this._max = this.getAttribute('max') || undefined;

    const year = parseYear(yearStr);
    if (year) {
      this._state.displayYear = year;
    }

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

    if (showNavStr) {
      this._showNavigation = showNavStr !== 'false';
    }

    if (statelessStr !== null) {
      this._stateless = statelessStr !== 'false';
    }

    if (sizeStr && (sizeStr === 'sm' || sizeStr === 'md' || sizeStr === 'lg')) {
      this._size = sizeStr;
    }

    if (widthStr) {
      this._width = widthStr;
    }
  }

  private syncStateFromAttributes(): void {
    const yearStr = this.getAttribute('year');
    const monthStr = this.getAttribute('month');
    const dayStr = this.getAttribute('day');

    const year = parseYear(yearStr);
    const month = parseMonth(monthStr);

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

  private syncChildComponents(): void {
    if (this._navigation) {
      (this._navigation as any).displayMonth = this._state.displayMonth;
      (this._navigation as any).displayYear = this._state.displayYear;
      (this._navigation as any).locale = this.locale;
      (this._navigation as any).size = this._size;
      (this._navigation as any).min = this._min ?? '';
      (this._navigation as any).max = this._max ?? '';
      // Always sync width (set or clear)
      (this._navigation as any).width = this._width;
      (this._navigation as any).view = this._view;
    }

    if (this._monthGrid) {
      this.showBody();
    }

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

      if (this._dayContentFn) {
        (this._monthDisplay as any).dayContentFn = this._dayContentFn;
      }

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
        this._validity!.set(
          { rangeUnderflow: true },
          `Date must be ${this._min} or later`,
        );
        return;
      }
      if (max && sel > Date.UTC(max.year, max.month - 1, max.day)) {
        this._validity!.set(
          { rangeOverflow: true },
          `Date must be ${this._max} or earlier`,
        );
        return;
      }
    }

    this._validity!.set({});
  }

  // --- Constraint validation (same API as native form controls) -------------

  get form(): HTMLFormElement | null { return this._internals?.form ?? null; }
  get validity(): ValidityState | undefined { return this._internals?.validity; }
  get validationMessage(): string { return this._internals?.validationMessage ?? ''; }
  get willValidate(): boolean { return this._internals?.willValidate ?? false; }
  checkValidity(): boolean { return this._internals?.checkValidity() ?? true; }
  reportValidity(): boolean { return this._validity?.report() ?? true; }
  setCustomValidity(message: string): void { this._validity?.setCustom(message); }

  private handleNavigationChange(event: CustomEvent<NavigationChangeDetail>): void {
    event.preventDefault();
    event.stopPropagation();

    const { month, year } = event.detail;
    this.goTo(month, year);
  }

  /** Show a month (and emit navigate). Shared by the arrows, the month grid
      and Page Up / Page Down. */
  private goTo(month: number, year: number): void {
    this._state.displayMonth = month;
    this._state.displayYear = year;

    this.syncChildComponents();

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

  private handleDayClick(event: CustomEvent<DayClickDetail>): void {
    event.preventDefault();
    event.stopPropagation();

    const { dayContext, year, month, day } = event.detail;

    // In stateless mode, just re-dispatch the event without updating internal state
    if (this._stateless) {
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

    this.setAttribute('year', year.toString());
    this.setAttribute('month', month.toString());
    this.setAttribute('day', day.toString());

    this.updateFormValue();

    this.syncChildComponents();

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

  private createNavigation(): HTMLElement {
    const nav = document.createElement('ty-calendar-navigation');

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

    (nav as any).view = this._view;

    nav.addEventListener('change', (e) => this.handleNavigationChange(e as CustomEvent<NavigationChangeDetail>));
    nav.addEventListener('view-toggle', (e) => {
      this.setView((e as CustomEvent<{ view: CalendarView }>).detail.view);
      this.focusNavTitle();
    });

    this._navigation = nav;

    return nav;
  }

  private createMonthDisplay(): HTMLElement {
    const month = document.createElement('ty-calendar-month');

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

    const { selectedYear, selectedMonth, selectedDay } = this._state;
    if (selectedYear && selectedMonth && selectedDay) {
      const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
      (month as any).value = date.getTime();
    }

    if (this._dayContentFn) {
      (month as any).dayContentFn = this._dayContentFn;
    }

    if (this._customCSS) {
      (month as any).customCSS = this._customCSS;
    }

    month.addEventListener('day-click', (e) => this.handleDayClick(e as CustomEvent<DayClickDetail>));

    this._monthDisplay = month;

    return month;
  }

  private render(): void {
    const root = this.shadowRoot;
    if (!root) return;

    ensureStyles(root, { css: calendarStyles, id: 'ty-calendar' });

    root.innerHTML = '';
    this._monthGrid = undefined;

    const container = document.createElement('div');
    container.className = 'calendar-container';
    container.addEventListener('keydown', (e) => this.handleKeydown(e as KeyboardEvent));
    this._container = container;

    if (this._showNavigation) {
      const nav = this.createNavigation();
      container.appendChild(nav);
    }

    const month = this.createMonthDisplay();
    container.appendChild(month);

    root.appendChild(container);

    if (this._view === 'months') this.showBody();
  }

  // ---------------------------------------------------------------------------
  // Month/year view
  // ---------------------------------------------------------------------------

  private setView(view: CalendarView): void {
    if (view === this._view) return;
    if (view === 'months' && this._monthDisplay) {
      // Keep the popup the same height while the grid is swapped
      this._dayGridHeight = this._monthDisplay.getBoundingClientRect().height;
    }
    this._view = view;
    if (this._navigation) (this._navigation as any).view = view;
    this.showBody();
  }

  /** Put the day grid or a freshly built month grid under the navigation. */
  private showBody(): void {
    const container = this._container;
    if (!container || !this._monthDisplay) return;

    if (this._view === 'days') {
      this._monthGrid?.remove();
      this._monthGrid = undefined;
      if (!this._monthDisplay.isConnected) container.appendChild(this._monthDisplay);
      return;
    }

    const grid = this.buildMonthGrid();
    if (this._monthGrid) this._monthGrid.replaceWith(grid);
    else {
      this._monthDisplay.remove();
      container.appendChild(grid);
    }
    this._monthGrid = grid;
  }

  private static monthIndex(year: number, month: number): number {
    return year * 12 + (month - 1);
  }

  /** min/max as month indices (null when unset) */
  private boundIndices(): { minIdx: number | null; maxIdx: number | null } {
    const min = this._min ? parseISODate(this._min) : null;
    const max = this._max ? parseISODate(this._max) : null;
    return {
      minIdx: min ? TyCalendar.monthIndex(min.year, min.month) : null,
      maxIdx: max ? TyCalendar.monthIndex(max.year, max.month) : null,
    };
  }

  private buildMonthGrid(): HTMLElement {
    const { displayYear, displayMonth, selectedYear, selectedMonth } = this._state;
    const today = getCurrentDate();
    const { minIdx, maxIdx } = this.boundIndices();

    const grid = document.createElement('div');
    grid.className = `month-grid size-${this._size}`;
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', String(displayYear));
    if (this._dayGridHeight) grid.style.minHeight = `${this._dayGridHeight}px`;
    if (this._width) grid.style.setProperty('--calendar-width', this._width);

    for (let month = 1; month <= 12; month++) {
      const idx = TyCalendar.monthIndex(displayYear, month);
      const disabled = (minIdx !== null && idx < minIdx) || (maxIdx !== null && idx > maxIdx);
      const selected = selectedYear === displayYear && selectedMonth === month;

      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'month-cell';
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-selected', String(selected));
      cell.setAttribute('aria-label', `${getMonthName(month, this.locale, 'long')} ${displayYear}`);
      cell.dataset.month = String(month);
      cell.tabIndex = month === displayMonth ? 0 : -1;
      cell.disabled = disabled;
      if (selected) cell.classList.add('selected');
      if (today.year === displayYear && today.month === month) cell.classList.add('current');
      cell.textContent = getMonthName(month, this.locale, 'short');
      cell.addEventListener('click', () => this.pickMonth(month));
      grid.appendChild(cell);
    }

    // Arrows move within the 3-column grid
    grid.addEventListener('keydown', (e: KeyboardEvent) => {
      const delta =
        e.key === 'ArrowLeft' ? -1 :
        e.key === 'ArrowRight' ? 1 :
        e.key === 'ArrowUp' ? -3 :
        e.key === 'ArrowDown' ? 3 :
        0;
      if (!delta) return;
      const cells = Array.from(grid.querySelectorAll<HTMLButtonElement>('.month-cell'));
      const current = cells.findIndex(c => c === (this.shadowRoot as ShadowRoot).activeElement);
      const next = cells[(current === -1 ? displayMonth - 1 : current) + delta];
      if (!next || next.disabled) return;
      e.preventDefault();
      cells.forEach(c => (c.tabIndex = -1));
      next.tabIndex = 0;
      next.focus();
    });

    return grid;
  }

  private pickMonth(month: number): void {
    this.setView('days');
    this.goTo(month, this._state.displayYear);
    this.focusDayGrid();
  }

  // ---------------------------------------------------------------------------
  // Keyboard: Page Up/Down = month (year in the month view), Shift = year,
  // Escape closes the month view (and stops there, so a surrounding
  // date-picker popup stays open).
  // ---------------------------------------------------------------------------

  private handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this._view === 'months') {
      e.preventDefault();
      e.stopPropagation();
      this.setView('days');
      this.focusNavTitle();
      return;
    }

    if (e.key !== 'PageUp' && e.key !== 'PageDown') return;
    e.preventDefault();

    const sign = e.key === 'PageUp' ? -1 : 1;
    const step = e.shiftKey || this._view === 'months' ? 12 : 1;
    const current = TyCalendar.monthIndex(this._state.displayYear, this._state.displayMonth);
    const { minIdx, maxIdx } = this.boundIndices();
    let target = current + sign * step;
    if (minIdx !== null && target < minIdx) target = minIdx;
    if (maxIdx !== null && target > maxIdx) target = maxIdx;
    if (target === current) return;

    this.goTo((target % 12) + 1, Math.floor(target / 12));
    if (this._view === 'months') {
      const cell = this._monthGrid?.querySelector<HTMLElement>('.month-cell[tabindex="0"]');
      cell?.focus();
    } else {
      this.focusDayGrid();
    }
  }

  private focusNavTitle(): void {
    requestAnimationFrame(() => {
      (this._navigation?.shadowRoot?.querySelector('.nav-title') as HTMLElement | null)?.focus();
    });
  }

  private focusDayGrid(): void {
    requestAnimationFrame(() => {
      const cell = this._monthDisplay?.shadowRoot?.querySelector('.calendar-day-cell[tabindex="0"]') as HTMLElement | null;
      cell?.focus();
    });
  }
}

if (!customElements.get('ty-calendar')) {
  customElements.define('ty-calendar', TyCalendar);
}