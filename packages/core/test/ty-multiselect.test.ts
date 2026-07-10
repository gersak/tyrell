import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/multiselect.js';
import '../lib/components/tag.js';

describe('ty-multiselect', () => {
  it('reflects pre-selected tag values', async () => {
    const el = (await fixture(html`
      <ty-multiselect name="tags">
        <ty-tag value="a" selected>A</ty-tag>
        <ty-tag value="b" selected>B</ty-tag>
        <ty-tag value="c">C</ty-tag>
      </ty-multiselect>
    `)) as any;
    await nextFrame();
    // value getter reads the DOM (selected attribute is the source of truth).
    expect(el.value).to.equal('a,b');
  });

  it('renders its tag children', async () => {
    const el = await fixture(html`
      <ty-multiselect name="tags">
        <ty-tag value="a">A</ty-tag>
        <ty-tag value="b">B</ty-tag>
      </ty-multiselect>
    `);
    await nextFrame();
    expect(el.querySelectorAll('ty-tag').length).to.equal(2);
    expect(el.shadowRoot!.querySelector('*'), 'rendered something').to.exist;
  });
});
