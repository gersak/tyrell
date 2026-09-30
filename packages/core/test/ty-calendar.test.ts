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
      // Displaying June 2025, min month June 2025 → both prev buttons dead
      expect(btn('.nav-month-prev').disabled, 'prev month').to.be.true;
      expect(btn('.nav-year-prev').disabled, 'prev year').to.be.true;
      // July 2025 is within max → next month alive, next year clamps to July → alive
      expect(btn('.nav-month-next').disabled, 'next month').to.be.false;
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

  describe('invalid attribute values', () => {
    it('ignores malformed year/month/day attributes at mount', async () => {
      const badYear = (await fixture(html`<ty-calendar year="20255" month="6" day="10"></ty-calendar>`)) as any;
      await nextFrame();
      // 5-digit year fails parseYear's /^\d{4}$/ check -> whole attribute ignored
      expect(badYear.value, 'bad year ignored').to.equal('');

      const badMonth = (await fixture(html`<ty-calendar year="2025" month="13" day="10"></ty-calendar>`)) as any;
      await nextFrame();
      expect(badMonth.value, 'out-of-range month ignored').to.equal('');

      const badDay = (await fixture(html`<ty-calendar year="2025" month="2" day="31"></ty-calendar>`)) as any;
      await nextFrame();
      // Feb has 28 days in 2025 -> day 31 overflows and is rejected
      expect(badDay.value, 'overflowing day ignored').to.equal('');
    });

    it('treats malformed min/max ISO strings as no bound at all', async () => {
      const el = (await fixture(html`
        <ty-calendar year="2025" month="6" min="2025-13-40" max="not-a-date"></ty-calendar>
      `)) as any;
      await nextFrame();
      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      const cells = [...month.shadowRoot.querySelectorAll('.calendar-day-cell')];
      expect(cells.some((c: any) => c.classList.contains('disabled')), 'nothing disabled').to.be.false;
    });

    it('parsing a value attribute syncs year/month/day and switches the displayed month', async () => {
      const el = (await fixture(html`<ty-calendar year="2025" month="1"></ty-calendar>`)) as any;
      await nextFrame();
      el.setAttribute('value', '2025-07-15');
      await nextFrame();
      expect(el.value).to.equal('2025-07-15');
      expect(el.getAttribute('year')).to.equal('2025');
      expect(el.getAttribute('month')).to.equal('7');
      expect(el.getAttribute('day')).to.equal('15');
      const nav = el.shadowRoot.querySelector('ty-calendar-navigation') as any;
      expect(nav.shadowRoot.querySelector('.month-year-display').textContent).to.include('July');
    });

    it('a malformed non-empty value attribute leaves the calendar unselected without throwing', async () => {
      const el = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
      await nextFrame();
      expect(() => el.setAttribute('value', 'garbage')).to.not.throw();
      await nextFrame();
      expect(el.value).to.equal('');
    });
  });

  describe('month/day boundary transitions', () => {
    it('clears the whole selection (not a clamp) when the new month no longer has the selected day', async () => {
      const el = (await fixture(html`<ty-calendar year="2025" month="1" day="31"></ty-calendar>`)) as any;
      await nextFrame();
      expect(el.value).to.equal('2025-01-31');
      el.setAttribute('month', '2'); // Feb 2025 has 28 days
      await nextFrame();
      expect(el.value, 'selection fully cleared, not clamped to Feb 28').to.equal('');
    });

    it('accepts Feb 29 as a selected day in a leap year but rejects it in a non-leap year', async () => {
      const leap = (await fixture(html`<ty-calendar year="2024" month="2" day="29"></ty-calendar>`)) as any;
      await nextFrame();
      expect(leap.value).to.equal('2024-02-29');

      const nonLeap = (await fixture(html`<ty-calendar year="2023" month="2" day="29"></ty-calendar>`)) as any;
      await nextFrame();
      expect(nonLeap.value).to.equal('');
    });

    it('rolls the year forward navigating from December to January', async () => {
      const el = (await fixture(html`<ty-calendar year="2025" month="12"></ty-calendar>`)) as any;
      await nextFrame();
      const nav = el.shadowRoot.querySelector('ty-calendar-navigation') as any;
      let detail: any = null;
      el.addEventListener('navigate', (e: CustomEvent) => { detail = e.detail; });
      (nav.shadowRoot.querySelector('.nav-month-next') as HTMLButtonElement).click();
      await nextFrame();
      expect(detail).to.deep.include({ month: 1, year: 2026 });
      expect(nav.displayMonth).to.equal(1);
      expect(nav.displayYear).to.equal(2026);
    });

    it('rolls the year backward navigating from January to December', async () => {
      const el = (await fixture(html`<ty-calendar year="2025" month="1"></ty-calendar>`)) as any;
      await nextFrame();
      const nav = el.shadowRoot.querySelector('ty-calendar-navigation') as any;
      let detail: any = null;
      el.addEventListener('navigate', (e: CustomEvent) => { detail = e.detail; });
      (nav.shadowRoot.querySelector('.nav-month-prev') as HTMLButtonElement).click();
      await nextFrame();
      expect(detail).to.deep.include({ month: 12, year: 2024 });
    });
  });

  describe('keyboard grid navigation', () => {
    // September 2025 starts on a Monday, so the grid's first cell (index 0)
    // is Sept 1st, and today's real date is nowhere near this fixture month
    // -> the roving default lands deterministically on index 0.
    const mountSept = () => fixture(html`<ty-calendar year="2025" month="9"></ty-calendar>`) as Promise<any>;
    const roving = (month: any) => month.shadowRoot.querySelector('.calendar-day-cell[tabindex="0"]');
    const press = (el: Element, key: string) =>
      el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

    it('clamps at the top-left grid edge but still moves normally away from it', async () => {
      const el = await mountSept();
      await nextFrame();
      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;

      let cell = roving(month);
      expect(cell.textContent, 'starts on Sept 1').to.equal('1');

      press(cell, 'ArrowUp');
      expect(roving(month).textContent, 'ArrowUp blocked at top row').to.equal('1');

      press(cell, 'ArrowLeft');
      expect(roving(month).textContent, 'ArrowLeft blocked at left column').to.equal('1');

      press(cell, 'ArrowRight');
      cell = roving(month);
      expect(cell.textContent, 'ArrowRight moves normally').to.equal('2');

      press(cell, 'ArrowDown');
      expect(roving(month).textContent, 'ArrowDown moves a full week').to.equal('9');
    });

    it('Enter selects the focused day and fires change with the correct detail', async () => {
      const el = await mountSept();
      await nextFrame();
      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      let detail: any = null;
      el.addEventListener('change', (e: CustomEvent) => { detail = e.detail; });
      press(roving(month), 'Enter');
      await nextFrame();
      expect(detail).to.include({ year: 2025, month: 9, day: 1, action: 'select' });
      expect(el.value).to.equal('2025-09-01');
    });

    it('Space selects the focused day after arrow-key movement', async () => {
      const el = await mountSept();
      await nextFrame();
      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      press(roving(month), 'ArrowRight'); // Sept 1 -> Sept 2
      let detail: any = null;
      el.addEventListener('change', (e: CustomEvent) => { detail = e.detail; });
      press(roving(month), ' ');
      await nextFrame();
      expect(detail).to.include({ day: 2 });
    });

    it('blocks arrow navigation from crossing into a disabled out-of-bounds day', async () => {
      const el = (await fixture(html`
        <ty-calendar year="2025" month="6" day="15" min="2025-06-10" max="2025-07-20"></ty-calendar>
      `)) as any;
      await nextFrame();
      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      // Selected day (15) is the roving default -> walk left to the boundary
      let cell = roving(month);
      expect(cell.textContent).to.equal('15');
      for (let i = 0; i < 5; i++) {
        press(cell, 'ArrowLeft');
        cell = roving(month);
      }
      expect(cell.textContent, 'reached the min boundary day').to.equal('10');

      press(cell, 'ArrowLeft'); // day 9 is disabled (before min)
      expect(roving(month).textContent, 'blocked from crossing the min boundary').to.equal('10');
    });

    it('keydown on a disabled day cell is inert (no listener attached)', async () => {
      const el = (await fixture(html`
        <ty-calendar year="2025" month="6" min="2025-06-10" max="2025-07-20"></ty-calendar>
      `)) as any;
      await nextFrame();
      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      const cells = [...month.shadowRoot.querySelectorAll('.calendar-day-cell')];
      const day9 = cells.find((c: any) => !c.classList.contains('other-month') && c.textContent === '9') as any;
      expect(day9.classList.contains('disabled')).to.be.true;

      let changed = false;
      el.addEventListener('change', () => { changed = true; });
      press(day9, 'Enter');
      await nextFrame();
      expect(changed, 'disabled cell has no keydown handler').to.be.false;
    });

    it('falls back to a focusable cell when the roving default is disabled', async () => {
      const el = (await fixture(html`
        <ty-calendar year="2025" month="6" min="2025-06-10" max="2025-07-20"></ty-calendar>
      `)) as any;
      await nextFrame();
      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      // No selection/today in this grid -> default index 0 (May 26, before min) is disabled
      const focusable = month.shadowRoot.querySelectorAll('.calendar-day-cell[tabindex="0"]');
      expect(focusable.length, 'exactly one cell should be keyboard-focusable').to.equal(1);
    });
  });

  describe('min/max revalidation', () => {
    it('loosening min after an invalidating change restores form validity', async () => {
      const form = (await fixture(html`
        <form>
          <ty-calendar name="d" year="2025" month="6" day="15" min="2025-06-10" max="2025-07-20"></ty-calendar>
        </form>
      `)) as HTMLFormElement;
      const cal = form.querySelector('ty-calendar') as any;
      await nextFrame();
      expect(form.checkValidity(), 'starts valid').to.be.true;

      cal.setAttribute('min', '2025-06-20'); // now past the selected day 15
      await nextFrame();
      expect(form.checkValidity(), 'tightened min invalidates').to.be.false;

      cal.setAttribute('min', '2025-06-01'); // loosen back below the selection
      await nextFrame();
      expect(form.checkValidity(), 'loosened min re-validates').to.be.true;
    });
  });

  describe('stateless mode', () => {
    it('re-dispatches day-click without mutating internal selection or firing change', async () => {
      const el = (await fixture(html`<ty-calendar stateless year="2025" month="9"></ty-calendar>`)) as any;
      await nextFrame();
      expect(el.stateless).to.be.true;

      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      const cell = month.shadowRoot.querySelector('.calendar-day-cell:not(.disabled)');

      let dayClickDetail: any = null;
      let changed = false;
      el.addEventListener('day-click', (e: CustomEvent) => { dayClickDetail = e.detail; });
      el.addEventListener('change', () => { changed = true; });
      cell.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
      await nextFrame();

      expect(dayClickDetail, 'day-click re-dispatched').to.not.be.null;
      expect(changed, 'stateless mode never fires change').to.be.false;
      expect(el.value, 'internal selection untouched').to.equal('');
    });

    it('year/month property writes only move the display, never the selection', async () => {
      const el = (await fixture(html`<ty-calendar stateless></ty-calendar>`)) as any;
      await nextFrame();
      el.year = 2030;
      el.month = 5;
      await nextFrame();
      expect(el.getAttribute('year')).to.equal('2030');
      expect(el.getAttribute('month')).to.equal('5');
      expect(el.value, 'no selection created').to.equal('');
      const nav = el.shadowRoot.querySelector('ty-calendar-navigation') as any;
      expect(nav.shadowRoot.querySelector('.month-year-display').textContent).to.include('May 2030');
    });
  });

  describe('form participation', () => {
    it('re-keys the FormData entry when the name attribute changes', async () => {
      const form = (await fixture(html`
        <form><ty-calendar name="a" year="2025" month="6" day="10"></ty-calendar></form>
      `)) as HTMLFormElement;
      const cal = form.querySelector('ty-calendar') as any;
      await nextFrame();
      expect(new FormData(form).get('a')).to.equal('2025-06-10');

      cal.setAttribute('name', 'b');
      await nextFrame();
      const data = new FormData(form);
      expect(data.get('a')).to.be.null;
      expect(data.get('b')).to.equal('2025-06-10');
    });

    it('form.reset() reverts the calendar to its initial value', async () => {
      const form = (await fixture(html`
        <form><ty-calendar name="d" year="2025" month="6" day="5"></ty-calendar></form>
      `)) as HTMLFormElement;
      const cal = form.querySelector('ty-calendar') as any;
      await nextFrame();
      expect(cal.value).to.equal('2025-06-05');

      cal.day = 20;
      await nextFrame();
      expect(cal.value).to.equal('2025-06-20');

      form.reset();
      await nextFrame();
      expect(cal.value, 'reverts to the initial markup value on reset').to.equal('2025-06-05');
    });
  });

  describe('layout attributes', () => {
    it('hide-navigation removes the nav bar; removing the attribute restores it', async () => {
      const el = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
      await nextFrame();
      expect(el.shadowRoot.querySelector('ty-calendar-navigation'), 'nav shown by default').to.exist;

      el.setAttribute('hide-navigation', '');
      await nextFrame();
      expect(el.shadowRoot.querySelector('ty-calendar-navigation'), 'nav removed').to.not.exist;

      el.removeAttribute('hide-navigation');
      await nextFrame();
      expect(el.shadowRoot.querySelector('ty-calendar-navigation'), 'nav restored').to.exist;
    });

    it('size and width attributes are mutually exclusive', async () => {
      const el = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
      await nextFrame();

      el.setAttribute('size', 'lg');
      await nextFrame();
      expect(el.getAttribute('size')).to.equal('lg');

      el.setAttribute('width', '300px');
      await nextFrame();
      expect(el.getAttribute('width')).to.equal('300px');
      expect(el.getAttribute('size'), 'size cleared by width').to.be.null;

      el.setAttribute('size', 'sm');
      await nextFrame();
      expect(el.getAttribute('size')).to.equal('sm');
      expect(el.getAttribute('width'), 'width cleared by size').to.be.null;
    });
  });

  describe('locale rendering', () => {
    it('localizes the nav month name and month-grid weekday headers', async () => {
      const el = (await fixture(html`<ty-calendar locale="de-DE" year="2025" month="1"></ty-calendar>`)) as any;
      await nextFrame();
      const nav = el.shadowRoot.querySelector('ty-calendar-navigation') as any;
      expect(nav.shadowRoot.querySelector('.month-year-display').textContent).to.include('Januar');

      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      const headers = [...month.shadowRoot.querySelectorAll('.calendar-header-cell')].map((c: any) => c.textContent);
      expect(headers[0], 'Monday-first, German short form').to.equal('Mo');
    });
  });

  describe('property API', () => {
    it('min/max/flavor setters reflect to attributes and clear correctly', async () => {
      const el = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
      await nextFrame();

      el.min = '2025-01-10';
      expect(el.getAttribute('min')).to.equal('2025-01-10');
      el.max = '2025-01-20';
      expect(el.getAttribute('max')).to.equal('2025-01-20');
      el.flavor = 'danger';
      expect(el.getAttribute('flavor')).to.equal('danger');

      el.min = undefined;
      expect(el.getAttribute('min'), 'clearing removes the attribute').to.be.null;
      el.flavor = '';
      await nextFrame();
      expect(el.getAttribute('flavor'), 'clearing removes the attribute').to.be.null;
      expect(el.flavor, 'falls back to default flavor').to.equal('primary');
    });

    it('hideNavigation/stateless/size/width setters reflect to attributes', async () => {
      const el = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
      await nextFrame();

      el.hideNavigation = true;
      await nextFrame();
      expect(el.hasAttribute('hide-navigation')).to.be.true;
      expect(el.shadowRoot.querySelector('ty-calendar-navigation')).to.not.exist;

      el.stateless = true;
      expect(el.getAttribute('stateless')).to.equal('');
      expect(el.stateless).to.be.true;

      el.size = 'sm';
      await nextFrame();
      expect(el.getAttribute('size')).to.equal('sm');

      el.width = '400px';
      await nextFrame();
      expect(el.getAttribute('width')).to.equal('400px');
      expect(el.getAttribute('size'), 'width clears size').to.be.null;
    });
  });
});
