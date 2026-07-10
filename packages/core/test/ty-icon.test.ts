import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import * as IconRegistry from '../lib/utils/icon-registry.js';
import '../lib/components/icon.js';

describe('ty-icon', () => {
  it('renders a registered icon and reflects its name', async () => {
    IconRegistry.registerIcons({ 'test-beaker': '<svg data-test="beaker"><circle r="1"></circle></svg>' });
    const el = (await fixture(html`<ty-icon name="test-beaker"></ty-icon>`)) as any;
    await nextFrame();
    await nextFrame();
    expect(el.name).to.equal('test-beaker');
    expect(el.shadowRoot.innerHTML).to.contain('data-test="beaker"');
  });

  it('renders a fallback svg for an unknown icon', async () => {
    const el = (await fixture(html`<ty-icon name="totally-not-registered-xyz"></ty-icon>`)) as any;
    await nextFrame();
    await nextFrame();
    expect(el.shadowRoot.querySelector('svg')).to.exist;
  });
});
