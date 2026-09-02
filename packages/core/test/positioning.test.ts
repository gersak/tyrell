import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import {
  computeAnchoredPosition,
  preferenceChain,
  placementToAnchored,
  placements,
} from '../lib/utils/positioning.js';
import '../lib/components/date-picker.js';
import '../lib/components/select.js';
import '../lib/components/option.js';
import '../lib/components/input.js';
import '../lib/components/button.js';

const rect = (top: number, left: number, width: number, height: number) =>
  ({ top, left, width, height, right: left + width, bottom: top + height }) as DOMRect;

describe('placement side + alignment', () => {
  it('start and end are distinct on the vertical axis', () => {
    // Regression: left-start/right-start were both configured as
    // vertical:'center', so they rendered identically to bare left/right and
    // the start-alignment branch in calculatePlacement was unreachable.
    expect(placements['left-start'].vertical).to.not.equal(placements['left'].vertical);
    expect(placements['right-start'].vertical).to.not.equal(placements['right'].vertical);
    expect(placements['left-start'].vertical).to.not.equal(placements['left-end'].vertical);
  });

  it('every one of the 12 placements has a config', () => {
    for (const side of ['top', 'right', 'bottom', 'left']) {
      for (const p of [side, `${side}-start`, `${side}-end`]) {
        expect(placements[p as keyof typeof placements], p).to.exist;
      }
    }
  });

  it('preferenceChain flips before re-aligning', () => {
    const chain = preferenceChain('left-start');
    expect(chain[0]).to.equal('left-start');
    // Flip carries the alignment and must come before any same-side re-align:
    // re-aligning cannot fix side-axis overflow, flipping can.
    expect(chain[1]).to.equal('right-start');
    expect(chain.indexOf('right-start')).to.be.lessThan(chain.indexOf('left'));
    expect(chain).to.have.lengthOf(12);
  });

  it('bare sides keep their historic fallback order', () => {
    // Back-compat: before aligned placements existed, popup/tooltip used
    // hand-written chains where the requested side degraded straight to its
    // opposite. That must still hold or existing markup shifts on overflow.
    expect(preferenceChain('top').slice(0, 2)).to.deep.equal(['top', 'bottom']);
    expect(preferenceChain('bottom').slice(0, 2)).to.deep.equal(['bottom', 'top']);
    expect(preferenceChain('left').slice(0, 2)).to.deep.equal(['left', 'right']);
    expect(preferenceChain('right').slice(0, 2)).to.deep.equal(['right', 'left']);
  });

  it('preferenceChain covers all 12 placements without duplicates', () => {
    for (const p of ['top', 'bottom-end', 'right-start', 'left']) {
      const chain = preferenceChain(p as any);
      expect(new Set(chain).size, p).to.equal(12);
    }
  });

  it('placementToAnchored degrades left/right to auto but keeps alignment', () => {
    expect(placementToAnchored('bottom-end')).to.deep.equal({ side: 'bottom', align: 'end' });
    expect(placementToAnchored('top-start')).to.deep.equal({ side: 'top', align: 'start' });
    expect(placementToAnchored('left-end')).to.deep.equal({ side: 'auto', align: 'end' });
    // Empty/absent must keep the historic dropdown default.
    expect(placementToAnchored('')).to.deep.equal({ side: 'auto', align: 'start' });
  });
});

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

  it('align "end" anchors to the trigger right edge instead of left', () => {
    const anchor = rect(100, 500, 60, 40); // right edge at 560
    const pos = computeAnchoredPosition({
      anchorRect: anchor,
      popupWidth: 320,
      popupHeight: 100,
      align: 'end',
    });
    expect(pos.x).to.equal(anchor.right - 320);
  });

  it('align "end" still clamps into the viewport', () => {
    const anchor = rect(100, 10, 20, 40); // right edge at 30 — way less than popupWidth
    const pos = computeAnchoredPosition({
      anchorRect: anchor,
      popupWidth: 320,
      popupHeight: 100,
      align: 'end',
    });
    expect(pos.x).to.equal(8);
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
    // wrap padding is 20, gap 8 (unified trigger→popup offset, 2026-08-19)
    expect(x).to.be.closeTo(Math.max(8, stubRect.left) - 20, 1);
    if (below) {
      expect(y).to.be.closeTo(stubRect.bottom + 8 - 20, 1);
    }
  });

  it('ty-select align="end" anchors the dropdown to the trigger right edge', async () => {
    const el = (await fixture(html`
      <ty-select align="end">
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
      </ty-select>
    `)) as any;
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await nextFrame();
    await nextFrame();

    const stubRect = stub.getBoundingClientRect();
    const width = parseFloat(el.style.getPropertyValue('--dropdown-width'));
    const x = parseFloat(el.style.getPropertyValue('--dropdown-x'));
    // popupWidth is --dropdown-width minus the 20px wrap padding on each side
    const popupWidth = width - 40;
    const expectedRawX = Math.max(8, Math.min(stubRect.right - popupWidth, window.innerWidth - popupWidth - 8));
    expect(x).to.be.closeTo(expectedRawX - 20, 1);
  });
});

describe('field heights are unified across ty-input / ty-select / ty-date-picker', () => {
  // Fields come in five sizes and consume var(--ty-size-*) via the shared
  // ladder (styles/field-size.ts) — seed the tokens the way tyrell.css would.
  const SIZES = { xs: '2rem', sm: '2.25rem', md: '2.5rem', lg: '2.75rem', xl: '3rem' };
  const EXPECTED: Record<string, number> = { xs: 32, sm: 36, md: 40, lg: 44, xl: 48 };

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

  (['xs', 'sm', 'md', 'lg', 'xl'] as const).forEach((size) => {
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

  it('a field with no size attribute matches size="sm"', async () => {
    const bare = (await fixture(html`<ty-input placeholder="x"></ty-input>`)) as any;
    const sm = (await fixture(html`<ty-input size="sm" placeholder="x"></ty-input>`)) as any;
    await nextFrame();
    const h = (el: any) => Math.round(el.shadowRoot.querySelector('.input-wrapper').getBoundingClientRect().height);
    expect(bare.size).to.equal('sm');
    expect(h(bare)).to.equal(h(sm));
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
