import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/switch.js';

describe('ty-switch', () => {
  it('defaults off; clicking toggles and fires change', async () => {
    const el = (await fixture(html`<ty-switch></ty-switch>`)) as any;
    await nextFrame();
    expect(el.checked).to.equal(false);

    let changed = false;
    el.addEventListener('change', () => { changed = true; });
    (el.shadowRoot.querySelector('.switch-container') as HTMLElement).click();
    await nextFrame();

    expect(el.checked).to.equal(true);
    expect(changed).to.equal(true);
  });

  it('contributes its value to FormData when on', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-switch name="n" value="on" checked></ty-switch></form>
    `));
    await nextFrame();
    expect(new FormData(form).get('n')).to.equal('on');
  });

  it('required + off blocks the form; on unblocks', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-switch name="n" required></ty-switch></form>
    `));
    const sw = form.querySelector('ty-switch') as any;
    await nextFrame();
    expect(form.checkValidity()).to.equal(false);

    sw.checked = true;
    await nextFrame();
    expect(form.checkValidity()).to.equal(true);
  });
});
