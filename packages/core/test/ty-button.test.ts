import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/button.js';
import '../lib/components/input.js';

// type=submit goes through form.requestSubmit(), which respects constraint
// validation — so this is also an end-to-end check of ty-input's setValidity.

const clickInner = (host: Element) =>
  (host.shadowRoot!.querySelector('button') as HTMLButtonElement).click();

describe('ty-button — form submission', () => {
  it('submits a valid form', async () => {
    const form = (await fixture(html`
      <form>
        <ty-input name="x" value="ok"></ty-input>
        <ty-button type="submit">Go</ty-button>
      </form>
    `)) as HTMLFormElement;
    await nextFrame();
    let submitted = false;
    form.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });

    clickInner(form.querySelector('ty-button')!);
    await nextFrame();
    expect(submitted).to.equal(true);
  });

  it('is blocked when a required field is empty', async () => {
    const form = (await fixture(html`
      <form>
        <ty-input name="x" required></ty-input>
        <ty-button type="submit">Go</ty-button>
      </form>
    `)) as HTMLFormElement;
    await nextFrame();
    let submitted = false;
    form.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });

    clickInner(form.querySelector('ty-button')!);
    await nextFrame();
    expect(submitted).to.equal(false); // requestSubmit respects validity
  });

  it('emits a click event', async () => {
    const el = await fixture(html`<ty-button>Hi</ty-button>`);
    let clicked = false;
    el.addEventListener('click', () => { clicked = true; });
    clickInner(el);
    await nextFrame();
    expect(clicked).to.equal(true);
  });
});

describe('ty-button custom flavors', () => {
  const BG = 'rgb(1, 2, 3)';
  const FG = 'rgb(4, 5, 6)';
  const NEUTRAL = 'rgb(7, 8, 9)';

  afterEach(() => {
    for (const p of ['--ty-solid-brand', '--ty-solid-brand-fg', '--ty-solid-neutral', '--ty-color-brand']) {
      document.documentElement.style.removeProperty(p);
    }
  });

  it('solid appearance derives from --ty-solid-X tokens', async () => {
    document.documentElement.style.setProperty('--ty-solid-brand', BG);
    document.documentElement.style.setProperty('--ty-solid-brand-fg', FG);
    const el = await fixture(html`<ty-button flavor="brand">Brand</ty-button>`);
    await nextFrame();
    const cs = getComputedStyle(el.shadowRoot!.querySelector('button')!);
    expect(cs.backgroundColor).to.equal(BG);
    expect(cs.color).to.equal(FG);
  });

  it('falls back to neutral tokens when the custom token is missing', async () => {
    document.documentElement.style.setProperty('--ty-solid-neutral', NEUTRAL);
    const el = await fixture(html`<ty-button flavor="brand">Brand</ty-button>`);
    await nextFrame();
    const cs = getComputedStyle(el.shadowRoot!.querySelector('button')!);
    expect(cs.backgroundColor).to.equal(NEUTRAL);
  });

  it('ghost + tone suffix uses the shade token', async () => {
    document.documentElement.style.setProperty('--ty-color-brand-strong', FG);
    const el = await fixture(html`<ty-button appearance="ghost" flavor="brand+">Brand</ty-button>`);
    await nextFrame();
    const cs = getComputedStyle(el.shadowRoot!.querySelector('button')!);
    expect(cs.color).to.equal(FG);
    document.documentElement.style.removeProperty('--ty-color-brand-strong');
  });
});
