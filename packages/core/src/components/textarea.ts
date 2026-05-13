/**
 * ty-textarea - Enhanced textarea component with auto-resize functionality
 * 
 * Features:
 * - Auto-resize based on content
 * - Form-associated custom element
 * - Min/max height constraints
 * - Size variants (xs, sm, md, lg, xl)
 * - Validation states (error, required)
 * - Manual resize control options
 * - Accessibility support
 * 
 * @example
 * ```html
 * <!-- Basic usage -->
 * <ty-textarea label="Description" placeholder="Enter details..."></ty-textarea>
 * 
 * <!-- With validation -->
 * <ty-textarea 
 *   label="Bio" 
 *   required 
 *   error="Bio is required"
 *   size="lg">
 * </ty-textarea>
 * 
 * <!-- With height constraints -->
 * <ty-textarea 
 *   min-height="100px" 
 *   max-height="300px"
 *   placeholder="Auto-resizing textarea">
 * </ty-textarea>
 * 
 * <!-- Manual resize control -->
 * <ty-textarea resize="vertical"></ty-textarea>
 * ```
 * 
 * @fires {CustomEvent<{value: string, originalEvent: Event}>} input - Emitted on input
 * @fires {CustomEvent<{value: string, originalEvent: Event}>} change - Emitted on change
 */

import { TyComponent } from '../base/ty-component.js'
import type { PropertyChange } from '../utils/property-manager.js'
import { ensureStyles } from '../utils/styles.js'
import { textareaStyles } from '../styles/textarea.js'
import { CustomScrollbar, isCustomScrollbarEnabled } from '../utils/custom-scrollbar.js'
import { customScrollbarStyles } from '../styles/custom-scrollbar.js'

/**
 * Required icon SVG (matches input.ts)
 */
const REQUIRED_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`

/**
 * Component internal state (for typing TyComponent)
 * Actual state stored as private fields
 */
interface TextareaState {
  value: string
  isFocused: boolean
  textareaEl: HTMLTextAreaElement | null
  dummyEl: HTMLPreElement | null
}

/**
 * Font style properties for dummy element
 */
interface FontStyle {
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing: string
  fontStyle: string
}

/**
 * Spacing style properties for dummy element
 */
interface SpacingStyle {
  padding: string
  paddingTop: string
  paddingRight: string
  paddingBottom: string
  paddingLeft: string
  margin: string
  borderWidth: string
}

export interface TyTextareaElement extends HTMLElement {
  value?: string
  name?: string
  placeholder?: string
  label?: string
  disabled?: boolean
  required?: boolean
  error?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rows?: string | number
  cols?: string | number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  minHeight?: string
  maxHeight?: string
}

export class TyTextarea extends TyComponent<TextareaState> implements TyTextareaElement {
  static formAssociated = true

  // ============================================================================
  // PROPERTY CONFIGURATION - Declarative property lifecycle
  // ============================================================================
  protected static properties = {
    // Core properties
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
          console.warn(`[ty-textarea] Invalid size '${v}'. Using 'md'.`)
          return 'md'
        }
        return v
      }
    },
    // Layout properties
    rows: {
      type: 'string' as const,
      visual: true,
      default: '3',
      coerce: (v: any) => String(v)
    },
    cols: {
      type: 'string' as const,
      visual: true,
      default: '',
      coerce: (v: any) => v ? String(v) : ''
    },
    resize: {
      type: 'string' as const,
      visual: true,
      default: 'none',
      validate: (v: any) => ['none', 'both', 'horizontal', 'vertical'].includes(v),
      coerce: (v: any) => {
        if (!['none', 'both', 'horizontal', 'vertical'].includes(v)) {
          console.warn(`[ty-textarea] Invalid resize '${v}'. Using 'none'.`)
          return 'none'
        }
        return v
      }
    },
    minHeight: {
      type: 'string' as const,
      visual: true,
      default: ''
    },
    maxHeight: {
      type: 'string' as const,
      visual: true,
      default: ''
    }
  }

  // ============================================================================
  // INTERNAL STATE - Not managed by PropertyManager
  // NOTE: _internals provided by TyComponent base class
  // ============================================================================

  // DOM element references
  private _textareaEl: HTMLTextAreaElement | null = null
  private _dummyEl: HTMLPreElement | null = null
  private _scrollbar: CustomScrollbar | null = null

  // Focus state
  private _isFocused = false

  constructor() {
    super()  // TyComponent handles attachInternals() and attachShadow()

    // Apply styles to shadow root
    const shadow = this.shadowRoot!
    ensureStyles(shadow, { css: textareaStyles, id: 'ty-textarea' })

    // Add custom scrollbar styles
    if (isCustomScrollbarEnabled()) {
      ensureStyles(shadow, { css: customScrollbarStyles, id: 'ty-custom-scrollbar' })
    }
  }

  // observedAttributes auto-generated by TyComponent from properties config

  // ============================================================================
  // TYCOMPONENT LIFECYCLE HOOKS
  // ============================================================================

  /**
   * Called when component connects to DOM
   * TyComponent already handled pre-connection property capture
   */
  protected onConnect(): void {
    // No special initialization needed - TyComponent handles everything
    // Just render the component
  }

  /**
   * Called when component disconnects from DOM
   */
  protected onDisconnect(): void {
    // Cleanup scrollbar
    this._destroyScrollbar()

    // Cleanup event listeners if needed
    if (this._textareaEl) {
      const newTextarea = this._textareaEl.cloneNode(true)
      this._textareaEl.parentNode?.replaceChild(newTextarea, this._textareaEl)
      this._textareaEl = null
    }
    this._dummyEl = null
  }

  /**
   * Handle property changes - called BEFORE render
   * This replaces the old attributeChangedCallback logic
   */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    // No special handling needed for textarea
    // All property changes will trigger render() automatically if marked as visual
  }

  /**
   * Override form value to return current value
   */
  protected getFormValue(): FormDataEntryValue | null {
    return this.getProperty('value') || null
  }

  // ============================================================================
  // PROPERTY ACCESSORS - Simplified with TyComponent
  // ============================================================================

  get value(): string { return this.getProperty('value') }
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

  get size(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
    return this.getProperty('size') as 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }
  set size(v: 'xs' | 'sm' | 'md' | 'lg' | 'xl') {
    this.setProperty('size', v)
  }

  get rows(): string { return this.getProperty('rows') }
  set rows(v: string | number) { this.setProperty('rows', v) }

  get cols(): string { return this.getProperty('cols') }
  set cols(v: string | number) { this.setProperty('cols', v) }

  get resize(): 'none' | 'both' | 'horizontal' | 'vertical' {
    return this.getProperty('resize') as 'none' | 'both' | 'horizontal' | 'vertical'
  }
  set resize(v: 'none' | 'both' | 'horizontal' | 'vertical') {
    this.setProperty('resize', v)
  }

  get minHeight(): string { return this.getProperty('minHeight') }
  set minHeight(v: string) { this.setProperty('minHeight', v) }

  get maxHeight(): string { return this.getProperty('maxHeight') }
  set maxHeight(v: string) { this.setProperty('maxHeight', v) }

  // ===== HELPER METHODS =====

  /**
   * Extract font-related CSS properties from element
   */
  private getFontStyle(el: HTMLElement): FontStyle {
    const computedStyle = window.getComputedStyle(el)
    return {
      fontFamily: computedStyle.fontFamily,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      lineHeight: computedStyle.lineHeight,
      letterSpacing: computedStyle.letterSpacing,
      fontStyle: computedStyle.fontStyle
    }
  }

  /**
   * Extract spacing-related CSS properties from element
   */
  private getSpacingStyle(el: HTMLElement): SpacingStyle {
    const computedStyle = window.getComputedStyle(el)
    return {
      padding: computedStyle.padding,
      paddingTop: computedStyle.paddingTop,
      paddingRight: computedStyle.paddingRight,
      paddingBottom: computedStyle.paddingBottom,
      paddingLeft: computedStyle.paddingLeft,
      margin: computedStyle.margin,
      borderWidth: computedStyle.borderWidth
    }
  }

  /**
   * Setup the hidden dummy element for height measurement
   */
  private setupDummyElement(textareaEl: HTMLTextAreaElement): HTMLPreElement {
    const root = this.shadowRoot!
    const existingDummy = root.querySelector<HTMLPreElement>('.textarea-dummy')

    // Remove existing dummy if present
    if (existingDummy) {
      existingDummy.remove()
    }

    // Create new dummy element
    const dummyEl = document.createElement('pre')
    const fontStyle = this.getFontStyle(textareaEl)
    const spacingStyle = this.getSpacingStyle(textareaEl)

    // Set dummy element class
    dummyEl.className = 'textarea-dummy'

    // Apply styles to match textarea
    const style = dummyEl.style
    style.position = 'absolute'
    style.top = '0'
    style.left = '0'
    style.visibility = 'hidden'
    style.whiteSpace = 'pre-wrap'
    style.wordBreak = 'break-word'
    style.boxSizing = 'border-box'
    style.overflow = 'hidden'
    style.pointerEvents = 'none'

    // Apply font styles
    Object.entries(fontStyle).forEach(([prop, value]) => {
      ; (style as any)[prop] = value
    })

    // Apply spacing styles
    Object.entries(spacingStyle).forEach(([prop, value]) => {
      ; (style as any)[prop] = value
    })

    // Append to shadow root
    root.appendChild(dummyEl)

    this._dummyEl = dummyEl
    return dummyEl
  }

  /**
   * Resize textarea based on dummy element content with min/max height constraints
   */
  private resizeTextarea(textareaEl: HTMLTextAreaElement, dummyEl: HTMLPreElement): void {
    if (!textareaEl || !dummyEl) return

    const value = this.value
    const placeholder = this.placeholder
    const content = (value === '' && placeholder) ? placeholder : value + ' '
    const currentHeight = textareaEl.clientHeight

    // Set dummy content
    dummyEl.textContent = content

    // Set dummy width to match textarea
    dummyEl.style.width = `${textareaEl.clientWidth}px`

    // Get measured height
    const measuredHeight = dummyEl.scrollHeight

    // Parse min/max heights
    const minHeight = this.minHeight ? parseInt(this.minHeight.replace('px', ''), 10) : null
    const maxHeight = this.maxHeight ? parseInt(this.maxHeight.replace('px', ''), 10) : null

    // Apply constraints
    let constrainedHeight = measuredHeight
    if (minHeight !== null) constrainedHeight = Math.max(constrainedHeight, minHeight)
    if (maxHeight !== null) constrainedHeight = Math.min(constrainedHeight, maxHeight)

    // Only update if height changed significantly (avoid micro-adjustments)
    if (Math.abs(constrainedHeight - currentHeight) > 2) {
      textareaEl.style.height = `${constrainedHeight}px`

      // Set overflow based on whether we hit max-height
      const needsScroll = maxHeight !== null && measuredHeight >= maxHeight
      if (needsScroll) {
        textareaEl.style.overflowY = 'auto'
        this._setupScrollbar(textareaEl)
      } else {
        textareaEl.style.overflowY = 'hidden'
        this._destroyScrollbar()
      }
    }

    // Keep scrollbar thumb in sync after resize
    this._scrollbar?.update()
  }

  // ============ Custom Scrollbar ============

  private _setupScrollbar(textareaEl: HTMLTextAreaElement): void {
    if (this._scrollbar || !isCustomScrollbarEnabled()) return

    // Hide native scrollbar (Firefox + Chrome/Safari via data attribute)
    textareaEl.style.scrollbarWidth = 'none'
    this.setAttribute('data-custom-scroll', '')

    this._scrollbar = new CustomScrollbar(textareaEl, {
      vertical: true,
      horizontal: false
    })

    // Append track to the textarea wrapper (position: relative)
    const wrapper = this.shadowRoot!.querySelector('.textarea-wrapper')
    if (wrapper && this._scrollbar.trackY) {
      wrapper.appendChild(this._scrollbar.trackY)
    }
  }

  private _destroyScrollbar(): void {
    if (!this._scrollbar) return

    this._scrollbar.trackY?.remove()
    this._scrollbar.destroy()
    this._scrollbar = null

    // Restore native scrollbar
    this.removeAttribute('data-custom-scroll')
    if (this._textareaEl) {
      this._textareaEl.style.scrollbarWidth = ''
    }
  }

  /**
   * Emit custom input and change events
   */
  private emitValueEvents(originalEvent: Event): void {
    const value = this.value

    // Update form internals
    this._internals.setFormValue(value || '')

    // Emit custom events
    const data = {
      bubbles: true,
      composed: true,
      detail: {
        value,
        originalEvent
      }
    }

    // Use setTimeout to ensure these fire after standard events
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('input', data))
      this.dispatchEvent(new CustomEvent('change', data))
    }, 0)
  }

  /**
   * Handle textarea input event
   */
  private handleInputEvent = (e: Event): void => {
    const target = e.target as HTMLTextAreaElement
    const newValue = target.value

    // Update value via property (triggers proper lifecycle)
    this.value = newValue

    // Trigger resize after state update
    if (this._textareaEl && this._dummyEl) {
      this.resizeTextarea(this._textareaEl, this._dummyEl)
    }

    // Emit custom events
    this.emitValueEvents(e)
  }

  /**
   * Handle textarea focus event
   */
  private handleFocusEvent = (): void => {
    this._isFocused = true
  }

  /**
   * Handle textarea blur event
   */
  private handleBlurEvent = (): void => {
    this._isFocused = false
  }

  /**
   * Build class list for textarea element
   */
  private buildClassList(): string {
    const classes: string[] = [this.size]

    if (this.disabled) classes.push('disabled')
    if (this.required) classes.push('required')
    if (this.error) classes.push('error')
    if (this.resize !== 'none') classes.push(`resize-${this.resize}`)

    const customClass = this.getAttribute('class')
    if (customClass) classes.push(customClass)

    return classes.join(' ')
  }

  /**
   * Apply min/max height constraints to textarea element
   */
  private applyHeightConstraints(textareaEl: HTMLTextAreaElement): void {
    if (this.minHeight) {
      textareaEl.style.minHeight = this.minHeight
    }
    if (this.maxHeight) {
      textareaEl.style.maxHeight = this.maxHeight
    }
  }

  /**
   * Setup event listeners for textarea
   */
  private setupTextareaEvents(textareaEl: HTMLTextAreaElement): void {
    textareaEl.addEventListener('input', this.handleInputEvent)
    textareaEl.addEventListener('change', this.handleInputEvent)
    textareaEl.addEventListener('focus', this.handleFocusEvent)
    textareaEl.addEventListener('blur', this.handleBlurEvent)
  }

  // ===== RENDER =====

  protected render(): void {
    const root = this.shadowRoot!
    const existingContainer = root.querySelector<HTMLDivElement>('.textarea-container')
    const existingLabel = root.querySelector<HTMLLabelElement>('label')
    const existingTextarea = root.querySelector<HTMLTextAreaElement>('textarea')
    const existingError = root.querySelector<HTMLDivElement>('.error-message')

    if (existingContainer && existingTextarea) {
      // Update existing elements

      // Update label
      if (this.label) {
        if (existingLabel) {
          existingLabel.innerHTML = this.label +
            (this.required ? ` <span class="required-icon">${REQUIRED_ICON}</span>` : '')
          existingLabel.style.display = 'block'
        }
      } else if (existingLabel) {
        existingLabel.style.display = 'none'
      }

      // Update textarea
      existingTextarea.value = this.value || ''
      existingTextarea.placeholder = this.placeholder || ''
      existingTextarea.disabled = this.disabled
      existingTextarea.required = this.required
      existingTextarea.className = this.buildClassList()

      // Set name for form association
      if (this.name) {
        existingTextarea.setAttribute('name', this.name)
      } else {
        existingTextarea.removeAttribute('name')
      }

      // Set rows/cols
      if (this.rows) existingTextarea.setAttribute('rows', this.rows)
      if (this.cols) existingTextarea.setAttribute('cols', this.cols)

      // Apply height constraints
      this.applyHeightConstraints(existingTextarea)

      // Update error message
      if (this.error) {
        if (!existingError) {
          const errorEl = document.createElement('div')
          errorEl.className = 'error-message'
          existingContainer.appendChild(errorEl)
        }
        const errorEl = root.querySelector<HTMLDivElement>('.error-message')
        if (errorEl) errorEl.textContent = this.error
      } else if (existingError) {
        existingError.remove()
      }

      // Setup dummy element and trigger resize
      const dummyEl = this.setupDummyElement(existingTextarea)
      setTimeout(() => this.resizeTextarea(existingTextarea, dummyEl), 0)

      this._textareaEl = existingTextarea

    } else {
      // Create new structure
      const container = document.createElement('div')
      container.className = 'textarea-container'

      const labelEl = document.createElement('label')
      labelEl.className = 'ty-field-label'
      if (this.label) {
        labelEl.innerHTML = this.label +
          (this.required ? ` <span class="required-icon">${REQUIRED_ICON}</span>` : '')
        labelEl.style.display = 'block'
      } else {
        labelEl.style.display = 'none'
      }

      const textareaEl = document.createElement('textarea')
      textareaEl.value = this.value || ''
      textareaEl.placeholder = this.placeholder || ''
      textareaEl.disabled = this.disabled
      textareaEl.required = this.required
      textareaEl.className = this.buildClassList()

      // Set name for form association
      if (this.name) {
        textareaEl.setAttribute('name', this.name)
      }

      // Set default or specified rows/cols
      textareaEl.setAttribute('rows', this.rows || '3')
      if (this.cols) textareaEl.setAttribute('cols', this.cols)

      // Apply height constraints
      this.applyHeightConstraints(textareaEl)

      // Setup event listeners
      this.setupTextareaEvents(textareaEl)

      // Build structure — wrapper provides position context for custom scrollbar
      const wrapperEl = document.createElement('div')
      wrapperEl.className = 'textarea-wrapper'
      wrapperEl.appendChild(textareaEl)

      container.appendChild(labelEl)
      container.appendChild(wrapperEl)

      // Add error message if present
      if (this.error) {
        const errorEl = document.createElement('div')
        errorEl.className = 'error-message'
        errorEl.textContent = this.error
        container.appendChild(errorEl)
      }

      root.appendChild(container)

      // Setup dummy element and trigger initial resize
      const dummyEl = this.setupDummyElement(textareaEl)
      setTimeout(() => this.resizeTextarea(textareaEl, dummyEl), 0)

      this._textareaEl = textareaEl
    }
  }
}

// Register the component
if (!customElements.get('ty-textarea')) {
  customElements.define('ty-textarea', TyTextarea)
}
