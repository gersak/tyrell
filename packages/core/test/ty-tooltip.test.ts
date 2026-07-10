import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/tooltip.js';

// ty-tooltip uses its parent as the anchor and shows a popover on hover/focus.
// The hover path needs real pointer + top-layer, so we smoke-test that it
// upgrades and wires to its anchor without throwing.
describe('ty-tooltip', () => {
  it('mounts attached to its parent anchor', async () => {
    const wrap = await fixture(html`
      <div><span>Hover me</span><ty-tooltip>Tip text</ty-tooltip></div>
    `);
    await nextFrame();
    const tip = wrap.querySelector('ty-tooltip') as any;
    expect(tip.shadowRoot, 'shadow root (styles injected)').to.exist;
    expect(tip.parentElement, 'has an anchor').to.equal(wrap);
  });
});
