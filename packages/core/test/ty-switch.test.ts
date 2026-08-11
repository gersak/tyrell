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

  it('suppresses a same-task duplicate click (label double-forward on Firefox/Safari), but not a later genuine one', async () => {
    const el = (await fixture(html`<ty-switch></ty-switch>`)) as any;
    await nextFrame();

    let changes = 0;
    el.addEventListener('change', () => { changes++; });

    // Two clicks dispatched synchronously in the same task simulate a
    // browser forwarding a label's synthetic click even though the first
    // click already targeted the switch directly.
    el.click();
    el.click();
    await nextFrame();
    expect(changes).to.equal(1);
    expect(el.checked).to.equal(true);

    // A later, genuinely separate click (its own task) must still register.
    el.click();
    await nextFrame();
    expect(changes).to.equal(2);
    expect(el.checked).to.equal(false);
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

describe('ty-switch flavors', () => {
  const BRAND = 'rgb(1, 2, 3)';
  const SUCCESS = 'rgb(4, 5, 6)';

  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-color-brand');
    document.documentElement.style.removeProperty('--ty-color-success');
  });

  const trackColor = (el: any) =>
    getComputedStyle(el.shadowRoot.querySelector('.switch-track')).backgroundColor;

  it('colors the checked track from a built-in flavor', async () => {
    document.documentElement.style.setProperty('--ty-color-success', SUCCESS);
    const el = (await fixture(html`<ty-switch flavor="success" checked></ty-switch>`)) as any;
    await nextFrame();
    expect(trackColor(el)).to.equal(SUCCESS);
  });

  it('derives styling for a custom flavor from design tokens', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', BRAND);
    const el = (await fixture(html`<ty-switch flavor="brand" checked></ty-switch>`)) as any;
    await nextFrame();
    expect(trackColor(el)).to.equal(BRAND);
  });

  it('page-level --switch-track rules override a custom flavor (escape hatch)', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', BRAND);
    const wrap = await fixture(html`
      <div>
        <style>ty-switch[flavor="brand"] { --switch-track: rgb(9, 9, 9); }</style>
        <ty-switch flavor="brand" checked></ty-switch>
      </div>
    `);
    await nextFrame();
    const el = wrap.querySelector('ty-switch') as any;
    expect(trackColor(el)).to.equal('rgb(9, 9, 9)');
  });
});
