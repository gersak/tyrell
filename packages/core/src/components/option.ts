/**
 * TyOption Web Component
 * PORTED FROM: clj/ty/components/option.cljs
 * 
 * Ty Option Web Component - Rich HTML alternative to native <option>
 * Enhanced with robust property-attribute synchronization for framework compatibility.
 */

import type { TyOptionElement } from '../types/common.js'
import { ensureStyles } from '../utils/styles.js'
import { optionStyles } from '../styles/option.js'
import { isMobileTouch } from '../utils/mobile.js'

/**
 * Ty Option Component
 * 
 * Rich HTML alternative to native <option> element.
 * Supports HTML content, styling, and framework property binding.
 * 
 * @example
 * ```html
 * <ty-option value="1">Simple Option</ty-option>
 * <ty-option value="2" selected>Selected Option</ty-option>
 * <ty-option value="3" disabled>Disabled Option</ty-option>
 * <ty-option value="4">
 *   <strong>Rich</strong> <em>HTML</em> Content
 * </ty-option>
 * ```
 */
/** Lucide `check` — shown on selected options (kept inline: shadow DOM can't rely on the icon registry) */
const CHECK_SVG = `
  <svg class="option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
`

export class TyOption extends HTMLElement implements TyOptionElement {
  private _value: string | undefined = undefined
  private _selected = false
  private _disabled = false
  private _highlighted = false
  private _hidden = false
  private _isMobile: boolean

  // Clear button event handler reference for cleanup
  private _clearButtonHandler: ((e: Event) => void) | null = null

  constructor() {
    super()

    // Detect mobile device automatically
    this._isMobile = isMobileTouch()

    const shadow = this.attachShadow({ mode: 'open' })
    ensureStyles(shadow, { css: optionStyles, id: 'ty-option' })

    this.render()
  }

  static get observedAttributes(): string[] {
    return ['value', 'disabled', 'selected', 'highlighted', 'hidden']
  }

  connectedCallback(): void {
    // CRITICAL: Reagent/React may set properties BEFORE the element is constructed
    // Check if value was set directly on the instance before our getter/setter was available
    const instanceValue = Object.getOwnPropertyDescriptor(this, 'value')

    if (instanceValue && instanceValue.value !== undefined) {
      this._value = instanceValue.value
      // Clean up the instance property so our getter/setter works
      delete this.value
    }

    this.render()
  }


  disconnectedCallback(): void {
    // Clean up clear button event listener
    this.removeClearButtonListener()
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return

    switch (name) {
      case 'value':
        this._value = newValue || undefined
        break
      case 'selected':
        this._selected = newValue !== null
        break
      case 'disabled':
        this._disabled = newValue !== null
        break
      case 'highlighted':
        this._highlighted = newValue !== null
        break
      case 'hidden':
        this._hidden = newValue !== null
        break
    }

    this.render()
  }

  /**
   * Get value from either property or attribute, with textContent fallback.
   * Property takes precedence (for framework compatibility).
   */
  private getOptionValue(): string {
    // Explicit priority: property > attribute > textContent
    // This correctly handles empty strings
    
    if (this._value !== undefined) {
      return this._value
    }
    
    const attrValue = this.getAttribute('value')
    if (attrValue !== null) {
      return attrValue
    }
    
    return this.textContent?.trim() || ''
  }

  // Public API - Getters/Setters
  // NOTE: All setters trigger re-render to support property changes from frameworks like React

  get value(): string | undefined {
    return this.getOptionValue()
  }

  set value(val: string | undefined) {
    if (this._value !== val) {
      this._value = val
      if (val !== undefined) {
        this.setAttribute('value', val)
      } else {
        this.removeAttribute('value')
      }
      this.render()
    }
  }

  get selected(): boolean {
    return this._selected
  }

  set selected(value: boolean) {
    if (this._selected !== value) {
      this._selected = value
      if (value) {
        this.setAttribute('selected', '')
      } else {
        this.removeAttribute('selected')
      }
      this.render()
    }
  }

  get disabled(): boolean {
    return this._disabled
  }

  set disabled(value: boolean) {
    if (this._disabled !== value) {
      this._disabled = value
      if (value) {
        this.setAttribute('disabled', '')
      } else {
        this.removeAttribute('disabled')
      }
      this.render()
    }
  }

  get highlighted(): boolean {
    return this._highlighted
  }

  set highlighted(value: boolean) {
    if (this._highlighted !== value) {
      this._highlighted = value
      if (value) {
        this.setAttribute('highlighted', '')
      } else {
        this.removeAttribute('highlighted')
      }
      this.render()
    }
  }

  get hidden(): boolean {
    return this._hidden
  }

  set hidden(value: boolean) {
    if (this._hidden !== value) {
      this._hidden = value
      if (value) {
        this.setAttribute('hidden', '')
      } else {
        this.removeAttribute('hidden')
      }
      this.render()
    }
  }


  /**
   * Remove clear button event listener if it exists
   */
  private removeClearButtonListener(): void {
    if (this._clearButtonHandler) {
      const clearBtn = this.shadowRoot?.querySelector('.option-clear-btn')
      if (clearBtn) {
        clearBtn.removeEventListener('click', this._clearButtonHandler)
      }
      this._clearButtonHandler = null
    }
  }

  /**
   * Add clear button event listener (only if not already added)
   */
  private addClearButtonListener(clearBtn: Element): void {
    // Remove existing listener first (if any)
    this.removeClearButtonListener()

    // Create new handler
    this._clearButtonHandler = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()

      this.dispatchEvent(new CustomEvent('clear-selection', {
        bubbles: true,
        composed: true,
        detail: { value: this._value }
      }))
    }

    // Add listener
    clearBtn.addEventListener('click', this._clearButtonHandler)
  }

  /**
 * Render the option component with rich HTML content and property sync
 */
  private render(): void {
    const shadow = this.shadowRoot!
    const value = this.getOptionValue()

    // Create wrapper with optional clear button
    if (!shadow.querySelector('.option-content')) {
      const shouldShowClear = this._selected && this._isMobile

      if (shouldShowClear) {
        shadow.innerHTML = `
          <div class="option-content">
            <span class="option-text"><slot></slot></span>
            ${CHECK_SVG}
            <button class="option-clear-btn" type="button" aria-label="Clear selection">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        `

        // Add clear button click handler
        const clearBtn = shadow.querySelector('.option-clear-btn')
        if (clearBtn) {
          this.addClearButtonListener(clearBtn)
        }
      } else {
        shadow.innerHTML = `<div class="option-content"><slot></slot>${CHECK_SVG}</div>`
      }
    } else {
      // Update existing content - add/remove clear button as needed
      const shouldShowClear = this._selected && this._isMobile
      const existingClearBtn = shadow.querySelector('.option-clear-btn')

      if (shouldShowClear && !existingClearBtn) {
        // Need to add clear button
        const content = shadow.querySelector('.option-content')
        if (content) {
          // Wrap slot in span if not already wrapped
          const slot = content.querySelector('slot')
          if (slot && !slot.parentElement?.classList.contains('option-text')) {
            const textSpan = document.createElement('span')
            textSpan.className = 'option-text'
            slot.parentNode?.insertBefore(textSpan, slot)
            textSpan.appendChild(slot)
          }

          // Add clear button
          const clearBtn = document.createElement('button')
          clearBtn.className = 'option-clear-btn'
          clearBtn.type = 'button'
          clearBtn.setAttribute('aria-label', 'Clear selection')
          clearBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          `
          this.addClearButtonListener(clearBtn)
          content.appendChild(clearBtn)
        }
      } else if (!shouldShowClear && existingClearBtn) {
        // Remove clear button
        existingClearBtn.remove()
        // Clean up event listener
        this.removeClearButtonListener()
      }
    }

    // Update content wrapper attributes
    const content = shadow.querySelector('.option-content')
    if (content) {
      // Disabled state
      if (this._disabled) {
        content.setAttribute('disabled', '')
      } else {
        content.removeAttribute('disabled')
      }

      // Selected state
      if (this._selected) {
        content.setAttribute('selected', '')
      } else {
        content.removeAttribute('selected')
      }

      // Highlighted state
      if (this._highlighted) {
        content.setAttribute('highlighted', '')
      } else {
        content.removeAttribute('highlighted')
      }

      // Hidden state
      if (this._hidden) {
        content.setAttribute('hidden', '')
      } else {
        content.removeAttribute('hidden')
      }
    }
  }
}

// Register the custom element
if (!customElements.get('ty-option')) {
  customElements.define('ty-option', TyOption)
}
