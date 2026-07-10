/**
 * TyScrollContainer Web Component
 *
 * A scroll container with shadow indicators and an optional custom-rendered scrollbar.
 * Uses the CustomScrollbar utility internally.
 *
 * @example Custom scrollbar
 * ```html
 * <ty-scroll-container max-height="300px" custom-scrollbar>
 *   <div>Long content...</div>
 * </ty-scroll-container>
 * ```
 */

import { ensureStyles } from '../utils/styles.js'
import { scrollContainerStyles } from '../styles/scroll-container.js'
import { CustomScrollbar } from '../utils/custom-scrollbar.js'

export class TyScrollContainer extends HTMLElement {
  private _scrollWrapper: HTMLElement | null = null
  private _shadowTop: HTMLElement | null = null
  private _shadowBottom: HTMLElement | null = null
  private _shadowLeft: HTMLElement | null = null
  private _shadowRight: HTMLElement | null = null
  private _scrollbar: CustomScrollbar | null = null
  private _resizeObserver: ResizeObserver | null = null
  private _contentObserver: MutationObserver | null = null
  private _rafId: number | null = null
  // Edge-trigger state for nearstart/nearend (fire once on entering the zone).
  private _nearStartFired = false
  private _nearEndFired = false

  static get observedAttributes(): string[] {
    return ['shadow', 'max-height', 'hide-scrollbar', 'custom-scrollbar', 'overflow-x', 'scroll-anchoring']
  }

  // ============ Property Accessors ============

  get shadow(): boolean {
    return this.getAttribute('shadow') !== 'false'
  }

  set shadow(value: boolean) {
    if (value) this.removeAttribute('shadow')
    else this.setAttribute('shadow', 'false')
  }

  get maxHeight(): string | null {
    return this.getAttribute('max-height')
  }

  set maxHeight(value: string | null) {
    if (value) this.setAttribute('max-height', value)
    else this.removeAttribute('max-height')
    this._updateMaxHeight()
  }

  get hideScrollbar(): boolean {
    return this.hasAttribute('hide-scrollbar')
  }

  set hideScrollbar(value: boolean) {
    if (value) this.setAttribute('hide-scrollbar', '')
    else this.removeAttribute('hide-scrollbar')
  }

  get customScrollbar(): boolean {
    return this.hasAttribute('custom-scrollbar')
  }

  set customScrollbar(value: boolean) {
    if (value) this.setAttribute('custom-scrollbar', '')
    else this.removeAttribute('custom-scrollbar')
  }

  get overflowX(): boolean {
    return this.hasAttribute('overflow-x')
  }

  set overflowX(value: boolean) {
    if (value) this.setAttribute('overflow-x', '')
    else this.removeAttribute('overflow-x')
  }

  /** Distance (px) from an edge at which nearstart/nearend fire. Default 100. */
  get nearEdgeThreshold(): number {
    const v = parseInt(this.getAttribute('near-edge-threshold') || '', 10)
    return Number.isFinite(v) ? v : 100
  }

  set nearEdgeThreshold(value: number | null) {
    if (value == null) this.removeAttribute('near-edge-threshold')
    else this.setAttribute('near-edge-threshold', String(value))
  }

  /** Preserve visual position when content is added above the viewport
   *  (e.g. prepending older messages in a chat). Opt-in. */
  get scrollAnchoring(): boolean {
    return this.hasAttribute('scroll-anchoring')
  }

  set scrollAnchoring(value: boolean) {
    if (value) this.setAttribute('scroll-anchoring', '')
    else this.removeAttribute('scroll-anchoring')
  }

  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' })
    ensureStyles(shadow, { css: scrollContainerStyles, id: 'ty-scroll-container' })

    shadow.innerHTML = `
      <div class="scroll-wrapper">
        <slot></slot>
      </div>
      <div class="shadow-overlay">
        <div class="shadow-top"></div>
        <div class="shadow-bottom"></div>
        <div class="shadow-left"></div>
        <div class="shadow-right"></div>
      </div>
    `

    this._scrollWrapper = shadow.querySelector('.scroll-wrapper')
    this._shadowTop = shadow.querySelector('.shadow-top')
    this._shadowBottom = shadow.querySelector('.shadow-bottom')
    this._shadowLeft = shadow.querySelector('.shadow-left')
    this._shadowRight = shadow.querySelector('.shadow-right')
  }

  connectedCallback(): void {
    this._scrollWrapper?.addEventListener('scroll', this._onScroll, { passive: true })

    this._resizeObserver = new ResizeObserver(() => {
      this._scrollbar?.update()
      this._updateShadowState()
    })

    if (this._scrollWrapper) {
      this._resizeObserver.observe(this._scrollWrapper)

      const slot = this._scrollWrapper.querySelector('slot') as HTMLSlotElement | null
      if (slot) {
        slot.addEventListener('slotchange', this._onSlotChange)
      }
    }

    this._updateMaxHeight()
    this._updateShadowState()
    this._setupScrollbar()
    this._setupAnchoring()
  }

  disconnectedCallback(): void {
    this._scrollWrapper?.removeEventListener('scroll', this._onScroll)
    this._destroyScrollbar()
    this._teardownAnchoring()

    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
      this._resizeObserver = null
    }

    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return

    if (name === 'max-height') {
      this._updateMaxHeight()
      this._updateShadowState()
      this._scrollbar?.update()
    }

    if (name === 'custom-scrollbar' || name === 'overflow-x') {
      this._destroyScrollbar()
      this._setupScrollbar()
      this._updateShadowState()
    }

    if (name === 'scroll-anchoring') {
      this._teardownAnchoring()
      this._setupAnchoring()
    }
  }

  // ============ Private: Scroll Anchoring ============

  // Preserve visual position when content is added ABOVE the viewport (chat
  // "load older" prepends). A MutationObserver watches the host's children;
  // any added node sitting above the visible area shifts everything down, so we
  // add its (above-the-fold) height back to scrollTop. Append-at-bottom is
  // untouched. CSS sets overflow-anchor:none so native anchoring doesn't fight us.
  private _setupAnchoring(): void {
    if (this._contentObserver || !this.scrollAnchoring) return

    this._contentObserver = new MutationObserver((records) => {
      const wrap = this._scrollWrapper
      if (!wrap) return
      const wrapTop = wrap.getBoundingClientRect().top
      let addedAbove = 0
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n.nodeType !== Node.ELEMENT_NODE) return
          const rect = (n as HTMLElement).getBoundingClientRect()
          if (rect.bottom <= wrapTop) addedAbove += rect.height          // fully above
          else if (rect.top < wrapTop) addedAbove += wrapTop - rect.top  // partly above
        })
      }
      if (addedAbove > 0) {
        wrap.scrollTop += addedAbove
        this._scrollbar?.update()
      }
    })
    this._contentObserver.observe(this, { childList: true })
  }

  private _teardownAnchoring(): void {
    this._contentObserver?.disconnect()
    this._contentObserver = null
  }

  // ============ Private: Scrollbar Setup ============

  private _setupScrollbar(): void {
    // Idempotent: attributeChangedCallback (attrs set before insertion) and
    // connectedCallback can both call this. Without the guard a second
    // CustomScrollbar + track is created → two thumbs.
    if (this._scrollbar) return
    if (!this._scrollWrapper || !this.customScrollbar) return

    this._scrollbar = new CustomScrollbar(this._scrollWrapper, {
      vertical: true,
      horizontal: this.overflowX
    })

    // Append track elements to shadow DOM
    const shadowRoot = this.shadowRoot!
    if (this._scrollbar.trackY) shadowRoot.appendChild(this._scrollbar.trackY)
    if (this._scrollbar.trackX) shadowRoot.appendChild(this._scrollbar.trackX)
  }

  private _destroyScrollbar(): void {
    if (this._scrollbar) {
      // Remove track elements from DOM
      this._scrollbar.trackY?.remove()
      this._scrollbar.trackX?.remove()
      this._scrollbar.destroy()
      this._scrollbar = null
    }
  }

  // ============ Private: Max Height ============

  private _updateMaxHeight(): void {
    if (this._scrollWrapper) {
      const maxHeight = this.maxHeight
      if (maxHeight) {
        this._scrollWrapper.style.setProperty('--scroll-max-height', maxHeight)
        this._scrollWrapper.style.maxHeight = maxHeight
      } else {
        this._scrollWrapper.style.removeProperty('--scroll-max-height')
        this._scrollWrapper.style.maxHeight = ''
      }
    }
  }

  // ============ Private: Scroll Handling ============

  private _onScroll = (): void => {
    if (this._rafId !== null) return

    this._rafId = requestAnimationFrame(() => {
      this._rafId = null
      this._updateShadowState()
    })
  }

  private _onSlotChange = (): void => {
    this._scrollbar?.update()
    this._updateShadowState()
  }

  // ============ Private: Shadow State ============

  private _updateShadowState(): void {
    if (!this._scrollWrapper) return
    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = this._scrollWrapper
    const threshold = 2

    if (this._shadowTop) {
      this._shadowTop.classList.toggle('visible', scrollTop > threshold)
    }
    if (this._shadowBottom) {
      this._shadowBottom.classList.toggle('visible', scrollTop + clientHeight < scrollHeight - threshold)
    }

    if (this.overflowX) {
      if (this._shadowLeft) {
        this._shadowLeft.classList.toggle('visible', scrollLeft > threshold)
      }
      if (this._shadowRight) {
        this._shadowRight.classList.toggle('visible', scrollLeft + clientWidth < scrollWidth - threshold)
      }
    }

    // Near-edge events for infinite scroll (vertical). Edge-triggered: fire once
    // when entering the zone, re-arm only after leaving it. Runs on scroll,
    // slotchange and resize (all route through here), so loading more content
    // re-arms naturally once it grows the scroll distance.
    const scrollable = scrollHeight - clientHeight
    if (scrollable > 0) {
      const t = this.nearEdgeThreshold
      const distEnd = scrollable - scrollTop
      this._nearEndFired = this._maybeEmitEdge(
        'nearend', distEnd, t, this._nearEndFired,
        { distance: distEnd, scrollTop, scrollHeight, clientHeight })
      this._nearStartFired = this._maybeEmitEdge(
        'nearstart', scrollTop, t, this._nearStartFired,
        { distance: scrollTop, scrollTop, scrollHeight, clientHeight })
    } else {
      // Not scrollable → re-arm both so they fire fresh once content overflows.
      this._nearStartFired = false
      this._nearEndFired = false
    }
  }

  /** Edge-trigger one near-edge event; returns the new "fired" state. */
  private _maybeEmitEdge(
    name: string, distance: number, threshold: number, fired: boolean, detail: object
  ): boolean {
    if (distance > threshold) return false // out of zone → re-arm
    if (!fired) {
      this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }))
    }
    return true
  }

  // ============ Public API ============

  updateShadows(): void {
    this._updateShadowState()
    this._scrollbar?.update()
  }

  scrollToTop(smooth = true): void {
    this._scrollWrapper?.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
  }

  scrollToBottom(smooth = true): void {
    if (this._scrollWrapper) {
      this._scrollWrapper.scrollTo({ top: this._scrollWrapper.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    }
  }

  scrollToLeft(smooth = true): void {
    this._scrollWrapper?.scrollTo({ left: 0, behavior: smooth ? 'smooth' : 'auto' })
  }

  scrollToRight(smooth = true): void {
    if (this._scrollWrapper) {
      this._scrollWrapper.scrollTo({ left: this._scrollWrapper.scrollWidth, behavior: smooth ? 'smooth' : 'auto' })
    }
  }

  /** Scroll a slotted descendant (element or CSS selector) into view. */
  scrollToElement(target: Element | string, smooth = true): void {
    const el = typeof target === 'string' ? this.querySelector(target) : target
    el?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'nearest' })
  }

  get scrollElement(): HTMLElement | null {
    return this._scrollWrapper
  }
}

// Register custom element
customElements.define('ty-scroll-container', TyScrollContainer)
