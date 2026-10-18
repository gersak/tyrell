/**
 * TyOption Web Component - rich HTML alternative to native <option>.
 * Property-attribute synchronization keeps it compatible with frameworks.
 */

import type { TyOptionElement } from '../types/common.js'
import { ensureStyles } from '../utils/styles.js'
import { coerceBoolean } from '../utils/property-manager.js'
import { upgradeProperties } from '../utils/upgrade-properties.js'
import { optionStyles } from '../styles/option.js'

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

  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' })
    ensureStyles(shadow, { css: optionStyles, id: 'ty-option' })

    this.render()
  }

  static get observedAttributes(): string[] {
    return ['value', 'disabled', 'selected', 'highlighted', 'hidden']
  }

  connectedCallback(): void {
    upgradeProperties(this)
    this.render()
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
    value = coerceBoolean(value)
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
    value = coerceBoolean(value)
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
    value = coerceBoolean(value)
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
    value = coerceBoolean(value)
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


  private render(): void {
    const shadow = this.shadowRoot!

    // Create wrapper once — the check icon alone communicates selection;
    // clicking a selected option again deselects it (see select.ts), so no
    // separate clear affordance is needed on mobile.
    if (!shadow.querySelector('.option-content')) {
      shadow.innerHTML = `<div class="option-content"><slot></slot>${CHECK_SVG}</div>`
    }

    const content = shadow.querySelector('.option-content')
    if (content) {
      if (this._disabled) {
        content.setAttribute('disabled', '')
      } else {
        content.removeAttribute('disabled')
      }

      if (this._selected) {
        content.setAttribute('selected', '')
      } else {
        content.removeAttribute('selected')
      }

      if (this._highlighted) {
        content.setAttribute('highlighted', '')
      } else {
        content.removeAttribute('highlighted')
      }

      if (this._hidden) {
        content.setAttribute('hidden', '')
      } else {
        content.removeAttribute('hidden')
      }
    }
  }
}

if (!customElements.get('ty-option')) {
  customElements.define('ty-option', TyOption)
}
