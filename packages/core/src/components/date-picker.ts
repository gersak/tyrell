/**
 * TyDatePicker Web Component
 * PORTED FROM: cljs/ty/components/date_picker.cljs
 * 
 * A date picker component with read-only input and calendar dropdown.
 * Supports date-only and date+time modes with smart time input.
 * 
 * Architecture:
 * - Read-only input stub (displays formatted date)
 * - Calendar dropdown (modal dialog with ty-calendar)
 * - Optional time input (with smart digit navigation)
 * - Form participation via ElementInternals
 * - UTC output, local display
 * 
 * Features:
 * - Date selection with calendar dropdown
 * - Optional time input with smart navigation
 * - Form integration (works with FormData)
 * - UTC value output for server communication
 * - Localized display formatting (Intl API)
 * - Clearable with clear button
 * - Keyboard navigation (Escape to close)
 * - Outside click handling
 * 
 * @example
 * ```html
 * <!-- Basic date picker -->
 * <ty-date-picker 
 *   label="Select Date"
 *   placeholder="Choose a date">
 * </ty-date-picker>
 * 
 * <!-- With time -->
 * <ty-date-picker 
 *   with-time="true"
 *   label="Select Date & Time">
 * </ty-date-picker>
 * 
 * <!-- Form integration -->
 * <form>
 *   <ty-date-picker name="booking-date"></ty-date-picker>
 *   <button type="submit">Submit</button>
 * </form>
 * 
 * <!-- Pre-filled value (UTC) -->
 * <ty-date-picker value="2024-09-21T08:30:00.000Z"></ty-date-picker>
 * ```
 */

import { ensureStyles } from '../utils/styles.js';
import { datePickerStyles } from '../styles/date-picker.js';
import { lockScroll, unlockScroll } from '../utils/scroll-lock.js';
import { getEffectiveLocale, observeLocaleChanges } from '../utils/locale.js';
import { isMobileTouch } from '../utils/mobile.js';
import { TyComponent } from '../base/ty-component.js';
import type { PropertyChange } from '../utils/property-manager.js';

// ============================================================================
// Types
// ============================================================================

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

/**
 * Date picker sizes
 */
type DatePickerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Date picker flavors (visual styles)
 */
type DatePickerFlavor = 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

/**
 * Date format types
 */
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

// ============================================================================
// Constants
// ============================================================================

const CALENDAR_ICON_SVG = `<svg stroke='currentColor' fill='none' stroke-width='2' viewBox='0 0 24 24' width='16' height='16' xmlns='http://www.w3.org/2000/svg'><rect x='3' y='4' width='18' height='18' rx='2' ry='2'></rect><line x1='16' y1='2' x2='16' y2='6'></line><line x1='8' y1='2' x2='8' y2='6'></line><line x1='3' y1='10' x2='21' y2='10'></line></svg>`;

const CLEAR_ICON_SVG = `<svg stroke='currentColor' fill='none' stroke-width='2' viewBox='0 0 24 24' width='14' height='14' xmlns='http://www.w3.org/2000/svg'><line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line></svg>`;

const SCHEDULE_ICON_SVG = `<svg stroke='currentColor' fill='none' stroke-width='2' viewBox='0 0 24 24' width='16' height='16' xmlns='http://www.w3.org/2000/svg'><circle cx='12' cy='12' r='10'></circle><polyline points='12,6 12,12 16,14'></polyline></svg>`;

// ============================================================================
// Helper Functions - Date Parsing & Conversion
// ============================================================================

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
 * 
 * PORTED FROM: parse-value in date_picker.cljs
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
    // Numeric inputs (milliseconds)
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
 * 
 * PORTED FROM: components->date-object in date_picker.cljs
 */
function componentsToDateObject(components: DateComponents): Date | null {
  const { year, month, day, hour, minute } = components;

  if (!year || !month || !day) return null;

  // Create local date
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
 * 
 * PORTED FROM: components->output-value in date_picker.cljs
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
 * 
 * PORTED FROM: format-display-value in date_picker.cljs
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

  // Add time styling if with-time is enabled
  if (withTime) {
    options.timeStyle = 'short';
  }

  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(dateObj);
}

// ============================================================================
// Helper Functions - Time Input
// ============================================================================

/**
 * Parse hour and minute from raw digits (4 chars: "HHmm")
 * 
 * PORTED FROM: parse-time-components in date_picker.cljs
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
 * 
 * PORTED FROM: validate-time-digit in date_picker.cljs
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
 * 
 * PORTED FROM: format-time-display in date_picker.cljs
 */
function formatTimeDisplay(hour: number, minute: number): string {
  const hourStr = hour.toString().padStart(2, '0');
  const minuteStr = minute.toString().padStart(2, '0');
  return `${hourStr}:${minuteStr}`;
}

/**
 * Find next editable position, skipping delimiter at position 2
 * 
 * PORTED FROM: find-next-editable-position in date_picker.cljs
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
 * 
 * PORTED FROM: find-prev-editable-position in date_picker.cljs
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
 * 
 * PORTED FROM: position->raw-digit-index in date_picker.cljs
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

// ============================================================================
// TimeInput Helper Class
// ============================================================================

/**
 * TimeInput manages the state and behavior of the time input element.
 * Handles smart cursor navigation, digit replacement, and validation.
 * 
 * PORTED FROM: Time input state management functions in date_picker.cljs
 */
class TimeInput {
  private element: HTMLInputElement;
  private state: TimeInputState;
  private datePickerElement: TyDatePicker;

  constructor(element: HTMLInputElement, datePickerElement: TyDatePicker, hour: number = 0, minute: number = 0) {
    this.element = element;
    this.datePickerElement = datePickerElement;

    // Initialize state
    const display = formatTimeDisplay(hour, minute);
    const rawDigits = hour.toString().padStart(2, '0') + minute.toString().padStart(2, '0');

    this.state = {
      hour,
      minute,
      caretPosition: 0,
      displayValue: display,
      rawDigits,
    };

    // Set initial value
    this.element.value = display;

    // Bind event handlers
    this.setupEventListeners();
  }

  /**
   * Setup all event listeners for the time input
   */
  private setupEventListeners(): void {
    this.element.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.element.addEventListener('input', (e) => this.handleInput(e));
    this.element.addEventListener('click', (e) => this.handleClick(e));
    this.element.addEventListener('focus', (e) => this.handleFocus(e));
  }

  /**
   * Handle keydown events
   */
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
        // Handle digit input
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
  private handleClick(event: Event): void {
    this.updateState({ caretPosition: 0 });
  }

  /**
   * Handle focus events - position cursor at first digit
   */
  private handleFocus(event: Event): void {
    this.updateState({ caretPosition: 0 });
  }

  /**
   * Handle arrow right - move to next editable position
   * 
   * PORTED FROM: handle-time-arrow-right! in date_picker.cljs
   */
  private handleArrowRight(event: KeyboardEvent): void {
    event.preventDefault();
    const nextPos = findNextEditablePosition(this.state.caretPosition);
    this.updateState({ caretPosition: nextPos });
  }

  /**
   * Handle arrow left - move to previous editable position
   * 
   * PORTED FROM: handle-time-arrow-left! in date_picker.cljs
   */
  private handleArrowLeft(event: KeyboardEvent): void {
    event.preventDefault();
    const prevPos = findPrevEditablePosition(this.state.caretPosition);
    this.updateState({ caretPosition: prevPos });
  }

  /**
   * Handle digit input - replace digit at cursor position
   * 
   * PORTED FROM: handle-time-digit-input! in date_picker.cljs
   */
  private handleDigitInput(event: KeyboardEvent, digit: number): void {
    event.preventDefault();

    const currentPos = this.state.caretPosition;

    // Only process if at editable position and digit is valid
    if (![0, 1, 3, 4].includes(currentPos)) return;
    if (!validateTimeDigit(digit, currentPos, this.state.rawDigits)) return;

    // Replace digit at current position
    const newState = this.replaceDigitAtPosition(currentPos, digit);
    if (!newState) return;

    // Move to next position
    const nextPos = findNextEditablePosition(currentPos);
    this.updateState({ ...newState, caretPosition: nextPos });

    // Notify date picker of time change
    this.notifyTimeChange();
  }

  /**
   * Handle backspace - zero digit and move back
   * 
   * PORTED FROM: handle-time-backspace! in date_picker.cljs
   */
  private handleBackspace(event: KeyboardEvent): void {
    event.preventDefault();

    const currentPos = this.state.caretPosition;

    // Can't go back from position 0
    if (currentPos === 0) return;

    // Find target position to zero
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
   * 
   * PORTED FROM: handle-time-delete! in date_picker.cljs
   */
  private handleDelete(event: KeyboardEvent): void {
    event.preventDefault();

    const currentPos = this.state.caretPosition;

    // Only at editable positions
    if (![0, 1, 3, 4].includes(currentPos)) return;

    const newState = this.zeroDigitAtPosition(currentPos);
    if (!newState) return;

    this.updateState({ ...newState, caretPosition: currentPos });
    this.notifyTimeChange();
  }

  /**
   * Replace digit at specific position
   * 
   * PORTED FROM: replace-digit-at-position in date_picker.cljs
   */
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

  /**
   * Zero digit at specific position
   * 
   * PORTED FROM: zero-digit-at-position in date_picker.cljs
   */
  private zeroDigitAtPosition(position: number): Partial<TimeInputState> | null {
    return this.replaceDigitAtPosition(position, 0);
  }

  /**
   * Update internal state and refresh display
   * 
   * PORTED FROM: update-time-input-state! in date_picker.cljs
   */
  private updateState(updates: Partial<TimeInputState>): void {
    this.state = { ...this.state, ...updates };

    // Update display value
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

  /**
   * Notify date picker of time change
   */
  private notifyTimeChange(): void {
    (this.datePickerElement as any).handleTimeInputChange(this.state.hour, this.state.minute);
  }

  /**
   * Get current time values
   */
  getTime(): { hour: number; minute: number } {
    return {
      hour: this.state.hour,
      minute: this.state.minute,
    };
  }

  /**
   * Update time from external source
   */
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

// ============================================================================
// TyDatePicker Custom Element
// ============================================================================

export class TyDatePicker extends TyComponent<DatePickerState> {
  // ============================================================================
  // PROPERTY CONFIGURATION - Single source of truth
  // ============================================================================
  protected static properties = {
    // String properties
    size: {
      type: 'string' as const,
      visual: true,
      default: 'md',
      validate: (v: any) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
      coerce: (v: any) => {
        if (!['xs', 'sm', 'md', 'lg', 'xl'].includes(v)) {
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

    // Boolean properties
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

    // Format property (medium complexity)
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

    // Locale property (medium complexity - has observer)
    locale: {
      type: 'string' as const,
      visual: true,
      default: ''
    },

    // Value property (high complexity - UTC parsing, date components)
    // Note: Custom getter/setter will handle the complex logic
    value: {
      type: 'string' as const,
      visual: true,
      formValue: true,  // Syncs to form
      emitChange: false, // We emit custom 'change' events manually with full detail
      default: null  // null when no date selected
    },

    // With-time property (high complexity - affects parsing and rendering)
    'with-time': {
      type: 'boolean' as const,
      visual: true,
      default: false
    }
  };

  // ============================================================================
  // INTERNAL STATE
  // ============================================================================
  // Internal state
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

  // Time input element reference
  private _timeInput?: TimeInput;

  // Locale observer cleanup
  private _localeObserver?: () => void;

  /**
   * Form-associated custom element
   */
  static formAssociated = true;

  // observedAttributes is auto-generated by TyComponent from properties config

  constructor() {
    super(); // TyComponent handles attachShadow and attachInternals

    // Initialize styles in shadow root
    const shadow = this.shadowRoot!;
    ensureStyles(shadow, { css: datePickerStyles, id: 'ty-date-picker' });
  }

  // ==========================================================================
  // Lifecycle Hooks (TyComponent)
  // ==========================================================================

  /**
   * Called when component connects to DOM
   * TyComponent handles property capture automatically
   */
  protected onConnect(): void {
    // Initialize component state
    this.initializeState();

    // Initial render
    this.render();

    // Setup locale observer to watch for ancestor lang changes
    this._localeObserver = observeLocaleChanges(this, () => {
      this.render();
    });
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

    // Cleanup event listeners and state
    this.cleanup();
  }

  /**
   * Called when properties change
   * Handle state updates BEFORE render
   */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    for (const { name, newValue } of changes) {
      switch (name) {
        // Simple visual properties - just trigger re-render (handled by TyComponent)
        case 'size':
        case 'flavor':
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

        // Complex properties
        case 'value': {
          // Parse the new value using current withTime setting
          const newComponents = parseValue(newValue as string, this._state.withTime);

          // If newComponents is null, CLEAR the state completely
          if (newComponents === null) {
            // Check if we actually have a date to clear
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

          // Check if components actually changed
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
            // Update state with new date components
            this._state = {
              ...this._state,
              ...newComponents,
            };
          }
          break;
        }

        case 'with-time': {
          // Update internal withTime flag
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

  // attributeChangedCallback removed - TyComponent handles all attribute changes via onPropertiesChanged

  /**
   * Get form value - returns UTC string from current state
   * TyComponent calls this automatically when value property changes
   */
  protected getFormValue(): FormDataEntryValue | null {
    return componentsToOutputValue(this.getComponents());
  }

  // ==========================================================================
  // Internal Helpers
  // ==========================================================================

  /**
   * Extract current date components from internal state
   */
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

  // ==========================================================================
  // State Management
  // ==========================================================================

  /**
   * Initialize component state from attributes
   * 
   * PORTED FROM: init-component-state! in date_picker.cljs
   */
  private initializeState(): void {
    const valueAttr = this.getProperty('value');
    const withTime = this.getProperty('with-time');

    const components = parseValue(valueAttr, withTime);

    // If components is null, initialize with empty state
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

    // Convert to UTC and sync to form
    this.syncFormValue();
  }

  /**
   * Update internal state
   * 
   * PORTED FROM: update-component-state! in date_picker.cljs
   */
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

  // handleValueChange removed - logic moved to onPropertiesChanged hook

  // ==========================================================================
  // Time Input Handling
  // ==========================================================================

  /**
   * Handle time input changes from TimeInput class
   * 
   * PORTED FROM: handle-time-change! in date_picker.cljs
   */
  handleTimeInputChange(hour: number, minute: number): void {
    if (!this.hasDate()) return;

    const components = { ...this.getComponents(), hour, minute };
    this.updateState(components, true);
    this.emitChangeEvent(components, 'time-change');
  }

  /**
   * Emit change event
   * 
   * PORTED FROM: emit-change-event! in date_picker.cljs
   */
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

  // ==========================================================================
  // Public API (Properties) - Simple Accessors
  // ==========================================================================

  // String properties
  get size(): DatePickerSize { return this.getProperty('size') as DatePickerSize; }
  set size(v: DatePickerSize) { this.setProperty('size', v); }

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

  // Boolean properties
  get required(): boolean { return this.getProperty('required'); }
  set required(v: boolean) { this.setProperty('required', v); }

  get disabled(): boolean { return this.getProperty('disabled'); }
  set disabled(v: boolean) { this.setProperty('disabled', v); }

  get clearable(): boolean { return this.getProperty('clearable'); }
  set clearable(v: boolean) { this.setProperty('clearable', v); }

  // With-time property
  get withTime(): boolean { return this.getProperty('with-time'); }
  set withTime(v: boolean) { this.setProperty('with-time', v); }

  // Value property - Keep custom getter/setter for now (complex UTC parsing logic)
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

  // ==========================================================================
  // Rendering & DOM Management
  // ==========================================================================

  /**
   * Build CSS classes for the stub element
   * 
   * PORTED FROM: build-stub-classes in date_picker.cljs
   */
  private buildStubClasses(): string {
    const classes = ['date-picker-stub'];

    const size = this.getProperty('size') || 'md';
    const flavor = this.getProperty('flavor');

    classes.push(size);

    if (flavor && flavor !== 'default') classes.push(flavor);
    if (this.getProperty('disabled')) classes.push('disabled');
    if (this.getProperty('required')) classes.push('required');
    if (this._state.open) classes.push('open');

    return classes.join(' ');
  }

  /**
   * Render the date picker stub (input display)
   * 
   * PORTED FROM: render-date-picker-stub in date_picker.cljs
   */
  private renderStub(): HTMLElement {
    const stub = document.createElement('div');
    stub.className = this.buildStubClasses();

    const isDisabled = this.getProperty('disabled');
    if (isDisabled) {
      stub.setAttribute('disabled', 'true');
    }

    // Start slot — leading icon (search, calendar variant, etc.)
    const startSlot = document.createElement('slot');
    startSlot.name = 'start';

    // Display text
    const displayText = document.createElement('span');
    displayText.className = 'stub-text';

    const formattedValue = this.getFormattedValue();
    const placeholder = this.getProperty('placeholder') || 'Select date...';
    displayText.textContent = formattedValue || placeholder;

    if (!formattedValue) {
      displayText.classList.add('placeholder');
    }

    // Icons container
    const iconContainer = document.createElement('div');
    iconContainer.className = 'stub-icons';

    // Clear button
    const clearable = this.getProperty('clearable');
    if (clearable && formattedValue && !isDisabled) {
      const clearButton = document.createElement('button');
      clearButton.className = 'stub-clear';
      clearButton.type = 'button';
      clearButton.innerHTML = CLEAR_ICON_SVG;
      clearButton.addEventListener('click', (e) => this.handleClearClick(e));
      iconContainer.appendChild(clearButton);
    }

    // Calendar icon
    const calendarIcon = document.createElement('span');
    calendarIcon.className = 'stub-arrow';
    calendarIcon.innerHTML = CALENDAR_ICON_SVG;
    iconContainer.appendChild(calendarIcon);

    // Stub click handler
    stub.addEventListener('click', (e) => this.handleStubClick(e));

    stub.appendChild(startSlot);
    stub.appendChild(displayText);
    stub.appendChild(iconContainer);

    return stub;
  }

  /**
   * Create time input element
   * 
   * PORTED FROM: create-time-input in date_picker.cljs
   */
  private createTimeInputElement(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'time-input';
    input.placeholder = 'HH:mm';
    input.autocomplete = 'off';
    input.maxLength = 5;

    return input;
  }

  /**
   * Render time input section
   */
  private renderTimeSection(): HTMLElement {
    const timeSection = document.createElement('div');
    timeSection.className = 'time-section';

    const timeLabel = document.createElement('label');
    timeLabel.className = 'time-label';
    timeLabel.textContent = 'Time:';

    const timeInputElement = this.createTimeInputElement();

    // Create TimeInput instance
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

  /**
   * Render calendar dropdown with dialog
   * 
   * PORTED FROM: render-calendar-dropdown in date_picker.cljs
   */
  private renderCalendarDropdown(): HTMLDialogElement {
    const dialog = document.createElement('dialog');
    dialog.className = 'calendar-dialog';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'calendar-content';

    // Create ty-calendar
    const calendar = document.createElement('ty-calendar') as any;

    // Set current date if available
    if (this._state.year && this._state.month && this._state.day) {
      calendar.setAttribute('year', this._state.year.toString());
      calendar.setAttribute('month', this._state.month.toString());
      calendar.setAttribute('day', this._state.day.toString());
    }

    const locale = getEffectiveLocale(this, this.getProperty('locale'));
    if (locale) {
      calendar.setAttribute('locale', locale);
    }

    // Add calendar change handler
    calendar.addEventListener('change', (e: Event) => this.handleCalendarChange(e));

    contentWrapper.appendChild(calendar);

    // Add time section if with-time enabled
    if (this._state.withTime) {
      contentWrapper.appendChild(this.renderTimeSection());
    }

    dialog.appendChild(contentWrapper);

    // Dialog close handler
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

    // Pre-fill value
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

    // Change listener
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

    // Icons container (clear + calendar icon)
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


  /**
   * Calculate calendar position
   *
   * PORTED FROM: calculate-calendar-position! in date_picker.cljs
   */
  private calculateCalendarPosition(): void {
    if (!this.shadowRoot) return;

    // Mobile uses native input, no positioning needed
    if (isMobileTouch()) return;

    const stub = this.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    const dialog = this.shadowRoot.querySelector('.calendar-dialog') as HTMLElement;

    if (!stub || !dialog) return;

    const stubRect = stub.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Calendar-specific height estimation
    const estimatedHeight = 400;
    const padding = 0;

    // Available space calculations
    const spaceBelow = viewportHeight - stubRect.bottom;
    const spaceAbove = stubRect.top;
    const spaceRight = viewportWidth - stubRect.left;

    // Smart direction logic
    const positionBelow = spaceBelow >= estimatedHeight + padding;
    const fitsHorizontally = spaceRight >= stubRect.width;

    const wrapPadding = 8;

    // Calculate position coordinates
    const x = fitsHorizontally
      ? stubRect.left - wrapPadding
      : Math.max(padding, viewportWidth - stubRect.width - padding);

    const y = positionBelow
      ? stubRect.bottom
      : spaceAbove >= estimatedHeight + padding
        ? viewportHeight - stubRect.top
        : Math.max(padding, Math.min(stubRect.bottom, viewportHeight - estimatedHeight - padding));

    // Set CSS variables for positioning
    this.style.setProperty('--calendar-x', `${x}px`);
    this.style.setProperty('--calendar-y', `${y}px`);
    this.style.setProperty('--calendar-offset-x', '0px');
    this.style.setProperty('--calendar-offset-y', '0px');

    // Set direction classes
    if (positionBelow) {
      dialog.classList.add('position-below');
      dialog.classList.remove('position-above');
    } else {
      dialog.classList.add('position-above');
      dialog.classList.remove('position-below');
    }
  }

  /**
   * Render container structure
   * 
   * PORTED FROM: render-container-structure in date_picker.cljs
   */
  private renderContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'dropdown-container';

    const label = this.getProperty('label');

    if (label) {
      const labelEl = document.createElement('label');
      labelEl.className = 'dropdown-label';
      labelEl.innerHTML = label + (this.getProperty('required') ? '<span class="required-icon">*</span>' : '');
      container.appendChild(labelEl);
    }

    return container;
  }

  /**
   * Main render method
   * 
   * PORTED FROM: render! in date_picker.cljs
   */
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

    // Check if dialog is currently open
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

    // Setup document-level event listeners
    this.setupEventListeners();
  }

  /**
   * Update display without destroying DOM (for open dialog)
   * 
   * PORTED FROM: update-display! in date_picker.cljs
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

    // Update clear button visibility
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

    if (this._timeInput && this._state.hour !== undefined && this._state.minute !== undefined) {
      this._timeInput.setTime(this._state.hour, this._state.minute);
    }
  }

  /**
   * Setup document-level event listeners
   */
  private setupEventListeners(): void {
    // Remove old listeners if they exist
    if (this._clickListener) {
      document.removeEventListener('click', this._clickListener);
    }
    if (this._keydownListener) {
      document.removeEventListener('keydown', this._keydownListener);
    }

    // Create new listeners
    this._clickListener = (e: Event) => this.handleOutsideClick(e);
    this._keydownListener = (e: Event) => this.handleEscapeKey(e);

    // Add document listeners
    document.addEventListener('click', this._clickListener);
    document.addEventListener('keydown', this._keydownListener);

    // Add dialog click listener
    const dialog = this.shadowRoot?.querySelector('.calendar-dialog');
    if (dialog) {
      this._dialogClickListener = (e: Event) => this.handleDialogClick(e);
      dialog.addEventListener('click', this._dialogClickListener);
    }
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  private handleStubClick(event: Event): void {
    event.preventDefault();
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

  /**
   * Handle calendar date selection
   * 
   * PORTED FROM: handle-calendar-change! in date_picker.cljs
   */
  private handleCalendarChange(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const customEvent = event as CustomEvent;
    const detail = customEvent.detail;
    const dayContext = detail.dayContext;

    if (!dayContext) return;

    // Update state with new date
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

    // Close calendar if time is not required
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

  /**
   * Handle dialog backdrop clicks
   * 
   * PORTED FROM: handle-dialog-click! in date_picker.cljs
   */
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

  /**
   * Handle clicks outside the date picker
   * 
   * PORTED FROM: handle-outside-click! in date_picker.cljs
   */
  private handleOutsideClick(event: Event): void {
    if (!this.shadowRoot) return;

    const target = event.target as Node;
    const dialog = this.shadowRoot.querySelector('.calendar-dialog');

    // Check if click is truly outside everything
    if (this._state.open && dialog && !this.contains(target) && !dialog.contains(target)) {
      this.closeDropdown();
    }
  }

  /**
   * Handle Escape key press
   * 
   * PORTED FROM: handle-escape-key! in date_picker.cljs
   */
  private handleEscapeKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent.key === 'Escape' && this._state.open) {
      keyboardEvent.preventDefault();
      this.closeDropdown();
    }
  }

  /**
   * Open calendar dropdown
   *
   * PORTED FROM: open-dropdown! in date_picker.cljs
   */
  private openDropdown(): void {
    if (this._state.open) return;
    if (isMobileTouch()) return;

    this.updateState({ open: true });

    // Dispatch open event
    this.dispatchEvent(new CustomEvent('open', {
      bubbles: true,
      composed: true
    }));

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

        // Remove focus from any focused elements to prevent the blue outline
        const focusedElement = this.shadowRoot.activeElement as HTMLElement;
        if (focusedElement) {
          focusedElement.blur();
        }
      }
    });
  }

  /**
   * Close calendar dropdown
   * 
   * PORTED FROM: close-dropdown! in date_picker.cljs
   */
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
    }

    this.dispatchEvent(new CustomEvent('close', {
      bubbles: true,
      composed: true
    }));

    this.render();
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  /**
   * Clean up event listeners and state
   * 
   * PORTED FROM: cleanup! in date_picker.cljs
   */
  private cleanup(): void {
    // Remove document listeners
    if (this._clickListener) {
      document.removeEventListener('click', this._clickListener);
    }
    if (this._keydownListener) {
      document.removeEventListener('keydown', this._keydownListener);
    }

    // Remove dialog listener
    if (this._dialogClickListener && this.shadowRoot) {
      const dialog = this.shadowRoot.querySelector('.calendar-dialog');
      if (dialog) {
        dialog.removeEventListener('click', this._dialogClickListener);
      }
    }

    // Unlock scroll if open
    if (this._state.open) {
      const pickerId = `date-picker-${this.id || this.toString()}`;
      unlockScroll(pickerId);
    }

    // Clear references
    this._clickListener = undefined;
    this._keydownListener = undefined;
    this._dialogClickListener = undefined;
    this._timeInput = undefined;
  }
}

// Register custom element
if (!customElements.get('ty-date-picker')) {
  customElements.define('ty-date-picker', TyDatePicker);
}