/**
 * TyResizeObserver Web Component - self-observing element that tracks its own
 * dimensions in a global registry keyed by element ID. Optional debounce.
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

    const shadow = this.attachShadow({ mode: 'open' })
    ensureStyles(shadow, { css: resizeObserverStyles, id: 'ty-resize-observer' })

    shadow.innerHTML = '<slot></slot>'
  }

  connectedCallback(): void {
    this.setupObserver()
  }

  disconnectedCallback(): void {
    this.cleanup()
  }

  private setupObserver(): void {
    this._resizeObserver = new ResizeObserver((entries) => {
      if (this.debounce > 0) {
        if (this._debounceTimer) clearTimeout(this._debounceTimer)
        this._debounceTimer = window.setTimeout(() => {
          this.handleResize(entries)
        }, this.debounce)
      } else {
        this.handleResize(entries)
      }
    })

    // Observe the custom element itself (not shadow root)
    this._resizeObserver.observe(this)
  }

  private handleResize(entries: ResizeObserverEntry[]): void {
    const { width, height } = entries[0].contentRect

    if (this.id) {
      updateSize(this.id, width, height)
    }
  }

  private cleanup(): void {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
      this._resizeObserver = null
    }

    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer)
      this._debounceTimer = null
    }

    if (this.id) {
      removeSize(this.id)
    }
  }
}

customElements.define('ty-resize-observer', TyResizeObserver)
