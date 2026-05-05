/**
 * TyMultiselect Web Component
 * PORTED FROM: clj/ty/components/multiselect.cljs
 * 
 * A multiselect dropdown component using ty-tag for selections with:
 * - Tag-only options (only ty-tag elements supported)
 * - Multiple selection with visual tags
 * - Desktop mode with smart positioning
 * - Mobile mode with full-screen modal
 * - Search and filtering capabilities
 * - Keyboard navigation
 * - Form association for native form submission with multiple values
 * - Scroll locking when dropdown is open
 * - Outside click to close
 * 
 * @example
 * ```html
 * <!-- Basic multiselect -->
 * <ty-multiselect label="Skills" placeholder="Select skills" required>
 *   <ty-tag value="js">JavaScript</ty-tag>
 *   <ty-tag value="ts">TypeScript</ty-tag>
 *   <ty-tag value="py">Python</ty-tag>
 * </ty-multiselect>
 * 
 * <!-- With pre-selected values -->
 * <ty-multiselect value="js,ts">
 *   <ty-tag value="js">JavaScript</ty-tag>
 *   <ty-tag value="ts">TypeScript</ty-tag>
 *   <ty-tag value="py">Python</ty-tag>
 * </ty-multiselect>
 * 
 * <!-- With rich tag content -->
 * <ty-multiselect label="Team Members">
 *   <ty-tag value="1" flavor="primary">
 *     <div class="flex items-center gap-2">
 *       <img src="avatar1.jpg" class="w-6 h-6 rounded-full" />
 *       <span>John Doe</span>
 *     </div>
 *   </ty-tag>
 * </ty-multiselect>
 * ```
 */

import type { Flavor, Size } from '../types/common.js'
import { ensureStyles } from '../utils/styles.js'
import { multiselectStyles } from '../styles/multiselect.js'
import { lockScroll, unlockScroll } from '../utils/scroll-lock.js'
import { isMobileTouch } from '../utils/mobile.js'
import { TyComponent } from '../base/ty-component.js'
import type { PropertyChange } from '../utils/property-manager.js'
import { CustomScrollbar, isCustomScrollbarEnabled } from '../utils/custom-scrollbar.js'

// ============================================================================
// Element Hash Utility (for consistent scroll lock IDs)
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
 * Get a consistent unique ID for an element
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
 * Tag data structure
 */
interface TagData {
  value: string
  text: string
  element: HTMLElement
}

/**
 * Component state structure
 */
interface MultiselectState {
  open: boolean
  search: string
  highlightedIndex: number
  filteredTags: TagData[]
  selectedValues: string[]
  mode: 'desktop' | 'mobile'
  expandedSection: 'selected' | 'available'  // Which section is expanded (mobile only)
}

/**
 * Change event action types
 */
type ChangeAction = 'add' | 'remove' | 'clear' | 'set'

/**
 * Change event detail
 */
interface ChangeEventDetail {
  values: string[]
  action: ChangeAction
  item: string | null
}

/**
 * Ty Multiselect Component
 */
export class TyMultiselect extends TyComponent<MultiselectState> {
  // ============================================================================
  // PROPERTY CONFIGURATION - Declarative property lifecycle
  // ============================================================================
  protected static properties = {
    value: {
      type: 'string' as const,
      visual: true,
      formValue: true,
      emitChange: false,
      default: '',
      coerce: (v: any) => {
        // Handle array input (from React, Reagent, etc.)
        if (Array.isArray(v)) {
          return v.join(',')
        }
        // Handle null/undefined
        if (v === null || v === undefined) {
          return ''
        }
        // String already
        return String(v)
      }
    },
    name: {
      type: 'string' as const,
      default: ''
    },
    placeholder: {
      type: 'string' as const,
      visual: true,
      default: 'Select options...'
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
    size: {
      type: 'string' as const,
      visual: true,
      default: 'md',
      validate: (v: any) => ['sm', 'md', 'lg'].includes(v),
      coerce: (v: any) => {
        if (!['sm', 'md', 'lg'].includes(v)) {
          console.warn(`[ty-multiselect] Invalid size. Using md.`)
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
          console.warn(`[ty-multiselect] Invalid flavor. Using neutral.`)
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
    'selected-label': {
      type: 'string' as const,
      visual: true,
      default: 'Selected'
    },
    'available-label': {
      type: 'string' as const,
      visual: true,
      default: 'Available'
    },
    'no-selection-message': {
      type: 'string' as const,
      visual: true,
      default: 'No items selected'
    },
    'no-options-message': {
      type: 'string' as const,
      visual: true,
      default: 'No options available'
    }
  }

  // ============================================================================
  // INTERNAL STATE
  // ============================================================================
  private _value: string = ''
  private _name: string = ''
  private _placeholder: string = 'Select options...'
  private _label: string = ''
  private _disabled = false
  private _readonly = false
  private _required = false
  private _externalSearch = false
  private _scrollLockId: string | null = null
  private _size: Size = 'md'
  private _flavor: Flavor = 'neutral'
  private _selectedLabel: string = 'Selected'
  private _availableLabel: string = 'Available'
  private _noSelectionMessage: string = 'No items selected'
  private _noOptionsMessage: string = 'No options available'

  // Component state
  private _state: MultiselectState = {
    open: false,
    search: '',
    highlightedIndex: -1,
    filteredTags: [],
    selectedValues: [],
    mode: 'desktop', // Updated dynamically on render via syncMode()
    expandedSection: 'selected'  // Will be corrected by toggleSection call
  }

  // Debug: Log when expandedSection changes
  set expandedSection(value: 'selected' | 'available') {
    this._state.expandedSection = value
  }

  get expandedSection(): 'selected' | 'available' {
    return this._state.expandedSection
  }

  // Event handler references for cleanup
  private _stubClickHandler: ((e: Event) => void) | null = null
  private _outsideClickHandler: ((e: Event) => void) | null = null
  private _tagClickHandler: ((e: Event) => void) | null = null
  private _tagDismissHandler: ((e: Event) => void) | null = null
  private _searchInputHandler: ((e: Event) => void) | null = null
  private _blockSearchClick: ((e: Event) => void) | null = null
  private _keyboardHandler: ((e: KeyboardEvent) => void) | null = null

  // Debounce properties for search event
  private _debounce: number = 0
  private _searchDebounceTimer: number | null = null

  // Custom scrollbar for options list
  private _optionsScrollbar: CustomScrollbar | null = null

  constructor() {
    super() // TyComponent handles attachInternals() and attachShadow()

    const shadow = this.shadowRoot!
    ensureStyles(shadow, { css: multiselectStyles, id: 'ty-multiselect' })

    // DON'T render here - wait for onConnect() to initialize values first
    // This matches dropdown.ts pattern and prevents showing empty state
  }

  /**
   * Called when component is connected to DOM
   * TyComponent handles property capture automatically
   */
  protected onConnect(): void {

    // SAFETY: Close any open dialogs to prevent scroll locking
    const shadow = this.shadowRoot!
    const dialogs = shadow.querySelectorAll('dialog')
    dialogs.forEach(dialog => {
      if (dialog.open) {
        console.warn('⚠️ Found open dialog on connect, closing it')
        dialog.close()
      }
    })

    // Render FIRST to create DOM structure
    this.render()

    // THEN initialize and sync tags (after DOM exists)
    requestAnimationFrame(() => {
      this.initializeState()
      // Visual updates happen automatically via onPropertiesChanged
    })
  }

  /**
   * Called when component is disconnected from DOM
   * Clean up event listeners and timers
   */
  protected onDisconnect(): void {
    // CRITICAL: Close all dialogs to prevent scroll locking
    const shadow = this.shadowRoot!
    const dialogs = shadow.querySelectorAll('dialog')
    dialogs.forEach(dialog => {
      if (dialog.open) {
        dialog.close()
      }
    })

    // Clean up document-level listeners
    if (this._keyboardHandler) {
      document.removeEventListener('keydown', this._keyboardHandler)
      this._keyboardHandler = null
    }

    // Clear any pending debounce timer
    if (this._searchDebounceTimer !== null) {
      clearTimeout(this._searchDebounceTimer)
      this._searchDebounceTimer = null
    }

    // Cleanup custom scrollbar
    this._destroyOptionsScrollbar()
  }

  /**
   * Called when properties change
   * Handle state synchronization BEFORE render
   */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    for (const { name, newValue } of changes) {
      switch (name) {
        case 'value':
          this._value = newValue || ''
          const selectedValues = this.parseValue(newValue)
          this._state.selectedValues = selectedValues

          // CRITICAL: Only sync tags if we're connected and tags exist
          // During initial property setup (before onConnect), tags don't exist yet
          if (this.isConnected && this.shadowRoot) {
            this.syncSelectedTags(selectedValues)
            this.updateSelectionDisplay()
            this.updateMobileSelectedState()
          } else {
            console.warn('💜 [multiselect] onPropertiesChanged - NOT connected yet, skipping sync (will happen in initializeState)')
          }
          break
        case 'name':
          this._name = newValue || ''
          break
        case 'placeholder':
          this._placeholder = newValue || 'Select options...'
          // No need to update display - placeholder text change doesn't affect visibility
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
        case 'size':
          this._size = newValue
          break
        case 'flavor':
          this._flavor = newValue
          break
        case 'debounce':
          this._debounce = newValue
          break
        case 'selected-label':
          this._selectedLabel = newValue || 'Selected'
          break
        case 'available-label':
          this._availableLabel = newValue || 'Available'
          break
        case 'no-selection-message':
          this._noSelectionMessage = newValue || 'No items selected'
          break
        case 'no-options-message':
          this._noOptionsMessage = newValue || 'No options available'
          break
      }
    }
  }

  /**
   * Get the form value for this component
   * Returns FormData with multiple entries (HTMX standard)
   */
  protected getFormValue(): FormDataEntryValue | FormData | null {
    const selectedValues = this._state.selectedValues

    if (this._name && selectedValues.length > 0) {
      const formData = new FormData()
      selectedValues.forEach(value => {
        formData.append(this._name, value)
      })
      return formData
    }

    return null
  }

  /**
   * Parse multiselect value (comma-separated string to array)
   */
  private parseValue(value: string | null): string[] {
    // Defensive check: ensure value is actually a string before calling .trim()
    if (!value || typeof value !== 'string' || value.trim() === '') return []
    return value.split(',').map(v => v.trim()).filter(v => v !== '')
  }

  /**
   * Initialize component state from attributes
   * Reads from both property and attribute (like ClojureScript version)
   */
  private initializeState(): void {

    const initialValue = this.getProperty('value') || ''

    if (initialValue) {
      // Explicit value provided - sync tags directly
      // DON'T use updateComponentValue() because the property is already set!
      const selectedValues = this.parseValue(initialValue)

      // Update internal state
      this._state.selectedValues = selectedValues

      // Sync the tags to match the property value
      this.syncSelectedTags(selectedValues)

      // Update the visual display
      this.updateSelectionDisplay()
      this.updateMobileSelectedState()
    } else {
      // No explicit value - check for pre-selected tags
      const allTags = this.getTagElements()

      const preSelectedTags = allTags
        .filter(tag => tag.hasAttribute('selected'))
        .map(tag => this.getTagData(tag).value)


      if (preSelectedTags.length > 0) {
        // Set the property value and sync (updateComponentValue handles everything)
        this.updateComponentValue(preSelectedTags, false)
      }
    }
  }

  // ============================================================================
  // TAG MANAGEMENT METHODS (Phase 2)
  // ============================================================================

  /**
   * Get all ty-tag elements from the component (ALL slots)
   */
  private getTagElements(): HTMLElement[] {
    // Get ALL ty-tag children, regardless of slot assignment
    const tags = Array.from(this.querySelectorAll('ty-tag')) as HTMLElement[]
    return tags
  }

  /**
   * Extract value and text from a ty-tag element
   */
  private getTagData(element: HTMLElement): TagData {
    // Get value from either property or attribute
    const value = (element as any).value || element.getAttribute('value') || element.textContent || ''
    const text = element.textContent || ''

    return { value, text, element }
  }

  /**
   * Select a tag - set selected state, move to selected slot, make dismissible
   */
  private selectTag(tag: HTMLElement): void {
    const tagValue = this.getTagData(tag).value

    // Set selected attribute
    tag.setAttribute('selected', '')

    // Move to selected slot
    tag.setAttribute('slot', 'selected')

    // Make dismissible
    tag.setAttribute('dismissible', 'true')

    // Force re-slotting by removing and re-adding
    const parent = tag.parentNode
    if (parent) {
      parent.removeChild(tag)
      parent.appendChild(tag)
    } else {
      console.warn(`⚠️ [multiselect] - No parent for "${tagValue}"!`)
    }
  }

  /**
   * Deselect a tag - remove selected state, remove from selected slot, remove dismissible
   */
  private deselectTag(tag: HTMLElement): void {
    // Remove selected attribute
    tag.removeAttribute('selected')

    // Remove from selected slot
    tag.removeAttribute('slot')

    // Remove dismissible
    tag.removeAttribute('dismissible')

    // Force re-slotting by removing and re-adding
    const parent = tag.parentNode
    if (parent) {
      parent.removeChild(tag)
      parent.appendChild(tag)
    }
  }

  /**
   * Get array of currently selected values from tags (ALWAYS reads from DOM)
   */
  private getSelectedValues(): string[] {
    return this.getTagElements()
      .filter(tag => tag.hasAttribute('selected'))
      .map(tag => this.getTagData(tag).value)
      .filter(value => value !== '')
  }

  /**
   * Check if all available tags are selected
   */
  private allTagsSelected(): boolean {
    const tags = this.getTagElements()
    if (tags.length === 0) return false

    const selectedCount = tags.filter(tag => tag.hasAttribute('selected')).length
    return selectedCount === tags.length
  }

  /**
   * Sync tag selection states with desired values
   */
  private syncSelectedTags(selectedValues: string[]): void {

    const selectedSet = new Set(selectedValues)
    const tags = this.getTagElements()

    tags.forEach(tag => {
      const tagValue = this.getTagData(tag).value
      const shouldBeSelected = selectedSet.has(tagValue)
      const isSelected = tag.hasAttribute('selected')


      if (shouldBeSelected && !isSelected) {
        this.selectTag(tag)
      } else if (!shouldBeSelected && isSelected) {
        this.deselectTag(tag)
      }
    })

  }

  /**
   * Central update function - synchronizes everything
   * Uses TyComponent's property system for proper lifecycle
   */
  private updateComponentValue(newValues: string[], dispatchChange: boolean = false, action: ChangeAction = 'set', item: string | null = null): void {

    const oldValues = this.getSelectedValues()

    const valueStr = newValues.join(',')


    // Only update if changed
    if (JSON.stringify(newValues.sort()) !== JSON.stringify(oldValues.sort())) {
      const currentPropertyValue = this.getProperty('value')

      // Use TyComponent's property system - this will trigger:
      // 1. onPropertiesChanged() → syncs tags via syncSelectedTags()
      // 2. onPropertiesChanged() → updates placeholder via updateSelectionDisplay()
      // 3. updateFormValue() → automatic (formValue: true in config)
      // 4. render() → automatic if visual properties changed
      this.setProperty('value', valueStr)

      // Dispatch custom multiselect change event (with action/item details)
      if (dispatchChange) {
        this.dispatchChangeEvent({
          values: newValues,
          action,
          item
        })
      }
    } else {
    }
  }

  // ============================================================================
  // DROPDOWN METHODS (Phase 3 & 4)
  // ============================================================================

  /**
   * Calculate and set dropdown position with smart direction detection
   */
  private calculatePosition(): void {
    const shadow = this.shadowRoot!
    const stub = shadow.querySelector('.multiselect-stub') as HTMLElement
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
   * Open dropdown dialog (desktop mode)
   *
   * `<dialog>.showModal()` puts the dialog in the top layer with a backdrop, but
   * does NOT prevent the page behind it from scrolling. We use the shared scroll
   * lock utility (overflow:hidden on <html>) to keep wheel/touch scrolling from
   * leaking through to the body — same behavior <ty-dropdown> and <ty-modal>
   * implement.
   */
  private openDropdown(): void {
    const shadow = this.shadowRoot!
    const dialog = shadow.querySelector('.dropdown-dialog') as HTMLDialogElement
    if (!dialog) return

    // Lock body scroll while dropdown is open
    const lockId = `multiselect-${this.id || 'anon'}-${getElementHash(this)}`
    this._scrollLockId = lockId
    lockScroll(lockId)

    // Show modal
    dialog.showModal()
    dialog.classList.add('open')


    // Position dropdown AFTER showing modal
    this.calculatePosition()

    // Update component state
    this._state.open = true

    // Update visual states
    const chevron = shadow.querySelector('.dropdown-chevron')
    if (chevron) chevron.classList.add('open')

    const searchChevron = shadow.querySelector('.dropdown-search-chevron')
    if (searchChevron) searchChevron.classList.add('open')

    // Initialize options state
    const tags = this.getTagElements().map(el => this.getTagData(el))
    this._state.filteredTags = tags
    this._state.highlightedIndex = -1

    // Ensure options area is visible (may have been hidden from previous search)
    this.updateOptionsVisibility(true)

    // Setup custom scrollbar on options
    this._setupOptionsScrollbar()

    // Focus search input
    const searchInput = shadow.querySelector('.dropdown-search-input') as HTMLInputElement
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100)
    }
  }

  /**
   * Close dropdown dialog (desktop mode)
   */
  private closeDropdown(): void {
    const shadow = this.shadowRoot!
    const dialog = shadow.querySelector('.dropdown-dialog') as HTMLDialogElement

    if (!dialog) return

    // Destroy custom scrollbar
    this._destroyOptionsScrollbar()

    // Close dialog
    dialog.classList.remove('open')
    dialog.classList.remove('position-above')
    dialog.classList.remove('position-below')
    dialog.close()

    // Unlock body scroll (paired with the lock in openDropdown)
    if (this._scrollLockId) {
      unlockScroll(this._scrollLockId)
      this._scrollLockId = null
    }

    // Update state
    this._state.open = false
    this._state.highlightedIndex = -1

    // Update visual states
    const chevron = shadow.querySelector('.dropdown-chevron')
    if (chevron) chevron.classList.remove('open')

    const searchChevron = shadow.querySelector('.dropdown-search-chevron')
    if (searchChevron) searchChevron.classList.remove('open')

    // Reset search and restore all tags
    const hadQuery = this._state.search !== ''
    this._state.search = ''
    const searchInput = shadow.querySelector('.dropdown-search-input') as HTMLInputElement
    if (searchInput) {
      searchInput.value = ''
    }

    if (this._externalSearch) {
      // External mode — notify consumer so it can reset its own filtered state.
      // Bypass the debounce timer (which would delay the clear by `debounce` ms);
      // close-time should be immediate so the consumer's filtered state syncs
      // before the dropdown reopens. Only fire if there was actually a query.
      if (hadQuery) {
        if (this._searchDebounceTimer !== null) {
          clearTimeout(this._searchDebounceTimer)
          this._searchDebounceTimer = null
        }
        this.fireSearchEvent('')
      }
    } else {
      // Internal mode — restore visibility of all tags ourselves
      const allTags = this.getTagElements().map(el => this.getTagData(el))
      this._state.filteredTags = allTags
      this.updateTagVisibility(allTags, allTags)
      this.clearHighlights(allTags)
    }
  }

  /**
   * Open mobile modal (mobile mode)
   * Now using <dialog> element for native z-index management
   */
  private openMobileModal(): void {
    const shadow = this.shadowRoot!
    const dialog = shadow.querySelector('.mobile-dialog') as HTMLDialogElement
    if (!dialog) return

    // Lock body scroll while mobile modal is open
    const lockId = `multiselect-${this.id || 'anon'}-${getElementHash(this)}`
    this._scrollLockId = lockId
    lockScroll(lockId)

    // Show dialog using native API (handles z-index automatically)
    dialog.showModal()
    dialog.classList.add('open')

    const stub_slot = shadow.querySelector('#stub-slot') as HTMLSlotElement
    const mobile_slot = shadow.querySelector('#mobile-slot') as HTMLSlotElement
    stub_slot.name = "selected-blocked";
    mobile_slot.name = "selected";

    // Update component state
    this._state.open = true

    // Initialize options state
    const tags = this.getTagElements().map(el => this.getTagData(el))
    this._state.filteredTags = tags

    // Focus search input
    const searchInput = shadow.querySelector('.mobile-search-input') as HTMLInputElement
    if (searchInput) {
      // Small delay to ensure dialog is ready
      setTimeout(() => searchInput.focus(), 100)
    }

    // Initialize sections (available expanded by default)
    this._state.expandedSection = 'available'
    this.syncSectionStates()

    // Update state after slots are ready
    requestAnimationFrame(() => {
      this.updateMobileSelectedState()
    })
  }

  /**
   * Close mobile modal (mobile mode)
   * Now using <dialog> element for native management
   */
  private closeMobileModal(): void {
    const shadow = this.shadowRoot!
    const dialog = shadow.querySelector('.mobile-dialog') as HTMLDialogElement
    if (!dialog) return

    // Close immediately — ::backdrop doesn't support transitions
    dialog.classList.remove('open')
    dialog.close()

    // Unlock body scroll (paired with the lock in openMobileModal)
    if (this._scrollLockId) {
      unlockScroll(this._scrollLockId)
      this._scrollLockId = null
    }

    const stub_slot = shadow.querySelector('#stub-slot') as HTMLSlotElement
    const mobile_slot = shadow.querySelector('#mobile-slot') as HTMLSlotElement
    stub_slot.name = "selected";
    mobile_slot.name = "selected-blocked";

    // Update state
    this._state.open = false
    this._state.highlightedIndex = -1

    // Reset search
    const hadQuery = this._state.search !== ''
    this._state.search = ''
    const searchInput = shadow.querySelector('.mobile-search-input') as HTMLInputElement
    if (searchInput) {
      searchInput.value = ''
    }

    if (this._externalSearch) {
      // External mode — notify consumer that the search was cleared on close
      // (bypass debounce, see desktop close path for rationale).
      if (hadQuery) {
        if (this._searchDebounceTimer !== null) {
          clearTimeout(this._searchDebounceTimer)
          this._searchDebounceTimer = null
        }
        this.fireSearchEvent('')
      }
    } else {
      // Internal mode — unhide all tags ourselves
      const allTags = this.getTagElements()
      allTags.forEach(el => el.removeAttribute('hidden'))
    }
  }

  // ============================================================================
  // EVENT HANDLERS (Phase 5 & 6)
  // ============================================================================

  private handleStubClick(e: Event): void {
    e.preventDefault()
    e.stopPropagation()

    if (this._disabled || this._readonly) {
      return
    }

    // Don't open if all tags are already selected
    if (this.allTagsSelected()) {
      return
    }

    this.openDropdown()
  }

  private handleOutsideClick(e: Event): void {
    if (!this._state.open) return

    const target = e.target as Node

    // Check if click is inside this component (handles shadow DOM retargeting)
    // Also check composedPath for clicks that originated inside shadow DOM
    const path = e.composedPath()
    const clickedInside = path.includes(this)

    if (!clickedInside) {
      this.closeDropdown()
    }
  }

  private handleTagClick(e: Event): void {
    const target = e.target as HTMLElement

    // Find the ty-tag element
    const tag = target.tagName === 'TY-TAG'
      ? target
      : target.closest('ty-tag') as HTMLElement | null

    if (!tag || tag.hasAttribute('disabled')) return
    if (tag.hasAttribute('selected')) return // Already selected

    e.preventDefault()
    e.stopPropagation()

    const tagValue = this.getTagData(tag).value
    const currentValues = this.getSelectedValues()
    const newValues = [...currentValues, tagValue]

    // Use central update function with change event
    this.updateComponentValue(newValues, true, 'add', tagValue)

    // Auto-close if all tags selected
    if (this.allTagsSelected()) {
      if (this._state.mode === 'desktop') {
        this.closeDropdown()
      } else {
        this.closeMobileModal()
      }
    }
  }

  private handleTagDismiss(e: Event): void {
    e.preventDefault()
    e.stopPropagation()

    const customEvent = e as CustomEvent
    const tag = customEvent.detail?.target as HTMLElement
    if (!tag) return

    const tagValue = this.getTagData(tag).value
    const currentValues = this.getSelectedValues()
    const newValues = currentValues.filter(v => v !== tagValue)

    // Use central update function with change event
    this.updateComponentValue(newValues, true, 'remove', tagValue)
  }

  private blockSearchClick(e: Event): void {
    e.stopPropagation()
    e.preventDefault()
  }

  private handleSearchInput(e: Event): void {
    const target = e.target as HTMLInputElement
    const query = target.value

    // Update search state
    this._state.search = query

    if (this._externalSearch) {
      // External (remote) search: parent owns filtering — delegate via event.
      // Tag visibility is left untouched; consumer is expected to update children.
      this.dispatchSearchEvent(query)
      return
    }

    // Internal search: filter tags locally
    const allTags = this.getTagElements().map(el => this.getTagData(el))
    // Only filter from non-selected tags
    const availableTags = allTags.filter(t => !t.element.hasAttribute('selected'))
    const filtered = this.filterTags(availableTags, query)

    // Update state
    this._state.filteredTags = filtered
    this._state.highlightedIndex = -1

    // Update visibility
    this.updateTagVisibility(filtered, allTags)

    // Hide options area if no results
    this.updateOptionsVisibility(filtered.length > 0)

    // Clear highlights
    this.clearHighlights(allTags)
  }


  private handleKeyboard(e: KeyboardEvent): void {
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
    const filteredTags = this._state.filteredTags
    const tagsCount = filteredTags.length
    const currentHighlightedIndex = this._state.highlightedIndex

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        this.closeDropdown()
        break

      case 'Enter':
        e.preventDefault()
        e.stopPropagation()
        // Select highlighted tag if any
        if (currentHighlightedIndex >= 0 && currentHighlightedIndex < tagsCount) {
          const tag = filteredTags[currentHighlightedIndex]
          this.handleTagClick({ target: tag.element } as any)
        }
        break

      case 'ArrowUp':
        e.preventDefault()
        e.stopPropagation()
        let newIndexUp: number

        if (tagsCount === 0) {
          newIndexUp = -1
        } else if (currentHighlightedIndex === -1) {
          // Nothing highlighted, go to last tag
          newIndexUp = tagsCount - 1
        } else if (currentHighlightedIndex === 0) {
          // At first tag, wrap to last
          newIndexUp = tagsCount - 1
        } else {
          // Move up one
          newIndexUp = currentHighlightedIndex - 1
        }

        this._state.highlightedIndex = newIndexUp
        this.highlightTag(filteredTags, newIndexUp)
        break

      case 'ArrowDown':
        e.preventDefault()
        e.stopPropagation()
        let newIndexDown: number

        if (tagsCount === 0) {
          newIndexDown = -1
        } else if (currentHighlightedIndex === -1) {
          // Nothing highlighted, go to first tag
          newIndexDown = 0
        } else if (currentHighlightedIndex === tagsCount - 1) {
          // At last tag, wrap to first
          newIndexDown = 0
        } else {
          // Move down one
          newIndexDown = currentHighlightedIndex + 1
        }

        this._state.highlightedIndex = newIndexDown
        this.highlightTag(filteredTags, newIndexDown)
        break
    }
  }

  // ============================================================================
  // SEARCH & FILTERING HELPERS (Phase 6)
  // ============================================================================

  /**
   * Filter tags based on search query
   */
  private filterTags(tags: TagData[], query: string): TagData[] {
    if (!query || query.trim() === '') {
      return tags
    }

    const searchLower = query.toLowerCase()
    return tags.filter(({ text }) =>
      text.toLowerCase().includes(searchLower)
    )
  }

  /**
   * Update visibility of tags based on filtered list
   */
  private updateTagVisibility(filteredTags: TagData[], allTags: TagData[]): void {
    const visibleValues = new Set(filteredTags.map(tag => tag.value))

    allTags.forEach(({ value, element }) => {
      if (visibleValues.has(value)) {
        element.removeAttribute('hidden')
      } else {
        element.setAttribute('hidden', '')
      }
    })
  }

  /**
   * Show/hide the dropdown options area
   */
  private updateOptionsVisibility(hasOptions: boolean): void {
    const shadow = this.shadowRoot!
    const options = shadow.querySelector('.dropdown-options') as HTMLElement
    if (options) {
      options.style.display = hasOptions ? '' : 'none'
    }
  }

  /**
   * Clear all tag highlights
   */
  private clearHighlights(tags: TagData[]): void {
    tags.forEach(({ element }) => {
      element.removeAttribute('highlighted')
    })
  }

  /**
   * Highlight tag at specific index
   */
  private highlightTag(tags: TagData[], index: number): void {
    this.clearHighlights(tags)

    if (index >= 0 && index < tags.length) {
      const { element } = tags[index]
      element.setAttribute('highlighted', '')

      // Scroll into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }

  /**
   * Dispatch search event for external search handling
   * With optional debounce support
   */
  private dispatchSearchEvent(query: string): void {
    // Clear existing timer
    if (this._searchDebounceTimer !== null) {
      clearTimeout(this._searchDebounceTimer)
      this._searchDebounceTimer = null
    }

    // If debounce is set, debounce the event
    if (this._debounce > 0) {
      this._searchDebounceTimer = window.setTimeout(() => {
        this.fireSearchEvent(query)
        this._searchDebounceTimer = null
      }, this._debounce)
    } else {
      // Fire immediately if no debounce
      this.fireSearchEvent(query)
    }
  }

  /**
   * Fire the actual search event
   */
  private fireSearchEvent(query: string): void {
    this.dispatchEvent(new CustomEvent('search', {
      detail: {
        query,
        element: this
      },
      bubbles: true,
      composed: true
    }))
  }

  // ============================================================================
  // CHANGE EVENT DISPATCHING (Phase 5)
  // ============================================================================

  /**
   * Dispatch custom change event
   */
  private dispatchChangeEvent(detail: ChangeEventDetail): void {
    this.dispatchEvent(new CustomEvent('change', {
      detail,
      bubbles: true,
      cancelable: true
    }))
  }

  // ============================================================================
  // RENDERING
  // ============================================================================

  /**
   * Main render method (required by TyComponent)
   * Delegates to mode-specific renderer
   */
  protected render(): void {
    // Sync mode on every render so rotation/resize is picked up
    this._state.mode = isMobileTouch() ? 'mobile' : 'desktop'

    if (this._state.mode === 'mobile') {
      this.renderMobile()
    } else {
      this.renderDesktop()
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    const shadow = this.shadowRoot!
    const stub = shadow.querySelector('.multiselect-stub')
    const optionsSlot = shadow.querySelector('#options-slot')
    const searchInput = shadow.querySelector('.dropdown-search-input')

    if (stub) {
      this._stubClickHandler = this.handleStubClick.bind(this)
      stub.addEventListener('click', this._stubClickHandler)
    }

    // Add tag click handler to slot
    if (optionsSlot) {
      this._tagClickHandler = this.handleTagClick.bind(this)
      optionsSlot.addEventListener('click', this._tagClickHandler)
    }

    // Add search input handlers
    if (searchInput) {
      this._searchInputHandler = this.handleSearchInput.bind(this)
      this._blockSearchClick = this.blockSearchClick.bind(this)

      searchInput.addEventListener('input', this._searchInputHandler)
      searchInput.addEventListener('click', this._blockSearchClick)
      // searchInput.addEventListener('blur', this._searchBlurHandler)
    }

    // Setup dialog backdrop click handler
    const dialog = shadow.querySelector('.dropdown-dialog') as HTMLDialogElement
    if (dialog) {
      dialog.addEventListener('click', (e) => {
        // Only close if clicking directly on the dialog (backdrop), not its children
        if (e.target === dialog) {
          this.closeDropdown()
        }
      })
    }

    // Setup keyboard handler
    this._keyboardHandler = this.handleKeyboard.bind(this)
    document.addEventListener('keydown', this._keyboardHandler)

    // Listen for dismiss events from selected tags
    this._tagDismissHandler = this.handleTagDismiss.bind(this)
    this.addEventListener('dismiss', this._tagDismissHandler)
  }

  /**
   * Build CSS class list for stub
   */
  private buildStubClasses(): string {
    const classes: string[] = [this._size]
    if (this._disabled) classes.push('disabled')
    return classes.join(' ')
  }

  /**
   * Render desktop mode with dialog
   */
  private renderDesktop(): void {
    const shadow = this.shadowRoot!

    // Only set innerHTML and setup listeners if container doesn't exist
    if (!shadow.querySelector('.multiselect-container')) {
      const stubClasses = this.buildStubClasses()

      const labelHtml = this._label ? `
        <label class="dropdown-label">
          ${this._label}
          ${this._required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ''}
        </label>
      ` : ''

      const searchPlaceholder = 'Search...'

      shadow.innerHTML = `
        <div class="multiselect-container dropdown-mode-mobile">
          ${labelHtml}
          <div class="dropdown-wrapper">
            <div class="dropdown-stub multiselect-stub ${stubClasses}"
                 ${this._disabled ? 'disabled' : ''}>
              <slot name="start"></slot>
              <div class="multiselect-chips">
                <slot name="selected"></slot>
              </div>
              <span class="dropdown-placeholder">${this._placeholder}</span>
              <div class="dropdown-chevron">
                ${CHEVRON_DOWN_SVG}
              </div>
            </div>
            <dialog class="dropdown-dialog">
              <div class="dropdown-header">
                <input 
                  class="dropdown-search-input ${this._size}" 
                  type="text"
                  placeholder="${searchPlaceholder}"
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
              </div>
            </dialog>
          </div>
        </div>
      `

      // Setup event listeners ONCE
      this.setupEventListeners()

      // Don't initialize here - will be done in connectedCallback
      // after properties are set and children are available
    }

    // Always update placeholder visibility on re-render
    this.updateSelectionDisplay()
  }

  /**
   * Render mobile mode with full-screen modal
   * Following dropdown.ts mobile structure
   */
  private renderMobile(): void {
    const shadow = this.shadowRoot!

    // Only set innerHTML and setup listeners if container doesn't exist
    if (!shadow.querySelector('.multiselect-container')) {
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

      // Search is always available — only the mode (internal vs external) varies.
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
        <div class="multiselect-container dropdown-mode-mobile">
          ${labelHtml}
          <div class="dropdown-wrapper">
            <div class="dropdown-stub multiselect-stub ${stubClasses}"
                 ${this._disabled ? 'disabled' : ''}>
              <slot name="start"></slot>
              <div class="multiselect-chips">
                <slot id="stub-slot" name="selected"></slot>
              </div>
              <span class="dropdown-placeholder">${this._placeholder}</span>
              <div class="dropdown-chevron">
                ${CHEVRON_DOWN_SVG}
              </div>
            </div>

            <dialog class="mobile-dialog">
              <div class="mobile-dialog-content">
                
                <!-- HEADER (matches dropdown.ts) -->
                ${searchHeaderHtml}
                
                <!-- BODY (two sections for multiselect) -->
                <div class="mobile-body">
                  
                  <!-- SELECTED SECTION (collapsed by default) -->
                  <div class="mobile-selected-section" data-expanded="false" data-empty="true">
                    <div class="section-header">
                      <span class="section-title">${this._selectedLabel} <span class="section-count">(0)</span></span>
                      <span class="section-chevron">${CHEVRON_DOWN_SVG}</span>
                    </div>
                    <div class="section-content">
                      <slot id="mobile-slot" name="selected"></slot>
                      <div class="empty-state">${this._noSelectionMessage}</div>
                    </div>
                  </div>
                  
                  <!-- AVAILABLE SECTION (expanded by default) -->
                  <div class="mobile-available-section" data-expanded="true" data-empty="false">
                    <div class="section-header">
                      <span class="section-title">${this._availableLabel}</span>
                    </div>
                    <div class="section-content">
                      <slot id="options-slot"></slot>
                      <div class="empty-state">${this._noOptionsMessage}</div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </dialog>
          </div>
        </div>
      `

      // Setup event listeners ONCE
      this.setupMobileEventListeners()
    }

    // Always update placeholder visibility
    this.updateSelectionDisplay()
  }

  /**
   * Setup event listeners for mobile mode
   * Using <dialog> element - backdrop clicks handled natively
   */
  private setupMobileEventListeners(): void {
    const shadow = this.shadowRoot!
    const stub = shadow.querySelector('.multiselect-stub')
    const optionsSlot = shadow.querySelector('#options-slot')
    const searchInput = shadow.querySelector('.mobile-search-input')
    const closeButton = shadow.querySelector('.mobile-close-button')
    const dialog = shadow.querySelector('.mobile-dialog') as HTMLDialogElement

    // Get both section headers
    const selectedHeader = shadow.querySelector('.mobile-selected-section .section-header')
    const availableHeader = shadow.querySelector('.mobile-available-section .section-header')

    if (stub) {
      stub.addEventListener('click', (e) => this.handleMobileStubClick(e))
    }

    // Add tag click handler to slot
    if (optionsSlot) {
      optionsSlot.addEventListener('click', (e) => this.handleMobileTagClick(e))
    }

    // Add search input handlers (if searchable)
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearchInput(e))
    }

    // Toggle section expansion on header click
    if (selectedHeader) {
      selectedHeader.addEventListener('click', () => this.toggleSection('selected'))
    }

    if (availableHeader) {
      availableHeader.addEventListener('click', () => this.toggleSection('available'))
    }

    // Close button click
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeMobileModal())
    }

    this._tagDismissHandler = this.handleTagDismiss.bind(this)
    this.addEventListener('dismiss', this._tagDismissHandler)

    // Backdrop click to close (native dialog behavior)
    if (dialog) {
      dialog.addEventListener('click', (e) => {
        // Only close if clicking directly on the dialog element (backdrop)
        // Not if clicking on its children (dialog-content)
        if (e.target === dialog) {
          this.closeMobileModal()
        }
      })

      // Also handle Escape key via cancel event
      dialog.addEventListener('cancel', (e) => {
        e.preventDefault() // Prevent default to handle it our way
        this.closeMobileModal()
      })
    }
  }

  /**
   * Handle mobile stub click - open modal
   */
  private handleMobileStubClick(e: Event): void {
    e.preventDefault()
    e.stopPropagation()

    if (this._disabled || this._readonly) {
      return
    }

    // Don't open if all tags are already selected
    if (this.allTagsSelected()) {
      return
    }

    this.openMobileModal()
  }

  /**
   * Handle mobile tag click - select and potentially close
   */
  private handleMobileTagClick(e: Event): void {
    // Use the same tag click handler as desktop
    // It already handles mobile mode for auto-close
    this.handleTagClick(e)
  }

  /**
   * Toggle section expansion (mobile only)
   * Clicking expanded section collapses it and expands the other
   * Clicking collapsed section expands it and collapses the other
   */
  private toggleSection(section: 'selected' | 'available'): void {
    const shadow = this.shadowRoot!
    const selectedSection = shadow.querySelector('.mobile-selected-section')
    const availableSection = shadow.querySelector('.mobile-available-section')

    if (!selectedSection || !availableSection) return

    // If clicking already expanded section, collapse it and expand the other
    if (this._state.expandedSection === section) {
      const otherSection = section === 'selected' ? 'available' : 'selected'
      this._state.expandedSection = otherSection
    } else {
      // Expand clicked section
      this._state.expandedSection = section
    }

    // Update DOM attributes
    selectedSection.setAttribute('data-expanded', String(this._state.expandedSection === 'selected'))
    availableSection.setAttribute('data-expanded', String(this._state.expandedSection === 'available'))
  }

  /**
   * Sync section states to DOM without toggle logic
   */
  private syncSectionStates(): void {
    const shadow = this.shadowRoot!
    const selectedSection = shadow.querySelector('.mobile-selected-section')
    const availableSection = shadow.querySelector('.mobile-available-section')

    if (!selectedSection || !availableSection) return

    // Update DOM attributes to match current state
    selectedSection.setAttribute('data-expanded', String(this._state.expandedSection === 'selected'))
    availableSection.setAttribute('data-expanded', String(this._state.expandedSection === 'available'))

  }

  /**
   * Update mobile selected section state (collapsed view, empty states, etc.)
   */
  private updateMobileSelectedState(): void {
    if (this._state.mode !== 'mobile') return


    const shadow = this.shadowRoot!
    const selectedSection = shadow.querySelector('.mobile-selected-section')
    const availableSection = shadow.querySelector('.mobile-available-section')
    const sectionCountSpan = shadow.querySelector('.section-count')

    if (selectedSection) {
      const selectedCount = this._state.selectedValues.length
      const hasSelected = selectedCount > 0

      selectedSection.setAttribute('data-empty', String(!hasSelected))

      // Update header count
      if (sectionCountSpan) {
        sectionCountSpan.textContent = `(${selectedCount})`
      }
    }

    if (availableSection) {
      const allTags = this.getTagElements()
      const availableCount = allTags.filter(tag => !tag.hasAttribute('selected')).length
      const hasAvailable = availableCount > 0

      availableSection.setAttribute('data-empty', String(!hasAvailable))

      // Update available header count
      const availableTitleSpan = shadow.querySelector('.mobile-available-section .section-title')
      if (availableTitleSpan) {
        availableTitleSpan.textContent = `${this._availableLabel} (${availableCount})`
      }
    }
  }

  /**
   * Update selection display (show/hide placeholder)
   * Matches dropdown.ts pattern - uses CSS via has-selection class
   */
  private updateSelectionDisplay(): void {
    const shadow = this.shadowRoot!
    const stub = shadow.querySelector('.multiselect-stub')
    if (!stub) return

    const tags = this.getTagElements()
    const selectedTags = tags.filter(tag => tag.hasAttribute('selected'))
    const hasSelected = selectedTags.length > 0

    if (hasSelected) {
      stub.classList.add('has-selection')
    } else {
      stub.classList.remove('has-selection')
    }
  }

  // ============================================================================
  // PUBLIC API - Getters/Setters
  // ============================================================================

  get value(): string {
    // Always read from DOM - tags with 'selected' attribute are source of truth
    return this.getSelectedValues().join(',')
  }

  set value(val: string) {
    this.setProperty('value', val)
  }

  get name(): string {
    return this.getProperty('name')
  }

  set name(val: string) {
    this.setProperty('name', val)
  }

  get placeholder(): string {
    return this.getProperty('placeholder')
  }

  set placeholder(val: string) {
    this.setProperty('placeholder', val)
  }

  get label(): string {
    return this.getProperty('label')
  }

  set label(val: string) {
    this.setProperty('label', val)
  }

  get disabled(): boolean {
    return this.getProperty('disabled')
  }

  set disabled(value: boolean) {
    this.setProperty('disabled', value)
  }

  get readonly(): boolean {
    return this.getProperty('readonly')
  }

  set readonly(value: boolean) {
    this.setProperty('readonly', value)
  }

  get required(): boolean {
    return this.getProperty('required')
  }

  set required(value: boolean) {
    this.setProperty('required', value)
  }

  get externalSearch(): boolean {
    return this.getProperty('externalSearch')
  }

  set externalSearch(value: boolean) {
    this.setProperty('externalSearch', value)
  }

  get debounce(): number {
    return this.getProperty('debounce')
  }

  set debounce(value: number | string) {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value
    this.setProperty('debounce', numValue)
  }

  get size(): Size {
    return this.getProperty('size') as Size
  }

  set size(value: Size) {
    this.setProperty('size', value)
  }

  get flavor(): Flavor {
    return this.getProperty('flavor') as Flavor
  }

  set flavor(value: Flavor) {
    this.setProperty('flavor', value)
  }

  get form(): HTMLFormElement | null {
    return this._internals.form
  }
}

// Register the custom element
if (!customElements.get('ty-multiselect')) {
  customElements.define('ty-multiselect', TyMultiselect)
}
