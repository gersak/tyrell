import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/checkbox.js';

describe('ty-checkbox', () => {
  it('defaults unchecked; clicking toggles and fires change', async () => {
    const el = (await fixture(html`<ty-checkbox></ty-checkbox>`)) as any;
    await nextFrame();
    expect(el.checked).to.equal(false);

    let changed = false;
    el.addEventListener('change', () => { changed = true; });

    const box = el.shadowRoot.querySelector('.checkbox-container') as HTMLElement;
    box.click();
    await nextFrame();

    expect(el.checked).to.equal(true);
    expect(changed).to.equal(true);
  });

  it('a wrapping <label> click toggles the checkbox (delegation)', async () => {
    const label = (await fixture(html`
      <label>I agree <ty-checkbox name="a"></ty-checkbox></label>
    `)) as HTMLLabelElement;
    const cb = label.querySelector('ty-checkbox') as any;
    await nextFrame();
    expect(cb.checked).to.equal(false);

    // Clicking the label (not the box itself) must delegate to the control.
    label.click();
    await nextFrame();
    expect(cb.checked).to.equal(true);
  });

  it('indeterminate shows aria-checked="mixed"; click resolves to checked', async () => {
    const el = (await fixture(html`<ty-checkbox indeterminate></ty-checkbox>`)) as any;
    await nextFrame();
    const box = el.shadowRoot.querySelector('.checkbox-container') as HTMLElement;
    expect(box.getAttribute('aria-checked')).to.equal('mixed');

    el.click();
    await nextFrame();
    expect(el.indeterminate).to.equal(false);
    expect(el.checked).to.equal(true);
    expect(box.getAttribute('aria-checked')).to.equal('true');
  });

  it('reflects the checked attribute', async () => {
    const el = (await fixture(html`<ty-checkbox checked></ty-checkbox>`)) as any;
    await nextFrame();
    expect(el.checked).to.equal(true);
  });

  it('contributes its value to FormData when checked', async () => {
    const form = (await fixture(html`
      <form><ty-checkbox name="agree" value="yes" checked></ty-checkbox></form>
    `)) as HTMLFormElement;
    await nextFrame();
    expect(new FormData(form).get('agree')).to.equal('yes');
  });

  it('required + unchecked blocks the form; checking unblocks', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-checkbox name="a" required></ty-checkbox></form>
    `));
    const cb = form.querySelector('ty-checkbox') as any;
    await nextFrame();
    expect(form.checkValidity()).to.equal(false);

    cb.checked = true;
    await nextFrame();
    expect(form.checkValidity()).to.equal(true);
  });
});
