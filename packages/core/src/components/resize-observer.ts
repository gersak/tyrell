/**
 * TyResizeObserver Web Component
 * 
 * Self-observing resize component that tracks its own dimensions
 * and stores them in a global registry accessible by element ID.
 * 
 * @example
 * ```html
 * <ty-resize-observer id="parent-container">
 *   <div class="child">
 *     <!-- Child can query parent size via getSize('parent-container') -->
 *   </div>
 * </ty-resize-observer>
 * ```
 * 
 * @example With debouncing
 * ```html
 * <ty-resize-observer id="container" debounce="100">
 *   <!-- Only updates after 100ms of no resize activity -->
 * </ty-resize-observer>
 * ```
 */

import { ensureStyles } from '../utils/styles.js'
import { resizeObserverStyles } from '../styles/resize-observer.js'
import { updateSize, removeSize } from '../utils/resize-observer.js'

export class TyResizeObserver extends HTMLElement {
  private _resizeObserver: ResizeObserver | null = null
  private _debounceTimer: number | null = null

  static get observedAttributes(): string[] {
    return ['id', 'debounce']
  }

  /**
   * Debounce in milliseconds (default: 0 = no debounce)
   */
  get debounce(): number {
    return parseInt(this.getAttribute('debounce') || '0')
  }

  set debounce(value: number) {
    this.setAttribute('debounce', String(value))
  }

  constructor() {
    super()

    // Setup shadow DOM with styles
    const shadow = this.attachShadow({ mode: 'open' })
    ensureStyles(shadow, { css: resizeObserverStyles, id: 'ty-resize-observer' })

    // Simple slot for content
    shadow.innerHTML = '<slot></slot>'
  }

  connectedCallback(): void {
    this.setupObserver()
  }

  disconnectedCallback(): void {
    this.cleanup()
  }

  /**
   * Setup ResizeObserver to watch this element
   */
  private setupObserver(): void {
    this._resizeObserver = new ResizeObserver((entries) => {
      if (this.debounce > 0) {
        // Debounced handling
        if (this._debounceTimer) clearTimeout(this._debounceTimer)
        this._debounceTimer = window.setTimeout(() => {
          this.handleResize(entries)
        }, this.debounce)
      } else {
        // Immediate handling
        this.handleResize(entries)
      }
    })

    // Observe the custom element itself (not shadow root)
    this._resizeObserver.observe(this)
  }

  /**
   * Handle resize events - update registry and notify callbacks
   */
  private handleResize(entries: ResizeObserverEntry[]): void {
    const { width, height } = entries[0].contentRect

    // Only update if element has an ID
    if (this.id) {
      updateSize(this.id, width, height)
    }
  }

  /**
   * Cleanup observer and remove from registry
   */
  private cleanup(): void {
    // Disconnect observer
    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
      this._resizeObserver = null
    }

    // Clear pending debounce timer
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer)
      this._debounceTimer = null
    }

    // Remove from registry
    if (this.id) {
      removeSize(this.id)
    }
  }
}

// Register custom element
customElements.define('ty-resize-observer', TyResizeObserver)
