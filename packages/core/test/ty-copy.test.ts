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
