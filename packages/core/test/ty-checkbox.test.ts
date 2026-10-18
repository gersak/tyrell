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

  it('ignores the click a <label> forwards after a click on the checkbox itself (Firefox), but not a later one', async () => {
    const label = (await fixture(html`<label><ty-checkbox></ty-checkbox> Terms</label>`)) as HTMLElement;
    const el = label.querySelector('ty-checkbox') as any;
    await nextFrame();

    let changes = 0;
    let clicks = 0;
    el.addEventListener('change', () => { changes++; });
    el.addEventListener('click', () => { clicks++; });

    // Firefox's <label> doesn't see a click on the shadow content as a click
    // on the control: once it has dispatched, the label forwards one more
    // to the host, at the same point, after a microtask checkpoint.
    const at = { bubbles: true, composed: true, clientX: 5, clientY: 7 };
    el.shadowRoot.querySelector('.checkbox-container').dispatchEvent(new MouseEvent('click', at));
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
    const label = (await fixture(html`<label> Terms</label>`)) as HTMLElement;
    const el = document.createElement('ty-checkbox') as any;
    let early = 0;
    let captured = 0;
    el.addEventListener('click', () => { early++; });
    const onCapture = (e: Event) => { if (e.target === el) captured++; };
    document.addEventListener('click', onCapture, true);
    label.prepend(el);
    await nextFrame();

    const at = { bubbles: true, composed: true, clientX: 5, clientY: 7 };
    el.shadowRoot.querySelector('.checkbox-container').dispatchEvent(new MouseEvent('click', at));
    await Promise.resolve();
    el.dispatchEvent(new MouseEvent('click', at));
    await new Promise((r) => setTimeout(r));
    document.removeEventListener('click', onCapture, true);
    expect({ early, captured }).to.deep.equal({ early: 1, captured: 1 });
    expect(el.checked).to.equal(true);
  });

  // Like a native disabled checkbox. At tabindex=-1 the checkbox was still
  // focusable, and the host (delegatesFocus) handed it a <label> click's
  // focus, with Chromium's keyboard ring.
  it('disabled: a <label> click focuses nothing and draws no ring', async () => {
    const wrap = (await fixture(html`<div><input id="before"><label><ty-checkbox disabled></ty-checkbox> Terms</label><input id="after"></div>`)) as HTMLElement;
    const el = wrap.querySelector('ty-checkbox') as any;
    const ringEl = el.shadowRoot.querySelector('.checkbox-container') as HTMLElement;
    ringEl.style.setProperty('transition', 'none', 'important');
    el.style.setProperty('--checkbox-ring', 'rgb(1, 2, 3)');
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
    const el = (await fixture(html`<ty-checkbox></ty-checkbox>`)) as any;
    await nextFrame();
    let changes = 0;
    el.addEventListener('change', () => { changes++; });
    el.click();
    el.click();
    await new Promise((r) => setTimeout(r));
    expect(changes).to.equal(2);
    expect(el.checked).to.equal(false);
  });

  it('a <label> click focuses the checkbox without a focus ring; keys bring it back', async () => {
    const label = (await fixture(html`<label><ty-checkbox></ty-checkbox> Terms</label>`)) as HTMLLabelElement;
    const el = label.querySelector('ty-checkbox') as any;
    await nextFrame();
    const box = el.shadowRoot.querySelector('.checkbox-container') as HTMLElement;
    box.style.setProperty('transition', 'none', 'important');
    el.style.setProperty('--checkbox-ring', 'rgb(1, 2, 3)');

    // Chromium focuses the box as :focus-visible here (a script-type focus).
    label.click();
    await nextFrame();
    expect(el.shadowRoot.activeElement === box, 'focused').to.equal(true);
    expect(getComputedStyle(box).boxShadow, 'no ring').to.equal('none');

    box.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await nextFrame();
    expect(el.checked).to.equal(false);
    expect(getComputedStyle(box).boxShadow, 'ring after a key').to.not.equal('none');
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

describe('ty-checkbox flavor tones', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-color-primary');
    document.documentElement.style.removeProperty('--ty-color-primary-strong');
  });

  it('flavor="primary+" resolves the -strong token when checked', async () => {
    document.documentElement.style.setProperty('--ty-color-primary', 'rgb(1, 2, 3)');
    document.documentElement.style.setProperty('--ty-color-primary-strong', 'rgb(4, 5, 6)');
    const el = (await fixture(html`<ty-checkbox flavor="primary+" checked></ty-checkbox>`)) as any;
    await nextFrame();
    const cs = getComputedStyle(el.shadowRoot.querySelector('.checkbox-container'));
    expect(cs.color).to.equal('rgb(4, 5, 6)');
  });
});

describe('ty-checkbox focus ring follows flavor', () => {
  it('rings in the flavor color, not a fixed primary', async () => {
    document.documentElement.style.setProperty('--ty-color-danger', 'rgb(7, 8, 9)');
    document.documentElement.style.setProperty('--ty-color-primary', 'rgb(1, 2, 3)');
    const el = (await fixture(html`<ty-checkbox flavor="danger" checked></ty-checkbox>`)) as any;
    await nextFrame();
    const container = el.shadowRoot.querySelector('.checkbox-container') as HTMLElement;
    // .focused is a real class the component toggles on keyboard focus
    // (see setupEventListeners) — set it directly to exercise the same
    // rule :focus-visible would, without needing a real focus event.
    // .checkbox-container has `transition: all 0.15s` — without disabling
    // it, a computed-style read shortly after toggling .focused catches an
    // interpolated (near-zero) box-shadow mid-animation, not the final value.
    container.style.setProperty('transition', 'none', 'important');
    container.classList.add('focused');
    const ring = getComputedStyle(container).boxShadow;
    // color-mix() results serialize in the mix's color space (oklab), not
    // the original rgb() string — assert shape/alpha, not an exact color.
    expect(ring, 'ring is a 3px spread').to.match(/0px 0px 0px 3px/);
    expect(ring, 'ring is at 25% alpha (the danger mix, not primary\'s)').to.match(/\/ 0\.25\)/);
    document.documentElement.style.removeProperty('--ty-color-danger');
    document.documentElement.style.removeProperty('--ty-color-primary');
  });
});
