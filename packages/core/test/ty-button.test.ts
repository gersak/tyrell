import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { sendMouse, resetMouse, sendKeys } from '@web/test-runner-commands';
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

  it('focus() focuses the inner button', async () => {
    const el = (await fixture(html`<ty-button>Go</ty-button>`)) as HTMLElement;
    await nextFrame();
    el.focus();
    expect(el.shadowRoot!.activeElement === innerOf(el)).to.equal(true);
  });
});

// The host is a one-cell grid around the control (styles/button.ts :host).
// Whatever box the host ends up with, the control must cover all of it —
// otherwise the uncovered part looks like button and swallows clicks (no
// click event, no submit). And when nothing imposes a box, the host must
// hug the control exactly as the old inline-block did.

const rect = (el: Element) => {
  const r = el.getBoundingClientRect();
  return [r.x, r.y, r.width, r.height].map((n) => Math.round(n * 100) / 100);
};

const expectFilled = (host: Element) =>
  expect(rect(innerOf(host)), 'inner button rect').to.deep.equal(rect(host));

describe('ty-button — the control fills the host box', () => {
  afterEach(() => resetMouse());

  it('stretched by a flex column', async () => {
    const wrap = await fixture(html`
      <div style="display:flex;flex-direction:column;width:300px">
        <ty-button>Go</ty-button>
      </div>`);
    await nextFrame();
    const el = wrap.querySelector('ty-button')!;
    expect(el.getBoundingClientRect().width).to.equal(300);
    expectFilled(el);
  });

  it('stretched by a grid cell', async () => {
    const wrap = await fixture(html`
      <div style="display:grid;grid-template-columns:240px">
        <ty-button size="lg">Go</ty-button>
      </div>`);
    await nextFrame();
    const el = wrap.querySelector('ty-button')!;
    expect(el.getBoundingClientRect().width).to.equal(240);
    expectFilled(el);
  });

  it('width: 100% on the host', async () => {
    const wrap = await fixture(html`
      <div style="width:300px"><ty-button style="width:100%">Go</ty-button></div>`);
    await nextFrame();
    const el = wrap.querySelector('ty-button')!;
    expect(el.getBoundingClientRect().width).to.equal(300);
    expectFilled(el);
  });

  it('explicit height / min-height on the host', async () => {
    const wrap = await fixture(html`
      <div>
        <ty-button style="height:60px">Go</ty-button>
        <ty-button style="min-height:44px">Go</ty-button>
        <ty-button action style="width:80px;height:50px">x</ty-button>
      </div>`);
    await nextFrame();
    const [a, b, c] = wrap.querySelectorAll('ty-button');
    expect(a.getBoundingClientRect().height).to.equal(60);
    expect(b.getBoundingClientRect().height).to.equal(44);
    for (const el of [a, b, c]) expectFilled(el);
  });

  it('a real click near the right edge of a stretched host submits the form', async () => {
    const form = (await fixture(html`
      <form style="display:flex;flex-direction:column;width:300px">
        <ty-button type="submit">Go</ty-button>
      </form>`)) as HTMLFormElement;
    await nextFrame();
    let submitted = 0;
    form.addEventListener('submit', (e) => { e.preventDefault(); submitted++; });

    const r = form.querySelector('ty-button')!.getBoundingClientRect();
    // Far from the label: before the fix this was the empty end of the host.
    await sendMouse({ type: 'click', position: [Math.round(r.right - 4), Math.round(r.top + r.height / 2)] });
    await nextFrame();
    expect(submitted).to.equal(1);
  });
});

describe('ty-button — an unstretched host is sized exactly as before', () => {
  const RUNGS: Array<[string, number, number]> = [
    // size, rung height, action square
    ['xs', 24, 22], ['sm', 28, 24], ['md', 32, 32], ['lg', 36, 36], ['xl', 40, 40],
  ];

  for (const [size, px, square] of RUNGS) {
    it(`size="${size}" inline: host hugs a ${px}px control, action stays ${square}px square`, async () => {
      const p = await fixture(html`
        <p>Text <ty-button size="${size}">Go</ty-button>
          <ty-button size="${size}" action><ty-icon name="x"></ty-icon></ty-button> text</p>`);
      await nextFrame();
      const [btn, action] = p.querySelectorAll('ty-button');
      expect(rect(btn)[3]).to.equal(px);
      expect(rect(btn)[2]).to.equal(64); // short label → the 4rem min-width
      expectFilled(btn);
      expect(rect(action).slice(2)).to.deep.equal([square, square]);
      expectFilled(action);
    });

    it(`size="${size}" in a flex row next to a taller sibling stays ${px}px`, async () => {
      // Default align-items: stretch. The host must not grow with the row —
      // filling it would turn the button into a slab.
      const row = await fixture(html`
        <div style="display:flex;gap:8px">
          <div style="height:80px;width:20px"></div>
          <ty-button size="${size}">Go</ty-button>
          <ty-button size="${size}" action><ty-icon name="x"></ty-icon></ty-button>
        </div>`);
      await nextFrame();
      const [btn, action] = row.querySelectorAll('ty-button');
      expect(rect(btn).slice(2)).to.deep.equal([64, px]);
      expectFilled(btn);
      expect(rect(action).slice(2)).to.deep.equal([square, square]);
      expectFilled(action);
    });
  }

  it('an action host is not stretched by a flex column', async () => {
    const col = await fixture(html`
      <div style="display:flex;flex-direction:column;width:300px">
        <ty-button action size="lg"><ty-icon name="x"></ty-icon></ty-button>
      </div>`);
    await nextFrame();
    const el = col.querySelector('ty-button')!;
    expect(rect(el).slice(2)).to.deep.equal([36, 36]);
    expectFilled(el);
  });

  it('a squeezed flex row does not crush a long label', async () => {
    const LABEL = 'A much longer label for a button';
    const wrap = await fixture(html`
      <div>
        <ty-button>${LABEL}</ty-button>
        <div style="display:flex;width:200px">
          <div style="flex:1 0 190px"></div>
          <ty-button>${LABEL}</ty-button>
        </div>
      </div>`);
    await nextFrame();
    const [free, squeezed] = wrap.querySelectorAll('ty-button');
    expect(rect(free)[2]).to.be.above(64);
    expect(rect(squeezed)[2]).to.equal(rect(free)[2]);
    expectFilled(squeezed);
  });

  it('wide still fills the line, action included', async () => {
    const wrap = await fixture(html`
      <div style="width:300px">
        <ty-button wide>Go</ty-button>
        <ty-button wide action><ty-icon name="x"></ty-icon></ty-button>
      </div>`);
    await nextFrame();
    for (const el of wrap.querySelectorAll('ty-button')) {
      expect(el.getBoundingClientRect().width).to.equal(300);
      expectFilled(el);
    }
  });
});

describe('ty-button — fill survives consumer layout styles', () => {
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

  it('wide fills with display: flex or justify-content on the host (Tailwind flex / justify-center)', async () => {
    const wrap = await fixture(html`
      <div style="width:300px">
        <ty-button wide style="display:flex">Go</ty-button>
        <ty-button wide style="display:flex;align-items:center;justify-content:center;gap:8px">Go</ty-button>
        <ty-button wide style="justify-content:center">Go</ty-button>
        <ty-button style="width:100%;justify-content:center">Go</ty-button>
      </div>`);
    await nextFrame();
    for (const el of wrap.querySelectorAll('ty-button')) {
      expect(el.getBoundingClientRect().width).to.equal(300);
      expectFilled(el);
    }
  });

  it('a host height fills even with align-content on the host', async () => {
    const el = await fixture(html`<ty-button style="height:56px;align-content:center">Go</ty-button>`);
    await nextFrame();
    expectFilled(el);
  });

  it('::part(button) { height: 100% } never shrinks the button below its rung', async () => {
    styleDocument('.fill ty-button::part(button) { height: 100% }');
    const wrap = await fixture(html`
      <div class="fill">
        <ty-button>Go</ty-button>
        <div style="display:flex;height:48px"><ty-button size="lg">Go</ty-button></div>
      </div>`);
    await nextFrame();
    const [free, row] = wrap.querySelectorAll('ty-button');
    expect(rect(free)[3]).to.equal(28);
    expectFilled(free);
    expect(rect(row)[3]).to.equal(36);
    expectFilled(row);
  });

  it('height: auto on the host lets a flex row stretch it, and the button fills', async () => {
    const row = await fixture(html`
      <div style="display:flex;gap:8px">
        <div style="height:60px;width:20px"></div>
        <ty-button style="height:auto">Go</ty-button>
      </div>`);
    await nextFrame();
    const el = row.querySelector('ty-button')!;
    expect(rect(el)[3]).to.equal(60);
    expectFilled(el);
  });

  it('wide in a flex column with room to spare stays at its rung height', async () => {
    const col = await fixture(html`
      <div style="display:flex;flex-direction:column;width:300px;height:200px">
        <ty-button wide>Go</ty-button>
      </div>`);
    await nextFrame();
    expect(rect(innerOf(col.querySelector('ty-button')!)).slice(2)).to.deep.equal([300, 28]);
  });

  it('wide in a flex column with room to spare: the host stays at the button too', async () => {
    const col = await fixture(html`
      <div style="display:flex;flex-direction:column;width:300px;height:200px">
        <ty-button wide>Go</ty-button>
        <div>next</div>
      </div>`);
    await nextFrame();
    const el = col.querySelector('ty-button')!;
    expect(rect(el).slice(2)).to.deep.equal([300, 28]);
    expect(col.querySelector('div')!.getBoundingClientRect().top).to.equal(el.getBoundingClientRect().bottom);
  });

  it('action given only a height (or a width) is a bigger square, filled', async () => {
    const wrap = await fixture(html`
      <div>
        <ty-button action style="height:40px"><ty-icon name="x"></ty-icon></ty-button>
        <ty-button action style="width:50px"><ty-icon name="x"></ty-icon></ty-button>
      </div>`);
    await nextFrame();
    const [byHeight, byWidth] = wrap.querySelectorAll('ty-button');
    expect(rect(byHeight).slice(2)).to.deep.equal([40, 40]);
    expectFilled(byHeight);
    expect(rect(byWidth).slice(2)).to.deep.equal([50, 50]);
    expectFilled(byWidth);
  });

  it('action: ::part(button) min-width / min-height raise the square and keep the fill', async () => {
    styleDocument('.tap ty-button::part(button) { min-width: 44px; min-height: 44px }');
    const wrap = await fixture(html`
      <div class="tap">
        <ty-button action><ty-icon name="x"></ty-icon></ty-button>
        <ty-button action style="width:60px;height:60px"><ty-icon name="x"></ty-icon></ty-button>
      </div>`);
    await nextFrame();
    const [free, sized] = wrap.querySelectorAll('ty-button');
    expect(rect(free).slice(2)).to.deep.equal([44, 44]);
    expectFilled(free);
    expectFilled(sized);
  });

  it('action / size set as properties before the element connects still apply', async () => {
    // A framework (React, Vue, Reagent) assigning before upgrade leaves an own
    // property; the host CSS keys off the attribute, so it must be reflected.
    const col = await fixture(html`<div style="display:flex;flex-direction:column;width:300px"></div>`);
    const el = document.createElement('ty-button') as any;
    Object.defineProperty(el, 'action', { value: true, writable: true, configurable: true });
    Object.defineProperty(el, 'size', { value: 'lg', writable: true, configurable: true });
    el.textContent = 'x';
    col.appendChild(el);
    await nextFrame();
    expect(el.hasAttribute('action')).to.equal(true);
    expect(el.getAttribute('size')).to.equal('lg');
    expect(rect(el).slice(2)).to.deep.equal([36, 36]);
    expectFilled(el);
  });
});

// Native parity for activation. Real presses go through the inner shadow
// <button> (sendMouse, or .click() on it — what ty-input's implicit
// submission does); host listeners must see what a native <button>'s would.

const center = (el: Element): [number, number] => {
  const r = el.getBoundingClientRect();
  return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)];
};

/** Mount a form and count clicks (host and document), submits and resets. */
async function mountForm(markup: ReturnType<typeof html>) {
  const form = (await fixture(markup)) as HTMLFormElement;
  await nextFrame();
  const el = form.querySelector('ty-button') as HTMLElement;
  const log = { hostClicks: 0, docClicks: 0, submits: 0, resets: 0 };
  const onHost = () => { log.hostClicks++; };
  const onDoc = (e: Event) => { if (e.target === el) log.docClicks++; };
  el.addEventListener('click', onHost);
  document.addEventListener('click', onDoc);
  form.addEventListener('submit', (e) => { e.preventDefault(); log.submits++; });
  form.addEventListener('reset', () => { log.resets++; });
  const cleanup = () => document.removeEventListener('click', onDoc);
  return { form, el, log, cleanup };
}

describe('ty-button — one click per press, listeners before the default action', () => {
  afterEach(() => resetMouse());

  it('a real click reaches the host and the document exactly once, then submits', async () => {
    const { el, log, cleanup } = await mountForm(html`<form><ty-button>Go</ty-button></form>`);
    try {
      await sendMouse({ type: 'click', position: center(el) });
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 1, docClicks: 1, submits: 1, resets: 0 });
    } finally { cleanup(); }
  });

  it('a click on slotted content is still one click', async () => {
    const { el, log, cleanup } = await mountForm(html`
      <form><ty-button><span slot="start">★</span><b>Go</b></ty-button></form>`);
    try {
      await sendMouse({ type: 'click', position: center(el.querySelector('b')!) });
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 1, docClicks: 1, submits: 1, resets: 0 });
    } finally { cleanup(); }
  });

  it('the click is cancelable and keeps detail.originalEvent', async () => {
    const el = await fixture(html`<ty-button type="button">Go</ty-button>`);
    let seen: any = null;
    el.addEventListener('click', (e) => { seen = e; });
    clickInner(el);
    expect(seen.cancelable).to.equal(true);
    expect(seen.detail.originalEvent).to.be.instanceOf(MouseEvent);
  });

  it('preventDefault() on the host cancels the submit', async () => {
    const { el, log, cleanup } = await mountForm(html`<form><ty-button>Go</ty-button></form>`);
    try {
      el.addEventListener('click', (e) => e.preventDefault());
      await sendMouse({ type: 'click', position: center(el) });
      clickInner(el);
      await nextFrame();
      expect(log.hostClicks).to.equal(2);
      expect(log.submits).to.equal(0);
    } finally { cleanup(); }
  });

  it('preventDefault() in a delegated (document) listener cancels the submit', async () => {
    const { el, log, cleanup } = await mountForm(html`<form><ty-button>Go</ty-button></form>`);
    const cancel = (e: Event) => { if (e.target === el) e.preventDefault(); };
    document.addEventListener('click', cancel);
    try {
      clickInner(el);
      await nextFrame();
      expect(log.docClicks).to.equal(1);
      expect(log.submits).to.equal(0);
    } finally {
      cleanup();
      document.removeEventListener('click', cancel);
    }
  });

  it('preventDefault() cancels a reset', async () => {
    const { el, form, log, cleanup } = await mountForm(html`
      <form><input name="q" value="a"><ty-button type="reset">Clear</ty-button></form>`);
    try {
      const input = form.querySelector('input')!;
      input.value = 'changed';
      el.addEventListener('click', (e) => e.preventDefault());
      clickInner(el);
      await nextFrame();
      expect(log.resets).to.equal(0);
      expect(input.value).to.equal('changed');
    } finally { cleanup(); }
  });

  it('the submit sees state a click listener set (listeners run first)', async () => {
    const { el, form, log, cleanup } = await mountForm(html`
      <form><input name="q" value="a"><ty-button>Go</ty-button></form>`);
    let submitted: string | null = null;
    form.addEventListener('submit', () => { submitted = form.querySelector('input')!.value; });
    try {
      el.addEventListener('click', () => { form.querySelector('input')!.value = 'from-click'; });
      clickInner(el);
      await nextFrame();
      expect(log.submits).to.equal(1);
      expect(submitted).to.equal('from-click');
    } finally { cleanup(); }
  });

  it('a click listener that sets loading still submits that press, then blocks the next', async () => {
    const { el, log, cleanup } = await mountForm(html`<form><ty-button>Go</ty-button></form>`);
    try {
      el.addEventListener('click', () => { (el as any).loading = true; });
      clickInner(el);
      clickInner(el);
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 1, docClicks: 1, submits: 1, resets: 0 });
    } finally { cleanup(); }
  });
});

// host.click(), label activation, a press on host padding and fireEvent on the
// host target the host itself and never pass the inner <button>. Native
// button.click() and label activation submit; these must too, and must be
// blocked the same way while disabled or loading.
describe('ty-button — clicks that land on the host', () => {
  afterEach(() => resetMouse());

  const fireOnHost = (el: Element) =>
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));

  it('host.click() and a dispatched MouseEvent: one click each, then submit', async () => {
    const { el, log, cleanup } = await mountForm(html`<form><ty-button>Go</ty-button></form>`);
    try {
      el.click();
      fireOnHost(el);
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 2, docClicks: 2, submits: 2, resets: 0 });
    } finally { cleanup(); }
  });

  it('host.click() resets a type="reset" button\'s form', async () => {
    const { el, log, cleanup } = await mountForm(html`<form><ty-button type="reset">Clear</ty-button></form>`);
    try {
      el.click();
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 1, docClicks: 1, submits: 0, resets: 1 });
    } finally { cleanup(); }
  });

  it('host listeners see the click event ty-button dispatches, not the host-targeted one', async () => {
    const { el, cleanup } = await mountForm(html`<form><ty-button type="button">Go</ty-button></form>`);
    const seen: Event[] = [];
    el.addEventListener('click', (e) => seen.push(e));
    try {
      el.click();
      expect(seen).to.have.length(1);
      expect((seen[0] as CustomEvent).detail.originalEvent).to.be.instanceOf(MouseEvent);
    } finally { cleanup(); }
  });

  it('preventDefault() cancels the submit of a host.click()', async () => {
    const { el, log, cleanup } = await mountForm(html`<form><ty-button>Go</ty-button></form>`);
    try {
      el.addEventListener('click', (e) => e.preventDefault());
      el.click();
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 1, docClicks: 1, submits: 0, resets: 0 });
    } finally { cleanup(); }
  });

  it('a real click on host padding: one click, then submit', async () => {
    const { el, log, cleanup } = await mountForm(html`
      <form><ty-button style="padding: 12px">Go</ty-button></form>`);
    try {
      const r = el.getBoundingClientRect();
      await sendMouse({ type: 'click', position: [Math.round(r.x + 4), Math.round(r.y + r.height / 2)] });
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 1, docClicks: 1, submits: 1, resets: 0 });
    } finally { cleanup(); }
  });

  it('a real click on host area the button does not cover does nothing', async () => {
    // A wide button keeps its height; here a min-height makes the host
    // taller (in Firefox a flex column does too). Empty, so no press.
    const { el, log, cleanup } = await mountForm(html`
      <form><ty-button wide style="min-height:100px">Go</ty-button></form>`);
    try {
      const r = el.getBoundingClientRect();
      expect(innerOf(el).getBoundingClientRect().height).to.equal(28);
      await sendMouse({ type: 'click', position: [Math.round(r.x + r.width / 2), Math.round(r.bottom - 10)] });
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 0, docClicks: 0, submits: 0, resets: 0 });
      await sendMouse({ type: 'click', position: center(innerOf(el)) });
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 1, docClicks: 1, submits: 1, resets: 0 });
    } finally { cleanup(); }
  });

  it('a click on a wrapping <label>: one click, then submit', async () => {
    const { form, log, cleanup } = await mountForm(html`
      <form><label><span>Send it</span> <ty-button>Go</ty-button></label></form>`);
    try {
      await sendMouse({ type: 'click', position: center(form.querySelector('span')!) });
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 1, docClicks: 1, submits: 1, resets: 0 });
    } finally { cleanup(); }
  });

  it('a click listener that calls host.click() again does not loop or submit twice', async () => {
    const { el, log, cleanup } = await mountForm(html`<form><ty-button>Go</ty-button></form>`);
    try {
      el.addEventListener('click', () => (el as HTMLElement).click());
      clickInner(el);
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 1, docClicks: 1, submits: 1, resets: 0 });
    } finally { cleanup(); }
  });

  for (const state of ['disabled', 'loading'] as const) {
    it(`${state}: host.click(), a dispatched MouseEvent, host padding and a label fire nothing`, async () => {
      const { el, form, log, cleanup } = await mountForm(state === 'disabled'
        ? html`<form><label><span>Send it</span> <ty-button disabled style="padding: 12px">Go</ty-button></label></form>`
        : html`<form><label><span>Send it</span> <ty-button loading style="padding: 12px">Go</ty-button></label></form>`);
      try {
        el.click();
        fireOnHost(el);
        const r = el.getBoundingClientRect();
        await sendMouse({ type: 'click', position: [Math.round(r.x + 4), Math.round(r.y + r.height / 2)] });
        await sendMouse({ type: 'click', position: center(form.querySelector('span')!) });
        await nextFrame();
        expect(log).to.deep.equal({ hostClicks: 0, docClicks: 0, submits: 0, resets: 0 });
      } finally { cleanup(); }
    });
  }
});

describe('ty-button — disabled and loading fire no click', () => {
  afterEach(() => resetMouse());

  for (const state of ['disabled', 'loading'] as const) {
    it(`${state}: a real click fires nothing and does not submit`, async () => {
      const { el, log, cleanup } = await mountForm(state === 'disabled'
        ? html`<form><ty-button disabled>Go</ty-button></form>`
        : html`<form><ty-button loading>Go</ty-button></form>`);
      try {
        await sendMouse({ type: 'click', position: center(el) });
        clickInner(el);
        await nextFrame();
        expect(log).to.deep.equal({ hostClicks: 0, docClicks: 0, submits: 0, resets: 0 });
      } finally { cleanup(); }
    });
  }

  // Slotted content is a light-DOM child of the host, so a press on it is a
  // separate hit-test target from the inner button.
  for (const state of ['disabled', 'loading', 'fieldset'] as const) {
    it(`${state}: a real click on slotted content fires nothing either`, async () => {
      const { el, log, cleanup } = await mountForm(state === 'disabled'
        ? html`<form><ty-button disabled><b>Go</b></ty-button></form>`
        : state === 'loading'
          ? html`<form><ty-button loading><b>Go</b></ty-button></form>`
          : html`<form><fieldset disabled><ty-button><b>Go</b></ty-button></fieldset></form>`);
      try {
        await sendMouse({ type: 'click', position: center(el.querySelector('b')!) });
        await nextFrame();
        expect(log).to.deep.equal({ hostClicks: 0, docClicks: 0, submits: 0, resets: 0 });
      } finally { cleanup(); }
    });
  }

  it('loading: Enter / Space on the focused button fire nothing; cleared, they press it', async () => {
    const { el, log, cleanup } = await mountForm(html`<form><ty-button loading>Go</ty-button></form>`);
    try {
      innerOf(el).focus();
      await sendKeys({ press: 'Enter' });
      await sendKeys({ press: 'Space' });
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 0, docClicks: 0, submits: 0, resets: 0 });

      (el as any).loading = false;
      await sendKeys({ press: 'Enter' });
      await sendKeys({ press: 'Space' });
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 2, docClicks: 2, submits: 2, resets: 0 });
    } finally { cleanup(); }
  });

  it('loading: Enter in a field does not submit through it', async () => {
    const { form, log, cleanup } = await mountForm(html`
      <form><ty-input name="q" value="a"></ty-input><ty-button loading>Go</ty-button></form>`);
    try {
      const input = form.querySelector('ty-input')!.shadowRoot!.querySelector('input')!;
      input.focus();
      await sendKeys({ press: 'Enter' });
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 0, docClicks: 0, submits: 0, resets: 0 });
    } finally { cleanup(); }
  });

  it('loading: the inner button stays focusable and reports aria-disabled', async () => {
    const el = await fixture(html`<ty-button loading>Go</ty-button>`);
    await nextFrame();
    const inner = innerOf(el);
    expect(inner.disabled).to.equal(false);
    expect(inner.getAttribute('aria-disabled')).to.equal('true');
    (el as any).loading = false;
    expect(inner.hasAttribute('aria-disabled')).to.equal(false);
  });

  it('loading cleared: clicks and submits again', async () => {
    const { el, log, cleanup } = await mountForm(html`<form><ty-button loading>Go</ty-button></form>`);
    try {
      (el as any).loading = false;
      await sendMouse({ type: 'click', position: center(el) });
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 1, docClicks: 1, submits: 1, resets: 0 });
    } finally { cleanup(); }
  });
});

describe('ty-button — inside <fieldset disabled>', () => {
  afterEach(() => resetMouse());

  it('is disabled: :disabled on the host, inner button disabled, nothing fires', async () => {
    const { el, log, cleanup } = await mountForm(html`
      <form><fieldset disabled><ty-button>Go</ty-button></fieldset></form>`);
    try {
      expect(el.matches(':disabled')).to.equal(true);
      expect(innerOf(el).disabled).to.equal(true);
      expect((el as any).disabled, 'own property stays as set, like native').to.equal(false);
      await sendMouse({ type: 'click', position: center(el) });
      clickInner(el);
      el.click();
      await nextFrame();
      expect(log).to.deep.equal({ hostClicks: 0, docClicks: 0, submits: 0, resets: 0 });
    } finally { cleanup(); }
  });

  it('follows the fieldset when it is disabled later and re-enabled', async () => {
    const { form, el, log, cleanup } = await mountForm(html`
      <form><fieldset><ty-button type="reset">Clear</ty-button></fieldset></form>`);
    const fieldset = form.querySelector('fieldset')!;
    try {
      fieldset.disabled = true;
      await nextFrame();
      expect(innerOf(el).disabled).to.equal(true);
      await sendMouse({ type: 'click', position: center(el) });
      clickInner(el);
      await nextFrame();
      expect(log.hostClicks + log.resets).to.equal(0);

      fieldset.disabled = false;
      await nextFrame();
      expect(innerOf(el).disabled).to.equal(false);
      expect(el.matches(':disabled')).to.equal(false);
      await sendMouse({ type: 'click', position: center(el) });
      await nextFrame();
      expect(log.hostClicks).to.equal(1);
      expect(log.resets).to.equal(1);
    } finally { cleanup(); }
  });

  it('its own disabled attribute survives the fieldset being re-enabled', async () => {
    const wrap = await fixture(html`<fieldset disabled><ty-button disabled>Go</ty-button></fieldset>`);
    await nextFrame();
    const el = wrap.querySelector('ty-button')!;
    (wrap as HTMLFieldSetElement).disabled = false;
    await nextFrame();
    expect(innerOf(el).disabled).to.equal(true);
  });

  it('moving the button out of the disabled fieldset enables it', async () => {
    const wrap = await fixture(html`<div><fieldset disabled><ty-button>Go</ty-button></fieldset></div>`);
    await nextFrame();
    const el = wrap.querySelector('ty-button')!;
    expect(innerOf(el).disabled).to.equal(true);
    wrap.appendChild(el);
    await nextFrame();
    expect(innerOf(el).disabled).to.equal(false);
  });

  it('the first <legend> is exempt, like native', async () => {
    const wrap = await fixture(html`
      <fieldset disabled><legend><ty-button>In legend</ty-button></legend><ty-button>Body</ty-button></fieldset>`);
    await nextFrame();
    const [inLegend, body] = wrap.querySelectorAll('ty-button');
    expect(innerOf(inLegend).disabled).to.equal(false);
    expect(innerOf(body).disabled).to.equal(true);
  });

  it('a disabled default button blocks Enter-submission from a field outside the fieldset', async () => {
    const { form, log, cleanup } = await mountForm(html`
      <form><ty-input name="q" value="a"></ty-input><fieldset disabled><ty-button>Go</ty-button></fieldset></form>`);
    try {
      const input = form.querySelector('ty-input')!.shadowRoot!.querySelector('input')!;
      input.focus();
      await sendKeys({ press: 'Enter' });
      await nextFrame();
      expect(log.submits).to.equal(0);
      expect(log.hostClicks).to.equal(0);
    } finally { cleanup(); }
  });
});

describe('ty-button — action pill is the round icon button', () => {
  it('a circle at every rung', async () => {
    const wrap = await fixture(html`
      <div>${['xs', 'sm', 'md', 'lg', 'xl'].map((s) => html`
        <ty-button action pill size=${s} aria-label="Add"><ty-icon name="x"></ty-icon></ty-button>`)}
      </div>`);
    await nextFrame();
    for (const el of wrap.querySelectorAll('ty-button')) {
      const inner = innerOf(el);
      const { width, height } = inner.getBoundingClientRect();
      expect(width).to.equal(height);
      expect(getComputedStyle(inner).borderRadius).to.equal('9999px');
      expect(getComputedStyle(inner).paddingLeft).to.equal('0px');
    }
  });
});
