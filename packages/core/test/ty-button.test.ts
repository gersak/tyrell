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

// The button's size ladder lives on the host as --ty-button-* vars (styles/
// button.ts) and the inner <button> only reads them. Two guarantees ride on
// that: the rungs keep their documented pixel heights, and the outside can
// actually reach the control — host styling never could, it only grew the
// wrapper and left a dead strip over the gap.

const innerOf = (host: Element) =>
  host.shadowRoot!.querySelector('button') as HTMLButtonElement;

const h = (host: Element) => innerOf(host).getBoundingClientRect().height;

describe('ty-button — size ladder', () => {
  // 4px ladder, paired with the field scale: button md === field sm === 32px.
  const RUNGS: Array<[string, number]> = [
    ['xs', 24], ['sm', 28], ['md', 32], ['lg', 36], ['xl', 40],
  ];

  for (const [size, px] of RUNGS) {
    it(`size="${size}" is ${px}px tall`, async () => {
      const el = await fixture(html`<ty-button size="${size}">Go</ty-button>`);
      await nextFrame();
      expect(h(el)).to.equal(px);
    });
  }

  it('defaults to the sm rung with no size attribute', async () => {
    const el = await fixture(html`<ty-button>Go</ty-button>`);
    await nextFrame();
    expect(h(el)).to.equal(28);
  });

  it('keeps the action square per rung', async () => {
    const el = await fixture(html`<ty-button action size="lg"><ty-icon name="x"></ty-icon></ty-button>`);
    await nextFrame();
    const box = innerOf(el).getBoundingClientRect();
    expect(box.height).to.equal(36);
    expect(box.width).to.equal(36);
  });
});

describe('ty-button — the outside can reach the control', () => {
  let sheet: HTMLStyleElement | null = null;

  const styleDocument = (css: string) => {
    sheet = document.createElement('style');
    sheet.textContent = css;
    document.head.appendChild(sheet);
  };

  afterEach(() => {
    sheet?.remove();
    sheet = null;
  });

  it('exposes part="button"', async () => {
    const el = await fixture(html`<ty-button>Go</ty-button>`);
    await nextFrame();
    expect(innerOf(el).getAttribute('part')).to.equal('button');
  });

  it('::part(button) min-height grows the control, not just the host', async () => {
    styleDocument('ty-button.tall::part(button) { min-height: 44px }');
    const el = await fixture(html`<ty-button class="tall" size="sm">Go</ty-button>`);
    await nextFrame();
    expect(h(el)).to.equal(44);
    // The host must not be left taller than the control it wraps.
    expect(el.getBoundingClientRect().height).to.equal(44);
  });

  it('--ty-button-height on the host overrides the rung', async () => {
    // Normal declarations in the outer tree beat :host — that is the whole
    // reason the ladder is declared there and not on the inner button.
    styleDocument('ty-button.tall { --ty-button-height: 44px }');
    const el = await fixture(html`<ty-button class="tall" size="sm">Go</ty-button>`);
    await nextFrame();
    expect(h(el)).to.equal(44);
  });

  it('--ty-button-min-width is reachable', async () => {
    styleDocument('ty-button.narrow { --ty-button-min-width: 0px }');
    const el = await fixture(html`<ty-button class="narrow">x</ty-button>`);
    await nextFrame();
    expect(innerOf(el).getBoundingClientRect().width).to.be.below(64);
  });
});
