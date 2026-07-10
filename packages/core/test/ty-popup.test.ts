import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/popup.js';

// ty-popup positions a dialog relative to an anchor on click; that path needs
// real layout/top-layer, so we keep this to a mount smoke test.
describe('ty-popup', () => {
  it('mounts and renders its shadow content', async () => {
    const el = await fixture(html`
      <ty-popup>
        <button slot="trigger">Open</button>
        <div>Popup body</div>
      </ty-popup>
    `);
    await nextFrame();
    expect(el.shadowRoot).to.exist;
    expect(el.shadowRoot!.querySelector('*'), 'rendered something').to.exist;
  });
});
