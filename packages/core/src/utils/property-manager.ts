/**
 * Property Manager - Unified property lifecycle for web components
 * 
 * Handles property/attribute synchronization, validation, coercion, and change tracking.
 * All property updates flow through a single code path for consistency.
 */

/**
 * Configuration for a single property
 */
export interface PropertyConfig {
  // Data type for coercion
  type: 'string' | 'boolean' | 'number' | 'object' | 'array'
  
  // Does changing this property require a render?
  visual?: boolean
  
  // Should this sync to form value?
  formValue?: boolean
  
  // Should this emit a change event?
  emitChange?: boolean
  
  // Default value
  default?: any
  
  // Custom validator function
  validate?: (value: any) => boolean
  
  // Custom coercion function
  coerce?: (value: any) => any
  
  // Property aliases (e.g., 'not-clearable' → 'clearable': false)
  aliases?: Record<string, any>
}

/**
 * Represents a property change
 */
export interface PropertyChange {
  name: string
  oldValue: any
  newValue: any
  source: 'attribute' | 'property' | 'internal'
}

/**
 * Manages component properties with unified lifecycle
 */
export class PropertyManager<T = any> {
  private _props = new Map<string, any>()
  private _config: Record<string, PropertyConfig>
  
  constructor(config: Record<string, PropertyConfig>) {
    this._config = config
    this._initializeDefaults()
  }
  
  /**
   * Initialize properties with default values
   */
  private _initializeDefaults(): void {
    for (const [name, config] of Object.entries(this._config)) {
      if (config.default !== undefined) {
        this._props.set(name, config.default)
      }
    }
  }
  
  /**
   * Check if a property name exists in the configuration
   */
  hasConfig(name: string): boolean {
    return name in this._config
  }

  /**
   * Update a property value
   * Returns PropertyChange if value changed, null otherwise
   */
  updateProperty(
    name: string, 
    value: any, 
    source: 'attribute' | 'property' | 'internal' = 'property'
  ): PropertyChange | null {
    const config = this._config[name]
    if (!config) {
      console.warn(`[PropertyManager] Unknown property: ${name}`)
      return null
    }
    
    const oldValue = this._props.get(name)
    const coercedValue = this._coerceValue(name, value, config)

    if (!this._validateValue(name, coercedValue, config)) {
      console.warn(`[PropertyManager] Invalid value for ${name}:`, coercedValue)
      return null
    }

    if (this._valuesEqual(oldValue, coercedValue)) {
      return null
    }

    this._props.set(name, coercedValue)

    const change: PropertyChange = {
      name,
      oldValue,
      newValue: coercedValue,
      source
    }
    
    return change
  }
  
  /**
   * Coerce value to the correct type
   */
  private _coerceValue(name: string, value: any, config: PropertyConfig): any {
    if (config.coerce) {
      return config.coerce(value)
    }

    if (value === null || value === undefined) {
      return config.default ?? null
    }

    switch (config.type) {
      case 'boolean':
        // HTML Standard: attribute present (even empty) = true, absent = false
        if (typeof value === 'string') {
          // Empty string = true (HTML boolean attribute: <input checked>)
          if (value === '') return true
          // Explicit false values
          const normalized = value.toLowerCase().trim()
          if (normalized === 'false' || normalized === '0') return false
          // Everything else is truthy
          return true
        }
        // Non-string: standard truthy/falsy
        return Boolean(value)
        
      case 'number':
        const num = Number(value)
        return isNaN(num) ? (config.default ?? 0) : num
        
      case 'string':
        return String(value)
        
      case 'object':
      case 'array':
        if (typeof value === 'string') {
          try {
            return JSON.parse(value)
          } catch {
            console.warn(`[PropertyManager] Failed to parse ${name}:`, value)
            return config.default ?? (config.type === 'array' ? [] : {})
          }
        }
        return value
        
      default:
        return value
    }
  }
  
  /**
   * Validate a property value
   */
  private _validateValue(name: string, value: any, config: PropertyConfig): boolean {
    if (config.validate) {
      return config.validate(value)
    }
    return true
  }
  
  /**
   * Check if two values are equal
   */
  private _valuesEqual(a: any, b: any): boolean {
    if (typeof a !== 'object' || typeof b !== 'object') {
      return a === b
    }

    if (a === null || b === null) {
      return a === b
    }
    
    // Deep equality for objects/arrays (simple implementation)
    // For production, consider using a proper deep equality library
    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch {
      return false
    }
  }
  
  /**
   * Get a property value
   */
  get(name: string): any {
    return this._props.get(name)
  }
  
  /**
   * Get all properties as an object
   */
  getAll(): Record<string, any> {
    return Object.fromEntries(this._props)
  }
  
  /**
   * Get property configuration
   */
  getConfig(name: string): PropertyConfig | undefined {
    return this._config[name]
  }
  
  /**
   * Check if a property is visual (requires render)
   */
  isVisual(name: string): boolean {
    return this._config[name]?.visual ?? false
  }
  
  /**
   * Check if a property affects form value
   */
  isFormValue(name: string): boolean {
    return this._config[name]?.formValue ?? false
  }
  
  /**
   * Check if a property should emit change events
   */
  shouldEmitChange(name: string): boolean {
    return this._config[name]?.emitChange ?? false
  }
  
  /**
   * Handle property aliases (e.g., not-clearable → clearable: false)
   */
  handleAlias(aliasName: string, value: any): PropertyChange | null {
    for (const [propName, config] of Object.entries(this._config)) {
      if (config.aliases && aliasName in config.aliases) {
        const aliasedValue = config.aliases[aliasName]
        return this.updateProperty(propName, aliasedValue, 'attribute')
      }
    }
    return null
  }
}