import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/wizard.js';
import '../lib/components/step.js';

// ty-wizard drives its active step via the `active` attribute; step transitions
// are richer interactions, so we keep this to a mount smoke + active reflection.
describe('ty-wizard', () => {
  const markup = html`
    <ty-wizard active="s1">
      <ty-step id="s1" label="One">First</ty-step>
      <ty-step id="s2" label="Two">Second</ty-step>
    </ty-wizard>
  `;

  it('mounts and renders its steps', async () => {
    const el = await fixture(markup);
    await nextFrame();
    expect(el.shadowRoot!.querySelector('*'), 'rendered something').to.exist;
    expect(el.querySelectorAll('ty-step').length).to.equal(2);
  });

  it('reflects the active step', async () => {
    const el = await fixture(markup);
    await nextFrame();
    expect(el.getAttribute('active')).to.equal('s1');
    el.setAttribute('active', 's2');
    await nextFrame();
    expect(el.getAttribute('active')).to.equal('s2');
  });
});
