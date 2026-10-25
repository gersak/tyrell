/**
 * TyComponent - Base class for all Ty web components
 * 
 * Provides unified property/attribute lifecycle management:
 * - Single code path for all property updates
 * - Declarative property configuration
 * - Predictable rendering behavior
 * - Form association support
 * - Property change events via 'prop:change' (separate from user 'change' events)
 */

import { PropertyManager, PropertyConfig, PropertyChange } from '../utils/property-manager.js'
import { ValidityController } from '../utils/validity.js'
import { upgradeProperties } from '../utils/upgrade-properties.js'

export { upgradeProperties }

/** Hosts that drop a <label>'s forwarded click (see watchLabelForwards). */
const labelClickHosts = new WeakSet<Element>()
/** Point of the last click on such a host's shadow content; a timeout (a
 *  later task) forgets it. */
const directClicks = new WeakMap<Element, string>()
let labelForwardsWatched = false

/**
 * For components whose whole host is the click target AND that expect a
 * wrapping <label> to delegate to them (checkbox, switch, radio). Firefox's
 * <label> doesn't count a click on the control's shadow content as a click
 * on the control, so once that click has dispatched it forwards one more to
 * the host: two clicks for one gesture. The forward comes later in the same
 * task (after a microtask checkpoint for real input), targets the host
 * itself and copies the original's coordinates — that's what is matched
 * here. Clicks on the label text, el.click() and keyboard activation never
 * match. The duplicate is dropped at the window, in its capture phase, so
 * page listeners don't see it either: not one added before the component's
 * own, nor a capture one on the document (React's onClickCapture).
 */
function watchLabelForwards(): void {
  if (labelForwardsWatched) return
  labelForwardsWatched = true
  window.addEventListener('click', (e) => {
    const path = e.composedPath()
    const host = path.find((n): n is Element => labelClickHosts.has(n as Element))
    if (!host) return
    const at = `${e.clientX},${e.clientY}`
    if (path[0] !== host) {
      directClicks.set(host, at)
      setTimeout(() => { if (directClicks.get(host) === at) directClicks.delete(host) })
    } else if (directClicks.get(host) === at) {
      e.stopImmediatePropagation()
    }
  }, true)
}

/**
 * Base class for all Ty components with unified property lifecycle
 */
export abstract class TyComponent<T = any> extends HTMLElement {
  static formAssociated = true
  
  // Subclasses must define their property configuration
  protected static properties: Record<string, PropertyConfig> = {}

  /** attachShadow delegatesFocus: the host itself counts as focusable when
   *  its focusable role element lives in the shadow (checkbox/switch) —
   *  Firefox checks the host, not the validation anchor, on a blocked submit. */
  protected static delegatesFocus = false

  /** 'manual': the component assigns its children to slots itself (ty-select). */
  protected static slotAssignment: SlotAssignmentMode = 'named'

  /** A wrapping <label> delegates clicks to the host (see watchLabelForwards). */
  protected static labelClicks = false
  
  protected props: PropertyManager<T>

  protected _internals: ElementInternals

  private _validity: ValidityController

  protected _connected = false

  protected _rendered = false

  /** The user edited the field since it was created or its form reset:
   *  blur then shows its validation message (like native :user-invalid). */
  protected _userEdited = false

  constructor() {
    super()

    const ctor = this.constructor as typeof TyComponent
    this.props = new PropertyManager<T>(ctor.properties)

    this._internals = this.attachInternals()
    this._validity = new ValidityController(this, this._internals)
    
    // Setup shadow DOM (subclasses can override by checking if shadowRoot exists)
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open', delegatesFocus: ctor.delegatesFocus, slotAssignment: ctor.slotAssignment })
    }

    if (ctor.labelClicks) {
      labelClickHosts.add(this)
      watchLabelForwards()
    }
  }
  
  /**
   * Define which attributes to observe
   * Auto-generated from property configuration
   * Returns kebab-case attribute names (e.g., 'minHeight' -> 'min-height')
   */
  static get observedAttributes(): string[] {
    const attrs: string[] = []
    for (const name of Object.keys(this.properties)) {
      attrs.push(name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase())
    }
    return attrs
  }
  
  /**
   * Unified property setter
   * Use this in your property setters instead of direct field assignment
   */
  protected setProperty(name: string, value: any): void {
    const change = this.props.updateProperty(name, value, 'property')
    
    if (change) {
      this._syncPropertyToAttribute(change)
      this._handlePropertyChanges([change])
    }
  }
  
  /**
   * Unified property getter
   * Use this in your property getters
   */
  protected getProperty(name: string): any {
    return this.props.get(name)
  }
  
  /**
   * Sync property value to HTML attribute
   */
  private _syncPropertyToAttribute(change: PropertyChange): void {
    const { name, newValue } = change
    const config = this.props.getConfig(name)
    
    if (!config) return

    const attrName = this._toKebabCase(name)

    this._reflecting = true
    try {
      this._writeAttribute(attrName, config.type, newValue)
    } finally {
      this._reflecting = false
    }
  }

  /** Our own write of a property to its attribute is under way. */
  private _reflecting = false

  private _writeAttribute(attrName: string, type: string, newValue: any): void {
    if (type === 'boolean') {
      if (newValue) {
        this.setAttribute(attrName, '')
      } else {
        this.removeAttribute(attrName)
      }
    } else if (newValue === null || newValue === undefined) {
      this.removeAttribute(attrName)
    } else if (typeof newValue === 'object') {
      this.setAttribute(attrName, JSON.stringify(newValue))
    } else {
      this.setAttribute(attrName, String(newValue))
    }
  }
  
  private _toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  private _toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  }
  
  /**
   * Attribute changed callback - unified for all components
   */
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return

    // Properties may be registered with kebab-case (e.g., 'display-month')
    // or camelCase. Try the attribute name as-is first, then camelCase.
    const propName = this.props.hasConfig(name) ? name : this._toCamelCase(name)

    // Markup changed by someone else (a server morph, a framework render) is
    // the latest declared state: form.reset() goes back to it, like a native
    // control's defaultValue. Our own reflection of an edit is not.
    if (!this._reflecting && this._resetDefaults?.has(propName)) {
      const config = this.props.getConfig(propName)!
      this._resetDefaults.set(propName, newValue ?? (typeof config.default === 'function' ? config.default() : config.default) ?? null)
    }

    const change = this.props.updateProperty(propName, newValue, 'attribute')

    if (change) {
      this._handlePropertyChanges([change])
    }
  }
  
  /**
   * Connected callback - handle pre-set properties
   */
  connectedCallback(): void {
    // Native defaultValue/defaultChecked semantics: form.reset() restores the
    // ATTRIBUTE-declared state. Property changes reflect back to attributes
    // here (unlike native inputs), so the original attribute must be captured
    // once, at first connect, before any interaction overwrites it.
    if (!this._resetDefaults) {
      this._resetDefaults = new Map()
      const ctor = this.constructor as typeof TyComponent
      for (const [name, config] of Object.entries(ctor.properties)) {
        if (!config.formValue) continue
        const attr = this.getAttribute(this._toKebabCase(name))
        this._resetDefaults.set(name, attr ?? (typeof config.default === 'function' ? config.default() : config.default) ?? null)
      }
    }

    // Before _connected: the setters update state, render happens once below
    this._upgradeProperties()

    this._connected = true
    if (this._validates) this._validity.track()

    this.onConnect()

    if (!this._rendered) {
      this.render()
      this._rendered = true
    }
  }
  
  /**
   * Disconnected callback
   */
  disconnectedCallback(): void {
    this._connected = false
    if (this._validates) this._validity.track()
    this.onDisconnect()
  }

  /** The form owner changed (moved, `form` attribute): see ValidityController.track(). */
  formAssociatedCallback(): void {
    if (this._validates) this._validity.track()
  }
  
  /**
   * upgradeProperties(), plus declared properties without an accessor of
   * their own name (e.g. ty-input's `minlength`): those go straight to
   * setProperty().
   */
  private _upgradeProperties(): void {
    for (const name of Object.keys((this.constructor as typeof TyComponent).properties)) {
      if (!Object.prototype.hasOwnProperty.call(this, name)) continue
      const value = (this as any)[name]
      delete (this as any)[name]
      if (value === undefined) continue
      if (name in this) (this as any)[name] = value
      else this.setProperty(name, value)
    }
    upgradeProperties(this)
  }
  
  /**
   * THE CORE LIFECYCLE METHOD
   * All property changes flow through here
   * 
   * Lifecycle order:
   * 1. Update internal state (onPropertiesChanged hook)
   * 2. Sync form value (if formValue property changed)
   * 3. Render (if visual property changed)
   * 4. Emit events (if emitChange property changed)
   */
  private _handlePropertyChanges(changes: PropertyChange[]): void {
    if (changes.length === 0) return
    
    // 1. Update internal state (subclass-specific)
    this.onPropertiesChanged(changes)
    
    // 2. Sync form value if needed
    const formValueChanged = changes.some(c => this.props.isFormValue(c.name))
    if (formValueChanged) {
      this.updateFormValue()
    }
    
    // 3. Render only if visual properties changed AND component is connected
    const visualChanged = changes.some(c => this.props.isVisual(c.name))
    if (visualChanged && this._connected) {
      this.render()
    }
    
    // 4. Emit change events if configured
    this._emitChangeEvents(changes)
  }
  
  /**
   * Emit property change events for properties that require it
   * Uses 'prop:change' event to avoid conflicts with user interaction 'change' events
   */
  private _emitChangeEvents(changes: PropertyChange[]): void {
    for (const change of changes) {
      if (this.props.shouldEmitChange(change.name)) {
        this.dispatchEvent(new CustomEvent('prop:change', {
          detail: {
            property: change.name,
            oldValue: change.oldValue,
            newValue: change.newValue
          },
          bubbles: true,
          composed: true
        }))
      }
    }
  }
  
  /**
   * Update form value via ElementInternals
   * Subclasses can override to customize form value
   */
  protected updateFormValue(): void {
    const formValue = this.getFormValue()
    this._internals.setFormValue(formValue)
  }
  
  /**
   * Get the form value for this component
   * Default: return 'value' property
   * Override for custom behavior
   */
  protected getFormValue(): File | string | FormData | null {
    return this.props.get('value') ?? null
  }
  
  /**
   * Render the component
   * Subclasses MUST implement this
   */
  protected abstract render(): void
  
  /**
   * Hook: Called when properties change
   * Subclasses can override to update internal state
   * 
   * This is called BEFORE rendering, so you can update
   * internal state here and it will be reflected in the render
   */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
  }
  
  /**
   * Hook: Called when component is connected
   * Use this instead of overriding connectedCallback
   */
  protected onConnect(): void {
  }
  
  /**
   * Hook: Called when component is disconnected
   * Use this for cleanup instead of overriding disconnectedCallback
   */
  protected onDisconnect(): void {
  }
  
  /**
   * Get the form element this component is associated with
   */
  get form(): HTMLFormElement | null {
    return this._internals.form
  }

  // --- Constraint validation (same API as native form controls) -------------

  /** Form-associated? Non-FACE internals throw on validity access. */
  private get _validates(): boolean {
    return (this.constructor as typeof TyComponent).formAssociated === true
  }

  /** Subclasses report their own validity here, not via _internals directly,
   *  so a user's setCustomValidity() survives re-validation. */
  protected applyValidity(flags: ValidityStateFlags, message?: string, anchor?: HTMLElement): void {
    this._validity.set(flags, message, anchor)
  }

  /** Show the field's current validation message in its error display, if
   *  it's invalid. Called on blur after the user edited the field. */
  protected revealValidity(): void {
    if (this._validates) this._validity.reveal()
  }

  get validity(): ValidityState | undefined {
    return this._validates ? this._internals.validity : undefined
  }

  get validationMessage(): string {
    return this._validates ? this._internals.validationMessage : ''
  }

  get willValidate(): boolean {
    return this._validates ? this._internals.willValidate : false
  }

  checkValidity(): boolean {
    return this._validates ? this._internals.checkValidity() : true
  }

  /** Like native, but shows the message in the component's `error` display
   *  when it has one (and clears it once valid) instead of the browser bubble. */
  reportValidity(): boolean {
    return this._validates ? this._validity.report() : true
  }

  setCustomValidity(message: string): void {
    if (this._validates) this._validity.setCustom(message)
  }

  /**
   * a11y helper for components whose ARIA role lives on an inner shadow element
   * (checkbox/switch/radio). A wrapping <label> names the form-associated HOST,
   * not the inner role element — so mirror the host's associated label text onto
   * the role element as aria-label, giving it an accessible name.
   */
  protected applyLabelName(roleEl: HTMLElement): void {
    let text = Array.from(this._internals.labels ?? [])
      .map((l) => (l as HTMLElement).textContent?.trim())
      .filter(Boolean)
      .join(' ')
    if (!text) {
      // Non-form-associated controls (e.g. ty-radio) aren't labelable, so the
      // wrapping <label> never appears in internals.labels — read it directly,
      // stripping this element's own subtree from the text.
      const lbl = this.closest('label')
      if (lbl) {
        const clone = lbl.cloneNode(true) as HTMLElement
        clone.querySelectorAll(this.tagName.toLowerCase()).forEach((n) => n.remove())
        text = clone.textContent?.trim() ?? ''
      }
    }
    if (text) roleEl.setAttribute('aria-label', text)
    else roleEl.removeAttribute('aria-label')
  }

  private _resetDefaults: Map<string, any> | null = null

  /**
   * Form reset callback - called when form.reset() is invoked.
   * Restores every formValue-bearing property to its attribute-declared
   * default captured at first connect (native defaultValue/defaultChecked
   * semantics). Non-form state (e.g. a checkbox's submission `value`, a
   * ty-radio's option `value`) is deliberately left alone — the old
   * blanket 'value' reset corrupted radio groups by wiping child values.
   * Like a native control the field also looks untouched again: the
   * validation message it showed is gone (an `error` the author set stays)
   * and a blur shows nothing until the user edits it.
   */
  formResetCallback(): void {
    this._userEdited = false
    if (this._validates) this._validity.reset()

    for (const [name, def] of this._resetDefaults ?? []) {
      this.setProperty(name, def)
    }

    this.onFormReset()
  }
  
  /**
   * Hook: Called when form is reset
   * Subclasses can override to perform additional reset actions
   */
  protected onFormReset(): void {
  }
}