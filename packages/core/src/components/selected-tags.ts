/**
 * TySelectedOptions - out-of-band dismissible <ty-tag> chips for a picker's selection.
 * Pairs with any element exposing a comma-joined `value` + bubbling `change`; labels
 * and flavors are read from the picker's matching option (`[value="..."]`). Custom chips
 * come from an optional <template> child, stamped onto cloned nodes (never innerHTML).
 */

/** Minimal shape of a picker this element can drive. */
interface Picker extends HTMLElement {
  value: string
}

/** Split a comma-joined picker value into clean values. */
function parseValues(raw: string): string[] {
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

/** Replace {key} placeholders from ctx; unknown keys are left as-is. */
function interpolate(text: string, ctx: Record<string, string>): string {
  return text.replace(/\{([\w-]+)\}/g, (match, key) => ctx[key] ?? match)
}

export class TySelectedOptions extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['for']
  }

  private _picker: Picker | null = null
  private _onChange = (): void => this.renderChips()
  private _childObserver: MutationObserver | null = null
  private _pickerObserver: MutationObserver | null = null
  private _lastTemplate: HTMLTemplateElement | null = null

  // While the linked picker's own popup is open, its independently-sized,
  // independently-positioned dropdown can visually collide with this chip
  // row (it's a separate element, placed wherever the consumer wants it —
  // there's no layout relationship to enforce). Hiding the chips for the
  // duration sidesteps that instead of trying to out-z-index or reflow
  // around an overlay whose size/position we don't control.
  private _restoreDisplay = 'contents'
  private _onPickerOpen = (): void => {
    this._restoreDisplay = this.style.display || 'contents'
    this.style.display = 'none'
  }
  private _onPickerClose = (): void => {
    this.style.display = this._restoreDisplay
  }

  connectedCallback(): void {
    // Chips participate directly in the parent layout (flex gap, wrap, etc.)
    if (!this.style.display) this.style.display = 'contents'
    this.bind()
    this.renderChips()

    // During HTML parsing we connect BEFORE our <template> child is parsed —
    // re-render when it arrives so server-rendered pages get templated chips.
    // renderChips re-appends the SAME template node, so its own mutations
    // don't change template() identity → no re-render loop.
    this._childObserver = new MutationObserver(() => {
      const template = this.template()
      if (template !== this._lastTemplate) {
        this.renderChips()
      }
    })
    this._childObserver.observe(this, { childList: true })
  }

  disconnectedCallback(): void {
    this.unbind()
    this._childObserver?.disconnect()
    this._childObserver = null
  }

  attributeChangedCallback(): void {
    if (!this.isConnected) return
    this.bind()
    this.renderChips()
  }

  /** Resolve the picker: `for` id, else the previous element sibling. */
  private resolvePicker(): Picker | null {
    const id = this.getAttribute('for')
    const el = id
      ? document.getElementById(id)
      : this.previousElementSibling
    return (el as Picker) ?? null
  }

  private bind(): void {
    const next = this.resolvePicker()
    if (next === this._picker) return
    this.unbind()
    this._picker = next
    this._picker?.addEventListener('change', this._onChange)
    this._picker?.addEventListener('open', this._onPickerOpen)
    this._picker?.addEventListener('close', this._onPickerClose)

    // The picker stamps `selected` onto its options ASYNC after connect
    // (rAF init) and on external option swaps — neither fires `change`.
    // Watch the picker's subtree so initial values render as chips too.
    if (this._picker) {
      this._pickerObserver = new MutationObserver(() => this.renderChips())
      this._pickerObserver.observe(this._picker, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['selected'],
      })
    }
  }

  private unbind(): void {
    this._picker?.removeEventListener('change', this._onChange)
    this._picker?.removeEventListener('open', this._onPickerOpen)
    this._picker?.removeEventListener('close', this._onPickerClose)
    this._pickerObserver?.disconnect()
    this._pickerObserver = null
    this._picker = null
    // Don't leave chips hidden if the picker is swapped/removed mid-open.
    this.style.display = this._restoreDisplay
  }

  private values(): string[] {
    return parseValues(this._picker?.value ?? '')
  }

  /** The optional chip template (direct child only). */
  private template(): HTMLTemplateElement | null {
    return this.querySelector(':scope > template')
  }

  /**
   * Interpolation context for a value: value, label, flavor plus every
   * data-* attribute of the picker's matching option.
   */
  private context(value: string): Record<string, string> {
    const opt = this._picker?.querySelector(`[value="${CSS.escape(value)}"]`) as HTMLElement | null
    const ctx: Record<string, string> = {
      value,
      // label attribute wins (native <option label> semantics)
      label: opt?.getAttribute('label') || opt?.textContent?.trim() || value,
      flavor: opt?.getAttribute('flavor') ?? '',
    }
    if (opt) {
      for (const attr of Array.from(opt.attributes)) {
        if (attr.name.startsWith('data-')) ctx[attr.name] = attr.value
      }
    }
    return ctx
  }

  /**
   * The template's blueprint fragment. HTML-parsed templates carry children in
   * .content; framework-rendered ones (DOM-created by React/Replicant/etc.)
   * carry them as regular childNodes — support both.
   */
  private templateSource(template: HTMLTemplateElement): DocumentFragment {
    // Any content node counts — a text-only template ("{label}") is valid.
    if (template.content.hasChildNodes()) return template.content
    const frag = document.createDocumentFragment()
    template.childNodes.forEach(n => frag.appendChild(n.cloneNode(true)))
    return frag
  }

  /**
   * Stamp the template for one value: clone, interpolate placeholders in
   * attributes and text nodes, wire dismiss. Attribute values that were a
   * single unresolved placeholder are removed (e.g. flavor="{flavor}" with
   * no flavor on the option).
   */
  private stampTemplate(template: HTMLTemplateElement, value: string): DocumentFragment {
    const ctx = this.context(value)
    const clone = this.templateSource(template).cloneNode(true) as DocumentFragment

    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent?.includes('{')) {
          node.textContent = interpolate(node.textContent, ctx)
        }
      } else {
        const el = node as Element
        for (const attr of Array.from(el.attributes)) {
          if (!attr.value.includes('{')) continue
          const resolved = interpolate(attr.value, ctx)
          // Single-placeholder attribute that is empty OR unresolved → drop it
          // (e.g. flavor="{flavor}" with no flavor, name="{data-icon}" with no data-icon)
          if (/^\{[\w-]+\}$/.test(attr.value) && (resolved === '' || resolved === attr.value)) {
            el.removeAttribute(attr.name)
          } else {
            el.setAttribute(attr.name, resolved)
          }
        }
      }
    }

    // Dismiss anywhere inside the stamped chip deselects this value
    for (const el of Array.from(clone.children)) {
      el.addEventListener('dismiss', (e) => {
        e.stopPropagation()
        this.deselect(value)
      })
    }
    return clone
  }

  /** Default chip when no template is provided. */
  private defaultChip(value: string): HTMLElement {
    const ctx = this.context(value)
    const tag = document.createElement('ty-tag')
    tag.setAttribute('value', value)
    tag.setAttribute('dismissible', 'true')
    if (ctx.flavor) tag.setAttribute('flavor', ctx.flavor)
    tag.textContent = ctx.label
    tag.addEventListener('dismiss', () => this.deselect(value))
    return tag
  }

  private renderChips(): void {
    const template = this.template()
    this._lastTemplate = template

    if (!this._picker) {
      this.replaceChildren(...(template ? [template] : []))
      return
    }

    const frag = document.createDocumentFragment()
    // Template survives re-renders - it is part of our light DOM
    if (template) frag.appendChild(template)
    for (const value of this.values()) {
      frag.appendChild(template ? this.stampTemplate(template, value) : this.defaultChip(value))
    }
    this.replaceChildren(frag)
  }

  /** Remove a value from the picker; picker re-emits change → chips re-render. */
  private deselect(value: string): void {
    if (!this._picker) return
    const picker = this._picker as Picker & { deselectValue?: (v: string) => void }
    if (typeof picker.deselectValue === 'function') {
      // ty-select path — fires a proper change event (chips re-render via listener)
      picker.deselectValue(value)
    } else {
      // Generic picker fallback — value setters usually don't emit change
      picker.value = this.values().filter(v => v !== value).join(',')
      this.renderChips()
    }
  }
}

if (!customElements.get('ty-selected-options')) {
  customElements.define('ty-selected-options', TySelectedOptions)
}

// Original tag name — kept working indefinitely. A constructor can only
// register once, hence the subclass (see ty-modal/ty-dialog for precedent).
if (!customElements.get('ty-selected-tags')) {
  customElements.define('ty-selected-tags', class TySelectedTags extends TySelectedOptions { })
}
