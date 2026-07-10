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
});
