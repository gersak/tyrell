import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../lib/components/tabs.js';
import '../lib/components/tab.js';
// The "…" jump-menu trigger nests its menu inside a ty-popup — without this
// import the unknown element renders the menu inline and balloons the trigger,
// distorting every strip-width measurement below.
import '../lib/components/popup.js';

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
      expect(sr.querySelector('.tab-overflow-trigger'), 'overflow trigger').to.not.exist;
    });

    it('keeps tabs visible when measured while the container has no width', async () => {
      // display:none (or a collapsed ancestor) reports clientWidth 0 — the
      // overflow pass must bail on that reading rather than act on it.
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
      const sr = el.shadowRoot!;
      expect(sr.querySelector('.tab-overflow-trigger'), 'trigger after hide/show cycle').to.not.exist;
      expect(sr.querySelectorAll('.tab-button').length).to.equal(3);
    });

    it('overflowing strip scrolls and shows a "…" jump menu instead of hiding tabs', async () => {
      const host = await fixture(html`
        <div style="width: 300px;">
          <ty-tabs active="a" width="100%">
            <ty-tab id="a" label="First">1</ty-tab>
            <ty-tab id="b" label="Second">2</ty-tab>
            <ty-tab id="c" label="Third">3</ty-tab>
            <ty-tab id="d" label="Fourth">4</ty-tab>
            <ty-tab id="e" label="Fifth">5</ty-tab>
          </ty-tabs>
        </div>
      `);
      const el = host.querySelector('ty-tabs') as HTMLElement;
      await nextFrame();
      await nextFrame();
      const sr = el.shadowRoot!;
      const strip = sr.querySelector('.tab-strip') as HTMLElement;
      expect(strip.scrollWidth, 'strip overflows').to.be.greaterThan(strip.clientWidth);
      expect(sr.querySelector('.tab-overflow-trigger'), 'jump-menu trigger').to.exist;
      // Nothing is display:none — every button stays in the scrollable strip.
      const buttons = Array.from(sr.querySelectorAll<HTMLElement>('.tab-button'));
      expect(buttons.length).to.equal(5);
      buttons.forEach((b) => expect(getComputedStyle(b).display).to.not.equal('none'));
      // The menu lists ALL tabs and marks the active one.
      const items = sr.querySelectorAll('.tab-overflow-item');
      expect(items.length).to.equal(5);
      expect(sr.querySelector('.tab-overflow-item[data-active="true"]')?.textContent).to.equal('First');
      // At scroll start with overflow: fade only on the right edge.
      expect(strip.style.getPropertyValue('--fade-left')).to.equal('0px');
      expect(strip.style.getPropertyValue('--fade-right')).to.equal('28px');
    });

    it('activating an off-screen tab scrolls it into view', async () => {
      const host = await fixture(html`
        <div style="width: 300px;">
          <ty-tabs active="a" width="100%">
            <ty-tab id="a" label="First">1</ty-tab>
            <ty-tab id="b" label="Second">2</ty-tab>
            <ty-tab id="c" label="Third">3</ty-tab>
            <ty-tab id="d" label="Fourth">4</ty-tab>
            <ty-tab id="e" label="Fifth">5</ty-tab>
          </ty-tabs>
        </div>
      `);
      const el = host.querySelector('ty-tabs') as HTMLElement;
      await nextFrame();
      await nextFrame();
      const sr = el.shadowRoot!;
      const strip = sr.querySelector('.tab-strip') as HTMLElement;

      // Middle tab: the strip centers it (like [1..6] with 4 visible and 3
      // active showing [2,3,4,5]).
      el.setAttribute('active', 'c');
      await nextFrame();
      await nextFrame();
      await new Promise((r) => setTimeout(r, 600)); // smooth scroll settles
      const btnC = sr.querySelector('[data-tab-id="c"]') as HTMLElement;
      const centered = btnC.offsetLeft + btnC.offsetWidth / 2 - strip.clientWidth / 2;
      expect(strip.scrollLeft, 'middle tab centered').to.be.closeTo(centered, 2);

      // Last tab: centering clamps at the right edge (5 active in [1..6]
      // showing [3,4,5,6]) — the tab ends up fully visible, flush right.
      el.setAttribute('active', 'e');
      await nextFrame();
      await nextFrame();
      await new Promise((r) => setTimeout(r, 600));
      const btnE = sr.querySelector('[data-tab-id="e"]') as HTMLElement;
      expect(strip.scrollLeft, 'clamped at max scroll')
        .to.be.closeTo(strip.scrollWidth - strip.clientWidth, 2);
      expect(btnE.offsetLeft + btnE.offsetWidth, 'active tab right edge within view')
        .to.be.at.most(strip.scrollLeft + strip.clientWidth + 1);
      // Marker tracks the active button in the scrolled layout.
      const marker = sr.querySelector('.marker-wrapper') as HTMLElement;
      expect(parseFloat(marker.style.left)).to.be.closeTo(btnE.offsetLeft, 1);
    });
  });
});
