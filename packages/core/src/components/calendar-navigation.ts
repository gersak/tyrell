/**
 * TyCalendarNavigation Web Component — pure presentation for calendar
 * month/year navigation. Stateless: all state comes from properties,
 * changes are emitted via events.
 */

import { ensureStyles } from '../utils/styles.js';
import { calendarNavigationStyles } from '../styles/calendar-navigation.js';
import { getMonthName, parseISODate } from '../utils/calendar-utils.js';
import { getEffectiveLocale, observeLocaleChanges } from '../utils/locale.js';
import { TyComponent } from '../base/ty-component.js';
import type { PropertyChange } from '../utils/property-manager.js';

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

const CARET_DOWN_SVG = `<svg width='24' viewBox='0 0 24 24' height='24' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
<path d='m6 9 6 6 6-6'/>
</svg>`;

/** Which grid the calendar shows: days of a month, or the months of a year. */
export type CalendarView = 'days' | 'months';

/**
 * TyCalendarNavigation Web Component
 */
export class TyCalendarNavigation extends TyComponent<NavigationState> {
  protected static properties = {
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
    
    locale: {
      type: 'string' as const,
      visual: true,
      default: 'en-US'
    },
    
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
    
    width: {
      type: 'string' as const,
      visual: true,
      default: ''
    },

    // Which grid the parent shows. 'days': title opens the month/year view,
    // arrows step months. 'months': title shows the year and closes the
    // view, arrows step years.
    view: {
      type: 'string' as const,
      visual: true,
      default: 'days',
      validate: (v: any) => v === 'days' || v === 'months',
      coerce: (v: any) => (v === 'months' ? 'months' : 'days')
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
  
  private _state: NavigationState;
  private _localeObserver?: () => void; // Cleanup function for locale observer
  
  constructor() {
    super(); // TyComponent handles attachShadow
    
    const today = new Date();
    this._state = {
      displayMonth: today.getMonth() + 1,
      displayYear: today.getFullYear()
    };
    
    const shadow = this.shadowRoot!;
    ensureStyles(shadow, { css: calendarNavigationStyles, id: 'ty-calendar-navigation' });
  }
  
  protected onConnect(): void {
    this._state.displayMonth = this.displayMonth;
    this._state.displayYear = this.displayYear;
    
    // Setup locale observer to watch for ancestor lang changes
    this._localeObserver = observeLocaleChanges(this, () => {
      this.render();
    });
    
    this.render();
  }
  
  protected onDisconnect(): void {
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
        case 'view':
          // These properties just affect rendering
          // TyComponent will call render() automatically for visual properties
          break;
      }
    }
  }
  
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

  get view(): CalendarView {
    return this.getProperty('view') as CalendarView;
  }

  set view(value: CalendarView) {
    this.setProperty('view', value);
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
  
  private createButton(
    className: string,
    title: string,
    svg: string,
    onClick: () => void,
    disabled = false
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.title = title;
    button.setAttribute('aria-label', title);
    button.innerHTML = svg;
    button.disabled = disabled;
    button.addEventListener('click', onClick);
    return button;
  }
  
  protected render(): void {
    const root = this.shadowRoot;
    if (!root) return;
    
    ensureStyles(root, { css: calendarNavigationStyles, id: 'ty-calendar-navigation' });
    
    const size = this.size;
    this.setAttribute('data-size', size);
    
    const width = this.width;
    if (width) {
      this.style.setProperty('--nav-width', width);
    } else {
      this.style.removeProperty('--nav-width');
    }
    
    const months = this.view === 'months';
    const monthName = getMonthName(this._state.displayMonth, this.locale, 'long');

    root.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'calendar-navigation-header';

    // Title: a button that flips the parent between the day grid and the
    // month/year grid (the parent listens for 'view-toggle').
    const title = document.createElement('button');
    title.type = 'button';
    title.className = 'nav-title';
    title.setAttribute('aria-expanded', String(months));
    title.setAttribute('aria-label', months ? 'Back to days' : 'Choose month and year');

    if (!months) {
      const month = document.createElement('span');
      month.className = 'nav-title-month';
      month.textContent = monthName;
      title.appendChild(month);
    }
    const year = document.createElement('span');
    year.className = months ? 'nav-title-month' : 'nav-title-year';
    year.textContent = String(this._state.displayYear);
    title.appendChild(year);

    const caret = document.createElement('span');
    caret.className = 'nav-caret';
    caret.innerHTML = CARET_DOWN_SVG;
    title.appendChild(caret);

    title.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('view-toggle', {
        detail: { view: months ? 'days' : 'months' },
      }));
    });

    // Arrows: months in the day view, years in the month view.
    const step = months ? 12 : 1;
    const unit = months ? 'year' : 'month';
    const arrows = document.createElement('div');
    arrows.className = 'nav-group nav-arrows';
    arrows.appendChild(
      this.createButton(
        `nav-btn nav-${unit}-prev`,
        `Previous ${unit}`,
        CHEVRON_LEFT_SVG,
        () => this.navigateBy(-step),
        this.isNavDisabled(-step)
      )
    );
    arrows.appendChild(
      this.createButton(
        `nav-btn nav-${unit}-next`,
        `Next ${unit}`,
        CHEVRON_RIGHT_SVG,
        () => this.navigateBy(step),
        this.isNavDisabled(step)
      )
    );

    header.appendChild(title);
    header.appendChild(arrows);

    root.appendChild(header);
  }
}

if (!customElements.get('ty-calendar-navigation')) {
  customElements.define('ty-calendar-navigation', TyCalendarNavigation);
}