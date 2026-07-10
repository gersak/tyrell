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
});
