import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { sendKeys, sendMouse, resetMouse } from '@web/test-runner-commands';
import '../lib/components/popup.js';
import '../lib/components/button.js';
import '../lib/components/date-picker.js';
import '../lib/components/calendar.js';
import '../lib/components/input.js';
import { getActiveLocks } from '../lib/utils/scroll-lock.js';

// ty-popup positions a dialog relative to an anchor on click; that path needs
// real layout/top-layer, so we keep this to a mount smoke test.
describe('ty-popup', () => {
  it('mounts and renders its shadow content', async () => {
    const el = await fixture(html`
      <ty-popup>
        <button slot="trigger">Open</button>
        <div>Popup body</div>
      </ty-popup>
    `);
    await nextFrame();
    expect(el.shadowRoot).to.exist;
    expect(el.shadowRoot!.querySelector('*'), 'rendered something').to.exist;
  });
});

describe('ty-popup accessibility — trigger gets aria-haspopup + live aria-expanded', () => {
  it('the real trigger (parent element) gets aria-haspopup="dialog" and starts aria-expanded="false"', async () => {
    const wrap = (await fixture(html`
      <button id="trigger">Click me<ty-popup><div>Popup content</div></ty-popup></button>
    `)) as HTMLElement;
    await nextFrame();

    expect(wrap.getAttribute('aria-haspopup')).to.equal('dialog');
    expect(wrap.getAttribute('aria-expanded')).to.equal('false');
  });

  it('aria-expanded flips to true on open, back to false on close', async () => {
    const wrap = (await fixture(html`
      <button id="trigger">Click me<ty-popup><div>Popup content</div></ty-popup></button>
    `)) as HTMLElement;
    await nextFrame();

    wrap.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await nextFrame();
    await nextFrame();
    expect(wrap.getAttribute('aria-expanded'), 'true once open').to.equal('true');

    const popup = wrap.querySelector('ty-popup') as any;
    popup.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    // Give the close animation's setTimeout(150ms) room to run.
    await new Promise((r) => setTimeout(r, 250));
    expect(wrap.getAttribute('aria-expanded'), 'false again after close').to.equal('false');
  });

  it('reopened while it closes, aria-expanded says true again', async () => {
    const wrap = (await fixture(html`
      <button id="trigger">Click me<ty-popup><div>Popup content</div></ty-popup></button>
    `)) as HTMLElement;
    const popup = wrap.querySelector('ty-popup') as any;
    popup.openPopup();
    await new Promise((r) => setTimeout(r, 120));
    popup.closePopup();
    expect(wrap.getAttribute('aria-expanded')).to.equal('false');
    popup.openPopup();
    await new Promise((r) => setTimeout(r, 500));
    expect(popup.shadowRoot.querySelector('.popup-dialog').open).to.equal(true);
    expect(wrap.getAttribute('aria-expanded')).to.equal('true');
    popup.closePopup();
    await new Promise((r) => setTimeout(r, 300));
  });

  it('manual mode does not touch the parent element at all (no anchor relationship)', async () => {
    const wrap = (await fixture(html`
      <button id="trigger">Click me<ty-popup manual><div>Popup content</div></ty-popup></button>
    `)) as HTMLElement;
    await nextFrame();
    expect(wrap.hasAttribute('aria-haspopup'), 'manual mode has no click-based anchor').to.be.false;
  });
});

describe('ty-popup — openPopup() is idempotent', () => {
  const settle = () => new Promise((r) => setTimeout(r, 120));

  it('opening twice fires one open event', async () => {
    const wrap = (await fixture(html`<div><button>a</button><ty-popup><p>x</p></ty-popup></div>`)) as HTMLElement;
    const popup = wrap.querySelector('ty-popup') as any;
    let opens = 0;
    popup.addEventListener('open', () => opens++);
    popup.openPopup();
    popup.openPopup();
    await settle();
    popup.openPopup();
    await settle();
    expect(opens).to.equal(1);
    popup.closePopup();
    await settle();
  });

  it('reopening while it closes cancels the close', async () => {
    const wrap = (await fixture(html`<div><button>a</button><ty-popup><p>x</p></ty-popup></div>`)) as HTMLElement;
    const popup = wrap.querySelector('ty-popup') as any;
    let closes = 0;
    popup.addEventListener('close', () => closes++);
    popup.openPopup();
    await settle();
    popup.closePopup();
    popup.openPopup();
    await new Promise((r) => setTimeout(r, 500));
    const dialog = popup.shadowRoot.querySelector('.popup-dialog') as HTMLDialogElement;
    expect(dialog.open).to.equal(true);
    expect(closes).to.equal(0);
    popup.closePopup();
    await new Promise((r) => setTimeout(r, 500));
    expect(closes).to.equal(1);
  });

  // A ty-modal around it closes the dialog directly. Its `close` event comes a
  // task later: the lock goes with the dialog, not with that event.
  it('closed from outside, the lock and aria-expanded go at once; reopened at once, it keeps the lock', async () => {
    const wrap = (await fixture(html`<div><button>a</button><ty-popup><p>x</p></ty-popup></div>`)) as HTMLElement;
    const popup = wrap.querySelector('ty-popup') as any;
    const dialog = popup.shadowRoot.querySelector('.popup-dialog') as HTMLDialogElement;
    const popupLocks = () => Array.from(getActiveLocks()).filter((id: string) => id.startsWith('popup-')).length;
    popup.openPopup();
    await settle();
    dialog.close();
    await Promise.resolve();
    expect(popupLocks(), 'released with the dialog').to.equal(0);
    expect(wrap.getAttribute('aria-expanded')).to.equal('false');

    popup.openPopup();
    await settle();
    dialog.close();
    popup.openPopup();
    await settle();
    expect(dialog.open).to.equal(true);
    expect(popupLocks(), 'the reopened popup keeps its lock').to.equal(1);
    popup.closePopup();
    await new Promise((r) => setTimeout(r, 300));
    expect(popupLocks()).to.equal(0);
  });

  // Escape starts the exit transition and the browser closes the dialog at
  // once (its cancel): the close-out timer left behind must not shut the
  // popup opened again right after.
  it('reopened right after Escape, it stays open', async () => {
    const wrap = (await fixture(html`<div><button>a</button><ty-popup><p tabindex="0">x</p></ty-popup></div>`)) as HTMLElement;
    const popup = wrap.querySelector('ty-popup') as any;
    const dialog = popup.shadowRoot.querySelector('.popup-dialog') as HTMLDialogElement;
    popup.openPopup();
    await settle();
    (popup.querySelector('p') as HTMLElement).focus();
    await sendKeys({ press: 'Escape' });
    expect(dialog.open, 'closed by Escape').to.equal(false);
    popup.openPopup();
    await new Promise((r) => setTimeout(r, 500));
    expect(dialog.open).to.equal(true);
    popup.closePopup();
    await settle();
  });
});

// Mouse and touch open the popup on pointerdown; keyboard activation and
// anchor.click() only fire 'click' (detail 0). A ty-button anchor re-emits it
// as a CustomEvent click, the native one in detail.originalEvent (a <label>
// around it gets there too).
describe('ty-popup — opening from the anchor', () => {
  afterEach(() => resetMouse());

  const settle = () => new Promise((r) => setTimeout(r, 300));
  const center = (el: Element): [number, number] => {
    const r = el.getBoundingClientRect();
    return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)];
  };

  const ANCHORS = {
    'ty-button': html`<div><ty-button type="button">Open<ty-popup><div class="content">x</div></ty-popup></ty-button></div>`,
    '<button>': html`<div><button type="button">Open<ty-popup><div class="content">x</div></ty-popup></button></div>`,
  };

  async function mount(markup: ReturnType<typeof html>) {
    const wrap = (await fixture(markup)) as HTMLElement;
    const popup = wrap.querySelector('ty-popup') as any;
    const anchor = popup.parentElement as HTMLElement;
    // Built in code: the parser won't nest a <button> in a <button>
    const inner = document.createElement('button');
    inner.type = 'button';
    inner.textContent = 'inner';
    popup.querySelector('.content').append(inner);
    const dialog = popup.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    const log = { opens: 0, closes: 0 };
    popup.addEventListener('open', () => log.opens++);
    popup.addEventListener('close', () => log.closes++);
    // The element a key press lands on: the inner <button> of a ty-button
    const focusable = (anchor.shadowRoot?.querySelector('button') ?? anchor) as HTMLElement;
    return { wrap, popup, anchor, inner, dialog, log, focusable };
  }

  for (const [name, markup] of Object.entries(ANCHORS)) {
    describe(name, () => {
      for (const key of ['Enter', 'Space']) {
        it(`${key} on the focused anchor opens it`, async () => {
          const { focusable, dialog, log, popup } = await mount(markup);
          focusable.focus();
          await sendKeys({ press: key });
          await settle();
          expect(dialog.open).to.equal(true);
          expect(log.opens).to.equal(1);
          popup.closePopup();
          await settle();
        });
      }

      it('anchor.click() opens it', async () => {
        const { anchor, dialog, popup } = await mount(markup);
        anchor.click();
        await settle();
        expect(dialog.open).to.equal(true);
        popup.closePopup();
        await settle();
      });

      it('a mouse click opens it once, a click outside closes it once', async () => {
        const { anchor, dialog, log } = await mount(markup);
        await sendMouse({ type: 'click', position: center(anchor) });
        await settle();
        expect(dialog.open, 'open').to.equal(true);
        expect(log).to.deep.equal({ opens: 1, closes: 0 });

        await sendMouse({ type: 'click', position: [2, 2] });
        await settle();
        expect(dialog.open, 'closed').to.equal(false);
        expect(log).to.deep.equal({ opens: 1, closes: 1 });
      });

      it('Enter on a control in the popup content leaves it open', async () => {
        const { inner, dialog, log, popup } = await mount(markup);
        popup.openPopup();
        await settle();
        inner.focus();
        await sendKeys({ press: 'Enter' });
        await settle();
        expect(dialog.open).to.equal(true);
        expect(log).to.deep.equal({ opens: 1, closes: 0 });
        popup.closePopup();
        await settle();
      });
    });
  }

  it('a <label> around a ty-button anchor opens it', async () => {
    const { wrap, dialog, log, popup } = await mount(html`
      <label><span class="text">Share</span> <ty-button type="button">Open<ty-popup><div class="content">x</div></ty-popup></ty-button></label>`);
    await sendMouse({ type: 'click', position: center(wrap.querySelector('.text')!) });
    await settle();
    expect(dialog.open).to.equal(true);
    expect(log.opens).to.equal(1);
    popup.closePopup();
    await settle();
  });
});

// <ty-button>Share<ty-popup>…: the popup is slotted inside the button, so its
// clicks pass the inner <button>. Not a press of the ty-button.
describe('ty-popup inside a ty-button', () => {
  const settle = () => new Promise((r) => setTimeout(r, 300));

  it('a click in the popup reaches the page as it is: no ty-button click, no submit', async () => {
    const form = (await fixture(html`
      <form><ty-button>Share<ty-popup><div class="content"><span class="item">Copy link</span></div></ty-popup></ty-button></form>
    `)) as HTMLFormElement;
    const popup = form.querySelector('ty-popup') as any;
    const item = form.querySelector('.item') as HTMLElement;
    let submits = 0;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submits++;
    });
    const clicks: { custom: boolean; onItem: boolean }[] = [];
    const onClick = (e: Event) => clicks.push({ custom: e instanceof CustomEvent, onItem: e.target === item });
    document.addEventListener('click', onClick);
    popup.openPopup();
    await settle();

    item.click();
    document.removeEventListener('click', onClick);
    expect(submits, 'no submit').to.equal(0);
    expect(clicks).to.deep.equal([{ custom: false, onItem: true }]);
    expect(popup.shadowRoot.querySelector('.popup-dialog').open, 'popup stays open').to.equal(true);
    popup.closePopup();
    await settle();
  });

  // Opening focuses the popup's own dialog, inside the anchor <button>: its
  // default action would turn Enter into a submit, Space into a close.
  for (const anchor of ['ty-button', 'button']) {
    it(`Enter and Space on the opened popup don't press the ${anchor} around it`, async () => {
      const form = (await fixture(html`<form></form>`)) as HTMLFormElement;
      form.innerHTML = `<${anchor} type="submit">Share<ty-popup><div><span>Copy link</span></div></ty-popup></${anchor}>`;
      const popup = form.querySelector('ty-popup') as any;
      const dialog = popup.shadowRoot.querySelector('.popup-dialog') as HTMLDialogElement;
      let submits = 0;
      let clicks = 0;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        submits++;
      });
      form.firstElementChild!.addEventListener('click', () => clicks++);
      popup.openPopup();
      await settle();
      expect(popup.shadowRoot.activeElement === dialog, 'the popup has focus').to.equal(true);

      await sendKeys({ press: 'Enter' });
      await sendKeys({ press: 'Space' });
      await settle();
      expect({ submits, clicks }).to.deep.equal({ submits: 0, clicks: 0 });
      expect(dialog.open, 'still open').to.equal(true);
      popup.closePopup();
      await settle();
    });
  }
});

// Components that listen for keys on document (ty-date-picker's calendar)
// must still get them from inside an open popup: a key from a modal dialog
// nested in the popup belongs to that dialog, which closes first.
describe('ty-popup — keys of a nested dialog', () => {
  const settle = () => new Promise((r) => setTimeout(r, 300));

  it('ty-date-picker: arrows move the day, Escape closes the calendar, then the popup', async function () {
    // Building the picker and its calendar takes a few seconds in headless Chrome
    this.timeout(15000);
    const wrap = (await fixture(html`
      <div><span tabindex="0">Open<ty-popup><div><ty-date-picker value="2026-07-15"></ty-date-picker></div></ty-popup></span></div>
    `)) as HTMLElement;
    const popup = wrap.querySelector('ty-popup') as any;
    const picker = wrap.querySelector('ty-date-picker') as any;
    const popupDialog = popup.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    popup.openPopup();
    await settle();

    (picker.shadowRoot.querySelector('.date-picker-stub') as HTMLElement).click();
    await settle();
    const calendarDialog = picker.shadowRoot.querySelector('.calendar-dialog') as HTMLDialogElement;
    expect(calendarDialog.open, 'calendar open').to.equal(true);
    const month = () => picker.shadowRoot.querySelector('ty-calendar').shadowRoot.querySelector('ty-calendar-month');
    const focusedDay = () => month().shadowRoot.activeElement?.getAttribute('aria-label') ?? '';
    (month().shadowRoot.querySelector('.calendar-day-cell[tabindex="0"]') as HTMLElement).focus();
    expect(focusedDay()).to.contain('15');

    await sendKeys({ press: 'ArrowRight' });
    await nextFrame();
    expect(focusedDay(), 'arrow moved the day').to.contain('16');

    await sendKeys({ press: 'Escape' });
    await settle();
    expect(calendarDialog.open, 'calendar closed').to.equal(false);
    expect(popupDialog.open, 'popup stays open').to.equal(true);

    await sendKeys({ press: 'Escape' });
    await settle();
    expect(popupDialog.open, 'popup closed').to.equal(false);
  });
});

// showModal() runs while the content is still hidden for positioning, so it
// found nothing to focus and left focus on the page: a real Escape became the
// browser's close request, which closed even a disable-close popup.
describe('ty-popup — focus and Escape', () => {
  const settle = () => new Promise((r) => setTimeout(r, 300));
  const popupLocks = () => Array.from(getActiveLocks()).filter((id: string) => id.startsWith('popup-')).length;
  const mount = async (attrs = '', body = '<p>x</p>') => {
    const wrap = (await fixture(html`<div></div>`)) as HTMLElement;
    wrap.innerHTML = `<span id="anchor" tabindex="0">Open<ty-popup ${attrs}>${body}</ty-popup></span>`;
    const popup = wrap.querySelector('ty-popup') as any;
    const dialog = popup.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    return { popup, dialog, anchor: wrap.querySelector('#anchor') as HTMLElement };
  };

  it('opening moves focus into the popup: its [autofocus] control, else the popup itself', async () => {
    const plain = await mount();
    plain.popup.openPopup();
    await settle();
    expect(plain.popup.shadowRoot.activeElement === plain.dialog, 'the popup').to.equal(true);
    plain.popup.closePopup();
    await settle();

    const auto = await mount('', '<div><button>a</button><input autofocus></div>');
    auto.popup.openPopup();
    await settle();
    expect(document.activeElement === auto.popup.querySelector('input'), 'its autofocus control').to.equal(true);
    auto.popup.closePopup();
    await settle();
  });

  // ty-input's wrapper transitions everything, the visibility the popup
  // turns on included: its input can't take focus in the opening frame.
  it('an [autofocus] ty-input gets the focus too; a control that never can leaves it on the popup', async () => {
    const field = await mount('', '<div><ty-input autofocus></ty-input></div>');
    field.popup.openPopup();
    await settle();
    const tyInput = field.popup.querySelector('ty-input') as HTMLElement;
    expect(document.activeElement === tyInput, 'the ty-input').to.equal(true);
    expect(tyInput.shadowRoot!.activeElement?.localName).to.equal('input');
    field.popup.closePopup();
    await settle();

    const inert = await mount('', '<div autofocus>text</div>');
    inert.popup.openPopup();
    await settle();
    expect(inert.popup.shadowRoot.activeElement === inert.dialog, 'the popup').to.equal(true);
    inert.popup.closePopup();
    await settle();
  });

  it('disable-close: Escape leaves it open, also as the browser\'s close request', async () => {
    const { popup, dialog } = await mount('disable-close');
    popup.openPopup();
    await settle();
    await sendKeys({ press: 'Escape' });
    await sendKeys({ press: 'Escape' });
    await settle();
    expect(dialog.open, 'keys').to.equal(true);

    // Focus off the popup: Escape reaches it only as the dialog's cancel
    (popup.shadowRoot.activeElement as HTMLElement).blur();
    await sendKeys({ press: 'Escape' });
    await settle();
    expect(dialog.open, 'cancel').to.equal(true);
    expect(dialog.classList.contains('open')).to.equal(true);

    popup.closePopup();
    await settle();
    expect(dialog.open).to.equal(false);
  });

  // The browser lets `cancel` be prevented only while the page has user
  // activation: with focus outside the popup, the third Escape closed it.
  it('disable-close: no number of Escapes closes it from outside the popup', async () => {
    const { popup, dialog } = await mount('disable-close', '<p>x</p>');
    popup.openPopup();
    await settle();
    (popup.shadowRoot.activeElement as HTMLElement).blur();
    for (let i = 0; i < 4; i++) await sendKeys({ press: 'Escape' });
    await settle();
    expect(dialog.open).to.equal(true);
    popup.closePopup();
    await settle();
  });

  it('without disable-close, Escape from outside the popup closes it', async () => {
    const { popup, dialog } = await mount();
    popup.openPopup();
    await settle();
    (popup.shadowRoot.activeElement as HTMLElement).blur();
    await sendKeys({ press: 'Escape' });
    await settle();
    expect(dialog.open).to.equal(false);
  });

  it('without disable-close, Escape closes it: close event, aria-expanded, lock', async () => {
    const { popup, dialog, anchor } = await mount();
    let closes = 0;
    popup.addEventListener('close', () => closes++);
    popup.openPopup();
    await settle();
    expect(popupLocks()).to.equal(1);
    await sendKeys({ press: 'Escape' });
    await settle();
    expect(dialog.open).to.equal(false);
    expect(closes).to.equal(1);
    expect(anchor.getAttribute('aria-expanded')).to.equal('false');
    expect(popupLocks()).to.equal(0);
  });
});

// React's `{show && <TyPopup/>}`: the popup goes, its anchor stays.
describe('ty-popup removed on its own', () => {
  it('its anchor is plain again: no listeners, no aria, no lock on a click', async () => {
    const wrap = (await fixture(html`<div><button id="a">Open<ty-popup><p>x</p></ty-popup></button></div>`)) as HTMLElement;
    const anchor = wrap.querySelector('#a') as HTMLButtonElement;
    wrap.querySelector('ty-popup')!.remove();
    expect(anchor.hasAttribute('aria-haspopup')).to.equal(false);
    expect(anchor.hasAttribute('aria-expanded')).to.equal(false);

    const errors: string[] = [];
    const onError = (e: ErrorEvent) => errors.push(e.message);
    window.addEventListener('error', onError);
    anchor.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    anchor.click();
    await new Promise((r) => setTimeout(r, 50));
    window.removeEventListener('error', onError);
    expect(errors).to.deep.equal([]);
    expect(Array.from(getActiveLocks()).filter((id: string) => id.startsWith('popup-'))).to.deep.equal([]);
  });
});
