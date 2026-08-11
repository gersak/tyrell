/** Individual tab panel with custom scrollbar via CustomScrollbar utility. */

import { ensureStyles } from '../utils/styles.js';
import { tabStyles } from '../styles/tab.js';
import { CustomScrollbar, isCustomScrollbarEnabled } from '../utils/custom-scrollbar.js';

export interface TabAttributes {
  id: string | null;
  label: string | null;
  disabled: boolean;
}

export class TyTab extends HTMLElement {
  private _scrollbar: CustomScrollbar | null = null

  static get observedAttributes() {
    return ['id', 'label', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
  }

  disconnectedCallback() {
    this._destroyScrollbar();
  }

  attributeChangedCallback(_name: string, _oldValue: string | null, _newValue: string | null) {
    this._render();
  }

  private _render(): void {
    const shadowRoot = this.shadowRoot;
    if (!shadowRoot) return;

    const id = this.getAttribute('id');

    if (!shadowRoot.querySelector('.tab-wrapper')) {
      ensureStyles(shadowRoot, { css: tabStyles, id: 'ty-tab' });

      shadowRoot.innerHTML = `
        <div class="tab-wrapper"
             role="tabpanel"
             ${id ? `id="panel-${id}"` : ''}
             ${id ? `aria-labelledby="tab-${id}"` : ''}
        >
          <div class="tab-panel">
            <slot></slot>
          </div>
        </div>
      `;

      this._setupScrollbar();
    }
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
