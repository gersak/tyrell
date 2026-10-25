/**
 * TyOption Web Component - rich HTML alternative to native <option>.
 * Property-attribute synchronization keeps it compatible with frameworks.
 *
 * Two kinds of selection state, never mixed:
 * - `selected` (attribute/property) is the APP's mark. Only ty-select's
 *   `external-selection` mode reads it; otherwise the select's `value` rules.
 * - `checked` (property only) is what the parent ty-select decided: it draws
 *   the check and aria-selected. Never written to an attribute, so a server
 *   morph has nothing of ours to strip.
 * role="option" is an attribute (audit tools like axe don't read
 * ElementInternals); it never changes, and comes back if a morph strips it.
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
  private _checked = false
  private _inTrigger = false
  private _disabled = false
  private _highlighted = false
  private _hidden = false
  private _internals: ElementInternals

  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' })
    ensureStyles(shadow, { css: optionStyles, id: 'ty-option' })

    // Selection state lives in internals, not in attributes a morph could strip
    this._internals = this.attachInternals()
    this._internals.ariaSelected = 'false'

    this.render()
  }

  static get observedAttributes(): string[] {
    return ['value', 'disabled', 'selected', 'highlighted', 'hidden', 'role']
  }

  connectedCallback(): void {
    upgradeProperties(this)
    if (!this.hasAttribute('role')) this.setAttribute('role', 'option')
    this.render()
  }


  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return

    switch (name) {
      case 'value':
        this._value = newValue || undefined
        break
      case 'selected':
        // Boolean-attribute rules of the library: "false" and "0" are off
        this._selected = newValue !== null && !/^(false|0)$/i.test(newValue.trim())
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
      case 'role':
        if (newValue === null && this.isConnected) this.setAttribute('role', 'option')
        return
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

  /** The app's mark, read by ty-select only in `external-selection` mode. */
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
    }
  }

  /** Set by the parent ty-select: draws the check and aria-selected. */
  get checked(): boolean {
    return this._checked
  }

  set checked(value: boolean) {
    value = coerceBoolean(value)
    if (this._checked !== value) {
      this._checked = value
      this._internals.ariaSelected = String(value)
      this.render()
    }
  }

  /** Set by the parent ty-select while this option is shown in its trigger. */
  get inTrigger(): boolean {
    return this._inTrigger
  }

  set inTrigger(value: boolean) {
    value = coerceBoolean(value)
    if (this._inTrigger !== value) {
      this._inTrigger = value
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

    this._internals.ariaDisabled = this._disabled ? 'true' : null

    const content = shadow.querySelector('.option-content')
    if (content) {
      content.toggleAttribute('disabled', this._disabled)
      content.toggleAttribute('selected', this._checked)
      content.toggleAttribute('highlighted', this._highlighted)
      content.toggleAttribute('hidden', this._hidden)
      content.classList.toggle('in-trigger', this._inTrigger)
    }
  }
}

if (!customElements.get('ty-option')) {
  customElements.define('ty-option', TyOption)
}
