import { fixture, html, expect, nextFrame, oneEvent, aTimeout } from '@open-wc/testing';
import { sendKeys, sendMouse, resetMouse } from '@web/test-runner-commands';
import '../lib/components/date-picker.js';
// date-picker.ts creates <ty-calendar> elements via document.createElement()
// without importing calendar.js itself, so the popup calendar (and its
// nested ty-calendar-month) never upgrade unless a test file registers them.
import '../lib/components/calendar.js';
import '../lib/components/modal.js';
import { nativeMessage } from '../lib/utils/validity.js';
import { getActiveLocks } from '../lib/utils/scroll-lock.js';

// date-picker normalizes to a UTC ISO timestamp by default; the exact day is
// timezone-dependent (date-only input is anchored at local midnight → UTC),
// so assert the normalized SHAPE and that FormData stays consistent with
// .value rather than a specific date string.
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
    const el = (await fixture(html`<ty-date-picker value="${ISO}"></ty-date-picker>`)) as any;
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
    const el = (await fixture(html`<ty-date-picker value="${ISO}"></ty-date-picker>`)) as any;
    await nextFrame();

    const clearBtn = el.shadowRoot.querySelector('.stub-clear') as HTMLButtonElement;
    expect(clearBtn, 'clear button rendered by default when it has a value').to.exist;

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

  // The close rebuilds the dialog; the old one's `open` observer fired a
  // microtask later and closed the popup a click had opened meanwhile.
  it('opens on a click in the same task as a close', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-07-17"></ty-date-picker>`)) as any;
    const stub = () => el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
    const dialog = () => el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    stub().click();
    await nextFrame();
    await nextFrame();
    expect(dialog().open, 'opened').to.be.true;

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    el._closeTimestamp = 0; // the 300 ms reopen guard isn't under test
    stub().click();
    await nextFrame();
    await nextFrame();
    expect(dialog().open, 'reopened').to.be.true;
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

  it('Enter / Space on the focused clear button clear the value (no calendar); focus stays on the field', async () => {
    for (const key of ['Enter', 'Space']) {
      const el = (await fixture(html`<ty-date-picker value="2026-06-09"></ty-date-picker>`)) as any;
      (el.shadowRoot.querySelector('.stub-clear') as HTMLButtonElement).focus();
      await sendKeys({ press: key });
      await nextFrame();
      await nextFrame();
      expect(el.value, key).to.equal(null);
      expect(el.shadowRoot.querySelector('.calendar-dialog').open, key).to.be.false;
      expect(el.shadowRoot.activeElement === el.shadowRoot.querySelector('.date-picker-stub'), key).to.equal(true);
    }
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

  const fields = (el: any) => ({
    hour: el.shadowRoot.querySelector('.time-hour') as HTMLInputElement,
    minute: el.shadowRoot.querySelector('.time-minute') as HTMLInputElement,
  });

  // Keys go to whichever field has focus — a completed hour hands off to minutes
  const press = (el: any, key: string) =>
    (el.shadowRoot.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

  it('typing 4 digits fills hours then minutes and fires "time-change"', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-03-10" with-time></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);

    const { hour, minute } = fields(el);
    expect(hour, 'hour field rendered when with-time').to.exist;
    expect(minute, 'minute field rendered when with-time').to.exist;

    hour.focus();
    const changes: CustomEvent[] = [];
    el.addEventListener('change', (e: Event) => changes.push(e as CustomEvent));

    ['1', '4', '3', '0'].forEach((d) => press(el, d));

    expect([hour.value, minute.value]).to.deep.equal(['14', '30']);
    expect(changes.length, 'one time-change event per digit').to.equal(4);
    const last = changes[changes.length - 1];
    expect(last.detail.source).to.equal('time-change');
    expect(last.detail.localValue).to.equal('2026-03-10T14:30');
  });

  it('an hour first-digit greater than 2 completes the hour and moves to minutes', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-03-10" with-time></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);

    const { hour, minute } = fields(el);
    hour.focus();
    press(el, '9');

    expect(hour.value).to.equal('09');
    expect(el.shadowRoot.activeElement, 'focus handed to minutes').to.equal(minute);
  });

  it('Backspace zeroes the minutes, then a second Backspace returns to hours', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-03-10" with-time></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);

    const { hour, minute } = fields(el);
    hour.focus();
    ['1', '4', '3', '5'].forEach((d) => press(el, d));
    expect([hour.value, minute.value]).to.deep.equal(['14', '35']);

    press(el, 'Backspace');
    expect(minute.value, 'zeroes the minutes').to.equal('00');
    expect(el.shadowRoot.activeElement).to.equal(minute);

    press(el, 'Backspace');
    expect(el.shadowRoot.activeElement, 'empty minutes + Backspace goes back to hours').to.equal(hour);
    expect(hour.value, 'hours untouched').to.equal('14');
  });

  it('Arrow Up/Down wrap the value; Left/Right cross between fields; letters are ignored', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-03-10" with-time></ty-date-picker>`)) as any;
    await nextFrame();
    await openDialog(el);

    const { hour, minute } = fields(el);
    hour.focus();

    press(el, 'ArrowDown');
    expect(hour.value, '00 wraps down to 23').to.equal('23');
    press(el, 'ArrowUp');
    expect(hour.value, '23 wraps up to 00').to.equal('00');

    press(el, 'x');
    expect(hour.value, 'non-digit dropped').to.equal('00');

    press(el, 'ArrowRight');
    expect(el.shadowRoot.activeElement).to.equal(minute);
    press(el, 'ArrowLeft');
    expect(el.shadowRoot.activeElement).to.equal(hour);
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
    expect(ev.detail.value).to.equal(new Date(2026, 5, 9).toISOString()); // local midnight → UTC
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
    day5!.click();
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

  it('focus() on a disabled picker does nothing, like a disabled input', async () => {
    const el = (await fixture(html`<ty-date-picker disabled></ty-date-picker>`)) as any;
    el.focus();
    expect(el.shadowRoot.activeElement === null).to.equal(true);
    expect(document.activeElement === el).to.equal(false);
  });

  it('disabled: no clear button even with a value', async () => {
    const el = (await fixture(html`<ty-date-picker value="${ISO}" disabled></ty-date-picker>`)) as any;
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

  // Every render replaces the stub the validity is anchored to; a stale
  // anchor made setValidity() (and so setCustomValidity()) throw NotFoundError.
  it('setCustomValidity() works on a required, empty picker after re-renders', async () => {
    const el = (await fixture(html`<ty-date-picker required></ty-date-picker>`)) as any;
    await nextFrame();
    el.setAttribute('label', 'When');
    el.setAttribute('size', 'lg');
    await nextFrame();

    expect(() => el.setCustomValidity('Pick a weekday')).to.not.throw();
    expect(el.validationMessage).to.equal('Pick a weekday');
    expect(() => el.setCustomValidity('')).to.not.throw();
    expect(el.validity.valueMissing).to.be.true;
    expect(el.validity.customError).to.be.false;
  });

  it('an empty value submits name= like a native date input (.value stays null)', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-date-picker name="d"></ty-date-picker></form>
    `));
    const el = form.querySelector('ty-date-picker') as any;
    await nextFrame();

    expect(el.value).to.be.null;
    expect(new FormData(form).get('d')).to.equal('');
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

    // Instants: their local day
    el.min = new Date(2026, 5, 2).toISOString();
    el.max = new Date(2026, 5, 29, 23, 30).toISOString();
    expect([nativeInput.min, nativeInput.max]).to.deep.equal(['2026-06-02', '2026-06-29']);

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
    expect(el.value).to.equal(new Date(2026, 7, 20).toISOString());
  });

  it('focus() lands on the native input', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    el.focus();
    expect(el.shadowRoot.activeElement).to.equal(el.shadowRoot.querySelector('.native-date-input'));
  });

  it('with-time toggled at runtime switches the native input type, keeping the day and time', async () => {
    const el = (await fixture(html`<ty-date-picker native value="2026-06-15T14:30"></ty-date-picker>`)) as any;
    const input = () => el.shadowRoot.querySelector('.native-date-input') as HTMLInputElement;
    expect([input().type, input().value]).to.deep.equal(['date', '2026-06-15']);
    el.withTime = true;
    expect([input().type, input().value]).to.deep.equal(['datetime-local', '2026-06-15T14:30']);
    expect(el.value).to.equal('2026-06-15T14:30');
    el.withTime = false;
    expect([input().type, input().value]).to.deep.equal(['date', '2026-06-15']);
  });

  it('min/max, required and disabled follow runtime changes on the native input', async () => {
    const el = (await fixture(html`<ty-date-picker min="2026-06-01"></ty-date-picker>`)) as any;
    const input = el.shadowRoot.querySelector('.native-date-input') as HTMLInputElement;
    el.withTime = true;
    expect(input.min).to.equal('2026-06-01T00:00');
    el.max = '2026-06-30';
    el.min = '';
    el.required = true;
    el.disabled = true;
    expect([input.min, input.max, input.required, input.disabled])
      .to.deep.equal(['', '2026-06-30T23:59', true, true]);
  });

  it('a new day on a date-only native input keeps the time with-time had', async () => {
    const el = (await fixture(html`<ty-date-picker native with-time value="2026-06-15T14:30"></ty-date-picker>`)) as any;
    el.withTime = false;
    const input = el.shadowRoot.querySelector('.native-date-input') as HTMLInputElement;
    input.value = '2026-06-20';
    input.dispatchEvent(new Event('change'));
    expect(el.value).to.equal('2026-06-20');
    el.withTime = true;
    expect(el.value).to.equal('2026-06-20T14:30');
  });

  // A loaded instant (the default output, back from a server) keeps its
  // epoch until the user edits: the native input's edit must replace it.
  it('a native input edit replaces a loaded instant (default mode)', async () => {
    const loaded = '2026-10-16T12:30:00.000Z';
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-date-picker name="d" with-time value="${loaded}"></ty-date-picker></form>
    `));
    const el = form.querySelector('ty-date-picker') as any;
    const input = el.shadowRoot.querySelector('.native-date-input') as HTMLInputElement;
    input.value = '2026-10-20T15:00';
    setTimeout(() => input.dispatchEvent(new Event('change')));
    const ev = (await oneEvent(el, 'change')) as CustomEvent;
    const picked = new Date(2026, 9, 20, 15, 0).toISOString();
    expect(ev.detail.value).to.equal(picked);
    expect(el.value).to.equal(picked);
    expect(new FormData(form).get('d')).to.equal(picked);
    expect(el.shadowRoot.querySelector('.stub-text').textContent).to.equal(ev.detail.formatted);

    // Date-only: a new day keeps the loaded time, not the loaded day
    const day = (await fixture(html`<ty-date-picker value="${loaded}"></ty-date-picker>`)) as any;
    const dayInput = day.shadowRoot.querySelector('.native-date-input') as HTMLInputElement;
    dayInput.value = '2026-10-20';
    dayInput.dispatchEvent(new Event('change'));
    expect(day.value).to.equal(new Date(2026, 9, 20).toISOString());
    day.withTime = true;
    const at = new Date(loaded);
    expect(day.value).to.equal(new Date(2026, 9, 20, at.getHours(), at.getMinutes()).toISOString());
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

  it('clearing with × keeps the focus on the field: the native input, not <body>', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-06-15"></ty-date-picker>`)) as any;
    const clear = el.shadowRoot.querySelector('.stub-clear') as HTMLButtonElement;
    clear.focus();
    clear.click();
    await nextFrame();
    expect(el.value).to.be.null;
    expect(el.shadowRoot.activeElement === el.shadowRoot.querySelector('.native-date-input')).to.equal(true);
  });

  it('clearing with × leaves the focus where the change handler moved it', async () => {
    const wrap = (await fixture(html`<div><ty-date-picker value="2026-06-15"></ty-date-picker><input id="next"></div>`)) as HTMLElement;
    const el = wrap.querySelector('ty-date-picker') as any;
    const next = wrap.querySelector('#next') as HTMLInputElement;
    el.addEventListener('change', (e: CustomEvent) => {
      if (e.detail.source === 'clear') next.focus();
    });
    const clear = el.shadowRoot.querySelector('.stub-clear') as HTMLButtonElement;
    clear.focus();
    clear.click();
    await nextFrame();
    expect(el.value).to.be.null;
    expect(document.activeElement === next).to.equal(true);
  });
});

// Value rules. Expected values are built from LOCAL Date constructors, so
// these hold in any timezone the browser runs in (TZ=… npx wtr runs them in
// another); the per-timezone matrix (Zagreb, New York, Tokyo, UTC, Kolkata,
// clock changes incl. Santiago) is e2e/date-picker-value.engines.spec.ts.
describe('ty-date-picker value formats', () => {
  const local = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min);
  const pad = (n: number) => String(n).padStart(2, '0');
  /** Local wall-clock of a Date as a datetime-local string. */
  const wallClock = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const inForm = async (attrs: string) => {
    const form = document.createElement('form');
    form.innerHTML = `<ty-date-picker name="d" ${attrs}></ty-date-picker>`;
    document.body.append(form);
    await nextFrame();
    const el = form.querySelector('ty-date-picker') as any;
    return { form, el, submitted: () => new FormData(form).get('d') };
  };
  afterEach(() => document.querySelectorAll('body > form').forEach((f) => f.remove()));

  it('default, date-only: the instant the day starts locally', async () => {
    const { el, submitted } = await inForm('value="2026-10-16"');
    expect(el.value).to.equal(local(2026, 10, 16).toISOString());
    expect(submitted()).to.equal(el.value);
  });

  it('default, with-time: the picked instant', async () => {
    const { el, submitted } = await inForm('value="2026-10-16T14:30" with-time');
    expect(el.value).to.equal(local(2026, 10, 16, 14, 30).toISOString());
    expect(submitted()).to.equal(el.value);
  });

  it('native, date-only: "YYYY-MM-DD" like <input type=date>', async () => {
    const { el, submitted } = await inForm('value="2026-10-16" native');
    expect(el.value).to.equal('2026-10-16');
    expect(submitted()).to.equal('2026-10-16');
  });

  it('native, with-time: "YYYY-MM-DDTHH:mm" like <input type=datetime-local>', async () => {
    const { el, submitted } = await inForm('value="2026-10-16T14:30:00" with-time native');
    expect(el.value).to.equal('2026-10-16T14:30');
    expect(submitted()).to.equal('2026-10-16T14:30');
  });

  it('value before with-time/native in attribute order still keeps the time', async () => {
    const el = (await fixture(html`<ty-date-picker value="2026-10-16T14:30" with-time native></ty-date-picker>`)) as any;
    expect(el.value).to.equal('2026-10-16T14:30');
    const instant = (await fixture(html`<ty-date-picker value="2026-10-16T12:30:00.000Z" with-time></ty-date-picker>`)) as any;
    expect(instant.value).to.equal('2026-10-16T12:30:00.000Z');
  });

  it('reads an instant as its LOCAL day — the default value round-trips into native', async () => {
    const { el } = await inForm('native');
    el.value = local(2026, 10, 16).toISOString();
    expect(el.value).to.equal('2026-10-16');
    el.value = local(2026, 10, 16, 23, 30).toISOString();
    expect(el.value).to.equal('2026-10-16');
  });

  it('reads an instant with an offset as its local day and time', async () => {
    const { el } = await inForm('native with-time');
    const iso = '2026-10-16T23:30:00+05:45';
    el.value = iso;
    expect(el.value).to.equal(wallClock(new Date(iso)));
  });

  it('reads a zone-less date-time as local wall-clock (date-only keeps that day)', async () => {
    const { el } = await inForm('');
    el.value = '2026-10-16T23:30';
    expect(el.value).to.equal(local(2026, 10, 16).toISOString());
  });

  it('reads epoch milliseconds (a number) and Date objects as local', async () => {
    const { el } = await inForm('native with-time');
    const ms = local(2026, 10, 16, 14, 30).getTime();
    el.value = ms;
    expect(el.value).to.equal('2026-10-16T14:30');
    el.native = false;
    el.withTime = false;
    el.value = local(2026, 3, 3);
    expect(el.value).to.equal(local(2026, 3, 3).toISOString());
  });

  it('a digit string is not epoch milliseconds ("2026" is no 1970 date)', async () => {
    const { el } = await inForm('native');
    el.setAttribute('value', '2026');
    expect(el.value ?? '').to.not.match(/^1970/);
    const ms = local(2026, 10, 16, 14, 30).getTime();
    el.setAttribute('value', String(ms));
    expect(el.value).to.not.equal('2026-10-16');
  });

  it('seconds only when non-zero, like datetime-local', async () => {
    const { el, submitted } = await inForm('native with-time value="2026-10-16T14:30:45"');
    expect(el.value).to.equal('2026-10-16T14:30:45');
    expect(submitted()).to.equal('2026-10-16T14:30:45');
    el.value = '2026-10-16T14:30:00.000';
    expect(el.value).to.equal('2026-10-16T14:30');
    el.native = false;
    el.value = '2026-10-16T14:30:45';
    expect(el.value).to.equal(local(2026, 10, 16, 14, 30).toISOString().replace(':00.000Z', ':45.000Z'));
  });

  it('a day or time that does not exist is no value (like the native inputs)', async () => {
    const { el, submitted } = await inForm('native with-time value="2026-10-16"');
    for (const bad of ['2026-02-30', '2026-13-01', '2026-10-16T24:00', '2026-10-16T10:60', 'garbage']) {
      el.value = '2026-10-16';
      el.value = bad;
      expect(el.value, bad).to.equal(null);
      expect(submitted(), bad).to.equal('');
    }
    el.value = '2028-02-29';
    expect(el.value, 'leap day').to.equal('2028-02-29T00:00');
  });

  // new Date(99, …) is 1999: years below 100 must not take that path
  it('years below 100 round-trip in both modes', async () => {
    const { el, submitted } = await inForm('value="0099-05-05"');
    const start = new Date(0);
    start.setFullYear(99, 4, 5);
    start.setHours(0, 0, 0, 0);
    expect(el.value).to.equal(start.toISOString());
    el.native = true;
    expect(el.value).to.equal('0099-05-05');
    el.native = false;
    expect(el.value).to.equal(start.toISOString());
    expect(submitted()).to.equal(el.value);

    el.withTime = true;
    el.value = '0099-05-05T10:30';
    start.setHours(10, 30);
    expect(el.value).to.equal(start.toISOString());
    const instant = el.value;
    el.native = true;
    el.value = instant; // read back from the instant
    expect(el.value).to.equal('0099-05-05T10:30');
  });

  it('a year below 100 reaches the popup calendar: it opens on May 99, a pick keeps the year', async () => {
    const { el } = await inForm('native locale="en-US" value="0099-05-05"');
    (el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement).click();
    await nextFrame();
    await nextFrame();
    const calendar = el.shadowRoot.querySelector('ty-calendar') as any;
    expect(calendar.getAttribute('year')).to.equal('0099');
    expect(calendar.value).to.equal('0099-05-05');
    const cells = [...calendar.shadowRoot.querySelector('ty-calendar-month').shadowRoot.querySelectorAll('.calendar-day-cell')] as HTMLElement[];
    expect(cells.find((c) => c.classList.contains('selected'))?.getAttribute('aria-label')).to.equal('Tuesday, May 5, 99');
    cells.find((c) => c.getAttribute('aria-label') === 'Sunday, May 10, 99')!.click();
    expect(el.value).to.equal('0099-05-10');
  });

  // The popup calendar read year "99" as no year and stayed on the previous
  // value's month. Set by property after load, closed and open. One test per
  // value: each walks a few open/close cycles.
  describe('the popup follows a value set later, closed or open, years 1-99 included', () => {
    const setup = async (attrs = 'value="2026-09-24"') => {
      const { el } = await inForm(`locale="en-US" ${attrs}`);
      // closeDropdown() rebuilds the stub and dialog: query them fresh
      const dialog = () => el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
      const shows = (v: string) => {
        const calendar = el.shadowRoot.querySelector('ty-calendar') as any;
        const month = calendar.shadowRoot.querySelector('ty-calendar-month');
        const [y, m, d] = v.split('-').map(Number);
        const name = new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'long' });
        expect(calendar.value, v).to.equal(v);
        expect(month.shadowRoot.querySelector('[role="grid"]').getAttribute('aria-label'), v).to.equal(`${name} ${y}`);
        const selected = month.shadowRoot.querySelector('.calendar-day-cell.selected');
        expect(selected?.getAttribute('aria-label') ?? '', v).to.match(new RegExp(`${name} ${d}, ${y}$`));
      };
      const open = async () => {
        el._closeTimestamp = 0; // the 300 ms reopen guard after a close isn't under test
        (el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement).click();
        await nextFrame();
        await nextFrame();
        expect(dialog().open, 'open').to.equal(true);
      };
      const close = () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(dialog().open, 'closed').to.equal(false);
      };
      // The popup has shown another month before the value changes
      await open();
      close();
      return { el, shows, open, close };
    };

    for (const v of ['0099-05-05', '2024-03-07', '0001-01-01', '0004-02-29']) {
      it(`${v} set closed, then 0077-12-31 set open`, async () => {
        const { el, shows, open, close } = await setup();
        el.value = v;
        await open();
        shows(v);
        el.value = '0077-12-31'; // while open
        await nextFrame();
        shows('0077-12-31');
        close();
        await open();
        shows('0077-12-31');
      });
    }

    it('the value attribute, set closed', async () => {
      const { el, shows, open } = await setup('value="0077-12-31"');
      el.setAttribute('value', '0012-06-15');
      await open();
      shows('0012-06-15');
    });
  });

  // Holds in any timezone: a zone-less value is a wall-clock, never shifted
  // through Date (a time the clocks skip when summer time starts stays).
  it('native: a zone-less value stays exactly as written, display too', async () => {
    const { el } = await inForm('native with-time locale="en-US" format="short"');
    for (const v of ['2026-03-29T02:30', '2026-09-06T00:30', '2026-10-25T02:30', '2026-03-08T02:15']) {
      el.value = v;
      expect(el.value, v).to.equal(v);
      const text = el.shadowRoot.querySelector('.stub-text').textContent;
      expect(text, v).to.include(`${Number(v.slice(11, 13)) % 12 || 12}:${v.slice(14, 16)}`);
    }
  });

  // Holds in any timezone: the epoch is kept until the user edits, so an
  // instant in the hour repeated when summer time ends isn't moved to the
  // other one (Zagreb 2026-10-25T01:30Z, New York 2026-11-01T06:30Z).
  it('default with-time: an instant round-trips exactly', async () => {
    const { el, submitted } = await inForm('with-time');
    for (const v of ['2026-10-25T00:30:00.000Z', '2026-10-25T01:30:00.000Z', '2026-11-01T05:30:00.000Z',
      '2026-11-01T06:30:00.000Z', '2026-10-16T12:30:45.123Z']) {
      el.value = v;
      expect(el.value, v).to.equal(v);
      expect(submitted(), v).to.equal(v);
      el.withTime = false;
      el.withTime = true;
      expect(el.value, `${v} after with-time off/on`).to.equal(v);
    }
  });

  it('a time set while date-only shows once with-time is turned on (connected, any order)', async () => {
    const { el, submitted } = await inForm('native');
    el.value = '2026-10-16T14:30';
    expect(el.value).to.equal('2026-10-16');
    el.withTime = true;
    expect(el.value).to.equal('2026-10-16T14:30');
    expect(submitted()).to.equal('2026-10-16T14:30');

    el.removeAttribute('with-time');
    el.setAttribute('value', '2026-10-16T09:15');
    el.setAttribute('with-time', '');
    expect(el.value, 'same day, new time').to.equal('2026-10-16T09:15');

    el.native = false;
    el.withTime = false;
    el.value = '2026-10-17T08:05:00.000Z';
    el.withTime = true;
    expect(el.value, 'an instant keeps its time too').to.equal('2026-10-17T08:05:00.000Z');
  });

  it('before connect the value getter already returns the submitted shape', async () => {
    const el = document.createElement('ty-date-picker') as any;
    expect(el.value).to.equal(null);
    el.setAttribute('native', '');
    el.value = local(2026, 10, 16).toISOString();
    expect(el.value).to.equal('2026-10-16');
    el.withTime = true;
    el.value = '2026-10-16T14:30:00';
    expect(el.value).to.equal('2026-10-16T14:30');
    el.native = false;
    expect(el.value).to.equal(local(2026, 10, 16, 14, 30).toISOString());
    el.value = 'garbage';
    expect(el.value).to.equal(null);
  });

  it('an empty picker: .value and detail.value are null, the form submits name=', async () => {
    const { el, submitted } = await inForm('native value="2026-10-16"');
    setTimeout(() => el.clear());
    const ev = (await oneEvent(el, 'change')) as CustomEvent;
    expect(ev.detail.value).to.equal(null);
    expect(el.value).to.equal(null);
    expect(submitted()).to.equal('');
  });

  it('moving the element keeps a date-only value\'s time', async () => {
    const { form, el } = await inForm('native with-time value="2026-10-16T14:30"');
    el.withTime = false;
    form.append(el); // disconnect + connect
    el.withTime = true;
    expect(el.value).to.equal('2026-10-16T14:30');
  });

  it('the native value round-trips back into the default mode', async () => {
    const { el } = await inForm('');
    el.value = '2026-10-16';
    const instant = el.value;
    el.native = true;
    expect(el.value).to.equal('2026-10-16');
    el.native = false;
    expect(el.value).to.equal(instant);
  });

  it('toggling native re-emits the form value in the new shape, same day', async () => {
    const { el, submitted } = await inForm('value="2026-10-16"');
    el.native = true;
    expect(el.value).to.equal('2026-10-16');
    expect(submitted()).to.equal('2026-10-16');
    el.removeAttribute('native');
    expect(el.value).to.equal(local(2026, 10, 16).toISOString());
    expect(submitted()).to.equal(el.value);
  });

  it('toggling with-time re-emits the shape and keeps the picked time', async () => {
    const { el, submitted } = await inForm('value="2026-10-16T14:30" with-time native');
    el.withTime = false;
    expect(el.value).to.equal('2026-10-16');
    expect(submitted()).to.equal('2026-10-16');
    el.withTime = true;
    expect(el.value).to.equal('2026-10-16T14:30');
    el.native = false;
    expect(submitted()).to.equal(local(2026, 10, 16, 14, 30).toISOString());
    el.withTime = false;
    expect(submitted()).to.equal(local(2026, 10, 16).toISOString());
  });

  it('change detail.value is the submitted string', async () => {
    for (const [attrs, expected] of [['native', '2026-06-09'], ['', local(2026, 6, 9).toISOString()]]) {
      const { el, submitted } = await inForm(`${attrs} value="2026-06-01"`);
      const stub = el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
      stub.click();
      await nextFrame();
      await nextFrame();
      const calendar = el.shadowRoot.querySelector('ty-calendar') as any;
      setTimeout(() => calendar.dispatchEvent(new CustomEvent('change', {
        detail: { dayContext: { year: 2026, month: 6, dayInMonth: 9 } },
      })));
      const ev = (await oneEvent(el, 'change')) as CustomEvent;
      expect(ev.detail.value, attrs).to.equal(expected);
      expect(ev.detail.localValue, attrs).to.equal('2026-06-09');
      expect(ev.detail.milliseconds, attrs).to.equal(local(2026, 6, 9).getTime());
      expect(el.value, attrs).to.equal(expected);
      expect(submitted(), attrs).to.equal(expected);
    }
  });

  it('form.reset() restores the declared value in the current shape', async () => {
    const { form, el, submitted } = await inForm('native value="2026-04-01"');
    el.value = '2026-04-20';
    form.reset();
    expect(el.value).to.equal('2026-04-01');
    expect(submitted()).to.equal('2026-04-01');
  });
});

describe('ty-date-picker error', () => {
  const stubOf = (el: any) => el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
  const lineOf = (el: any) => el.shadowRoot.querySelector('.error-message') as HTMLElement | null;
  // Booleans, not elements: a failing to.equal(<element>) stalls the runner
  const stubFocused = (el: any) => document.activeElement === el && el.shadowRoot.activeElement === stubOf(el);

  it('renders the error line under the field', async () => {
    const el = (await fixture(html`<ty-date-picker label="When"></ty-date-picker>`)) as any;
    el.error = 'Pick a day';
    await nextFrame();
    const line = lineOf(el)!;
    expect(line, 'error line').to.exist;
    expect(line.textContent).to.equal('Pick a day');
    expect(line.previousElementSibling!.classList.contains('dropdown-wrapper'), 'under the field').to.be.true;
    expect(stubOf(el).classList.contains('error')).to.be.true;

    el.error = '';
    await nextFrame();
    expect(lineOf(el)).to.not.exist;
    expect(stubOf(el).classList.contains('error')).to.be.false;
  });

  it('the field is described by the error line', async () => {
    const el = (await fixture(html`<ty-date-picker error="Bad"></ty-date-picker>`)) as any;
    const id = stubOf(el).getAttribute('aria-describedby');
    expect(id).to.be.a('string');
    expect(el.shadowRoot.getElementById(id).textContent).to.equal('Bad');
    el.error = '';
    expect(stubOf(el).hasAttribute('aria-describedby')).to.be.false;
  });

  it('uses the same tokens as ty-input', async () => {
    const el = (await fixture(html`<ty-date-picker error="x"></ty-date-picker>`)) as any;
    const rules = [...el.shadowRoot.adoptedStyleSheets].flatMap((s: CSSStyleSheet) => [...s.cssRules]) as CSSStyleRule[];
    const rule = (sel: string) => rules.find((r) => r.selectorText === sel)!;
    expect(rule('.error-message').style.color).to.equal('var(--ty-color-danger)');
    expect(rule('.date-picker-stub.error:not([disabled])').style.background).to.equal('var(--ty-bg-danger-soft)');
  });

  it('the popup calendar opens in danger while an error shows, the user flavor once it clears', async () => {
    const el = (await fixture(html`<ty-date-picker flavor="success" error="x"></ty-date-picker>`)) as any;
    stubOf(el).click();
    await nextFrame();
    await nextFrame();
    const calendar = () => el.shadowRoot.querySelector('ty-calendar');
    expect(calendar().getAttribute('flavor')).to.equal('danger');
    el.error = '';
    expect(calendar().getAttribute('flavor'), 'cleared while open').to.equal('success');
    el.error = 'x';
    expect(calendar().getAttribute('flavor'), 'set while open').to.equal('danger');
    expect(el.getAttribute('flavor')).to.equal('success');
  });

  it('a submit shows the required message under the field and focuses it', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-date-picker name="d" required></ty-date-picker><button>Go</button></form>
    `));
    const el = form.querySelector('ty-date-picker') as any;
    let submits = 0;
    form.addEventListener('submit', (e) => { e.preventDefault(); submits++; });
    form.querySelector('button')!.click();
    await nextFrame();

    expect(submits).to.equal(0);
    expect(el.error).to.equal(el.validationMessage);
    expect(el.error).to.not.equal('');
    expect(lineOf(el)!.textContent).to.equal(el.validationMessage);
    expect(el.shadowRoot.activeElement, 'focus on the stub').to.equal(stubOf(el));
  });

  it('reportValidity() shows the message; picking a day clears it', async () => {
    const el = (await fixture(html`<ty-date-picker required value=""></ty-date-picker>`)) as any;
    expect(el.reportValidity()).to.be.false;
    await nextFrame();
    expect(lineOf(el)!.textContent).to.equal(el.validationMessage);
    expect(el.shadowRoot.activeElement).to.equal(stubOf(el));

    stubOf(el).click();
    await nextFrame();
    await nextFrame();
    el.shadowRoot.querySelector('ty-calendar').dispatchEvent(new CustomEvent('change', {
      detail: { dayContext: { year: 2026, month: 6, dayInMonth: 9 } },
    }));
    await nextFrame();
    expect(el.error).to.equal('');
    expect(lineOf(el)).to.not.exist;
    expect(el.flavor).to.equal('default');
  });

  it('clearing a required picker shows its message', async () => {
    const el = (await fixture(html`<ty-date-picker required value="2026-06-09"></ty-date-picker>`)) as any;
    (el.shadowRoot.querySelector('.stub-clear') as HTMLButtonElement).click();
    await aTimeout(0);
    expect(el.error).to.equal(el.validationMessage);
    expect(lineOf(el)).to.exist;
  });

  it('focus() lands on the stub', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    el.focus();
    expect(el.shadowRoot.activeElement).to.equal(stubOf(el));
  });

  // A form library focuses the field, then renders its error: the rebuild
  // that follows must not drop the focus to <body>.
  it('setting or clearing the error keeps the focus on the field', async () => {
    const wrap = (await fixture(html`
      <div><input id="before"><ty-date-picker></ty-date-picker><input id="after"></div>
    `)) as HTMLElement;
    const el = wrap.querySelector('ty-date-picker') as any;
    (wrap.querySelector('#before') as HTMLElement).focus();
    await sendKeys({ press: 'Tab' });
    expect(stubFocused(el), 'tabbed in').to.equal(true);

    el.error = 'Server says no';
    expect(stubFocused(el), 'set').to.equal(true);
    el.error = '';
    expect(stubFocused(el), 'cleared').to.equal(true);
    await sendKeys({ press: 'Tab' });
    expect(document.activeElement?.id, 'Tab goes on from the field').to.equal('after');
  });

  it('setCustomValidity("") after a submit focused the field keeps the focus', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-date-picker name="d"></ty-date-picker><button>Go</button></form>
    `));
    form.addEventListener('submit', (e) => e.preventDefault());
    const el = form.querySelector('ty-date-picker') as any;
    el.setCustomValidity('Taken');
    form.querySelector('button')!.click();
    await nextFrame();
    expect(lineOf(el)!.textContent).to.equal('Taken');
    expect(stubFocused(el), 'submit').to.equal(true);
    el.setCustomValidity('');
    expect(lineOf(el)).to.not.exist;
    expect(stubFocused(el), 'cleared').to.equal(true);
  });

  it('disabling the focused field lets go of the focus, like a native input', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    el.focus();
    el.disabled = true;
    expect(el.shadowRoot.activeElement === null).to.equal(true);
  });

  it('with-time switches the message to a datetime-local one', async () => {
    const el = (await fixture(html`<ty-date-picker required></ty-date-picker>`)) as any;
    const day = el.validationMessage;
    el.withTime = true;
    expect(el.validity.valueMissing).to.be.true;
    expect(el.validationMessage).to.equal(nativeMessage('input', { type: 'datetime-local', required: true }));
    expect(day).to.equal(nativeMessage('input', { type: 'date', required: true }));
  });
});

// `error` shows the field as flavor="danger" whatever the flavor, from inside
// the shadow root: nothing is written on the host, so el.flavor and the
// flavor attribute only ever hold what the author set.
describe('ty-date-picker error look', () => {
  let sheet: HTMLLinkElement;
  const root = document.documentElement.style;

  before(async () => {
    // Real color tokens, so the looks compared below are real colors
    sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/css/tyrell-colors-static.css';
    const loaded = new Promise((res, rej) => {
      sheet.onload = res;
      sheet.onerror = () => rej(new Error('failed to load css/tyrell-colors-static.css'));
    });
    document.head.appendChild(sheet);
    await loaded;
    // A custom flavor (utils/flavor-sheet.ts)
    root.setProperty('--ty-color-brand', 'rgb(10, 120, 200)');
    root.setProperty('--ty-color-brand-strong', 'rgb(5, 60, 100)');
    root.setProperty('--ty-color-brand-soft', 'rgb(120, 180, 230)');
  });

  after(() => {
    sheet.remove();
    for (const p of ['--ty-color-brand', '--ty-color-brand-strong', '--ty-color-brand-soft']) root.removeProperty(p);
  });

  const picker = async (attrs: string) => (await fixture(`<ty-date-picker ${attrs}></ty-date-picker>`)) as any;
  const stubOf = (el: any) => el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
  /** What the field looks like: the stub's colors, its icon and the flavor vars (hover/focus/ring). */
  const look = (el: any) => {
    const s = getComputedStyle(stubOf(el));
    const icon = getComputedStyle(el.shadowRoot.querySelector('.stub-arrow'));
    const vars = ['--date-picker-accent', '--date-picker-accent-bold', '--date-picker-ring'].map((v) => s.getPropertyValue(v).trim());
    return [s.borderTopColor, s.backgroundColor, s.boxShadow, icon.color, ...vars].join(' | ');
  };
  const unfocus = (el: any) => (el.shadowRoot.activeElement as HTMLElement | null)?.blur();
  const focusedLook = (el: any) => {
    el.focus();
    const l = look(el);
    unfocus(el);
    return l;
  };
  /** The icon and flavor vars alone: what a focused field shares with a resting one. */
  const accent = (el: any) => look(el).split(' | ').slice(3).join(' | ');
  const writesNothing = (el: any, flavor: string | null) => {
    expect(el.getAttribute('flavor'), 'flavor attribute').to.equal(flavor);
    expect(el.flavor, 'el.flavor').to.equal(flavor ?? 'default');
  };
  /** look() under a real mouse. */
  const hoverLook = async (el: any) => {
    const stub = stubOf(el);
    stub.scrollIntoView({ block: 'center' });
    const r = stub.getBoundingClientRect();
    await sendMouse({ type: 'move', position: [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)] });
    const l = look(el);
    await resetMouse();
    return l;
  };
  /** look() open, then closed again with Escape. */
  const openLook = async (el: any) => {
    el._closeTimestamp = 0; // the 300 ms reopen guard after a close isn't under test
    stubOf(el).click();
    await nextFrame();
    await nextFrame();
    expect(stubOf(el).classList.contains('open'), 'open').to.equal(true);
    const l = look(el);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    unfocus(el);
    return l;
  };
  /** The field at rest, hovered, focused and open. */
  const states = async (el: any) =>
    `rest ${look(el)} || hover ${await hoverLook(el)} || focused ${focusedLook(el)} || open ${await openLook(el)}`;
  // Error beats every flavor: built-in, +/- shades, the neutral ones, and a
  // custom one (its sheet is adopted after the built-in one)
  const ANY_FLAVOR = [null, 'default', 'neutral', 'success', 'primary+', 'neutral-', 'danger-', 'brand'];
  const attrs = (flavor: string | null, rest = '') => `${flavor === null ? '' : `flavor="${flavor}" `}${rest}`;

  it('an error shows an unflavored field exactly like flavor="danger", writing nothing on the host', async () => {
    const twin = await picker('flavor="danger" error="Bad"');
    const plain = await picker('');
    for (const flavor of [null, 'default', 'neutral']) {
      const el = await picker(flavor ? `flavor="${flavor}" error="Bad"` : 'error="Bad"');
      expect(look(el), `flavor=${flavor}`).to.equal(look(twin));
      expect(focusedLook(el), `flavor=${flavor} focused`).to.equal(focusedLook(twin));
      expect(look(el), 'not the neutral look').to.not.equal(look(plain));
      writesNothing(el, flavor);
    }
  });

  it('clearing the error gives the neutral look back', async () => {
    const plain = await picker('');
    const el = await picker('error="Bad"');
    el.error = '';
    expect(look(el)).to.equal(look(plain));
    expect(focusedLook(el)).to.equal(focusedLook(plain));
    writesNothing(el, null);

    const neutral = await picker('flavor="neutral" error="Bad"');
    neutral.removeAttribute('error');
    expect(look(neutral)).to.equal(look(plain));
    writesNothing(neutral, 'neutral');
  });

  it('the hover probe sees the hover', async () => {
    const plain = await picker('');
    expect(await hoverLook(plain) !== look(plain)).to.equal(true);
  });

  // One test per flavor: each walks four states three times, too slow for one 5 s test
  for (const flavor of ANY_FLAVOR) {
    it(`flavor=${flavor}: an error looks exactly like flavor="danger" at rest, hovered, focused and open; cleared, the flavor look is back`, async () => {
      const dangerStates = await states(await picker('flavor="danger" error="Bad"'));
      const el = await picker(attrs(flavor));
      const own = await states(el);
      // after an open: that writes the popup position on the host's style
      const names = el.getAttributeNames().join();
      el.error = 'Bad';
      expect(await states(el), `${flavor} + error`).to.equal(dangerStates);
      writesNothing(el, flavor);
      el.error = '';
      expect(await states(el), `${flavor}: cleared`).to.equal(own);
      expect(el.getAttributeNames().filter((a: string) => a !== 'error').join(), 'only error came and went').to.equal(names);
    });
  }

  // One test per flavor: each opens and closes the popup four times
  describe('any flavor: the popup calendar opens like flavor="danger"\'s while an error shows, also set or cleared while open', () => {
    beforeEach(() => root.setProperty('--ty-local-transition', 'none'));
    afterEach(() => root.removeProperty('--ty-local-transition'));

    const value = 'value="2026-06-09"';
    /** The open calendar's flavor and selected day; opens and closes unless already open. */
    const calendarLook = async (el: any, keepOpen = false) => {
      if (!stubOf(el).classList.contains('open')) {
        el._closeTimestamp = 0; // the 300 ms reopen guard after a close isn't under test
        stubOf(el).click();
        await nextFrame();
        await nextFrame();
      }
      await nextFrame();
      const calendar = el.shadowRoot.querySelector('ty-calendar');
      const month = calendar.shadowRoot.querySelector('ty-calendar-month');
      const day = getComputedStyle(month.shadowRoot.querySelector('.selected'));
      const l = [calendar.getAttribute('flavor'), day.backgroundColor, day.color, day.borderTopColor].join(' | ');
      if (!keepOpen) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        unfocus(el);
      }
      return l;
    };
    const dangerLook = async () => calendarLook(await picker(`flavor="danger" error="Bad" ${value}`));

    it('the probe tells danger from the default', async () => {
      expect(await dangerLook()).to.not.equal(await calendarLook(await picker(value)));
    });

    for (const flavor of ANY_FLAVOR) {
      it(`flavor=${flavor}`, async () => {
        const danger = await dangerLook();
        const el = await picker(attrs(flavor, value));
        const own = await calendarLook(el);
        el.error = 'Bad';
        expect(await calendarLook(el), `${flavor} + error`).to.equal(danger);
        writesNothing(el, flavor);
        el.error = '';
        expect(await calendarLook(el), `${flavor}: cleared`).to.equal(own);
      });
    }

    it('while open: the calendar follows the error as it comes and goes', async () => {
      const danger = await dangerLook();
      const el = await picker(attrs('success', value));
      const own = await calendarLook(el, true);
      el.error = 'Bad';
      expect(await calendarLook(el, true), 'error set while open').to.equal(danger);
      el.error = '';
      expect(await calendarLook(el), 'cleared while open').to.equal(own);
    });
  });

  it('a flavor set while the error shows: still danger, and the flavor\'s own look once it clears', async () => {
    const danger = await picker('flavor="danger" error="Bad"');
    const success = await picker('flavor="success"');
    const el = await picker('error="Bad"');
    el.flavor = 'success';
    expect(look(el)).to.equal(look(danger));
    writesNothing(el, 'success');
    el.flavor = 'default';
    expect(look(el)).to.equal(look(danger));
    el.setAttribute('flavor', 'success');
    expect(look(el)).to.equal(look(danger));
    el.error = '';
    expect(look(el)).to.equal(look(success));
    el.error = 'Bad';
    el.removeAttribute('flavor');
    expect(look(el)).to.equal(look(danger));
    writesNothing(el, null);
  });

  it('attribute order does not matter', async () => {
    const danger = await picker('flavor="danger" error="Bad"');
    for (const flavor of ['primary', 'neutral']) {
      expect(look(await picker(`error="Bad" flavor="${flavor}"`)), flavor).to.equal(look(danger));
      expect(look(await picker(`flavor="${flavor}" error="Bad"`)), flavor).to.equal(look(danger));
    }
  });

  it('any flavor: disabled with an error looks like flavor="danger" disabled, no red tint', async () => {
    const danger = await picker('flavor="danger" disabled');
    expect(look(danger) !== look(await picker('flavor="danger" error="Bad"')), 'the probe sees disabled').to.equal(true);
    expect(look(await picker('flavor="danger" disabled error="Bad"')), 'flavor="danger" with the error').to.equal(look(danger));
    for (const flavor of ANY_FLAVOR) {
      expect(look(await picker(attrs(flavor, 'disabled error="Bad"'))), String(flavor)).to.equal(look(danger));
    }
  });

  describe('the native input on touch screens', () => {
    let originalMatchMedia: typeof window.matchMedia;
    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
      window.matchMedia = ((query: string) => ({
        matches: true, media: query, onchange: null,
        addListener: () => {}, removeListener: () => {},
        addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
      })) as unknown as typeof window.matchMedia;
    });
    afterEach(() => { window.matchMedia = originalMatchMedia; });

    it('any flavor: an error looks like flavor="danger", at rest and hovered', async () => {
      const danger = await picker('flavor="danger" error="Bad"');
      expect(danger.shadowRoot.querySelector('.native-date-input'), 'the native skin').to.exist;
      for (const flavor of ANY_FLAVOR) {
        const el = await picker(attrs(flavor, 'error="Bad"'));
        expect(look(el), String(flavor)).to.equal(look(danger));
        expect(await hoverLook(el), `${flavor} hovered`).to.equal(await hoverLook(danger));
      }
    });
  });

  it('an error set before the element connects shows once connected', async () => {
    const danger = await picker('flavor="danger" error="Bad"');
    const plain = await picker('');
    const el = document.createElement('ty-date-picker') as any;
    el.error = 'Bad';
    danger.after(el);
    expect(look(el)).to.equal(look(danger));
    writesNothing(el, null);
    el.error = '';
    expect(look(el)).to.equal(look(plain));
    el.remove();
  });

  it('a copy (cloneNode, innerHTML) looks the same and clears the same', async () => {
    const danger = await picker('flavor="danger" error="Bad"');
    const plain = await picker('');
    const el = await picker('error="Bad"');
    const clone = el.cloneNode(true) as any;
    const holder = document.createElement('div');
    holder.innerHTML = el.outerHTML;
    el.after(clone, holder);
    const copy = holder.firstElementChild as any;
    for (const c of [clone, copy]) {
      expect(look(c)).to.equal(look(danger));
      c.error = '';
      expect(look(c)).to.equal(look(plain));
      writesNothing(c, null);
    }
    clone.remove();
    holder.remove();
  });

  it('a morph rewriting attributes gets the look of the attributes it leaves', async () => {
    const danger = await picker('flavor="danger" error="Bad"');
    const success = await picker('flavor="success"');
    const el = await picker('error="Bad"');
    // To <ty-date-picker flavor="success">
    el.removeAttribute('error');
    el.setAttribute('flavor', 'success');
    expect(look(el)).to.equal(look(success));
    // Back to <ty-date-picker error="Again">
    el.removeAttribute('flavor');
    el.setAttribute('error', 'Again');
    expect(look(el)).to.equal(look(danger));
    writesNothing(el, null);
  });

  it('any flavor: a page-level --date-picker-accent* override shows on the error as on flavor="danger"', async () => {
    const style = document.createElement('style');
    style.textContent = 'ty-date-picker.ov { --date-picker-accent: rgb(1, 2, 3); --date-picker-accent-bold: rgb(4, 5, 6); --date-picker-ring: rgb(7, 8, 9); }';
    document.head.append(style);
    try {
      const danger = await picker('class="ov" flavor="danger" error="Bad"');
      expect(getComputedStyle(stubOf(danger)).borderTopColor, 'the override is the resting border').to.equal('rgb(1, 2, 3)');
      const dangerStates = await states(danger);
      for (const flavor of ANY_FLAVOR) {
        expect(await states(await picker(attrs(flavor, 'class="ov" error="Bad"'))), String(flavor)).to.equal(dangerStates);
      }
    } finally {
      style.remove();
    }
  });

  it('the validity errors (submit, reveal, reset) show and clear it too', async () => {
    const danger = await picker('flavor="danger" error="Bad"');
    const plain = await picker('');
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-date-picker name="d" required value="2026-06-09"></ty-date-picker><button>Go</button></form>
    `));
    form.addEventListener('submit', (e) => e.preventDefault());
    const el = form.querySelector('ty-date-picker') as any;

    // Reveal: clearing a required picker
    (el.shadowRoot.querySelector('.stub-clear') as HTMLButtonElement).click();
    await aTimeout(0);
    expect(el.error).to.not.equal('');
    expect(accent(el), 'reveal').to.equal(accent(danger));
    form.reset();
    expect(el.error || '', 'reset clears it').to.equal('');
    unfocus(el);
    expect(look(el)).to.equal(look(plain));

    el.value = null;
    form.querySelector('button')!.click();
    await nextFrame();
    expect(el.error, 'submit').to.equal(el.validationMessage);
    unfocus(el);
    expect(look(el)).to.equal(look(danger));
    writesNothing(el, null);
  });
});

describe('ty-date-picker focus after the popup closes', () => {
  const stubOf = (el: any) => el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
  const open = async (el: any) => {
    stubOf(el).click();
    await nextFrame();
    await nextFrame();
  };

  it('picking a day returns focus to the field', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    await open(el);
    el.shadowRoot.querySelector('ty-calendar').dispatchEvent(new CustomEvent('change', {
      detail: { dayContext: { year: 2026, month: 6, dayInMonth: 9 } },
    }));
    expect(el.shadowRoot.querySelector('.calendar-dialog').open).to.be.false;
    expect(document.activeElement).to.equal(el);
    expect(el.shadowRoot.activeElement).to.equal(stubOf(el));
  });

  it('Escape returns focus to the field', async () => {
    const el = (await fixture(html`<ty-date-picker with-time value="2026-06-09T10:00"></ty-date-picker>`)) as any;
    await open(el);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(el.shadowRoot.querySelector('.calendar-dialog').open).to.be.false;
    expect(el.shadowRoot.activeElement).to.equal(stubOf(el));
  });
});

// A ty-modal closing closes the dialogs still open inside it — the calendar
// too, behind the picker's back. The picker then runs its own close: the
// scroll lock, aria-expanded and the open state follow, without waiting for
// the dialog's async `close` event.
describe('ty-date-picker calendar closed from outside', () => {
  const pickerLocks = () => Array.from(getActiveLocks()).filter((id) => id.startsWith('date-picker-'));
  const stubOf = (el: any) => el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;
  const mount = async () => {
    const wrap = (await fixture(html`<div><button id="opener">open</button></div>`)) as HTMLElement;
    wrap.insertAdjacentHTML('beforeend', '<ty-modal><ty-date-picker value="2026-07-15"></ty-date-picker></ty-modal>');
    const opener = wrap.querySelector('#opener') as HTMLButtonElement;
    const modal = wrap.querySelector('ty-modal') as any;
    const el = wrap.querySelector('ty-date-picker') as any;
    opener.focus();
    modal.open = true;
    stubOf(el).click();
    await nextFrame();
    await nextFrame();
    const dialog = el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(dialog.open, 'calendar open').to.equal(true);
    expect(pickerLocks().length, 'calendar holds a lock').to.equal(1);
    let closes = 0;
    el.addEventListener('close', () => closes++);
    return { opener, modal, el, dialog, closes: () => closes };
  };

  for (const [how, close] of [
    ['modal.open = false', (m: any) => { m.open = false; }],
    ['modal.hide()', (m: any) => m.hide()],
  ] as const) {
    it(`${how}: the lock goes, aria-expanded is false, close fires`, async () => {
      const { modal, el, dialog, closes } = await mount();
      close(modal);
      await Promise.resolve();
      expect(dialog.open).to.equal(false);
      expect(stubOf(el).getAttribute('aria-expanded')).to.equal('false');
      expect(pickerLocks()).to.deep.equal([]);
      expect(getActiveLocks().size, 'no lock left at all').to.equal(0);
      expect(closes()).to.equal(1);
    });
  }

  it('the stub left behind in the closed modal does not take the focus', async () => {
    const { opener, modal, el } = await mount();
    modal.hide();
    await nextFrame();
    expect(el.shadowRoot.activeElement === null, 'not on the hidden stub').to.equal(true);
    expect(document.activeElement === opener, 'back on the opener').to.equal(true);
  });

  it('the calendar dialog closed directly: the picker closes too, focus on the field', async () => {
    const { modal, el, dialog, closes } = await mount();
    dialog.close();
    await Promise.resolve();
    expect(stubOf(el).getAttribute('aria-expanded')).to.equal('false');
    expect(pickerLocks()).to.deep.equal([]);
    expect(closes()).to.equal(1);
    expect(el.shadowRoot.activeElement === stubOf(el)).to.equal(true);
    modal.hide();
  });

  // Slotted through a wrapper component's shadow root: the picker is in the
  // modal's flat tree only, not among its descendants.
  it('slotted into the modal by a wrapper component: it closes with the modal', async () => {
    if (!customElements.get('dp-modal-wrap')) {
      customElements.define('dp-modal-wrap', class extends HTMLElement {
        constructor() {
          super();
          this.attachShadow({ mode: 'open' }).innerHTML = '<ty-modal><div><slot></slot></div></ty-modal>';
        }
      });
    }
    const wrap = (await fixture(html`<dp-modal-wrap><ty-date-picker value="2026-07-15"></ty-date-picker></dp-modal-wrap>`)) as HTMLElement;
    const modal = wrap.shadowRoot!.querySelector('ty-modal') as any;
    const el = wrap.querySelector('ty-date-picker') as any;
    modal.open = true;
    stubOf(el).click();
    await nextFrame();
    await nextFrame();
    const dialog = el.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(dialog.open, 'calendar open').to.equal(true);
    modal.hide();
    await Promise.resolve();
    expect(dialog.open).to.equal(false);
    expect(stubOf(el).getAttribute('aria-expanded')).to.equal('false');
    expect(getActiveLocks().size, 'no lock left').to.equal(0);
  });
});

// The calendar opens a frame after the click. By then the picker may be gone,
// or hidden in a ty-modal that closed in the same task.
describe('ty-date-picker calendar opening a frame late', () => {
  const stubOf = (el: any) => el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement;

  it('removed in the same task as the click: no lock left', async () => {
    const el = (await fixture(html`<ty-date-picker></ty-date-picker>`)) as any;
    stubOf(el).click();
    el.remove();
    await nextFrame();
    await nextFrame();
    expect(getActiveLocks().size).to.equal(0);
  });

  it('the modal around it closed in the same task: the calendar stays shut', async () => {
    const wrap = (await fixture(html`<div></div>`)) as HTMLElement;
    wrap.innerHTML = '<ty-modal><ty-date-picker></ty-date-picker></ty-modal>';
    const modal = wrap.querySelector('ty-modal') as any;
    const el = wrap.querySelector('ty-date-picker') as any;
    modal.open = true;
    await nextFrame();
    let closes = 0;
    el.addEventListener('close', () => closes++);
    stubOf(el).click();
    modal.hide();
    await nextFrame();
    await nextFrame();
    expect(el.shadowRoot.querySelector('.calendar-dialog').open).to.equal(false);
    expect(stubOf(el).getAttribute('aria-expanded')).to.equal('false');
    expect(getActiveLocks().size).to.equal(0);
    expect(closes, 'the open it announced is closed').to.equal(1);
  });
});
