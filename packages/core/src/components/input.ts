/**
 * TyInput Web Component
 * PORTED FROM: clj/ty/components/input.cljs
 * Phase D: Complete with debounce feature for input and change events
 * 
 * Enhanced input component with:
 * - Label, error messages, semantic styling
 * - Icon slots (start/end)
 * - Numeric formatting with shadow values
 * - Currency, percent, compact notation
 * - Format-on-blur / raw-on-focus behavior
 * - Debounce (0-5000ms) for input/change events
 * - Immediate event firing on blur (cancels pending debounce)
 * 
 * NOTE: Checkbox functionality is in separate ty-checkbox component
 */

import type { Flavor, Size, InputType, TyInputElement } from '../types/common.js'
import { TyComponent } from '../base/ty-component.js'
import type { PropertyChange } from '../utils/property-manager.js'
import { ensureStyles } from '../utils/styles.js'
import { inputStyles } from '../styles/input.js'
import {
  formatNumber,
  parseNumericValue,
  shouldFormat as shouldFormatType,
  type FormatConfig
} from '../utils/number-format.js'
import { getEffectiveLocale, observeLocaleChanges } from '../utils/locale.js'

/**
 * Required indicator SVG icon (from Lucide)
 */
const REQUIRED_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-asterisk-icon lucide-asterisk"><path d="M12 6v12"/><path d="M17.196 9 6.804 15"/><path d="m6.804 9 10.392 6"/></svg>`

/**
 * Ty Input Component (Phase D - Complete with Debounce)
 * 
 * @example
 * ```html
 * <!-- Basic input -->
 * <ty-input label="Email" type="email" placeholder="Enter email" required></ty-input>
 * 
 * <!-- With icons -->
 * <ty-input label="Search">
 *   <ty-icon slot="start" name="search"></ty-icon>
 * </ty-input>
 * 
 * <!-- With debounce (500ms) -->
 * <ty-input
 *   label="Search"
 *   debounce="500"
 *   placeholder="Type to search...">
 * </ty-input>
 * 
 * <!-- Currency formatting -->
 * <ty-input 
 *   label="Price" 
 *   type="currency" 
 *   currency="USD"
 *   locale="en-US"
 *   value="1234.56">
 * </ty-input>
 * 
 * <!-- Percent formatting -->
 * <ty-input 
 *   label="Tax Rate" 
 *   type="percent"
 *   value="15"
 *   precision="2">
 * </ty-input>
 * ```
 */

/**
 * Internal state interface for TyInput component
 */
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

  // ============================================================================
  // PROPERTY CONFIGURATION - Declarative property lifecycle
  // ============================================================================
  protected static properties = {
    // Core properties
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
    error: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
    size: {
      type: 'string' as const,
      visual: true,
      default: 'md',
      validate: (v: any) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
      coerce: (v: any) => {
        if (!['xs', 'sm', 'md', 'lg', 'xl'].includes(v)) {
          console.warn(`[ty-input] Invalid size '${v}'. Using 'md'.`)
          return 'md'
        }
        return v
      }
    },
    flavor: {
      type: 'string' as const,
      visual: true,
      default: 'neutral',
      validate: (v: any) => {
        const valid: Flavor[] = ['primary', 'secondary', 'success', 'danger', 'warning', 'neutral']
        return valid.includes(v)
      },
      coerce: (v: any) => {
        const valid: Flavor[] = ['primary', 'secondary', 'success', 'danger', 'warning', 'neutral']
        if (!valid.includes(v)) {
          console.warn(`[ty-input] Invalid flavor '${v}'. Using 'neutral'.`)
          return 'neutral'
        }
        return v
      }
    },
    // Numeric formatting properties
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
    // Debounce property
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

  // ============================================================================
  // INTERNAL STATE - Not managed by PropertyManager
  // NOTE: _internals provided by TyComponent base class
  // ============================================================================

  // Shadow value - parsed numeric value for formatting
  private _shadowValue: number | string | null = null

  // Focus state - toggles format/raw display
  private _isFocused = false

  // Listener setup tracking
  private _listenersSetup = false

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

    // Apply styles to shadow root
    const shadow = this.shadowRoot!
    ensureStyles(shadow, { css: inputStyles, id: 'ty-input' })
  }

  /**
   * Called when component connects to DOM
   * TyComponent already handled pre-connection property capture
   */
  protected onConnect(): void {
    // Initialize shadow value from current value property
    this.initializeShadowValue()

    // NOTE: Event listeners are set up in render() after input element is created
    // setupEventListeners() will be called after initial render

    // Setup locale observer to watch for ancestor lang changes
    this._localeObserver = observeLocaleChanges(this, () => {
      this.render()
    })
  }

  /**
   * Called when component disconnects from DOM
   */
  protected onDisconnect(): void {
    // Clean up event listeners
    this.removeEventListeners()

    // Cleanup locale observer
    if (this._localeObserver) {
      this._localeObserver()
      this._localeObserver = undefined
    }

    // Clear any pending debounce timers
    if (this._inputDebounceTimer !== null) {
      clearTimeout(this._inputDebounceTimer)
      this._inputDebounceTimer = null
    }
    if (this._changeDebounceTimer !== null) {
      clearTimeout(this._changeDebounceTimer)
      this._changeDebounceTimer = null
    }
  }

  // ============================================================================
  // TYCOMPONENT LIFECYCLE HOOKS
  // ============================================================================

  /**
   * Handle property changes - called BEFORE render
   * This replaces the old attributeChangedCallback logic
   */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    for (const { name, newValue } of changes) {
      switch (name) {
        case 'value':
          // Parse to shadow value for numeric types
          this._shadowValue = this.parseShadowValue(newValue || '')
          break

        case 'type':
          // Re-parse shadow value when type changes
          const currentValue = this.getProperty('value') || ''
          this._shadowValue = this.parseShadowValue(currentValue)
          break

        case 'error':
          // Auto-set flavor to danger when error is present and flavor is neutral
          if (newValue && this.getProperty('flavor') === 'neutral') {
            // Use setProperty to trigger proper lifecycle
            this.setProperty('flavor', 'danger')
          }
          break
      }
    }
  }

  /**
   * Hook: Called when form is reset
   * Clear shadow value and focus state
   */
  protected onFormReset(): void {
    // Reset shadow value to default (empty)
    this._shadowValue = null

    // Reset focus state
    this._isFocused = false

    // Clear any pending debounce timers
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
    const formValue = this._shadowValue !== null ? String(this._shadowValue) : null
    return formValue
  }

  /**
   * Initialize shadow value from the initial value attribute
   */
  private initializeShadowValue(): void {
    const currentValue = this.getProperty('value')
    if (currentValue) {
      this._shadowValue = this.parseShadowValue(currentValue)
      // Update form value
      this._internals.setFormValue(
        this._shadowValue !== null ? String(this._shadowValue) : null
      )
    }
  }

  /**
   * Parse a string value to the appropriate shadow value type
   */
  private parseShadowValue(value: string): number | string | null {
    // Defensive check: ensure value is actually a string before calling .trim()
    if (!value || typeof value !== 'string' || value.trim() === '') return null

    // For numeric types, parse to number
    if (shouldFormatType(this.type)) {
      const parsed = parseNumericValue(value)
      if (parsed !== null && this.precision === 0) {
        return Math.round(parsed)
      }
      return parsed
    }

    // For other types, keep as string
    return value
  }

  /**
   * Check if current input should format numbers
   */
  private shouldFormat(): boolean {
    return shouldFormatType(this.type) &&
      !this._isFocused &&
      this._shadowValue !== null &&
      typeof this._shadowValue === 'number'
  }

  /**
   * Get the format configuration for current input
   */
  private getFormatConfig(): FormatConfig {
    return {
      type: this.type as 'number' | 'currency' | 'percent' | 'compact',
      locale: this.locale,  // Use getter which calls getEffectiveLocale correctly
      currency: this.currency,
      precision: this.precision
    }
  }

  /**
   * Get the display value (formatted or raw)
   */
  private getDisplayValue(): string {
    if (this.shouldFormat()) {
      let valueToFormat = this._shadowValue as number

      // For percent: divide by 100 (user enters 15, displays as 15%)
      // This matches ClojureScript behavior
      if (this.type === 'percent') {
        valueToFormat = valueToFormat / 100
      }

      return formatNumber(valueToFormat, this.getFormatConfig())
    }

    return this._shadowValue !== null ? String(this._shadowValue) : ''
  }

  // ============================================================================
  // PROPERTY ACCESSORS - Simplified with TyComponent
  // NOTE: validateFlavor removed - now handled by property configuration
  // ============================================================================

  // Core properties - simple getProperty/setProperty pattern
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

  get required(): boolean { return this.getProperty('required') }
  set required(v: boolean) { this.setProperty('required', v) }

  get error(): string { return this.getProperty('error') }
  set error(v: string) { this.setProperty('error', v) }

  get size(): Size { return this.getProperty('size') as Size }
  set size(v: Size) { this.setProperty('size', v) }

  get flavor(): Flavor { return this.getProperty('flavor') as Flavor }
  set flavor(v: Flavor) { this.setProperty('flavor', v) }

  // Numeric formatting properties
  get currency(): string { return this.getProperty('currency') }
  set currency(v: string) { this.setProperty('currency', v) }

  // Locale - special getter uses getEffectiveLocale()
  get locale(): string {
    return getEffectiveLocale(this, this.getProperty('locale'))
  }
  set locale(v: string) { this.setProperty('locale', v) }

  get precision(): number | undefined { return this.getProperty('precision') }
  set precision(v: number | string | undefined) { this.setProperty('precision', v) }

  // Debounce property
  get debounce(): number { return this.getProperty('debounce') }
  set debounce(v: number | string) { this.setProperty('debounce', v) }

  // Form property
  get form(): HTMLFormElement | null {
    return this._internals.form
  }

  /**
   * Build CSS class list for input wrapper
   */
  private buildClassList(): string {
    const classes: string[] = [this.size, this.flavor]

    if (this.disabled) classes.push('disabled')
    if (this.required) classes.push('required')
    if (this.error) classes.push('error')

    return classes.join(' ')
  }

  /**
   * Dispatch input event (helper method for debouncing)
   */
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

  /**
   * Dispatch change event (helper method for debouncing)
   */
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

  /**
   * Remove event listeners for cleanup
   */
  private removeEventListeners(): void {
    if (!this._listenersSetup) return

    const shadow = this.shadowRoot
    if (!shadow) return

    const inputEl = shadow.querySelector('input')
    if (!inputEl) return

    // Remove all event listeners using stored handler references
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

    this._listenersSetup = false
  }

  /**
 * Setup event listeners for input element
 * IMPORTANT: Only called ONCE, not on every render (like ClojureScript)
 */
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


    // Create and store handler references for cleanup

    // Input event - update shadow value and form (with debounce support)
    this._inputHandler = (e: Event) => {

      // Stop native event from propagating - only our custom event should bubble
      e.stopPropagation()
      e.stopImmediatePropagation()

      const target = e.target as HTMLInputElement
      const rawValue = target.value

      // Parse to shadow value
      this._shadowValue = this.parseShadowValue(rawValue)

      // Update form value with shadow value
      this._internals.setFormValue(
        this._shadowValue !== null ? String(this._shadowValue) : null
      )

      // Clear existing timer
      if (this._inputDebounceTimer !== null) {
        clearTimeout(this._inputDebounceTimer)
      }

      // If debounce is set, debounce the event
      if (this.debounce > 0) {
        this._inputDebounceTimer = window.setTimeout(() => {
          // Use current value, not the captured rawValue
          this.dispatchInputEvent(inputEl.value, e)
          this._inputDebounceTimer = null
        }, this.debounce)
      } else {
        // Fire immediately if no debounce
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

      // Parse to shadow value
      this._shadowValue = this.parseShadowValue(rawValue)

      // Update form value
      this._internals.setFormValue(
        this._shadowValue !== null ? String(this._shadowValue) : null
      )

      // Clear existing timer
      if (this._changeDebounceTimer !== null) {
        clearTimeout(this._changeDebounceTimer)
      }

      // If debounce is set, debounce the event
      if (this.debounce > 0) {
        this._changeDebounceTimer = window.setTimeout(() => {
          // Use current value, not the captured rawValue
          this.dispatchChangeEvent(inputEl.value, e)
          this._changeDebounceTimer = null
        }, this.debounce)
      } else {
        // Fire immediately if no debounce
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

    // Add event listeners
    inputEl.addEventListener('input', this._inputHandler)
    inputEl.addEventListener('change', this._changeHandler)
    inputEl.addEventListener('focus', this._focusHandler)
    inputEl.addEventListener('blur', this._blurHandler)

    this._listenersSetup = true
  }

  /**
   * Render the input component with wrapper and slots
   * Phase C: Uses getDisplayValue() for formatted output
   * 
   */
  render(): void {

    const shadow = this.shadowRoot!
    const existingInput = shadow.querySelector('input')
    const existingWrapper = shadow.querySelector('.input-wrapper')
    const existingLabel = shadow.querySelector('.input-label')
    const existingError = shadow.querySelector('.error-message')
    const classes = this.buildClassList()

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

    // Get display value (formatted or raw based on focus)
    const displayValue = this.getDisplayValue()

    // If input exists, just update properties (like ClojureScript does)
    if (existingInput && existingWrapper) {

      existingInput.type = inputType
      existingInput.value = displayValue
      existingInput.placeholder = this.placeholder
      existingInput.name = this.name
      if (inputMode) existingInput.inputMode = inputMode
      else existingInput.removeAttribute('inputmode')

      // Update wrapper classes
      existingWrapper.className = `input-wrapper ${classes}`

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

      // ===== BUG FIX: Dynamic label creation =====
      // Update or CREATE label if needed
      if (this.label) {
        if (existingLabel) {
          // Label exists, just update it
          existingLabel.innerHTML = `${this.label}${this.required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ''}`
            ; (existingLabel as HTMLElement).style.display = 'flex'
        } else {
          // Label doesn't exist but we need one - CREATE IT!
          const labelEl = document.createElement('label')
          labelEl.className = 'input-label'
          labelEl.innerHTML = `${this.label}${this.required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ''}`

          // Insert label BEFORE the input-wrapper
          const container = shadow.querySelector('.input-container')
          if (container) {
            container.insertBefore(labelEl, existingWrapper)
          }
        }
      } else if (existingLabel) {
        // No label text, hide existing label
        ; (existingLabel as HTMLElement).style.display = 'none'
      }

      // Update error message
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

      // Create initial structure with wrapper and slots
      const labelHtml = this.label ? `
          <label class="input-label">
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
            </div>
            ${errorHtml}
          </div>
        `

      // Set boolean properties after creating element
      const inputEl = shadow.querySelector('input')!
      inputEl.disabled = this.disabled
      inputEl.required = this.required

      // Setup event listeners ONCE
      this.setupEventListeners()
    }
  }
}

// Register the custom element
if (!customElements.get('ty-input')) {
  customElements.define('ty-input', TyInput)
}
