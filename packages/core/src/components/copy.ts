/**
 * TyCopy Web Component
 *
 * Read-only field with copy-to-clipboard functionality
 * Perfect for API keys, tokens, URLs, code snippets, etc.
 *
 * Features:
 * - Read-only display (not an input)
 * - Copy icon on the right
 * - Icon animation on copy (copy → check → copy)
 * - Same styling as ty-input for consistency
 * - Label support
 * - Size and flavor variants
 */

import type { Flavor, Size } from '../types/common.js'
import { TyComponent } from '../base/ty-component.js'
import type { PropertyChange } from '../utils/property-manager.js'
import { ensureStyles } from '../utils/styles.js'
import { syncCustomFlavorSheet } from '../utils/flavor-sheet.js'
import { inputStyles } from '../styles/input.js'
import { copyStyles, copyCustomFlavorCss } from '../styles/copy.js'

/**
 * Copy icon SVG (from Lucide)
 */
const COPY_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`

/**
 * Check icon SVG (from Lucide) - shown after successful copy
 */
const CHECK_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`

/**
 * X icon SVG (from Lucide) - shown on copy failure
 */
const ERROR_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`

/**
 * Required indicator SVG icon (from Lucide)
 */
const REQUIRED_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-asterisk-icon lucide-asterisk"><path d="M12 6v12"/><path d="M17.196 9 6.804 15"/><path d="m6.804 9 10.392 6"/></svg>`

/**
 * Component internal state
 */
interface CopyState {
  value: string
  label: string
  size: Size
  flavor: Flavor
  format: 'text' | 'code'
  multiline: boolean
  horizontalScroll: boolean
  disabled: boolean
  required: boolean
}

/**
 * TyCopy Element Interface
 */
export interface TyCopyElement extends HTMLElement {
  value: string
  label: string
  size: Size
  flavor: Flavor
  format: 'text' | 'code'
  multiline: boolean
  horizontalScroll: boolean
  disabled: boolean
  required: boolean
}

/**
 * Ty Copy Field Component
 *
 * @example
 * ```html
 * <!-- Basic copy field -->
 * <ty-copy
 *   label="API Key"
 *   value="sk_live_1234567890abcdef">
 * </ty-copy>
 *
 * <!-- Code format -->
 * <ty-copy
 *   label="Install Command"
 *   value="npm install tyrell-components"
 *   format="code">
 * </ty-copy>
 *
 * <!-- Different sizes -->
 * <ty-copy size="sm" value="Small field"></ty-copy>
 * <ty-copy size="lg" value="Large field"></ty-copy>
 *
 * <!-- Semantic flavors -->
 * <ty-copy flavor="primary" value="Primary"></ty-copy>
 * <ty-copy flavor="success" value="Success"></ty-copy>
 * ```
 */
export class TyCopy extends TyComponent<CopyState> implements TyCopyElement {
  static formAssociated = true

  // ============================================================================
  // PROPERTY CONFIGURATION - Declarative property lifecycle
  // ============================================================================
  protected static properties = {
    value: {
      type: 'string' as const,
      visual: true,
      formValue: true,
      default: '',
    },
    label: {
      type: 'string' as const,
      visual: true,
      default: '',
    },
    size: {
      type: 'string' as const,
      visual: true,
      default: 'md',
      validate: (v: any) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
      coerce: (v: any) => {
        if (!['xs', 'sm', 'md', 'lg', 'xl'].includes(v)) {
          console.warn(`[ty-copy] Invalid size '${v}'. Using 'md'.`)
          return 'md'
        }
        return v
      },
    },
    // Any string is accepted: built-ins get static CSS, other identifiers
    // become custom flavors (see _syncCustomFlavor), garbage degrades to
    // the default look.
    flavor: {
      type: 'string' as const,
      visual: true,
      default: 'neutral',
    },
    format: {
      type: 'string' as const,
      visual: true,
      default: 'text',
      coerce: (v: any) => (v === 'code' ? 'code' : 'text'),
    },
    multiline: {
      type: 'boolean' as const,
      visual: true,
      default: false,
    },
    horizontalScroll: {
      type: 'boolean' as const,
      visual: true,
      default: false,
    },
    disabled: {
      type: 'boolean' as const,
      visual: true,
      default: false,
    },
    required: {
      type: 'boolean' as const,
      visual: true,
      default: false,
    },
  }

  // ============================================================================
  // INTERNAL STATE - Not managed by PropertyManager
  // ============================================================================
  private _copyTimeout: number | null = null
  private _showingSuccess = false
  private _customFlavorSheet: CSSStyleSheet | null = null

  constructor() {
    super() // TyComponent handles attachInternals() and attachShadow()

    // Apply both input and copy-specific styles
    ensureStyles(this.shadowRoot!, { css: inputStyles, id: 'ty-input' })
    ensureStyles(this.shadowRoot!, { css: copyStyles, id: 'ty-copy' })
  }

  // observedAttributes auto-generated by TyComponent from properties config

  // ============================================================================
  // TYCOMPONENT LIFECYCLE HOOKS
  // ============================================================================

  /**
   * Called when component connects to DOM
   * TyComponent already handled pre-connection property capture
   */
  protected onConnect(): void {
    // TyComponent will call render() automatically after this hook
    this._syncCustomFlavor()
  }

  /** Custom (non-built-in) flavors — see utils/flavor-sheet.ts. */
  private _syncCustomFlavor(): void {
    this._customFlavorSheet = syncCustomFlavorSheet(
      this.shadowRoot!,
      this._customFlavorSheet,
      this.flavor,
      ({ base }) => copyCustomFlavorCss(base),
    )
  }

  /**
   * Called when component disconnects from DOM
   */
  protected onDisconnect(): void {
    // Clear any pending timeout
    if (this._copyTimeout !== null) {
      clearTimeout(this._copyTimeout)
      this._copyTimeout = null
    }
  }

  /**
   * Handle property changes - called BEFORE render
   */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    if (changes.some((c) => c.name === 'flavor')) {
      this._syncCustomFlavor()
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Build CSS class list
   */
  private buildClassList(): string {
    const classes: string[] = [this.size]

    if (this.disabled) classes.push('disabled')
    if (this.required) classes.push('required')

    return classes.join(' ')
  }

  /**
   * Copy value to clipboard
   */
  private async copyToClipboard(): Promise<void> {
    if (this.disabled || !this.value) return

    try {
      await navigator.clipboard.writeText(this.value)

      // Emit success event
      this.dispatchEvent(new CustomEvent('copy-success', {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      }))
    } catch (err) {
      // Fallback for non-secure contexts (non-HTTPS)
      try {
        const textarea = document.createElement('textarea')
        textarea.value = this.value
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)

        this.dispatchEvent(new CustomEvent('copy-success', {
          detail: { value: this.value },
          bubbles: true,
          composed: true
        }))
      } catch (fallbackErr) {
        console.error('[ty-copy] Failed to copy:', fallbackErr)
        this.dispatchEvent(new CustomEvent('copy-error', {
          detail: { error: fallbackErr },
          bubbles: true,
          composed: true
        }))
        this.showCopyError()
        return
      }
    }

    // Show success animation (after either method succeeds)
    this.showCopySuccess()
  }

  /**
   * Show copy success animation
   * Uses state flag so render() can show the correct icon
   */
  private showCopySuccess(): void {
    // Clear any existing timeout
    if (this._copyTimeout !== null) {
      clearTimeout(this._copyTimeout)
    }

    this._showingSuccess = true
    // Update just the button without full re-render
    const copyButton = this.shadowRoot!.querySelector('.copy-button')
    if (copyButton) {
      copyButton.classList.add('success')
      copyButton.innerHTML = CHECK_ICON_SVG
    }

    // Reset after 2 seconds
    this._copyTimeout = window.setTimeout(() => {
      this._showingSuccess = false
      const btn = this.shadowRoot!.querySelector('.copy-button')
      if (btn) {
        btn.classList.remove('success')
        btn.innerHTML = COPY_ICON_SVG
      }
      this._copyTimeout = null
    }, 2000)
  }

  /**
   * Show copy error animation
   * Swaps copy icon → red X icon → copy icon
   */
  private showCopyError(): void {
    if (this._copyTimeout !== null) {
      clearTimeout(this._copyTimeout)
    }

    this._showingSuccess = false
    const copyButton = this.shadowRoot!.querySelector('.copy-button')
    if (copyButton) {
      copyButton.classList.add('error')
      copyButton.innerHTML = ERROR_ICON_SVG
    }

    this._copyTimeout = window.setTimeout(() => {
      const btn = this.shadowRoot!.querySelector('.copy-button')
      if (btn) {
        btn.classList.remove('error')
        btn.innerHTML = COPY_ICON_SVG
      }
      this._copyTimeout = null
    }, 2000)
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    const shadow = this.shadowRoot!
    const inputWrapper = shadow.querySelector('.input-wrapper')
    const copyButton = shadow.querySelector('.copy-button')

    // Make entire field clickable for copying
    if (inputWrapper && !this.disabled) {
      const wrapperEl = inputWrapper as HTMLElement
      wrapperEl.addEventListener('click', (e) => {
        // Prevent double-triggering if button was clicked
        if (e.target === copyButton || (e.target as HTMLElement).closest('.copy-button')) {
          return
        }
        this.copyToClipboard()
      })

      // Add visual feedback - make it look clickable
      wrapperEl.style.cursor = 'pointer'
    }

    // Button click handler
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        this.copyToClipboard()
      })
    }
  }

  /**
   * Render the component
   */
  protected render(): void {
    const shadow = this.shadowRoot!
    const classes = this.buildClassList()

    // Determine display element based on format, multiline and scroll
    const valueClass = [
      'copy-field-value',
      this.multiline ? 'multiline' : '',
      this.horizontalScroll ? 'horizontal-scroll' : '',
    ].filter(Boolean).join(' ')
    const displayElement = this.format === 'code'
      ? `<code class="${valueClass}">${this.value || ''}</code>`
      : `<div class="${valueClass}">${this.value || ''}</div>`

    const labelHtml = this.label ? `
      <label class="ty-field-label">
        ${this.label}
        ${this.required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ''}
      </label>
    ` : ''

    shadow.innerHTML = `
      <div class="input-container">
        ${labelHtml}
        <div class="input-wrapper ${classes}">
          ${displayElement}
          <button class="copy-button${this._showingSuccess ? ' success' : ''}" type="button" ${this.disabled ? 'disabled' : ''}>
            ${this._showingSuccess ? CHECK_ICON_SVG : COPY_ICON_SVG}
          </button>
        </div>
      </div>
    `

    // Re-setup event listeners after render
    this.setupEventListeners()
  }

  // ============================================================================
  // PROPERTY ACCESSORS - Simple wrappers (no logic!)
  // ============================================================================

  get value(): string {
    return this.getProperty('value')
  }

  set value(val: string) {
    this.setProperty('value', val)
  }

  get label(): string {
    return this.getProperty('label')
  }

  set label(val: string) {
    this.setProperty('label', val)
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

  get format(): 'text' | 'code' {
    return this.getProperty('format')
  }

  set format(value: 'text' | 'code') {
    this.setProperty('format', value)
  }

  get multiline(): boolean {
    return this.getProperty('multiline')
  }

  set multiline(value: boolean) {
    this.setProperty('multiline', value)
  }

  get horizontalScroll(): boolean {
    return this.getProperty('horizontalScroll')
  }

  set horizontalScroll(value: boolean) {
    this.setProperty('horizontalScroll', value)
  }

  get disabled(): boolean {
    return this.getProperty('disabled')
  }

  set disabled(value: boolean) {
    this.setProperty('disabled', value)
  }

  get required(): boolean {
    return this.getProperty('required')
  }

  set required(value: boolean) {
    this.setProperty('required', value)
  }
}

// Register the custom element
if (!customElements.get('ty-copy')) {
  customElements.define('ty-copy', TyCopy)
}

// Also exposed as ty-copy-field — says what it is (a read-only field with a
// copy button). A constructor can only register once, hence the subclass.
if (!customElements.get('ty-copy-field')) {
  customElements.define('ty-copy-field', class TyCopyField extends TyCopy { })
}
