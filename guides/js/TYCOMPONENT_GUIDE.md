# Building Web Components with TyComponent

## 🎯 Overview

**TyComponent** is an abstract base class that provides a unified, declarative property/attribute lifecycle for web components. It eliminates boilerplate code, ensures consistency, and makes components predictable and easy to maintain.

> The examples below use `ty-dropdown` as the running case study of TyComponent internals. (As a *consumer-facing component* ty-dropdown is deprecated — use `ty-select` — but its source remains a good architecture reference.)

### Key Benefits

✅ **Single Code Path** - All property updates flow through one lifecycle
✅ **Declarative Configuration** - Define properties once, not in multiple places
✅ **Predictable Updates** - State → Render → Events (always in this order)
✅ **Smart Rendering** - Only render when visual properties change
✅ **Framework Agnostic** - Works with React, Vue, Reagent, vanilla JS
✅ **Form Integration** - Built-in ElementInternals support
✅ **Property Validation** - Automatic type coercion and validation
✅ **Attribute Aliases** - Support for negative attributes (e.g., `not-clearable`)
✅ **Dual Event System** - Separate 'prop:change' and 'change' events for clarity

---

## 📦 Architecture

### The Unified Property Lifecycle

```
Property Update (via attribute or property setter)
     ↓
PropertyManager.updateProperty()
     ↓
[Validation & Coercion]
     ↓
PropertyChange emitted
     ↓
TyComponent._handlePropertyChanges()
     ↓
┌─────────────────────────────────────┐
│ 1. onPropertiesChanged() hook       │ ← Update internal state
│ 2. updateFormValue() (if formValue) │ ← Sync to form
│ 3. render() (if visual changed)     │ ← Update DOM
│ 4. Emit 'change' event (if needed)  │ ← Notify listeners
└─────────────────────────────────────┘
```

### Core Components

1. **PropertyManager** (`/utils/property-manager.ts`)
   - Stores property values in a Map
   - Handles type coercion (string/boolean/number/object/array)
   - Validates property values
   - Tracks property changes
   - Manages property aliases

2. **TyComponent** (`/base/ty-component.ts`)
   - Base class for all components
   - Unified `attributeChangedCallback`
   - Automatic property capture for React/Reagent
   - Lifecycle hooks (onConnect, onDisconnect, onPropertiesChanged)
   - Form value handling via ElementInternals

3. **Your Component** (extends TyComponent)
   - Property configuration
   - Property accessors (getters/setters)
   - Internal state management
   - Render implementation

### Event System: `prop:change` vs `change`

TyComponent uses **two distinct event types** to avoid conflicts:

**`prop:change`** - Property Change Events
- Emitted when properties marked with `emitChange: true` change
- Triggered by: attribute changes, property setters, external updates
- Detail: `{ property: 'name', oldValue: any, newValue: any }`
- Use case: Reactive frameworks, property watchers, debugging
- Example: `<ty-dropdown onPropChange={...} />` in React

**`change`** - User Interaction Events
- Emitted by component business logic (manually dispatched)
- Triggered by: user clicks, selections, form interactions
- Detail: Component-specific (e.g., `{ value, text, option, originalEvent }`)
- Use case: Application logic, form handling, user actions
- Example: `<ty-dropdown onChange={...} />` in React

**Why separate events?**
```javascript
// React example - clear distinction
<ty-dropdown
  // Listen to user interactions
  onChange={(e) => console.log('User selected:', e.detail.value)}
  
  // Listen to any property changes (including programmatic)
  onPropChange={(e) => console.log('Value changed:', e.detail.newValue)}
/>
```

This prevents double-event issues where frameworks would receive both property updates AND user interaction events for the same action.

---

## 🚀 Step-by-Step Guide

### Step 1: Extend TyComponent

```typescript
import { TyComponent } from '../base/ty-component.js'
import type { PropertyChange } from '../utils/property-manager.js'
import type { Flavor, Size } from '../types/common.js'

// Define your component's internal state interface
interface DropdownState {
  open: boolean
  search: string
  highlightedIndex: number
  filteredOptions: OptionData[]
  currentValue: string | null
  mode: 'desktop' | 'mobile'
}

export class TyDropdown extends TyComponent<DropdownState> {
  // Component implementation here...
}
```

### Step 2: Configure Properties (Declarative)

This is the **most important part** - define all your properties in one place:

```typescript
export class TyDropdown extends TyComponent<DropdownState> {
  // ============================================================================
  // PROPERTY CONFIGURATION - Single source of truth
  // ============================================================================
  protected static properties = {
    // String property with form value and property change events
    value: {
      type: 'string' as const,
      visual: true,        // Triggers render when changed
      formValue: true,     // Syncs to form value
      emitChange: true,    // Emits 'prop:change' event (separate from user 'change')
      default: ''          // Default value
    },
    
    // String property (non-visual)
    name: {
      type: 'string' as const,
      default: ''
    },
    
    // String property with visual impact
    placeholder: {
      type: 'string' as const,
      visual: true,
      default: 'Select an option...'
    },
    
    // Boolean property
    disabled: {
      type: 'boolean' as const,
      visual: true,
      default: false
    },
    
    // Boolean property with alias support
    clearable: {
      type: 'boolean' as const,
      visual: true,
      default: true,
      aliases: {
        'not-clearable': false  // <ty-dropdown not-clearable>
      }
    },
    
    // String property with validation
    size: {
      type: 'string' as const,
      visual: true,
      default: 'md',
      validate: (v: any) => ['sm', 'md', 'lg'].includes(v),
      coerce: (v: any) => {
        if (!['sm', 'md', 'lg'].includes(v)) {
          console.warn(`[ty-dropdown] Invalid size. Using md.`)
          return 'md'
        }
        return v
      }
    },
    
    // Number property with bounds
    debounce: {
      type: 'number' as const,
      default: 0,
      validate: (v: any) => v >= 0 && v <= 5000,
      coerce: (v: any) => {
        const num = Number(v)
        if (isNaN(num)) return 0
        return Math.max(0, Math.min(5000, num))
      }
    }
  }
}
```

#### Property Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | `'string' \| 'boolean' \| 'number' \| 'object' \| 'array'` | Data type for automatic coercion |
| `visual` | `boolean` | If true, changing this property triggers `render()` |
| `formValue` | `boolean` | If true, changing this property updates form value |
| `emitChange` | `boolean` | If true, changing this property emits 'prop:change' event (distinct from user 'change' events) |
| `default` | `any` | Default value when property is undefined |
| `validate` | `(value: any) => boolean` | Custom validation function |
| `coerce` | `(value: any) => any` | Custom coercion/transformation function |
| `aliases` | `Record<string, any>` | Attribute aliases (e.g., `{'not-clearable': false}`) |

### Step 3: Create Property Accessors (Simple!)

These are **simple wrappers** with **no logic** - TyComponent handles everything:

```typescript
export class TyDropdown extends TyComponent<DropdownState> {
  // ... property configuration ...
  
  // ============================================================================
  // PROPERTY ACCESSORS - Just call getProperty/setProperty
  // ============================================================================
  
  get value(): string { 
    return this.getProperty('value') 
  }
  set value(v: string) { 
    this.setProperty('value', v) 
  }
  
  get placeholder(): string { 
    return this.getProperty('placeholder') 
  }
  set placeholder(v: string) { 
    this.setProperty('placeholder', v) 
  }
  
  get disabled(): boolean { 
    return this.getProperty('disabled') 
  }
  set disabled(v: boolean) { 
    this.setProperty('disabled', v) 
  }
  
  get clearable(): boolean {
    return this.getProperty('clearable')
  }
  set clearable(v: boolean) {
    this.setProperty('clearable', v)
  }
  
  get size(): Size { 
    return this.getProperty('size') as Size 
  }
  set size(v: Size) { 
    this.setProperty('size', v) 
  }
  
  get debounce(): number {
    return this.getProperty('debounce')
  }
  set debounce(v: number) {
    this.setProperty('debounce', v)
  }
}
```

**Important**: Property accessors should **never** contain logic. All validation, coercion, and side effects are handled by PropertyManager and lifecycle hooks.

### Step 4: Initialize Internal State

```typescript
export class TyDropdown extends TyComponent<DropdownState> {
  // ... properties and accessors ...
  
  // ============================================================================
  // INTERNAL STATE - Component-specific state
  // ============================================================================
  
  private _state: DropdownState = {
    open: false,
    search: '',
    highlightedIndex: -1,
    filteredOptions: [],
    currentValue: null,
    mode: isMobileDevice() ? 'mobile' : 'desktop'
  }
  
  // Other internal fields (not properties)
  private _scrollLockId: string | null = null
  private _searchDebounceTimer: number | null = null
}
```

### Step 5: Implement Constructor

```typescript
export class TyDropdown extends TyComponent<DropdownState> {
  // ... properties, accessors, state ...
  
  constructor() {
    super() // TyComponent handles attachInternals() and attachShadow()
    
    const shadow = this.shadowRoot!
    ensureStyles(shadow, { css: dropdownStyles, id: 'ty-dropdown' })
  }
}
```

**Note**: TyComponent's constructor automatically:
- Creates PropertyManager with your property configuration
- Calls `attachInternals()` for form association
- Calls `attachShadow({ mode: 'open' })`

### Step 6: Implement Lifecycle Hooks

#### `onConnect()` - Called when component connects to DOM

Use this instead of overriding `connectedCallback`:

```typescript
protected onConnect(): void {
  // Initialize state
  this.initializeState()
  
  // Set up observers, resize listeners, etc.
  this.setupResizeObserver()
}
```

#### `onDisconnect()` - Called when component disconnects from DOM

Use this for cleanup instead of overriding `disconnectedCallback`:

```typescript
protected onDisconnect(): void {
  // Clean up document-level listeners
  const outsideClickHandler = (this as any).tyOutsideClickHandler
  const keyboardHandler = (this as any).tyKeyboardHandler
  
  if (outsideClickHandler) {
    document.removeEventListener('click', outsideClickHandler)
    ;(this as any).tyOutsideClickHandler = null
  }
  
  if (keyboardHandler) {
    document.removeEventListener('keydown', keyboardHandler)
    ;(this as any).tyKeyboardHandler = null
  }
  
  // Clear any pending timers
  if (this._searchDebounceTimer !== null) {
    clearTimeout(this._searchDebounceTimer)
    this._searchDebounceTimer = null
  }
}
```

#### `onPropertiesChanged()` - Called when properties change

This is where you update internal state **before rendering**:

```typescript
protected onPropertiesChanged(changes: PropertyChange[]): void {
  for (const { name, newValue } of changes) {
    switch (name) {
      case 'value':
        // Update internal state when value changes
        this._state.currentValue = newValue || null
        this.syncSelectedOption()
        break
        
      case 'placeholder':
        // Update placeholder in DOM if already rendered
        this.updatePlaceholderInDOM()
        break
        
      case 'clearable':
        // Update clear button visibility
        this.updateClearButton()
        break
        
      case 'disabled':
        // Update disabled state in DOM
        this.updateDisabledState()
        break
    }
  }
}
```

**Important**: 
- This hook runs **before** `render()`
- Use it to update `_state` or other internal fields
- Don't call `render()` manually - TyComponent handles it
- Only visual properties trigger `render()` automatically

### Step 7: Implement Form Value Handling (Optional)

If your component is a form control, override `getFormValue()`:

```typescript
protected getFormValue(): FormDataEntryValue | null {
  return this._state.currentValue || null
}
```

TyComponent automatically:
- Calls `getFormValue()` when a `formValue: true` property changes
- Syncs the value to the form via `this._internals.setFormValue()`

### Step 8: Implement Render Method

This is where you update the DOM. Focus on **pure rendering** - no property synchronization:

```typescript
protected render(): void {
  if (this._state.mode === 'mobile') {
    this.renderMobile()
  } else {
    this.renderDesktop()
  }
}

private renderDesktop(): void {
  const shadow = this.shadowRoot!
  
  shadow.innerHTML = `
    <div class="ty-dropdown ${this.size} ${this.flavor}">
      ${this.label ? `<label>${this.label}</label>` : ''}
      <div class="ty-dropdown-trigger">
        <input 
          type="text" 
          placeholder="${this.placeholder}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
        />
        ${this.clearable ? '<button class="clear-btn">×</button>' : ''}
        <button class="chevron-btn">▼</button>
      </div>
      <div class="ty-dropdown-options">
        <!-- Options rendered here -->
      </div>
    </div>
  `
  
  // Attach event listeners
  this.attachEventListeners()
}
```

**Important**:
- `render()` is called automatically when visual properties change
- Don't manually sync properties to DOM - they're already in `this.getProperty(name)`
- Use property getters to access values: `this.placeholder`, `this.disabled`, etc.

---

## 🎨 Common Patterns

### Pattern 1: Boolean Properties with Aliases

```typescript
protected static properties = {
  clearable: {
    type: 'boolean' as const,
    visual: true,
    default: true,
    aliases: { 'not-clearable': false }
  }
}
```

**Usage**:
```html
<!-- Both are equivalent -->
<ty-dropdown clearable></ty-dropdown>
<ty-dropdown></ty-dropdown> <!-- default is true -->

<!-- Both hide the clear button -->
<ty-dropdown clearable="false"></ty-dropdown>
<ty-dropdown not-clearable></ty-dropdown>
```

### Pattern 2: Validated String Properties

```typescript
protected static properties = {
  size: {
    type: 'string' as const,
    visual: true,
    default: 'md',
    validate: (v: any) => ['sm', 'md', 'lg'].includes(v),
    coerce: (v: any) => {
      const valid = ['sm', 'md', 'lg']
      if (!valid.includes(v)) {
        console.warn(`[my-component] Invalid size '${v}'. Using 'md'.`)
        return 'md'
      }
      return v
    }
  }
}
```

### Pattern 3: Number Properties with Bounds

```typescript
protected static properties = {
  debounce: {
    type: 'number' as const,
    default: 0,
    validate: (v: any) => v >= 0 && v <= 5000,
    coerce: (v: any) => {
      const num = Number(v)
      if (isNaN(num)) return 0
      return Math.max(0, Math.min(5000, num))
    }
  }
}
```

### Pattern 4: Object/Array Properties

```typescript
protected static properties = {
  options: {
    type: 'array' as const,
    visual: true,
    default: [],
    validate: (v: any) => Array.isArray(v),
    coerce: (v: any) => {
      // Handle string attribute: options='[{"value":"1","label":"One"}]'
      if (typeof v === 'string') {
        try {
          return JSON.parse(v)
        } catch {
          console.warn('[my-component] Failed to parse options')
          return []
        }
      }
      return Array.isArray(v) ? v : []
    }
  }
}
```

### Pattern 5: Form-Associated Properties

```typescript
protected static properties = {
  value: {
    type: 'string' as const,
    visual: true,
    formValue: true,    // ← Syncs to form
    emitChange: true,   // ← Emits 'prop:change' event
    default: ''
  }
}

// Override form value handling if needed
protected getFormValue(): FormDataEntryValue | null {
  // Can return string, File, or FormData
  return this._state.currentValue || null
}
```

### Pattern 6: Non-Visual Properties

Some properties don't require re-rendering (like `name` or `debounce`):

```typescript
protected static properties = {
  name: {
    type: 'string' as const,
    // No 'visual: true' - changing this doesn't trigger render
    default: ''
  },
  debounce: {
    type: 'number' as const,
    // No 'visual: true' - only affects event emission timing
    default: 0
  }
}
```

---

## 🔍 Real-World Example: TyDropdown

Here's how the actual `TyDropdown` component is structured:

```typescript
export class TyDropdown extends TyComponent<DropdownState> {
  // ============================================================================
  // 1. PROPERTY CONFIGURATION
  // ============================================================================
  protected static properties = {
    value: {
      type: 'string' as const,
      visual: true,
      formValue: true,
      emitChange: true,
      default: ''
    },
    placeholder: {
      type: 'string' as const,
      visual: true,
      default: 'Select an option...'
    },
    clearable: {
      type: 'boolean' as const,
      visual: true,
      default: true,
      aliases: { 'not-clearable': false }
    },
    size: {
      type: 'string' as const,
      visual: true,
      default: 'md',
      validate: (v: any) => ['sm', 'md', 'lg'].includes(v),
      coerce: (v: any) => {
        if (!['sm', 'md', 'lg'].includes(v)) {
          console.warn(`[ty-dropdown] Invalid size. Using md.`)
          return 'md'
        }
        return v
      }
    }
    // ... more properties
  }
  
  // ============================================================================
  // 2. INTERNAL STATE
  // ============================================================================
  private _state: DropdownState = {
    open: false,
    search: '',
    highlightedIndex: -1,
    filteredOptions: [],
    currentValue: null,
    mode: isMobileDevice() ? 'mobile' : 'desktop'
  }
  
  // ============================================================================
  // 3. PROPERTY ACCESSORS (Simple!)
  // ============================================================================
  get value(): string { return this.getProperty('value') }
  set value(v: string) { this.setProperty('value', v) }
  
  get placeholder(): string { return this.getProperty('placeholder') }
  set placeholder(v: string) { this.setProperty('placeholder', v) }
  
  get clearable(): boolean { return this.getProperty('clearable') }
  set clearable(v: boolean) { this.setProperty('clearable', v) }
  
  get size(): Size { return this.getProperty('size') as Size }
  set size(v: Size) { this.setProperty('size', v) }
  
  // ============================================================================
  // 4. CONSTRUCTOR
  // ============================================================================
  constructor() {
    super()
    const shadow = this.shadowRoot!
    ensureStyles(shadow, { css: dropdownStyles, id: 'ty-dropdown' })
  }
  
  // ============================================================================
  // 5. LIFECYCLE HOOKS
  // ============================================================================
  protected onConnect(): void {
    this.initializeState()
  }
  
  protected onDisconnect(): void {
    // Cleanup listeners
  }
  
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    for (const { name, newValue } of changes) {
      switch (name) {
        case 'value':
          this._state.currentValue = newValue || null
          this.syncSelectedOption()
          break
        case 'clearable':
          this.updateClearButton()
          break
      }
    }
  }
  
  protected getFormValue(): FormDataEntryValue | null {
    return this._state.currentValue || null
  }
  
  // ============================================================================
  // 6. RENDER
  // ============================================================================
  protected render(): void {
    if (this._state.mode === 'mobile') {
      this.renderMobile()
    } else {
      this.renderDesktop()
    }
  }
  
  private renderDesktop(): void {
    // Pure rendering logic
  }
  
  // ============================================================================
  // 7. PRIVATE METHODS (Business Logic)
  // ============================================================================
  private initializeState(): void { /* ... */ }
  private syncSelectedOption(): void { /* ... */ }
  private updateClearButton(): void { /* ... */ }
  private attachEventListeners(): void { /* ... */ }
}
```

---

## ✅ Best Practices

### DO ✅

✅ **Use property configuration** for all component properties
✅ **Keep accessors simple** - just call `getProperty`/`setProperty`
✅ **Use `onPropertiesChanged`** for state updates before render
✅ **Mark visual properties** with `visual: true`
✅ **Mark form properties** with `formValue: true`
✅ **Provide validation** for properties with constraints
✅ **Provide coercion** for properties needing transformation
✅ **Use hooks** (`onConnect`, `onDisconnect`, `onPropertiesChanged`)
✅ **Focus on pure rendering** in `render()` method

### DON'T ❌

❌ **Don't put logic in property accessors** - use hooks instead
❌ **Don't manually call `render()`** - TyComponent handles it
❌ **Don't manually sync attributes** - TyComponent handles it
❌ **Don't override lifecycle methods** - use hooks instead
❌ **Don't update properties inside `render()`** - update in `onPropertiesChanged`
❌ **Don't forget `super()` in constructor**
❌ **Don't access `_internals` directly** - use `getFormValue()` hook

---

## 🧪 Testing Your Component

### Property Setting

```typescript
// Via attribute
dropdown.setAttribute('value', 'test')
console.assert(dropdown.value === 'test')

// Via property
dropdown.value = 'test2'
console.assert(dropdown.getAttribute('value') === 'test2')

// Before connectedCallback (React pattern)
const dropdown = document.createElement('ty-dropdown')
dropdown.value = 'preset'  // ← Set before mounting
document.body.appendChild(dropdown)
console.assert(dropdown.value === 'preset')  // ← Should work!
```

### Boolean Properties

```typescript
// Attribute presence
dropdown.setAttribute('disabled', '')
console.assert(dropdown.disabled === true)

// Attribute absence
dropdown.removeAttribute('disabled')
console.assert(dropdown.disabled === false)

// Alias
dropdown.setAttribute('not-clearable', '')
console.assert(dropdown.clearable === false)
```

### Form Integration

```typescript
const form = document.createElement('form')
const dropdown = document.createElement('ty-dropdown')
dropdown.name = 'country'
dropdown.value = 'us'

form.appendChild(dropdown)
document.body.appendChild(form)

const formData = new FormData(form)
console.assert(formData.get('country') === 'us')
```

### Change Events

```typescript
// Listen to property changes (reactive frameworks)
dropdown.addEventListener('prop:change', (e) => {
  console.log('Property changed:', e.detail)
  // { property: 'value', oldValue: 'old', newValue: 'new' }
})

// Listen to user interaction changes (business logic)
dropdown.addEventListener('change', (e) => {
  console.log('User changed:', e.detail)
  // { value: 'new', text: 'New Option', option: HTMLElement, originalEvent: Event }
})

dropdown.value = 'new'  // ← Triggers 'prop:change' if emitChange: true
```

---

## 🎯 Migration Checklist

When migrating an existing component to TyComponent:

- [ ] Create property configuration object
- [ ] Remove private field declarations for properties
- [ ] Simplify property accessors (use get/setProperty)
- [ ] Remove `observedAttributes` getter (auto-generated)
- [ ] Remove `attributeChangedCallback` method (inherited)
- [ ] Remove property capture code from `connectedCallback`
- [ ] Move initialization to `onConnect()` hook
- [ ] Move cleanup to `onDisconnect()` hook
- [ ] Move state updates to `onPropertiesChanged()` hook
- [ ] Remove manual `setAttribute` calls in setters
- [ ] Remove manual `render()` calls in setters
- [ ] Override `getFormValue()` instead of `updateFormValue()`
- [ ] Test all property setting scenarios

---

## 🚨 Common Pitfalls

### Pitfall 1: Logic in Property Accessors

❌ **Wrong**:
```typescript
set value(v: string) {
  this.setProperty('value', v)
  this._state.currentValue = v  // ← Don't do this here!
  this.render()                  // ← Don't do this here!
}
```

✅ **Correct**:
```typescript
set value(v: string) {
  this.setProperty('value', v)  // ← That's it!
}

protected onPropertiesChanged(changes: PropertyChange[]): void {
  for (const { name, newValue } of changes) {
    if (name === 'value') {
      this._state.currentValue = newValue  // ← Do it here instead
    }
  }
  // render() is called automatically by TyComponent
}
```

### Pitfall 2: Forgetting to Mark Visual Properties

❌ **Wrong**:
```typescript
protected static properties = {
  placeholder: {
    type: 'string' as const,
    // Missing: visual: true
    default: 'Select...'
  }
}
```

**Result**: Changing `placeholder` won't trigger re-render!

✅ **Correct**:
```typescript
protected static properties = {
  placeholder: {
    type: 'string' as const,
    visual: true,  // ← Add this!
    default: 'Select...'
  }
}
```

### Pitfall 3: Updating Properties During Render

❌ **Wrong**:
```typescript
protected render(): void {
  // Don't update properties inside render!
  if (this._state.open && this.clearable) {
    this.placeholder = 'Search...'  // ← Triggers another render!
  }
}
```

✅ **Correct**:
```typescript
protected onPropertiesChanged(changes: PropertyChange[]): void {
  // Update before render
  if (changes.some(c => c.name === 'open')) {
    if (this._state.open && this.clearable) {
      // Update internal state, not properties
      this._effectivePlaceholder = 'Search...'
    }
  }
}

protected render(): void {
  // Use computed state
  const placeholder = this._effectivePlaceholder || this.placeholder
}
```

---

## 📚 Summary

**TyComponent provides**:
1. ✅ Unified property/attribute synchronization
2. ✅ Automatic type coercion and validation
3. ✅ Declarative property configuration
4. ✅ Predictable lifecycle (State → Render → Events)
5. ✅ Form association support
6. ✅ Framework compatibility (React, Vue, Reagent)
7. ✅ Property aliases (e.g., not-clearable → clearable: false)

**You implement**:
1. Property configuration object
2. Simple property accessors
3. Internal state structure
4. Lifecycle hooks (onConnect, onDisconnect, onPropertiesChanged)
5. Render method (pure DOM updates)
6. Business logic (event handlers, etc.)

**Result**: Components are **consistent**, **maintainable**, and **work everywhere**!

---

## 🔗 Related Files

- `/packages/core/src/base/ty-component.ts` - Base class implementation
- `/packages/core/src/utils/property-manager.ts` - Property lifecycle manager
- `/packages/core/src/components/dropdown.ts` - Complete real-world example

---

**Built with TyComponent. Framework-agnostic by design. Standards-based for longevity.**
