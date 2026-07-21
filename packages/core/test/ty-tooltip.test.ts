import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/tooltip.js';

// ty-tooltip uses its parent as the anchor and shows a popover on hover/focus.
// The hover path needs real pointer + top-layer, so we smoke-test that it
// upgrades and wires to its anchor without throwing.
describe('ty-tooltip', () => {
  it('mounts attached to its parent anchor', async () => {
    const wrap = await fixture(html`
      <div><span>Hover me</span><ty-tooltip>Tip text</ty-tooltip></div>
    `);
    await nextFrame();
    const tip = wrap.querySelector('ty-tooltip') as any;
    expect(tip.shadowRoot, 'shadow root (styles injected)').to.exist;
    expect(tip.parentElement, 'has an anchor').to.equal(wrap);
  });
});

describe('ty-tooltip default ("dark") flavor is theme-independent', () => {
  const showViaFocus = async (delay = '0') => {
    const wrap = (await fixture(html`
      <div><button>Hover me</button><ty-tooltip delay=${delay}>Tip text</ty-tooltip></div>
    `)) as HTMLElement;
    const anchor = wrap.querySelector('button') as HTMLButtonElement;
    anchor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 30));
    await nextFrame();
    const popover = document.querySelector('[popover]') as HTMLElement;
    expect(popover, 'popover was created and shown').to.exist;
    return popover;
  };

  afterEach(() => {
    document.querySelectorAll('[popover]').forEach((el) => el.remove());
    document.documentElement.classList.remove('dark');
    document.documentElement.style.removeProperty('--ty-bg-neutral-soft');
  });

  it('ignores --ty-bg-neutral-soft — the old bug chained the "dark" flavor through it', async () => {
    // Mirrors tyrell.css's real light/dark divergence for this token
    // (#ededed vs #242424) — if the tooltip still read it, these would differ.
    document.documentElement.classList.remove('dark');
    document.documentElement.style.setProperty('--ty-bg-neutral-soft', '#ededed');
    const lightPage = await showViaFocus();
    const bgLight = getComputedStyle(lightPage).backgroundColor;
    lightPage.remove();

    document.documentElement.classList.add('dark');
    document.documentElement.style.setProperty('--ty-bg-neutral-soft', '#242424');
    const darkPage = await showViaFocus();
    const bgDark = getComputedStyle(darkPage).backgroundColor;

    expect(bgLight, 'background is the same regardless of --ty-bg-neutral-soft').to.equal(bgDark);
  });

  it('uses the small (xs) font token, not body text size', async () => {
    const popover = await showViaFocus();
    expect(getComputedStyle(popover).fontSize).to.equal('12px');
  });
});

describe('ty-tooltip accessibility wiring', () => {
  afterEach(() => {
    document.querySelectorAll('[popover]').forEach((el) => el.remove());
  });

  // Real usage nests <ty-tooltip> DIRECTLY inside the interactive trigger
  // (<ty-button>Hover<ty-tooltip>...</ty-tooltip></ty-button>), never as a
  // sibling under an extra wrapper — the component's "anchor" is literally
  // el.parentElement, so these fixtures must match that shape exactly.
  it('wires role="tooltip" + aria-describedby EAGERLY, before any hover/focus', async () => {
    const wrap = (await fixture(html`
      <button id="anchor">Hover me<ty-tooltip>Tip text</ty-tooltip></button>
    `)) as HTMLElement;
    await nextFrame();

    // No interaction at all yet — a keyboard user landing on the trigger
    // must not have to wait out the (default 600ms) hover delay just to
    // get an accessible description.
    const popover = document.querySelector('[popover]') as HTMLElement;
    expect(popover, 'popover exists immediately on connect').to.exist;
    expect(popover.getAttribute('role')).to.equal('tooltip');

    const describedBy = (wrap.getAttribute('aria-describedby') || '').split(/\s+/);
    expect(describedBy, 'anchor references the tooltip popover').to.include(popover.id);
  });

  it('appends to an existing aria-describedby instead of clobbering it', async () => {
    const wrap = (await fixture(html`
      <button id="anchor" aria-describedby="other-hint">Hover me<ty-tooltip>Tip text</ty-tooltip></button>
    `)) as HTMLElement;
    await nextFrame();

    const ids = (wrap.getAttribute('aria-describedby') || '').split(/\s+/);
    expect(ids, 'kept the pre-existing id').to.include('other-hint');
    expect(ids, 'added the tooltip id too').to.have.length(2);
  });

  it('removes aria-describedby on disconnect (no dangling reference)', async () => {
    const wrap = (await fixture(html`
      <button id="anchor">Hover me<ty-tooltip>Tip text</ty-tooltip></button>
    `)) as HTMLElement;
    await nextFrame();
    expect(wrap.getAttribute('aria-describedby')).to.exist;

    wrap.querySelector('ty-tooltip')!.remove();
    await nextFrame();

    expect(wrap.getAttribute('aria-describedby'), 'reference cleaned up').to.be.null;
    expect(document.querySelector('[popover]'), 'popover removed from DOM').to.not.exist;
  });
});

describe('ty-tooltip content: innerHTML, not textContent', () => {
  afterEach(() => {
    document.querySelectorAll('[popover]').forEach((el) => el.remove());
  });

  it('preserves nested HTML instead of flattening it to plain text', async () => {
    await fixture(html`
      <div>
        <button>Hover me</button>
        <ty-tooltip><kbd>Ctrl+S</kbd> to save</ty-tooltip>
      </div>
    `);
    await nextFrame();

    const popover = document.querySelector('[popover]') as HTMLElement;
    expect(popover.querySelector('kbd'), 'kbd tag survives, not stripped to plain text').to.exist;
    expect(popover.querySelector('kbd')!.textContent).to.equal('Ctrl+S');
  });

  it('refreshes stale content on the next show after the tooltip text changes', async () => {
    const wrap = (await fixture(html`
      <div><button>Hover me</button><ty-tooltip delay="0">Original</ty-tooltip></div>
    `)) as HTMLElement;
    await nextFrame();

    const tip = wrap.querySelector('ty-tooltip')!;
    tip.innerHTML = 'Updated';

    const anchor = wrap.querySelector('button') as HTMLButtonElement;
    anchor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 30));
    await nextFrame();

    const popover = document.querySelector('[popover]') as HTMLElement;
    expect(popover.textContent).to.equal('Updated');
  });
});
