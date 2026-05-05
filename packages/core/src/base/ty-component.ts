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

/**
 * Base class for all Ty components with unified property lifecycle
 */
export abstract class TyComponent<T = any> extends HTMLElement {
  static formAssociated = true
  
  // Subclasses must define their property configuration
  protected static properties: Record<string, PropertyConfig> = {}
  
  // Property manager instance
  protected props: PropertyManager<T>
  
  // Form internals
  protected _internals: ElementInternals
  
  // Track if component is connected
  protected _connected = false
  
  // Track if initial render happened
  protected _rendered = false
  
  constructor() {
    super()
    
    // Initialize property manager
    const ctor = this.constructor as typeof TyComponent
    this.props = new PropertyManager<T>(ctor.properties)
    
    // Form association
    this._internals = this.attachInternals()
    
    // Setup shadow DOM (subclasses can override by checking if shadowRoot exists)
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' })
    }
  }
  
  /**
   * Define which attributes to observe
   * Auto-generated from property configuration
   * Returns kebab-case attribute names (e.g., 'minHeight' -> 'min-height')
   */
  static get observedAttributes(): string[] {
    const attrs: string[] = []
    for (const [name, config] of Object.entries(this.properties)) {
      attrs.push(name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase())
      // Include alias names so attributeChangedCallback fires for them
      if (config.aliases) {
        for (const alias of Object.keys(config.aliases)) {
          attrs.push(alias)
        }
      }
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
      // Sync to attribute (kebab-case)
      this._syncPropertyToAttribute(change)
      
      // Handle the change through unified lifecycle
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
    
    // Convert to kebab-case for attribute
    const attrName = this._toKebabCase(name)
    
    // Handle different types
    if (config.type === 'boolean') {
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
  
  /**
   * Convert camelCase to kebab-case
   */
  private _toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }
  
  /**
   * Convert kebab-case to camelCase
   */
  private _toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  }
  
  /**
   * Attribute changed callback - unified for all components
   */
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return

    // Check if this is an alias (e.g., not-clearable)
    let change = this.props.handleAlias(name, newValue)

    if (!change) {
      // Properties may be registered with kebab-case (e.g., 'display-month')
      // or camelCase. Try the attribute name as-is first, then camelCase.
      const camelName = this._toCamelCase(name)
      const propName = this.props.hasConfig(name) ? name : camelName
      change = this.props.updateProperty(propName, newValue, 'attribute')
    }
    
    if (change) {
      this._handlePropertyChanges([change])
    }
  }
  
  /**
   * Connected callback - handle pre-set properties
   */
  connectedCallback(): void {
    this._connected = true
    
    // Capture pre-set properties (React/Vue/Reagent pattern)
    const preSetProps = this._capturePreSetProperties()
    
    // Batch process all pre-set properties
    if (preSetProps.length > 0) {
      this._handlePropertyChanges(preSetProps)
    }
    
    // Initialize component (subclass hook)
    this.onConnect()
    
    // Initial render
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
    this.onDisconnect()
  }
  
  /**
   * Capture properties that were set before connectedCallback
   * (React, Vue, Reagent set properties before element is connected)
   */
  private _capturePreSetProperties(): PropertyChange[] {
    const changes: PropertyChange[] = []
    const ctor = this.constructor as typeof TyComponent
    
    for (const propName of Object.keys(ctor.properties)) {
      // Check if property was set on the element before connection
      const descriptor = Object.getOwnPropertyDescriptor(this, propName)
      if (descriptor && descriptor.value !== undefined) {
        const change = this.props.updateProperty(propName, descriptor.value, 'property')
        if (change) {
          changes.push(change)
        }
      }
    }
    
    return changes
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
    // Default: no-op
    // Subclasses can override to update _state, _config, etc.
  }
  
  /**
   * Hook: Called when component is connected
   * Use this instead of overriding connectedCallback
   */
  protected onConnect(): void {
    // Default: no-op
  }
  
  /**
   * Hook: Called when component is disconnected
   * Use this for cleanup instead of overriding disconnectedCallback
   */
  protected onDisconnect(): void {
    // Default: no-op
  }
  
  /**
   * Get the form element this component is associated with
   */
  get form(): HTMLFormElement | null {
    return this._internals.form
  }
  
  /**
   * Form reset callback - called when form.reset() is invoked
   * Resets component to its default value
   */
  formResetCallback(): void {
    // Get the default value from property configuration
    const ctor = this.constructor as typeof TyComponent
    const valueConfig = ctor.properties['value']
    
    if (valueConfig) {
      const defaultValue = valueConfig.default ?? ''
      
      // Reset the value property through setProperty to trigger lifecycle
      this.setProperty('value', defaultValue)
    }
    
    // Call subclass hook for custom reset behavior
    this.onFormReset()
  }
  
  /**
   * Hook: Called when form is reset
   * Subclasses can override to perform additional reset actions
   */
  protected onFormReset(): void {
    // Default: no-op
    // Subclasses can override to reset additional state
  }
}