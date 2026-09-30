import { fixture, html, expect, nextFrame, oneEvent, aTimeout } from '@open-wc/testing';
import '../lib/components/date-picker.js';
// date-picker.ts creates <ty-calendar> elements via document.createElement()
// without importing calendar.js itself, so the popup calendar (and its
// nested ty-calendar-month) never upgrade unless a test file registers them.
import '../lib/components/calendar.js';

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

describe('ty-date-picker clear()', () => {
  it('clears the value programmatically and fires change with source "clear"', async () => {
    const el = (await fixture(html`<ty-date-picker value="${ISO}"></ty-date-picker>`)) as any;
    await nextFrame();
    expect(el.value).to.not.be.null;

    setTimeout(() => el.clear());
    const ev = (await oneEvent(el, 'change')) as CustomEvent;

    expect(ev.detail.source).to.equal('clear');
    expect(el.value).to.be.null;
  });

  it('clicking .stub-clear clears the value and fires change (same effect as clear())', async () => {
    const el = (await fixture(html`<ty-date-picker value="${ISO}" clearable></ty-date-picker>`)) as any;
    await nextFrame();

    const clearBtn = el.shadowRoot.querySelector('.stub-clear') as HTMLButtonElement;
    expect(clearBtn, 'clear button rendered when clearable + has value').to.exist;

    setTimeout(() => clearBtn.click());
    const ev = (await oneEvent(el, 'change')) as CustomEvent;

    expect(ev.detail.source).to.equal('clear');
    expect(el.value).to.be.null;
  });
});

describe('ty-date-picker open-state desync', () => {
  it('reopens after _state.open is stranded true with a closed dialog', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-07-17"></ty-date-picker>`)) as any;

    // Simulate the desync: a host re-render replaced the dialog element
    // (fresh, closed) while internal state still says open.
    el._state.open = true;
    const dialog = el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.false;

    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    stub.click();
    await nextFrame();
    await nextFrame();

    const fresh = el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(fresh.open, 'click heals the desync and opens the dialog').to.be.true;
    expect(el._state.open).to.be.true;
  });
});

describe('ty-date-picker accessibility — keyboard focus + ARIA', () => {
  it('the stub is keyboard-focusable (tabindex="0") and carries role="button" + aria-haspopup', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    await nextFrame();
    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;

    expect(stub.getAttribute('tabindex'), 'in the tab order').to.equal('0');
    expect(stub.getAttribute('role')).to.equal('button');
    expect(stub.getAttribute('aria-haspopup')).to.equal('dialog');
  });

  it('disabled picker is removed from the tab order and marked aria-disabled', async () => {
    const el = (await fixture(html`<ty-date-picker disabled></ty-date-picker>`)) as any;
    await nextFrame();
    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;

    expect(stub.getAttribute('tabindex')).to.equal('-1');
    expect(stub.getAttribute('aria-disabled')).to.equal('true');
  });

  it('label is programmatically associated via aria-labelledby', async () => {
    const el = (await fixture(html`<ty-date-picker label="Arrival date"></ty-date-picker>`)) as any;
    await nextFrame();
    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    const labelledBy = stub.getAttribute('aria-labelledby');
    expect(labelledBy, 'aria-labelledby is set').to.be.a('string').and.not.empty;

    const label = el.shadowRoot.getElementById(labelledBy!);
    expect(label, 'the referenced label exists').to.exist;
    expect(label!.textContent).to.include('Arrival date');
  });

  it('Enter on the closed, focused stub opens the calendar (keyboard-only path)', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    await nextFrame();
    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;

    // No click, no mouse — the ONLY way a keyboard-only user can open this.
    stub.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await nextFrame();
    await nextFrame();

    const dialog = el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(dialog.open, 'opened via keyboard alone').to.be.true;
  });

  it('Space on the closed, focused stub also opens it', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    await nextFrame();
    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    stub.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await nextFrame();
    await nextFrame();

    const dialog = el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.true;
  });

  it('aria-expanded toggles true/false with the calendar open/close state', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    await nextFrame();
    let stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    expect(stub.getAttribute('aria-expanded'), 'closed initially').to.equal('false');

    stub.click();
    await nextFrame();
    await nextFrame();
    // Opening triggers a full DOM rebuild (see renderStub) — re-query.
    stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    expect(stub.getAttribute('aria-expanded'), 'true once open').to.equal('true');

    // handleStubClick only ever opens (a second click while open is a no-op
    // guard) — Escape is the real close path, wired via a document listener.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextFrame();
    stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    expect(stub.getAttribute('aria-expanded'), 'false again after close').to.equal('false');
  });
});

describe('ty-date-picker value edge cases', () => {
  it('an invalid attribute value in the initial markup self-heals to null via initializeState()', async () => {
    // onConnect() -> initializeState() unconditionally calls syncFormValue(),
    // which resets the 'value' property when it doesn't match the (empty)
    // parsed state — so THIS path is fine.
    const el = (await fixture(html`<ty-date-picker value="not-a-date"></ty-date-picker>`)) as any;
    await nextFrame();

    expect(el.value).to.be.null;
    const stub = el.shadowRoot.querySelector('.stub-text') as HTMLElement;
    expect(stub.classList.contains('placeholder')).to.be.true;
  });

  it('setting .value to a malformed string AFTER connect heals back to null, matching the display and form value', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    await nextFrame();

    el.value = 'not-a-date';
    await nextFrame();

    // Expected: a rejected/unparseable value getter should not silently
    // diverge from what the component displays and submits.
    // Actual: el.value === 'not-a-date' while display shows the placeholder
    // and the form value is null.
    expect(el.value, 'value getter should not strand raw garbage').to.be.null;
  });

  it('setting .value = "" clears the date (same effect as clear())', async () => {
    const el = (await fixture(html`<ty-date-picker value="${ISO}"></ty-date-picker>`)) as any;
    await nextFrame();
    expect(el.value).to.not.be.null;

    el.value = '';
    await nextFrame();

    expect(el.value).to.be.null;
    const stub = el.shadowRoot.querySelector('.stub-text') as HTMLElement;
    expect(stub.classList.contains('placeholder')).to.be.true;
  });

  it('accepts a Date object and round-trips it through the ISO getter', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    await nextFrame();

    const d = new Date(2026, 2, 3); // local March 3, 2026
    el.value = d;
    await nextFrame();

    expect(el.value).to.equal(d.toISOString());
  });

  it('a second clear() on an already-empty picker still fires a change event (no dirty-check guard)', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    await nextFrame();
    expect(el.value).to.be.null;

    setTimeout(() => el.clear());
    const ev = (await oneEvent(el, 'change')) as CustomEvent;
    expect(ev.detail.source).to.equal('clear');
    expect(ev.detail.value).to.be.null;
  });
});

describe('ty-date-picker with-time', () => {
  const openDialog = async (el: any) => {
    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    stub.click();
    await nextFrame();
    await nextFrame();
  };

  const typeDigit = (input: HTMLInputElement, digit: string) => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: digit, bubbles: true }));
  };

  it('typing 4 digits into the time input updates hour/minute and fires "time-change"', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-03-10" with-time></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);

    const timeInput = el.shadowRoot.querySelector('.time-input') as HTMLInputElement;
    expect(timeInput, 'time input rendered when with-time').to.exist;

    timeInput.focus();
    const changes: CustomEvent[] = [];
    el.addEventListener('change', (e: Event) => changes.push(e as CustomEvent));

    ['1', '4', '3', '0'].forEach((d) => typeDigit(timeInput, d));

    expect(timeInput.value).to.equal('14:30');
    expect(changes.length, 'one time-change event per digit').to.equal(4);
    const last = changes[changes.length - 1];
    expect(last.detail.source).to.equal('time-change');
    expect(last.detail.localValue).to.equal('2026-03-10T14:30');
  });

  it('rejects an hour first-digit greater than 2 (stays put, no event)', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-03-10" with-time></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);

    const timeInput = el.shadowRoot.querySelector('.time-input') as HTMLInputElement;
    timeInput.focus();

    let changeFired = false;
    el.addEventListener('change', () => { changeFired = true; });

    typeDigit(timeInput, '9'); // invalid first hour digit

    expect(timeInput.value, 'display unchanged').to.equal('00:00');
    expect(changeFired, 'no time-change for a rejected digit').to.be.false;
  });

  it('Backspace zeroes the previous digit and moves the caret back, but not past position 0', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-03-10" with-time></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);

    const timeInput = el.shadowRoot.querySelector('.time-input') as HTMLInputElement;
    timeInput.focus();
    ['1', '4', '3', '5'].forEach((d) => typeDigit(timeInput, d));
    expect(timeInput.value).to.equal('14:35');

    // Caret sits at position 5 (past the last digit) after typing 4 digits;
    // Backspace from there zeroes the LAST minute digit (currently '5').
    timeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    expect(timeInput.value, 'zeroes the last minute digit').to.equal('14:30');

    // Drive caret all the way back to position 0, then one more Backspace
    // must be a no-op rather than throwing or wrapping.
    timeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    timeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    expect(timeInput.value, 'Backspace at position 0 is a no-op').to.equal('14:30');
  });

  it('Home/End jump the caret to the first/last editable position', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-03-10" with-time></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);

    const timeInput = el.shadowRoot.querySelector('.time-input') as HTMLInputElement;
    timeInput.focus();

    timeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    typeDigit(timeInput, '5'); // End (pos 5) isn't an editable digit slot -> ignored
    expect(timeInput.value, 'digit typed past End is dropped').to.equal('00:00');

    timeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    typeDigit(timeInput, '2');
    expect(timeInput.value, 'digit typed at Home lands on the first hour digit').to.equal('20:00');
  });

  it('selecting a day while with-time keeps the popup open and focuses the time input', async () => {
    const el = (await fixture(html`<ty-date-picker with-time></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);

    const calendar = el.shadowRoot.querySelector('ty-calendar') as any;
    calendar.dispatchEvent(new CustomEvent('change', {
      detail: { year: 2026, month: 5, day: 12, dayContext: { year: 2026, month: 5, dayInMonth: 12 } },
    }));
    await nextFrame();

    const dialog = el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(dialog.open, 'stays open in with-time mode').to.be.true;

    await aTimeout(50); // requestAnimationFrame focus hop
    const timeInput = el.shadowRoot.querySelector('.time-input') as HTMLInputElement;
    expect(el.shadowRoot.activeElement).to.equal(timeInput);
  });
});

describe('ty-date-picker calendar selection', () => {
  it('selecting a day (no time) fires change with source "selection" and closes the popup', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    await nextFrame();
    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    stub.click();
    await nextFrame();
    await nextFrame();

    const calendar = el.shadowRoot.querySelector('ty-calendar') as any;
    setTimeout(() => {
      calendar.dispatchEvent(new CustomEvent('change', {
        detail: { year: 2026, month: 6, day: 9, dayContext: { year: 2026, month: 6, dayInMonth: 9 } },
      }));
    });
    const ev = (await oneEvent(el, 'change')) as CustomEvent;

    expect(ev.detail.source).to.equal('selection');
    expect(ev.detail.value).to.match(/^2026-06-0[89]T/); // local midnight → UTC, day-shift possible
    await nextFrame();

    const dialog = el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(dialog.open, 'closes after a plain date selection').to.be.false;
  });
});

describe('ty-date-picker min/max bounds', () => {
  const openDialog = async (el: any) => {
    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    stub.click();
    await nextFrame();
    await nextFrame();
  };

  it('forwards min/max to the embedded ty-calendar on open', async () => {
    const el = (await fixture(html`<ty-date-picker min="2026-06-10" max="2026-06-20"></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);

    const calendar = el.shadowRoot.querySelector('ty-calendar') as HTMLElement;
    expect(calendar.getAttribute('min')).to.equal('2026-06-10');
    expect(calendar.getAttribute('max')).to.equal('2026-06-20');
  });

  it('disables out-of-bounds days in the real rendered grid and ignores clicks on them', async () => {
    const el = (await fixture(html`
      <ty-date-picker value="2026-06-15" min="2026-06-10" max="2026-06-20"></ty-date-picker>
    `)) as any;
    await nextFrame();
    await openDialog(el);

    const calendar = el.shadowRoot.querySelector('ty-calendar') as any;
    await nextFrame();
    const month = calendar.shadowRoot.querySelector('ty-calendar-month') as any;
    await nextFrame();
    const dayCells = [...month.shadowRoot.querySelectorAll('.calendar-day')] as HTMLElement[];

    const day5 = dayCells.find(
      (c) => c.textContent?.trim() === '5' && !c.classList.contains('other-month'),
    );
    expect(day5, 'day 5 (before min) is rendered').to.exist;
    expect(day5!.classList.contains('disabled'), 'day before min is disabled').to.be.true;

    let changeFired = false;
    el.addEventListener('change', () => { changeFired = true; });
    day5!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await nextFrame();

    expect(changeFired, 'disabled day does not emit a selection').to.be.false;
    expect(el.value).to.not.include('2026-06-05');
  });

  it('live min/max attribute changes are propagated to an already-open popup calendar', async () => {
    const el = (await fixture(html`<ty-date-picker min="2026-06-01" max="2026-06-30"></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);

    el.min = '2026-06-15';
    await nextFrame();

    const calendar = el.shadowRoot.querySelector('ty-calendar') as HTMLElement;
    // Expected: forwarded live, like flavor already is.
    // Actual: calendar keeps the stale min from when the dialog opened.
    expect(calendar.getAttribute('min')).to.equal('2026-06-15');
  });

  it('changing min/max after a value is set does not retroactively clear or clamp it', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-06-15"></ty-date-picker>`)) as any;
    await nextFrame();

    el.min = '2026-07-01'; // now excludes the existing value
    el.max = '2026-07-31';
    await nextFrame();

    expect(el.value, 'no automatic clamping/clearing of an already-set value').to.include('2026-06');
  });
});

describe('ty-date-picker start-slot icon', () => {
  it('clicking slotted start content opens the popup (click bubbles to the stub)', async () => {
    const el = (await fixture(html`
      <ty-date-picker><span slot="start" class="my-icon">📅</span></ty-date-picker>
    `)) as any;
    await nextFrame();

    const icon = el.querySelector('.my-icon') as HTMLElement;
    icon.click();
    await nextFrame();
    await nextFrame();

    const dialog = el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.true;
  });
});

describe('ty-date-picker disabled state', () => {
  it('clicking a disabled stub does not open the popup', async () => {
    const el = (await fixture(html`<ty-date-picker disabled></ty-date-picker>`)) as any;
    await nextFrame();

    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    stub.click();
    await nextFrame();
    await nextFrame();

    const dialog = el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.false;
  });

  it('Enter on a disabled stub does not open the popup', async () => {
    const el = (await fixture(html`<ty-date-picker disabled></ty-date-picker>`)) as any;
    await nextFrame();

    const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    stub.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await nextFrame();
    await nextFrame();

    const dialog = el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.false;
  });

  it('does not render a clear button even when clearable + has a value', async () => {
    const el = (await fixture(html`<ty-date-picker value="${ISO}" clearable disabled></ty-date-picker>`)) as any;
    await nextFrame();

    const clearBtn = el.shadowRoot.querySelector('.stub-clear');
    expect(clearBtn, 'no clear affordance while disabled').to.not.exist;
  });
});

describe('ty-date-picker form participation', () => {
  it('form.reset() repopulates a value after clear(), consistent with FormData', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-date-picker name="d" value="2026-04-01"></ty-date-picker></form>
    `));
    const el = form.querySelector('ty-date-picker') as any;
    await nextFrame();

    el.clear();
    await nextFrame();
    expect(el.value).to.be.null;

    form.reset();
    await nextFrame();

    expect(el.value, 'reset repopulates a value').to.not.be.null;
  });

  it('after form.reset(), .value matches what the form actually submits', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-date-picker name="d" value="2026-04-01"></ty-date-picker></form>
    `));
    const el = form.querySelector('ty-date-picker') as any;
    await nextFrame();

    el.clear();
    await nextFrame();
    form.reset();
    await nextFrame();

    expect(el.value, '.value should match what the form actually submits').to.equal(new FormData(form).get('d'));
  });

  it('required + empty reports as invalid', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-date-picker name="d" required></ty-date-picker></form>
    `));
    await nextFrame();

    expect(form.checkValidity(), 'required + empty should be invalid').to.be.false;
  });

  it('an empty value is omitted from FormData consistent with .value being null', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-date-picker name="d"></ty-date-picker></form>
    `));
    const el = form.querySelector('ty-date-picker') as any;
    await nextFrame();

    expect(el.value).to.be.null;
    expect(new FormData(form).get('d')).to.be.null;
  });
});

describe('ty-date-picker locale-dependent formatting', () => {
  it('formats the displayed date differently per locale attribute', async () => {
    const elUS = (await fixture(html`<ty-date-picker value="2026-01-15" locale="en-US"></ty-date-picker>`)) as any;
    const elDE = (await fixture(html`<ty-date-picker value="2026-01-15" locale="de-DE"></ty-date-picker>`)) as any;
    await nextFrame();

    const textUS = (elUS.shadowRoot.querySelector('.stub-text') as HTMLElement).textContent;
    const textDE = (elDE.shadowRoot.querySelector('.stub-text') as HTMLElement).textContent;

    expect(textUS).to.not.equal(textDE);
    expect(textDE, 'German long-date style spells the month differently than English').to.exist;
  });
});

describe('ty-date-picker native mobile input', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    // Force isMobileTouch() -> true (utils/mobile.ts checks pointer:coarse
    // + max-width via matchMedia) without needing real touch/viewport.
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('renders a native <input type="date"> instead of the dialog on a touch/narrow viewport', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-06-15"></ty-date-picker>`)) as any;
    await nextFrame();

    const nativeInput = el.shadowRoot.querySelector('.native-date-input') as HTMLInputElement;
    expect(nativeInput, 'native input rendered').to.exist;
    expect(nativeInput.type).to.equal('date');
    expect(el.shadowRoot.querySelector('.calendar-dialog'), 'no popup dialog on mobile').to.not.exist;
  });

  it('mirrors min/max onto the native input, and onto a datetime-local input when with-time', async () => {
    const el = (await fixture(html`
      <ty-date-picker min="2026-06-01" max="2026-06-30"></ty-date-picker>
    `)) as any;
    await nextFrame();
    const nativeInput = el.shadowRoot.querySelector('.native-date-input') as HTMLInputElement;
    expect(nativeInput.min).to.equal('2026-06-01');
    expect(nativeInput.max).to.equal('2026-06-30');

    const elTime = (await fixture(html`
      <ty-date-picker min="2026-06-01" max="2026-06-30" with-time></ty-date-picker>
    `)) as any;
    await nextFrame();
    const nativeTimeInput = elTime.shadowRoot.querySelector('.native-date-input') as HTMLInputElement;
    expect(nativeTimeInput.type).to.equal('datetime-local');
    expect(nativeTimeInput.min).to.equal('2026-06-01T00:00');
    expect(nativeTimeInput.max).to.equal('2026-06-30T23:59');
  });

  it('parses a native input change into a selection and emits "change"', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    await nextFrame();
    const nativeInput = el.shadowRoot.querySelector('.native-date-input') as HTMLInputElement;

    nativeInput.value = '2026-08-20';
    setTimeout(() => nativeInput.dispatchEvent(new Event('change', { bubbles: true })));
    const ev = (await oneEvent(el, 'change')) as CustomEvent;

    expect(ev.detail.source).to.equal('selection');
    expect(el.value).to.match(/^2026-08-(19|20)T/);
  });

  it('emptying the native input clears the value', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-06-15"></ty-date-picker>`)) as any;
    await nextFrame();
    const nativeInput = el.shadowRoot.querySelector('.native-date-input') as HTMLInputElement;
    expect(nativeInput.value).to.not.equal('');

    nativeInput.value = '';
    setTimeout(() => nativeInput.dispatchEvent(new Event('change', { bubbles: true })));
    const ev = (await oneEvent(el, 'change')) as CustomEvent;

    expect(ev.detail.source).to.equal('clear');
    expect(el.value).to.be.null;
  });
});
