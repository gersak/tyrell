/**
 * TyInput Web Component - text input with label, error, icon slots and
 * locale-aware numeric formatting (format-on-blur / raw-on-focus via a parsed
 * "shadow value"). Debounce 0-5000ms; blur flushes any pending debounced event.
 */

import type { Flavor, Size, InputType, TyInputElement } from '../types/common.js'
import { DEFAULT_SIZE } from '../types/common.js'
import { TyComponent } from '../base/ty-component.js'
import type { PropertyChange } from '../utils/property-manager.js'
import { ensureStyles } from '../utils/styles.js'
import { syncCustomFlavorSheet } from '../utils/flavor-sheet.js'
import { inputStyles, inputCustomFlavorCss } from '../styles/input.js'
import {
  formatNumber,
  parseNumericValue,
  shouldFormat as shouldFormatType,
  type FormatConfig
} from '../utils/number-format.js'
import { getEffectiveLocale, observeLocaleChanges } from '../utils/locale.js'

import { REQUIRED_ICON_SVG } from '../utils/icons.js'
import { nativeMessage, nativeValidity, lengthValidity, toLimit } from '../utils/validity.js'

/** Password reveal toggle icons (Lucide eye / eye-off) */
const EYE_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`
const EYE_OFF_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`

interface InputState {
  // Shadow value - parsed numeric value for formatting
  shadowValue: number | string | null

  // Focus state - toggles format/raw display
  isFocused: boolean

  // Listener setup tracking
  listenersSetup: boolean

  // Event handler references (for cleanup)
  inputHandler: ((e: Event) => void) | null
  changeHandler: ((e: Event) => void) | null
  focusHandler: ((e: Event) => void) | null
  blurHandler: ((e: Event) => void) | null

  // Debounce timers
  inputDebounceTimer: number | null
  changeDebounceTimer: number | null

  // Locale observer cleanup
  localeObserver?: () => void
}

export class TyInput extends TyComponent<InputState> implements TyInputElement {
  static formAssociated = true

  // PROPERTY CONFIGURATION - Declarative property lifecycle
  protected static properties = {
    type: {
      type: 'string' as const,
      visual: true,
      default: 'text',
      validate: (v: any) => {
        const validTypes: InputType[] = [
          'text', 'email', 'password', 'number', 'tel', 'url',
          'currency', 'percent', 'compact'
        ]
        return validTypes.includes(v)
      },
      coerce: (v: any) => {
        const validTypes: InputType[] = [
          'text', 'email', 'password', 'number', 'tel', 'url',
          'currency', 'percent', 'compact'
        ]
        if (!validTypes.includes(v)) {
          console.warn(`[ty-input] Invalid type '${v}'. Using 'text'.`)
          return 'text'
        }
        return v
      }
    },
    value: {
      type: 'string' as const,
      visual: true,
      formValue: true,
      emitChange: true,
      default: ''
    },
    name: {
      type: 'string' as const,
      default: ''
    },
    placeholder: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
    label: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
    disabled: {
      type: 'boolean' as const,
      visual: true,
      default: false
    },
    required: {
      type: 'boolean' as const,
      visual: true,
      default: false
    },
    // Native constraint rules. pattern/minlength/maxlength check text types;
    // min/max check the numeric value of number/currency/percent/compact.
    // Unset ('') means no rule.
    pattern: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
    minlength: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
    maxlength: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
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
    // Wording for the length messages; the browser only supplies too-short
    // for typed text (see lengthValidity). Placeholders: {minlength}
    // {maxlength} {length}.
    tooShortMessage: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
    tooLongMessage: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
    error: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
    size: {
      type: 'string' as const,
      visual: true,
      default: DEFAULT_SIZE,
      validate: (v: any) => ["xs", "sm", "md", "lg", "xl"].includes(v),
      coerce: (v: any) => {
        if (!["xs", "sm", "md", "lg", "xl"].includes(v)) {
          console.warn(`[ty-input] Invalid size '${v}'. Using '${DEFAULT_SIZE}'.`)
          return DEFAULT_SIZE
        }
        return v
      }
    },
    // Any string is accepted: built-ins get static CSS, other identifiers
    // become custom flavors (see _syncCustomFlavor), garbage degrades to
    // the default look.
    flavor: {
      type: 'string' as const,
      visual: true,
      default: 'neutral'
    },
    currency: {
      type: 'string' as const,
      visual: true,
      default: 'USD'
    },
    locale: {
      type: 'string' as const,
      visual: true,
      default: 'en-US'
    },
    precision: {
      type: 'number' as const,
      visual: true,
      default: undefined,
      validate: (v: any) => {
        if (v === undefined || v === null) return true
        return typeof v === 'number' && v >= 0 && v <= 10
      },
      coerce: (v: any) => {
        if (v === undefined || v === null) return undefined
        const num = Number(v)
        if (isNaN(num)) return undefined
        return Math.max(0, Math.min(10, Math.floor(num)))
      }
    },
    debounce: {
      type: 'number' as const,
      default: 0,
      validate: (v: any) => {
        const num = Number(v)
        return !isNaN(num) && num >= 0 && num <= 5000
      },
      coerce: (v: any) => {
        const num = Number(v)
        if (isNaN(num)) return 0
        return Math.max(0, Math.min(5000, Math.floor(num)))
      }
    }
  }

  // INTERNAL STATE - Not managed by PropertyManager
  // NOTE: _internals provided by TyComponent base class

  // Shadow value - parsed numeric value for formatting
  private _shadowValue: number | string | null = null

  // Focus state - toggles format/raw display
  private _isFocused = false

  // Listener setup tracking
  private _listenersSetup = false

  private _customFlavorSheet: CSSStyleSheet | null = null

  // Store references to handlers for cleanup
  private _inputHandler: ((e: Event) => void) | null = null
  private _changeHandler: ((e: Event) => void) | null = null
  private _focusHandler: ((e: Event) => void) | null = null
  private _blurHandler: ((e: Event) => void) | null = null

  // Debounce timers
  private _inputDebounceTimer: number | null = null
  private _changeDebounceTimer: number | null = null

  // Locale observer cleanup function
  private _localeObserver?: () => void

  constructor() {
    super()  // TyComponent handles attachInternals() and attachShadow()

    const shadow = this.shadowRoot!
    ensureStyles(shadow, { css: inputStyles, id: 'ty-input' })
  }

  /** TyComponent already handled pre-connection property capture. */
  protected onConnect(): void {
    // First connect only. Typing lives in _shadowValue, not the `value`
    // property, so re-reading it on a move would wipe the user's edit.
    if (!this._rendered) this.initializeShadowValue()

    // NOTE: Event listeners are set up in render() after input element is created
    // setupEventListeners() will be called after initial render

    // Setup locale observer to watch for ancestor lang changes
    this._localeObserver = observeLocaleChanges(this, () => {
      this.render()
    })

    this._syncCustomFlavor()

    // Put back after a disconnect: its listeners went with it, and changes
    // made meanwhile (an error set while detached) never rendered.
    if (this._rendered) {
      this.render()
      this.setupEventListeners()
    }
  }

  /** Custom (non-built-in) flavors — see utils/flavor-sheet.ts. */
  private _syncCustomFlavor(): void {
    this._customFlavorSheet = syncCustomFlavorSheet(
      this.shadowRoot!,
      this._customFlavorSheet,
      this.flavor,
      ({ base }) => inputCustomFlavorCss(base)
    )
  }

  protected onDisconnect(): void {
    this.removeEventListeners()

    if (this._localeObserver) {
      this._localeObserver()
      this._localeObserver = undefined
    }

    if (this._inputDebounceTimer !== null) {
      clearTimeout(this._inputDebounceTimer)
      this._inputDebounceTimer = null
    }
    if (this._changeDebounceTimer !== null) {
      clearTimeout(this._changeDebounceTimer)
      this._changeDebounceTimer = null
    }
  }

  // TYCOMPONENT LIFECYCLE HOOKS

  /** Handle property changes — called BEFORE render. */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    for (const { name, newValue } of changes) {
      switch (name) {
        case 'flavor':
          this._syncCustomFlavor()
          break

        case 'value':
          // Parse to shadow value for numeric types
          this._shadowValue = this.parseShadowValue(newValue || '')
          break

        case 'type':
          const currentValue = this.getProperty('value') || ''
          this._shadowValue = this.parseShadowValue(currentValue)
          break
      }
    }
  }

  protected onFormReset(): void {
    // Base class restored `value` to its attribute-declared default —
    // re-derive the parsed shadow value (and form value) from it.
    this._shadowValue = null
    this.initializeShadowValue()

    this._isFocused = false

    if (this._inputDebounceTimer !== null) {
      clearTimeout(this._inputDebounceTimer)
      this._inputDebounceTimer = null
    }
    if (this._changeDebounceTimer !== null) {
      clearTimeout(this._changeDebounceTimer)
      this._changeDebounceTimer = null
    }
    this.render()
  }

  /**
   * Override form value to return shadow value
   * This ensures numeric types submit their parsed values
   */
  protected getFormValue(): FormDataEntryValue | null {
    const formValue = this._shadowValue !== null ? String(this._shadowValue) : ''
    return formValue
  }

  private initializeShadowValue(): void {
    const currentValue = this.getProperty('value')
    if (currentValue) {
      this._shadowValue = this.parseShadowValue(currentValue)
      this._internals.setFormValue(
        this._shadowValue !== null ? String(this._shadowValue) : ''
      )
    } else {
      // Empty still submits name= (like a native input), not nothing
      this._internals.setFormValue('')
    }
  }

  private parseShadowValue(value: string): number | string | null {
    // Defensive check: ensure value is actually a string before calling .trim()
    if (!value || typeof value !== 'string' || value.trim() === '') return null

    if (shouldFormatType(this.type)) {
      const parsed = parseNumericValue(value)
      if (parsed !== null && this.precision === 0) {
        return Math.round(parsed)
      }
      return parsed
    }

    return value
  }

  private shouldFormat(): boolean {
    return shouldFormatType(this.type) &&
      !this._isFocused &&
      this._shadowValue !== null &&
      typeof this._shadowValue === 'number'
  }

  private getFormatConfig(): FormatConfig {
    return {
      type: this.type as 'number' | 'currency' | 'percent' | 'compact',
      locale: this.locale,  // Use getter which calls getEffectiveLocale correctly
      currency: this.currency,
      precision: this.precision
    }
  }

  private getDisplayValue(): string {
    if (this.shouldFormat()) {
      let valueToFormat = this._shadowValue as number

      // For percent: divide by 100 (user enters 15, displays as 15%)
      if (this.type === 'percent') {
        valueToFormat = valueToFormat / 100
      }

      return formatNumber(valueToFormat, this.getFormatConfig())
    }

    return this._shadowValue !== null ? String(this._shadowValue) : ''
  }

  // PROPERTY ACCESSORS

  get type(): InputType { return this.getProperty('type') }
  set type(v: InputType) { this.setProperty('type', v) }

  // Value - special getter returns shadow value
  get value(): string {
    return this._shadowValue !== null ? String(this._shadowValue) : ''
  }
  set value(v: string) { this.setProperty('value', v) }

  get name(): string { return this.getProperty('name') }
  set name(v: string) { this.setProperty('name', v) }

  get placeholder(): string { return this.getProperty('placeholder') }
  set placeholder(v: string) { this.setProperty('placeholder', v) }

  get label(): string { return this.getProperty('label') }
  set label(v: string) { this.setProperty('label', v) }

  get disabled(): boolean { return this.getProperty('disabled') }
  set disabled(v: boolean) { this.setProperty('disabled', v) }

  /** Focus the inner <input>: the host itself isn't focusable. */
  focus(options?: FocusOptions): void {
    (this.shadowRoot?.querySelector('input') as HTMLInputElement | null)?.focus(options)
  }

  get required(): boolean { return this.getProperty('required') }
  set required(v: boolean) { this.setProperty('required', v) }

  get pattern(): string { return this.getProperty('pattern') }
  set pattern(v: string) { this.setProperty('pattern', v ?? '') }

  get minLength(): number { return toLimit(this.getProperty('minlength')) ?? -1 }
  set minLength(v: number) { this.setProperty('minlength', v == null || v < 0 ? '' : String(v)) }

  get maxLength(): number { return toLimit(this.getProperty('maxlength')) ?? -1 }
  set maxLength(v: number) { this.setProperty('maxlength', v == null || v < 0 ? '' : String(v)) }

  get min(): string { return this.getProperty('min') }
  set min(v: string) { this.setProperty('min', v == null ? '' : String(v)) }

  get max(): string { return this.getProperty('max') }
  set max(v: string) { this.setProperty('max', v == null ? '' : String(v)) }

  get tooShortMessage(): string { return this.getProperty('tooShortMessage') }
  set tooShortMessage(v: string) { this.setProperty('tooShortMessage', v ?? '') }

  get tooLongMessage(): string { return this.getProperty('tooLongMessage') }
  set tooLongMessage(v: string) { this.setProperty('tooLongMessage', v ?? '') }

  get error(): string { return this.getProperty('error') }
  set error(v: string) { this.setProperty('error', v) }

  get size(): Size { return this.getProperty('size') as Size }
  set size(v: Size) { this.setProperty('size', v) }

  get flavor(): Flavor { return this.getProperty('flavor') as Flavor }
  set flavor(v: Flavor) { this.setProperty('flavor', v) }

  get currency(): string { return this.getProperty('currency') }
  set currency(v: string) { this.setProperty('currency', v) }

  // Locale - special getter uses getEffectiveLocale()
  get locale(): string {
    return getEffectiveLocale(this, this.getProperty('locale'))
  }
  set locale(v: string) { this.setProperty('locale', v) }

  get precision(): number | undefined { return this.getProperty('precision') }
  set precision(v: number | string | undefined) { this.setProperty('precision', v) }

  get debounce(): number { return this.getProperty('debounce') }
  set debounce(v: number | string) { this.setProperty('debounce', v) }

  get form(): HTMLFormElement | null {
    return this._internals.form
  }

  private buildClassList(): string {
    const classes: string[] = []

    if (this.disabled) classes.push('disabled')
    if (this.required) classes.push('required')
    if (this.error) classes.push('error')

    return classes.join(' ')
  }

  private dispatchInputEvent(rawValue: string, originalEvent: Event): void {
    this.dispatchEvent(new CustomEvent('input', {
      detail: {
        value: this._shadowValue,
        formattedValue: this.shouldFormat() ? this.getDisplayValue() : null,
        rawValue: rawValue,
        originalEvent: originalEvent
      },
      bubbles: true,
      composed: true
    }))
  }

  private dispatchChangeEvent(rawValue: string, originalEvent: Event): void {
    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        value: this._shadowValue,
        formattedValue: this.shouldFormat() ? this.getDisplayValue() : null,
        rawValue: rawValue,
        originalEvent: originalEvent
      },
      bubbles: true,
      composed: true
    }))
  }

  private removeEventListeners(): void {
    if (!this._listenersSetup) return

    const shadow = this.shadowRoot
    if (!shadow) return

    const inputEl = shadow.querySelector('input')
    if (!inputEl) return

    if (this._inputHandler) {
      inputEl.removeEventListener('input', this._inputHandler)
      this._inputHandler = null
    }

    if (this._changeHandler) {
      inputEl.removeEventListener('change', this._changeHandler)
      this._changeHandler = null
    }

    if (this._focusHandler) {
      inputEl.removeEventListener('focus', this._focusHandler)
      this._focusHandler = null
    }

    if (this._blurHandler) {
      inputEl.removeEventListener('blur', this._blurHandler)
      this._blurHandler = null
    }
    inputEl.removeEventListener('keydown', this._implicitSubmit)

    this._listenersSetup = false
  }

  /** IMPORTANT: Only called ONCE, not on every render. */
  /**
   * Enter submits the owning form, like a native input (HTML implicit
   * submission): through the form's default button when it has one (nothing
   * if that button is disabled), otherwise only when this is the form's only
   * text field.
   */
  private _implicitSubmit = (e: KeyboardEvent): void => {
    if (e.key !== 'Enter' || e.isComposing || e.defaultPrevented) return
    const form = this._internals.form
    if (!form) return
    const controls = Array.from(form.elements) as HTMLElement[]
    const isSubmitter = (el: HTMLElement) =>
      (el instanceof HTMLButtonElement && el.type === 'submit') ||
      (el instanceof HTMLInputElement && (el.type === 'submit' || el.type === 'image')) ||
      (el.tagName === 'TY-BUTTON' && !['button', 'reset'].includes(el.getAttribute('type') ?? ''))
    const submitter = controls.find(isSubmitter)
    if (submitter) {
      if ((submitter as HTMLButtonElement).disabled || submitter.hasAttribute('disabled')) return
      e.preventDefault()
      // ty-button handles clicks on its inner <button>
      const target = submitter.tagName === 'TY-BUTTON'
        ? submitter.shadowRoot?.querySelector('button') ?? submitter
        : submitter
      target.click()
      return
    }
    const textFields = controls.filter((el) =>
      el.tagName === 'TY-INPUT' ||
      (el instanceof HTMLInputElement && !['button', 'checkbox', 'radio', 'file', 'hidden', 'image', 'reset', 'submit', 'range', 'color'].includes(el.type)))
    if (textFields.length === 1) {
      e.preventDefault()
      form.requestSubmit()
    }
  }

  private setupEventListeners(): void {
    if (this._listenersSetup) {
      return // Already setup
    }

    const shadow = this.shadowRoot!
    const inputEl = shadow.querySelector('input')
    const wrapperEl = shadow.querySelector('.input-wrapper')

    if (!inputEl || !wrapperEl) {
      console.warn('[TyInput.setupEventListeners] ⚠️ Input element not found!')
      return
    }


    // Input event - update shadow value and form (with debounce support)
    this._inputHandler = (e: Event) => {
      this._userEdited = true

      // Stop native event from propagating - only our custom event should bubble
      e.stopPropagation()
      e.stopImmediatePropagation()

      const target = e.target as HTMLInputElement
      const rawValue = target.value

      this._shadowValue = this.parseShadowValue(rawValue)

      this._internals.setFormValue(
        this._shadowValue !== null ? String(this._shadowValue) : ''
      )
      this.updateValidity()

      if (this._inputDebounceTimer !== null) {
        clearTimeout(this._inputDebounceTimer)
      }

      if (this.debounce > 0) {
        this._inputDebounceTimer = window.setTimeout(() => {
          // Use current value, not the captured rawValue
          this.dispatchInputEvent(inputEl.value, e)
          this._inputDebounceTimer = null
        }, this.debounce)
      } else {
        this.dispatchInputEvent(rawValue, e)
      }
    }

    // Change event (with debounce support)
    this._changeHandler = (e: Event) => {
      // Stop native event from propagating - only our custom event should bubble
      e.stopPropagation()
      e.stopImmediatePropagation()

      const target = e.target as HTMLInputElement
      const rawValue = target.value

      this._shadowValue = this.parseShadowValue(rawValue)

      this._internals.setFormValue(
        this._shadowValue !== null ? String(this._shadowValue) : ''
      )
      this.updateValidity()

      if (this._changeDebounceTimer !== null) {
        clearTimeout(this._changeDebounceTimer)
      }

      if (this.debounce > 0) {
        this._changeDebounceTimer = window.setTimeout(() => {
          // Use current value, not the captured rawValue
          this.dispatchChangeEvent(inputEl.value, e)
          this._changeDebounceTimer = null
        }, this.debounce)
      } else {
        this.dispatchChangeEvent(rawValue, e)
      }
    }

    // Focus event - show raw value for numeric types
    this._focusHandler = (e: Event) => {
      this._isFocused = true
      wrapperEl.classList.add('focused')

      // For numeric types, show raw shadow value
      if (shouldFormatType(this.type) && this._shadowValue !== null) {
        inputEl.value = String(this._shadowValue)
      }

      this.dispatchEvent(new CustomEvent('focus', {
        detail: { originalEvent: e },
        bubbles: true,
        composed: true
      }))
    }

    // Blur event - fire pending debounced events immediately, then show formatted value
    this._blurHandler = (e: Event) => {
      const target = e.target as HTMLInputElement
      const rawValue = target.value

      // Fire any pending debounced input event immediately on blur
      if (this._inputDebounceTimer !== null) {
        clearTimeout(this._inputDebounceTimer)
        this._inputDebounceTimer = null
        this.dispatchInputEvent(rawValue, e)
      }

      // Fire any pending debounced change event immediately on blur
      if (this._changeDebounceTimer !== null) {
        clearTimeout(this._changeDebounceTimer)
        this._changeDebounceTimer = null
        this.dispatchChangeEvent(rawValue, e)
      }

      this._isFocused = false
      wrapperEl.classList.remove('focused')

      // Like native :user-invalid: once edited, leaving the field shows its message
      if (this._userEdited) this.revealValidity()

      // For numeric types, show formatted value
      if (this.shouldFormat()) {
        inputEl.value = this.getDisplayValue()
      }

      this.dispatchEvent(new CustomEvent('blur', {
        detail: { originalEvent: e },
        bubbles: true,
        composed: true
      }))
    }

    inputEl.addEventListener('input', this._inputHandler)
    inputEl.addEventListener('change', this._changeHandler)
    inputEl.addEventListener('focus', this._focusHandler)
    inputEl.addEventListener('blur', this._blurHandler)
    inputEl.addEventListener('keydown', this._implicitSubmit)

    this._listenersSetup = true
  }

  /** Render the input component with wrapper and slots. */
  render(): void {

    const shadow = this.shadowRoot!
    const existingInput = shadow.querySelector('input')
    const existingWrapper = shadow.querySelector('.input-wrapper')
    const existingLabel = shadow.querySelector('.ty-field-label')
    const existingError = shadow.querySelector('.error-message')
    const classes = this.buildClassList()

    // Real focus, not the last focus/blur event: Firefox and WebKit fire no
    // blur when a focused field is moved or hidden.
    const focused = !!existingInput && shadow.activeElement === existingInput
    if (!focused) this._isFocused = false

    // Map input type (all numeric types use 'text' in DOM, others pass through)
    const inputType = ['password', 'email', 'tel', 'url'].includes(this.type)
      ? this.type
      : 'text'

    // Set inputmode for mobile keyboard hint
    const inputMode = shouldFormatType(this.type) ? 'decimal'
      : this.type === 'email' ? 'email'
      : this.type === 'tel' ? 'tel'
      : this.type === 'url' ? 'url'
      : undefined

    const displayValue = this.getDisplayValue()

    // If input exists, just update properties
    if (existingInput && existingWrapper) {

      // A revealed password stays revealed: the toggle owns the inner type
      const revealed = inputType === 'password' &&
        shadow.querySelector('.password-toggle')?.getAttribute('aria-pressed') === 'true'
      existingInput.type = revealed ? 'text' : inputType
      // Only on a real change: any write marks the value as set by script,
      // and the inner input then stops reporting tooShort (updateValidity).
      if (existingInput.value !== displayValue) existingInput.value = displayValue
      existingInput.placeholder = this.placeholder
      existingInput.name = this.name
      if (inputMode) existingInput.inputMode = inputMode
      else existingInput.removeAttribute('inputmode')

      // An error shown on Enter lands while the field still has focus
      existingWrapper.className = `input-wrapper ${classes}`
      existingWrapper.classList.toggle('focused', focused)

      // Set disabled property AND manage attribute
      existingInput.disabled = this.disabled
      if (this.disabled) {
        existingInput.setAttribute('disabled', '')
      } else {
        existingInput.removeAttribute('disabled')
      }

      // Set required property AND manage attribute
      existingInput.required = this.required
      if (this.required) {
        existingInput.setAttribute('required', '')
      } else {
        existingInput.removeAttribute('required')
      }

      this.syncConstraintAttributes(existingInput)

      // a11y: the shadow <label> isn't programmatically linked to this input,
      // so give the control an accessible name directly.
      if (this.label) existingInput.setAttribute('aria-label', this.label)
      else existingInput.removeAttribute('aria-label')

      // ===== BUG FIX: Dynamic label creation =====
      if (this.label) {
        if (existingLabel) {
          existingLabel.innerHTML = `${this.label}${this.required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ''}`
            ; (existingLabel as HTMLElement).style.display = 'flex'
        } else {
          // Label doesn't exist but we need one - CREATE IT!
          const labelEl = document.createElement('label')
          labelEl.className = 'ty-field-label'
          labelEl.innerHTML = `${this.label}${this.required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ''}`

          // Insert label BEFORE the input-wrapper
          const container = shadow.querySelector('.input-container')
          if (container) {
            container.insertBefore(labelEl, existingWrapper)
          }
        }
      } else if (existingLabel) {
        ; (existingLabel as HTMLElement).style.display = 'none'
      }

      if (this.error) {
        if (existingError) {
          existingError.textContent = this.error
        } else {
          const errorEl = document.createElement('div')
          errorEl.className = 'error-message'
          errorEl.textContent = this.error
          shadow.querySelector('.input-container')?.appendChild(errorEl)
        }
      } else if (existingError) {
        existingError.remove()
      }
    } else {

      const labelHtml = this.label ? `
          <label class="ty-field-label">
            ${this.label}
            ${this.required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ''}
          </label>
        ` : ''

      const errorHtml = this.error ? `
          <div class="error-message">${this.error}</div>
        ` : ''

      shadow.innerHTML = `
          <div class="input-container">
            ${labelHtml}
            <div class="input-wrapper ${classes}">
              <slot name="start"></slot>
              <input
                type="${inputType}"
                value="${displayValue}"
                placeholder="${this.placeholder}"
                name="${this.name}"
                ${inputMode ? `inputmode="${inputMode}"` : ''}
              />
              <slot name="end"></slot>
              ${inputType === 'password' ? `
              <button class="password-toggle" type="button"
                      aria-label="Show password" aria-pressed="false">
                ${EYE_ICON_SVG}
              </button>` : ''}
            </div>
            ${errorHtml}
          </div>
        `

      const inputEl = shadow.querySelector('input')!
      inputEl.disabled = this.disabled
      inputEl.required = this.required
      this.syncConstraintAttributes(inputEl)
      if (this.label) inputEl.setAttribute('aria-label', this.label) // a11y: name the control

      this.setupPasswordToggle()

      // Setup event listeners ONCE
      this.setupEventListeners()
    }

    // Reflect constraint validation (required, etc.) to the owning <form>.
    this.updateValidity()
  }

  /**
   * Wire the password reveal toggle (rendered only for type="password").
   * Toggles the NATIVE input's type between password/text — the component's
   * `type` property stays "password" (form value and API unaffected).
   */
  private setupPasswordToggle(): void {
    const shadow = this.shadowRoot!
    const toggle = shadow.querySelector('.password-toggle') as HTMLButtonElement | null
    const inputEl = shadow.querySelector('input')
    if (!toggle || !inputEl) return

    // Keep focus in the input while clicking the toggle
    toggle.addEventListener('mousedown', (e) => e.preventDefault())
    toggle.addEventListener('click', () => {
      const reveal = inputEl.type === 'password'
      // Chromium can put the caret back at 0 when it next lays the field out
      // after the type change: lay it out now (a call: the CDN minifier drops
      // a bare offsetWidth read), then put the caret or selection back
      const { selectionStart, selectionEnd, selectionDirection } = inputEl
      inputEl.type = reveal ? 'text' : 'password'
      if (selectionStart !== null && shadow.activeElement === inputEl) {
        inputEl.getBoundingClientRect()
        inputEl.setSelectionRange(selectionStart, selectionEnd, selectionDirection ?? undefined)
      }
      toggle.innerHTML = reveal ? EYE_OFF_ICON_SVG : EYE_ICON_SVG
      toggle.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password')
      toggle.setAttribute('aria-pressed', String(reveal))
    })
  }

  /**
   * pattern, minlength and maxlength go on the inner <input>: pattern for the
   * browser's own patternMismatch check, minlength for its tooShort message
   * after the user types, maxlength so typing stops at the limit like a
   * native field. Formatted (numeric) types show a display string, so they
   * get none.
   */
  private syncConstraintAttributes(inputEl: HTMLInputElement): void {
    const text = !shouldFormatType(this.type)
    const set = (name: string, v: string) =>
      text && v !== '' ? inputEl.setAttribute(name, v) : inputEl.removeAttribute(name)
    set('pattern', this.pattern)
    set('minlength', toLimit(this.getProperty('minlength')) != null ? String(this.minLength) : '')
    set('maxlength', toLimit(this.getProperty('maxlength')) != null ? String(this.maxLength) : '')
  }

  /**
   * Reflect constraint validation to the owning <form> via ElementInternals.
   * Without this the inner shadow <input> can't block the outer form.
   * Rules, first failing one supplies the message:
   * - required: empty => valueMissing
   * - email/url: the inner input's own typeMismatch
   * - text types: pattern, minlength, maxlength
   * - number/currency/percent/compact: min, max against the numeric value
   * Empty values only fail `required`, like native inputs.
   * Disabled fields are barred from constraint validation.
   */
  private updateValidity(): void {
    const inputEl = this.shadowRoot?.querySelector('input') as HTMLInputElement | null
    if (this.disabled) {
      this.applyValidity({})
      return
    }
    const current = inputEl ? inputEl.value : String(this.getProperty('value') ?? '')
    if (current.trim() === '') {
      if (this.required) {
        this.applyValidity({ valueMissing: true }, nativeMessage('input', { type: 'text', required: true }), inputEl ?? undefined)
      } else {
        this.applyValidity({})
      }
      return
    }

    const flags: ValidityStateFlags = {}
    const messages: string[] = []
    const fail = (flag: keyof ValidityStateFlags, message: string) => {
      flags[flag] = true
      messages.push(message)
    }

    if (shouldFormatType(this.type)) {
      // A native number input judges min/max: it parses them (' 5 ' or
      // '0x10' is no rule at all) and words the message, so the flag and
      // the message can't disagree.
      const n = typeof this._shadowValue === 'number' ? this._shadowValue : null
      if (n !== null && (this.min || this.max)) {
        const { validity, message } = nativeValidity('input', { type: 'number', step: 'any', min: this.min, max: this.max }, String(n))
        if (validity.rangeUnderflow) fail('rangeUnderflow', message)
        if (validity.rangeOverflow) fail('rangeOverflow', message)
      }
    } else {
      if (inputEl?.validity.typeMismatch) fail('typeMismatch', inputEl.validationMessage)
      if (inputEl?.validity.patternMismatch) fail('patternMismatch', inputEl.validationMessage)
      const { tooShort, tooLong } = lengthValidity(current, {
        minlength: this.getProperty('minlength'),
        maxlength: this.getProperty('maxlength'),
        tooShortMessage: this.tooShortMessage,
        tooLongMessage: this.tooLongMessage,
      }, inputEl)
      if (tooShort) fail('tooShort', tooShort)
      if (tooLong) fail('tooLong', tooLong)
    }

    this.applyValidity(flags, messages[0], inputEl ?? undefined)
  }
}

if (!customElements.get('ty-input')) {
  customElements.define('ty-input', TyInput)
}
