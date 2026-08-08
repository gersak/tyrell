import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
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
