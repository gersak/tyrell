/**
 * ty-textarea — form-associated textarea that auto-resizes to its content,
 * within optional min-height/max-height constraints.
 *
 * @fires {CustomEvent<{value: string, originalEvent: Event}>} input - Emitted on every edit
 * @fires {CustomEvent<{value: string, originalEvent: Event}>} change - Emitted on blur, if the value changed (like a native textarea)
 */

import { DEFAULT_SIZE } from '../types/common.js'
import { TyComponent } from '../base/ty-component.js'
import type { PropertyChange } from '../utils/property-manager.js'
import { ensureStyles } from '../utils/styles.js'
import { textareaStyles } from '../styles/textarea.js'
import { CustomScrollbar, isCustomScrollbarEnabled } from '../utils/custom-scrollbar.js'
import { customScrollbarStyles } from '../styles/custom-scrollbar.js'
import { nativeMessage, lengthValidity, toLimit } from '../utils/validity.js'
import { REQUIRED_ICON_SVG } from '../utils/icons.js'

/** For typing TyComponent only — actual state lives in private fields. */
interface TextareaState {
  value: string
  isFocused: boolean
  textareaEl: HTMLTextAreaElement | null
  dummyEl: HTMLPreElement | null
}

/** Font style properties copied onto the measurement dummy element. */
interface FontStyle {
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing: string
  fontStyle: string
}

/** Spacing style properties copied onto the measurement dummy element. */
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
  minLength?: number
  maxLength?: number
  tooShortMessage?: string
  tooLongMessage?: string
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

  protected static properties = {
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
    // Length rules, like ty-input's. Unset ('') means no rule.
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
      validate: (v: any) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
      coerce: (v: any) => {
        if (!['xs', 'sm', 'md', 'lg', 'xl'].includes(v)) {
          console.warn(`[ty-textarea] Invalid size '${v}'. Using '${DEFAULT_SIZE}'.`)
          return DEFAULT_SIZE
        }
        return v
      }
    },
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

  // Internal state, not managed by PropertyManager (_internals comes from TyComponent).
  private _textareaEl: HTMLTextAreaElement | null = null
  private _dummyEl: HTMLPreElement | null = null
  private _scrollbar: CustomScrollbar | null = null

  private _isFocused = false

  constructor() {
    super()  // TyComponent handles attachInternals() and attachShadow()

    const shadow = this.shadowRoot!
    ensureStyles(shadow, { css: textareaStyles, id: 'ty-textarea' })

    if (isCustomScrollbarEnabled()) {
      ensureStyles(shadow, { css: customScrollbarStyles, id: 'ty-custom-scrollbar' })
    }
  }

  // observedAttributes auto-generated by TyComponent from properties config

  protected onConnect(): void {
    // Empty still submits name= (like a native textarea), not nothing
    this.updateFormValue()

    // Put back after a disconnect (a move, a keyed reorder, a morph): its
    // listeners went with it, and changes made meanwhile never rendered.
    if (this._rendered) {
      this.render()
      if (this._textareaEl) this.setupTextareaEvents(this._textareaEl)
    }
  }

  protected onDisconnect(): void {
    this._destroyScrollbar()
    if (this._textareaEl) this.removeTextareaEvents(this._textareaEl)
  }

  /** Called BEFORE render. Visual property changes re-render automatically. */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
  }

  protected getFormValue(): FormDataEntryValue | null {
    return this.getProperty('value') || ''
  }

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

  /** Focus the inner <textarea>: the host itself isn't focusable. */
  focus(options?: FocusOptions): void {
    (this.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement | null)?.focus(options)
  }

  get required(): boolean { return this.getProperty('required') }
  set required(v: boolean) { this.setProperty('required', v) }

  get minLength(): number { return toLimit(this.getProperty('minlength')) ?? -1 }
  set minLength(v: number) { this.setProperty('minlength', v == null || v < 0 ? '' : String(v)) }

  get maxLength(): number { return toLimit(this.getProperty('maxlength')) ?? -1 }
  set maxLength(v: number) { this.setProperty('maxlength', v == null || v < 0 ? '' : String(v)) }

  get tooShortMessage(): string { return this.getProperty('tooShortMessage') }
  set tooShortMessage(v: string) { this.setProperty('tooShortMessage', v ?? '') }

  get tooLongMessage(): string { return this.getProperty('tooLongMessage') }
  set tooLongMessage(v: string) { this.setProperty('tooLongMessage', v ?? '') }

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

  /** Hidden dummy element used to measure the content height. */
  private setupDummyElement(textareaEl: HTMLTextAreaElement): HTMLPreElement {
    const root = this.shadowRoot!
    const existingDummy = root.querySelector<HTMLPreElement>('.textarea-dummy')

    if (existingDummy) {
      existingDummy.remove()
    }

    const dummyEl = document.createElement('pre')
    const fontStyle = this.getFontStyle(textareaEl)
    const spacingStyle = this.getSpacingStyle(textareaEl)

    dummyEl.className = 'textarea-dummy'

    // The dummy must match the textarea's box exactly or the measurement lies.
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

    Object.entries(fontStyle).forEach(([prop, value]) => {
      ; (style as any)[prop] = value
    })

    Object.entries(spacingStyle).forEach(([prop, value]) => {
      ; (style as any)[prop] = value
    })

    root.appendChild(dummyEl)

    this._dummyEl = dummyEl
    return dummyEl
  }

  /** Resize the textarea to the dummy's measured height, within min/max. */
  private resizeTextarea(textareaEl: HTMLTextAreaElement, dummyEl: HTMLPreElement): void {
    if (!textareaEl || !dummyEl) return

    const value = this.value
    const placeholder = this.placeholder
    const content = (value === '' && placeholder) ? placeholder : value + ' '
    const currentHeight = textareaEl.clientHeight

    dummyEl.textContent = content
    dummyEl.style.width = `${textareaEl.clientWidth}px`

    const measuredHeight = dummyEl.scrollHeight

    const minHeight = this.minHeight ? parseInt(this.minHeight.replace('px', ''), 10) : null
    const maxHeight = this.maxHeight ? parseInt(this.maxHeight.replace('px', ''), 10) : null

    let constrainedHeight = measuredHeight
    if (minHeight !== null) constrainedHeight = Math.max(constrainedHeight, minHeight)
    if (maxHeight !== null) constrainedHeight = Math.min(constrainedHeight, maxHeight)

    // Only update if height changed significantly (avoid micro-adjustments)
    if (Math.abs(constrainedHeight - currentHeight) > 2) {
      textareaEl.style.height = `${constrainedHeight}px`

      const needsScroll = maxHeight !== null && measuredHeight >= maxHeight
      if (needsScroll) {
        textareaEl.style.overflowY = 'auto'
        this._setupScrollbar(textareaEl)
      } else {
        textareaEl.style.overflowY = 'hidden'
        this._destroyScrollbar()
      }
    } else if (maxHeight !== null && measuredHeight >= maxHeight && !this._scrollbar) {
      // Already at max-height, but the custom scrollbar is gone: put back in
      // the page after a move (onDisconnect destroyed it)
      textareaEl.style.overflowY = 'auto'
      this._setupScrollbar(textareaEl)
    }

    // Keep scrollbar thumb in sync after resize
    this._scrollbar?.update()
  }

  private _setupScrollbar(textareaEl: HTMLTextAreaElement): void {
    if (this._scrollbar || !isCustomScrollbarEnabled()) return

    // Hide native scrollbar (Firefox + Chrome/Safari via data attribute)
    textareaEl.style.scrollbarWidth = 'none'
    this.setAttribute('data-custom-scroll', '')

    this._scrollbar = new CustomScrollbar(textareaEl, {
      vertical: true,
      horizontal: false
    })

    // Append track to the scroll region (position: relative) so it tracks the
    // textarea edges and never overlaps the header/footer.
    const scroll = this.shadowRoot!.querySelector('.textarea-scroll')
    if (scroll && this._scrollbar.trackY) {
      scroll.appendChild(this._scrollbar.trackY)
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

  private emitValueEvent(type: 'input' | 'change', originalEvent: Event): void {
    const data = {
      bubbles: true,
      composed: true,
      detail: {
        value: this.value,
        originalEvent
      }
    }

    this.dispatchEvent(new CustomEvent(type, data))
  }

  private handleInputEvent = (e: Event): void => {
    this._userEdited = true

    // The native input event is composed: stop it here so only ours (with
    // detail.value) reaches the host's listeners, like ty-input
    e.stopPropagation()
    e.stopImmediatePropagation()

    const target = e.target as HTMLTextAreaElement
    const newValue = target.value

    // Assign through the property so the full lifecycle runs.
    this.value = newValue

    if (this._textareaEl && this._dummyEl) {
      this.resizeTextarea(this._textareaEl, this._dummyEl)
    }

    this._internals.setFormValue(this.value || '')
    this.updateValidity()
    this.emitValueEvent('input', e)
  }

  // Value when focus arrived; change fires on blur only if it differs.
  // Tracked here rather than via the native change event, which skips
  // programmatic edits (dictation, extensions, tests).
  private _valueAtFocus: string | null = null

  private handleFocusEvent = (): void => {
    this._isFocused = true
    this._valueAtFocus = this.value
  }

  private handleBlurEvent = (e: Event): void => {
    this._isFocused = false
    // Like native :user-invalid: once edited, leaving the field shows its message
    if (this._userEdited) this.revealValidity()
    if (this._valueAtFocus !== null && this.value !== this._valueAtFocus) {
      this.emitValueEvent('change', e)
    }
    this._valueAtFocus = null
  }

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

  private applyHeightConstraints(textareaEl: HTMLTextAreaElement): void {
    if (this.minHeight) {
      textareaEl.style.minHeight = this.minHeight
    }
    if (this.maxHeight) {
      textareaEl.style.maxHeight = this.maxHeight
    }
  }

  private setupTextareaEvents(textareaEl: HTMLTextAreaElement): void {
    textareaEl.addEventListener('input', this.handleInputEvent)
    textareaEl.addEventListener('focus', this.handleFocusEvent)
    textareaEl.addEventListener('blur', this.handleBlurEvent)
  }

  private removeTextareaEvents(textareaEl: HTMLTextAreaElement): void {
    textareaEl.removeEventListener('input', this.handleInputEvent)
    textareaEl.removeEventListener('focus', this.handleFocusEvent)
    textareaEl.removeEventListener('blur', this.handleBlurEvent)
  }

  protected render(): void {
    const root = this.shadowRoot!
    const existingContainer = root.querySelector<HTMLDivElement>('.textarea-container')
    const existingLabel = root.querySelector<HTMLLabelElement>('label')
    const existingTextarea = root.querySelector<HTMLTextAreaElement>('textarea')
    const existingError = root.querySelector<HTMLDivElement>('.error-message')

    if (existingContainer && existingTextarea) {
      // Update existing elements in place
      if (this.label) {
        if (existingLabel) {
          existingLabel.innerHTML = `${this.label}${this.required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ''}`
          existingLabel.style.display = 'flex'
        }
      } else if (existingLabel) {
        existingLabel.style.display = 'none'
      }

      // Only on a real change: any write marks the value as set by script,
      // and the inner textarea then stops reporting tooShort (updateValidity).
      if (existingTextarea.value !== (this.value || '')) existingTextarea.value = this.value || ''
      existingTextarea.placeholder = this.placeholder || ''
      existingTextarea.disabled = this.disabled
      existingTextarea.required = this.required
      this.syncConstraintAttributes(existingTextarea)
      existingTextarea.className = this.buildClassList()
      // a11y: shadow <label> isn't linked to the control; name it directly.
      if (this.label) existingTextarea.setAttribute('aria-label', this.label)
      else existingTextarea.removeAttribute('aria-label')

      if (this.name) {
        existingTextarea.setAttribute('name', this.name)
      } else {
        existingTextarea.removeAttribute('name')
      }

      if (this.rows) existingTextarea.setAttribute('rows', this.rows)
      if (this.cols) existingTextarea.setAttribute('cols', this.cols)

      this.applyHeightConstraints(existingTextarea)

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

      const dummyEl = this.setupDummyElement(existingTextarea)
      setTimeout(() => this.resizeTextarea(existingTextarea, dummyEl), 0)

      this._textareaEl = existingTextarea

    } else {
      const container = document.createElement('div')
      container.className = 'textarea-container'

      const labelEl = document.createElement('label')
      labelEl.className = 'ty-field-label'
      if (this.label) {
        labelEl.innerHTML = `${this.label}${this.required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ''}`
        labelEl.style.display = 'flex'
      } else {
        labelEl.style.display = 'none'
      }

      const textareaEl = document.createElement('textarea')
      textareaEl.value = this.value || ''
      textareaEl.placeholder = this.placeholder || ''
      textareaEl.disabled = this.disabled
      textareaEl.required = this.required
      this.syncConstraintAttributes(textareaEl)
      textareaEl.className = this.buildClassList()
      if (this.label) textareaEl.setAttribute('aria-label', this.label) // a11y: name the control

      if (this.name) {
        textareaEl.setAttribute('name', this.name)
      }

      textareaEl.setAttribute('rows', this.rows || '3')
      if (this.cols) textareaEl.setAttribute('cols', this.cols)

      this.applyHeightConstraints(textareaEl)
      this.setupTextareaEvents(textareaEl)

      // Build composer structure:
      //   .textarea-wrapper (border) > [.textarea-header > slot] · .textarea-scroll(textarea) · [.textarea-footer > slot]
      const wrapperEl = document.createElement('div')
      wrapperEl.className = 'textarea-wrapper'

      const headerEl = document.createElement('div')
      headerEl.className = 'textarea-header'
      const headerSlot = document.createElement('slot')
      headerSlot.setAttribute('name', 'header')
      headerEl.appendChild(headerSlot)

      // Scroll region wraps only the textarea so the custom scrollbar can't
      // overlap header/footer.
      const scrollEl = document.createElement('div')
      scrollEl.className = 'textarea-scroll'
      scrollEl.appendChild(textareaEl)

      const footerEl = document.createElement('div')
      footerEl.className = 'textarea-footer'
      const footerSlot = document.createElement('slot')
      footerSlot.setAttribute('name', 'footer')
      footerEl.appendChild(footerSlot)

      wrapperEl.appendChild(headerEl)
      wrapperEl.appendChild(scrollEl)
      wrapperEl.appendChild(footerEl)

      // Collapse empty slots (no padding/divider) by toggling .has-content.
      // slotchange fires on initial assignment too.
      const syncSlot = (slot: HTMLSlotElement, region: HTMLElement) => {
        const update = () =>
          region.classList.toggle('has-content', slot.assignedNodes({ flatten: true }).length > 0)
        slot.addEventListener('slotchange', update)
        update()
      }
      syncSlot(headerSlot, headerEl)
      syncSlot(footerSlot, footerEl)

      container.appendChild(labelEl)
      container.appendChild(wrapperEl)

      if (this.error) {
        const errorEl = document.createElement('div')
        errorEl.className = 'error-message'
        errorEl.textContent = this.error
        container.appendChild(errorEl)
      }

      root.appendChild(container)

      const dummyEl = this.setupDummyElement(textareaEl)
      setTimeout(() => this.resizeTextarea(textareaEl, dummyEl), 0)

      this._textareaEl = textareaEl
    }

    // Reflect constraint validation to the owning <form>. Without this `required`
    // is cosmetic — the inner shadow <textarea> can't block the outer form.
    this.updateValidity()
  }

  /**
   * minlength goes on the inner <textarea> for the browser's own too-short
   * message after the user types, maxlength so typing stops at the limit
   * (like ty-input).
   */
  private syncConstraintAttributes(ta: HTMLTextAreaElement): void {
    const set = (name: string, limit: number | null) =>
      limit !== null ? ta.setAttribute(name, String(limit)) : ta.removeAttribute(name)
    set('minlength', toLimit(this.getProperty('minlength')))
    set('maxlength', toLimit(this.getProperty('maxlength')))
  }

  /**
   * required + empty => valueMissing (the browser's own message); otherwise
   * minlength / maxlength, worded like ty-input's (lengthValidity). Empty
   * values only fail `required`, like native. Disabled fields are barred
   * from constraint validation.
   */
  private updateValidity(): void {
    const ta = this.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement | null
    if (this.disabled) { this.applyValidity({}); return }
    const current = ta ? ta.value : String(this.value ?? '')
    if (current.trim() === '') {
      if (this.required) {
        this.applyValidity({ valueMissing: true }, nativeMessage('textarea', { required: true }), ta ?? undefined)
      } else {
        this.applyValidity({})
      }
      return
    }
    const { tooShort, tooLong } = lengthValidity(current, {
      minlength: this.getProperty('minlength'),
      maxlength: this.getProperty('maxlength'),
      tooShortMessage: this.tooShortMessage,
      tooLongMessage: this.tooLongMessage,
    }, ta)
    this.applyValidity({ tooShort: !!tooShort, tooLong: !!tooLong }, tooShort ?? tooLong, ta ?? undefined)
  }
}

if (!customElements.get('ty-textarea')) {
  customElements.define('ty-textarea', TyTextarea)
}
