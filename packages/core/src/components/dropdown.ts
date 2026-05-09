/**
 * TyDropdown Web Component
 * PORTED FROM: clj/ty/components/dropdown.cljs
 * 
 * A semantic dropdown component with:
 * - Desktop mode with smart positioning
 * - Mobile mode with full-screen modal
 * - Search and filtering capabilities
 * - Keyboard navigation
 * - Form association for native form submission
 * - Rich option support (option, ty-option, ty-tag)
 * 
 * @example
 * ```html
 * <!-- Basic dropdown -->
 * <ty-dropdown label="Country" placeholder="Select country" required>
 *   <option value="us">United States</option>
 *   <option value="uk">United Kingdom</option>
 *   <option value="ca">Canada</option>
 * </ty-dropdown>
 * 
 * <!-- With rich options -->
 * <ty-dropdown label="User">
 *   <ty-option value="1">
 *     <div class="flex items-center gap-2">
 *       <img src="avatar1.jpg" class="w-8 h-8 rounded-full" />
 *       <span>John Doe</span>
 *     </div>
 *   </ty-option>
 * </ty-dropdown>
 *
 * <!-- External search (parent owns filtering, dropdown emits `search` events) -->
 * <ty-dropdown label="Search API" external-search debounce="300">
 *   <option value="1">Result 1</option>
 * </ty-dropdown>
 * ```
 */

import type { Flavor, Size } from '../types/common.js'
import { ensureStyles } from '../utils/styles.js'
import { dropdownStyles } from '../styles/dropdown.js'
import { lockScroll, unlockScroll } from '../utils/scroll-lock.js'
import { isMobileTouch } from '../utils/mobile.js'
import { TyComponent } from '../base/ty-component.js'
import type { PropertyChange } from '../utils/property-manager.js'
import { CustomScrollbar, isCustomScrollbarEnabled } from '../utils/custom-scrollbar.js'
import { getLoaderSvg } from '../utils/loader-registry.js'

// ============================================================================
// Element Hash Utility (equivalent to ClojureScript's hash function)
// ============================================================================

/**
 * Counter for generating unique element IDs
 */
let elementIdCounter = 0

/**
 * WeakMap to store consistent element hashes
 * Automatically garbage collects when element is destroyed
 */
const elementIds = new WeakMap<object, number>()

/**
 * Get a consistent unique ID for an element (similar to ClojureScript's hash function)
 * Returns the same ID for the same element across multiple calls
 * 
 * @param element - The element to hash
 * @returns A consistent numeric hash for the element
 */
function getElementHash(element: object): number {
  let id = elementIds.get(element)
  if (id === undefined) {
    id = ++elementIdCounter
    elementIds.set(element, id)
  }
  return id
}

// ============================================================================
// SVG Icons
// ============================================================================

/**
 * Required indicator SVG icon (from Lucide)
 */
const REQUIRED_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-asterisk"><path d="M12 6v12"/><path d="M17.196 9 6.804 15"/><path d="m6.804 9 10.392 6"/></svg>`

/**
 * Chevron down icon SVG
 */
const CHEVRON_DOWN_SVG = `<svg viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
</svg>`

/**
 * Clear button X icon SVG (simple X)
 */
const CLEAR_ICON_SVG = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M6 6L14 14M14 6L6 14" stroke-linecap="round" />
</svg>`


/**
 * Option data structure
 */
interface OptionData {
  value: string
  text: string
  element: HTMLElement
}

/**
 * Component state structure
 */
interface DropdownState {
  open: boolean
  search: string
  highlightedIndex: number
  filteredOptions: OptionData[]
  currentValue: string | null
  mode: 'desktop' | 'mobile'
}

/**
 * Ty Dropdown Component
 */
export class TyDropdown extends TyComponent<DropdownState> {
  // ============================================================================
  // PROPERTY CONFIGURATION - Declarative property lifecycle
  // ============================================================================
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
      default: 'Select an option...'
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
    readonly: {
      type: 'boolean' as const,
      visual: true,
      default: false
    },
    required: {
      type: 'boolean' as const,
      visual: true,
      default: false
    },
    externalSearch: {
      type: 'boolean' as const,
      visual: true,
      default: false,
      aliases: { 'external-search': true }
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
      validate: (v: any) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
      coerce: (v: any) => {
        if (!['xs', 'sm', 'md', 'lg', 'xl'].includes(v)) {
          console.warn(`[ty-dropdown] Invalid size. Using md.`)
          return 'md'
        }
        return v
      }
    },
    flavor: {
      type: 'string' as const,
      visual: true,
      default: 'neutral',
      validate: (v: any) => ['primary', 'secondary', 'success', 'danger', 'warning', 'neutral'].includes(v),
      coerce: (v: any) => {
        const valid = ['primary', 'secondary', 'success', 'danger', 'warning', 'neutral']
        if (!valid.includes(v)) {
          console.warn(`[ty-dropdown] Invalid flavor. Using neutral.`)
          return 'neutral'
        }
        return v
      }
    },
    debounce: {
      type: 'number' as const,
      default: 0,
      validate: (v: any) => v >= 0 && v <= 5000,
      coerce: (v: any) => {
        const num = Number(v)
        if (isNaN(num)) return 0
        return Math.max(0, Math.min(5000, num))
      }
    },
    loading: {
      type: 'boolean' as const,
      visual: true,
      default: false
    }
  }

  // ============================================================================
  // PRIVATE FIELDS (will be removed in Phase 3)
  // ============================================================================
  private _value: string = ''
  private _placeholder: string = 'Select an option...'
  private _label: string = ''
  private _disabled = false
  private _readonly = false
  private _required = false
  private _externalSearch = false
  private _clearable = true
  private _loading = false
  private _size: Size = 'md'

  // Component state
  private _state: DropdownState = {
    open: false,
    search: '',
    highlightedIndex: -1,
    filteredOptions: [],
    currentValue: null,
    mode: 'desktop' // Updated dynamically on render via syncMode()
  }

  // Scroll lock ID (consistent across open/close cycles)
  private _scrollLockId: string | null = null

  // Event handler references for cleanup
  private _stubClickHandler: ((e: Event) => void) | null = null
  private _outsideClickHandler: ((e: Event) => void) | null = null
  private _optionClickHandler: ((e: Event) => void) | null = null
  private _searchInputHandler: ((e: Event) => void) | null = null
  private _blockSearchClick: ((e: Event) => void) | null = null
  private _keyboardHandler: ((e: KeyboardEvent) => void) | null = null
  private _clearClickHandler: ((e: Event) => void) | null = null

  // Debounce properties for search event
  private _debounce: number = 0
  private _searchDebounceTimer: number | null = null

  // Custom scrollbar for options list
  private _optionsScrollbar: CustomScrollbar | null = null

  // MutationObserver for light-DOM children — re-establishes the visual selection
  // when consumers swap option children (external-search refresh pattern).
  private _childObserver: MutationObserver | null = null

  constructor() {
    super() // TyComponent handles attachInternals() and attachShadow()

    const shadow = this.shadowRoot!
    ensureStyles(shadow, { css: dropdownStyles, id: 'ty-dropdown' })

    // Render based on device type
  }

  render(): void {
    // Sync mode on every render so rotation/resize is picked up
    this._state.mode = isMobileTouch() ? 'mobile' : 'desktop'

    if (this._state.mode === 'mobile') {
      this.renderMobile()
    } else {
      this.renderDesktop()
    }

    // Loading visual lives on a dynamically rendered wrapper; reapply each render
    this.applyLoadingState()
  }


  // ============================================================================
  // LIFECYCLE HOOKS - TyComponent integration
  // ============================================================================

  /**
   * Called when component is connected to DOM
   * TyComponent handles property capture automatically
   */
  protected onConnect(): void {
    this.initializeState()

    // Observe light-DOM children so we can re-establish the visual selection
    // when consumers replace options (typical external-search pattern).
    // redisplaySelected() is idempotent — bails fast when already in sync,
    // so spurious firings caused by our own clone management are no-ops.
    this._childObserver = new MutationObserver(() => this.redisplaySelected())
    this._childObserver.observe(this, { childList: true })
  }

  /**
   * Called when component is disconnected from DOM
   * Clean up event listeners and timers
   */
  protected onDisconnect(): void {
    // Clean up document-level listeners
    const outsideClickHandler = (this as any).tyOutsideClickHandler

    if (outsideClickHandler) {
      document.removeEventListener('click', outsideClickHandler)
        ; (this as any).tyOutsideClickHandler = null
    }

    // Clear any pending debounce timer
    if (this._searchDebounceTimer !== null) {
      clearTimeout(this._searchDebounceTimer)
      this._searchDebounceTimer = null
    }

    // Cleanup custom scrollbar
    this._destroyOptionsScrollbar()

    // Disconnect children observer
    if (this._childObserver) {
      this._childObserver.disconnect()
      this._childObserver = null
    }
  }

  /**
   * Re-establish the visual selection (selected attribute + slot clone) for the
   * current value, when the matching option exists in children but isn't yet
   * marked. Called from the children MutationObserver — covers the case where
   * a consumer swaps options dynamically (external-search refresh) and wipes
   * out the previous selection's marker + clone in the process.
   *
   * Idempotent — bails when nothing to do, so it's safe to call from the
   * MutationObserver callback even when the trigger was our own clone work.
   */
  private redisplaySelected(): void {
    const currentValue = this._state.currentValue
    if (!currentValue) return

    const options = this.getOptions()
    const matching = options.find(opt => this.getOptionData(opt).value === currentValue)

    // Already correctly displayed — nothing to do
    if (!matching || matching.hasAttribute('selected')) return

    // Re-mark and re-clone WITHOUT firing change (we're recovering display state,
    // not making a new selection)
    this.clearSelection()
    const clone = matching.cloneNode(true) as HTMLElement
    clone.setAttribute('slot', 'selected')
    clone.setAttribute('cloned', 'true')
    matching.parentNode!.appendChild(clone)
    matching.setAttribute('selected', '')
    this.updateSelectionDisplay()
  }

  /**
   * Called when properties change
   * Handle state synchronization BEFORE render
   */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    // Sync private fields from PropertyManager
    // (Render methods still use private fields)
    for (const { name, newValue } of changes) {
      switch (name) {
        case 'value':
          this._value = newValue || ''
          this._state.currentValue = newValue || null
          this.syncSelectedOption()
          break

        case 'placeholder':
          this._placeholder = newValue || 'Select an option...'
          this.updatePlaceholderInDOM()
          break

        case 'label':
          this._label = newValue || ''
          break

        case 'disabled':
          this._disabled = newValue
          break

        case 'readonly':
          this._readonly = newValue
          break

        case 'required':
          this._required = newValue
          break

        case 'externalSearch':
          this._externalSearch = newValue
          break

        case 'clearable':
          this._clearable = newValue
          this.updateClearButton()
          break

        case 'size':
          this._size = newValue
          break

        case 'debounce':
          this._debounce = newValue
          break

        case 'loading':
          this._loading = newValue
          this.applyLoadingState()
          break
      }
    }
  }

  /**
   * Toggle the loading visual state on the open popup.
   * Replaces the options list with a centered spinner; search input stays usable.
   * Pulls the latest registered loader SVG on each call so registry changes
   * take effect on the next loading toggle.
   */
  private applyLoadingState(): void {
    const shadow = this.shadowRoot
    if (!shadow) return
    const svg = this._loading ? getLoaderSvg() : null
    shadow.querySelectorAll('.dropdown-options-wrapper').forEach((wrapper) => {
      wrapper.classList.toggle('loading', this._loading)
      if (this._loading) {
        wrapper.setAttribute('aria-busy', 'true')
        const spinner = wrapper.querySelector('.dropdown-loading-spinner')
        if (spinner && svg) spinner.innerHTML = svg
      } else {
        wrapper.removeAttribute('aria-busy')
      }
    })
  }

  /**
   * Get the form value for this component
   * TyComponent calls this automatically when formValue property changes
   */
  protected getFormValue(): FormDataEntryValue | null {
    return this._state.currentValue || null
  }

  /**
   * Parse dropdown value (single string)
   */
  private parseValue(value: string | null): string | null {
    // Defensive check: ensure value is actually a string before calling .trim()
    if (!value || typeof value !== 'string' || value.trim() === '') return null
    return value.trim()
  }

  /**
   * Initialize component state from attributes
   */
  private initializeState(): void {

    if (this._value) {
      this._state.currentValue = this.parseValue(this._value)

      // CRITICAL: Options may not be slotted yet when connectedCallback runs
      // Defer sync to next frame to ensure options are available
      requestAnimationFrame(() => {
        this.syncSelectedOption()
        // updateFormValue() called automatically by TyComponent
      })
    }

    // Listen for clear-selection events from ty-options (mobile clear button)
    this.addEventListener('clear-selection', (e: Event) => {
      e.stopPropagation() // Prevent bubbling

      // Clear the selection
      this.clearSelection()
      this._state.currentValue = null
      this.updateComponentValue()
      this.updateSelectionDisplay()
      // updateFormValue() called automatically by TyComponent

      // Dispatch change event
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          value: null,
          text: '',
          option: null,
          originalEvent: e
        },
        bubbles: true,
        composed: true
      }))

      // If in mobile modal, close it
      if (this._state.open && this._state.mode === 'mobile') {
        this.closeMobileModal()
      }
    })
    // Render the component with current state
    this.render()
  }

  /**
   * Update placeholder text in existing rendered HTML
   * Called when placeholder changes after initial render
   */
  private updatePlaceholderInDOM(): void {
    const shadow = this.shadowRoot!

    // Update stub placeholder
    const stubPlaceholder = shadow.querySelector('.dropdown-placeholder')
    if (stubPlaceholder) {
      stubPlaceholder.textContent = this._placeholder
    }

    // Update search input placeholder (desktop)
    const searchInput = shadow.querySelector('.dropdown-search-input') as HTMLInputElement
    if (searchInput) {
      searchInput.placeholder = this._placeholder
    }

    // Update mobile search input placeholder
    const mobileSearchInput = shadow.querySelector('.mobile-search-input') as HTMLInputElement
    if (mobileSearchInput) {
      mobileSearchInput.placeholder = this._placeholder
    }
  }


  // ============================================================================
  // SHARED CORE METHODS
  // ============================================================================
  // Methods used by BOTH desktop and mobile implementations:
  // 
  // OPTION MANAGEMENT:
  // - getOptions(): Get all option elements from slot
  // - getOptionData(): Extract value and text from option element
  // - selectOption(): Select an option (used by both desktop/mobile clicks)
  // - clearSelection(): Clear all selections
  // - syncSelectedOption(): Sync selected option based on current value
  // 
  // STATE SYNCHRONIZATION:
  // - updateComponentValue(): Update component value attribute
  // - updateFormValue(): Update form value via ElementInternals
  // 
  // DISPLAY UPDATES:
  // - updateSelectionDisplay(): Show/hide placeholder
  // - updateClearButton(): Show/hide clear button (desktop only)
  // 
  // EVENT DISPATCHING:
  // - dispatchChangeEvent(): Dispatch change event
  // - dispatchSearchEvent(): Dispatch search event with debounce
  // - fireSearchEvent(): Fire the actual search event
  // 
  // FILTERING & SEARCH:
  // - filterOptions(): Filter options by query
  // - updateOptionVisibility(): Show/hide options based on filter
  // 
  // HIGHLIGHTING (keyboard navigation):
  // - clearHighlights(): Clear all option highlights
  // - highlightOption(): Highlight option at index
  // 
  // UTILITY:
  // - buildStubClasses(): Build CSS class list for stub
  // ============================================================================

  /**
   * Update form value via ElementInternals
   */

  /**
   * Get all option elements from slot
   * Supports: <option>, <ty-option>, <ty-tag>
   */
  private getOptions(): HTMLElement[] {
    const shadow = this.shadowRoot!
    const slot = shadow.querySelector('slot:not([name])') as HTMLSlotElement
    if (!slot) return []

    const assigned = (slot.assignedElements ? slot.assignedElements() : []) as HTMLElement[]
    return assigned.filter(el => {
      const tag = el.tagName
      return tag === 'OPTION' || tag === 'TY-OPTION' || tag === 'TY-TAG'
    })
  }

  /**
   * Extract value and text from option element
   */
  private getOptionData(element: HTMLElement): OptionData {
    const tag = element.tagName

    if (tag === 'OPTION') {
      const optionEl = element as HTMLOptionElement
      return {
        value: optionEl.value || optionEl.textContent || '',
        text: optionEl.textContent || '',
        element
      }
    }

    if (tag === 'TY-OPTION') {
      // CRITICAL: Use .value property, not getAttribute!
      // Framework may set property before attribute
      const tyOption = element as any
      return {
        value: tyOption.value || element.textContent || '',
        text: element.textContent || '',
        element
      }
    }

    if (tag === 'TY-TAG') {
      return {
        value: element.getAttribute('value') || element.textContent || '',
        text: element.textContent || '',
        element
      }
    }

    return {
      value: element.textContent || '',
      text: element.textContent || '',
      element
    }
  }

  /**
   * Clear all selections
   */
  private clearSelection(): void {
    const shadow = this.shadowRoot!
    const options = this.getOptions()

    // Clear selected attribute from all options
    options.forEach(opt => opt.removeAttribute('selected'))

    // Remove clones from selected slot
    const selectedSlot = shadow.querySelector('slot[name="selected"]') as HTMLSlotElement | null
    if (selectedSlot) {
      const assigned = selectedSlot.assignedElements ? selectedSlot.assignedElements() : []
      const clones = Array.from(assigned as Element[]).filter((el: Element) => el.hasAttribute('cloned'))
      clones.forEach((clone: Element) => clone.remove())
    }
  }

  /**
   * Select an option
   */
  private selectOption(option: HTMLElement, originalEvent?: Event): void {
    const optionData = this.getOptionData(option)
    const isEmpty = !optionData.value || optionData.value.trim() === ''

    this.clearSelection()// If value is empty, just clear and don't clone anything
    if (isEmpty) {
      this._state.currentValue = null
    } else {
      // Clone option for display in stub
      const clone = option.cloneNode(true) as HTMLElement
      clone.setAttribute('slot', 'selected')
      clone.setAttribute('cloned', 'true')
      option.parentNode!.appendChild(clone)

      // Mark original as selected
      option.setAttribute('selected', '')

      // Update state
      this._state.currentValue = optionData.value
    }
    this.updateComponentValue()
    this.updateSelectionDisplay()
    // updateFormValue() called automatically by TyComponent

    // Dispatch change event
    this.dispatchChangeEvent(option, originalEvent)
  }

  /**
   * Sync selected option based on current value
   */
  private syncSelectedOption(): void {
    const options = this.getOptions()
    const currentValue = this._state.currentValue

    if (!currentValue) {
      this.clearSelection()
      return
    }

    // Find matching option
    const matchingOption = options.find(opt => {
      const data = this.getOptionData(opt)
      return data.value === currentValue
    })

    if (matchingOption) {
      this.selectOption(matchingOption)
    }
  }

  /**
   * Update component value attribute for consistency
   */
  private updateComponentValue(): void {
    const currentValue = this._state.currentValue
    if (currentValue !== null) {
      this.setAttribute('value', currentValue)
    } else {
      this.removeAttribute('value')
    }
    // Also set property
    this._value = currentValue || ''
  }

  /**
   * Update selection display (show/hide placeholder)
   */
  private updateSelectionDisplay(): void {
    const shadow = this.shadowRoot!
    const stub = shadow.querySelector('.dropdown-stub')
    if (!stub) return

    const options = this.getOptions()
    const hasSelected = options.some(opt => opt.hasAttribute('selected'))

    if (hasSelected) {
      stub.classList.add('has-selection')
    } else {
      stub.classList.remove('has-selection')
    }

    // Update clear button visibility
    this.updateClearButton()
  }

  private updateClearButton(): void {
    const shadow = this.shadowRoot!
    const clearBtn = shadow.querySelector('.dropdown-clear-btn') as HTMLElement
    if (!clearBtn) return

    const hasSelection = this._state.currentValue !== null && this._state.currentValue !== ''
    const shouldShow = this._clearable &&
      hasSelection &&
      !this._disabled &&
      !this._readonly &&
      !this._state.open &&
      this._state.mode !== 'mobile'

    // CRITICAL: Only show clear button when dropdown is closed

    if (shouldShow) {
      clearBtn.style.display = 'block'
    } else {
      clearBtn.style.display = 'none'
    }
  }

  /**
   * Dispatch change event
   */
  private dispatchChangeEvent(option: HTMLElement, originalEvent?: Event): void {
    const optionData = this.getOptionData(option)

    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        value: this._state.currentValue,
        text: optionData.text,
        option,
        originalEvent: originalEvent || null
      },
      bubbles: true,
      composed: true
    }))
  }

  private filterOptions(options: OptionData[], query: string): OptionData[] {
    if (!query || query.trim() === '') {
      return options
    }

    const searchLower = query.toLowerCase()
    return options.filter(({ text }) =>
      text.toLowerCase().includes(searchLower)
    )
  }

  private updateOptionVisibility(filteredOptions: OptionData[], allOptions: OptionData[]): void {
    const visibleValues = new Set(filteredOptions.map(opt => opt.value))

    allOptions.forEach(({ value, element }) => {
      if (visibleValues.has(value)) {
        element.removeAttribute('hidden')
      } else {
        element.setAttribute('hidden', '')
      }
    })
  }

  /**
   * Clear all option highlights
   */
  private clearHighlights(options: OptionData[]): void {
    options.forEach(({ element }) => {
      element.removeAttribute('highlighted')
    })
  }

  private highlightOption(options: OptionData[], index: number): void {
    this.clearHighlights(options)

    if (index >= 0 && index < options.length) {
      const { element } = options[index]
      element.setAttribute('highlighted', '')

      // Scroll into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }


  // ============================================================================
  // SHARED EVENT HANDLERS
  // ============================================================================
  // Event handlers used by BOTH desktop and mobile:
  // 
  // - handleSearchInput(): Handles search input for both dialog and modal
  //   * Desktop: Filters options locally OR dispatches search event
  //   * Mobile: Same behavior
  // ============================================================================

  /**
   * Setup event listeners
   */
  private setupDesktopEventListeners(): void {
    const shadow = this.shadowRoot!
    const stub = shadow.querySelector('.dropdown-stub')
    const optionsSlot = shadow.querySelector('#options-slot')
    const searchInput = shadow.querySelector('.dropdown-search-input')

    if (stub) {
      this._stubClickHandler = this.handleDesktopStubClick.bind(this)
      stub.addEventListener('click', this._stubClickHandler)
    }

    // Add option click handler to slot
    if (optionsSlot) {
      this._optionClickHandler = this.handleDesktopOptionClick.bind(this)
      optionsSlot.addEventListener('click', this._optionClickHandler)
    }

    // Add search input handlers
    if (searchInput) {
      this._searchInputHandler = this.handleSearchInput.bind(this)
      this._blockSearchClick = this.blockSearchClick.bind(this)

      searchInput.addEventListener('input', this._searchInputHandler)
      searchInput.addEventListener('click', this._blockSearchClick)
    }

    // Add clear button handler
    const clearBtn = shadow.querySelector('.dropdown-clear-btn')
    if (clearBtn) {
      this._clearClickHandler = this.handleDesktopClearClick.bind(this)
      clearBtn.addEventListener('click', this._clearClickHandler)
    }

    // Setup document-level event listeners immediately (like ClojureScript version)
    this._outsideClickHandler = this.handleDesktopOutsideClick.bind(this)
    this._keyboardHandler = this.handleDesktopKeyboard.bind(this)

    document.addEventListener('click', this._outsideClickHandler)
    document.addEventListener('keydown', this._keyboardHandler)
  }

  // removeEventListeners removed - now using ClojureScript pattern


  // ============================================================================
  // SHARED HELPER METHODS (Internal)
  // ============================================================================
  // Internal helpers that reduce duplication between desktop and mobile.
  // These are called by both implementations but not exposed publicly.
  // ============================================================================

  /**
   * Lock scroll with consistent ID generation
   */
  private lockDropdownScroll(): void {
    const dropdownId = `dropdown-${this.id || 'anon'}-${getElementHash(this)}`
    this._scrollLockId = dropdownId
    lockScroll(dropdownId)
  }

  /**
   * Unlock scroll using stored ID
   */
  private unlockDropdownScroll(): void {
    if (this._scrollLockId) {
      unlockScroll(this._scrollLockId)
      this._scrollLockId = null
    }
  }

  /**
   * Initialize options state when opening dropdown/modal
   * @param highlightSelected - Whether to highlight the currently selected option
   */
  private initializeOptionsState(highlightSelected: boolean = false): void {
    const options = this.getOptions().map(el => this.getOptionData(el))
    const currentValue = this._state.currentValue

    this._state.filteredOptions = options

    if (highlightSelected && currentValue) {
      // Find the index of the currently selected option
      const selectedIndex = options.findIndex(opt => opt.value === currentValue)
      this._state.highlightedIndex = selectedIndex

      // Highlight and scroll to selected option if it exists
      if (selectedIndex >= 0) {
        this.highlightOption(options, selectedIndex)
      }
    } else {
      this._state.highlightedIndex = -1
    }
  }

  /**
   * Base stub click handler - validates state then calls open callback
   * @param e - Click event
   * @param openCallback - Function to call to open (desktop or mobile)
   */
  private handleStubClickBase(e: Event, openCallback: () => void): void {
    e.preventDefault()
    e.stopPropagation()

    if (this._disabled || this._readonly) {
      return
    }

    openCallback()
  }

  /**
   * Base option click handler - finds option, selects it, then calls close callback
   * @param e - Click event
   * @param closeCallback - Function to call to close (desktop or mobile)
   */
  private handleOptionClickBase(e: Event, closeCallback: () => void): void {
    e.preventDefault()
    e.stopPropagation()

    const target = e.target as HTMLElement

    // Find the option element (might be clicking on child element)
    const option = target.closest('option, ty-option, ty-tag') as HTMLElement
    if (!option) return

    // Select the option
    this.selectOption(option, e)

    // Update display
    this.updateSelectionDisplay()

    // Close dropdown/modal
    closeCallback()
  }

  /**
   * Base clear click handler - clears selection and optionally closes
   * @param e - Click event
   * @param closeCallback - Optional function to call to close (mobile only)
   */
  private handleClearClickBase(e: Event, closeCallback?: () => void): void {
    e.preventDefault()
    e.stopPropagation()

    // Clear the selection
    this.clearSelection()
    this._state.currentValue = null
    this.updateComponentValue()
    this.updateSelectionDisplay()
    // updateFormValue() called automatically by TyComponent

    // Dispatch change event with null value
    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        value: null,
        text: '',
        option: null,
        originalEvent: e
      },
      bubbles: true,
      composed: true
    }))

    // Close if callback provided (mobile modal case)
    if (closeCallback) {
      closeCallback()
    }
  }

  // ============================================================================
  // DESKTOP IMPLEMENTATION (Dialog-based)
  // ============================================================================
  // Desktop uses <dialog> element with smart positioning.
  // 
  // EVENT FLOW:
  // 1. User clicks stub → handleDesktopStubClick() → openDesktopDropdown()
  // 2. Dialog shown with showModal(), positioned via calculateDesktopPosition()
  // 3. User types in search → handleSearchInput() [SHARED]
  // 4. User clicks option → handleDesktopOptionClick() → selectOption() [SHARED] → closeDesktopDropdown()
  // 5. User clicks outside → handleDesktopOutsideClick() → closeDesktopDropdown()
  // 6. User presses Escape → handleDesktopKeyboard() → closeDesktopDropdown()
  // 7. User clicks clear button → handleDesktopClearClick() → clearSelection() [SHARED]
  // 
  // METHODS:
  // - calculateDesktopPosition(): Smart dropdown positioning (below/above stub)
  // - openDesktopDropdown(): Open desktop dialog
  // - closeDesktopDropdown(): Close desktop dialog
  // - handleDesktopStubClick(): Open on stub click
  // - handleDesktopOptionClick(): Select option and close
  // - handleDesktopClearClick(): Clear selection
  // - handleDesktopOutsideClick(): Close on outside click
  // - handleDesktopKeyboard(): Arrow navigation + Enter/Escape
  // - renderDesktop(): Render desktop HTML
  // - setupDesktopEventListeners(): Setup desktop event handlers
  // ============================================================================



  /**
   * Calculate and set dropdown position with smart direction detection
   */
  private calculateDesktopPosition(): void {
    const shadow = this.shadowRoot!
    const stub = shadow.querySelector('.dropdown-stub') as HTMLElement
    const dialog = shadow.querySelector('.dropdown-dialog') as HTMLDialogElement

    if (!stub || !dialog) return

    const stubRect = stub.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Get dialog dimensions (it's already shown with showModal)
    const dialogRect = dialog.getBoundingClientRect()
    const estimatedHeight = dialogRect.height || 200

    const padding = 8
    const wrapPadding = 20

    // Available space calculations
    const spaceBelow = viewportHeight - stubRect.bottom
    const spaceRight = viewportWidth - stubRect.left

    // Smart direction logic
    const positionBelow = spaceBelow >= estimatedHeight + padding
    const fitsHorizontally = spaceRight >= stubRect.width

    // Calculate position coordinates
    const x = fitsHorizontally
      ? stubRect.left - wrapPadding
      : Math.max(padding, viewportWidth - stubRect.width - padding)

    const y = positionBelow
      ? stubRect.top - wrapPadding
      : viewportHeight - stubRect.bottom - wrapPadding

    const width = stubRect.width + wrapPadding + wrapPadding

    // Set CSS variables for positioning
    this.style.setProperty('--dropdown-x', `${x}px`)
    this.style.setProperty('--dropdown-y', `${y}px`)
    this.style.setProperty('--dropdown-width', `${width}px`)
    this.style.setProperty('--dropdown-offset-x', '0px')
    this.style.setProperty('--dropdown-offset-y', '0px')
    this.style.setProperty('--dropdown-padding', `${wrapPadding}px`)

    // Set direction classes for CSS styling
    if (positionBelow) {
      dialog.classList.add('position-below')
      dialog.classList.remove('position-above')
    } else {
      dialog.classList.add('position-above')
      dialog.classList.remove('position-below')
    }

    // Optional: Store direction for debugging
    this.style.setProperty('--dropdown-direction', positionBelow ? 'below' : 'above')
  }

  /**
   * Open dropdown dialog
   */
  private openDesktopDropdown(): void {
    const shadow = this.shadowRoot!
    const dialog = shadow.querySelector('.dropdown-dialog') as HTMLDialogElement
    if (!dialog) return

    // Lock scroll
    this.lockDropdownScroll()

    // Show modal first so browser can calculate dimensions
    dialog.showModal()
    dialog.classList.add('open')

    // Position dropdown AFTER showing modal
    this.calculateDesktopPosition()

    // Update component state
    this._state.open = true

    // Update visual states
    const chevron = shadow.querySelector('.dropdown-chevron')
    if (chevron) chevron.classList.add('open')

    const searchChevron = shadow.querySelector('.dropdown-search-chevron')
    if (searchChevron) searchChevron.classList.add('open')

    // Initialize options state and highlight selected option
    this.initializeOptionsState(true)

    // Focus search input
    const searchInput = shadow.querySelector('.dropdown-search-input') as HTMLInputElement
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100)
    }

    // Setup custom scrollbar on options
    this._setupOptionsScrollbar()

    // Hide clear button when dropdown is open
    this.updateClearButton()

    // Lifecycle event (also fires empty search if external-search)
    this.fireOpenEvent()
  }

  /**
   * Close dropdown dialog
   */
  private closeDesktopDropdown(): void {
    const shadow = this.shadowRoot!
    const dialog = shadow.querySelector('.dropdown-dialog') as HTMLDialogElement
    if (!dialog) return

    // Unlock scroll
    this.unlockDropdownScroll()

    // Destroy custom scrollbar
    this._destroyOptionsScrollbar()

    // Close dialog
    dialog.classList.remove('open')
    dialog.classList.remove('position-above')
    dialog.classList.remove('position-below')
    dialog.close()

    // Update state
    this._state.open = false
    this._state.highlightedIndex = -1

    // Update visual states
    const chevron = shadow.querySelector('.dropdown-chevron')
    if (chevron) chevron.classList.remove('open')

    const searchChevron = shadow.querySelector('.dropdown-search-chevron')
    if (searchChevron) searchChevron.classList.remove('open')

    // Reset search query when in external mode (parent owns the options)
    if (this._externalSearch) {
      this._state.search = ''
    }

    // Show clear button when dropdown is closed (if applicable)
    this.updateClearButton()

    // Lifecycle event
    this.fireCloseEvent()
  }

  /**
   * Handle outside click to close dropdown
   */
  private handleDesktopOutsideClick(e: Event): void {
    if (!this._state.open) return

    const target = e.target as Node
    const shadow = this.shadowRoot!

    // CRITICAL: Check if click is inside .dropdown-wrapper (like ClojureScript version)
    // Not the whole component - this prevents the component itself from being counted
    const wrapper = shadow.querySelector('.dropdown-wrapper')
    const clickedInside = wrapper && wrapper.contains(target)



    if (!clickedInside) {

      this.closeDesktopDropdown()
    }
  }

  /**
   * Handle search input changes
   */
  private handleSearchInput(e: Event): void {
    const target = e.target as HTMLInputElement
    const query = target.value

    // Update search state
    this._state.search = query

    if (this._externalSearch) {
      // External search: dispatch event for external handling
      this.dispatchSearchEvent(query, e)
    } else {
      // Internal search: filter options locally
      const allOptions = this.getOptions().map(el => this.getOptionData(el))
      const filtered = this.filterOptions(allOptions, query)

      // Update state
      this._state.filteredOptions = filtered
      this._state.highlightedIndex = -1

      // Update visibility
      this.updateOptionVisibility(filtered, allOptions)

      // Clear highlights
      this.clearHighlights(allOptions)
    }
  }

  /**
   * Block search input click from bubbling
   * Prevents search input clicks from triggering outside click handler
   */
  private blockSearchClick(e: Event): void {
    e.stopPropagation()
    e.preventDefault()
  }

  /**
   * Dispatch search event for external search handling
   * With optional debounce support
   */
  private dispatchSearchEvent(query: string, originalEvent?: Event): void {
    // Clear existing timer
    if (this._searchDebounceTimer !== null) {
      clearTimeout(this._searchDebounceTimer)
      this._searchDebounceTimer = null
    }

    // If debounce is set, debounce the event
    if (this._debounce > 0) {
      this._searchDebounceTimer = window.setTimeout(() => {
        this.fireSearchEvent(query, originalEvent)
        this._searchDebounceTimer = null
      }, this._debounce)
    } else {
      // Fire immediately if no debounce
      this.fireSearchEvent(query, originalEvent)
    }
  }

  /**
   * Fire the actual search event
   */
  private fireSearchEvent(query: string, originalEvent?: Event): void {
    this.dispatchEvent(new CustomEvent('search', {
      detail: {
        query,
        originalEvent: originalEvent || null
      },
      bubbles: true,
      composed: true
    }))
  }

  /**
   * Dispatch lifecycle events for popup open/close.
   * On open with external-search, also fire a `search` event with an empty
   * query so consumers have a clean hook to reset/refetch the option list —
   * fixes the "stale filtered options on reopen" UX issue.
   */
  private fireOpenEvent(): void {
    this.dispatchEvent(new CustomEvent('open', {
      detail: { mode: this._state.mode },
      bubbles: true,
      composed: true
    }))
    if (this._externalSearch) {
      this.fireSearchEvent('')
    }
  }

  private fireCloseEvent(): void {
    this.dispatchEvent(new CustomEvent('close', {
      detail: { mode: this._state.mode },
      bubbles: true,
      composed: true
    }))
  }

  // ============================================================================
  // DESKTOP KEYBOARD NAVIGATION
  // ============================================================================
  // Handles: Escape, Enter, ArrowUp, ArrowDown
  // Works with both search input focus and document-level events
  // Wraps around: ArrowUp at index 0 → last option, ArrowDown at last → first
  // ============================================================================



  /**
   * Handle keyboard navigation
   */
  private handleDesktopKeyboard(e: KeyboardEvent): void {
    if (!this._state.open) return

    const shadow = this.shadowRoot!
    const searchInput = shadow.querySelector('.dropdown-search-input') as HTMLInputElement
    const target = e.target as HTMLElement

    // Only handle navigation keys when dropdown is open and either:
    // 1. Event comes from search input, OR
    // 2. Event comes from document but search input is not focused
    const shouldHandle = target === searchInput ||
      document.activeElement !== searchInput

    if (!shouldHandle) return

    // Get current state values
    const filteredOptions = this._state.filteredOptions
    const optionsCount = filteredOptions.length
    const currentHighlightedIndex = this._state.highlightedIndex



    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        this.closeDesktopDropdown()
        break

      case 'Enter':
        e.preventDefault()
        e.stopPropagation()
        // Select highlighted option if any
        if (currentHighlightedIndex >= 0 && currentHighlightedIndex < optionsCount) {
          const option = filteredOptions[currentHighlightedIndex]
          this.selectOption(option.element, e)
          this.updateSelectionDisplay()
          this.closeDesktopDropdown()
        }
        break

      case 'ArrowUp':
        e.preventDefault()
        e.stopPropagation()
        let newIndexUp: number

        if (optionsCount === 0) {
          newIndexUp = -1
        } else if (currentHighlightedIndex === -1) {
          // Nothing highlighted, go to last option
          newIndexUp = optionsCount - 1
        } else if (currentHighlightedIndex === 0) {
          // At first option, wrap to last
          newIndexUp = optionsCount - 1
        } else {
          // Move up one
          newIndexUp = currentHighlightedIndex - 1
        }


        this._state.highlightedIndex = newIndexUp
        this.highlightOption(filteredOptions, newIndexUp)
        break

      case 'ArrowDown':
        e.preventDefault()
        e.stopPropagation()
        let newIndexDown: number

        if (optionsCount === 0) {
          newIndexDown = -1
        } else if (currentHighlightedIndex === -1) {
          // Nothing highlighted, go to first option
          newIndexDown = 0
        } else if (currentHighlightedIndex === optionsCount - 1) {
          // At last option, wrap to first
          newIndexDown = 0
        } else {
          // Move down one
          newIndexDown = currentHighlightedIndex + 1
        }


        this._state.highlightedIndex = newIndexDown
        this.highlightOption(filteredOptions, newIndexDown)
        break
    }
  }

  /**
   * Handle stub click - open dropdown
   */
  private handleDesktopStubClick(e: Event): void {
    this.handleStubClickBase(e, () => this.openDesktopDropdown())
  }


  /**
   * Handle option click - select option and close
   */
  private handleDesktopOptionClick(e: Event): void {
    this.handleOptionClickBase(e, () => this.closeDesktopDropdown())
  }

  /**
   * Handle clear button click - clear selection
   * CRITICAL: Must prevent dropdown from opening!
   */
  private handleDesktopClearClick(e: Event): void {
    this.handleClearClickBase(e)
    // Desktop doesn't close on clear, just clears the selection
  }

  // ============================================================================
  // CUSTOM SCROLLBAR FOR OPTIONS
  // ============================================================================

  private _setupOptionsScrollbar(): void {
    if (!isCustomScrollbarEnabled()) return

    const shadow = this.shadowRoot!
    const optionsDiv = shadow.querySelector('.dropdown-options') as HTMLElement
    const optionsWrapper = shadow.querySelector('.dropdown-options-wrapper') as HTMLElement
    if (!optionsDiv || !optionsWrapper) return

    this._destroyOptionsScrollbar()

    optionsDiv.classList.add('ty-custom-scroll')
    this._optionsScrollbar = new CustomScrollbar(optionsDiv, { vertical: true })

    // Append track to wrapper (outside scroll area)
    if (this._optionsScrollbar.trackY) {
      optionsWrapper.appendChild(this._optionsScrollbar.trackY)
    }
  }

  private _destroyOptionsScrollbar(): void {
    if (this._optionsScrollbar) {
      this._optionsScrollbar.trackY?.remove()
      this._optionsScrollbar.destroy()
      this._optionsScrollbar = null
    }
  }

  /**
   * Build CSS class list for stub
   */
  private buildStubClasses(): string {
    const classes: string[] = [this._size]
    if (this._disabled) classes.push('disabled')
    if (this._clearable) classes.push('clearable')
    return classes.join(' ')
  }

  /**
   * Render desktop mode with dialog
   */
  private renderDesktop(): void {
    const shadow = this.shadowRoot!

    // Only set innerHTML and setup listeners if container doesn't exist (like ClojureScript)
    if (!shadow.querySelector('.dropdown-container')) {
      const stubClasses = this.buildStubClasses()

      const labelHtml = this._label ? `
        <label class="dropdown-label">
          ${this._label}
          ${this._required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ''}
        </label>
      ` : ''


      shadow.innerHTML = `
        <div class="dropdown-container dropdown-mode-desktop">
          ${labelHtml}
          <div class="dropdown-wrapper">
            <div class="dropdown-stub ${stubClasses}"
                 ${this._disabled ? 'disabled' : ''}>
              <slot name="start"></slot>
              <slot name="selected"></slot>
              <span class="dropdown-placeholder">${this._placeholder}</span>
              <button class="dropdown-clear-btn" type="button" aria-label="Clear selection">
                ${CLEAR_ICON_SVG}
              </button>
              <div class="dropdown-chevron">
                ${CHEVRON_DOWN_SVG}
              </div>
            </div>
            <dialog class="dropdown-dialog">
              <div class="dropdown-header">
                <input 
                  class="dropdown-search-input ${this._size}" 
                  type="text"
                  placeholder="${this._placeholder}"
                  ${this._disabled ? 'disabled' : ''}
                />
                <div class="dropdown-search-chevron">
                  ${CHEVRON_DOWN_SVG}
                </div>
              </div>
              <div class="dropdown-options-wrapper">
                <div class="dropdown-options">
                  <slot id="options-slot"></slot>
                </div>
                <div class="dropdown-loading" aria-hidden="true">
                  <slot name="loading">
                    <span class="dropdown-loading-spinner"></span>
                    <span class="dropdown-loading-text">Searching…</span>
                  </slot>
                </div>
              </div>
            </dialog>
          </div>
        </div>
      `

      // Setup event listeners ONCE (only when rendering for the first time)
      this.setupDesktopEventListeners()
    }

    // Dynamic label creation (like input.ts fix)
    const existingLabel = shadow.querySelector('.dropdown-label')
    const container = shadow.querySelector('.dropdown-container')
    const wrapper = shadow.querySelector('.dropdown-wrapper')

    if (this._label) {
      if (existingLabel) {
        // Label exists, update it
        existingLabel.innerHTML = this._label + (this._required ? '<span class="required-icon">' + REQUIRED_ICON_SVG + '</span>' : '')
          ; (existingLabel as HTMLElement).style.display = 'flex'
      } else if (container && wrapper) {
        // Label doesn't exist but we need one - CREATE IT!
        const labelEl = document.createElement('label')
        labelEl.className = 'dropdown-label'
        labelEl.innerHTML = this._label + (this._required ? '<span class="required-icon">' + REQUIRED_ICON_SVG + '</span>' : '')
        container.insertBefore(labelEl, wrapper)
      }
    } else if (existingLabel) {
      // No label text, hide existing label
      ; (existingLabel as HTMLElement).style.display = 'none'
    }

    // Always update selection display
    this.updateSelectionDisplay()
  }

  // ============================================================================
  // MOBILE IMPLEMENTATION (Full-screen Modal)
  // ============================================================================
  // Mobile uses full-screen modal with backdrop.
  // 
  // EVENT FLOW:
  // 1. User clicks stub → handleMobileStubClick() → openMobileModal()
  // 2. Modal shown with CSS animation (display: flex + open class)
  // 3. User types in search → handleSearchInput() [SHARED]
  // 4. User clicks option → handleMobileOptionClick() → selectOption() [SHARED] → closeMobileModal()
  // 5. User clicks backdrop → closeMobileModal()
  // 6. User clicks close button → closeMobileModal()
  // 7. User presses Escape → handleMobileKeyboard() → closeMobileModal()
  // 8. ty-option dispatches clear-selection → handleMobileClearClick() → closeMobileModal()
  // 
  // METHODS:
  // - openMobileModal(): Open mobile modal
  // - closeMobileModal(): Close mobile modal
  // - handleMobileStubClick(): Open on stub click
  // - handleMobileOptionClick(): Select option and close
  // - handleMobileClearClick(): Clear selection and close
  // - handleMobileKeyboard(): Escape key handler only (no arrow navigation)
  // - renderMobile(): Render mobile HTML
  // - setupMobileEventListeners(): Setup mobile event handlers
  // ============================================================================



  /**
   * Render mobile mode with full-screen modal
   */

  private renderMobile(): void {
    const shadow = this.shadowRoot!

    // Only set innerHTML and setup listeners if container doesn't exist
    if (!shadow.querySelector('.dropdown-container')) {
      const stubClasses = this.buildStubClasses()

      const labelHtml = this._label ? `
        <label class="dropdown-label">
          ${this._label}
          ${this._required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ''}
        </label>
      ` : ''

      // Close button SVG (X icon)
      const closeButtonSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>`

      // Search placeholder: "Search <label>..." or just "Search..."
      const searchPlaceholder = this._label ? `Search ${this._label}...` : 'Search...'

      // Search header — always present; externalSearch only changes who handles input
      const searchHeaderHtml = `
        <div class="mobile-search-header">
          ${this._label ? `<span class="mobile-header-label">${this._label}</span>` : ''}
          <div class="mobile-header-content">
            <input
              class="mobile-search-input ${this._size}"
              type="text"
              placeholder="${searchPlaceholder}"
              ${this._disabled ? 'disabled' : ''}
            />
            <button class="mobile-close-button" type="button" aria-label="Close">
              ${closeButtonSvg}
            </button>
          </div>
        </div>
      `

      shadow.innerHTML = `
        <div class="dropdown-container dropdown-mode-mobile">
          ${labelHtml}
          <div class="dropdown-wrapper">
            <div class="dropdown-stub ${stubClasses}"
                 ${this._disabled ? 'disabled' : ''}>
              <slot name="start"></slot>
              <slot name="selected"></slot>
              <span class="dropdown-placeholder">${this._placeholder}</span>
              <div class="dropdown-chevron">
                ${CHEVRON_DOWN_SVG}
              </div>
            </div>
            <dialog class="mobile-dialog">
              <div class="mobile-dialog-content">
                ${searchHeaderHtml}
                <div class="mobile-options-container dropdown-options-wrapper">
                  <slot id="options-slot"></slot>
                  <div class="dropdown-loading" aria-hidden="true">
                    <slot name="loading">
                      <span class="dropdown-loading-spinner"></span>
                      <span class="dropdown-loading-text">Searching…</span>
                    </slot>
                  </div>
                </div>
              </div>
            </dialog>
          </div>
        </div>
      `

      // Setup event listeners ONCE (only when rendering for the first time)
      this.setupMobileEventListeners()
    }

    // Always update selection display
    this.updateSelectionDisplay()
  }

  /**
   * Setup event listeners for mobile mode
   */
  private setupMobileEventListeners(): void {
    const shadow = this.shadowRoot!
    const stub = shadow.querySelector('.dropdown-stub')
    const optionsSlot = shadow.querySelector('#options-slot')
    const searchInput = shadow.querySelector('.mobile-search-input')
    const closeButton = shadow.querySelector('.mobile-close-button')
    const dialog = shadow.querySelector('.mobile-dialog') as HTMLDialogElement

    if (stub) {
      stub.addEventListener('click', (e) => this.handleMobileStubClick(e))
    }

    // Add option click handler to slot
    if (optionsSlot) {
      optionsSlot.addEventListener('click', (e) => this.handleMobileOptionClick(e))
    }

    // Add search input handlers
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearchInput(e))
    }

    // Close button click
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeMobileModal())
    }

    // Listen for clear-selection events from ty-option
    if (optionsSlot) {
      optionsSlot.addEventListener('clear-selection', (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        this.handleMobileClearClick(e)
      })
    }

    // Native dialog: backdrop click and Escape key
    if (dialog) {
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          this.closeMobileModal()
        }
      })

      dialog.addEventListener('cancel', (e) => {
        e.preventDefault()
        this.closeMobileModal()
      })
    }
  }

  /**
   * Handle mobile stub click - open modal
   */
  private handleMobileStubClick(e: Event): void {
    this.handleStubClickBase(e, () => this.openMobileModal())
  }

  /**
   * Handle mobile option click - select and close
   */
  private handleMobileOptionClick(e: Event): void {
    this.handleOptionClickBase(e, () => this.closeMobileModal())
  }


  /**
   * Handle clear click in mobile modal
   */
  private handleMobileClearClick(e: Event): void {
    this.handleClearClickBase(e, () => this.closeMobileModal())
    // Mobile closes modal after clearing
  }



  /**
     * Open mobile modal
     */
  private openMobileModal(): void {
    const shadow = this.shadowRoot!
    const dialog = shadow.querySelector('.mobile-dialog') as HTMLDialogElement
    if (!dialog) return

    // Lock scroll
    this.lockDropdownScroll()

    // Show dialog with animation
    dialog.showModal()
    requestAnimationFrame(() => {
      dialog.classList.add('open')
    })

    // Update component state
    this._state.open = true

    // Initialize options state (no highlight on mobile)
    this.initializeOptionsState(false)

    // Focus search input
    const searchInput = shadow.querySelector('.mobile-search-input') as HTMLInputElement
    if (searchInput) {
      // Small delay to ensure dialog is visible and keyboard doesn't glitch
      setTimeout(() => searchInput.focus(), 300)
    }
    // Hide clear button when modal is open (stub clear button - desktop only)
    this.updateClearButton()

    // Lifecycle event (also fires empty search if external-search)
    this.fireOpenEvent()
  }

  /**
   * Close mobile modal
   */
  private closeMobileModal(): void {
    const shadow = this.shadowRoot!
    const dialog = shadow.querySelector('.mobile-dialog') as HTMLDialogElement
    if (!dialog) return

    // Unlock scroll
    this.unlockDropdownScroll()

    // Close immediately — ::backdrop doesn't support transitions
    dialog.classList.remove('open')
    dialog.close()

    // Update state
    this._state.open = false
    this._state.highlightedIndex = -1

    // Reset search and restore all options (internal mode only — parent owns options in external mode)
    this._state.search = ''
    this._state.filteredOptions = []
    const searchInput = shadow.querySelector('.mobile-search-input') as HTMLInputElement
    if (searchInput) {
      searchInput.value = ''
    }
    if (!this._externalSearch) {
      const allOptions = this.getOptions().map(el => this.getOptionData(el))
      allOptions.forEach(({ element }) => element.removeAttribute('hidden'))
    }

    // Show clear button when modal is closed (if applicable)
    this.updateClearButton()

    // Lifecycle event
    this.fireCloseEvent()
  }

  // ============================================================================
  // PUBLIC API - Getters/Setters
  // ============================================================================

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

  get readonly(): boolean { return this.getProperty('readonly') }
  set readonly(v: boolean) { this.setProperty('readonly', v) }

  get required(): boolean { return this.getProperty('required') }
  set required(v: boolean) { this.setProperty('required', v) }

  get externalSearch(): boolean { return this.getProperty('externalSearch') }
  set externalSearch(v: boolean) { this.setProperty('externalSearch', v) }

  get clearable(): boolean { return this.getProperty('clearable') }
  set clearable(v: boolean) { this.setProperty('clearable', v) }

  get loading(): boolean { return this.getProperty('loading') }
  set loading(v: boolean) { this.setProperty('loading', v) }

  get size(): Size { return this.getProperty('size') as Size }
  set size(v: Size) { this.setProperty('size', v) }

  get flavor(): Flavor { return this.getProperty('flavor') as Flavor }
  set flavor(v: Flavor) { this.setProperty('flavor', v) }

  get debounce(): number { return this.getProperty('debounce') }
  set debounce(v: number) { this.setProperty('debounce', v) }

  get form(): HTMLFormElement | null {
    return this._internals.form
  }
}

// Register the custom element
if (!customElements.get('ty-dropdown')) {
  customElements.define('ty-dropdown', TyDropdown)
}
