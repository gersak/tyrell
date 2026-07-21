import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { computeAnchoredPosition } from '../lib/utils/positioning.js';
import '../lib/components/date-picker.js';
import '../lib/components/select.js';
import '../lib/components/option.js';
import '../lib/components/input.js';
import '../lib/components/button.js';

const rect = (top: number, left: number, width: number, height: number) =>
  ({ top, left, width, height, right: left + width, bottom: top + height }) as DOMRect;

describe('computeAnchoredPosition', () => {
  const vw = () => window.innerWidth;
  const vh = () => window.innerHeight;

  it('opens below when there is room, anchored to the trigger left edge', () => {
    const anchor = rect(100, 50, 200, 40);
    const pos = computeAnchoredPosition({ anchorRect: anchor, popupWidth: 320, popupHeight: 300 });
    expect(pos.below).to.be.true;
    expect(pos.x).to.equal(50);
    expect(pos.topY).to.equal(anchor.bottom + 4);
  });

  it('opens above when below does not fit but above does', () => {
    const anchor = rect(vh() - 60, 50, 200, 40);
    const pos = computeAnchoredPosition({ anchorRect: anchor, popupWidth: 320, popupHeight: 300 });
    expect(pos.below).to.be.false;
    expect(pos.bottomY).to.equal(vh() - anchor.top + 4);
  });

  it('picks the side with more room when neither fits (trigger near top)', () => {
    // Trigger near the viewport top: above has ~10px, below has the rest.
    const anchor = rect(10, 50, 200, 40);
    const pos = computeAnchoredPosition({
      anchorRect: anchor,
      popupWidth: 320,
      popupHeight: vh() * 2, // fits nowhere
    });
    expect(pos.below, 'must not flip above into 10px of space').to.be.true;
  });

  it('clamps x into the viewport on both edges', () => {
    const nearRight = computeAnchoredPosition({
      anchorRect: rect(100, vw() - 20, 10, 40),
      popupWidth: 320,
      popupHeight: 100,
    });
    expect(nearRight.x).to.equal(vw() - 320 - 8);

    const nearLeft = computeAnchoredPosition({
      anchorRect: rect(100, -30, 10, 40),
      popupWidth: 320,
      popupHeight: 100,
    });
    expect(nearLeft.x).to.equal(8);
  });
});

describe('anchored popup integration', () => {
  it('ty-date-picker positions its calendar dialog with direction class + vars', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-07-17"></ty-date-picker>`)) as any;
    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    stub.click();
    await nextFrame();
    await nextFrame();

    const dialog = el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(dialog.open, 'dialog is shown').to.be.true;
    const below = dialog.classList.contains('position-below');
    const above = dialog.classList.contains('position-above');
    expect(below || above, 'a direction class is set').to.be.true;

    const x = parseFloat(el.style.getPropertyValue('--calendar-x'));
    const y = parseFloat(el.style.getPropertyValue('--calendar-y'));
    expect(x, '--calendar-x is a number').to.not.be.NaN;
    expect(y, '--calendar-y is a number').to.not.be.NaN;

    if (below) {
      // top-anchored: y sits at the trigger bottom (gap 0). Re-query the
      // stub — opening re-renders the container and replaces the element.
      const freshStub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
      expect(y).to.be.closeTo(freshStub.getBoundingClientRect().bottom, 1);
    }
  });

  it('ty-select positions its dropdown with direction class + vars', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
      </ty-select>
    `)) as any;
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await nextFrame();
    await nextFrame();

    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(dialog.open, 'dialog is shown').to.be.true;
    const below = dialog.classList.contains('position-below');
    const above = dialog.classList.contains('position-above');
    expect(below || above, 'a direction class is set').to.be.true;

    const stubRect = stub.getBoundingClientRect();
    const x = parseFloat(el.style.getPropertyValue('--dropdown-x'));
    const y = parseFloat(el.style.getPropertyValue('--dropdown-y'));
    // wrap padding is 20, gap 4
    expect(x).to.be.closeTo(Math.max(8, stubRect.left) - 20, 1);
    if (below) {
      expect(y).to.be.closeTo(stubRect.bottom + 4 - 20, 1);
    }
  });
});

describe('field heights are unified across ty-input / ty-select / ty-date-picker', () => {
  // Fields come in exactly three sizes and consume var(--ty-size-*) —
  // seed the tokens the way tyrell.css would. Legacy xs/xl coerce to sm/lg.
  const SIZES = { sm: '2.25rem', md: '2.5rem', lg: '2.75rem' };
  const EXPECTED: Record<string, number> = { sm: 36, md: 40, lg: 44 };

  before(() => {
    for (const [k, v] of Object.entries(SIZES)) {
      document.documentElement.style.setProperty(`--ty-size-${k}`, v);
    }
  });
  after(() => {
    for (const k of Object.keys(SIZES)) {
      document.documentElement.style.removeProperty(`--ty-size-${k}`);
    }
  });

  (['sm', 'md', 'lg'] as const).forEach((size) => {
    it(`size=${size}: input, select, and date-picker are all ${EXPECTED[size]}px`, async () => {
      const inp = (await fixture(html`<ty-input size=${size} placeholder="x"></ty-input>`)) as any;
      const sel = (await fixture(html`
        <ty-select size=${size}><ty-option value="a">A</ty-option></ty-select>
      `)) as any;
      const dp = (await fixture(html`<ty-date-picker size=${size} value="2026-07-17"></ty-date-picker>`)) as any;
      await nextFrame();

      const inputH = inp.shadowRoot.querySelector('.input-wrapper').getBoundingClientRect().height;
      const selectH = sel.shadowRoot.querySelector('.select-stub').getBoundingClientRect().height;
      const dpH = dp.shadowRoot.querySelector('.date-picker-stub').getBoundingClientRect().height;

      expect(Math.round(inputH), 'ty-input').to.equal(EXPECTED[size]);
      expect(Math.round(selectH), 'ty-select').to.equal(EXPECTED[size]);
      expect(Math.round(dpH), 'ty-date-picker').to.equal(EXPECTED[size]);
    });
  });

  it('legacy size="xs" / size="xl" coerce to sm / lg', async () => {
    const xs = (await fixture(html`<ty-input size="xs" placeholder="x"></ty-input>`)) as any;
    const xl = (await fixture(html`<ty-input size="xl" placeholder="x"></ty-input>`)) as any;
    await nextFrame();
    expect(Math.round(xs.shadowRoot.querySelector('.input-wrapper').getBoundingClientRect().height)).to.equal(36);
    expect(Math.round(xl.shadowRoot.querySelector('.input-wrapper').getBoundingClientRect().height)).to.equal(44);
  });
});

describe('ty-button compact ladder pairs with the field ladder', () => {
  // Buttons: 24/28/32/36/40. Fields: 36/40/44. Intersections give exact
  // alongside pairing; same-name end-slot nesting clears ~8px.
  const SIZES = { sm: '2.25rem', md: '2.5rem', lg: '2.75rem' };
  before(() => {
    for (const [k, v] of Object.entries(SIZES)) {
      document.documentElement.style.setProperty(`--ty-size-${k}`, v);
    }
  });
  after(() => {
    for (const k of Object.keys(SIZES)) {
      document.documentElement.style.removeProperty(`--ty-size-${k}`);
    }
  });

  const buttonH = async (size: string) => {
    const el = (await fixture(html`<ty-button size=${size}>Go</ty-button>`)) as HTMLElement;
    await nextFrame();
    return el.getBoundingClientRect().height;
  };
  const inputH = async (size: string) => {
    const el = (await fixture(html`<ty-input size=${size} placeholder="x"></ty-input>`)) as any;
    await nextFrame();
    return el.shadowRoot.querySelector('.input-wrapper').getBoundingClientRect().height;
  };

  it('button ladder is 24/28/32/36/40', async () => {
    expect(Math.round(await buttonH('xs'))).to.equal(24);
    expect(Math.round(await buttonH('sm'))).to.equal(28);
    expect(Math.round(await buttonH('md'))).to.equal(32);
    expect(Math.round(await buttonH('lg'))).to.equal(36);
    expect(Math.round(await buttonH('xl'))).to.equal(40);
  });

  it('alongside pairing: button lg = field sm, button xl = field md', async () => {
    expect(Math.round(await buttonH('lg'))).to.equal(Math.round(await inputH('sm')));
    expect(Math.round(await buttonH('xl'))).to.equal(Math.round(await inputH('md')));
  });

  it('end-slot nesting: same-name button clears the field by ~8px', async () => {
    for (const size of ['sm', 'md', 'lg']) {
      const b = await buttonH(size);
      const i = await inputH(size);
      expect(i - b, `field ${size} (${i}) vs button ${size} (${b})`).to.be.closeTo(8, 1);
    }
  });
});
