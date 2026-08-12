import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/calendar-month.js';

// Fixed month for deterministic grid math: July 2026 (Monday-first weeks).
const YEAR = 2026;
const MONTH = 7;

const cells = (el: any): HTMLElement[] =>
  Array.from(el.shadowRoot.querySelectorAll('.calendar-day-cell'));

describe('ty-calendar-month ARIA grid structure', () => {
  it('the days container is role="grid" with rows and columnheaders', async () => {
    const el = (await fixture(html`
      <ty-calendar-month .displayYear=${YEAR} .displayMonth=${MONTH}></ty-calendar-month>
    `)) as any;
    await nextFrame();

    const grid = el.shadowRoot.querySelector('.calendar-flex-container');
    expect(grid.getAttribute('role')).to.equal('grid');
    expect(grid.getAttribute('aria-label'), 'names the displayed month').to.include('2026');

    const rows = el.shadowRoot.querySelectorAll('[role="row"]');
    expect(rows.length, 'header row + 6 week rows').to.equal(7);

    const headers = el.shadowRoot.querySelectorAll('[role="columnheader"]');
    expect(headers.length).to.equal(7);
  });

  it('every day cell is a gridcell with a full-date aria-label', async () => {
    const el = (await fixture(html`
      <ty-calendar-month .displayYear=${YEAR} .displayMonth=${MONTH}></ty-calendar-month>
    `)) as any;
    await nextFrame();

    const dayCells = cells(el);
    expect(dayCells.length, '6 weeks x 7 days').to.equal(42);
    dayCells.forEach((c) => {
      expect(c.getAttribute('role')).to.equal('gridcell');
      expect(c.getAttribute('aria-label'), 'full readable date, not just the day number')
        .to.match(/\d{4}/); // contains a year — proves it's not just "15"
    });
  });
});

describe('ty-calendar-month roving tabindex', () => {
  it('exactly one gridcell is tabindex="0"; the rest are "-1"', async () => {
    const el = (await fixture(html`
      <ty-calendar-month .displayYear=${YEAR} .displayMonth=${MONTH}></ty-calendar-month>
    `)) as any;
    await nextFrame();

    const dayCells = cells(el);
    const tabbable = dayCells.filter((c) => c.getAttribute('tabindex') === '0');
    expect(tabbable, 'exactly one roving cell').to.have.lengthOf(1);
    dayCells.forEach((c) => {
      expect(['0', '-1']).to.include(c.getAttribute('tabindex'));
    });
  });

  it('defaults the roving cell to today when nothing is selected', async () => {
    const now = new Date();
    const el = (await fixture(html`
      <ty-calendar-month display-year="${now.getFullYear()}" display-month="${now.getMonth() + 1}"></ty-calendar-month>
    `)) as any;
    await nextFrame();

    const todayCell = el.shadowRoot.querySelector('.calendar-day-cell.today');
    expect(todayCell.getAttribute('tabindex'), 'today is the roving cell').to.equal('0');
  });

  it('disabled (out-of-range) days are excluded from the roving set and tab order', async () => {
    const el = (await fixture(html`
      <ty-calendar-month .displayYear=${YEAR} .displayMonth=${MONTH} min="2026-07-10"></ty-calendar-month>
    `)) as any;
    await nextFrame();

    const disabledCells = cells(el).filter((c) => c.classList.contains('disabled'));
    expect(disabledCells.length, 'some days are before min').to.be.greaterThan(0);
    disabledCells.forEach((c) => {
      expect(c.getAttribute('tabindex')).to.equal('-1');
      expect(c.getAttribute('aria-disabled')).to.equal('true');
    });
  });
});

describe('ty-calendar-month keyboard: arrow-key navigation + Enter/Space to select', () => {
  const focusRovingCell = (el: any): HTMLElement => {
    const roving = cells(el).find((c) => c.getAttribute('tabindex') === '0')!;
    roving.focus();
    return roving;
  };

  it('ArrowRight moves the roving cell one day forward and moves DOM focus with it', async () => {
    const el = (await fixture(html`
      <ty-calendar-month .displayYear=${YEAR} .displayMonth=${MONTH}></ty-calendar-month>
    `)) as any;
    await nextFrame();
    const start = focusRovingCell(el);
    const startIndex = cells(el).indexOf(start);

    start.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await nextFrame();

    const all = cells(el);
    expect(start.getAttribute('tabindex'), 'old cell demoted').to.equal('-1');
    const nowRoving = all.find((c) => c.getAttribute('tabindex') === '0')!;
    expect(all.indexOf(nowRoving), 'moved exactly one day forward').to.equal(startIndex + 1);
    expect(el.shadowRoot.activeElement, 'DOM focus actually followed').to.equal(nowRoving);
  });

  it('ArrowDown moves the roving cell one full week (7 days) forward', async () => {
    const el = (await fixture(html`
      <ty-calendar-month .displayYear=${YEAR} .displayMonth=${MONTH}></ty-calendar-month>
    `)) as any;
    await nextFrame();
    const start = focusRovingCell(el);
    const startIndex = cells(el).indexOf(start);

    start.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await nextFrame();

    const nowRoving = cells(el).find((c) => c.getAttribute('tabindex') === '0')!;
    expect(cells(el).indexOf(nowRoving)).to.equal(startIndex + 7);
  });

  it('ArrowUp clamps at the top row instead of throwing or wrapping past index 0', async () => {
    const el = (await fixture(html`
      <ty-calendar-month .displayYear=${YEAR} .displayMonth=${MONTH}></ty-calendar-month>
    `)) as any;
    await nextFrame();

    // Drive real events only — the component tracks roving state
    // internally (_focusedIndex), so poking DOM tabindex directly (without
    // going through a real keydown) would desync from what the keydown
    // handler actually reads. ArrowUp enough times to guarantee reaching
    // (and then clamping at) the top row regardless of where "today"
    // happens to fall in this grid.
    for (let i = 0; i < 8; i++) {
      const roving = cells(el).find((c) => c.getAttribute('tabindex') === '0')!;
      roving.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      await nextFrame();
    }
    const topRowIndex = cells(el).indexOf(cells(el).find((c) => c.getAttribute('tabindex') === '0')!);
    expect(topRowIndex, 'landed in the top row').to.be.lessThan(7);

    // One more ArrowUp from the top row must be a genuine no-op (clamped),
    // not a crash and not moving to a different cell.
    const beforeCell = cells(el).find((c) => c.getAttribute('tabindex') === '0')!;
    beforeCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await nextFrame();
    const stillRoving = cells(el).filter((c) => c.getAttribute('tabindex') === '0');
    expect(stillRoving, 'still exactly one roving cell').to.have.lengthOf(1);
    expect(stillRoving[0], 'did not move further').to.equal(beforeCell);
  });

  it('Enter on the focused gridcell selects that day (day-click fires)', async () => {
    const el = (await fixture(html`
      <ty-calendar-month .displayYear=${YEAR} .displayMonth=${MONTH}></ty-calendar-month>
    `)) as any;
    await nextFrame();
    const roving = focusRovingCell(el);

    let detail: any = null;
    el.addEventListener('day-click', (e: CustomEvent) => { detail = e.detail; });
    roving.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(detail, 'day-click fired from keyboard alone, no pointer event').to.exist;
  });

  it('Space on the focused gridcell also selects that day', async () => {
    const el = (await fixture(html`
      <ty-calendar-month .displayYear=${YEAR} .displayMonth=${MONTH}></ty-calendar-month>
    `)) as any;
    await nextFrame();
    const roving = focusRovingCell(el);

    let fired = false;
    el.addEventListener('day-click', () => { fired = true; });
    roving.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(fired).to.be.true;
  });

  it('arrow keys do not activate a disabled day at the grid boundary', async () => {
    const el = (await fixture(html`
      <ty-calendar-month .displayYear=${YEAR} .displayMonth=${MONTH} min="2026-07-05"></ty-calendar-month>
    `)) as any;
    await nextFrame();
    // Move the roving cell onto the first ENABLED day, then try to step
    // left into disabled territory — it must refuse (no-op), not crash.
    const all = cells(el);
    const firstEnabled = all.find((c) => !c.classList.contains('disabled'))!;
    all.forEach((c) => c.setAttribute('tabindex', c === firstEnabled ? '0' : '-1'));
    firstEnabled.focus();

    firstEnabled.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await nextFrame();

    expect(firstEnabled.getAttribute('tabindex'), 'refused to move onto a disabled day').to.equal('0');
  });
});
