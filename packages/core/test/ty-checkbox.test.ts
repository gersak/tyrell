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
