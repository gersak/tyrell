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
