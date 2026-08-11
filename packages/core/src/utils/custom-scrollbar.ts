/**
 * CustomScrollbar - attaches a rendered scrollbar (vertical and/or horizontal)
 * to any scrollable element. Overlay approach: native overflow:auto is kept for
 * scroll physics, the native scrollbar is hidden via CSS, and custom track/thumb
 * elements are synced on top. Append `trackY`/`trackX` to your DOM; `destroy()`
 * cleans up. Classes: `.ty-scrollbar-{track,thumb}-{y,x}` plus state classes
 * `.has-overflow`, `.dragging`, `.scrolling` (brief auto-hide after scroll).
 */

export interface CustomScrollbarOptions {
  vertical?: boolean
  horizontal?: boolean
  autoHideDelay?: number
}

/**
 * Check if custom scrollbar is enabled globally.
 * Default: true (custom scrollbar on).
 * Set data-ty-scrollbar="native" on <html> to opt out.
 */
export function isCustomScrollbarEnabled(): boolean {
  return document.documentElement.getAttribute('data-ty-scrollbar') !== 'native'
}

export class CustomScrollbar {
  private _scrollEl: HTMLElement
  private _vertical: boolean
  private _horizontal: boolean
  private _autoHideDelay: number

  readonly trackY: HTMLElement | null = null
  readonly thumbY: HTMLElement | null = null
  readonly trackX: HTMLElement | null = null
  readonly thumbX: HTMLElement | null = null

  private _isDragging = false
  private _dragAxis: 'x' | 'y' = 'y'
  private _dragStartPos = 0
  private _dragStartScroll = 0
  private _rafId: number | null = null
  private _hideTimeout: ReturnType<typeof setTimeout> | null = null
  private _resizeObserver: ResizeObserver | null = null

  private _onScroll: () => void
  private _onThumbYDown: (e: PointerEvent) => void
  private _onThumbXDown: (e: PointerEvent) => void
  private _onTrackYDown: (e: PointerEvent) => void
  private _onTrackXDown: (e: PointerEvent) => void
  private _onDragMove: (e: PointerEvent) => void
  private _onDragEnd: (e: PointerEvent) => void

  constructor(scrollEl: HTMLElement, options: CustomScrollbarOptions = {}) {
    this._scrollEl = scrollEl
    this._vertical = options.vertical !== false // default true
    this._horizontal = options.horizontal ?? false
    this._autoHideDelay = options.autoHideDelay ?? 1000

    this._onScroll = this._handleScroll.bind(this)
    this._onThumbYDown = this._handleThumbYDown.bind(this)
    this._onThumbXDown = this._handleThumbXDown.bind(this)
    this._onTrackYDown = this._handleTrackYDown.bind(this)
    this._onTrackXDown = this._handleTrackXDown.bind(this)
    this._onDragMove = this._handleDragMove.bind(this)
    this._onDragEnd = this._handleDragEnd.bind(this)

    if (this._vertical) {
      this.trackY = this._createTrack('y')
      this.thumbY = this._createThumb('y')
      this.trackY.appendChild(this.thumbY)
    }

    if (this._horizontal) {
      this.trackX = this._createTrack('x')
      this.thumbX = this._createThumb('x')
      this.trackX.appendChild(this.thumbX)
    }

    this._scrollEl.addEventListener('scroll', this._onScroll, { passive: true })

    if (this.thumbY) {
      this.thumbY.addEventListener('pointerdown', this._onThumbYDown)
    }
    if (this.trackY) {
      this.trackY.addEventListener('pointerdown', this._onTrackYDown)
    }
    if (this.thumbX) {
      this.thumbX.addEventListener('pointerdown', this._onThumbXDown)
    }
    if (this.trackX) {
      this.trackX.addEventListener('pointerdown', this._onTrackXDown)
    }

    this._resizeObserver = new ResizeObserver(() => this.update())
    this._resizeObserver.observe(this._scrollEl)

    this.update()
  }

  private _createTrack(axis: 'x' | 'y'): HTMLElement {
    const el = document.createElement('div')
    el.className = `ty-scrollbar-track-${axis}`
    return el
  }

  private _createThumb(axis: 'x' | 'y'): HTMLElement {
    const el = document.createElement('div')
    el.className = `ty-scrollbar-thumb-${axis}`
    return el
  }

  /** Force update thumb size and position */
  update(): void {
    this._updateVertical()
    this._updateHorizontal()
  }

  /** Reset scroll position */
  scrollToTop(smooth = false): void {
    this._scrollEl.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
  }

  scrollToBottom(smooth = false): void {
    this._scrollEl.scrollTo({ top: this._scrollEl.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }

  scrollToLeft(smooth = false): void {
    this._scrollEl.scrollTo({ left: 0, behavior: smooth ? 'smooth' : 'auto' })
  }

  scrollToRight(smooth = false): void {
    this._scrollEl.scrollTo({ left: this._scrollEl.scrollWidth, behavior: smooth ? 'smooth' : 'auto' })
  }

  /** Cleanup all listeners and observers */
  destroy(): void {
    this._scrollEl.removeEventListener('scroll', this._onScroll)

    if (this.thumbY) {
      this.thumbY.removeEventListener('pointerdown', this._onThumbYDown)
    }
    if (this.trackY) {
      this.trackY.removeEventListener('pointerdown', this._onTrackYDown)
    }
    if (this.thumbX) {
      this.thumbX.removeEventListener('pointerdown', this._onThumbXDown)
    }
    if (this.trackX) {
      this.trackX.removeEventListener('pointerdown', this._onTrackXDown)
    }

    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
      this._resizeObserver = null
    }

    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }

    if (this._hideTimeout !== null) {
      clearTimeout(this._hideTimeout)
      this._hideTimeout = null
    }
  }

  private _handleScroll(): void {
    if (this._rafId !== null) return

    this._rafId = requestAnimationFrame(() => {
      this._rafId = null
      this._updateThumbPositions()
      this._showScrollbars()
    })
  }

  private _updateVertical(): void {
    if (!this.trackY || !this.thumbY) return

    const { scrollHeight, clientHeight } = this._scrollEl
    const hasOverflow = scrollHeight > clientHeight + 2

    this.trackY.classList.toggle('has-overflow', hasOverflow)

    if (hasOverflow) {
      const ratio = clientHeight / scrollHeight
      this.thumbY.style.height = `${Math.max(ratio * 100, 0)}%`
    }

    this._updateThumbY()
  }

  private _updateHorizontal(): void {
    if (!this.trackX || !this.thumbX) return

    const { scrollWidth, clientWidth } = this._scrollEl
    const hasOverflow = scrollWidth > clientWidth + 2

    this.trackX.classList.toggle('has-overflow', hasOverflow)

    if (hasOverflow) {
      const ratio = clientWidth / scrollWidth
      this.thumbX.style.width = `${Math.max(ratio * 100, 0)}%`
    }

    this._updateThumbX()
  }

  private _updateThumbPositions(): void {
    this._updateThumbY()
    this._updateThumbX()
  }

  private _updateThumbY(): void {
    if (!this.trackY || !this.thumbY) return

    const { scrollTop, scrollHeight, clientHeight } = this._scrollEl
    const maxScroll = scrollHeight - clientHeight
    if (maxScroll <= 0) return

    const scrollRatio = scrollTop / maxScroll
    const trackHeight = this.trackY.clientHeight
    const thumbHeight = this.thumbY.offsetHeight
    const maxThumbTop = trackHeight - thumbHeight

    this.thumbY.style.top = `${scrollRatio * maxThumbTop}px`
  }

  private _updateThumbX(): void {
    if (!this.trackX || !this.thumbX) return

    const { scrollLeft, scrollWidth, clientWidth } = this._scrollEl
    const maxScroll = scrollWidth - clientWidth
    if (maxScroll <= 0) return

    const scrollRatio = scrollLeft / maxScroll
    const trackWidth = this.trackX.clientWidth
    const thumbWidth = this.thumbX.offsetWidth
    const maxThumbLeft = trackWidth - thumbWidth

    this.thumbX.style.left = `${scrollRatio * maxThumbLeft}px`
  }

  private _showScrollbars(): void {
    if (this._isDragging) return

    this.trackY?.classList.add('scrolling')
    this.trackX?.classList.add('scrolling')

    if (this._hideTimeout !== null) {
      clearTimeout(this._hideTimeout)
    }

    this._hideTimeout = setTimeout(() => {
      this.trackY?.classList.remove('scrolling')
      this.trackX?.classList.remove('scrolling')
      this._hideTimeout = null
    }, this._autoHideDelay)
  }

  private _handleThumbYDown(e: PointerEvent): void {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    this._isDragging = true
    this._dragAxis = 'y'
    this._dragStartPos = e.clientY
    this._dragStartScroll = this._scrollEl.scrollTop

    this.thumbY!.setPointerCapture(e.pointerId)
    this.trackY?.classList.add('dragging')

    this.thumbY!.addEventListener('pointermove', this._onDragMove)
    this.thumbY!.addEventListener('pointerup', this._onDragEnd)
    this.thumbY!.addEventListener('pointercancel', this._onDragEnd)
  }

  private _handleThumbXDown(e: PointerEvent): void {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    this._isDragging = true
    this._dragAxis = 'x'
    this._dragStartPos = e.clientX
    this._dragStartScroll = this._scrollEl.scrollLeft

    this.thumbX!.setPointerCapture(e.pointerId)
    this.trackX?.classList.add('dragging')

    this.thumbX!.addEventListener('pointermove', this._onDragMove)
    this.thumbX!.addEventListener('pointerup', this._onDragEnd)
    this.thumbX!.addEventListener('pointercancel', this._onDragEnd)
  }

  private _handleDragMove(e: PointerEvent): void {
    if (!this._isDragging) return

    if (this._dragAxis === 'y') {
      const delta = e.clientY - this._dragStartPos
      const { scrollHeight, clientHeight } = this._scrollEl
      const trackHeight = this.trackY!.clientHeight
      const thumbHeight = this.thumbY!.offsetHeight
      const maxThumbTop = trackHeight - thumbHeight
      if (maxThumbTop <= 0) return
      const scrollRatio = (scrollHeight - clientHeight) / maxThumbTop
      this._scrollEl.scrollTop = this._dragStartScroll + delta * scrollRatio
    } else {
      const delta = e.clientX - this._dragStartPos
      const { scrollWidth, clientWidth } = this._scrollEl
      const trackWidth = this.trackX!.clientWidth
      const thumbWidth = this.thumbX!.offsetWidth
      const maxThumbLeft = trackWidth - thumbWidth
      if (maxThumbLeft <= 0) return
      const scrollRatio = (scrollWidth - clientWidth) / maxThumbLeft
      this._scrollEl.scrollLeft = this._dragStartScroll + delta * scrollRatio
    }
  }

  private _handleDragEnd(e: PointerEvent): void {
    const thumb = this._dragAxis === 'y' ? this.thumbY! : this.thumbX!
    const track = this._dragAxis === 'y' ? this.trackY : this.trackX

    this._isDragging = false

    thumb.releasePointerCapture(e.pointerId)
    track?.classList.remove('dragging')

    thumb.removeEventListener('pointermove', this._onDragMove)
    thumb.removeEventListener('pointerup', this._onDragEnd)
    thumb.removeEventListener('pointercancel', this._onDragEnd)

    this._showScrollbars()
  }

  private _handleTrackYDown(e: PointerEvent): void {
    if (e.target === this.thumbY || e.button !== 0) return
    e.preventDefault()

    const trackRect = this.trackY!.getBoundingClientRect()
    const clickRatio = (e.clientY - trackRect.top) / trackRect.height
    const { scrollHeight, clientHeight } = this._scrollEl

    this._scrollEl.scrollTo({
      top: clickRatio * (scrollHeight - clientHeight),
      behavior: 'smooth'
    })
  }

  private _handleTrackXDown(e: PointerEvent): void {
    if (e.target === this.thumbX || e.button !== 0) return
    e.preventDefault()

    const trackRect = this.trackX!.getBoundingClientRect()
    const clickRatio = (e.clientX - trackRect.left) / trackRect.width
    const { scrollWidth, clientWidth } = this._scrollEl

    this._scrollEl.scrollTo({
      left: clickRatio * (scrollWidth - clientWidth),
      behavior: 'smooth'
    })
  }
}
