import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/calendar.js';
import '../lib/components/calendar-month.js';        // calendar.js only type-imports these,
import '../lib/components/calendar-navigation.js';   // so register them for the nested render
import '../lib/components/input.js';

// Locks in token overridability — including through a nested shadow, which is
// the exact case the :host-token bug broke (and the var(..,fallback) fix repairs).
const RED = 'rgb(255, 0, 0)';

describe('theming — token overrides reach into the shadow', () => {
  it('applies a token on a top-level component', async () => {
    const el = await fixture(html`<ty-input style="--ty-input-border: ${RED}"></ty-input>`);
    await nextFrame();
    const wrap = el.shadowRoot!.querySelector('.input-wrapper') as HTMLElement;
    expect(getComputedStyle(wrap).borderTopColor).to.equal(RED);
  });

  it('reaches a token into a NESTED component shadow (calendar → calendar-month)', async () => {
    const el = await fixture(html`<ty-calendar style="--ty-calendar-day-border: ${RED}"></ty-calendar>`);
    await nextFrame();
    await nextFrame();
    const month = el.shadowRoot!.querySelector('ty-calendar-month') as HTMLElement;
    expect(month, 'nested calendar-month').to.exist;
    const cell = month.shadowRoot!.querySelector('.calendar-day-cell') as HTMLElement;
    expect(cell, 'a day cell').to.exist;
    // Pre-fix this was blocked by calendar-month's :host declaration.
    expect(getComputedStyle(cell).borderTopColor).to.equal(RED);
  });
});
