import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/date-picker.js';

// date-picker normalizes to a UTC ISO timestamp; the exact day is timezone-
// dependent (date-only input is anchored at local midnight → UTC), so assert
// the normalized SHAPE and that FormData stays consistent with .value rather
// than a specific date string.
const ISO = '2026-01-15T12:00:00.000Z';

describe('ty-date-picker', () => {
  it('reflects its value as a normalized ISO timestamp', async () => {
    const el = (await fixture(html`<ty-date-picker value="${ISO}"></ty-date-picker>`)) as any;
    await nextFrame();
    expect(el.value).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
  });

  it('participates in FormData, consistent with .value', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-date-picker name="d" value="${ISO}"></ty-date-picker></form>
    `));
    const el = form.querySelector('ty-date-picker') as any;
    await nextFrame();
    expect(new FormData(form).get('d')).to.equal(el.value);
  });
});

describe('ty-date-picker flavor', () => {
  const openDialog = async (el: any) => {
    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    stub.click();
    await nextFrame();
    await nextFrame();
  };

  it('forwards its flavor to the popup calendar on open', async () => {
    const el = (await fixture(html`<ty-date-picker flavor="success"></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);
    const calendar = el.shadowRoot.querySelector('ty-calendar');
    expect(calendar, 'popup calendar').to.exist;
    expect(calendar!.getAttribute('flavor')).to.equal('success');
  });

  it('keeps an already-open popup in sync when the flavor changes', async () => {
    const el = (await fixture(html`<ty-date-picker flavor="success"></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);

    // Change flavor WHILE the dialog stays open — this is the gap: render()
    // only rebuilds (and re-forwards flavor) while the dialog is closed.
    el.flavor = 'danger';
    await nextFrame();

    const calendar = el.shadowRoot.querySelector('ty-calendar');
    expect(calendar!.getAttribute('flavor')).to.equal('danger');
  });
});

describe('ty-date-picker stub icon', () => {
  it('colors the calendar trigger icon from the flavor, not a fixed neutral', async () => {
    document.documentElement.style.setProperty('--ty-color-success', 'rgb(4, 5, 6)');
    const el = (await fixture(html`<ty-date-picker flavor="success"></ty-date-picker>`)) as any;
    await nextFrame();
    const arrow = el.shadowRoot.querySelector('.stub-arrow') as HTMLElement;
    expect(getComputedStyle(arrow).color).to.equal('rgb(4, 5, 6)');
    document.documentElement.style.removeProperty('--ty-color-success');
  });

  it('clear button hover rule uses real tokens (was --ty-color-negative/--ty-bg-negative-faint, neither exists)', async () => {
    const el = (await fixture(html`<ty-date-picker value="${ISO}" clearable></ty-date-picker>`)) as any;
    await nextFrame();
    // :hover can't be forced from a synthetic event in this harness, so
    // assert on the authored rule itself — the bug was a typo'd token name
    // (--ty-color-negative), which silently resolves to nothing rather than
    // erroring, so only inspecting cssText catches it.
    const rules = [...el.shadowRoot.adoptedStyleSheets].flatMap((s: CSSStyleSheet) => [...s.cssRules]);
    const hoverRule = rules.find((r: any) => r.selectorText === '.stub-clear:hover') as CSSStyleRule;
    expect(hoverRule, '.stub-clear:hover rule exists').to.exist;
    expect(hoverRule.style.color).to.equal('var(--ty-color-danger)');
    expect(hoverRule.cssText).to.not.include('negative');
  });
});
