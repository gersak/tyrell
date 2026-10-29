/**
 * Sortable Component — reorder a container's element children, or move them
 * into another ty-sortable of the same `group`, by pointer (mouse, touch,
 * pen), keyboard, or the move() method.
 *
 * Controlled: ty-sortable never moves, inserts or removes light-DOM nodes.
 * During a drag it draws a ghost and a drop indicator in the top layer; on
 * drop it fires one `ty-sortable-change` on the destination and the app,
 * framework or server renders the new order. Until that render lands the
 * result is held on screen ("hold until morph"), so a server round trip
 * doesn't snap the item back. A render that doesn't change the order (a
 * rejected move) snaps it back.
 */

import { ensureStyles } from '../utils/styles.js'
import { upgradeProperties } from '../utils/upgrade-properties.js'
import { sortableStyles, sortableLightStyles, sortableCursorStyles } from '../styles/sortable.js'

/** Where an item is (from) or will be (to). prev/next exclude the item itself. */
export interface TySortablePos {
  list: string | null   // container id
  index: number         // from: index before the move; to: final index
  prev: string | null   // key of the item before the slot
  next: string | null   // key of the item after the slot
}

export interface TySortableValue {
  key: string | null
  group: string | null
  source: 'pointer' | 'keyboard' | 'api'
  from: TySortablePos
  to: TySortablePos
  /** Resulting key order of every list the move touches, by container id. */
  order: Record<string, (string | null)[]>
}

/** `ty-sortable-change`, on the destination list. */
export interface TySortableChangeDetail {
  value: TySortableValue
  item: HTMLElement
  fromContainer: TySortable
  toContainer: TySortable
}

/** What a drag knows before it has a destination. */
export interface TySortableDragValue {
  key: string | null
  group: string | null
  source: 'pointer' | 'keyboard' | 'api'
  from: TySortablePos
}

/** `ty-sortable-start`, on the source list. */
export interface TySortableStartDetail {
  value: TySortableDragValue
  item: HTMLElement
}

export type TySortableCancelReason = 'escape' | 'spill' | 'blocked' | 'pointercancel' | 'gone' | 'disabled' | 'blur'

/** `ty-sortable-cancel`, on the source list. */
export interface TySortableCancelDetail {
  value: TySortableDragValue
  item: HTMLElement
  reason: TySortableCancelReason
}

/**
 * accepted: rendered where it was dropped. rejected: the order didn't
 * change (preventDefault, or a request ended without a render).
 * reconciled: rendered somewhere else, or removed. unknown: nothing
 * answered before hold-timeout.
 */
export type TySortableOutcome = 'accepted' | 'rejected' | 'reconciled' | 'unknown'

/** `ty-sortable-settle`, on the destination list, when a hold ends. */
export interface TySortableSettleDetail {
  value: TySortableValue
  outcome: TySortableOutcome
}

export interface TySortableDropContext {
  item: HTMLElement
  key: string | null
  from: TySortable
  to: TySortable
  index: number
}

export interface TySortableAttributes {
  group?: string
  axis?: 'vertical' | 'horizontal'
  handle?: string
  accepts?: string
  disabled?: boolean
  'key-attr'?: string
  'hold-timeout'?: number
  label?: string
  preview?: 'line' | 'shift'
  flash?: boolean
}

/** Announcement templates: {item}, {position}, {total}, {list}. */
export interface TySortableStrings {
  pickedUp: string
  moved: string
  blocked: string
  dropped: string
  rejected: string
  reconciled: string
  removed: string
  unknown: string
  cancelled: string
  pending: string
}

const DEFAULT_STRINGS: TySortableStrings = {
  pickedUp: 'Picked up {item}. Position {position} of {total} in {list}. Arrow keys move, Space drops, Escape cancels.',
  moved: '{item}: position {position} of {total} in {list}.',
  blocked: '{list} does not accept {item}.',
  dropped: '{item} moved to position {position} of {total} in {list}.',
  rejected: 'Move not saved. {item} is back at position {position} in {list}.',
  reconciled: '{item} is now at position {position} of {total} in {list}.',
  removed: '{item} was removed.',
  unknown: 'The move of {item} may not have been saved.',
  cancelled: 'Move cancelled. {item} is back at position {position} in {list}.',
  pending: 'Saving, please wait.',
}

const TOUCH_DELAY = 250
const TOUCH_TOLERANCE = 8
const MOUSE_DISTANCE = 5
const HANDLE_TOUCH_DISTANCE = 3
const FLING_GUARD = 100
const HOLD_TIMEOUT = 5000
const BUSY_CAP = 30000
/** After a request ends, how long its render may take to land (htmx swap delays, view transitions). */
const IDLE_GRACE = 250
/** Longest wait for htmx to finish a swap after its request ended (an error response never swaps). */
const HTMX_SETTLE_CAP = 3000
const AUTOSCROLL_SPEED = 20
const AUTOSCROLL_ARM = 16

const INTERACTIVE = 'button, a[href], input, select, textarea, label, summary, [contenteditable]:not([contenteditable="false"]), [data-no-drag]'

type Legal = 'ok' | 'blocked'
/** An item's identity across renders: its key, or the node when it has none. */
type Token = string | Element

interface Press {
  pointerId: number
  pointerType: string
  item: HTMLElement
  onHandle: boolean
  startX: number
  startY: number
  timer: number
}

/** A sibling moved aside: animating from `from` to `to` px along its list's axis. */
interface Shift {
  from: number
  to: number
  vertical: boolean
  anim: Animation
}

interface Session {
  mode: 'pointer' | 'keyboard' | 'api'
  phase: 'dragging' | 'holding'
  source: TySortable
  sourceId: string | null
  item: HTMLElement
  key: string | null
  group: string | null
  fromIndex: number
  target: TySortable | null
  targetId: string | null
  slot: number
  legal: Legal
  // Pointer
  pointerId: number
  x: number
  y: number
  offsetX: number
  offsetY: number
  startX: number
  startY: number
  armed: boolean
  raf: number
  // Visuals
  layer: HTMLElement | null
  ghost: HTMLElement | null
  indicator: HTMLElement | null
  /** Siblings moved aside: element -> its offset along its list's axis, and the animation holding it there. */
  shifts: Map<HTMLElement, Shift>
  /** On the document body when the layer lives in a shadow root: carries the cursor. */
  cursorMarker: HTMLElement | null
  // Hold
  value: TySortableValue | null
  snapshot: Map<string | TySortable, Token[]> | null
  observed: WeakSet<TySortable>
  observers: MutationObserver[]
  busy: boolean
  /** The busy signal is htmx's htmx-request class. */
  htmx: boolean
  holdStart: number
  timer: number
  focus: Element | null
  resolve: ((outcome: TySortableOutcome) => void) | null
  cleanup: (() => void)[]
}

/** Connected instances — the group registry. */
const instances = new Set<TySortable>()

/** One drag or hold at a time, page-wide. */
let session: Session | null = null

/** When a keyboard action last ran: the button click that follows is not a second one. */
let keyHandledAt = 0
/** The keydown that dropped a keyboard drag: the host must not pick up again on it. */
let droppedBy: KeyboardEvent | null = null

/** A touch that stops a momentum scroll isn't a long-press. */
let lastScrollAt = 0
document.addEventListener('scroll', () => { lastScrollAt = performance.now() }, { capture: true, passive: true })

/** Roots that already have the light-DOM rules. */
const styledRoots = new WeakSet<Document | ShadowRoot>()
const lightSheet = (() => {
  let sheet: CSSStyleSheet | null = null
  return () => {
    if (!sheet) {
      sheet = new CSSStyleSheet()
      sheet.replaceSync(sortableLightStyles)
    }
    return sheet
  }
})()
/** Custom handle selectors with a rule in the shared light sheet. */
const handleRules = new Set<string>(['[data-handle]'])

function adoptLightStyles(host: TySortable): void {
  const root = host.getRootNode() as Document | ShadowRoot
  if (!('adoptedStyleSheets' in root)) return
  if (!styledRoots.has(root)) {
    styledRoots.add(root)
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, lightSheet()]
  }
  // A custom handle selector needs touch-action before the gesture, too.
  const sel = host.handleSelector
  if (handleRules.has(sel)) return
  handleRules.add(sel)
  try {
    lightSheet().insertRule(`ty-sortable ${sel} { touch-action: none; cursor: grab; -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }`)
  } catch {
    // An invalid selector: matches() fails the same way, so no handles.
  }
}

function reducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches
}

function duration(el: Element): number {
  if (reducedMotion()) return 0
  const v = getComputedStyle(el).getPropertyValue('--ty-sortable-duration').trim()
  const n = parseFloat(v)
  return Number.isFinite(n) ? (v.endsWith('ms') ? n : n * 1000) : 200
}

function cssVar(el: Element, name: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback
}

function setState(el: TySortable, name: string, on: boolean): void {
  const states = el._states
  if (!states) return
  try {
    if (on) states.add(name)
    else states.delete(name)
  } catch {
    // Older engines only accept `--name` states; state styling is optional.
  }
}

/** Parent in the flat tree: through slots into shadow roots, out to hosts. */
function flatParent(n: Element): Element | null {
  return n.assignedSlot ?? n.parentElement ?? ((n.getRootNode() as ShadowRoot).host ?? null)
}

function openDialogOf(el: Element): HTMLDialogElement | null {
  for (let n: Element | null = el; n; n = flatParent(n)) {
    if (n instanceof HTMLDialogElement && n.open) return n
  }
  return null
}

/** The topmost element at a point, inside shadow roots too. */
function deepElementFromPoint(x: number, y: number): Element | null {
  let el = document.elementFromPoint(x, y)
  const seen = new Set<Element>()
  while (el?.shadowRoot && !seen.has(el)) {
    seen.add(el)
    const inner = el.shadowRoot.elementFromPoint(x, y)
    // Slotted content comes back as itself or the host: it's already the top.
    if (!inner || seen.has(inner) || !el.shadowRoot.contains(inner)) break
    el = inner
  }
  return el
}

function members(group: string | null, self: TySortable): TySortable[] {
  if (!group) return [self]
  return [...instances].filter((i) => i.isConnected && i.group === group)
}

/** A live container by id (a morph may have replaced the original host). */
function resolveContainer(c: TySortable, id: string | null, group: string | null): TySortable | null {
  if (c.isConnected) return c
  if (!id) return null
  return [...instances].find((i) => i.isConnected && i.id === id && i.group === group) ?? null
}

function handleOf(c: TySortable, item: Element): HTMLElement | null {
  try {
    return item.querySelector<HTMLElement>(c.handleSelector)
  } catch {
    return null
  }
}

/** Visible text, without the handle, controls or hidden parts. */
function textOf(node: Node, skip: Element | null): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  if (!(node instanceof Element)) return ''
  if (node === skip || node.matches('[aria-hidden="true"], button, input, select, textarea, style, script, template')) return ''
  return Array.from(node.childNodes).map((n) => textOf(n, skip)).join(' ')
}

function itemLabel(c: TySortable, item: Element): string {
  const handle = handleOf(c, item)
  const handleName = handle?.getAttribute('aria-label')?.replace(/^move\s+/i, '')
  const label = item.getAttribute('aria-label') || item.getAttribute('data-label') || handleName || textOf(item, handle)
  const text = label.replace(/\s+/g, ' ').trim()
  return text.length > 60 ? `${text.slice(0, 57)}…` : text || 'item'
}

function listLabel(c: TySortable): string {
  return c.getAttribute('label') || c.getAttribute('aria-label') || c.id || 'list'
}

function sameTokens(a: Token[], b: Token[]): boolean {
  return a.length === b.length && a.every((t, i) => t === b[i])
}

function scrolls(v: string): boolean {
  return v === 'auto' || v === 'scroll' || v === 'overlay'
}

/** Scrollable ancestors in the flat tree, innermost first. Ends at an open dialog, else the page. */
function scrollersOf(start: Element): HTMLElement[] {
  const out: HTMLElement[] = []
  for (let el: Element | null = start; el; el = flatParent(el)) {
    if (el instanceof HTMLDialogElement && el.open) return out
    if (el === document.documentElement || el === document.body) break
    const cs = getComputedStyle(el)
    if ((scrolls(cs.overflowY) && el.scrollHeight > el.clientHeight) || (scrolls(cs.overflowX) && el.scrollWidth > el.clientWidth)) {
      out.push(el as HTMLElement)
    }
  }
  const page = document.scrollingElement as HTMLElement | null
  if (page) out.push(page)
  return out
}

function viewportRect(): { top: number; left: number; bottom: number; right: number; width: number; height: number } {
  return { top: 0, left: 0, bottom: innerHeight, right: innerWidth, width: innerWidth, height: innerHeight }
}

/** The part of a list that is on screen: its rect clipped by its scrollers. */
function visibleRect(c: TySortable): { top: number; left: number; bottom: number; right: number } | null {
  const r = c.getBoundingClientRect()
  let top = r.top, left = r.left, bottom = r.bottom, right = r.right
  const page = document.scrollingElement
  for (const s of scrollersOf(c)) {
    const sr = s === page ? viewportRect() : s.getBoundingClientRect()
    top = Math.max(top, sr.top)
    left = Math.max(left, sr.left)
    bottom = Math.min(bottom, sr.bottom)
    right = Math.min(right, sr.right)
  }
  return bottom > top && right > left ? { top, left, bottom, right } : null
}

/** One auto-scroll step toward the pointer. True if anything scrolled. */
function autoScroll(scrollers: HTMLElement[], x: number, y: number): boolean {
  const page = document.scrollingElement
  let moved = false
  for (const axis of ['y', 'x'] as const) {
    for (const el of scrollers) {
      const r = el === page ? viewportRect() : el.getBoundingClientRect()
      if (el !== page && (x < r.left || x > r.right || y < r.top || y > r.bottom)) continue
      const size = axis === 'y' ? r.height : r.width
      const zone = Math.min(Math.max(40, Math.min(size * 0.15, 100)), size * 0.25)
      const p = axis === 'y' ? y : x
      const lo = axis === 'y' ? r.top : r.left
      const hi = axis === 'y' ? r.bottom : r.right
      const pos = axis === 'y' ? el.scrollTop : el.scrollLeft
      const max = axis === 'y' ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth
      let delta = 0
      if (p < lo + zone && pos > 0) delta = -AUTOSCROLL_SPEED * ((lo + zone - p) / zone) ** 2
      else if (p > hi - zone && pos < max - 1) delta = AUTOSCROLL_SPEED * ((p - (hi - zone)) / zone) ** 2
      if (!delta) continue
      if (reducedMotion()) delta = Math.sign(delta) * AUTOSCROLL_SPEED / 2
      if (axis === 'y') el.scrollTop += delta
      else el.scrollLeft += delta
      moved = true
      break
    }
  }
  return moved
}

// A drag that ends over a link or button mustn't click it, and one that
// ends on a ty-modal backdrop mustn't close it. Armed after a pointer drag,
// until the next pointerdown or 300ms — never eats the user's next real tap.
let suppressUntil = 0
addEventListener('click', (e) => {
  if (performance.now() < suppressUntil) {
    suppressUntil = 0
    e.preventDefault()
    e.stopImmediatePropagation()
  }
}, true)
addEventListener('pointerdown', () => { suppressUntil = 0 }, true)

/** A drag cancelled with the button still down: swallow the click its release makes. */
function suppressNextRelease(pointerId: number): void {
  const done = () => {
    removeEventListener('pointerup', onUp, true)
    removeEventListener('pointerdown', done, true)
    clearTimeout(timer)
  }
  const onUp = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return
    suppressUntil = performance.now() + 300
    done()
  }
  const timer = window.setTimeout(done, 5000)
  addEventListener('pointerup', onUp, true)
  addEventListener('pointerdown', done, true)
}

export class TySortable extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['handle', 'disabled']
  }

  /** @internal */
  _states: CustomStateSet | null = null
  private _live: HTMLElement
  private _press: Press | null = null
  private _canDrop: ((ctx: TySortableDropContext) => boolean) | null = null
  private _labels: Partial<TySortableStrings> = {}
  private _childObserver: MutationObserver | null = null

  constructor() {
    super()
    try {
      this._states = this.attachInternals().states
    } catch {
      this._states = null
    }
    const root = this.attachShadow({ mode: 'open' })
    ensureStyles(root, { css: sortableStyles, id: 'ty-sortable' })
    root.innerHTML = '<slot></slot><div class="live" part="live" aria-live="assertive" aria-atomic="true"></div>'
    this._live = root.querySelector('.live')!

    this.addEventListener('pointerdown', (e) => this._onPointerDown(e))
    this.addEventListener('keydown', (e) => this._onKeyDown(e))
    this.addEventListener('keyup', (e) => this._onKeyUp(e))
    this.addEventListener('click', (e) => this._onClick(e))
    this.addEventListener('focusout', (e) => this._onFocusOut(e))
    // Images and links inside items would start the browser's own drag.
    this.addEventListener('dragstart', (e) => {
      if (this._itemFrom(e)) e.preventDefault()
    })
    // Registered before any gesture: a listener added mid-touch can't stop
    // the scroll the browser already committed to.
    this.addEventListener('touchmove', blockTouchScroll, { passive: false })
    this.addEventListener('touchstart', (e) => {
      // If a morph replaces the touched node mid-drag, its touchmoves no
      // longer bubble here — block them at the node itself.
      const t = e.target as EventTarget
      t.addEventListener('touchmove', blockTouchScroll, { passive: false })
      const done = () => {
        t.removeEventListener('touchmove', blockTouchScroll)
        t.removeEventListener('touchend', done)
        t.removeEventListener('touchcancel', done)
      }
      t.addEventListener('touchend', done)
      t.addEventListener('touchcancel', done)
    }, { passive: true })
  }

  // --- Properties ------------------------------------------------------------

  get group(): string | null {
    return this.getAttribute('group')
  }
  set group(v: string | null) {
    if (v == null) this.removeAttribute('group')
    else this.setAttribute('group', v)
  }

  get axis(): 'vertical' | 'horizontal' {
    return this.getAttribute('axis') === 'horizontal' ? 'horizontal' : 'vertical'
  }
  set axis(v: 'vertical' | 'horizontal') {
    this.setAttribute('axis', v)
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled')
  }
  set disabled(v: boolean) {
    this.toggleAttribute('disabled', !!v && String(v) !== 'false')
  }

  /** 'line' (default): a drop line marks the slot. 'shift': siblings move aside while dragging. */
  get preview(): 'line' | 'shift' {
    return this.getAttribute('preview') === 'shift' ? 'shift' : 'line'
  }
  set preview(v: 'line' | 'shift') {
    this.setAttribute('preview', v === 'shift' ? 'shift' : 'line')
  }

  /** Outline the item briefly where it lands. */
  get flash(): boolean {
    return this.hasAttribute('flash')
  }
  set flash(v: boolean) {
    this.toggleAttribute('flash', !!v && String(v) !== 'false')
  }

  get handleSelector(): string {
    return this.getAttribute('handle') || '[data-handle]'
  }

  get accepts(): string | null {
    return this.getAttribute('accepts')
  }
  set accepts(v: string | null) {
    if (v == null) this.removeAttribute('accepts')
    else this.setAttribute('accepts', v)
  }

  get holdTimeout(): number {
    const n = parseInt(this.getAttribute('hold-timeout') ?? '', 10)
    return Number.isFinite(n) && n >= 0 ? n : HOLD_TIMEOUT
  }

  /** Extra drop rule, per candidate slot: return false to block it. */
  get canDrop(): ((ctx: TySortableDropContext) => boolean) | null {
    return this._canDrop
  }
  set canDrop(fn: ((ctx: TySortableDropContext) => boolean) | null) {
    this._canDrop = typeof fn === 'function' ? fn : null
  }

  /** Announcement overrides (i18n). */
  get labels(): Partial<TySortableStrings> {
    return this._labels
  }
  set labels(v: Partial<TySortableStrings>) {
    this._labels = v && typeof v === 'object' ? v : {}
  }

  /** The items, in order: element children except <template> and [data-sortable-ignore]. */
  get items(): HTMLElement[] {
    return Array.from(this.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement && !(c instanceof HTMLTemplateElement) && !c.hasAttribute('data-sortable-ignore'),
    )
  }

  /** An item's key: the `key-attr` attribute, else data-key, else id. */
  keyOf(item: Element): string | null {
    const attr = this.getAttribute('key-attr')
    return (attr && item.getAttribute(attr)) || item.getAttribute('data-key') || item.id || null
  }

  // --- Lifecycle -------------------------------------------------------------

  connectedCallback(): void {
    upgradeProperties(this)
    instances.add(this)
    adoptLightStyles(this)
    this._syncStructure()
    this._childObserver = new MutationObserver(() => this._onChildren())
    this._childObserver.observe(this, { childList: true })
    // A morph replaced a host taking part in a hold: watch the new one, it
    // may already have the result.
    const s = session
    if (s?.phase === 'holding' && this.group === s.group && (s.group || this.id === s.sourceId || this.id === s.targetId)) {
      observeForHold(s, this)
      queueMicrotask(() => evaluateHold('mutation'))
    }
  }

  disconnectedCallback(): void {
    instances.delete(this)
    this._childObserver?.disconnect()
    this._childObserver = null
    this._endPress()
    // A keyboard drag whose list is gone: check once the morph has landed.
    if (session?.mode === 'keyboard' && session.phase === 'dragging') queueMicrotask(checkKeyboard)
  }

  /** Moved with moveBefore() (Datastar morphs): stay as we are. */
  connectedMoveCallback(): void {}

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    if (name === 'handle') {
      adoptLightStyles(this)
      this._syncStructure()
    } else if (name === 'disabled' && newValue !== null && session?.phase === 'dragging' && session.source === this) {
      cancelDrag('disabled')
    }
  }

  private _onChildren(): void {
    this._syncStructure()
    if (session?.mode === 'keyboard' && session.phase === 'dragging') checkKeyboard()
  }

  private _syncStructure(): void {
    const items = this.items
    setState(this, 'empty', items.length === 0)
    setState(this, 'handles', items.some((i) => handleOf(this, i)))
  }

  // --- Public API ------------------------------------------------------------

  /**
   * Move an item without dragging — for "Move to…" menus and other
   * single-pointer alternatives. Fires the same `ty-sortable-change` (with
   * `source: 'api'`) and holds the result until the app renders it.
   */
  move(itemOrKey: HTMLElement | string, opts: { to?: TySortable | string; index?: number; before?: string; after?: string } = {}): Promise<TySortableOutcome> {
    if (session) return Promise.reject(new Error('ty-sortable: a move is still pending'))
    const item = typeof itemOrKey === 'string' ? this.items.find((i) => this.keyOf(i) === itemOrKey) : itemOrKey
    if (!item || item.parentElement !== this) return Promise.reject(new Error('ty-sortable: no such item'))
    const target = typeof opts.to === 'string'
      ? members(this.group, this).find((m) => m.id === opts.to)
      : opts.to ?? this
    if (!target || (target !== this && (!this.group || target.group !== this.group))) {
      return Promise.reject(new Error('ty-sortable: no such list in this group'))
    }
    const s = newSession('api', this, item)
    const others = target.items.filter((i) => i !== item)
    let slot = others.length
    if (opts.before != null) slot = others.findIndex((i) => target.keyOf(i) === opts.before)
    else if (opts.after != null) {
      const i = others.findIndex((o) => target.keyOf(o) === opts.after)
      slot = i < 0 ? -1 : i + 1
    } else if (opts.index != null) slot = Math.max(0, Math.min(opts.index, others.length))
    if (slot < 0) return Promise.reject(new Error('ty-sortable: no such neighbour'))
    setTargetOf(s, target)
    s.slot = clampLocked(target, item, slot)
    s.legal = legality(s, target, s.slot)
    if (s.legal !== 'ok') return Promise.reject(new Error('ty-sortable: drop not allowed'))
    session = s
    return new Promise((resolve) => {
      s.resolve = resolve
      if (!commit()) resolve('accepted')
    })
  }

  /** End a pending hold: 'accepted' or 'rejected', or re-check the DOM. */
  settle(outcome?: 'accepted' | 'rejected'): void {
    if (session?.phase !== 'holding') return
    if (outcome) release(outcome)
    else evaluateHold('settle')
  }

  // --- Announcements ---------------------------------------------------------

  /** @internal */
  _announce(name: keyof TySortableStrings, vars: Record<string, string | number> = {}): void {
    const tpl = this._labels[name] ?? DEFAULT_STRINGS[name]
    const text = tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
    // Re-set even when unchanged, so the same message is read again.
    this._live.textContent = ''
    requestAnimationFrame(() => { this._live.textContent = text })
  }

  // --- Pointer ---------------------------------------------------------------

  /** @internal The item an event happened in: a direct child that is an item. */
  _itemFrom(e: Event): HTMLElement | null {
    for (const n of e.composedPath()) {
      if (n === this) return null
      if (n instanceof HTMLElement && n.parentElement === this) return this.items.includes(n) ? n : null
    }
    return null
  }

  /** The grip an event started on, or null when it isn't one. */
  private _gripFrom(e: Event): { item: HTMLElement; onHandle: boolean; handle: HTMLElement | null } | null {
    if (this.disabled) return null
    const item = this._itemFrom(e)
    if (!item || item.hasAttribute('data-locked')) return null
    const origin = e.composedPath()[0]
    if (!(origin instanceof Element)) return null
    const hasHandle = !!handleOf(this, item)
    let handle: HTMLElement | null = null
    try {
      handle = origin.closest<HTMLElement>(this.handleSelector)
    } catch {
      handle = null
    }
    if (handle && !item.contains(handle)) handle = null
    if (hasHandle) return handle ? { item, onHandle: true, handle } : null
    // Controls inside the item keep working: they don't start a drag.
    const control = origin.closest(INTERACTIVE)
    if (control && item.contains(control) && control !== item) return null
    return { item, onHandle: false, handle: null }
  }

  private _onPointerDown(e: PointerEvent): void {
    if (session || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0) || this._press) return
    const grip = this._gripFrom(e)
    if (!grip) return
    const touchLike = e.pointerType !== 'mouse'
    // A finger that just stopped a fling is catching the page, not an item.
    if (touchLike && !grip.onHandle && performance.now() - lastScrollAt < FLING_GUARD) return
    const press: Press = {
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      item: grip.item,
      onHandle: grip.onHandle,
      startX: e.clientX,
      startY: e.clientY,
      timer: 0,
    }
    this._press = press
    // Mouse on a handle: no text selection while it moves.
    if (!touchLike && grip.onHandle) e.preventDefault()
    if (touchLike && !grip.onHandle) {
      press.timer = window.setTimeout(() => {
        if (this._press === press) this._activate(press, press.startX, press.startY)
      }, TOUCH_DELAY)
    }
    addEventListener('pointermove', this._onPressMove, true)
    addEventListener('pointerup', this._onPressEnd, true)
    addEventListener('pointercancel', this._onPressEnd, true)
    if (touchLike) addEventListener('contextmenu', preventDefault, true)
  }

  private _onPressMove = (e: PointerEvent): void => {
    const press = this._press
    if (!press || e.pointerId !== press.pointerId) return
    const d = Math.hypot(e.clientX - press.startX, e.clientY - press.startY)
    if (press.pointerType === 'mouse') {
      if (d >= MOUSE_DISTANCE) this._activate(press, e.clientX, e.clientY)
    } else if (press.onHandle) {
      if (d >= HANDLE_TOUCH_DISTANCE) this._activate(press, e.clientX, e.clientY)
    } else if (d > TOUCH_TOLERANCE) {
      // Moved before the long-press: the finger is scrolling.
      this._endPress()
    }
  }

  private _onPressEnd = (e: PointerEvent): void => {
    if (this._press && e.pointerId === this._press.pointerId) this._endPress()
  }

  private _endPress(): void {
    const press = this._press
    if (!press) return
    clearTimeout(press.timer)
    this._press = null
    removeEventListener('pointermove', this._onPressMove, true)
    removeEventListener('pointerup', this._onPressEnd, true)
    removeEventListener('pointercancel', this._onPressEnd, true)
    if (session?.mode !== 'pointer') removeEventListener('contextmenu', preventDefault, true)
  }

  private _activate(press: Press, x: number, y: number): void {
    const item = press.item
    const touchLike = press.pointerType !== 'mouse'
    this._endPress()
    if (session || !item.isConnected || item.parentElement !== this) return
    const s = newSession('pointer', this, item)
    const rect = item.getBoundingClientRect()
    s.pointerId = press.pointerId
    s.x = x
    s.y = y
    s.startX = x
    s.startY = y
    s.offsetX = press.startX - rect.left
    s.offsetY = press.startY - rect.top
    session = s

    // The virtual keyboard closes before anything is measured.
    const active = document.activeElement as HTMLElement | null
    if (active && item.contains(active) && active.matches('input, textarea, select, [contenteditable]')) active.blur()
    getSelection()?.removeAllRanges()

    createLayer(s, rect)
    markSource(s, 'dim')
    setState(this, 'dragging', true)
    addEventListener('pointermove', onDragMove, true)
    addEventListener('pointerup', onDragEnd, true)
    addEventListener('pointercancel', onDragCancel, true)
    addEventListener('pointerdown', onSecondPointer, true)
    addEventListener('selectstart', preventDefault, true)
    addEventListener('keydown', onDragKey, true)
    addEventListener('blur', onWindowBlur)
    document.addEventListener('visibilitychange', onWindowBlur)
    screen.orientation?.addEventListener('change', onWindowBlur)
    if (touchLike) addEventListener('contextmenu', preventDefault, true)
    s.cleanup.push(() => {
      removeEventListener('pointermove', onDragMove, true)
      removeEventListener('pointerup', onDragEnd, true)
      removeEventListener('pointercancel', onDragCancel, true)
      removeEventListener('pointerdown', onSecondPointer, true)
      removeEventListener('selectstart', preventDefault, true)
      removeEventListener('keydown', onDragKey, true)
      removeEventListener('blur', onWindowBlur)
      document.removeEventListener('visibilitychange', onWindowBlur)
      screen.orientation?.removeEventListener('change', onWindowBlur)
      removeEventListener('contextmenu', preventDefault, true)
    })
    dispatchStart(s)
    s.raf = requestAnimationFrame(frame)
  }

  // --- Keyboard --------------------------------------------------------------

  private _onKeyDown(e: KeyboardEvent): void {
    // A keyboard drag takes its keys at the window (see onKeyboardKey).
    if (session?.mode === 'keyboard' && session.phase === 'dragging') return
    if (e.key !== ' ' && e.key !== 'Enter') return
    // Auto-repeat, or the very key that just dropped (see keyboardMove).
    if (e.repeat || e === droppedBy) return
    const grip = this._gripFrom(e)
    if (!grip) return
    // Only the grip itself: Space in a text field inside the item types.
    const origin = e.composedPath()[0] as Element
    if (!grip.onHandle && origin !== grip.item) return
    e.preventDefault()
    keyHandledAt = performance.now()
    const s = session
    if (s) {
      if (s.phase === 'holding') this._announce('pending')
      return
    }
    startKeyboard(this, grip.item)
  }

  private _onKeyUp(e: KeyboardEvent): void {
    // Space activates a button on keyup; the keydown already acted.
    if (e.key === ' ' && performance.now() - keyHandledAt < 1000) e.preventDefault()
  }

  /**
   * Screen readers in browse mode send a click, not keys: a keyboard-made
   * click (detail 0) on a handle picks up or drops.
   */
  private _onClick(e: MouseEvent): void {
    if (e.detail !== 0 || performance.now() - keyHandledAt < 1000) return
    const grip = this._gripFrom(e)
    if (!grip?.onHandle) return
    e.preventDefault()
    const s = session
    if (s?.mode === 'keyboard' && s.phase === 'dragging' && s.item === grip.item) {
      dropKeyboard(s)
    } else if (!s) {
      // Keys and focus loss can only end the drag if focus is on the grip.
      grip.handle?.focus({ preventScroll: true })
      startKeyboard(this, grip.item)
    } else if (s.phase === 'holding') {
      this._announce('pending')
    }
  }

  private _onFocusOut(e: FocusEvent): void {
    const s = session
    if (!s || s.mode !== 'keyboard' || s.phase !== 'dragging' || s.source !== this) return
    const to = e.relatedTarget as Node | null
    if (to && s.item.contains(to)) return
    if (to) {
      cancelDrag('blur')
      return
    }
    // Focus went nowhere: the user clicked away, or a re-render removed the
    // focused node (Chrome fires focusout for that). Decide once it's done.
    queueMicrotask(() => {
      if (session !== s || s.phase !== 'dragging') return
      if (s.item.isConnected && s.source.isConnected) cancelDrag('blur')
      else checkKeyboard()
    })
  }
}

// --- Session ------------------------------------------------------------------

function newSession(mode: Session['mode'], source: TySortable, item: HTMLElement): Session {
  return {
    mode,
    phase: 'dragging',
    source,
    sourceId: source.id || null,
    item,
    key: source.keyOf(item),
    group: source.group,
    fromIndex: source.items.indexOf(item),
    target: null,
    targetId: null,
    slot: -1,
    legal: 'ok',
    pointerId: -1,
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
    armed: false,
    raf: 0,
    layer: null,
    ghost: null,
    indicator: null,
    shifts: new Map(),
    cursorMarker: null,
    value: null,
    snapshot: null,
    observed: new WeakSet(),
    observers: [],
    busy: false,
    htmx: false,
    holdStart: 0,
    timer: 0,
    focus: null,
    resolve: null,
    cleanup: [],
  }
}

function setTargetOf(s: Session, c: TySortable | null): void {
  s.target = c
  s.targetId = c?.id || null
}

function preventDefault(e: Event): void {
  e.preventDefault()
}

function blockTouchScroll(e: Event): void {
  if (session?.mode === 'pointer' && session.phase === 'dragging' && e.cancelable) e.preventDefault()
}

function onWindowBlur(): void {
  if (session?.phase === 'dragging') cancelDrag('pointercancel')
}

/** A second finger, anywhere: the gesture is no longer a drag. */
function onSecondPointer(e: PointerEvent): void {
  if (session?.mode === 'pointer' && session.phase === 'dragging' && e.pointerId !== session.pointerId) cancelDrag('pointercancel')
}

function dragValue(s: Session): TySortableDragValue {
  return { key: s.key, group: s.group, source: s.mode, from: fromPos(s) }
}

function dispatchStart(s: Session): void {
  s.source.dispatchEvent(new CustomEvent<TySortableStartDetail>('ty-sortable-start', {
    detail: { value: dragValue(s), item: s.item },
  }))
}

function fromPos(s: Session): TySortablePos {
  const items = s.source.items
  const i = items.indexOf(s.item)
  const index = i >= 0 ? i : s.fromIndex
  return {
    list: s.sourceId,
    index,
    prev: items[index - 1] ? s.source.keyOf(items[index - 1]) : null,
    next: items[index + 1] ? s.source.keyOf(items[index + 1]) : null,
  }
}

/** The other items of a list, without the dragged one. */
function othersIn(c: TySortable, item: HTMLElement): HTMLElement[] {
  return c.items.filter((i) => i !== item)
}

/** Leading and trailing runs of locked items are anchors: no slot outside them. */
function clampLocked(c: TySortable, item: HTMLElement, slot: number): number {
  const others = othersIn(c, item)
  let lead = 0
  while (lead < others.length && others[lead].hasAttribute('data-locked')) lead++
  let trail = others.length
  while (trail > lead && others[trail - 1].hasAttribute('data-locked')) trail--
  return Math.max(lead, Math.min(slot, trail))
}

function legality(s: Session, c: TySortable, slot: number): Legal {
  if (c !== s.source) {
    if (c.disabled) return 'blocked'
    const accepts = c.accepts
    if (accepts) {
      try {
        if (!s.item.matches(accepts)) return 'blocked'
      } catch {
        return 'blocked'
      }
    }
  }
  const fn = c.canDrop
  if (fn && !fn({ item: s.item, key: s.key, from: s.source, to: c, index: slot })) return 'blocked'
  return 'ok'
}

/** Morphs may replace the source, the target or the item mid-drag. */
function revalidate(s: Session): boolean {
  const source = resolveContainer(s.source, s.sourceId, s.group)
  if (!source) return false
  s.source = source
  let moved = false
  if (!s.item.isConnected || s.item.parentElement !== source) {
    const again = s.key ? source.items.find((i) => source.keyOf(i) === s.key) : null
    if (!again) return false
    s.item = again
    moved = true
  }
  if (s.target && !s.target.isConnected) {
    setTargetOf(s, resolveContainer(s.target, s.targetId, s.group))
    moved = true
  }
  // Shifted nodes a re-render replaced: forget them, shift their successors.
  for (const [el, sh] of s.shifts) {
    if (el.isConnected) continue
    sh.anim.cancel()
    s.shifts.delete(el)
    moved = true
  }
  if (s.layer && !s.layer.isConnected) {
    // A body-level morph took the layer: put it back.
    s.layer = null
    createLayer(s, s.ghost ? s.ghost.getBoundingClientRect() : s.item.getBoundingClientRect())
  }
  if (moved && s.phase === 'dragging') {
    if (s.shifts.size || shiftPreview(s)) previewShifts(s)
    else markSource(s, 'dim')
  }
  return true
}

// --- Pointer drag ---------------------------------------------------------------

function onDragMove(e: PointerEvent): void {
  const s = session
  if (!s || s.phase !== 'dragging' || e.pointerId !== s.pointerId) return
  s.x = e.clientX
  s.y = e.clientY
  if (!s.armed && Math.hypot(s.x - s.startX, s.y - s.startY) >= AUTOSCROLL_ARM) s.armed = true
}

function onDragEnd(e: PointerEvent): void {
  const s = session
  if (!s || s.phase !== 'dragging' || e.pointerId !== s.pointerId) return
  s.x = e.clientX
  s.y = e.clientY
  hitTest(s)
  suppressUntil = performance.now() + 300
  if (!s.target) cancelDrag('spill')
  else if (s.legal !== 'ok') cancelDrag('blocked')
  else commit()
}

function onDragCancel(e: PointerEvent): void {
  if (session?.phase === 'dragging' && e.pointerId === session.pointerId) cancelDrag('pointercancel')
}

function onDragKey(e: KeyboardEvent): void {
  if (e.key === 'Escape' && session?.phase === 'dragging' && session.mode === 'pointer') {
    e.preventDefault()
    e.stopPropagation()
    cancelDrag('escape')
  }
}

function frame(): void {
  const s = session
  if (!s || s.phase !== 'dragging' || s.mode !== 'pointer') return
  if (!revalidate(s)) {
    cancelDrag('gone')
    return
  }
  if (s.armed) autoScroll(scrollersOf(s.target ?? s.source), s.x, s.y)
  hitTest(s)
  if (s.ghost) s.ghost.style.translate = `${s.x - s.offsetX}px ${s.y - s.offsetY}px`
  s.raf = requestAnimationFrame(frame)
}

/** The group's ty-sortable under the point, and the slot in it. */
function hitTest(s: Session): void {
  let target: TySortable | null = null
  const group = members(s.group, s.source)
  // Only the topmost element counts: a header or panel over a list is not the list.
  const top = deepElementFromPoint(s.x, s.y)
  for (let el: Element | null = top; el; el = flatParent(el)) {
    if (el instanceof TySortable && group.includes(el)) {
      target = el
      break
    }
  }
  if (!target) {
    // Near a list (an empty column, the gap under the last card) counts —
    // only its visible part, and only lists in the open dialog, if any.
    const dialog = top ? openDialogOf(top) : null
    target = group.find((c) => {
      if (dialog && openDialogOf(c) !== dialog) return false
      const r = visibleRect(c)
      return !!r && s.x >= r.left - 12 && s.x <= r.right + 12 && s.y >= r.top - 12 && s.y <= r.bottom + 12
    }) ?? null
  }
  if (!target) {
    setTarget(s, null, -1, 'ok')
    return
  }
  const others = othersIn(target, s.item)
  const vertical = target.axis === 'vertical'
  let slot = others.length
  for (let i = 0; i < others.length; i++) {
    // Where the item sits in the layout, not where a shift moved it: slots
    // mustn't flip back and forth as siblings make room.
    const r = baseRect(others[i])
    if (vertical ? s.y < r.top + r.height / 2 : s.x < r.left + r.width / 2) {
      slot = i
      break
    }
  }
  slot = clampLocked(target, s.item, slot)
  setTarget(s, target, slot, legality(s, target, slot))
}

function setTarget(s: Session, target: TySortable | null, slot: number, legal: Legal): void {
  const changed = target !== s.target || slot !== s.slot || legal !== s.legal
  if (s.target && s.target !== target) {
    setState(s.target, 'over', false)
    setState(s.target, 'blocked', false)
  }
  setTargetOf(s, target)
  s.slot = slot
  s.legal = legal
  if (target) {
    setState(target, 'over', legal === 'ok')
    setState(target, 'blocked', legal === 'blocked')
  }
  if (changed) previewShifts(s)
  if (s.mode === 'pointer') setCursor(s, legal === 'blocked' ? 'blocked' : 'grabbing')
  paintIndicator(s)
  if (changed && s.mode === 'keyboard' && target) {
    const total = othersIn(target, s.item).length + 1
    const vars = { item: itemLabel(s.source, s.item), position: slot + 1, total, list: listLabel(target) }
    s.source._announce(legal === 'ok' ? 'moved' : 'blocked', vars)
  }
}

// --- Visuals ----------------------------------------------------------------------

const LAYER_VARS = [
  '--ty-sortable-indicator-color',
  '--ty-sortable-blocked-color',
  '--ty-sortable-ghost-shadow',
  '--ty-sortable-ghost-scale',
  '--ty-sortable-ghost-rotate',
  '--ty-sortable-duration',
]

function createLayer(s: Session, rect: DOMRect): void {
  const layer = document.createElement('div')
  layer.setAttribute('popover', 'manual')
  layer.setAttribute('data-ty-sortable-layer', '')
  layer.style.cssText = 'position:fixed;inset:0;margin:0;padding:0;border:0;background:transparent;overflow:visible;pointer-events:none;width:auto;height:auto;max-width:none;max-height:none;color:inherit'
  // The layer sits outside the list: carry the list's custom properties over,
  // so page CSS for [data-ty-sortable-ghost] can use them.
  const cs = getComputedStyle(s.source)
  for (const name of LAYER_VARS) {
    const v = cs.getPropertyValue(name).trim()
    if (v) layer.style.setProperty(name, v)
  }
  // In the item's own root, so the item's styles still apply to the ghost.
  const root = s.item.getRootNode()
  ;(root instanceof ShadowRoot ? root : document.body).appendChild(layer)
  try {
    layer.showPopover()
  } catch {
    layer.style.zIndex = '2147483647'
  }

  const indicator = document.createElement('div')
  indicator.style.cssText = 'position:absolute;left:0;top:0;display:none;border-radius:999px;pointer-events:none'
  layer.appendChild(indicator)

  s.layer = layer
  s.indicator = indicator
  if (s.mode === 'pointer') setCursor(s, 'grabbing')
  if (s.mode === 'pointer') {
    addGhost(s, rect)
    lift(s)
  }
}

/**
 * The page cursor while a mouse drags. The rule lives in a document sheet
 * and keys on a marker under <body>: the layer itself, or a stand-in when
 * the layer is inside a shadow root.
 */
function setCursor(s: Session, cursor: 'grabbing' | 'blocked' | null): void {
  adoptCursorSheet()
  let marker = s.layer?.parentElement === document.body ? s.layer : s.cursorMarker
  if (!marker && cursor) {
    marker = document.createElement('div')
    marker.setAttribute('data-ty-sortable-layer', '')
    marker.hidden = true
    document.body.appendChild(marker)
    s.cursorMarker = marker
  }
  if (!marker) return
  if (cursor) marker.setAttribute('data-cursor', cursor)
  else marker.removeAttribute('data-cursor')
}

let cursorSheet: CSSStyleSheet | null = null
function adoptCursorSheet(): void {
  if (cursorSheet) return
  cursorSheet = new CSSStyleSheet()
  cursorSheet.replaceSync(sortableCursorStyles)
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, cursorSheet]
}

function addGhost(s: Session, rect: DOMRect): void {
  const ghost = makeGhost(s.item, rect)
  ghost.style.translate = `${rect.left}px ${rect.top}px`
  s.layer!.appendChild(ghost)
  s.ghost = ghost
}

function makeGhost(item: HTMLElement, rect: DOMRect): HTMLElement {
  const ghost = item.cloneNode(true) as HTMLElement
  ghost.removeAttribute('id')
  ghost.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'))
  ghost.inert = true
  ghost.setAttribute('aria-hidden', 'true')
  ghost.setAttribute('data-ty-sortable-ghost', '')
  const from = item.querySelectorAll('input, textarea, select')
  ghost.querySelectorAll('input, textarea, select').forEach((n, i) => {
    const src = from[i] as HTMLInputElement | undefined
    if (src) (n as HTMLInputElement).value = src.value
  })
  // Geometry inline; the look (shadow, opacity) comes from the light sheet,
  // where page CSS can override it.
  const cs = getComputedStyle(item)
  ghost.style.cssText += `;position:absolute;left:0;top:0;margin:0;box-sizing:border-box;width:${rect.width}px;height:${rect.height}px;pointer-events:none;will-change:translate;transform:none;transform-origin:${Math.min(rect.width / 2, 40)}px 50%;color:${cs.color};font:${cs.font}`
  return ghost
}

/** The ghost rises off the list: scale and tilt from --ty-sortable-ghost-scale / -rotate. */
function lift(s: Session): void {
  const ghost = s.ghost
  if (!ghost) return
  const scale = cssVar(s.source, '--ty-sortable-ghost-scale', '1.02')
  const rotate = cssVar(s.source, '--ty-sortable-ghost-rotate', '0deg')
  ghost.animate(
    [{ scale: '1', rotate: '0deg' }, { scale, rotate }],
    { duration: reducedMotion() ? 0 : 150, easing: 'cubic-bezier(.2, 0, 0, 1)', fill: 'forwards' },
  )
}

/** The ghost settles back down to list size, moving to a point. */
function settleGhost(ghost: HTMLElement, x: number, y: number, ms: number): void {
  for (const a of ghost.getAnimations()) {
    a.commitStyles?.()
    a.cancel()
  }
  ghost.style.transition = ms ? `translate ${ms}ms ease, scale ${ms}ms ease, rotate ${ms}ms ease` : ''
  ghost.getBoundingClientRect() // start the transition from where it is
  ghost.style.translate = `${x}px ${y}px`
  ghost.style.scale = '1'
  ghost.style.rotate = '0deg'
}

/**
 * The item at its new place (same list) or out of the way (another list),
 * and the item's original place: dimmed by default, styled by
 * --ty-sortable-source-opacity and --ty-sortable-source-outline.
 * Shadow-side rule: no light-DOM writes.
 */
function markSource(s: Session, how: 'dim' | 'hide' | false): void {
  const host = s.source
  const root = host.shadowRoot!
  let sheet = sourceSheets.get(host)
  if (!sheet) {
    sheet = new CSSStyleSheet()
    sourceSheets.set(host, sheet)
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
  }
  if (!how) {
    sheet.replaceSync('')
    return
  }
  const attr = host.getAttribute('key-attr')
  let sel: string
  if (s.key && attr && s.item.getAttribute(attr) === s.key) sel = `[${CSS.escape(attr)}="${CSS.escape(s.key)}"]`
  else if (s.key && s.item.getAttribute('data-key') === s.key) sel = `[data-key="${CSS.escape(s.key)}"]`
  else if (s.key && s.item.id === s.key) sel = `#${CSS.escape(s.key)}`
  else sel = `:nth-child(${Array.from(host.children).indexOf(s.item) + 1})`
  sheet.replaceSync(how === 'hide'
    ? `::slotted(${sel}) { opacity: 0 !important; }`
    : `::slotted(${sel}) { opacity: var(--ty-sortable-source-opacity) !important; outline: var(--ty-sortable-source-outline); outline-offset: -2px; }`)
}
const sourceSheets = new WeakMap<TySortable, CSSStyleSheet>()

/** Where a shift has an element right now (mid-animation included). */
function shiftOffset(sh: Shift | undefined): number {
  if (!sh) return 0
  const p = sh.anim.effect?.getComputedTiming().progress
  return p == null ? sh.to : sh.from + (sh.to - sh.from) * p
}

/** An element's rect without the offset our shift put on it (its own transforms stay). */
function baseRect(el: Element, s: Session | null = session): { top: number; left: number; bottom: number; right: number; width: number; height: number } {
  const r = el.getBoundingClientRect()
  const sh = s?.shifts.get(el as HTMLElement)
  const d = shiftOffset(sh)
  if (!d) return r
  const dx = sh!.vertical ? 0 : d
  const dy = sh!.vertical ? d : 0
  return { top: r.top - dy, left: r.left - dx, bottom: r.bottom - dy, right: r.right - dx, width: r.width, height: r.height }
}

/** The space between two neighbouring items of a list (the dragged item counts: it stays in layout). */
function gapOf(c: TySortable): number {
  const items = c.items
  if (items.length < 2) return 0
  const a = baseRect(items[0])
  const b = baseRect(items[1])
  return Math.max(0, c.axis === 'vertical' ? b.top - a.bottom : b.left - a.right)
}

/**
 * The gap a list will have: measured between two of its items, else the
 * source's, else what CSS says (flex/grid gap, or the item's margin).
 */
function listGap(s: Session, c: TySortable): number {
  if (c.items.length > 1) return gapOf(c)
  if (s.source.items.length > 1) return gapOf(s.source)
  const vertical = c.axis === 'vertical'
  const cs = getComputedStyle(c)
  const gap = parseFloat(vertical ? cs.rowGap : cs.columnGap)
  if (gap > 0) return gap
  const ms = getComputedStyle(s.item)
  return Math.max(0, parseFloat(vertical ? ms.marginBottom : ms.marginRight) || 0, parseFloat(vertical ? ms.marginTop : ms.marginLeft) || 0)
}

/** Element children that take part in layout shifts: items and ignored ones (headers, footers). */
function flowKids(c: TySortable): HTMLElement[] {
  return Array.from(c.children).filter((k): k is HTMLElement => k instanceof HTMLElement && !(k instanceof HTMLTemplateElement))
}

/** The gap a slot stands for, in viewport coordinates. */
function slotGeometry(c: TySortable, item: HTMLElement, slot: number): { x: number; y: number; length: number; empty: boolean } {
  const others = othersIn(c, item)
  const vertical = c.axis === 'vertical'
  const prev = others[slot - 1] ? baseRect(others[slot - 1]) : null
  const next = others[slot] ? baseRect(others[slot]) : null
  if (!prev && !next) {
    const r = c.getBoundingClientRect()
    const cs = getComputedStyle(c)
    return { x: r.left + parseFloat(cs.paddingLeft), y: r.top + parseFloat(cs.paddingTop), length: vertical ? r.width : r.height, empty: true }
  }
  // Half the usual gap between items, for an edge slot.
  const gap = gapOf(c) || 4
  const ref = (next ?? prev)!
  if (vertical) {
    const y = prev && next ? (prev.bottom + next.top) / 2 : next ? next.top - gap / 2 : prev!.bottom + gap / 2
    return { x: ref.left, y, length: ref.width, empty: false }
  }
  const x = prev && next ? (prev.right + next.left) / 2 : next ? next.left - gap / 2 : prev!.right + gap / 2
  return { x, y: ref.top, length: ref.height, empty: false }
}

/** Where the item will sit in another list: the start of the gap opened at the slot. */
function gapOrigin(s: Session, t: TySortable): { x: number; y: number } {
  const others = othersIn(t, s.item)
  const next = others[s.slot] ? baseRect(others[s.slot]) : null
  const prev = others[s.slot - 1] ? baseRect(others[s.slot - 1]) : null
  const g = slotGeometry(t, s.item, s.slot)
  if (g.empty) return { x: g.x, y: g.y }
  const gap = listGap(s, t)
  if (t.axis === 'vertical') return { x: (next ?? prev)!.left, y: next ? next.top : prev!.bottom + gap }
  return { x: next ? next.left : prev!.right + gap, y: (next ?? prev)!.top }
}

/** The list under the pointer decides (the source, when over none). */
function shiftPreview(s: Session): boolean {
  return (s.target ?? s.source).getAttribute('preview') === 'shift'
}

function paintIndicator(s: Session): void {
  const ind = s.indicator
  if (!ind) return
  const c = s.target
  if (!c || s.slot < 0 || s.phase !== 'dragging') {
    ind.style.display = 'none'
    return
  }
  // With the shift preview the opened gap (and the placeholder or ghost in
  // it) shows the slot. A refused slot still gets the red line.
  if (shiftPreview(s) && s.legal === 'ok') {
    ind.style.display = 'none'
    return
  }
  const g = slotGeometry(c, s.item, s.slot)
  if (g.empty) {
    ind.style.display = 'none'
    return
  }
  const size = parseFloat(cssVar(c, '--ty-sortable-indicator-size', '2px')) || 2
  const color = s.legal === 'ok'
    ? cssVar(c, '--ty-sortable-indicator-color', '#3b82f6')
    : cssVar(c, '--ty-sortable-blocked-color', '#ef4444')
  const vertical = c.axis === 'vertical'
  ind.style.display = 'block'
  ind.style.background = color
  ind.style.width = vertical ? `${g.length}px` : `${size}px`
  ind.style.height = vertical ? `${size}px` : `${g.length}px`
  ind.style.transform = vertical
    ? `translate3d(${g.x}px, ${g.y - size / 2}px, 0)`
    : `translate3d(${g.x - size / 2}px, ${g.y}px, 0)`
}

/**
 * Where everything goes for the current slot. Same list: the children
 * between the old and the new place move over by one item and the item
 * itself (the placeholder) moves into the slot. Another list: the target
 * opens a gap at the slot and, unless `keepSource`, the source closes the
 * item's gap. Ignored children (headers, an "add" button) move with the
 * items around them.
 */
function shiftsFor(s: Session, keepSource = false): Map<HTMLElement, number> {
  const m = new Map<HTMLElement, number>()
  const t = s.target
  if (!t || s.slot < 0 || s.legal !== 'ok') return m
  const source = s.source
  const kids = flowKids(source)
  const from = kids.indexOf(s.item)
  if (from < 0) return m
  const along = (c: TySortable, r: { top: number; left: number; bottom: number; right: number }) =>
    c.axis === 'vertical' ? [r.top, r.bottom] : [r.left, r.right]
  const ir = baseRect(s.item)
  const [iStart, iEnd] = along(source, ir)
  const size = iEnd - iStart
  const others = othersIn(source, s.item)
  if (t === source) {
    const fromSlot = source.items.indexOf(s.item)
    if (s.slot === fromSlot) return m
    const step = size + listGap(s, source)
    if (s.slot > fromSlot) {
      const last = others[s.slot - 1]
      const passed = kids.slice(from + 1, kids.indexOf(last) + 1)
      passed.forEach((k) => m.set(k, -step))
      m.set(s.item, along(source, baseRect(last))[1] - iEnd)
    } else {
      const first = others[s.slot]
      const passed = kids.slice(kids.indexOf(first), from)
      passed.forEach((k) => m.set(k, step))
      m.set(s.item, along(source, baseRect(first))[0] - iStart)
    }
    return m
  }
  if (!keepSource) {
    const close = -(size + listGap(s, source))
    kids.slice(from + 1).forEach((k) => m.set(k, close))
  }
  const tKids = flowKids(t)
  const tOthers = othersIn(t, s.item)
  const start = s.slot < tOthers.length
    ? tKids.indexOf(tOthers[s.slot])
    : tOthers.length ? tKids.indexOf(tOthers[tOthers.length - 1]) + 1 : tKids.length
  const open = (t.axis === 'vertical' ? ir.height : ir.width) + listGap(s, t)
  tKids.slice(start).forEach((k) => m.set(k, open))
  return m
}

const SHIFT_EASING = 'cubic-bezier(.2, 0, 0, 1)'

/**
 * Animate children to the given offsets (missing ones back to 0). The
 * offset is the `translate` property, added on top of whatever the element
 * has, so its own transform (a tilt, a hover scale) stays.
 */
function applyShifts(s: Session, want: Map<HTMLElement, number>, ms: number): void {
  for (const el of new Set([...s.shifts.keys(), ...want.keys()])) {
    const to = want.get(el) ?? 0
    const cur = s.shifts.get(el)
    if ((cur?.to ?? 0) === to) continue
    const list = el.parentElement instanceof TySortable ? el.parentElement : s.source
    const vertical = list.axis === 'vertical'
    const from = shiftOffset(cur)
    const at = (d: number) => (vertical ? `0 ${d}px` : `${d}px 0`)
    const anim = el.animate([{ translate: at(from) }, { translate: at(to) }], { duration: ms, easing: SHIFT_EASING, fill: 'forwards', composite: 'add' })
    cur?.anim.cancel()
    s.shifts.set(el, { from, to, vertical, anim })
  }
}

function cancelShifts(s: Session): void {
  s.shifts.forEach(({ anim }) => anim.cancel())
  s.shifts.clear()
}

/**
 * preview="shift": children make room while dragging. Pointer drags hide
 * the item (the ghost is it) and close its gap; keyboard drags keep it in
 * place, dimmed and focused, and show a copy in the target's gap.
 */
function previewShifts(s: Session): void {
  if (s.phase !== 'dragging') return
  const ms = Math.min(duration(s.source), 200)
  if (!shiftPreview(s)) {
    // Over a list without the preview: undo what a previous list did.
    if (s.shifts.size) applyShifts(s, new Map(), ms)
    markSource(s, 'dim')
    return
  }
  const crossing = !!s.target && s.target !== s.source && s.legal === 'ok'
  const keyboard = s.mode !== 'pointer'
  markSource(s, crossing && !keyboard ? 'hide' : 'dim')
  applyShifts(s, shiftsFor(s, keyboard), ms)
  if (keyboard) {
    if (crossing) {
      if (!s.ghost && s.layer) addGhost(s, s.item.getBoundingClientRect())
      const o = gapOrigin(s, s.target!)
      s.ghost!.style.display = ''
      settleGhost(s.ghost!, o.x, o.y, ms)
    } else if (s.ghost) {
      s.ghost.style.display = 'none'
    }
  }
}

function clearStates(s: Session): void {
  for (const c of new Set([s.source, s.target, ...members(s.group, s.source)])) {
    if (!c) continue
    for (const st of ['over', 'blocked', 'dragging', 'pending']) setState(c, st, false)
  }
}

/** Drop a session's visuals and listeners. States are cleared by the caller. */
function teardown(s: Session): void {
  cancelAnimationFrame(s.raf)
  clearTimeout(s.timer)
  s.cleanup.forEach((fn) => fn())
  s.cleanup = []
  s.observers.forEach((o) => o.disconnect())
  s.observers = []
  cancelShifts(s)
  s.layer?.remove()
  s.cursorMarker?.remove()
  s.cursorMarker = null
  if (session === s) session = null
  // A new drag may already be under way (this one's ghost was flying back).
  if (!session || session.source !== s.source) markSource(s, false)
}

/** Siblings back in place and the ghost back to `el` (the item's node), then drop the visuals. */
function flyBack(s: Session, el: Element | null, done: () => void): void {
  // Where the node rests, not where a shift has it right now.
  const to = el?.isConnected ? baseRect(el, s) : null
  const ghost = s.ghost
  const ms = duration(s.source)
  if (s.indicator) s.indicator.style.display = 'none'
  setCursor(s, null)
  if (s.shifts.size) {
    applyShifts(s, new Map(), ms)
    if (s.source.items.includes(s.item)) markSource(s, 'dim')
  }
  if (!ghost || !to || !ms) {
    if (ms && s.shifts.size) window.setTimeout(done, ms)
    else done()
    return
  }
  settleGhost(ghost, to.left, to.top, ms)
  window.setTimeout(done, ms)
}

function cancelDrag(reason: TySortableCancelReason): void {
  const s = session
  if (!s || s.phase !== 'dragging') return
  cancelAnimationFrame(s.raf)
  // A new drag may start while the ghost flies back.
  session = null
  if (s.mode === 'pointer' && (reason === 'escape' || reason === 'gone' || reason === 'disabled')) suppressNextRelease(s.pointerId)
  const source = s.source.isConnected ? s.source : resolveContainer(s.source, s.sourceId, s.group) ?? s.source
  source.dispatchEvent(new CustomEvent<TySortableCancelDetail>('ty-sortable-cancel', {
    detail: { value: dragValue(s), item: s.item, reason },
  }))
  if (s.mode === 'keyboard' && reason !== 'gone') {
    source._announce('cancelled', { item: itemLabel(source, s.item), position: fromPos(s).index + 1, list: listLabel(source) })
  }
  s.cleanup.forEach((fn) => fn())
  s.cleanup = []
  clearStates(s)
  flyBack(s, s.item.isConnected ? s.item : null, () => teardown(s))
}

// --- Keyboard drag ------------------------------------------------------------------

function startKeyboard(source: TySortable, item: HTMLElement): void {
  const s = newSession('keyboard', source, item)
  session = s
  createLayer(s, item.getBoundingClientRect())
  markSource(s, 'dim')
  setState(source, 'dragging', true)
  addEventListener('keydown', onKeyboardKey, true)
  addEventListener('pointerdown', onKeyboardPointer, true)
  s.cleanup.push(() => {
    removeEventListener('keydown', onKeyboardKey, true)
    removeEventListener('pointerdown', onKeyboardPointer, true)
  })
  dispatchStart(s)
  setTargetOf(s, source)
  s.slot = s.fromIndex
  s.legal = 'ok'
  setState(source, 'over', true)
  paintIndicator(s)
  source._announce('pickedUp', {
    item: itemLabel(source, item),
    position: s.fromIndex + 1,
    total: source.items.length,
    list: listLabel(source),
  })
}

/** Keys of a keyboard drag, wherever focus went (a re-render may have dropped it). */
function onKeyboardKey(e: KeyboardEvent): void {
  const s = session
  if (!s || s.mode !== 'keyboard' || s.phase !== 'dragging') return
  if (!checkKeyboard()) return
  keyboardMove(s, e)
}

function onKeyboardPointer(): void {
  if (session?.mode === 'keyboard' && session.phase === 'dragging') cancelDrag('blur')
}

/**
 * A keyboard drag survives re-renders: the item and lists are found again by
 * key and id, and focus goes back to the item. False (and cancelled) when
 * the item is gone.
 */
function checkKeyboard(): boolean {
  const s = session
  if (!s || s.mode !== 'keyboard' || s.phase !== 'dragging') return false
  const before = s.item
  const hadFocus = !document.activeElement || document.activeElement === document.body || before.contains(document.activeElement)
  if (!revalidate(s) || !s.target) {
    cancelDrag('gone')
    return false
  }
  if (s.item !== before && hadFocus) (handleOf(s.source, s.item) ?? s.item).focus({ preventScroll: true })
  s.slot = clampLocked(s.target, s.item, Math.min(s.slot, othersIn(s.target, s.item).length))
  paintIndicator(s)
  return true
}

function keyboardMove(s: Session, e: KeyboardEvent): void {
  const target = s.target ?? s.source
  const vertical = target.axis === 'vertical'
  const back = vertical ? 'ArrowUp' : 'ArrowLeft'
  const fwd = vertical ? 'ArrowDown' : 'ArrowRight'
  const prevList = vertical ? 'ArrowLeft' : 'ArrowUp'
  const nextList = vertical ? 'ArrowRight' : 'ArrowDown'
  const count = othersIn(target, s.item).length
  switch (e.key) {
    case back:
    case fwd:
    case 'Home':
    case 'End': {
      e.preventDefault()
      const want = e.key === back ? s.slot - 1 : e.key === fwd ? s.slot + 1 : e.key === 'Home' ? 0 : count
      const slot = clampLocked(target, s.item, Math.max(0, Math.min(want, count)))
      setTarget(s, target, slot, legality(s, target, slot))
      revealSlot(s)
      return
    }
    case prevList:
    case nextList: {
      e.preventDefault()
      const lists = members(s.group, s.source)
        .filter((c) => !c.disabled || c === s.source)
        .sort((a, b) => {
          const ra = a.getBoundingClientRect()
          const rb = b.getBoundingClientRect()
          return vertical ? ra.left - rb.left || ra.top - rb.top : ra.top - rb.top || ra.left - rb.left
        })
      const i = lists.indexOf(target)
      const dir = e.key === nextList ? 1 : -1
      // The next list that takes the item; blocked lists are skipped.
      for (let j = i + dir; j >= 0 && j < lists.length; j += dir) {
        const c = lists[j]
        const slot = clampLocked(c, s.item, Math.min(s.slot, othersIn(c, s.item).length))
        if (legality(s, c, slot) === 'ok') {
          setTarget(s, c, slot, 'ok')
          revealSlot(s)
          return
        }
      }
      return
    }
    case ' ':
    case 'Enter':
      // The host's own keydown would see this key next and, with the hold
      // already settled by a synchronous render, pick the item up again.
      // stopPropagation keeps it from bubbling there; droppedBy covers a
      // listener on the item's own path.
      e.preventDefault()
      e.stopPropagation()
      keyHandledAt = performance.now()
      droppedBy = e
      dropKeyboard(s)
      return
    case 'Escape':
      e.preventDefault()
      e.stopPropagation()
      cancelDrag('escape')
      return
    case 'Tab':
      cancelDrag('blur')
      return
  }
}

function dropKeyboard(s: Session): void {
  if (!s.target || s.legal !== 'ok') cancelDrag('blocked')
  else commit()
}

function revealSlot(s: Session): void {
  const c = s.target
  if (!c) return
  const others = othersIn(c, s.item)
  const near = others[s.slot - 1] ?? others[s.slot] ?? c
  near.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  requestAnimationFrame(() => { if (session === s) paintIndicator(s) })
}

// --- Commit and hold -----------------------------------------------------------------

function liveSource(s: Session): TySortable {
  return resolveContainer(s.source, s.sourceId, s.group) ?? s.source
}

function liveTarget(s: Session): TySortable {
  return (s.target && resolveContainer(s.target, s.targetId, s.group)) ?? s.target ?? liveSource(s)
}

/** Every list the hold watches: the group, or the source and target when ungrouped. */
function holdLists(s: Session): TySortable[] {
  return s.group ? members(s.group, liveSource(s)) : [...new Set([liveSource(s), liveTarget(s)])]
}

function groupSnapshot(s: Session): Map<string | TySortable, Token[]> {
  const map = new Map<string | TySortable, Token[]>()
  for (const c of holdLists(s)) map.set(c.id || c, c.items.map((i) => c.keyOf(i) ?? i))
  return map
}

function snapshotChanged(s: Session): boolean {
  const now = groupSnapshot(s)
  const before = s.snapshot!
  if (now.size !== before.size) return true
  for (const [k, tokens] of before) {
    const t = now.get(k)
    if (!t || !sameTokens(t, tokens)) return true
  }
  return false
}

function observeForHold(s: Session, c: TySortable): void {
  if (s.observed.has(c)) return
  s.observed.add(c)
  const o = new MutationObserver(() => evaluateHold('mutation'))
  o.observe(c, { childList: true })
  const a = new MutationObserver(() => watchBusy())
  a.observe(c, { attributes: true, attributeFilter: ['aria-busy', 'class'] })
  s.observers.push(o, a)
}

function buildValue(s: Session): TySortableValue {
  const target = s.target!
  const from = fromPos(s)
  const others = othersIn(target, s.item)
  const to: TySortablePos = {
    list: target.id || null,
    index: s.slot,
    prev: others[s.slot - 1] ? target.keyOf(others[s.slot - 1]) : null,
    next: others[s.slot] ? target.keyOf(others[s.slot]) : null,
  }
  const order: Record<string, (string | null)[]> = {}
  const keys = (c: TySortable, list: HTMLElement[]) => list.map((i) => c.keyOf(i))
  if (target !== s.source && s.source.id) order[s.source.id] = keys(s.source, othersIn(s.source, s.item))
  if (target.id) {
    const after = keys(target, others)
    after.splice(s.slot, 0, s.key)
    order[target.id] = after
  }
  return { key: s.key, group: s.group, source: s.mode, from, to, order }
}

/**
 * Drop at the current slot. Returns false for a drop back where the item
 * was (nothing to do), true when a change was dispatched.
 */
function commit(): boolean {
  const s = session!
  const target = s.target!
  cancelAnimationFrame(s.raf)
  s.cleanup.forEach((fn) => fn())
  s.cleanup = []
  if (target === s.source && s.slot === s.source.items.indexOf(s.item)) {
    session = null
    clearStates(s)
    if (s.mode === 'keyboard') {
      s.source._announce('dropped', { item: itemLabel(s.source, s.item), position: s.slot + 1, total: target.items.length, list: listLabel(target) })
    }
    flyBack(s, s.item, () => teardown(s))
    return false
  }

  const value = buildValue(s)
  s.value = value
  s.snapshot = groupSnapshot(s)
  s.phase = 'holding'
  s.holdStart = performance.now()
  s.focus = document.activeElement
  for (const c of holdLists(s)) {
    setState(c, 'over', false)
    setState(c, 'blocked', false)
    setState(c, 'dragging', false)
    setState(c, 'pending', true)
  }
  holdVisual(s)

  // Observe before dispatching: a synchronous renderer (vanilla, Replicant)
  // changes the DOM inside the handler.
  for (const c of holdLists(s)) observeForHold(s, c)
  s.busy = isBusy(s)

  const event = new CustomEvent<TySortableChangeDetail>('ty-sortable-change', {
    detail: { value, item: s.item, fromContainer: s.source, toContainer: target },
    bubbles: true,
    cancelable: true,
  })
  target.dispatchEvent(event)
  if (session !== s || s.phase !== 'holding') return true
  if (event.defaultPrevented) {
    release('rejected')
    return true
  }
  // The handler may have set aria-busy synchronously.
  s.busy = isBusy(s)
  s.htmx = s.busy && holdLists(s).some((c) => c.classList.contains('htmx-request'))
  armTimer(s)
  return true
}

/** The item shown in its new place: siblings make room, the ghost settles in. */
function holdVisual(s: Session): void {
  const target = s.target!
  if (!s.layer) createLayer(s, s.item.getBoundingClientRect())
  if (!s.ghost && s.layer) {
    addGhost(s, s.item.getBoundingClientRect())
    s.ghost!.getBoundingClientRect() // start the transition from here
  }
  s.ghost!.style.display = ''
  setCursor(s, null)
  if (s.indicator) s.indicator.style.display = 'none'
  const ms = duration(target)
  const vertical = target.axis === 'vertical'
  // A keyboard user's focus is on the item: it stays visible (dimmed), so
  // its list doesn't close the gap.
  const keep = s.mode !== 'pointer'
  const want = shiftsFor(s, keep)
  // Where the item will be — measured before anything moves.
  let x: number
  let y: number
  if (target === s.source) {
    const r = baseRect(s.item)
    const d = want.get(s.item) ?? 0
    x = r.left + (vertical ? 0 : d)
    y = r.top + (vertical ? d : 0)
  } else {
    ;({ x, y } = gapOrigin(s, target))
    markSource(s, keep ? 'dim' : 'hide')
  }
  applyShifts(s, want, ms)
  settleGhost(s.ghost!, x, y, ms)
}

function isBusy(s: Session): boolean {
  return holdLists(s).some((c) => c.getAttribute('aria-busy') === 'true' || c.classList.contains('htmx-request'))
}

function watchBusy(): void {
  const s = session
  if (!s || s.phase !== 'holding') return
  const busy = isBusy(s)
  if (s.busy && !busy) {
    // The request is over. Its render may still be on the way (a view
    // transition): give it a moment, then decide.
    s.busy = false
    const decide = () => {
      if (session !== s || s.busy) return
      s.observers.forEach((o) => o.takeRecords())
      evaluateHold('idle')
    }
    if (s.htmx) {
      // htmx drops htmx-request when the response arrives, before a delayed
      // swap (hx-swap="… swap:400ms") runs: wait for the swap to settle.
      s.htmx = false
      const done = (e?: Event) => {
        // Another request's swap (a poll elsewhere on the page) isn't ours.
        const t = e?.target
        if (t instanceof Element && t.isConnected && !holdLists(s).some((c) => t.contains(c) || c.contains(t))) return
        document.removeEventListener('htmx:afterSettle', done)
        clearTimeout(cap)
        requestAnimationFrame(decide)
      }
      const cap = window.setTimeout(done, HTMX_SETTLE_CAP)
      document.addEventListener('htmx:afterSettle', done)
      return
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.setTimeout(decide, IDLE_GRACE)
    }))
  } else if (busy) {
    s.busy = true
    s.htmx = holdLists(s).some((c) => c.classList.contains('htmx-request'))
  }
}

function armTimer(s: Session): void {
  clearTimeout(s.timer)
  const timeout = s.source.holdTimeout
  s.timer = window.setTimeout(function tick() {
    if (session !== s || s.phase !== 'holding') return
    // A request still in flight: wait for it, up to the cap.
    if (s.busy && performance.now() - s.holdStart < BUSY_CAP) {
      s.timer = window.setTimeout(tick, 250)
      return
    }
    release('unknown')
  }, timeout)
}

/** Where the item is now: its list, index and neighbours, and how many copies exist. */
function locate(s: Session): { list: TySortable; index: number; prev: string | null; next: string | null; count: number } | null {
  let found: { list: TySortable; index: number; prev: string | null; next: string | null } | null = null
  let count = 0
  for (const c of holdLists(s)) {
    const items = c.items
    items.forEach((el, i) => {
      if (s.key ? c.keyOf(el) !== s.key : el !== s.item) return
      count++
      if (found && c !== liveTarget(s)) return
      found = {
        list: c,
        index: i,
        prev: items[i - 1] ? c.keyOf(items[i - 1]) : null,
        next: items[i + 1] ? c.keyOf(items[i + 1]) : null,
      }
    })
  }
  return found ? { ...(found as any), count } : null
}

/**
 * Decide a hold. `mutation`: the lists changed. `idle`: a request ended.
 * `settle`: the app asked.
 */
function evaluateHold(trigger: 'mutation' | 'idle' | 'settle'): void {
  const s = session
  if (!s || s.phase !== 'holding') return
  const settled = trigger !== 'mutation'
  if (!snapshotChanged(s)) {
    // Unchanged after the request finished: the server said no.
    if (settled) release('rejected')
    return
  }
  const v = s.value!
  const at = locate(s)
  if (!at) {
    release('reconciled')
    return
  }
  const target = liveTarget(s)
  const source = liveSource(s)
  if (at.count === 1 && at.list === target && ((at.prev === v.to.prev && at.next === v.to.next) || at.index === v.to.index)) {
    release('accepted')
    return
  }
  // Other changes landed, but the item is still where it was: its own
  // render hasn't (or it was turned down, once the request is over).
  const atFrom = at.count === 1 && at.list === source && at.prev === v.from.prev && at.next === v.from.next
  if (atFrom) {
    if (settled) release('rejected')
    else dropRenderedShifts(s)
    return
  }
  // In two lists at once: one list is rendered, the other is still to come.
  if (at.count > 1 && !settled) {
    dropRenderedShifts(s)
    return
  }
  release('reconciled')
}

/**
 * Still holding, but some lists have rendered: their layout is real now, so
 * the offsets predicted for them go (the others keep theirs).
 */
function dropRenderedShifts(s: Session): void {
  const before = s.snapshot!
  for (const c of holdLists(s)) {
    const was = before.get(c.id || c)
    if (was && sameTokens(was, c.items.map((i) => c.keyOf(i) ?? i))) continue
    for (const [el, sh] of s.shifts) {
      if (el.parentElement !== c) continue
      sh.anim.cancel()
      s.shifts.delete(el)
    }
  }
}

function release(outcome: TySortableOutcome): void {
  const s = session
  if (!s || s.phase !== 'holding') return
  session = null
  clearTimeout(s.timer)
  s.observers.forEach((o) => o.disconnect())
  s.observers = []
  clearStates(s)
  const value = s.value!
  const target = liveTarget(s)
  const source = liveSource(s)
  const keyed = (c: TySortable) => (s.key ? c.items.find((i) => c.keyOf(i) === s.key) ?? null : null)
  const lists = holdLists(s)
  const keyboard = s.mode !== 'pointer'
  /** Where the item ended up, by key; a keyless item is its own node. */
  const findNow = (): { list: TySortable; el: HTMLElement } | null => {
    for (const c of [target, ...lists]) {
      const el = keyed(c) ?? (!s.key && s.item.parentElement === c ? s.item : null)
      if (el) return { list: c, el }
    }
    return null
  }

  // Nothing rendered and nothing will: like a rejection, everything goes back smoothly.
  const unchanged = outcome === 'unknown' && !snapshotChanged(s)
  if (outcome === 'rejected' || unchanged) {
    const back = keyed(source) ?? (s.item.isConnected ? s.item : null)
    if (keyboard) {
      if (outcome === 'rejected') source._announce('rejected', { item: itemLabel(source, s.item), position: value.from.index + 1, list: listLabel(source) })
      else source._announce('unknown', { item: itemLabel(source, s.item) })
      if (back) restoreFocus(s, source, back)
    }
    flyBack(s, back, () => teardown(s))
  } else {
    const ghostRect = s.ghost?.getBoundingClientRect() ?? null
    // Where every shifted child is on screen now, by key: after the render
    // the same keys glide from there instead of jumping.
    const seen = new Map<string, DOMRect>()
    for (const el of s.shifts.keys()) {
      const list = el.parentElement instanceof TySortable ? el.parentElement : null
      const k = list?.keyOf(el)
      if (k && k !== s.key && el.isConnected) seen.set(k, el.getBoundingClientRect())
    }
    teardown(s)
    const now = findNow()
    const ms = duration(target)
    const glide = (el: HTMLElement, from: DOMRect) => {
      const r = el.getBoundingClientRect()
      const dx = from.left - r.left
      const dy = from.top - r.top
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return
      el.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: ms, easing: SHIFT_EASING, composite: 'add' })
    }
    if (ms && outcome !== 'unknown') {
      // FLIP: the landed item from the ghost, the others from their shifts.
      if (now && ghostRect && outcome === 'accepted') glide(now.el, ghostRect)
      for (const c of lists) {
        for (const el of c.items) {
          const k = c.keyOf(el)
          const from = k ? seen.get(k) : undefined
          if (from) glide(el, from)
        }
      }
    }
    if (now && outcome !== 'unknown' && now.list.hasAttribute('flash')) flash(now.list, now.el)
    if (keyboard) {
      const name = itemLabel(source, now?.el ?? s.item)
      if (now) {
        const items = now.list.items
        const vars = { item: name, position: items.indexOf(now.el) + 1, total: items.length, list: listLabel(now.list) }
        now.list._announce(outcome === 'accepted' ? 'dropped' : outcome === 'unknown' ? 'unknown' : 'reconciled', vars)
        restoreFocus(s, now.list, now.el)
      } else {
        source._announce(outcome === 'unknown' ? 'unknown' : 'removed', { item: name })
        const near = source.items[Math.min(value.from.index, source.items.length - 1)]
        if (near) restoreFocus(s, source, near)
      }
    }
  }
  target.dispatchEvent(new CustomEvent<TySortableSettleDetail>('ty-sortable-settle', { detail: { value, outcome } }))
  s.resolve?.(outcome)
}

/** flash: a short outline on the item where it landed. */
function flash(c: TySortable, el: HTMLElement): void {
  const color = cssVar(c, '--ty-sortable-flash-color', cssVar(c, '--ty-sortable-indicator-color', '#3b82f6'))
  el.animate(
    [{ outline: `2px solid ${color}`, outlineOffset: '-2px' }, { outline: '2px solid transparent', outlineOffset: '-2px' }],
    { duration: 700, easing: 'ease-out' },
  )
}

/**
 * Keyboard users keep their place: focus follows the item to its node —
 * unless they have moved focus somewhere else since the drop.
 */
function restoreFocus(s: Session, c: TySortable, item: HTMLElement): void {
  const active = document.activeElement
  const lost = !active || active === document.body || !s.focus || !s.focus.isConnected
  if (!lost && active !== s.focus) return
  if (active && item.contains(active)) return
  ;(handleOf(c, item) ?? item).focus({ preventScroll: true })
}

if (!customElements.get('ty-sortable')) {
  customElements.define('ty-sortable', TySortable)
}
