/**
 * TyDatePicker Web Component — read-only input stub + calendar dropdown
 * (modal <dialog>), optional time input, form participation via
 * ElementInternals. Value is UTC; display is local.
 */

import { ensureStyles } from '../utils/styles.js';
import { syncCustomFlavorSheet } from '../utils/flavor-sheet.js';
import { datePickerStyles, datePickerCustomFlavorCss } from '../styles/date-picker.js';
import { lockScroll, unlockScroll } from '../utils/scroll-lock.js';
import { computeAnchoredPosition, placementToAnchored, type Placement } from '../utils/positioning.js';
import { getEffectiveLocale, observeLocaleChanges } from '../utils/locale.js';
import { isMobileTouch } from '../utils/mobile.js';
import { TyComponent } from '../base/ty-component.js';
import type { Flavor } from '../types/common.js';
import type { PropertyChange } from '../utils/property-manager.js';

/**
 * Date components (internal representation in local timezone)
 */
interface DateComponents {
  year?: number;
  month?: number;  // 1-12
  day?: number;
  hour?: number;   // 0-23
  minute?: number; // 0-59
}

/**
 * Internal date picker state
 */
interface DatePickerState extends DateComponents {
  withTime: boolean;
  open: boolean;
}

/**
 * Time input internal state
 */
interface TimeInputState {
  hour: number;
  minute: number;
  caretPosition: number; // 0-5 (internal positions: 0,1,3,4,5)
  displayValue: string;  // "HH:mm"
  rawDigits: string;     // "HHmm"
}

type DatePickerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Date picker flavors (visual styles)
 */
type DatePickerFlavor = 'default' | Flavor;

type DateFormatType = 'short' | 'medium' | 'long' | 'full';

/**
 * Change event detail
 */
export interface DatePickerChangeDetail {
  value: string | null;        // UTC ISO string
  localValue: string | null;   // Local datetime-local format (e.g., "2024-09-21T10:30")
  milliseconds: number | null; // Epoch timestamp
  formatted: string | null;    // Local formatted display
  source: 'selection' | 'time-change' | 'clear' | 'external';
}

const CALENDAR_ICON_SVG = `<svg stroke='currentColor' fill='none' stroke-width='2' viewBox='0 0 24 24' width='16' height='16' xmlns='http://www.w3.org/2000/svg'><rect x='3' y='4' width='18' height='18' rx='2' ry='2'></rect><line x1='16' y1='2' x2='16' y2='6'></line><line x1='8' y1='2' x2='8' y2='6'></line><line x1='3' y1='10' x2='21' y2='10'></line></svg>`;

const CLEAR_ICON_SVG = `<svg stroke='currentColor' fill='none' stroke-width='2' viewBox='0 0 24 24' width='14' height='14' xmlns='http://www.w3.org/2000/svg'><line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line></svg>`;

const SCHEDULE_ICON_SVG = `<svg stroke='currentColor' fill='none' stroke-width='2' viewBox='0 0 24 24' width='16' height='16' xmlns='http://www.w3.org/2000/svg'><circle cx='12' cy='12' r='10'></circle><polyline points='12,6 12,12 16,14'></polyline></svg>`;

// Stable per-instance id (survives across full-rebuild re-renders, unlike a
// fresh Math.random() per render) — used to wire the stub's aria-labelledby
// to the label element it's paired with. Same pattern as select.ts's
// getElementHash.
const elementIds = new WeakMap<object, number>();
let elementIdCounter = 0;
function getElementHash(element: object): number {
  let id = elementIds.get(element);
  if (id === undefined) {
    id = ++elementIdCounter;
    elementIds.set(element, id);
  }
  return id;
}

/**
 * Parse ANY input format into year/month/day/hour/minute components.
 * Accepts:
 * - UTC strings: '2024-09-21T08:30:00Z' or '2024-09-21T08:30:00.000Z'
 * - Datetime-local: '2024-09-21T10:30'
 * - Date only: '2024-09-21'
 * - Timestamps: milliseconds since epoch
 * - With timezone: '2024-09-21T10:30:00+02:00'
 * 
 * Always extracts components in LOCAL timezone for display/editing.
 */
function parseValue(value: string | number | null | undefined, withTime: boolean): DateComponents | null {
  if (!value) return null;

  let dateObj: Date | null = null;

  if (typeof value === 'string') {
    // Date-only format: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [yearStr, monthStr, dayStr] = value.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1; // 0-based for JS Date
      const day = parseInt(dayStr, 10);
      // Create at midnight local time
      dateObj = new Date(year, month, day, 0, 0, 0, 0);
    } else {
      // Let JS Date handle datetime-local, UTC, with timezone
      dateObj = new Date(value);
    }
  } else if (typeof value === 'number') {
    dateObj = new Date(value);
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return null;
  }

  // Extract components in LOCAL timezone for display
  const components: DateComponents = {
    year: dateObj.getFullYear(),
    month: dateObj.getMonth() + 1, // Convert to 1-based
    day: dateObj.getDate(),
    hour: withTime ? dateObj.getHours() : 0,
    minute: withTime ? dateObj.getMinutes() : 0,
  };

  return components;
}

/**
 * Convert internal components to Date object.
 */
function componentsToDateObject(components: DateComponents): Date | null {
  const { year, month, day, hour, minute } = components;

  if (!year || !month || !day) return null;

  return new Date(
    year,
    month - 1, // Convert to 0-based
    day,
    hour || 0,
    minute || 0,
    0, // seconds
    0  // milliseconds
  );
}

/**
 * Convert internal components to UTC ISO 8601 format.
 * 
 * For date+time mode: Outputs full UTC timestamp with milliseconds
 * Example: '2024-09-21T08:30:00.000Z'
 * 
 * For date-only mode: Outputs UTC timestamp at midnight local time
 * Example: '2024-09-20T22:00:00.000Z' (midnight Sept 21 CEST = 10pm Sept 20 UTC)
 * 
 * Always returns UTC to ensure unambiguous server communication.
 */
function componentsToOutputValue(components: DateComponents): string | null {
  if (!components.year || !components.month || !components.day) {
    return null;
  }

  const dateObj = componentsToDateObject(components);
  return dateObj ? dateObj.toISOString() : null;
}

/**
 * Convert internal components to local datetime-local format.
 * 
 * For date+time mode: Outputs local datetime without timezone
 * Example: '2024-09-21T10:30'
 * 
 * For date-only mode: Outputs date only
 * Example: '2024-09-21'
 * 
 * This format matches HTML5 <input type="datetime-local"> and is useful
 * for setting other inputs or displaying local time without timezone conversion.
 */
function componentsToLocalValue(components: DateComponents, withTime: boolean): string | null {
  if (!components.year || !components.month || !components.day) {
    return null;
  }

  const year = components.year.toString().padStart(4, '0');
  const month = components.month.toString().padStart(2, '0');
  const day = components.day.toString().padStart(2, '0');

  if (withTime) {
    const hour = (components.hour || 0).toString().padStart(2, '0');
    const minute = (components.minute || 0).toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}`;
  } else {
    return `${year}-${month}-${day}`;
  }
}

/**
 * Format components for display in input using Intl API.
 */
function formatDisplayValue(
  components: DateComponents,
  formatType: DateFormatType,
  locale: string,
  withTime: boolean
): string | null {
  if (!components.year || !components.month || !components.day) {
    return null;
  }

  const dateObj = componentsToDateObject(components);
  if (!dateObj) return null;

  const options: Intl.DateTimeFormatOptions = {
    dateStyle: formatType || 'long',
  };

  if (withTime) {
    options.timeStyle = 'short';
  }

  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(dateObj);
}

/**
 * Parse hour and minute from raw digits (4 chars: "HHmm")
 */
function parseTimeComponents(rawDigits: string): { hour: number; minute: number } | null {
  if (!rawDigits || rawDigits.length !== 4) return null;

  const hourStr = rawDigits.substring(0, 2);
  const minuteStr = rawDigits.substring(2, 4);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { hour, minute };
}

/**
 * Validate if digit is valid for given position
 * Position 0: first hour digit (0-2)
 * Position 1: second hour digit (0-9, but 0-3 if first is 2)
 * Position 3: first minute digit (0-5)
 * Position 4: second minute digit (0-9)
 */
function validateTimeDigit(digit: number, position: number, currentDigits: string): boolean {
  switch (position) {
    case 0:
      return digit <= 2; // First hour digit: 0-2
    case 1: {
      const firstHour = parseInt(currentDigits[0], 10);
      return firstHour === 2 ? digit <= 3 : true; // If hour starts with 2, max 23
    }
    case 3:
      return digit <= 5; // First minute digit: 0-5
    case 4:
      return true; // Second minute digit: 0-9
    default:
      return false;
  }
}

/**
 * Format hour and minute into "HH:mm" display
 */
function formatTimeDisplay(hour: number, minute: number): string {
  const hourStr = hour.toString().padStart(2, '0');
  const minuteStr = minute.toString().padStart(2, '0');
  return `${hourStr}:${minuteStr}`;
}

/**
 * Find next editable position, skipping delimiter at position 2
 */
function findNextEditablePosition(currentPos: number): number {
  switch (currentPos) {
    case 0: return 1; // 0 -> 1 (within hour)
    case 1: return 3; // 1 -> 3 (skip delimiter, go to minute)
    case 3: return 4; // 3 -> 4 (within minute)
    case 4: return 5; // 4 -> 5 (after last digit)
    case 5: return 5; // 5 -> 5 (stay at end)
    default: return currentPos;
  }
}

/**
 * Find previous editable position, skipping delimiter at position 2
 */
function findPrevEditablePosition(currentPos: number): number {
  switch (currentPos) {
    case 5: return 4; // 5 -> 4 (from after last digit)
    case 4: return 3; // 4 -> 3 (within minute)
    case 3: return 1; // 3 -> 1 (skip delimiter, go to hour)
    case 1: return 0; // 1 -> 0 (within hour)
    case 0: return 0; // 0 -> 0 (stay at start)
    default: return currentPos;
  }
}

/**
 * Convert internal position (0,1,3,4) to raw digits index (0,1,2,3)
 */
function positionToRawDigitIndex(internalPos: number): number {
  switch (internalPos) {
    case 0: return 0; // Position 0 → raw digit 0 (first hour)
    case 1: return 1; // Position 1 → raw digit 1 (second hour)
    case 3: return 2; // Position 3 → raw digit 2 (first minute)
    case 4: return 3; // Position 4 → raw digit 3 (second minute)
    default: return 0;
  }
}

/**
 * TimeInput manages the state and behavior of the time input element.
 * Handles smart cursor navigation, digit replacement, and validation.
 */
class TimeInput {
  private element: HTMLInputElement;
  private state: TimeInputState;
  private datePickerElement: TyDatePicker;

  constructor(element: HTMLInputElement, datePickerElement: TyDatePicker, hour: number = 0, minute: number = 0) {
    this.element = element;
    this.datePickerElement = datePickerElement;

    const display = formatTimeDisplay(hour, minute);
    const rawDigits = hour.toString().padStart(2, '0') + minute.toString().padStart(2, '0');

    this.state = {
      hour,
      minute,
      caretPosition: 0,
      displayValue: display,
      rawDigits,
    };

    this.element.value = display;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.element.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.element.addEventListener('input', (e) => this.handleInput(e));
    this.element.addEventListener('click', () => this.handleClick());
    this.element.addEventListener('focus', () => this.handleFocus());
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key;

    switch (key) {
      case 'ArrowRight':
        this.handleArrowRight(event);
        break;
      case 'ArrowLeft':
        this.handleArrowLeft(event);
        break;
      case 'Backspace':
        this.handleBackspace(event);
        break;
      case 'Delete':
        this.handleDelete(event);
        break;
      case 'Home':
        event.preventDefault();
        this.updateState({ caretPosition: 0 });
        break;
      case 'End':
        event.preventDefault();
        this.updateState({ caretPosition: 5 });
        break;
      case 'Tab':
        // Allow default tab behavior
        break;
      default:
        if (/^\d$/.test(key)) {
          this.handleDigitInput(event, parseInt(key, 10));
        }
        break;
    }
  }

  /**
   * Handle input events (prevent default browser input)
   */
  private handleInput(event: Event): void {
    event.preventDefault();
  }

  /**
   * Handle click events - position cursor at first digit
   */
  private handleClick(): void {
    this.updateState({ caretPosition: 0 });
  }

  /**
   * Handle focus events - position cursor at first digit
   */
  private handleFocus(): void {
    this.updateState({ caretPosition: 0 });
  }

  /**
   * Handle arrow right - move to next editable position
   */
  private handleArrowRight(event: KeyboardEvent): void {
    event.preventDefault();
    const nextPos = findNextEditablePosition(this.state.caretPosition);
    this.updateState({ caretPosition: nextPos });
  }

  /**
   * Handle arrow left - move to previous editable position
   */
  private handleArrowLeft(event: KeyboardEvent): void {
    event.preventDefault();
    const prevPos = findPrevEditablePosition(this.state.caretPosition);
    this.updateState({ caretPosition: prevPos });
  }

  /**
   * Handle digit input - replace digit at cursor position
   */
  private handleDigitInput(event: KeyboardEvent, digit: number): void {
    event.preventDefault();

    const currentPos = this.state.caretPosition;

    if (![0, 1, 3, 4].includes(currentPos)) return;
    if (!validateTimeDigit(digit, currentPos, this.state.rawDigits)) return;

    const newState = this.replaceDigitAtPosition(currentPos, digit);
    if (!newState) return;

    const nextPos = findNextEditablePosition(currentPos);
    this.updateState({ ...newState, caretPosition: nextPos });

    this.notifyTimeChange();
  }

  /**
   * Handle backspace - zero digit and move back
   */
  private handleBackspace(event: KeyboardEvent): void {
    event.preventDefault();

    const currentPos = this.state.caretPosition;

    // Can't go back from position 0
    if (currentPos === 0) return;

    const targetPos = currentPos === 1 ? 0 :
      currentPos === 3 ? 1 :
        currentPos === 4 ? 3 :
          currentPos === 5 ? 4 : 0;

    const newState = this.zeroDigitAtPosition(targetPos);
    if (!newState) return;

    this.updateState({ ...newState, caretPosition: targetPos });
    this.notifyTimeChange();
  }

  /**
   * Handle delete - zero digit at current position
   */
  private handleDelete(event: KeyboardEvent): void {
    event.preventDefault();

    const currentPos = this.state.caretPosition;

    if (![0, 1, 3, 4].includes(currentPos)) return;

    const newState = this.zeroDigitAtPosition(currentPos);
    if (!newState) return;

    this.updateState({ ...newState, caretPosition: currentPos });
    this.notifyTimeChange();
  }

  private replaceDigitAtPosition(position: number, newDigit: number): Partial<TimeInputState> | null {
    const rawIndex = positionToRawDigitIndex(position);
    const digitsArray = this.state.rawDigits.split('');
    digitsArray[rawIndex] = newDigit.toString();
    const newDigits = digitsArray.join('');

    const parsed = parseTimeComponents(newDigits);
    if (!parsed) return null;

    return {
      rawDigits: newDigits,
      hour: parsed.hour,
      minute: parsed.minute,
      displayValue: formatTimeDisplay(parsed.hour, parsed.minute),
    };
  }

  private zeroDigitAtPosition(position: number): Partial<TimeInputState> | null {
    return this.replaceDigitAtPosition(position, 0);
  }

  /**
   * Update internal state and refresh display
   */
  private updateState(updates: Partial<TimeInputState>): void {
    this.state = { ...this.state, ...updates };

    this.element.value = this.state.displayValue;

    // Set cursor position, mapping internal positions to DOM positions
    const caretPos = this.state.caretPosition;
    const actualPos = caretPos === 0 ? 0 :
      caretPos === 1 ? 1 :
        caretPos === 2 ? 3 :
          caretPos === 3 ? 3 :
            caretPos === 4 ? 4 :
              caretPos === 5 ? 5 : caretPos;

    this.element.setSelectionRange(actualPos, actualPos);
  }

  private notifyTimeChange(): void {
    (this.datePickerElement as any).handleTimeInputChange(this.state.hour, this.state.minute);
  }

  getTime(): { hour: number; minute: number } {
    return {
      hour: this.state.hour,
      minute: this.state.minute,
    };
  }

  setTime(hour: number, minute: number): void {
    const display = formatTimeDisplay(hour, minute);
    const rawDigits = hour.toString().padStart(2, '0') + minute.toString().padStart(2, '0');

    this.state = {
      ...this.state,
      hour,
      minute,
      displayValue: display,
      rawDigits,
    };

    this.element.value = display;
  }
}

export class TyDatePicker extends TyComponent<DatePickerState> {
  protected static properties = {
    // Same placement vocabulary as ty-popup/ty-tooltip/ty-select: a side plus
    // an optional cross-axis alignment ("bottom-end", "top-start", …). The
    // calendar only lives above or below the field, so left/right degrade to
    // auto-side with the alignment kept. Empty = auto (below when it fits).
    placement: {
      type: 'string' as const,
      visual: true,
      default: '',
    },
    size: {
      type: 'string' as const,
      visual: true,
      default: 'md',
      // Fields come in exactly three sizes; legacy xs/xl map to sm/lg.
      validate: (v: any) => ['sm', 'md', 'lg'].includes(v),
      coerce: (v: any) => {
        if (v === 'xs') return 'sm';
        if (v === 'xl') return 'lg';
        if (!['sm', 'md', 'lg'].includes(v)) {
          console.warn(`[ty-date-picker] Invalid size '${v}'. Using 'md'.`);
          return 'md';
        }
        return v;
      }
    },
    flavor: {
      type: 'string' as const,
      visual: true,
      default: 'default'
    },
    label: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
    placeholder: {
      type: 'string' as const,
      visual: true,
      default: 'Select date...'
    },
    name: {
      type: 'string' as const,
      visual: false, // Non-visual, just for form field name
      default: ''
    },
    // Date bounds (ISO) — passed through to the embedded ty-calendar
    min: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
    max: {
      type: 'string' as const,
      visual: true,
      default: ''
    },

    required: {
      type: 'boolean' as const,
      visual: true,
      default: false
    },
    disabled: {
      type: 'boolean' as const,
      visual: true,
      default: false
    },
    clearable: {
      type: 'boolean' as const,
      visual: true,
      default: true,
      aliases: {
        'not-clearable': false
      }
    },

    format: {
      type: 'string' as const,
      visual: true,
      default: 'long',
      validate: (v: any) => ['short', 'medium', 'long', 'full'].includes(v),
      coerce: (v: any) => {
        const validFormats = ['short', 'medium', 'long', 'full'];
        if (!validFormats.includes(v)) {
          console.warn(`[ty-date-picker] Invalid format '${v}'. Using 'long'.`);
          return 'long';
        }
        return v;
      }
    },

    locale: {
      type: 'string' as const,
      visual: true,
      default: ''
    },

    // Note: Custom getter/setter will handle the complex logic
    value: {
      type: 'string' as const,
      visual: true,
      formValue: true,  // Syncs to form
      emitChange: false, // We emit custom 'change' events manually with full detail
      default: null  // null when no date selected
    },

    'with-time': {
      type: 'boolean' as const,
      visual: true,
      default: false
    }
  };

  private _state: DatePickerState = {
    withTime: false,
    open: false,
  };

  // Event listeners (stored for cleanup)
  private _clickListener?: (e: Event) => void;
  private _keydownListener?: (e: Event) => void;
  private _dialogClickListener?: (e: Event) => void;

  // Reopen guard — prevents click event from reopening after pointerdown close
  private _closeTimestamp = 0;

  private _timeInput?: TimeInput;

  // Locale observer cleanup
  private _localeObserver?: () => void;
  private _customFlavorSheet: CSSStyleSheet | null = null;

  static formAssociated = true;

  // observedAttributes is auto-generated by TyComponent from properties config

  constructor() {
    super(); // TyComponent handles attachShadow and attachInternals

    const shadow = this.shadowRoot!;
    ensureStyles(shadow, { css: datePickerStyles, id: 'ty-date-picker' });
  }

  /** TyComponent handles property capture automatically. */
  protected onConnect(): void {
    this.initializeState();

    this.render();

    // Setup locale observer to watch for ancestor lang changes
    this._localeObserver = observeLocaleChanges(this, () => {
      this.render();
    });

    this._syncCustomFlavor();
  }

  /** Custom (non-built-in) flavors — see utils/flavor-sheet.ts. */
  private _syncCustomFlavor(): void {
    // 'default' is this component's neutral: map it to a built-in so no
    // custom sheet is generated for it.
    const flavor = this.flavor === 'default' ? 'neutral' : this.flavor;
    this._customFlavorSheet = syncCustomFlavorSheet(
      this.shadowRoot!,
      this._customFlavorSheet,
      flavor,
      ({ base }) => datePickerCustomFlavorCss(base),
    );
  }

  protected onDisconnect(): void {
    if (this._localeObserver) {
      this._localeObserver();
      this._localeObserver = undefined;
    }

    this.cleanup();
  }

  /** Handle state updates BEFORE render. */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    for (const { name, newValue } of changes) {
      switch (name) {
        case 'flavor':
          this._syncCustomFlavor();
          break;

        case 'size':
        case 'label':
        case 'placeholder':
        case 'required':
        case 'disabled':
        case 'clearable':
        case 'format':
        case 'locale':
          // These properties just affect rendering, no internal state to update
          // TyComponent will call render() automatically for visual properties
          break;

        case 'value': {
          const newComponents = parseValue(newValue as string, this._state.withTime);

          // If newComponents is null, CLEAR the state completely
          if (newComponents === null) {
            const hasDate = this._state.year !== undefined ||
              this._state.month !== undefined ||
              this._state.day !== undefined;

            if (hasDate) {
              // Clear all date components, keeping only withTime and open flags
              this._state = {
                withTime: this._state.withTime,
                open: this._state.open,
                // year, month, day, hour, minute are now undefined
              };
            }
            break;
          }

          const currentComponents: DateComponents = {
            year: this._state.year,
            month: this._state.month,
            day: this._state.day,
            hour: this._state.hour,
            minute: this._state.minute,
          };

          const changed =
            newComponents?.year !== currentComponents.year ||
            newComponents?.month !== currentComponents.month ||
            newComponents?.day !== currentComponents.day ||
            newComponents?.hour !== currentComponents.hour ||
            newComponents?.minute !== currentComponents.minute;

          if (changed) {
            this._state = {
              ...this._state,
              ...newComponents,
            };
          }
          break;
        }

        case 'with-time': {
          const newWithTime = newValue as boolean;
          const oldWithTime = this._state.withTime;

          if (newWithTime !== oldWithTime) {
            this._state.withTime = newWithTime;

            // If we have an existing date, re-sync form value
            // (format changes based on withTime flag)
            const hasDate = this._state.year !== undefined &&
              this._state.month !== undefined &&
              this._state.day !== undefined;

            if (hasDate) {
              this.syncFormValue();
            }
          }
          break;
        }
      }
    }
  }


  /**
   * Get form value - returns UTC string from current state
   * TyComponent calls this automatically when value property changes
   */
  protected getFormValue(): FormDataEntryValue | null {
    return componentsToOutputValue(this.getComponents());
  }

  private getComponents(): DateComponents {
    return {
      year: this._state.year,
      month: this._state.month,
      day: this._state.day,
      hour: this._state.hour,
      minute: this._state.minute,
    };
  }

  /**
   * Whether internal state has a complete date
   */
  private hasDate(): boolean {
    return !!(this._state.year && this._state.month && this._state.day);
  }

  /**
   * Format current components for display using Intl API
   */
  private getFormattedValue(components?: DateComponents): string | null {
    const c = components || this.getComponents();
    if (!c.year || !c.month || !c.day) return null;
    return formatDisplayValue(
      c,
      (this.getProperty('format') as DateFormatType) || 'long',
      getEffectiveLocale(this, this.getProperty('locale')),
      this._state.withTime
    );
  }

  /**
   * Initialize component state from attributes
   */
  private initializeState(): void {
    const valueAttr = this.getProperty('value');
    const withTime = this.getProperty('with-time');

    const components = parseValue(valueAttr, withTime);

    if (components === null) {
      this._state = {
        withTime,
        open: false,
      };
    } else {
      this._state = {
        ...components,
        withTime,
        open: false,
      };
    }

    this.syncFormValue();
  }

  private updateState(updates: Partial<DatePickerState>, forceSync: boolean = false): void {
    this._state = { ...this._state, ...updates };

    // STAGING: Only sync attributes if dialog is closed OR force-sync is true
    // This prevents re-renders during time input editing
    const shouldSync = forceSync || !this._state.open || !this._state.withTime;

    if (shouldSync) {
      this.syncFormValue();
    }
  }

  /**
   * Sync form value with current state
   * Compares before setting to prevent circular triggers
   */
  private syncFormValue(): void {
    const utcValue = this.getFormValue() as string | null;
    const currentValue = this.getProperty('value');

    // Only update property if value actually changed (prevents circular triggers)
    if (utcValue !== currentValue) {
      // Use property setter to maintain TyComponent lifecycle
      // This will automatically handle attribute sync and form value update
      if (utcValue) {
        this.setProperty('value', utcValue);
      } else {
        this.setProperty('value', null);
      }
    }

    // Form value sync handled automatically by TyComponent (formValue: true)
  }


  /**
   * Handle time input changes from TimeInput class
   */
  handleTimeInputChange(hour: number, minute: number): void {
    if (!this.hasDate()) return;

    const components = { ...this.getComponents(), hour, minute };
    this.updateState(components, true);
    this.emitChangeEvent(components, 'time-change');
  }

  private emitChangeEvent(components: DateComponents | null, source: 'selection' | 'time-change' | 'clear' | 'external'): void {
    const utcValue = components ? componentsToOutputValue(components) : null;
    const localValue = components ? componentsToLocalValue(components, this._state.withTime) : null;
    const milliseconds = components ? componentsToDateObject(components)?.getTime() ?? null : null;
    const formatted = components ? this.getFormattedValue(components) : null;

    const detail: DatePickerChangeDetail = {
      value: utcValue,
      localValue,
      milliseconds,
      formatted,
      source,
    };

    const event = new CustomEvent<DatePickerChangeDetail>('change', {
      detail,
      bubbles: true,
      cancelable: true,
    });

    this.dispatchEvent(event);
  }

  get size(): DatePickerSize { return this.getProperty('size') as DatePickerSize; }
  set size(v: DatePickerSize) { this.setProperty('size', v); }

  get placement(): Placement | '' { return this.getProperty('placement') as Placement | ''; }
  set placement(v: Placement | '') { this.setProperty('placement', v); }

  get flavor(): DatePickerFlavor { return this.getProperty('flavor') as DatePickerFlavor; }
  set flavor(v: DatePickerFlavor) { this.setProperty('flavor', v); }

  get label(): string { return this.getProperty('label'); }
  set label(v: string) { this.setProperty('label', v); }

  get placeholder(): string { return this.getProperty('placeholder'); }
  set placeholder(v: string) { this.setProperty('placeholder', v); }

  get name(): string { return this.getProperty('name'); }
  set name(v: string) { this.setProperty('name', v); }

  get format(): DateFormatType { return this.getProperty('format') as DateFormatType; }
  set format(v: DateFormatType) { this.setProperty('format', v); }

  get locale(): string { return this.getProperty('locale'); }
  set locale(v: string) { this.setProperty('locale', v); }

  get required(): boolean { return this.getProperty('required'); }
  set required(v: boolean) { this.setProperty('required', v); }

  get disabled(): boolean { return this.getProperty('disabled'); }
  set disabled(v: boolean) { this.setProperty('disabled', v); }

  get clearable(): boolean { return this.getProperty('clearable'); }
  set clearable(v: boolean) { this.setProperty('clearable', v); }

  get min(): string { return this.getProperty('min'); }
  set min(v: string) { this.setProperty('min', v ?? ''); }

  get max(): string { return this.getProperty('max'); }
  set max(v: string) { this.setProperty('max', v ?? ''); }

  get withTime(): boolean { return this.getProperty('with-time'); }
  set withTime(v: boolean) { this.setProperty('with-time', v); }

  // Value keeps custom accessors (complex UTC parsing logic)
  /**
   * Get current value (UTC ISO string)
   */
  get value(): string | null {
    return this.getProperty('value') || null;
  }

  /**
   * Set value (UTC ISO string, Date object, or null)
   * 
   * When set to null/undefined/empty string, the attribute is removed.
   * When set to a valid date, the attribute is set to ISO UTC string.
   */
  set value(val: string | Date | null) {
    if (val === null || val === undefined || val === '') {
      this.setProperty('value', null);  // TyComponent will remove attribute
    } else {
      const strValue = val instanceof Date ? val.toISOString() : val;
      this.setProperty('value', strValue);
    }
  }

  /**
   * Clear the date value programmatically WITH a change event (source:
   * 'clear'). Works regardless of the `clearable` attribute — lets any
   * external trigger (e.g. a button elsewhere in the page) clear the value
   * without needing the built-in clear button. Mirrors ty-select's clear().
   */
  clear(): void {
    this.clearValue();
  }

  private buildStubClasses(): string {
    const classes = ['date-picker-stub'];

    const size = this.getProperty('size') || 'md';

    classes.push(size);

    if (this.getProperty('disabled')) classes.push('disabled');
    if (this.getProperty('required')) classes.push('required');
    if (this._state.open) classes.push('open');

    return classes.join(' ');
  }

  private renderStub(): HTMLElement {
    const stub = document.createElement('div');
    stub.className = this.buildStubClasses();

    const isDisabled = this.getProperty('disabled');
    if (isDisabled) {
      stub.setAttribute('disabled', 'true');
    }

    // Not text-editable (click/Enter/Space just opens the calendar dialog),
    // so role="button" — not role="combobox", which implies typing. The
    // popup is a real <dialog> opened via showModal() (see openDropdown),
    // so it already gets role="dialog" + focus-trap from the browser for
    // free; only the trigger itself needs wiring.
    stub.setAttribute('role', 'button');
    stub.setAttribute('aria-haspopup', 'dialog');
    stub.setAttribute('aria-expanded', String(this._state.open));
    stub.setAttribute('tabindex', isDisabled ? '-1' : '0');
    if (isDisabled) stub.setAttribute('aria-disabled', 'true');
    if (this.getProperty('label')) {
      stub.setAttribute('aria-labelledby', `date-picker-label-${getElementHash(this)}`);
    }
    // Same gap as ty-select had: a plain div's Enter/Space don't turn into
    // click events on their own, so without this a keyboard-only user could
    // Tab to the field but never open it.
    stub.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (this._state.open) return;
      if (ke.key === 'Enter' || ke.key === ' ') {
        ke.preventDefault();
        this.handleStubClick(e);
      }
    });

    // Start slot — leading icon (search, calendar variant, etc.)
    const startSlot = document.createElement('slot');
    startSlot.name = 'start';

    const displayText = document.createElement('span');
    displayText.className = 'stub-text';

    const formattedValue = this.getFormattedValue();
    const placeholder = this.getProperty('placeholder') || 'Select date...';
    displayText.textContent = formattedValue || placeholder;

    if (!formattedValue) {
      displayText.classList.add('placeholder');
    }

    const iconContainer = document.createElement('div');
    iconContainer.className = 'stub-icons';

    const clearable = this.getProperty('clearable');
    if (clearable && formattedValue && !isDisabled) {
      const clearButton = document.createElement('button');
      clearButton.className = 'stub-clear';
      clearButton.type = 'button';
      clearButton.innerHTML = CLEAR_ICON_SVG;
      clearButton.addEventListener('click', (e) => this.handleClearClick(e));
      iconContainer.appendChild(clearButton);
    }

    const calendarIcon = document.createElement('span');
    calendarIcon.className = 'stub-arrow';
    calendarIcon.innerHTML = CALENDAR_ICON_SVG;
    iconContainer.appendChild(calendarIcon);

    stub.addEventListener('click', (e) => this.handleStubClick(e));

    stub.appendChild(startSlot);
    stub.appendChild(displayText);
    stub.appendChild(iconContainer);

    return stub;
  }

  private createTimeInputElement(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'time-input';
    input.placeholder = 'HH:mm';
    input.autocomplete = 'off';
    input.maxLength = 5;

    return input;
  }

  private renderTimeSection(): HTMLElement {
    const timeSection = document.createElement('div');
    timeSection.className = 'time-section';

    const timeLabel = document.createElement('label');
    timeLabel.className = 'time-label';
    timeLabel.textContent = 'Time:';

    const timeInputElement = this.createTimeInputElement();

    const hour = this._state.hour || 0;
    const minute = this._state.minute || 0;
    this._timeInput = new TimeInput(timeInputElement, this, hour, minute);

    const timeIcon = document.createElement('span');
    timeIcon.className = 'time-icon';
    timeIcon.innerHTML = SCHEDULE_ICON_SVG;

    timeSection.appendChild(timeLabel);
    timeSection.appendChild(timeInputElement);
    timeSection.appendChild(timeIcon);

    return timeSection;
  }

  private renderCalendarDropdown(): HTMLDialogElement {
    const dialog = document.createElement('dialog');
    dialog.className = 'calendar-dialog';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'calendar-content';

    const calendar = document.createElement('ty-calendar') as any;

    if (this._state.year && this._state.month && this._state.day) {
      calendar.setAttribute('year', this._state.year.toString());
      calendar.setAttribute('month', this._state.month.toString());
      calendar.setAttribute('day', this._state.day.toString());
    }

    const locale = getEffectiveLocale(this, this.getProperty('locale'));
    if (locale) {
      calendar.setAttribute('locale', locale);
    }

    const min = this.getProperty('min');
    const max = this.getProperty('max');
    if (min) calendar.setAttribute('min', min);
    if (max) calendar.setAttribute('max', max);

    // Match the popup calendar to the stub's flavor. 'default' is the
    // stub's own unstyled state, not a real flavor — leave the calendar on
    // its own default rather than forwarding the literal string.
    const flavor = this.getProperty('flavor');
    if (flavor && flavor !== 'default') calendar.setAttribute('flavor', flavor);

    calendar.addEventListener('change', (e: Event) => this.handleCalendarChange(e));

    contentWrapper.appendChild(calendar);

    if (this._state.withTime) {
      contentWrapper.appendChild(this.renderTimeSection());
    }

    dialog.appendChild(contentWrapper);

    dialog.addEventListener('close', () => {
      this.updateState({ open: false });
    });

    return dialog;
  }

  /**
   * Render native date input for mobile touch devices.
   * Uses <input type="date"> or <input type="datetime-local"> when with-time.
   * Reuses .date-picker-stub styling and existing event/state infrastructure.
   */
  private renderNativeInput(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'dropdown-wrapper';

    const stub = document.createElement('div');
    stub.className = this.buildStubClasses();

    const isDisabled = this.getProperty('disabled');
    if (isDisabled) {
      stub.setAttribute('disabled', 'true');
    }

    // Native input (hidden, activated via picker indicator)
    const input = document.createElement('input');
    input.className = 'native-date-input';
    input.type = this._state.withTime ? 'datetime-local' : 'date';
    if (isDisabled) input.disabled = true;
    if (this.getProperty('required')) input.required = true;

    // Native min/max (datetime-local wants a time suffix)
    const minBound = this.getProperty('min');
    const maxBound = this.getProperty('max');
    if (minBound) input.min = this._state.withTime ? `${minBound}T00:00` : minBound;
    if (maxBound) input.max = this._state.withTime ? `${maxBound}T23:59` : maxBound;

    const localValue = componentsToLocalValue(this.getComponents(), this._state.withTime);
    if (localValue) {
      input.value = localValue;
    }

    // Placeholder span (native date inputs ignore placeholder attr)
    const placeholder = this.getProperty('placeholder') || 'Select date...';
    const formattedValue = this.getFormattedValue();
    const placeholderEl = document.createElement('span');
    placeholderEl.className = 'stub-text' + (formattedValue ? '' : ' placeholder');
    placeholderEl.textContent = formattedValue || placeholder;

    input.addEventListener('change', () => {
      if (!input.value) {
        this.clearValue();
        return;
      }
      const parsed = parseValue(input.value, this._state.withTime);
      if (parsed) {
        this.updateState(parsed, true);
        this.emitChangeEvent(parsed, 'selection');
      }
    });

    // Start slot — leading icon
    const startSlot = document.createElement('slot');
    startSlot.name = 'start';

    stub.appendChild(startSlot);
    stub.appendChild(input);
    stub.appendChild(placeholderEl);

    const iconContainer = document.createElement('div');
    iconContainer.className = 'stub-icons';

    const clearable = this.getProperty('clearable');
    if (clearable && localValue && !isDisabled) {
      const clearButton = document.createElement('button');
      clearButton.className = 'stub-clear';
      clearButton.type = 'button';
      clearButton.innerHTML = CLEAR_ICON_SVG;
      clearButton.addEventListener('click', (e) => this.handleClearClick(e));
      iconContainer.appendChild(clearButton);
    }

    const calendarIcon = document.createElement('span');
    calendarIcon.className = 'stub-arrow';
    calendarIcon.innerHTML = CALENDAR_ICON_SVG;
    iconContainer.appendChild(calendarIcon);

    stub.appendChild(iconContainer);

    wrapper.appendChild(stub);

    return wrapper;
  }


  private calculateCalendarPosition(): void {
    if (!this.shadowRoot) return;

    // Mobile uses native input, no positioning needed
    if (isMobileTouch()) return;

    const stub = this.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    const dialog = this.shadowRoot.querySelector('.calendar-dialog') as HTMLElement;

    if (!stub || !dialog) return;

    const stubRect = stub.getBoundingClientRect();

    // Measure when shown; the estimate only covers the pre-layout call
    const dialogRect = dialog.getBoundingClientRect();
    const estimatedHeight = dialogRect.height || 400;
    const popupWidth = dialogRect.width || 320;

    const wrapPadding = 8;

    const anchored = placementToAnchored(
      this.getProperty('placement') as Placement | ''
    );

    const pos = computeAnchoredPosition({
      anchorRect: stubRect,
      popupWidth,
      popupHeight: estimatedHeight,
      // gap 0 IS the unified 8px visual offset: the dialog's --calendar-padding
      // (8px) is not compensated on y (unlike select's wrapPadding), so the
      // calendar face already sits 8px from the trigger.
      gap: 0,
      align: anchored.align,
      side: anchored.side,
    });
    const positionBelow = pos.below;

    const x = pos.x - wrapPadding;
    const y = positionBelow ? pos.topY : pos.bottomY;

    this.style.setProperty('--calendar-x', `${x}px`);
    this.style.setProperty('--calendar-y', `${y}px`);
    this.style.setProperty('--calendar-offset-x', '0px');
    this.style.setProperty('--calendar-offset-y', '0px');

    if (positionBelow) {
      dialog.classList.add('position-below');
      dialog.classList.remove('position-above');
    } else {
      dialog.classList.add('position-above');
      dialog.classList.remove('position-below');
    }
  }

  private renderContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'dropdown-container';

    const label = this.getProperty('label');

    if (label) {
      const labelEl = document.createElement('label');
      labelEl.className = 'ty-field-label';
      labelEl.id = `date-picker-label-${getElementHash(this)}`;
      labelEl.innerHTML = label + (this.getProperty('required') ? '<span class="required-icon">*</span>' : '');
      container.appendChild(labelEl);
    }

    return container;
  }

  protected render(): void {
    if (!this.shadowRoot) return;

    ensureStyles(this.shadowRoot, { css: datePickerStyles, id: 'ty-date-picker' });

    // Mobile: native input, no dialog/event listeners/scroll lock
    if (isMobileTouch()) {
      const existingNativeInput = this.shadowRoot.querySelector('.native-date-input');
      if (existingNativeInput) {
        // PARTIAL UPDATE: don't destroy DOM while native picker may be open
        this.updateDisplay();
        return;
      }
      // FIRST RENDER: build from scratch
      this.shadowRoot.innerHTML = '';
      const container = this.renderContainer();
      container.appendChild(this.renderNativeInput());
      this.shadowRoot.appendChild(container);
      return;
    }

    const existingDialog = this.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    const isDialogOpen = existingDialog && existingDialog.open;

    if (isDialogOpen && this._state.open) {
      // PARTIAL UPDATE: Dialog is open - just update display
      this.updateDisplay();
      this.calculateCalendarPosition();
      return;
    }

    // FULL REBUILD: Dialog is closed or doesn't exist
    this.shadowRoot.innerHTML = '';

    const container = this.renderContainer();
    const wrapper = document.createElement('div');
    wrapper.className = 'dropdown-wrapper';

    wrapper.appendChild(this.renderStub());
    wrapper.appendChild(this.renderCalendarDropdown());

    container.appendChild(wrapper);
    this.shadowRoot.appendChild(container);

    this.setupEventListeners();
  }

  /**
   * Update display without destroying DOM (for open dialog)
   */
  private updateDisplay(): void {
    if (!this.shadowRoot) return;

    const formattedValue = this.getFormattedValue();
    const placeholder = this.getProperty('placeholder') || 'Select date...';
    const hasValue = this.hasDate();
    const clearable = this.getProperty('clearable');
    const isDisabled = this.getProperty('disabled');

    // Update stub text (shared between mobile and desktop)
    const stubText = this.shadowRoot.querySelector('.stub-text');
    if (stubText) {
      stubText.textContent = formattedValue || placeholder;
      stubText.classList.toggle('placeholder', !formattedValue);
    }

    const clearButton = this.shadowRoot.querySelector('.stub-clear') as HTMLElement;
    if (clearButton) {
      clearButton.style.display = (clearable && hasValue && !isDisabled) ? '' : 'none';
    }

    // Mobile: also sync native input value
    if (isMobileTouch()) {
      const nativeInput = this.shadowRoot.querySelector('.native-date-input') as HTMLInputElement;
      if (nativeInput) {
        const localValue = componentsToLocalValue(this.getComponents(), this._state.withTime);
        nativeInput.value = localValue || '';
      }
      return;
    }

    // Desktop: update calendar and time input
    const calendar = this.shadowRoot.querySelector('ty-calendar') as any;
    if (calendar && hasValue) {
      calendar.setAttribute('year', this._state.year!.toString());
      calendar.setAttribute('month', this._state.month!.toString());
      calendar.setAttribute('day', this._state.day!.toString());
    }

    // Keep an already-open popup's flavor in sync. render() only rebuilds
    // (and re-forwards flavor) while the dialog is CLOSED — while open it
    // takes this partial-update path instead, so without this the calendar
    // would stay stuck on whatever flavor was active when it was opened.
    if (calendar) {
      const flavor = this.getProperty('flavor');
      if (flavor && flavor !== 'default') calendar.setAttribute('flavor', flavor);
      else calendar.removeAttribute('flavor');
    }

    if (this._timeInput && this._state.hour !== undefined && this._state.minute !== undefined) {
      this._timeInput.setTime(this._state.hour, this._state.minute);
    }
  }

  private setupEventListeners(): void {
    if (this._clickListener) {
      document.removeEventListener('click', this._clickListener);
    }
    if (this._keydownListener) {
      document.removeEventListener('keydown', this._keydownListener);
    }

    this._clickListener = (e: Event) => this.handleOutsideClick(e);
    this._keydownListener = (e: Event) => this.handleEscapeKey(e);

    document.addEventListener('click', this._clickListener);
    document.addEventListener('keydown', this._keydownListener);

    const dialog = this.shadowRoot?.querySelector('.calendar-dialog');
    if (dialog) {
      this._dialogClickListener = (e: Event) => this.handleDialogClick(e);
      dialog.addEventListener('click', this._dialogClickListener);
    }
  }

  private handleStubClick(event: Event): void {
    event.preventDefault();

    // Heal state/DOM desync: a host re-render can replace the dialog element
    // while `open` is still true, stranding the picker (openDropdown
    // early-returns on _state.open). Reality wins: closed dialog → closed state.
    const dialog = this.shadowRoot?.querySelector('.calendar-dialog') as HTMLDialogElement | null;
    if (this._state.open && (!dialog || !dialog.open)) {
      this.updateState({ open: false }, true);
      unlockScroll(`date-picker-${this.id || this.toString()}`);
    }

    const disabled = this.getProperty('disabled');
    // FIXME: Timestamp guard is a workaround. Calendar day cells use pointerdown,
    // which closes the dialog before the click event fires — the click then hits the
    // stub and reopens. Proper fix: switch calendar-month day cells from pointerdown
    // to click so the event is consumed before the dialog closes.
    if (!disabled && Date.now() - this._closeTimestamp > 300) {
      this.openDropdown();
    }
  }

  /**
   * Clear the date value, sync state, emit event, and re-render.
   */
  private clearValue(): void {
    this.updateState({
      year: undefined,
      month: undefined,
      day: undefined,
      hour: undefined,
      minute: undefined,
    }, true);

    this.value = null;
    this.emitChangeEvent(null, 'clear');
    this.render();
  }

  private handleClearClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.clearValue();
  }

  private handleCalendarChange(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const customEvent = event as CustomEvent;
    const detail = customEvent.detail;
    const dayContext = detail.dayContext;

    if (!dayContext) return;

    const newComponents: DateComponents = {
      year: dayContext.year,
      month: dayContext.month,
      day: dayContext.dayInMonth,
      hour: this._state.hour,
      minute: this._state.minute,
    };

    // Force sync when calendar date changes
    this.updateState(newComponents, true);
    this.emitChangeEvent(newComponents, 'selection');

    if (!this._state.withTime) {
      this.closeDropdown();
    } else {
      // Auto-focus time input after date selection
      requestAnimationFrame(() => {
        if (!this.shadowRoot) return;
        const timeInput = this.shadowRoot.querySelector('.time-input') as HTMLInputElement;
        if (timeInput) {
          timeInput.focus();
        }
      });
    }
  }

  private handleDialogClick(event: Event): void {
    if (!this.shadowRoot) return;

    const dialog = this.shadowRoot.querySelector('.calendar-dialog');
    const content = this.shadowRoot.querySelector('.calendar-content');

    // Close if clicking on dialog backdrop (not calendar content)
    if (event.target === dialog && this._state.open && content && !content.contains(event.target as Node)) {
      event.preventDefault();
      event.stopPropagation();
      this.closeDropdown();
    }
  }

  private handleOutsideClick(event: Event): void {
    if (!this.shadowRoot) return;

    const target = event.target as Node;
    const dialog = this.shadowRoot.querySelector('.calendar-dialog');

    if (this._state.open && dialog && !this.contains(target) && !dialog.contains(target)) {
      this.closeDropdown();
    }
  }

  private handleEscapeKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent.key === 'Escape' && this._state.open) {
      keyboardEvent.preventDefault();
      this.closeDropdown();
    }
  }

  private openDropdown(): void {
    if (this._state.open) return;
    if (isMobileTouch()) return;

    this.updateState({ open: true });

    // ponytail: non-bubbling, like native <dialog> — a bubbling open/close
    // from a picker nested in ty-modal hits the modal's own listeners.
    this.dispatchEvent(new CustomEvent('open'));

    this.render();

    requestAnimationFrame(() => {
      if (!this.shadowRoot) return;

      const dialog = this.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
      if (dialog) {
        const pickerId = `date-picker-${this.id || this.toString()}`;
        lockScroll(pickerId);

        dialog.showModal();
        this.calculateCalendarPosition();
        dialog.classList.add('open');

        const stubEl = this.shadowRoot.querySelector('.date-picker-stub');
        if (stubEl) stubEl.setAttribute('aria-expanded', 'true');

        // Remove focus from any focused elements to prevent the blue outline
        const focusedElement = this.shadowRoot.activeElement as HTMLElement;
        if (focusedElement) {
          focusedElement.blur();
        }
      }
    });
  }

  private closeDropdown(): void {
    if (!this._state.open) return;

    this._closeTimestamp = Date.now();
    const pickerId = `date-picker-${this.id || this.toString()}`;

    // Force sync any staged updates when closing
    this.updateState({ open: false }, true);

    unlockScroll(pickerId);

    if (this.shadowRoot) {
      const dialog = this.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
      if (dialog) {
        dialog.classList.remove('position-above', 'position-below', 'open');
        dialog.close();
      }
      // closeDropdown() doesn't call render(), so the stub's aria-expanded
      // (still "true" from open) needs an explicit flip here too.
      const stubEl = this.shadowRoot.querySelector('.date-picker-stub');
      if (stubEl) stubEl.setAttribute('aria-expanded', 'false');
    }

    // ponytail: non-bubbling, see openDropdown()
    this.dispatchEvent(new CustomEvent('close'));

    this.render();
  }

  private cleanup(): void {
    if (this._clickListener) {
      document.removeEventListener('click', this._clickListener);
    }
    if (this._keydownListener) {
      document.removeEventListener('keydown', this._keydownListener);
    }

    if (this._dialogClickListener && this.shadowRoot) {
      const dialog = this.shadowRoot.querySelector('.calendar-dialog');
      if (dialog) {
        dialog.removeEventListener('click', this._dialogClickListener);
      }
    }

    if (this._state.open) {
      const pickerId = `date-picker-${this.id || this.toString()}`;
      unlockScroll(pickerId);
    }

    this._clickListener = undefined;
    this._keydownListener = undefined;
    this._dialogClickListener = undefined;
    this._timeInput = undefined;
  }
}

if (!customElements.get('ty-date-picker')) {
  customElements.define('ty-date-picker', TyDatePicker);
}