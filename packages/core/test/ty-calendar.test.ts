import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/calendar.js';

// ty-calendar's value comes from selection/navigation rather than a plain
// `value` attribute, so we keep this to a mount smoke test (catches render
// errors) plus form association. Selection behavior is better covered via the
// site demo / future interaction tests.
describe('ty-calendar', () => {
  it('mounts and renders content', async () => {
    const el = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
    await nextFrame();
    expect(el.shadowRoot).to.exist;
    expect(el.shadowRoot.querySelector('*'), 'rendered something').to.exist;
  });

  it('exposes a value getter', async () => {
    const el = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
    await nextFrame();
    expect(el.value).to.be.a('string'); // empty until a day is selected
  });

  describe('min/max bounds', () => {
    const mount = () => fixture(html`
      <ty-calendar year="2025" month="6" min="2025-06-10" max="2025-07-20"></ty-calendar>
    `) as Promise<any>;

    it('disables days outside [min, max] and suppresses their clicks', async () => {
      const el = await mount();
      await nextFrame();
      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      const cells = [...month.shadowRoot.querySelectorAll('.calendar-day-cell')];
      // June 2025 grid: days 1-9 are before min → disabled; 10+ enabled
      const day9 = cells.find(c => !c.classList.contains('other-month') && c.textContent === '9');
      const day10 = cells.find(c => !c.classList.contains('other-month') && c.textContent === '10');
      expect(day9.classList.contains('disabled'), 'day 9 disabled').to.be.true;
      expect(day10.classList.contains('disabled'), 'day 10 enabled').to.be.false;

      let clicked = false;
      el.addEventListener('day-click', () => { clicked = true; });
      day9.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
      await nextFrame();
      expect(clicked, 'disabled day emits nothing').to.be.false;
    });

    it('disables nav buttons that cannot move within bounds', async () => {
      const el = await mount();
      await nextFrame();
      const nav = el.shadowRoot.querySelector('ty-calendar-navigation') as any;
      const btn = (sel: string) => nav.shadowRoot.querySelector(sel) as HTMLButtonElement;
      // Displaying June 2025, min month June 2025 → prev month dead
      expect(btn('.nav-month-prev').disabled, 'prev month').to.be.true;
      // July 2025 is within max → next month alive
      expect(btn('.nav-month-next').disabled, 'next month').to.be.false;
      // Year arrows live in the month/year view, opened from the title
      btn('.nav-title').click();
      await nextFrame();
      expect(btn('.nav-year-prev').disabled, 'prev year').to.be.true;
      expect(btn('.nav-year-next').disabled, 'next year (clamps)').to.be.false;
    });

    it('flags an out-of-bounds programmatic selection as form-invalid', async () => {
      // day 5 is before min (2025-06-10) — UI can't select it, attributes can
      const form = (await fixture(html`
        <form>
          <ty-calendar name="d" year="2025" month="6" day="5" min="2025-06-10" max="2025-07-20"></ty-calendar>
        </form>
      `)) as HTMLFormElement;
      const cal = form.querySelector('ty-calendar') as any;
      await nextFrame();
      expect(form.checkValidity(), 'underflow blocks form').to.be.false;

      cal.setAttribute('day', '15'); // inside bounds
      await nextFrame();
      expect(form.checkValidity(), 'valid selection unblocks').to.be.true;

      cal.setAttribute('min', '2025-06-20'); // bounds move past selection
      await nextFrame();
      expect(form.checkValidity(), 'bound change re-validates').to.be.false;
    });

    it('clamps a year jump to the bound month', async () => {
      const el = await mount();
      await nextFrame();
      const nav = el.shadowRoot.querySelector('ty-calendar-navigation') as any;
      (nav.shadowRoot.querySelector('.nav-title') as HTMLButtonElement).click();
      await nextFrame();
      (nav.shadowRoot.querySelector('.nav-year-next') as HTMLButtonElement).click();
      await nextFrame();
      // +12 months from June 2025 clamps to max month July 2025
      expect(nav.displayMonth).to.equal(7);
      expect(nav.displayYear).to.equal(2025);
    });
  });

  describe('flavor', () => {
    const selectedBg = (month: any) =>
      getComputedStyle(month.shadowRoot.querySelector('.calendar-day-cell.selected')).backgroundColor;

    afterEach(() => {
      document.documentElement.style.removeProperty('--ty-bg-success');
      document.documentElement.style.removeProperty('--ty-bg-brand');
    });

    it('ty-calendar forwards its flavor into the nested ty-calendar-month', async () => {
      document.documentElement.style.setProperty('--ty-bg-success', 'rgb(7, 8, 9)');
      const el = (await fixture(html`
        <ty-calendar flavor="success" year="2026" month="7" day="20"></ty-calendar>
      `)) as any;
      await nextFrame();
      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      expect(month.getAttribute('flavor')).to.equal('success');
      expect(selectedBg(month)).to.equal('rgb(7, 8, 9)');
    });

    it('derives the selected day color from a custom flavor token', async () => {
      document.documentElement.style.setProperty('--ty-bg-brand', 'rgb(1, 2, 3)');
      const el = (await fixture(html`
        <ty-calendar flavor="brand" year="2026" month="7" day="20"></ty-calendar>
      `)) as any;
      await nextFrame();
      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      expect(selectedBg(month)).to.equal('rgb(1, 2, 3)');
    });

    it('the pre-existing --ty-calendar-selected-bg override still wins over a flavor', async () => {
      // ty-calendar-month lives two shadow roots deep in the ty-date-picker
      // case (ty-calendar's, inside the picker's), so no light-DOM selector
      // can target it directly — but --ty-calendar-selected-bg was never
      // claimed by any internal rule (flavor's generated CSS only ever sets
      // the new, private --calendar-month-selected-bg one layer behind it),
      // so it still inherits cleanly through both shadow boundaries from
      // any ancestor and keeps outranking the flavor default, unchanged
      // from before this feature existed.
      document.documentElement.style.setProperty('--ty-bg-success', 'rgb(7, 8, 9)');
      const el = (await fixture(html`
        <ty-calendar flavor="success" year="2026" month="7" day="20"
                     style="--ty-calendar-selected-bg: rgb(9, 9, 9);"></ty-calendar>
      `)) as any;
      await nextFrame();
      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      expect(selectedBg(month)).to.equal('rgb(9, 9, 9)');
    });
  });

  describe('month/year view', () => {
    const mountCal = async () => {
      const el = (await fixture(html`<ty-calendar value="2026-09-23"></ty-calendar>`)) as any;
      await nextFrame();
      const nav = el.shadowRoot.querySelector('ty-calendar-navigation') as any;
      const title = () => nav.shadowRoot.querySelector('.nav-title') as HTMLButtonElement;
      return { el, nav, title };
    };

    it('title opens the month grid and picking a month returns to days', async () => {
      const { el, nav, title } = await mountCal();
      title().click();
      await nextFrame();
      expect(el.shadowRoot.querySelector('.month-grid'), 'grid shown').to.exist;
      expect(el.shadowRoot.querySelector('ty-calendar-month'), 'days hidden').to.not.exist;
      expect(el.shadowRoot.querySelector('.month-cell.selected')?.textContent).to.equal('Sep');

      let navigated: any = null;
      el.addEventListener('navigate', (e: CustomEvent) => (navigated = e.detail));
      (el.shadowRoot.querySelector('.month-cell[data-month="3"]') as HTMLButtonElement).click();
      await nextFrame();
      expect(el.shadowRoot.querySelector('.month-grid'), 'grid closed').to.not.exist;
      expect(nav.displayMonth).to.equal(3);
      expect(navigated).to.include({ month: 3, year: 2026 });
      expect(el.value, 'selection untouched').to.equal('2026-09-23');
    });

    it('Page Up / Down step months, Shift steps years', async () => {
      const { el, nav } = await mountCal();
      const container = el.shadowRoot.querySelector('.calendar-container') as HTMLElement;
      const key = (k: string, shiftKey = false) =>
        container.dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey, bubbles: true }));
      key('PageDown');
      expect([nav.displayMonth, nav.displayYear]).to.deep.equal([10, 2026]);
      key('PageUp', true);
      expect([nav.displayMonth, nav.displayYear]).to.deep.equal([10, 2025]);
    });

    it('Escape closes the month grid without escaping the calendar', async () => {
      const { el, title } = await mountCal();
      title().click();
      await nextFrame();
      let leaked = false;
      const onKey = () => (leaked = true);
      document.addEventListener('keydown', onKey);
      (el.shadowRoot.querySelector('.month-grid') as HTMLElement).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
      document.removeEventListener('keydown', onKey);
      expect(el.shadowRoot.querySelector('.month-grid')).to.not.exist;
      expect(leaked, 'Escape stopped at the calendar').to.be.false;
    });
  });
});
