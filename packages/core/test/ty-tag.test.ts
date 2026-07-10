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

describe('ty-tag custom flavors', () => {
  const BG = 'rgb(1, 2, 3)';
  const FG = 'rgb(4, 5, 6)';

  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-bg-brand');
    document.documentElement.style.removeProperty('--ty-color-brand');
  });

  it('derives styling for a custom flavor from design tokens', async () => {
    document.documentElement.style.setProperty('--ty-bg-brand', BG);
    document.documentElement.style.setProperty('--ty-color-brand', FG);
    const el = await fixture(html`<ty-tag flavor="brand">Brand</ty-tag>`);
    await nextFrame();
    const cs = getComputedStyle(el.shadowRoot!.querySelector('.tag-container')!);
    expect(cs.backgroundColor).to.equal(BG);
    expect(cs.color).to.equal(FG);
  });

  it('page-level --tag-* rules still override a custom flavor (escape hatch)', async () => {
    document.documentElement.style.setProperty('--ty-bg-brand', BG);
    const el = await fixture(html`
      <div>
        <style>ty-tag[flavor="brand"] { --tag-bg: rgb(9, 9, 9); }</style>
        <ty-tag flavor="brand">Brand</ty-tag>
      </div>
    `);
    await nextFrame();
    const tag = el.querySelector('ty-tag')!;
    const cs = getComputedStyle(tag.shadowRoot!.querySelector('.tag-container')!);
    expect(cs.backgroundColor).to.equal('rgb(9, 9, 9)');
  });

  it('removes the generated stylesheet when switching back to a built-in flavor', async () => {
    document.documentElement.style.setProperty('--ty-bg-brand', BG);
    const el = (await fixture(html`<ty-tag flavor="brand">Brand</ty-tag>`)) as any;
    await nextFrame();
    const container = el.shadowRoot!.querySelector('.tag-container')!;
    expect(getComputedStyle(container).backgroundColor).to.equal(BG);
    const sheetsBefore = el.shadowRoot!.adoptedStyleSheets.length;
    el.flavor = 'primary';
    await nextFrame();
    expect(el.shadowRoot!.adoptedStyleSheets.length).to.equal(sheetsBefore - 1);
    // Re-query: render() rebuilt the shadow DOM on the flavor change.
    // --ty-bg-primary is not defined in the test page, so the tag falls back.
    const rerendered = el.shadowRoot!.querySelector('.tag-container')!;
    expect(getComputedStyle(rerendered).backgroundColor).to.equal('rgba(0, 0, 0, 0)');
  });
});
