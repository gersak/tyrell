import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../lib/components/tabs.js';
import '../lib/components/tab.js';

describe('ty-tabs', () => {
  const markup = html`
    <ty-tabs active="a">
      <ty-tab id="a" label="First">One</ty-tab>
      <ty-tab id="b" label="Second">Two</ty-tab>
    </ty-tabs>
  `;

  it('renders a tablist with a button per tab', async () => {
    const el = await fixture(markup);
    await nextFrame();
    const sr = el.shadowRoot!;
    expect(sr.querySelector('[role="tablist"]'), 'tablist').to.exist;
    expect(sr.querySelectorAll('[data-tab-id]').length).to.equal(2);
  });

  it('switching tabs updates active and emits ty-tab-change', async () => {
    const el = await fixture(markup);
    await nextFrame();
    const btnB = el.shadowRoot!.querySelector('[data-tab-id="b"]') as HTMLElement;
    setTimeout(() => btnB.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
    const ev = await oneEvent(el, 'ty-tab-change');
    expect(ev.detail.activeId).to.equal('b');
    expect(el.getAttribute('active')).to.equal('b');
  });

  describe('resize / overflow', () => {
    // Regression: the ResizeObserver used to write its measured content-box
    // width into --tabs-width, which is what sizes :host. With
    // box-sizing: border-box that makes each callback shrink the element by its
    // own padding + border, re-triggering the observer — it converges toward
    // zero, and updateOverflow then banishes every tab into the "…" menu.
    // Page load looked fine because render() sets --tabs-width: 100%.
    const wide = html`
      <div style="width: 900px; padding: 0 40px; border: 2px solid transparent;">
        <ty-tabs active="a" width="100%">
          <ty-tab id="a" label="First">One</ty-tab>
          <ty-tab id="b" label="Second">Two</ty-tab>
          <ty-tab id="c" label="Third">Three</ty-tab>
        </ty-tabs>
      </div>
    `;

    it('never writes a measured pixel width back into --tabs-width', async () => {
      const host = await fixture(wide);
      const el = host.querySelector('ty-tabs') as HTMLElement;
      await nextFrame();
      await nextFrame();
      // Percentage widths must stay fluid; a px value here is the shrink loop.
      expect(el.style.getPropertyValue('--tabs-width')).to.not.match(/px/);
    });

    it('does not collapse tabs into overflow when there is room', async () => {
      const host = await fixture(wide);
      const el = host.querySelector('ty-tabs') as HTMLElement;
      await nextFrame();
      // Force several observer passes, the way a drag-resize would.
      for (const w of ['880px', '860px', '900px']) {
        (host as HTMLElement).style.width = w;
        await nextFrame();
        await nextFrame();
      }
      const sr = el.shadowRoot!;
      const hidden = sr.querySelectorAll('.tab-button.overflow-hidden');
      expect(hidden.length, 'tabs hidden behind the overflow menu').to.equal(0);
      expect(sr.querySelector('.tab-overflow-trigger'), 'overflow trigger').to.not.exist;
    });

    it('keeps tabs visible when measured while the container has no width', async () => {
      // display:none (or a collapsed ancestor) reports clientWidth 0. Treating
      // that as "nothing fits" hid every tab, and nothing re-ran once shown.
      const host = await fixture(html`
        <div style="width: 900px;">
          <ty-tabs active="a" width="100%">
            <ty-tab id="a" label="First">One</ty-tab>
            <ty-tab id="b" label="Second">Two</ty-tab>
            <ty-tab id="c" label="Third">Three</ty-tab>
          </ty-tabs>
        </div>
      `);
      const el = host.querySelector('ty-tabs') as HTMLElement;
      await nextFrame();
      (host as HTMLElement).style.display = 'none';
      await nextFrame();
      await nextFrame();
      (host as HTMLElement).style.display = '';
      await nextFrame();
      await nextFrame();
      const hidden = el.shadowRoot!.querySelectorAll('.tab-button.overflow-hidden');
      expect(hidden.length, 'tabs hidden after hide/show cycle').to.equal(0);
    });
  });
});
