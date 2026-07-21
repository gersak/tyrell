import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/copy.js';

describe('ty-copy', () => {
  it('reflects value and format', async () => {
    const el = (await fixture(html`<ty-copy value="hello" format="code"></ty-copy>`)) as any;
    await nextFrame();
    expect(el.value).to.equal('hello');
    expect(el.format).to.equal('code');
  });

  it('is also registered as ty-copy-field (same behavior)', async () => {
    const el = (await fixture(html`<ty-copy-field value="hello"></ty-copy-field>`)) as any;
    await nextFrame();
    expect(el.value).to.equal('hello');
  });
});

describe('ty-copy flavor', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-color-success');
  });

  it('colors the copy button from the flavor', async () => {
    document.documentElement.style.setProperty('--ty-color-success', 'rgb(1, 2, 3)');
    const el = (await fixture(html`<ty-copy value="x" flavor="success"></ty-copy>`)) as any;
    await nextFrame();
    const cs = getComputedStyle(el.shadowRoot.querySelector('.copy-button'));
    expect(cs.color).to.equal('rgb(1, 2, 3)');
  });
});

describe('ty-copy accessibility — copy button has a real accessible name', () => {
  it('the icon-only button carries aria-label (was: none at all)', async () => {
    const el = (await fixture(html`<ty-copy value="x"></ty-copy>`)) as any;
    await nextFrame();
    const btn = el.shadowRoot.querySelector('.copy-button');
    expect(btn.getAttribute('aria-label'), 'has an accessible name').to.be.a('string').and.not.empty;
  });
});
