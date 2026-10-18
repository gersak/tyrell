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

  it('ignores the click a <label> forwards after a click on the switch itself (Firefox), but not a later one', async () => {
    const label = (await fixture(html`<label><ty-switch></ty-switch> Alerts</label>`)) as HTMLElement;
    const el = label.querySelector('ty-switch') as any;
    await nextFrame();

    let changes = 0;
    let clicks = 0;
    el.addEventListener('change', () => { changes++; });
    el.addEventListener('click', () => { clicks++; });

    // Firefox's <label> forwards one more click to the host after a click
    // on the switch itself, at the same point, after a microtask checkpoint.
    const at = { bubbles: true, composed: true, clientX: 5, clientY: 7 };
    el.shadowRoot.querySelector('.switch-track').dispatchEvent(new MouseEvent('click', at));
    await Promise.resolve();
    el.dispatchEvent(new MouseEvent('click', at));
    // change is dispatched from a timeout: wait a task, not a frame.
    await new Promise((r) => setTimeout(r));
    expect(changes).to.equal(1);
    expect(clicks, 'page listeners see one click').to.equal(1);
    expect(el.checked).to.equal(true);

    // A later click at the same point, in a task of its own, registers.
    el.dispatchEvent(new MouseEvent('click', at));
    await new Promise((r) => setTimeout(r));
    expect(changes).to.equal(2);
    expect(el.checked).to.equal(false);
  });

  // Listeners that run before the component's own: one a framework added
  // before inserting the element (Vue @click), a capture one on the document
  // (React's onClickCapture). Firefox's forwarded click reached them too.
  it('the forwarded click reaches no page listener, not even an early or a capture one', async () => {
    const label = (await fixture(html`<label> Alerts</label>`)) as HTMLElement;
    const el = document.createElement('ty-switch') as any;
    let early = 0;
    let captured = 0;
    el.addEventListener('click', () => { early++; });
    const onCapture = (e: Event) => { if (e.target === el) captured++; };
    document.addEventListener('click', onCapture, true);
    label.prepend(el);
    await nextFrame();

    const at = { bubbles: true, composed: true, clientX: 5, clientY: 7 };
    el.shadowRoot.querySelector('.switch-track').dispatchEvent(new MouseEvent('click', at));
    await Promise.resolve();
    el.dispatchEvent(new MouseEvent('click', at));
    await new Promise((r) => setTimeout(r));
    document.removeEventListener('click', onCapture, true);
    expect({ early, captured }).to.deep.equal({ early: 1, captured: 1 });
    expect(el.checked).to.equal(true);
  });

  // Like a native disabled checkbox. At tabindex=-1 the switch was still
  // focusable, and the host (delegatesFocus) handed it a <label> click's
  // focus, with Chromium's keyboard ring.
  it('disabled: a <label> click focuses nothing and draws no ring', async () => {
    const wrap = (await fixture(html`<div><input id="before"><label><ty-switch disabled></ty-switch> Alerts</label><input id="after"></div>`)) as HTMLElement;
    const el = wrap.querySelector('ty-switch') as any;
    const ringEl = el.shadowRoot.querySelector('.switch-track') as HTMLElement;
    ringEl.style.setProperty('transition', 'none', 'important');
    el.style.setProperty('--ty-input-shadow-focus', 'rgb(1, 2, 3)');
    await nextFrame();

    (wrap.querySelector('label') as HTMLLabelElement).click();
    await nextFrame();
    expect(document.activeElement === el, 'not focused').to.equal(false);
    expect(getComputedStyle(ringEl).boxShadow, 'no ring').to.equal('none');
    expect(el.checked).to.equal(false);

    el.focus();
    expect(document.activeElement === el, 'focus() does nothing').to.equal(false);

    el.disabled = false;
    el.focus();
    expect(document.activeElement === el, 'enabled again: focusable').to.equal(true);
  });

  it('two click() calls in a row toggle twice, like a native checkbox', async () => {
    const el = (await fixture(html`<ty-switch></ty-switch>`)) as any;
    await nextFrame();
    let changes = 0;
    el.addEventListener('change', () => { changes++; });
    el.click();
    el.click();
    await new Promise((r) => setTimeout(r));
    expect(changes).to.equal(2);
    expect(el.checked).to.equal(false);
  });

  it('a <label> click focuses the switch without a focus ring; keys bring it back', async () => {
    const label = (await fixture(html`<label><ty-switch></ty-switch> Alerts</label>`)) as HTMLLabelElement;
    const el = label.querySelector('ty-switch') as any;
    await nextFrame();
    const box = el.shadowRoot.querySelector('.switch-container') as HTMLElement;
    const track = box.querySelector('.switch-track') as HTMLElement;
    track.style.setProperty('transition', 'none', 'important');
    el.style.setProperty('--ty-input-shadow-focus', 'rgb(1, 2, 3)');

    // Chromium focuses the switch as :focus-visible here (a script-type focus).
    label.click();
    await nextFrame();
    expect(el.shadowRoot.activeElement === box, 'focused').to.equal(true);
    expect(getComputedStyle(track).boxShadow, 'no ring').to.equal('none');

    box.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await nextFrame();
    expect(el.checked).to.equal(false);
    expect(getComputedStyle(track).boxShadow, 'ring after a key').to.not.equal('none');
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
