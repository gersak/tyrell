import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { sendKeys, sendMouse, resetMouse } from '@web/test-runner-commands';
import { TyCalendar } from '../lib/components/calendar.js';
import '../lib/components/input.js';
import '../lib/components/date-picker.js';
import { nativeMessage } from '../lib/utils/validity.js';
import { getCalendarMonthDays, parseISODate } from '../lib/utils/calendar-utils.js';

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
      day9.click();
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
      document.documentElement.style.removeProperty('--ty-solid-success');
      document.documentElement.style.removeProperty('--ty-solid-brand');
    });

    it('ty-calendar forwards its flavor into the nested ty-calendar-month', async () => {
      document.documentElement.style.setProperty('--ty-solid-success', 'rgb(7, 8, 9)');
      const el = (await fixture(html`
        <ty-calendar flavor="success" year="2026" month="7" day="20"></ty-calendar>
      `)) as any;
      await nextFrame();
      const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
      expect(month.getAttribute('flavor')).to.equal('success');
      expect(selectedBg(month)).to.equal('rgb(7, 8, 9)');
    });

    it('derives the selected day color from a custom flavor token', async () => {
      document.documentElement.style.setProperty('--ty-solid-brand', 'rgb(1, 2, 3)');
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
      document.documentElement.style.setProperty('--ty-solid-success', 'rgb(7, 8, 9)');
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
      const el = (await fixture(html`<ty-calendar value="2026-09-23" locale="en-US"></ty-calendar>`)) as any;
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
      expect(nav.shadowRoot.querySelector('.nav-title').textContent).to.include('July');
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
      cell.click();
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
      expect(nav.shadowRoot.querySelector('.nav-title-month').textContent).to.equal('May');
      expect(nav.shadowRoot.querySelector('.nav-title-year').textContent).to.equal('2030');
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
      expect(nav.shadowRoot.querySelector('.nav-title').textContent).to.include('Januar');

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

describe('ty-calendar — properties set before the element upgrades', () => {
  let n = 0;
  const tag = () => `ty-calendar-upgrade-${++n}`;
  const hasOwn = (el: object, p: string) => Object.prototype.hasOwnProperty.call(el, p);

  it('value, min, size and dayContentFn set early apply; later assignments reach the setters', async () => {
    const name = tag();
    const el = document.createElement(name) as any;
    const dayContentFn = () => document.createElement('i');
    el.value = '2026-03-14';
    el.min = '2026-03-10';
    el.size = 'sm';
    el.dayContentFn = dayContentFn;
    document.body.append(el);
    customElements.define(name, class extends TyCalendar {});
    await nextFrame();
    expect(el.value).to.equal('2026-03-14');
    expect(el.getAttribute('day')).to.equal('14');
    expect(el.getAttribute('min')).to.equal('2026-03-10');
    expect(el.getAttribute('size')).to.equal('sm');
    expect(el.dayContentFn === dayContentFn, 'dayContentFn kept').to.equal(true);
    for (const p of ['value', 'min', 'size', 'dayContentFn']) {
      expect(hasOwn(el, p), `no own ${p} left`).to.equal(false);
    }

    el.value = '2026-03-20';
    el.min = '2026-03-01';
    expect(el.getAttribute('day')).to.equal('20');
    expect(el.getAttribute('min')).to.equal('2026-03-01');
    el.remove();
  });

  // While it upgrades, the attribute goes through the same setter first
  it('an early value wins over the value attribute; form.reset() goes back to the attribute', async () => {
    const name = tag();
    const form = document.createElement('form');
    const el = document.createElement(name) as any;
    el.setAttribute('value', '2026-01-05');
    el.value = '2026-03-14';
    form.append(el);
    document.body.append(form);
    customElements.define(name, class extends TyCalendar {});
    await nextFrame();
    expect(el.value).to.equal('2026-03-14');
    expect(hasOwn(el, 'value'), 'no own value left').to.equal(false);
    form.reset();
    expect(el.value).to.equal('2026-01-05');
    form.remove();
  });

  it('an early value that is a Date applies its local day; the calendar still renders', async () => {
    const name = tag();
    const el = document.createElement(name) as any;
    el.value = new Date(2026, 2, 14, 23, 30);
    document.body.append(el);
    customElements.define(name, class extends TyCalendar {});
    await nextFrame();
    expect(el.value).to.equal('2026-03-14');
    expect(!!el.shadowRoot.querySelector('ty-calendar-month'), 'rendered').to.equal(true);
    el.remove();
  });
});

// The day cells live in ty-calendar-month's shadow root, inside ty-calendar's
const monthOf = (cal: any) => cal.shadowRoot.querySelector('ty-calendar-month') as any;
const dayCell = (cal: any, label: RegExp): HTMLElement =>
  [...monthOf(cal).shadowRoot.querySelectorAll('.calendar-day-cell')]
    .find((c: any) => label.test(c.getAttribute('aria-label'))) as HTMLElement;
/** aria-label of the day cell that has the focus, else the focused element's tag. */
const focusedDay = (): string | null => {
  let el: Element | null = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el?.getAttribute('role') === 'gridcell' ? el.getAttribute('aria-label') : el?.tagName.toLowerCase() ?? null;
};
const clickAt = async (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  await sendMouse({ type: 'click', position: [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)] });
};

describe('ty-calendar — years below 100', () => {
  it('value 0099-05-05: year attribute "0099", the grid shows May 99 with the 5th selected', async () => {
    const form = (await fixture(html`
      <form><ty-calendar name="c" locale="en-US" value="0099-05-05"></ty-calendar></form>
    `)) as HTMLFormElement;
    const cal = form.querySelector('ty-calendar') as any;
    await nextFrame();
    expect(cal.value).to.equal('0099-05-05');
    expect(cal.getAttribute('year')).to.equal('0099');
    expect(new FormData(form).get('c')).to.equal('0099-05-05');
    const grid = monthOf(cal).shadowRoot.querySelector('[role="grid"]');
    expect(grid.getAttribute('aria-label')).to.equal('May 99');
    const selected = monthOf(cal).shadowRoot.querySelector('.calendar-day-cell.selected');
    expect(selected.getAttribute('aria-label')).to.equal('Tuesday, May 5, 99');

    dayCell(cal, /May 10, 99$/).click();
    expect(cal.value).to.equal('0099-05-10');

    cal.year = 5;
    expect(cal.getAttribute('year')).to.equal('0005');
    expect(cal.value, 'the year setter keeps the selection').to.equal('0005-05-10');
  });

  it('min/max compare years below 100 as those years, not 1900-1999', async () => {
    const el = (await fixture(html`<ty-calendar value="0099-05-05" min="0100-01-01"></ty-calendar>`)) as any;
    await nextFrame();
    expect(el.validity.rangeUnderflow, 'year 99 is before year 100').to.equal(true);
    el.min = '0050-01-01';
    expect(el.validity.valid).to.equal(true);
    el.max = '0099-05-04';
    expect(el.validity.rangeOverflow).to.equal(true);
  });

  it('calendar-utils: parseISODate and the month grid keep years below 100', () => {
    expect(parseISODate('0099-05-05')).to.deep.equal({ year: 99, month: 5, day: 5 });
    expect(parseISODate('0099-02-29'), '99 is no leap year').to.equal(null);
    const fifth = getCalendarMonthDays(99, 5).find((d) => !d.otherMonth && d.dayInMonth === 5)!;
    expect(fifth.year).to.equal(99);
    const utc = new Date(fifth.value);
    expect([utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), utc.getUTCHours()]).to.deep.equal([99, 4, 5, 0]);
    expect(new Date(fifth.localValue).getFullYear()).to.equal(99);
  });
});

describe('ty-calendar — focus stays in the grid after a pick', () => {
  afterEach(() => resetMouse());

  it('a click focuses the day; arrows then move from it; Enter and Space keep the focus', async () => {
    const el = (await fixture(html`<ty-calendar locale="en-US" value="2026-03-15"></ty-calendar>`)) as any;
    await nextFrame();
    await clickAt(dayCell(el, /March 18, 2026$/));
    expect(el.value).to.equal('2026-03-18');
    expect(focusedDay()).to.equal('Wednesday, March 18, 2026');

    await sendKeys({ press: 'ArrowRight' });
    expect(focusedDay()).to.equal('Thursday, March 19, 2026');
    await sendKeys({ press: 'Enter' });
    expect(el.value).to.equal('2026-03-19');
    expect(focusedDay()).to.equal('Thursday, March 19, 2026');

    await sendKeys({ press: 'ArrowDown' });
    await sendKeys({ press: 'Space' });
    expect(el.value).to.equal('2026-03-26');
    expect(focusedDay()).to.equal('Thursday, March 26, 2026');
    await sendKeys({ press: 'ArrowLeft' });
    expect(focusedDay()).to.equal('Wednesday, March 25, 2026');
  });

  it('the picked day is the only tab stop, also for a day of the next month', async () => {
    const el = (await fixture(html`<ty-calendar locale="en-US" value="2026-03-15"></ty-calendar>`)) as any;
    await nextFrame();
    await clickAt(dayCell(el, /April 2, 2026$/)); // March's grid ends on April 5
    expect(el.value).to.equal('2026-04-02');
    expect(focusedDay()).to.equal('Thursday, April 2, 2026');
    const stops = [...monthOf(el).shadowRoot.querySelectorAll('.calendar-day-cell[tabindex="0"]')];
    expect(stops.map((c: any) => c.getAttribute('aria-label'))).to.deep.equal(['Thursday, April 2, 2026']);
  });

  it('a re-render while the grid has no focus does not take it', async () => {
    const el = (await fixture(html`<div><button>before</button><ty-calendar value="2026-03-15"></ty-calendar></div>`)) as any;
    const button = el.querySelector('button') as HTMLButtonElement;
    const cal = el.querySelector('ty-calendar') as any;
    await nextFrame();
    button.focus();
    cal.value = '2026-03-20';
    cal.refresh();
    expect(document.activeElement === button, 'focus stays on the button').to.equal(true);
  });
});

describe('ty-calendar — an invalid calendar takes the focus', () => {
  it('submit, form.reportValidity(), requestSubmit() and calendar.reportValidity() focus the grid', async () => {
    const form = (await fixture(html`
      <form>
        <ty-calendar name="c" locale="en-US" min="2026-01-01" value="2025-06-15"></ty-calendar>
        <button>Send</button>
      </form>
    `)) as HTMLFormElement;
    const cal = form.querySelector('ty-calendar') as any;
    const button = form.querySelector('button') as HTMLButtonElement;
    let submits = 0;
    form.addEventListener('submit', (e) => { e.preventDefault(); submits++; });
    await nextFrame();
    expect(cal.validity.rangeUnderflow).to.equal(true);

    // June 2025 is all before min: no tab stop, so the selected day
    const runs: [string, () => unknown][] = [
      ['submit click', () => clickAt(button)],
      ['form.reportValidity()', () => form.reportValidity()],
      ['form.requestSubmit()', () => form.requestSubmit()],
      ['calendar.reportValidity()', () => cal.reportValidity()],
    ];
    for (const [name, run] of runs) {
      button.focus();
      await run();
      expect(focusedDay(), name).to.equal('Sunday, June 15, 2025');
    }
    expect(submits).to.equal(0);
    await resetMouse();
  });

  it('focus() reaches a day also when every day shown is disabled', async () => {
    const el = (await fixture(html`<ty-calendar locale="en-US" min="2026-01-01" value="2025-06-15"></ty-calendar>`)) as any;
    await nextFrame();
    el.focus();
    expect(focusedDay()).to.equal('Sunday, June 15, 2025');
  });

  it('the anchor follows the tab stop: after arrow keys the focused day takes the focus back', async () => {
    const form = (await fixture(html`
      <form><ty-calendar name="c" locale="en-US" value="2026-03-15"></ty-calendar><button>Send</button></form>
    `)) as HTMLFormElement;
    const cal = form.querySelector('ty-calendar') as any;
    await nextFrame();
    cal.focus();
    await sendKeys({ press: 'ArrowRight' });
    await sendKeys({ press: 'ArrowRight' });
    cal.setCustomValidity('Pick another day');
    (form.querySelector('button') as HTMLButtonElement).focus();
    form.reportValidity();
    expect(focusedDay()).to.equal('Tuesday, March 17, 2026');
  });

  it('an earlier invalid ty-input keeps the focus (first invalid field in form order)', async () => {
    const form = (await fixture(html`
      <form>
        <ty-input name="t" required></ty-input>
        <ty-calendar name="c" required></ty-calendar>
      </form>
    `)) as HTMLFormElement;
    await nextFrame();
    form.reportValidity();
    expect(document.activeElement?.getAttribute('name')).to.equal('t');
  });

  it('in the month view the month grid takes the focus', async () => {
    const form = (await fixture(html`
      <form><ty-calendar name="c" locale="en-US" required year="2026" month="3"></ty-calendar></form>
    `)) as HTMLFormElement;
    const cal = form.querySelector('ty-calendar') as any;
    await nextFrame();
    const nav = cal.shadowRoot.querySelector('ty-calendar-navigation') as any;
    nav.shadowRoot.querySelector('.nav-title').click();
    await nextFrame();
    form.reportValidity();
    let el: Element | null = document.activeElement;
    while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
    expect(el?.getAttribute('aria-label')).to.equal('March 2026');
  });

  // Disabled month cells are buttons, which take no focus: nothing did,
  // and the browser showed no message.
  it('in the month view with every month disabled the navigation title takes the focus', async () => {
    const form = (await fixture(html`
      <form><ty-calendar name="c" locale="en-US" min="2026-01-01" value="2025-06-15"></ty-calendar><button>Send</button></form>
    `)) as HTMLFormElement;
    const cal = form.querySelector('ty-calendar') as any;
    await nextFrame();
    const nav = cal.shadowRoot.querySelector('ty-calendar-navigation') as any;
    nav.shadowRoot.querySelector('.nav-title').click();
    await nextFrame();
    (form.querySelector('button') as HTMLButtonElement).focus();
    form.reportValidity();
    expect(nav.shadowRoot.activeElement?.className).to.equal('nav-title');
  });

  // On a blocked submit Firefox checks the host, not the anchor: a host that
  // can't take focus logged "The invalid form control with name='c' is not
  // focusable." (e2e/calendar-form.engines.spec.ts reads the console), also
  // with the focus on an earlier invalid field.
  it('the host itself takes focus and keeps it inside, wherever the focus was, in both views', async () => {
    const form = (await fixture(html`
      <form><input required><ty-calendar name="c" locale="en-US" required year="2026" month="3"></ty-calendar></form>
    `)) as HTMLFormElement;
    const cal = form.querySelector('ty-calendar') as any;
    const input = form.querySelector('input') as HTMLInputElement;
    await nextFrame();
    input.focus();
    HTMLElement.prototype.focus.call(cal);
    expect(cal.matches(':focus-within'), 'days').to.equal(true);
    await Promise.resolve();
    expect(focusedDay(), 'days: the tab stop').to.match(/, 2026$/);
    cal.shadowRoot.querySelector('ty-calendar-navigation').shadowRoot.querySelector('.nav-title').click();
    await nextFrame();
    input.focus();
    HTMLElement.prototype.focus.call(cal);
    expect(cal.matches(':focus-within'), 'months').to.equal(true);
    await Promise.resolve();
    // The tab stop month, not the first one (Enter picked January)
    let el: Element | null = document.activeElement;
    while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
    expect(el?.getAttribute('aria-label'), 'months: the tab stop').to.equal('March 2026');
  });

  // The month redrew its cells on a change of <html lang> it doesn't follow
  // (ty-calendar gives it a locale) and the anchor went with them.
  it('under a nearer [lang], a change of <html lang> leaves the anchor in place', async () => {
    const form = (await fixture(html`
      <form lang="de"><ty-calendar name="c" required year="2026" month="3"></ty-calendar><button>Send</button></form>
    `)) as HTMLFormElement;
    await nextFrame();
    const was = document.documentElement.lang;
    document.documentElement.lang = 'fr';
    try {
      await new Promise((r) => setTimeout(r));
      (form.querySelector('button') as HTMLButtonElement).focus();
      form.reportValidity();
      let el: Element | null = document.activeElement;
      while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
      expect(el?.classList.contains('calendar-day-cell')).to.equal(true);
    } finally {
      document.documentElement.lang = was;
    }
  });
});

// The host delegates focus to the calendar's container, which isn't a tab
// stop. Focus that reached it from a dialog, a label or autofocus stayed
// there: arrows did nothing and the whole calendar got a focus ring.
// (autofocus: e2e/calendar-form.engines.spec.ts, it needs a fresh page)
describe('ty-calendar — focus that reaches the container goes on to the grid', () => {
  const containerOf = (cal: any) => cal.shadowRoot.querySelector('.calendar-container') as HTMLElement;
  afterEach(() => resetMouse());

  it('a modal <dialog> opens on the tab stop day', async () => {
    const wrap = (await fixture(html`
      <div><dialog><ty-calendar locale="en-US" value="2026-03-15"></ty-calendar><button>OK</button></dialog></div>
    `)) as HTMLElement;
    const dialog = wrap.querySelector('dialog') as HTMLDialogElement;
    await nextFrame();
    try {
      dialog.showModal();
      await Promise.resolve();
      expect(focusedDay()).to.equal('Sunday, March 15, 2026');
      await sendKeys({ press: 'ArrowRight' });
      expect(focusedDay()).to.equal('Monday, March 16, 2026');
    } finally {
      dialog.close();
    }
  });

  it('a click on a <label for> or on the text of a wrapping <label> focuses the tab stop day', async () => {
    const wrap = (await fixture(html`
      <div>
        <label id="lab-for" for="cal-for">Date</label>
        <ty-calendar id="cal-for" locale="en-US" value="2026-03-15"></ty-calendar>
        <label><span id="lab-text">Other date</span><ty-calendar locale="en-US" value="2026-04-20"></ty-calendar></label>
        <button>elsewhere</button>
      </div>
    `)) as HTMLElement;
    const elsewhere = wrap.querySelector('button') as HTMLButtonElement;
    await nextFrame();
    elsewhere.focus({ preventScroll: true });
    await clickAt(wrap.querySelector('#lab-for') as HTMLElement);
    expect(focusedDay(), 'label for').to.equal('Sunday, March 15, 2026');
    elsewhere.focus({ preventScroll: true });
    await clickAt(wrap.querySelector('#lab-text') as HTMLElement);
    expect(focusedDay(), 'wrapping label').to.equal('Monday, April 20, 2026');
  });

  // The click itself leaves the focus on the container: on a touch screen it
  // focused the first day, which Enter then picked
  it('after a click on the weekday names: no ring around the calendar; an arrow goes into the grid', async () => {
    const el = (await fixture(html`<ty-calendar locale="en-US" value="2026-03-15"></ty-calendar>`)) as any;
    await nextFrame();
    await clickAt(monthOf(el).shadowRoot.querySelector('.calendar-header-cell'));
    await new Promise((r) => setTimeout(r));
    expect(el.shadowRoot.activeElement === containerOf(el), 'the click focuses the container').to.equal(true);
    await sendKeys({ press: 'Shift' });
    await sendKeys({ press: 'Enter' });
    expect(el.value, 'Enter picks nothing').to.equal('2026-03-15');
    expect(containerOf(el).matches(':focus-visible'), 'keyboard modality').to.equal(true);
    expect(getComputedStyle(containerOf(el)).outlineStyle).to.equal('none');
    await sendKeys({ press: 'ArrowRight' });
    expect(focusedDay()).to.equal('Sunday, March 15, 2026');
  });
});

// The navigation rebuilds its buttons on every move: the pressed one took the
// focus with it, and the next Enter pressed nothing.
describe('ty-calendar — the navigation keeps its focus', () => {
  const navOf = (el: any) => el.shadowRoot.querySelector('ty-calendar-navigation') as any;
  const focusedNav = (el: any) => (navOf(el).shadowRoot.activeElement as HTMLElement | null)?.className ?? null;

  it('Enter and Space on an arrow move the month and stay on that arrow', async () => {
    const el = (await fixture(html`<ty-calendar locale="en-US" value="2026-03-15"></ty-calendar>`)) as any;
    await nextFrame();
    navOf(el).shadowRoot.querySelector('.nav-month-next').focus();
    await sendKeys({ press: 'Enter' });
    expect(focusedNav(el)).to.equal('nav-btn nav-month-next');
    await sendKeys({ press: 'Space' });
    expect(focusedNav(el)).to.equal('nav-btn nav-month-next');
    expect(navOf(el).shadowRoot.querySelector('.nav-title').textContent).to.contain('May');
  });

  it('the arrow that reaches a bound hands the focus to the title', async () => {
    const el = (await fixture(html`<ty-calendar locale="en-US" value="2026-03-15" max="2026-04-20"></ty-calendar>`)) as any;
    await nextFrame();
    navOf(el).shadowRoot.querySelector('.nav-month-next').focus();
    await sendKeys({ press: 'Enter' });
    expect(focusedNav(el)).to.equal('nav-title');
  });

  it('a move while the navigation has no focus does not take it', async () => {
    const wrap = (await fixture(html`<div><button>before</button><ty-calendar value="2026-03-15"></ty-calendar></div>`)) as HTMLElement;
    const button = wrap.querySelector('button') as HTMLButtonElement;
    const cal = wrap.querySelector('ty-calendar') as any;
    await nextFrame();
    button.focus();
    cal.value = '2026-07-04';
    expect(document.activeElement === button).to.equal(true);
  });
});

describe('ty-calendar — required', () => {
  it('empty is valueMissing with the native date input message; a pick fixes it; reset empties it again', async () => {
    const form = (await fixture(html`
      <form><ty-calendar name="c" required year="2026" month="3"></ty-calendar></form>
    `)) as HTMLFormElement;
    const cal = form.querySelector('ty-calendar') as any;
    await nextFrame();
    expect(cal.required).to.equal(true);
    expect(cal.validity.valueMissing).to.equal(true);
    expect(cal.validationMessage).to.equal(nativeMessage('input', { type: 'date', required: true }));
    expect(form.checkValidity()).to.equal(false);

    monthOf(cal).shadowRoot.querySelector('.calendar-day-cell:not(.other-month)').click();
    expect(cal.validity.valid).to.equal(true);
    expect(new FormData(form).get('c')).to.equal('2026-03-01');

    form.reset();
    expect(cal.value).to.equal('');
    expect(cal.validity.valueMissing, 'reset: required and empty again').to.equal(true);
  });

  it('the property reflects; removing required makes an empty calendar valid', async () => {
    const el = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
    await nextFrame();
    expect(el.required).to.equal(false);
    expect(el.validity.valid).to.equal(true);
    el.required = true;
    expect(el.hasAttribute('required')).to.equal(true);
    expect(el.validity.valueMissing).to.equal(true);
    el.value = '2026-03-04';
    expect(el.validity.valid).to.equal(true);
    el.value = '';
    expect(el.validity.valueMissing).to.equal(true);
    el.required = false;
    expect(el.hasAttribute('required')).to.equal(false);
    expect(el.validity.valid).to.equal(true);
  });
});

describe('ty-calendar-navigation and ty-calendar-month — locale from an ancestor lang', () => {
  it('standalone under lang="de" render German; an explicit locale wins', async () => {
    const el = (await fixture(html`
      <section lang="de">
        <ty-calendar-navigation display-month="3" display-year="2026"></ty-calendar-navigation>
        <ty-calendar-navigation locale="fr-FR" display-month="3" display-year="2026"></ty-calendar-navigation>
        <ty-calendar-month .displayYear=${2026} .displayMonth=${3}></ty-calendar-month>
      </section>
    `)) as HTMLElement;
    await nextFrame();
    const [de, fr] = [...el.querySelectorAll('ty-calendar-navigation')] as any[];
    expect(de.locale).to.equal('de');
    expect(de.shadowRoot.querySelector('.nav-title-month').textContent).to.equal('März');
    expect(fr.shadowRoot.querySelector('.nav-title-month').textContent).to.equal('mars');
    const month = el.querySelector('ty-calendar-month') as any;
    expect(month.shadowRoot.querySelector('.calendar-header-cell').textContent).to.equal('Mo');

    el.setAttribute('lang', 'en-US');
    await nextFrame();
    expect(de.shadowRoot.querySelector('.nav-title-month').textContent).to.equal('March');
    expect(month.shadowRoot.querySelector('.calendar-header-cell').textContent).to.equal('Mon');
  });
});

describe('ty-calendar — value reads what ty-date-picker reads', () => {
  /** 'YYYY-MM-DD' of a Date's local day */
  const localDay = (d: Date) =>
    `${String(d.getFullYear()).padStart(4, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  it('an ISO instant attribute (Z) is its local day; value and form value stay YYYY-MM-DD', async () => {
    const instant = new Date(2026, 2, 14, 0, 0).toISOString(); // local midnight, as the picker emits
    const form = (await fixture(html`
      <form><ty-calendar name="c" value=${instant}></ty-calendar></form>
    `)) as HTMLFormElement;
    const cal = form.querySelector('ty-calendar') as any;
    await nextFrame();
    expect(cal.value).to.equal('2026-03-14');
    expect(new FormData(form).get('c')).to.equal('2026-03-14');
    expect([cal.getAttribute('year'), cal.getAttribute('month'), cal.getAttribute('day')]).to.deep.equal(['2026', '3', '14']);
    const selected = monthOf(cal).shadowRoot.querySelector('.calendar-day-cell.selected');
    expect(selected.textContent).to.equal('14');
  });

  it('an instant with an offset is its local day', async () => {
    const s = '2026-03-14T23:30:00+05:00';
    const el = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
    el.value = s;
    expect(el.value).to.equal(localDay(new Date(s)));
    el.setAttribute('value', '2026-07-01T12:00:00.000Z');
    expect(el.value).to.equal(localDay(new Date('2026-07-01T12:00:00.000Z')));
  });

  it('a local date-time (with or without seconds) is that day', async () => {
    const el = (await fixture(html`<ty-calendar value="2026-03-14T23:59"></ty-calendar>`)) as any;
    expect(el.value).to.equal('2026-03-14');
    el.value = '2026-04-02T00:00:30';
    expect(el.value).to.equal('2026-04-02');
  });

  it('epoch ms and a Date (property) are their local day', async () => {
    const el = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
    el.value = new Date(2026, 4, 9, 22, 15).getTime();
    expect(el.value).to.equal('2026-05-09');
    el.value = new Date(2026, 5, 1, 0, 5);
    expect(el.value).to.equal('2026-06-01');
  });

  it('epoch 0 is its local day; NaN, a digit string and invalid strings are no value', async () => {
    const zero = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
    zero.value = 0;
    expect(zero.value).to.equal(localDay(new Date(0)));
    for (const bad of ['2026-02-30', '2026-03-14T25:00', 'nope', '1773446400000', NaN, new Date(NaN)]) {
      const el = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
      el.value = bad;
      expect(el.value, String(bad)).to.equal('');
    }
  });

  it('years below 100 are kept (padded to 4 digits)', async () => {
    const el = (await fixture(html`<ty-calendar value="0099-05-05T10:00"></ty-calendar>`)) as any;
    expect(el.value).to.equal('0099-05-05');
    const d = new Date(2000, 0, 1, 12);
    d.setFullYear(42, 6, 4);
    el.value = d.toISOString();
    expect(el.value).to.equal('0042-07-04');
    expect(el.getAttribute('year')).to.equal('0042');
  });

  it('min/max as instants bound by their local day (grid, navigation and validity)', async () => {
    const min = new Date(2025, 5, 10, 0, 0).toISOString();
    const max = new Date(2025, 6, 20, 0, 0).toISOString();
    const el = (await fixture(html`
      <ty-calendar year="2025" month="6" min=${min} max=${max}></ty-calendar>
    `)) as any;
    await nextFrame();
    const cells = [...monthOf(el).shadowRoot.querySelectorAll('.calendar-day-cell')] as HTMLElement[];
    const day = (n: string) => cells.find((c) => !c.classList.contains('other-month') && c.textContent === n)!;
    expect(day('9').classList.contains('disabled'), 'day 9 disabled').to.equal(true);
    expect(day('10').classList.contains('disabled'), 'day 10 enabled').to.equal(false);
    const prev = el.shadowRoot.querySelector('ty-calendar-navigation').shadowRoot.querySelector('.nav-btn[class*="-prev"]') as HTMLButtonElement;
    expect(prev.disabled, 'no month before min').to.equal(true);

    el.value = '2025-06-09';
    expect(el.validity.rangeUnderflow).to.equal(true);
    expect(el.validationMessage).to.equal(nativeMessage('input', { type: 'date', min: '2025-06-10', max: '2025-07-20' }, '2025-06-09'));
    el.value = '2025-07-21';
    expect(el.validity.rangeOverflow).to.equal(true);
    el.value = '2025-07-20';
    expect(el.validity.valid).to.equal(true);
  });

  it('takes a ty-date-picker value as is, and the picker takes the calendar value back', async () => {
    const picker = (await fixture(html`<ty-date-picker value="2026-03-14"></ty-date-picker>`)) as any;
    const cal = (await fixture(html`<ty-calendar></ty-calendar>`)) as any;
    expect(picker.value).to.equal(new Date(2026, 2, 14).toISOString());
    cal.value = picker.value;
    expect(cal.value).to.equal('2026-03-14');
    cal.value = '2026-03-20';
    picker.value = cal.value;
    expect(picker.value).to.equal(new Date(2026, 2, 20).toISOString());
  });
});

describe('ty-calendar — moved in the DOM', () => {
  const shown = (el: any) =>
    el.shadowRoot.querySelector('ty-calendar-navigation').shadowRoot.textContent.replace(/\s+/g, '');
  const day = (el: any, n: string) => {
    const month = el.shadowRoot.querySelector('ty-calendar-month') as any;
    return [...month.shadowRoot.querySelectorAll('.calendar-day-cell')]
      .find((c: any) => !c.classList.contains('other-month') && c.textContent === n) as HTMLElement;
  };

  async function mount() {
    const form = (await fixture(html`
      <form><div id="a"><ty-calendar name="d" year="2025" month="6" day="3"></ty-calendar></div><div id="b"></div></form>
    `)) as HTMLFormElement;
    const el = form.querySelector('ty-calendar') as any;
    await nextFrame();
    return { form, el, move: async () => { form.querySelector('#b')!.appendChild(el); await nextFrame(); } };
  }

  it('stays on the month the user navigated to', async () => {
    const { el, move } = await mount();
    const nav = el.shadowRoot.querySelector('ty-calendar-navigation') as any;
    (nav.shadowRoot.querySelector('.nav-month-next') as HTMLElement).click();
    await nextFrame();
    const navigated = shown(el);
    expect(navigated).to.equal('July2025');

    await move();

    expect(shown(el)).to.equal(navigated);
    expect(el.value).to.equal('2025-06-03');
  });

  it('form.reset() after a move still restores the markup date', async () => {
    const { form, el, move } = await mount();
    day(el, '20').click();
    await nextFrame();
    expect(el.value).to.equal('2025-06-20');

    await move();
    form.reset();
    await nextFrame();

    expect(el.value).to.equal('2025-06-03');
  });
});
