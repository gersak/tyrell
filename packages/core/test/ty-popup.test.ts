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

describe('ty-popup accessibility — trigger gets aria-haspopup + live aria-expanded', () => {
  it('the real trigger (parent element) gets aria-haspopup="dialog" and starts aria-expanded="false"', async () => {
    const wrap = (await fixture(html`
      <button id="trigger">Click me<ty-popup><div>Popup content</div></ty-popup></button>
    `)) as HTMLElement;
    await nextFrame();

    expect(wrap.getAttribute('aria-haspopup')).to.equal('dialog');
    expect(wrap.getAttribute('aria-expanded')).to.equal('false');
  });

  it('aria-expanded flips to true on open, back to false on close', async () => {
    const wrap = (await fixture(html`
      <button id="trigger">Click me<ty-popup><div>Popup content</div></ty-popup></button>
    `)) as HTMLElement;
    await nextFrame();

    wrap.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await nextFrame();
    await nextFrame();
    expect(wrap.getAttribute('aria-expanded'), 'true once open').to.equal('true');

    const popup = wrap.querySelector('ty-popup') as any;
    popup.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    // Give the close animation's setTimeout(150ms) room to run.
    await new Promise((r) => setTimeout(r, 250));
    expect(wrap.getAttribute('aria-expanded'), 'false again after close').to.equal('false');
  });

  it('manual mode does not touch the parent element at all (no anchor relationship)', async () => {
    const wrap = (await fixture(html`
      <button id="trigger">Click me<ty-popup manual><div>Popup content</div></ty-popup></button>
    `)) as HTMLElement;
    await nextFrame();
    expect(wrap.hasAttribute('aria-haspopup'), 'manual mode has no click-based anchor').to.be.false;
  });
});
