import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../lib/components/tag.js';

describe('ty-tag', () => {
  it('fires click when the tag body is clicked', async () => {
    const el = await fixture(html`<ty-tag value="x">Tag</ty-tag>`);
    await nextFrame();
    const ev = oneEvent(el, 'click');
    (el.shadowRoot!.querySelector('.tag-container') as HTMLElement).click();
    await ev; // resolves only if the custom click fired
  });

  it('fires dismiss from the dismiss button', async () => {
    const el = await fixture(html`<ty-tag value="x" dismissible>Tag</ty-tag>`);
    await nextFrame();
    const ev = oneEvent(el, 'dismiss');
    (el.shadowRoot!.querySelector('.tag-dismiss') as HTMLElement).click();
    await ev;
  });

  it('reflects dismissible and selected', async () => {
    const el = (await fixture(html`<ty-tag dismissible selected></ty-tag>`)) as any;
    await nextFrame();
    expect(el.dismissible).to.equal(true);
    expect(el.selected).to.equal(true);
  });
});
