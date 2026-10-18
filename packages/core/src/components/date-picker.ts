/**
 * TyDatePicker Web Component — read-only input stub + calendar dropdown
 * (modal <dialog>), optional time input, form participation via
 * ElementInternals. Value is a UTC instant (wall-clock with `native`);
 * display is local.
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
import { DEFAULT_SIZE } from '../types/common.js';
import type { PropertyChange } from '../utils/property-manager.js';
import { nativeMessage } from '../utils/validity.js';
import { parseDateTime, toISODay, wallClockDate, type DateTimeParts } from '../utils/calendar-utils.js';

/**
 * Internal date picker state
 */
interface DatePickerState extends DateTimeParts {
  withTime: boolean;
  open: boolean;
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
  value: string | null;        // What the form submits (see componentsToOutputValue)
  localValue: string | null;   // Local "2024-09-21", or "2024-09-21T10:30" with with-time
  milliseconds: number | null; // Epoch timestamp (date-only: when the day starts locally)
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
 * Convert internal components to Date object.
 */
function componentsToDateObject(components: DateTimeParts): Date | null {
  const { year, month, day, hour, minute, second } = components;

  if (!year || !month || !day) return null;

  // Not the constructor: it reads years 0-99 as 1900-1999. Noon is never
  // skipped by a clock change, so the day can't shift before setHours.
  const date = new Date(2000, 0, 1, 12);
  date.setFullYear(year, month - 1, day);
  date.setHours(hour || 0, minute || 0, second || 0, 0);
  return date;
}

/** Date-only mode ignores the time it keeps (see parseDateTime): the day starts at midnight. */
function effectiveComponents(components: DateTimeParts, withTime: boolean): DateTimeParts {
  return withTime ? components : { ...components, hour: 0, minute: 0, second: 0, epoch: undefined };
}

/**
 * Convert internal components to the submitted value.
 *
 * Default — a UTC ISO 8601 instant, unambiguous for a server:
 * - date+time: the picked moment, e.g. '2024-09-21T08:30:00.000Z'
 * - date-only: the moment the day starts in the browser's timezone,
 *   e.g. '2024-09-20T22:00:00.000Z' (midnight Sept 21 CEST = 10pm Sept 20 UTC)
 *
 * `native` — wall-clock with no zone, like the browser's own inputs:
 * '2024-09-21' (type=date) or '2024-09-21T10:30' (type=datetime-local).
 */
function componentsToOutputValue(components: DateTimeParts, withTime: boolean, native: boolean): string | null {
  if (!components.year || !components.month || !components.day) {
    return null;
  }

  const c = effectiveComponents(components, withTime);
  if (native) return componentsToLocalValue(c, withTime);
  if (c.epoch !== undefined) return new Date(c.epoch).toISOString();
  const dateObj = componentsToDateObject(c);
  return dateObj ? dateObj.toISOString() : null;
}

/**
 * Convert internal components to local datetime-local format.
 * 
 * For date+time mode: Outputs local datetime without timezone
 * Example: '2024-09-21T10:30' ('2024-09-21T10:30:45' with seconds)
 * 
 * For date-only mode: Outputs date only
 * Example: '2024-09-21'
 * 
 * This format matches HTML5 <input type="datetime-local"> and is useful
 * for setting other inputs or displaying local time without timezone conversion.
 */
function componentsToLocalValue(components: DateTimeParts, withTime: boolean): string | null {
  if (!components.year || !components.month || !components.day) {
    return null;
  }

  const year = components.year.toString().padStart(4, '0');
  const month = components.month.toString().padStart(2, '0');
  const day = components.day.toString().padStart(2, '0');

  if (withTime) {
    const hour = (components.hour || 0).toString().padStart(2, '0');
    const minute = (components.minute || 0).toString().padStart(2, '0');
    const second = components.second ? `:${components.second.toString().padStart(2, '0')}` : '';
    return `${year}-${month}-${day}T${hour}:${minute}${second}`;
  } else {
    return `${year}-${month}-${day}`;
  }
}

/**
 * The Date to format for display: the local moment, or with `native` the
 * wall-clock as written (formatted in UTC) — a time the clocks skip shows
 * as the value says, not shifted an hour.
 */
function displayDate(components: DateTimeParts, native: boolean): { date: Date | null; timeZone?: string } {
  return native
    ? { date: wallClockDate(components), timeZone: 'UTC' }
    : { date: componentsToDateObject(components) };
}

/**
 * Format components for display in input using Intl API.
 */
function formatDisplayValue(
  components: DateTimeParts,
  formatType: DateFormatType,
  locale: string,
  withTime: boolean,
  native: boolean
): string | null {
  if (!components.year || !components.month || !components.day) {
    return null;
  }

  const { date, timeZone } = displayDate(components, native);
  if (!date) return null;

  const options: Intl.DateTimeFormatOptions = {
    dateStyle: formatType || 'long',
    timeZone,
  };

  if (withTime) {
    options.timeStyle = 'short';
  }

  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
}

/**
 * TimeFields drives the two time inputs (hours, minutes) in the popup footer.
 * Each field takes two digits: a first digit that can't start a valid
 * two-digit value (3-9 for hours, 6-9 for minutes) completes the field at
 * once, and a completed hour moves focus to minutes. Arrow Up/Down step the
 * value (wrapping), Backspace in an untouched minutes field goes back to
 * hours, Left/Right cross between the fields.
 */
class TimeFields {
  private hour: number;
  private minute: number;
  private typed = '';

  constructor(
    private hourEl: HTMLInputElement,
    private minuteEl: HTMLInputElement,
    private onChange: (hour: number, minute: number) => void,
    hour = 0,
    minute = 0,
  ) {
    this.hour = hour;
    this.minute = minute;
    this.paint();
    this.wire(hourEl, 'hour');
    this.wire(minuteEl, 'minute');
  }

  private static pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  private paint(): void {
    this.hourEl.value = TimeFields.pad(this.hour);
    this.minuteEl.value = TimeFields.pad(this.minute);
  }

  private wire(el: HTMLInputElement, part: 'hour' | 'minute'): void {
    const max = part === 'hour' ? 23 : 59;
    // Largest first digit that can still take a second one (2x hours, 5x minutes)
    const maxLead = part === 'hour' ? 2 : 5;

    el.addEventListener('focus', () => {
      this.typed = '';
      el.select();
    });
    el.addEventListener('click', () => el.select());
    el.addEventListener('blur', () => { this.typed = ''; });
    // Everything goes through keydown; swallow stray input (IME, paste)
    el.addEventListener('input', () => this.paint());

    el.addEventListener('keydown', (e: KeyboardEvent) => {
      const set = (v: number) => {
        if (part === 'hour') this.hour = v; else this.minute = v;
        this.paint();
        this.onChange(this.hour, this.minute);
      };
      const current = part === 'hour' ? this.hour : this.minute;

      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        const digit = Number(e.key);
        const next = this.typed + e.key;
        const complete = next.length === 2 || (next.length === 1 && digit > maxLead);
        set(Math.min(Number(next), max));
        if (complete) {
          this.typed = '';
          if (part === 'hour') this.minuteEl.focus();
          else el.select();
        } else {
          this.typed = next;
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown': {
          e.preventDefault();
          const delta = e.key === 'ArrowUp' ? 1 : -1;
          this.typed = '';
          set((current + delta + max + 1) % (max + 1));
          el.select();
          return;
        }
        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          if (part === 'minute' && this.typed === '' && e.key === 'Backspace' && current === 0) {
            this.hourEl.focus();
            return;
          }
          this.typed = '';
          set(0);
          el.select();
          return;
        case 'ArrowLeft':
          if (part === 'minute') { e.preventDefault(); this.hourEl.focus(); }
          return;
        case 'ArrowRight':
          if (part === 'hour') { e.preventDefault(); this.minuteEl.focus(); }
          return;
        case 'Tab':
        case 'Escape':
        case 'Enter':
          return;
        default:
          // Letters, ':' etc. — the fields only take digits
          if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) e.preventDefault();
      }
    });
  }

  getTime(): { hour: number; minute: number } {
    return { hour: this.hour, minute: this.minute };
  }

  setTime(hour: number, minute: number): void {
    this.hour = hour;
    this.minute = minute;
    this.paint();
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
      default: DEFAULT_SIZE,
      validate: (v: any) => ["xs", "sm", "md", "lg", "xl"].includes(v),
      coerce: (v: any) => {
        if (!["xs", "sm", "md", "lg", "xl"].includes(v)) {
          console.warn(`[ty-date-picker] Invalid size '${v}'. Using '${DEFAULT_SIZE}'.`);
          return DEFAULT_SIZE;
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
    // Built-in × clear button; no-clear turns it off.
    noClear: {
      type: 'boolean' as const,
      visual: true,
      default: false
    },
    error: {
      type: 'string' as const,
      visual: true,
      default: ''
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
    },

    // Submit wall-clock values like the browser's own date inputs
    // (see componentsToOutputValue) instead of a UTC instant.
    native: {
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

  // initializeState() ran (first connect): value/with-time/native changes
  // before that wait for it, and the `value` getter normalizes on the fly.
  private _initialized = false;

  // syncFormValue() is writing the value it emits: the 'value' case doesn't
  // read it back (a date-only value would drop the time the picker keeps).
  private _syncing = false;

  private _timeInput?: TimeFields;

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
    // Moved in the DOM: keep the state (a date-only value would lose the
    // time it keeps if read back); only the popup is gone.
    if (this._initialized) this._state.open = false;
    else this.initializeState();

    this.render();
    this.updateFormValue();

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
          this.updateValidity();
          break;

        case 'noClear':
        case 'format':
        case 'locale':
        case 'error':
          // These properties just affect rendering, no internal state to update
          // TyComponent will call render() automatically for visual properties
          break;

        case 'value': {
          // The picker's own output: the state already holds it (and more —
          // the time a date-only value leaves out)
          if (!this._initialized || this._syncing) break;
          // A value from outside replaces the date (null/garbage: clears it)
          this._state = {
            withTime: this._state.withTime,
            open: this._state.open,
            ...parseDateTime(newValue as string),
          };
          // Heals the property back to the normalized form syncFormValue
          // pushes into ElementInternals — otherwise a raw value (another
          // format, garbage, or one from formResetCallback's
          // setProperty(name, def)) sticks as `.value`, diverging from what
          // FormData submits.
          this.syncFormValue();
          break;
        }

        case 'with-time': {
          if (!this._initialized) break;
          const newWithTime = newValue as boolean;

          if (newWithTime !== this._state.withTime) {
            this._state.withTime = newWithTime;
            // Same day (and time), new shape
            this.syncFormValue();
            this.updateValidity(); // a date or a datetime-local message
          }
          break;
        }

        case 'native':
          // Same day, new shape
          if (this._initialized) this.syncFormValue();
          break;
      }
    }
  }


  /**
   * Get form value - the submitted string from current state (see
   * componentsToOutputValue). TyComponent calls this automatically when the
   * value property changes.
   */
  protected getFormValue(): FormDataEntryValue | null {
    return this.outputValue(this.getComponents());
  }

  private outputValue(components: DateTimeParts): string | null {
    return componentsToOutputValue(components, this._state.withTime, !!this.getProperty('native'));
  }

  protected updateFormValue(): void {
    // Empty submits name= like a native <input type="date">, not nothing
    this._internals.setFormValue(this.getFormValue() ?? '');
    this.updateValidity();
  }

  /** The field's focusable element: the stub, or the native input on touch devices. */
  private focusTarget(): HTMLElement | null {
    return this.shadowRoot?.querySelector<HTMLElement>('.native-date-input')
      ?? this.shadowRoot?.querySelector<HTMLElement>('.date-picker-stub')
      ?? null;
  }

  /** Focus the field: the host itself isn't focusable. Disabled: nothing, like a native input. */
  focus(options?: FocusOptions): void {
    if (this.getProperty('disabled')) return;
    const target = this.focusTarget();
    if (target) target.focus(options);
    else super.focus(options);
  }

  /**
   * `required` used to be cosmetic: nothing reported valueMissing, so an empty
   * required picker never blocked its form. Disabled pickers don't validate.
   * The message is a native date (datetime-local with time) input's.
   */
  private updateValidity(): void {
    if (this.getProperty('disabled') || !this.getProperty('required') || this.getFormValue()) {
      this.applyValidity({});
      return;
    }
    const type = this._state.withTime ? 'datetime-local' : 'date';
    this.applyValidity({ valueMissing: true }, nativeMessage('input', { type, required: true }), this.focusTarget() ?? undefined);
  }

  private getComponents(): DateTimeParts {
    return {
      year: this._state.year,
      month: this._state.month,
      day: this._state.day,
      hour: this._state.hour,
      minute: this._state.minute,
      second: this._state.second,
      epoch: this._state.epoch,
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
  private getFormattedValue(components?: DateTimeParts): string | null {
    const c = components || this.getComponents();
    if (!c.year || !c.month || !c.day) return null;
    return formatDisplayValue(
      c,
      (this.getProperty('format') as DateFormatType) || 'long',
      getEffectiveLocale(this, this.getProperty('locale')),
      this._state.withTime,
      !!this.getProperty('native')
    );
  }

  /**
   * Initialize component state from attributes
   */
  private initializeState(): void {
    this._state = {
      ...parseDateTime(this.getProperty('value')),
      withTime: this.getProperty('with-time'),
      open: false,
    };

    this._initialized = true;
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
    const formValue = this.getFormValue() as string | null;
    const currentValue = this.getProperty('value');

    // Only update property if value actually changed (prevents circular triggers)
    if (formValue !== currentValue) {
      // Use property setter to maintain TyComponent lifecycle
      // This will automatically handle attribute sync and form value update
      this._syncing = true;
      try {
        this.setProperty('value', formValue || null);
      } finally {
        this._syncing = false;
      }
    }

    // Form value sync handled automatically by TyComponent (formValue: true)
  }

  /**
   * Handle time changes from the footer's hour/minute fields
   */
  handleTimeInputChange(hour: number, minute: number): void {
    if (!this.hasDate()) return;

    // The fields show no seconds: an edited time has none
    const components = { ...this.getComponents(), hour, minute, second: 0, epoch: undefined };
    this.updateState(components, true);
    this.emitChangeEvent(components, 'time-change');
    this.updateTimeSummary();
    this.revealValidity();
  }

  /** Footer summary under the time fields: "Wed, Sep 23 · 14:30" + local ISO. */
  private updateTimeSummary(summary: Element | null | undefined = this.shadowRoot?.querySelector('.time-summary')): void {
    if (!summary) return;
    const c = this.getComponents();
    const text = summary.querySelector('.time-summary-date') as HTMLElement;
    const iso = summary.querySelector('.time-summary-iso') as HTMLElement;
    if (!c.year || !c.month || !c.day) {
      text.textContent = 'Pick a day';
      iso.textContent = '';
      return;
    }
    const locale = getEffectiveLocale(this, this.getProperty('locale')) || undefined;
    const { date, timeZone } = displayDate(c, !!this.getProperty('native'));
    const day = new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'short', day: 'numeric', timeZone }).format(date!);
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone }).format(date!);
    text.textContent = `${day} · ${time}`;
    iso.textContent = componentsToLocalValue(c, true) ?? '';
  }

  private emitChangeEvent(components: DateTimeParts | null, source: 'selection' | 'time-change' | 'clear' | 'external'): void {
    const value = components ? this.outputValue(components) : null;
    const localValue = components ? componentsToLocalValue(components, this._state.withTime) : null;
    const effective = components && effectiveComponents(components, this._state.withTime);
    const milliseconds = effective
      ? effective.epoch ?? componentsToDateObject(effective)?.getTime() ?? null
      : null;
    const formatted = components ? this.getFormattedValue(components) : null;

    const detail: DatePickerChangeDetail = {
      value,
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

  get noClear(): boolean { return this.getProperty('noClear'); }
  set noClear(v: boolean) { this.setProperty('noClear', v); }

  get min(): string { return this.getProperty('min'); }
  set min(v: string) { this.setProperty('min', v ?? ''); }

  get max(): string { return this.getProperty('max'); }
  set max(v: string) { this.setProperty('max', v ?? ''); }

  get withTime(): boolean { return this.getProperty('with-time'); }
  set withTime(v: boolean) { this.setProperty('with-time', v); }

  get native(): boolean { return this.getProperty('native'); }
  set native(v: boolean) { this.setProperty('native', v); }

  get error(): string { return this.getProperty('error'); }
  set error(v: string) { this.setProperty('error', v); }

  // Value keeps custom accessors (format normalization)
  /**
   * Get current value — the string the form submits: a UTC ISO instant, or
   * wall-clock ('YYYY-MM-DD' / 'YYYY-MM-DDTHH:mm') with `native`. null when
   * empty (the form then submits name=, like a native date input).
   */
  get value(): string | null {
    if (this._initialized) return this.getProperty('value') || null;
    // Not connected yet: the raw value, as it will submit once it is
    const parsed = parseDateTime(this.getProperty('value'));
    return parsed && componentsToOutputValue(parsed, !!this.getProperty('with-time'), !!this.getProperty('native'));
  }

  /**
   * Set value: any format parseDateTime() reads, a Date, epoch milliseconds,
   * or null. It's normalized to the submitted form.
   *
   * When set to null/undefined/empty string, the attribute is removed.
   */
  set value(val: string | number | Date | null) {
    if (val === null || val === undefined || val === '') {
      this.setProperty('value', null);  // TyComponent will remove attribute
    } else if (typeof val === 'string') {
      this.setProperty('value', val);
    } else {
      const date = new Date(val);
      this.setProperty('value', isNaN(date.getTime()) ? null : date.toISOString());
    }
  }

  /**
   * Clear the date value programmatically WITH a change event (source:
   * 'clear'). Works regardless of `no-clear` — lets any
   * external trigger (e.g. a button elsewhere in the page) clear the value
   * without needing the built-in clear button. Mirrors ty-select's clear().
   */
  clear(): void {
    this.clearValue();
  }

  private buildStubClasses(): string {
    const classes = ['date-picker-stub'];

    if (this.getProperty('disabled')) classes.push('disabled');
    if (this.getProperty('required')) classes.push('required');
    // The error's background; its danger accent comes from the attribute (styles: errorLook)
    if (this.getProperty('error')) classes.push('error');
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
      // Only the stub's own keys: Enter/Space on the clear button clear
      if (this._state.open || e.target !== stub) return;
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

    const clearable = !this.getProperty('noClear');
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

  private createTimeField(part: 'hour' | 'minute'): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = `time-input time-${part}`;
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    input.maxLength = 2;
    input.setAttribute('aria-label', part === 'hour' ? 'Hours' : 'Minutes');
    return input;
  }

  /** Footer: clock + "Time" on the left, HH : MM on the right, summary below. */
  private renderTimeSection(): HTMLElement {
    const timeSection = document.createElement('div');
    timeSection.className = 'time-section';
    timeSection.setAttribute('role', 'group');
    timeSection.setAttribute('aria-label', 'Time');

    const row = document.createElement('div');
    row.className = 'time-row';

    const label = document.createElement('span');
    label.className = 'time-label';
    const icon = document.createElement('span');
    icon.className = 'time-icon';
    icon.innerHTML = SCHEDULE_ICON_SVG;
    label.appendChild(icon);
    label.appendChild(document.createTextNode('Time'));

    const fields = document.createElement('div');
    fields.className = 'time-fields';
    const hourEl = this.createTimeField('hour');
    const minuteEl = this.createTimeField('minute');
    const colon = document.createElement('span');
    colon.className = 'time-colon';
    colon.textContent = ':';
    fields.appendChild(hourEl);
    fields.appendChild(colon);
    fields.appendChild(minuteEl);

    this._timeInput = new TimeFields(
      hourEl,
      minuteEl,
      (hour, minute) => this.handleTimeInputChange(hour, minute),
      this._state.hour || 0,
      this._state.minute || 0,
    );

    row.appendChild(label);
    row.appendChild(fields);

    const summary = document.createElement('div');
    summary.className = 'time-summary';
    summary.setAttribute('aria-live', 'polite');
    const summaryDate = document.createElement('span');
    summaryDate.className = 'time-summary-date';
    const summaryIso = document.createElement('span');
    summaryIso.className = 'time-summary-iso';
    summary.appendChild(summaryDate);
    summary.appendChild(summaryIso);

    this.updateTimeSummary(summary);

    timeSection.appendChild(row);
    timeSection.appendChild(summary);
    return timeSection;
  }

  private renderCalendarDropdown(): HTMLDialogElement {
    const dialog = document.createElement('dialog');
    dialog.className = 'calendar-dialog';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'calendar-content';

    const calendar = document.createElement('ty-calendar') as any;

    if (this._state.year && this._state.month && this._state.day) {
      // 4 digits, as ty-calendar reads the year (99 -> "0099")
      calendar.setAttribute('year', String(this._state.year).padStart(4, '0'));
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

    const flavor = this.calendarFlavor();
    if (flavor) calendar.setAttribute('flavor', flavor);

    calendar.addEventListener('change', (e: Event) => this.handleCalendarChange(e));

    contentWrapper.appendChild(calendar);

    if (this._state.withTime) {
      contentWrapper.appendChild(this.renderTimeSection());
    }

    dialog.appendChild(contentWrapper);

    // Closed by someone else — a ty-modal around the picker closes the
    // dialogs still open inside it: run our own close, so the open state,
    // aria-expanded and the scroll lock follow. The `open` attribute, not the
    // `close` event: that one comes a task later, so right after modal.hide()
    // the stub would still say expanded. Our own close lands here with the
    // state already closed, a picker removed meanwhile has cleaned up
    // (onDisconnect): both no-ops. A dialog our own close replaced (render()
    // rebuilds it) reports that close a microtask later: by then a click in
    // the same task may have opened the new one, which stays open.
    new MutationObserver(() => {
      if (this._state.open && !dialog.open && dialog.isConnected && this.isConnected) this.closeDropdown();
    }).observe(dialog, { attributes: true, attributeFilter: ['open'] });

    return dialog;
  }

  /**
   * Match the popup calendar to the stub's look: danger while an error
   * shows, as on the stub (styles: errorLook), else the user's flavor.
   * 'default' is the stub's own unstyled state, not a real flavor: the
   * calendar stays on its own default.
   */
  private calendarFlavor(): string | null {
    if (this.getProperty('error')) return 'danger';
    const flavor = this.getProperty('flavor');
    return flavor && flavor !== 'default' ? flavor : null;
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
    this.syncNativeInput(input);
    const localValue = input.value;

    // Placeholder span (native date inputs ignore placeholder attr)
    const placeholder = this.getProperty('placeholder') || 'Select date...';
    const formattedValue = this.getFormattedValue();
    const placeholderEl = document.createElement('span');
    placeholderEl.className = 'stub-text' + (formattedValue ? '' : ' placeholder');
    placeholderEl.textContent = formattedValue || placeholder;

    input.addEventListener('change', () => {
      if (!input.value) {
        this.clearValue();
      } else {
        const parsed = parseDateTime(input.value);
        if (parsed) {
          // A new day (type=date) keeps the time, like the calendar; a
          // user edit drops the loaded instant
          const { hour, minute, second } = this._state.withTime ? parsed : this._state;
          const components = { ...parsed, hour, minute, second, epoch: undefined };
          this.updateState(components, true);
          this.emitChangeEvent(components, 'selection');
        }
      }
      this.revealValidity();
    });

    // Start slot — leading icon
    const startSlot = document.createElement('slot');
    startSlot.name = 'start';

    stub.appendChild(startSlot);
    stub.appendChild(input);
    stub.appendChild(placeholderEl);

    const iconContainer = document.createElement('div');
    iconContainer.className = 'stub-icons';

    const clearable = !this.getProperty('noClear');
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
   * The touch devices' native input follows the picker: type (date, or
   * datetime-local with time), disabled, required, min/max (datetime-local
   * wants a time suffix) and value — also when they change at runtime.
   */
  private syncNativeInput(input: HTMLInputElement): void {
    const withTime = this._state.withTime;
    // Type first: the value is sanitized for the type it's set under
    input.type = withTime ? 'datetime-local' : 'date';
    input.disabled = !!this.getProperty('disabled');
    input.required = !!this.getProperty('required');
    const min = toISODay(this.getProperty('min'));
    const max = toISODay(this.getProperty('max'));
    if (min) input.min = withTime ? `${min}T00:00` : min;
    else input.removeAttribute('min');
    if (max) input.max = withTime ? `${max}T23:59` : max;
    else input.removeAttribute('max');
    input.value = componentsToLocalValue(this.getComponents(), withTime) ?? '';
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
      this.syncErrorLine();
      this.updateValidity(); // re-anchor to the new field
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

    // FULL REBUILD: Dialog is closed or doesn't exist. It replaces the
    // focused stub (an `error` a form library sets after focusing the
    // field, a clear): the focus stays on the field, like ty-input's.
    const hadFocus = !!this.shadowRoot.activeElement;
    this.shadowRoot.innerHTML = '';

    const container = this.renderContainer();
    const wrapper = document.createElement('div');
    wrapper.className = 'dropdown-wrapper';

    wrapper.appendChild(this.renderStub());
    wrapper.appendChild(this.renderCalendarDropdown());

    container.appendChild(wrapper);
    this.shadowRoot.appendChild(container);
    this.syncErrorLine();

    this.setupEventListeners();
    this.updateValidity(); // re-anchor to the new stub
    if (hadFocus) this.focus({ preventScroll: true });
  }

  /**
   * The `error` line under the field — same markup as ty-input's; the field
   * (stub, or the native input on touch devices) is described by it.
   */
  private syncErrorLine(): void {
    const container = this.shadowRoot?.querySelector('.dropdown-container');
    if (!container) return;
    const error = this.getProperty('error');
    const errorId = `date-picker-error-${getElementHash(this)}`;
    let line = container.querySelector(':scope > .error-message');
    if (error) {
      if (!line) {
        line = document.createElement('div');
        line.className = 'error-message';
        line.id = errorId;
        container.appendChild(line);
      }
      line.textContent = error;
      this.focusTarget()?.setAttribute('aria-describedby', errorId);
    } else {
      line?.remove();
      this.focusTarget()?.removeAttribute('aria-describedby');
    }
  }

  /**
   * Update display without destroying DOM (for open dialog)
   */
  private updateDisplay(): void {
    if (!this.shadowRoot) return;

    const formattedValue = this.getFormattedValue();
    const placeholder = this.getProperty('placeholder') || 'Select date...';
    const hasValue = this.hasDate();
    const clearable = !this.getProperty('noClear');
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

    const stub = this.shadowRoot.querySelector('.date-picker-stub');
    if (stub) stub.className = this.buildStubClasses();
    this.syncErrorLine();

    // Mobile: also sync the native input (with-time may have changed its type)
    if (isMobileTouch()) {
      const nativeInput = this.shadowRoot.querySelector('.native-date-input') as HTMLInputElement;
      if (nativeInput) this.syncNativeInput(nativeInput);
      stub?.toggleAttribute('disabled', !!isDisabled);
      return;
    }

    // Desktop: update calendar and time input
    const calendar = this.shadowRoot.querySelector('ty-calendar') as any;
    if (calendar && hasValue) {
      calendar.setAttribute('year', String(this._state.year).padStart(4, '0'));
      calendar.setAttribute('month', this._state.month!.toString());
      calendar.setAttribute('day', this._state.day!.toString());
    }

    // Keep an already-open popup's flavor/bounds in sync. render() only
    // rebuilds (and re-forwards these) while the dialog is CLOSED — while
    // open it takes this partial-update path instead, so without this the
    // calendar would stay stuck on whatever flavor/min/max was active when
    // it was opened.
    if (calendar) {
      const flavor = this.calendarFlavor();
      if (flavor) calendar.setAttribute('flavor', flavor);
      else calendar.removeAttribute('flavor');

      const min = this.getProperty('min');
      const max = this.getProperty('max');
      if (min) calendar.setAttribute('min', min);
      else calendar.removeAttribute('min');
      if (max) calendar.setAttribute('max', max);
      else calendar.removeAttribute('max');
    }

    if (this._timeInput && this._state.hour !== undefined && this._state.minute !== undefined) {
      this._timeInput.setTime(this._state.hour, this._state.minute);
    }
    this.updateTimeSummary();
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
      unlockScroll(`date-picker-${getElementHash(this)}`);
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
      second: undefined,
      epoch: undefined,
    }, true);

    this.value = null;
    this.emitChangeEvent(null, 'clear');
    this.render();
  }

  private handleClearClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.clearValue();
    // Touch devices: the × just went display:none (updateDisplay) and takes
    // the focus with it; the desktop rebuild keeps it on the stub already.
    // Focus the app's change handler moved elsewhere stays there.
    const active = document.activeElement;
    if (this.matches(':focus-within') || !active || active === document.body) {
      this.shadowRoot?.querySelector<HTMLElement>('.native-date-input')?.focus({ preventScroll: true });
    }
    // A user change: show the message now if that left the field invalid
    this.revealValidity();
  }

  private handleCalendarChange(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const customEvent = event as CustomEvent;
    const detail = customEvent.detail;
    const dayContext = detail.dayContext;

    if (!dayContext) return;

    const newComponents: DateTimeParts = {
      year: dayContext.year,
      month: dayContext.month,
      day: dayContext.dayInMonth,
      hour: this._state.hour,
      minute: this._state.minute,
      second: this._state.second,
      epoch: undefined,
    };

    // Force sync when calendar date changes
    this.updateState(newComponents, true);
    this.emitChangeEvent(newComponents, 'selection');
    this.revealValidity();

    if (!this._state.withTime) {
      this.closeDropdown();
    } else {
      // Auto-focus time input after date selection
      requestAnimationFrame(() => {
        if (!this.shadowRoot) return;
        this.updateTimeSummary();
        const timeInput = this.shadowRoot.querySelector('.time-hour') as HTMLInputElement;
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
      // Closed or removed since (removal cleaned up already), or no longer
      // shown: a ty-modal around it closed in the same task. showModal()
      // would throw on a detached dialog, or float the calendar over the
      // page with the scroll locked and nothing left to close it.
      if (!this._state.open || !this.isConnected) return;
      if (this.shadowRoot.querySelector('.date-picker-stub')?.checkVisibility() === false) {
        this.closeDropdown();
        return;
      }

      const dialog = this.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
      if (dialog) {
        const pickerId = `date-picker-${getElementHash(this)}`;
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
    const pickerId = `date-picker-${getElementHash(this)}`;

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
    // Back on the field (the rebuilt stub), like a native picker closing
    this.focus();
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
      const pickerId = `date-picker-${getElementHash(this)}`;
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