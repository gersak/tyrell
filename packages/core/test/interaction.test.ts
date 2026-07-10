import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../lib/components/checkbox.js';
import '../lib/components/switch.js';
import '../lib/components/radio.js';

// Keyboard / pointer interaction per the components' ARIA contracts. Handlers
// live on the inner role element (checkbox/switch) or the group (radio), so we
// dispatch against those and assert state + the `change` business event.
describe('interaction', () => {
  it('ty-checkbox: Space toggles checked and emits change', async () => {
    const el = (await fixture(html`<ty-checkbox></ty-checkbox>`)) as any;
    await nextFrame();
    const box = el.shadowRoot.querySelector('.checkbox-container') as HTMLElement;
    expect(el.checked).to.be.false;
    setTimeout(() => box.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })));
    const ev = await oneEvent(el, 'change');
    expect(ev.detail.checked).to.be.true;
    expect(el.checked).to.be.true;
  });

  it('ty-checkbox: clicking the host toggles checked', async () => {
    // Click handler lives on the HOST (whole element is the trigger); a real
    // click anywhere on it toggles.
    const el = (await fixture(html`<ty-checkbox checked></ty-checkbox>`)) as any;
    await nextFrame();
    setTimeout(() => el.click());
    const ev = await oneEvent(el, 'change');
    expect(ev.detail.checked).to.be.false;
    expect(el.checked).to.be.false;
  });

  it('ty-switch: Space toggles and emits change', async () => {
    const el = (await fixture(html`<ty-switch></ty-switch>`)) as any;
    await nextFrame();
    const track = el.shadowRoot.querySelector('.switch-container') as HTMLElement;
    setTimeout(() => track.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })));
    const ev = await oneEvent(el, 'change');
    expect(ev.detail.checked).to.be.true;
    expect(el.checked).to.be.true;
  });

  it('ty-switch: wrapping <label> click toggles (delegation)', async () => {
    const label = (await fixture(html`
      <label><ty-switch name="s"></ty-switch> Enable</label>
    `)) as HTMLLabelElement;
    const sw = label.querySelector('ty-switch') as any;
    await nextFrame();
    label.click();
    await nextFrame();
    expect(sw.checked).to.be.true;
  });

  it('ty-radio: wrapping <label> click selects it in the group (delegation)', async () => {
    const el = (await fixture(html`
      <ty-radio-group>
        <label><ty-radio value="a"></ty-radio> A</label>
        <label><ty-radio value="b"></ty-radio> B</label>
      </ty-radio-group>
    `)) as any;
    await nextFrame();
    const labels = el.querySelectorAll('label');
    (labels[1] as HTMLLabelElement).click();
    await nextFrame();
    expect(el.value).to.equal('b');
  });

  it('ty-checkbox: still works after disconnect + reconnect', async () => {
    const wrap = (await fixture(html`<div><ty-checkbox></ty-checkbox></div>`)) as HTMLElement;
    const cb = wrap.querySelector('ty-checkbox') as any;
    await nextFrame();
    // Move it in the DOM — disconnect removes listeners; render must re-arm them
    cb.remove();
    wrap.appendChild(cb);
    await nextFrame();
    cb.click();
    await nextFrame();
    expect(cb.checked).to.be.true;
  });

  it('ty-radio-group: ArrowDown moves selection and emits change', async () => {
    const el = (await fixture(html`
      <ty-radio-group value="a">
        <label><ty-radio value="a"></ty-radio> A</label>
        <label><ty-radio value="b"></ty-radio> B</label>
      </ty-radio-group>
    `)) as any;
    await nextFrame();
    const radios = el.querySelectorAll('ty-radio');
    // Focusing the inner role element makes the host the document.activeElement,
    // which is how the group identifies the "current" radio.
    (radios[0].shadowRoot.querySelector('.radio-container') as HTMLElement).focus();
    setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
    const ev = await oneEvent(el, 'change');
    expect(ev.detail.value).to.equal('b');
    expect(el.value).to.equal('b');
  });
});
