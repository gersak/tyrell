/** Individual wizard step panel with custom scrollbar via CustomScrollbar utility. */

import { ensureStyles } from '../utils/styles.js';
import { stepStyles } from '../styles/step.js';
import { CustomScrollbar, isCustomScrollbarEnabled } from '../utils/custom-scrollbar.js';

export type StepStatus = 'completed' | 'active' | 'pending' | 'error';

export interface StepAttributes {
  id: string | null;
  label: string | null;
  description: string | null;
  disabled: boolean;
  status: StepStatus | null;
}

export class TyStep extends HTMLElement {
  private _scrollbar: CustomScrollbar | null = null

  static get observedAttributes() {
    return ['id', 'label', 'description', 'disabled', 'status'];
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

    if (!shadowRoot.querySelector('.step-wrapper')) {
      ensureStyles(shadowRoot, { css: stepStyles, id: 'ty-step' });

      shadowRoot.innerHTML = `
        <div class="step-wrapper"
             role="tabpanel"
             ${id ? `id="panel-${id}"` : ''}
             ${id ? `aria-labelledby="step-${id}"` : ''}
        >
          <div class="step-panel">
            <slot></slot>
          </div>
        </div>
      `;

      this._setupScrollbar();
    }
  }

  private _setupScrollbar(): void {
    const panel = this.shadowRoot?.querySelector('.step-panel') as HTMLElement;
    const wrapper = this.shadowRoot?.querySelector('.step-wrapper') as HTMLElement;
    if (!panel || !wrapper) return;

    if (!isCustomScrollbarEnabled()) return;

    panel.classList.add('ty-custom-scroll');
    this._scrollbar = new CustomScrollbar(panel, { vertical: true });

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

if (!customElements.get('ty-step')) {
  customElements.define('ty-step', TyStep);
}
