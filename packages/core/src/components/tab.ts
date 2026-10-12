/** Individual tab panel with custom scrollbar via CustomScrollbar utility. */

import { ensureStyles } from '../utils/styles.js';
import { tabStyles } from '../styles/tab.js';
import { CustomScrollbar, isCustomScrollbarEnabled } from '../utils/custom-scrollbar.js';
import { getLoaderSvg } from '../utils/loader-registry.js';

export interface TabAttributes {
  id: string | null;
  label: string | null;
  disabled: boolean;
  lazy: boolean;
}

/**
 * `ty-tab-load`: a lazy tab with no content was shown. Fired on the ty-tab
 * and doesn't bubble, so a lazy tab nested in another doesn't trigger the
 * outer one's listener. Listen on the tab, or on ty-tabs with capture.
 */
export interface TabLoadDetail {
  id: string;
  index: number;
}

/**
 * Lazy tab lifecycle. `idle`: not lazy, or has content. `empty`: lazy with
 * nothing to show, not asked for yet. `loading`: ty-tab-load fired, waiting
 * for content. `failed`: the app called loadFailed().
 */
type LoadState = 'idle' | 'empty' | 'loading' | 'failed';

/** Children that are status placeholders, not content. */
const STATUS_SLOTS = new Set(['loading', 'error']);

/** Elements that render nothing, so they aren't content either. */
const INERT_ELEMENTS = new Set(['template', 'script', 'style']);

export class TyTab extends HTMLElement {
  private _scrollbar: CustomScrollbar | null = null
  private _panelLabel: string | null = null
  private _shown = true
  private _load: LoadState = 'idle'
  private _contentObserver: MutationObserver | null = null
  private _contentChanged = false

  static get observedAttributes() {
    return ['id', 'label', 'disabled', 'lazy'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    // Re-inserted (moved): the shadow tree survived, the scrollbar didn't.
    if (!this._scrollbar) this._setupScrollbar();
    this._watchContent();
  }

  /** Accessible name. Set by ty-tabs, which also knows rich `label-{id}` slots. */
  setPanelLabel(label: string): void {
    this._panelLabel = label;
    this._syncPanel();
  }

  /** Set by ty-tabs: a panel that isn't shown is inert. */
  setShown(shown: boolean): void {
    this._shown = shown;
    this._syncPanel();
  }

  disconnectedCallback() {
    this._destroyScrollbar();
    // Disconnecting drops the observer's pending records. A move (emptied
    // and reinserted in one go) must still react to them on reconnect.
    this._contentChanged = !!this._contentObserver?.takeRecords().length;
    this._contentObserver?.disconnect();
    this._contentObserver = null;
  }

  /**
   * Called by ty-tabs when this tab becomes the shown one — never for the
   * tab shown first, whose content the page is expected to carry. A lazy
   * tab with no content (or whose load failed) asks for it.
   */
  _requestLoad(index: number): void {
    // Content that came with the switch (same morph) counts.
    if (this._contentObserver?.takeRecords().length) this._checkContent(false);
    if (this._load === 'empty' || this._load === 'failed') this._fireLoad(index);
  }

  /**
   * Report that loading this tab's content failed: shows `slot="error"`
   * (default "Couldn't load.") with a Retry button. Retry, or showing the
   * tab again, fires `ty-tab-load` once more. Content arriving clears it.
   */
  loadFailed(): void {
    if (this._load === 'loading' || this._load === 'empty') this._setLoad('failed');
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    this._render();
    if (name === 'lazy') {
      if (this.isConnected) this._watchContent();
      return;
    }
    // ty-tabs renders this tab's button from id/label/disabled. A morph
    // changes them in place, which ty-tabs' childList observer can't see.
    const tabs = this.parentElement;
    if (oldValue !== newValue && this.isConnected && tabs?.localName === 'ty-tabs') {
      (tabs as any)._queueUpdate?.(true);
    }
  }

  private _render(): void {
    const shadowRoot = this.shadowRoot;
    if (!shadowRoot) return;

    if (!shadowRoot.querySelector('.tab-wrapper')) {
      ensureStyles(shadowRoot, { css: tabStyles, id: 'ty-tab' });

      // The panel semantics live in the shadow root, where a server morph of
      // the ty-tab can't strip them. tabindex: keyboard users can reach (and
      // scroll) a panel with no focusable content; it's also what gets focus,
      // so it carries the role and name.
      shadowRoot.innerHTML = `
        <div class="tab-wrapper">
          <div class="tab-panel" role="tabpanel" tabindex="0">
            <slot></slot>
          </div>
        </div>
      `;
    }
    this._syncPanel();
  }

  /** Lazy tabs track whether they have content; others don't watch. */
  private _watchContent(): void {
    const lazy = this.hasAttribute('lazy');
    if (lazy && !this._contentObserver) {
      // characterData: a reply can be bare text, which no childList sees
      // once the text node exists (morphs update text nodes in place).
      this._contentObserver = new MutationObserver(() => this._checkContent(true));
      this._contentObserver.observe(this, { childList: true, characterData: true, subtree: true });
    } else if (!lazy && this._contentObserver) {
      this._contentObserver.disconnect();
      this._contentObserver = null;
    }
    const changed = this._contentChanged;
    this._contentChanged = false;
    this._checkContent(changed);
  }

  private _hasContent(): boolean {
    for (const node of Array.from(this.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent!.trim()) return true;
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as Element;
      if (!STATUS_SLOTS.has(el.getAttribute('slot') ?? '') && !INERT_ELEMENTS.has(el.localName)) return true;
    }
    return false;
  }

  /**
   * `mutated`: content changed under a connected tab. Content that goes away
   * (a morph with the server's empty markup) loads again — right away when
   * this tab is the one shown, otherwise the next time it's shown.
   */
  private _checkContent(mutated: boolean): void {
    if (!this.hasAttribute('lazy') || this._hasContent()) {
      this._setLoad('idle');
      return;
    }
    if (this._load !== 'idle') return;
    this._setLoad('empty');
    if (!mutated) return;
    // Decide once ty-tabs has applied a switch from the same morph: the tab
    // being left doesn't load, the one switched to loads through _requestLoad.
    queueMicrotask(() => {
      if (this._load === 'empty' && this._shown && this.parentElement?.localName === 'ty-tabs') this._fireLoad();
    });
  }

  private _fireLoad(index?: number): void {
    const tabs = this.parentElement;
    if (index === undefined) {
      index = tabs?.localName === 'ty-tabs'
        ? Array.from(tabs.querySelectorAll(':scope > ty-tab')).indexOf(this)
        : 0;
    }
    this._setLoad('loading');
    this.dispatchEvent(new CustomEvent<TabLoadDetail>('ty-tab-load', { detail: { id: this.id, index } }));
  }

  /**
   * Placeholder and error, built the first time a tab loads: tabs that never
   * do carry no hidden "Couldn't load / Retry" text.
   */
  private _ensureStatus(panel: HTMLElement): void {
    if (panel.querySelector('.tab-loading')) return;
    panel.insertAdjacentHTML('beforeend', `
      <div class="tab-loading" part="loading">
        <slot name="loading"><span class="tab-spinner" part="spinner" aria-hidden="true"></span></slot>
      </div>
      <div class="tab-error" part="error" role="alert">
        <slot name="error">Couldn't load.</slot>
        <button type="button" class="tab-retry" part="retry">Retry</button>
      </div>
    `);
    panel.querySelector('.tab-retry')!.addEventListener('click', () => {
      // Retry hides itself; keep focus in the tab instead of dropping to <body>.
      panel.focus({ preventScroll: true });
      this._fireLoad();
    });
  }

  private _setLoad(state: LoadState): void {
    if (state === this._load) return;
    this._load = state;
    const panel = this.shadowRoot?.querySelector<HTMLElement>('.tab-panel');
    if (!panel) return;
    // Blank while empty: an initial tab nobody asked to load shows no spinner.
    if (state === 'loading' || state === 'failed') {
      this._ensureStatus(panel);
      panel.dataset.load = state;
    } else {
      delete panel.dataset.load;
    }
    if (state === 'loading') {
      panel.setAttribute('aria-busy', 'true');
      // Picked up per load, so an app's setLoaderSvg() applies.
      panel.querySelector('.tab-spinner')!.innerHTML = getLoaderSvg();
    } else {
      panel.removeAttribute('aria-busy');
    }
  }

  private _syncPanel(): void {
    const panel = this.shadowRoot?.querySelector<HTMLElement>('.tab-panel');
    if (!panel) return;

    // ty-tabs can upgrade before its children, so the name it pushes may
    // never have landed: read a rich `label-{id}` sibling ourselves meanwhile.
    const tabs = this.parentElement;
    const rich = !this._panelLabel && this.id && tabs?.localName === 'ty-tabs'
      ? tabs.querySelector(`:scope > [slot="label-${CSS.escape(this.id)}"]`)
      : null;
    const label = this._panelLabel || rich?.textContent?.trim() || this.getAttribute('label');
    if (label) panel.setAttribute('aria-label', label);
    else panel.removeAttribute('aria-label');

    // A leaving panel stays visible while it fades out; inert drops it (and
    // its slotted content) from the tab order and the a11y tree right away.
    panel.parentElement!.inert = !this._shown;
  }

  private _setupScrollbar(): void {
    const panel = this.shadowRoot?.querySelector('.tab-panel') as HTMLElement;
    const wrapper = this.shadowRoot?.querySelector('.tab-wrapper') as HTMLElement;
    if (!panel || !wrapper) return;

    if (!isCustomScrollbarEnabled()) return;

    panel.classList.add('ty-custom-scroll');
    this._scrollbar = new CustomScrollbar(panel, { vertical: true });

    // Append track to wrapper (outside the scroll area, so it stays fixed)
    if (this._scrollbar.trackY) {
      wrapper.appendChild(this._scrollbar.trackY);
    }
  }

  private _destroyScrollbar(): void {
    if (this._scrollbar) {
      this._scrollbar.trackY?.remove();
      this._scrollbar.destroy();
      this._scrollbar = null;
    }
  }

  resetScroll(): void {
    this._scrollbar?.scrollToTop(false);
  }
}

if (!customElements.get('ty-tab')) {
  customElements.define('ty-tab', TyTab);
}
