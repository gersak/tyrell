import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import { sendKeys, sendMouse, resetMouse } from '@web/test-runner-commands';
import { TyInput } from '../lib/components/input.js';
import { upgradeProperties } from '../lib/base/ty-component.js';

// Template spec — regression coverage for:
//   1. `required` was cosmetic (no ElementInternals.setValidity)
//   2. an error showed danger by writing flavor="danger" on the host

describe('ty-input — constraint validation', () => {
  it('required + empty blocks the owning form, valid once filled', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-input name="x" required></ty-input></form>
    `);
    const input = form.querySelector('ty-input') as any;
    await nextFrame();

    // empty + required → form invalid
    expect(form.checkValidity()).to.equal(false);
    expect(input.matches(':invalid')).to.equal(true);

    // fill it → valid
    input.value = 'hello';
    await nextFrame();
    expect(form.checkValidity()).to.equal(true);
    expect(input.matches(':invalid')).to.equal(false);
  });

  it('non-required input is always valid', async () => {
    const input = (await fixture(html`<ty-input></ty-input>`)) as any;
    await nextFrame();
    expect(input.matches(':invalid')).to.equal(false);
  });

  it('disabled required input does not block validation', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-input name="x" required disabled></ty-input></form>
    `);
    await nextFrame();
    expect(form.checkValidity()).to.equal(true);
  });
});

describe('ty-input — native constraint rules', () => {
  const check = async (el: any, value: string) => {
    el.value = value;
    await nextFrame();
    return el.validity as ValidityState;
  };

  it('type=email / url: typeMismatch from the browser', async () => {
    const email = (await fixture(html`<ty-input type="email"></ty-input>`)) as any;
    expect((await check(email, 'nope')).typeMismatch).to.equal(true);
    expect(email.validationMessage).to.not.equal('');
    expect((await check(email, 'ada@example.com')).valid).to.equal(true);

    const url = (await fixture(html`<ty-input type="url"></ty-input>`)) as any;
    expect((await check(url, 'not a url')).typeMismatch).to.equal(true);
    expect((await check(url, 'https://example.com')).valid).to.equal(true);
  });

  it('pattern: whole value must match', async () => {
    const el = (await fixture(html`<ty-input pattern="[a-z]+"></ty-input>`)) as any;
    expect((await check(el, 'abc')).valid).to.equal(true);
    expect((await check(el, 'abc1')).patternMismatch).to.equal(true);
    el.pattern = '';
    await nextFrame();
    expect(el.validity.valid, 'rule removed').to.equal(true);
  });

  it('minlength / maxlength', async () => {
    const el = (await fixture(html`<ty-input minlength="3" maxlength="5"></ty-input>`)) as any;
    expect(el.minLength).to.equal(3);
    expect(el.maxLength).to.equal(5);
    expect((await check(el, 'ab')).tooShort).to.equal(true);
    expect(el.validationMessage).to.contain('3');
    expect((await check(el, 'abcd')).valid).to.equal(true);
    expect((await check(el, 'abcdefg')).tooLong).to.equal(true);
    const inner = el.shadowRoot.querySelector('input');
    expect(inner.getAttribute('maxlength'), 'typing stops at the limit').to.equal('5');
  });

  it('min / max on numeric types use the numeric value', async () => {
    const el = (await fixture(html`<ty-input type="currency" currency="EUR" min="10" max="100"></ty-input>`)) as any;
    expect((await check(el, '5')).rangeUnderflow).to.equal(true);
    expect((await check(el, '50')).valid).to.equal(true);
    expect((await check(el, '500')).rangeOverflow).to.equal(true);
  });

  it('messages: the browser\'s own for required and min/max', async () => {
    const native = (attrs: Record<string, string>, value: string, type = 'text') => {
      const i = document.createElement('input');
      i.type = type;
      for (const [k, v] of Object.entries(attrs)) i.setAttribute(k, v);
      i.value = value;
      return i.validationMessage;
    };
    const req = (await fixture(html`<ty-input required></ty-input>`)) as any;
    await nextFrame();
    expect(req.validationMessage).to.equal(native({ required: '' }, ''));
    expect(req.validationMessage).to.not.equal('');

    const num = (await fixture(html`<ty-input type="number" min="1" max="50"></ty-input>`)) as any;
    await check(num, '80');
    expect(num.validationMessage).to.equal(native({ step: 'any', min: '1', max: '50' }, '80', 'number'));
    await check(num, '0');
    expect(num.validationMessage).to.equal(native({ step: 'any', min: '1', max: '50' }, '0', 'number'));
  });

  it('min / max are read like a native number input: one it ignores is no rule', async () => {
    for (const min of [' 5 ', '0x10', '+5']) {
      const el = (await fixture(html`<ty-input type="number" min=${min}></ty-input>`)) as any;
      const native = document.createElement('input');
      native.type = 'number';
      native.setAttribute('min', min);
      native.value = '3';
      expect((await check(el, '3')).rangeUnderflow, `min="${min}"`).to.equal(native.validity.rangeUnderflow);
      expect(el.validationMessage, `min="${min}"`).to.equal(native.validationMessage);
    }
  });

  it('minlength: once the user typed, the message is the browser\'s own', async () => {
    const wrap = await fixture(html`
      <div><ty-input minlength="3"></ty-input><input minlength="3"></div>`);
    const el = wrap.querySelector('ty-input') as any;
    const native = wrap.querySelector('input')!;
    el.focus();
    await sendKeys({ type: 'ab' });
    // Moving on blurs the field: its error line shows and it re-renders,
    // which must not turn the typed value into a "set in code" one.
    native.focus();
    await sendKeys({ type: 'ab' });
    await nextFrame();
    expect(native.validity.tooShort).to.equal(true);
    expect(el.validity.tooShort).to.equal(true);
    expect(el.validationMessage).to.equal(native.validationMessage);
    expect(el.getAttribute('error')).to.equal(native.validationMessage);
  });

  it('minlength: too-short-message still wins over the browser\'s message', async () => {
    const el = (await fixture(html`
      <ty-input minlength="3" too-short-message="Min {minlength}"></ty-input>`)) as any;
    el.focus();
    await sendKeys({ type: 'ab' });
    expect(el.validationMessage).to.equal('Min 3');
  });

  it('too-short-message / too-long-message set the length wording', async () => {
    const el = (await fixture(html`
      <ty-input minlength="3" maxlength="5"
        too-short-message="Min {minlength}, got {length}"
        too-long-message="Max {maxlength}"></ty-input>`)) as any;
    await check(el, 'ab');
    expect(el.validationMessage).to.equal('Min 3, got 2');
    await check(el, 'abcdefg');
    expect(el.validationMessage).to.equal('Max 5');
    el.tooShortMessage = '';
    await check(el, 'ab');
    expect(el.validationMessage, 'default wording').to.contain('3');
  });

  it('empty value only fails required', async () => {
    const el = (await fixture(html`<ty-input pattern="[a-z]+" minlength="3"></ty-input>`)) as any;
    await nextFrame();
    expect(el.validity.valid).to.equal(true);
    el.required = true;
    await nextFrame();
    expect(el.validity.valueMissing).to.equal(true);
  });

  it('focus() and reportValidity() land on the inner input', async () => {
    const el = (await fixture(html`<ty-input minlength="3"></ty-input>`)) as any;
    const inner = el.shadowRoot.querySelector('input');
    el.focus();
    expect(el.shadowRoot.activeElement).to.equal(inner);
    inner.blur();
    await check(el, 'ab');
    el.reportValidity();
    expect(el.shadowRoot.activeElement, 'reportValidity focuses the field').to.equal(inner);
  });

  it('blocks the form and reportValidity() writes the message into error', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-input name="code" pattern="[0-9]{4}"></ty-input></form>
    `);
    const el = form.querySelector('ty-input') as any;
    await check(el, '12');
    expect(form.checkValidity()).to.equal(false);
    expect(el.reportValidity()).to.equal(false);
    expect(el.getAttribute('error')).to.not.equal(null);
    await check(el, '1234');
    expect(form.checkValidity()).to.equal(true);
    expect(el.hasAttribute('error'), 'cleared once valid').to.equal(false);
  });
});

// An error looks like flavor="danger" whatever the flavor, from the field's
// own style sheet: the component never writes flavor (or anything else) on
// the host for it, so el.flavor and the flavor attribute stay the author's.
describe('ty-input — error look', () => {
  // Distinct tokens, so each look is told apart (no theme sheet in tests)
  const PALETTE: Record<string, string> = {
    '--ty-color-danger': 'rgb(200, 0, 0)',
    '--ty-color-danger-soft': 'rgb(250, 160, 160)',
    '--ty-color-danger-bold': 'rgb(120, 0, 0)',
    '--ty-color-danger-faint': 'rgb(255, 200, 200)',
    '--ty-bg-danger-soft': 'rgb(255, 240, 240)',
    '--ty-color-success': 'rgb(0, 160, 0)',
    '--ty-color-success-soft': 'rgb(160, 250, 160)',
    '--ty-color-primary': 'rgb(0, 0, 160)',
    '--ty-color-primary-strong': 'rgb(0, 0, 100)',
    '--ty-color-brand': 'rgb(0, 0, 200)',
    '--ty-input-border': 'rgb(10, 10, 10)',
    '--ty-input-border-hover': 'rgb(20, 20, 20)',
    '--ty-input-border-focus': 'rgb(30, 30, 30)',
    '--ty-input-shadow-focus': 'rgb(40, 40, 40)',
    '--ty-input-bg': 'rgb(250, 250, 250)',
    '--ty-local-transition': 'none',
  };
  before(() => {
    for (const [k, v] of Object.entries(PALETTE)) document.documentElement.style.setProperty(k, v);
  });
  after(() => {
    for (const k of Object.keys(PALETTE)) document.documentElement.style.removeProperty(k);
  });

  const ACCENTS = ['--input-accent', '--input-accent-bold', '--input-ring'];
  /** The flavor variables (hover border, focus ring, toggle outline read them). */
  const accents = (el: any) => {
    const w = getComputedStyle(el.shadowRoot.querySelector('.input-wrapper'));
    return ACCENTS.map((p) => w.getPropertyValue(p).trim()).join(' | ');
  };
  /** Everything the field shows: border, background, focus ring, and the accents. */
  const look = (el: any) => {
    const w = getComputedStyle(el.shadowRoot.querySelector('.input-wrapper'));
    return [w.borderTopColor, w.backgroundColor, w.boxShadow, accents(el)].join(' | ');
  };
  const focus = (el: any) => el.shadowRoot.querySelector('input').focus();
  const twins = async (markup: string) => {
    const wrap = await fixture(html`<div></div>`);
    wrap.innerHTML = markup;
    await nextFrame();
    return Array.from(wrap.querySelectorAll('ty-input')) as any[];
  };
  /** The field at rest, its border under a real mouse, and focused. */
  const states = async (el: any) => {
    const w = el.shadowRoot.querySelector('.input-wrapper') as HTMLElement;
    const rest = look(el);
    w.scrollIntoView({ block: 'center' });
    const r = w.getBoundingClientRect();
    await sendMouse({ type: 'move', position: [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)] });
    const hover = getComputedStyle(w).borderTopColor;
    await resetMouse();
    focus(el);
    const focused = look(el);
    el.shadowRoot.querySelector('input').blur();
    return `rest ${rest} || hover ${hover} || focused ${focused}`;
  };
  // Error beats every flavor: built-in, +/- shades, the neutral ones, and a
  // custom one (its sheet is adopted after the built-in one)
  const ANY_FLAVOR = [null, 'neutral', 'success', 'primary+', 'neutral-', 'danger-', 'brand'];
  const tag = (flavor: string | null, attrs = '') =>
    `<ty-input${flavor === null ? '' : ` flavor="${flavor}"`}${attrs}></ty-input>`;

  it('neutral, empty or no flavor: the danger look, and no attribute written', async () => {
    const [none, neutral, empty, danger, plain] = await twins(`
      <ty-input></ty-input>
      <ty-input flavor="neutral"></ty-input>
      <ty-input flavor=""></ty-input>
      <ty-input flavor="danger" error="Taken"></ty-input>
      <ty-input></ty-input>`);
    const before = [none, neutral, empty].map((el) => el.getAttributeNames().join());
    none.error = 'Taken';
    neutral.setAttribute('error', 'Taken');
    empty.error = 'Taken';
    await nextFrame();
    for (const el of [none, neutral, empty]) {
      expect(look(el)).to.equal(look(danger));
      expect(el.flavor).to.equal(el === none ? 'neutral' : el.getAttribute('flavor'));
    }
    expect(look(none), 'not the neutral look').to.not.equal(look(plain));
    expect(none.hasAttribute('flavor')).to.equal(false);
    expect(neutral.getAttribute('flavor')).to.equal('neutral');

    focus(none);
    expect(look(none), 'focused').to.equal((focus(danger), look(danger)));

    none.error = '';
    neutral.removeAttribute('error');
    empty.error = '';
    await nextFrame();
    for (const el of [none, neutral, empty]) expect(look(el), 'cleared: neutral again').to.equal(look(plain));
    // only `error` came and went
    expect([none, neutral, empty].map((el) => el.getAttributeNames().filter((a: string) => a !== 'error').join()))
      .to.deep.equal(before);
    expect(none.flavor).to.equal('neutral');
  });

  it('any flavor: an error looks exactly like flavor="danger" at rest, hovered and focused; cleared, the flavor look is back', async () => {
    const [plain] = await twins(tag(null));
    expect((await states(plain)).split(' || ')[1], 'the probe sees the hover').to.equal('hover rgb(20, 20, 20)');
    for (const flavor of ANY_FLAVOR) {
      const [el, own, danger] = await twins(tag(flavor) + tag(flavor) + tag('danger', ' error="Taken"'));
      const names = el.getAttributeNames().join();
      const ownLook = await states(own);
      el.error = 'Taken';
      await nextFrame();
      expect(await states(el), `${flavor} + error`).to.equal(await states(danger));
      expect(el.getAttribute('flavor'), `${flavor}: the attribute`).to.equal(flavor);
      expect(el.flavor).to.equal(flavor ?? 'neutral');
      el.error = '';
      await nextFrame();
      expect(await states(el), `${flavor}: cleared`).to.equal(ownLook);
      expect(el.getAttributeNames().filter((a: string) => a !== 'error').join(), 'only error came and went').to.equal(names);
    }
  });

  it('any flavor: a page-level --input-accent* override shows on the error as on flavor="danger"', async () => {
    const style = document.createElement('style');
    style.textContent = 'ty-input.ov { --input-accent: rgb(1, 2, 3); --input-accent-bold: rgb(4, 5, 6); --input-ring: rgb(7, 8, 9); }';
    document.head.append(style);
    try {
      for (const flavor of ANY_FLAVOR) {
        const [el, danger] = await twins(tag(flavor, ' class="ov" error="x"') + tag('danger', ' class="ov" error="x"'));
        expect(look(danger).startsWith('rgb(1, 2, 3)'), 'the override is the resting border').to.equal(true);
        expect(await states(el), String(flavor)).to.equal(await states(danger));
      }
    } finally {
      style.remove();
    }
  });

  it('a page rule keyed on the flavor that skips the error state (CSS guide) leaves the error its danger look', async () => {
    const style = document.createElement('style');
    style.textContent = 'ty-input[flavor="brand"]:not([error]:not([error=""])) { --input-accent: rgb(9, 9, 9); }';
    document.head.append(style);
    try {
      const [el, danger] = await twins(tag('brand', ' error="x"') + tag('danger', ' error="x"'));
      expect(await states(el)).to.equal(await states(danger));
      el.error = '';
      await nextFrame();
      expect(look(el).startsWith('rgb(9, 9, 9)'), 'cleared: the page rule is back').to.equal(true);
    } finally {
      style.remove();
    }
  });

  it('any flavor: disabled with an error looks like flavor="danger" disabled, no red tint', async () => {
    const [danger, dangerErr, enabled] = await twins(tag('danger', ' disabled') + tag('danger', ' disabled error="x"') + tag('danger', ' error="x"'));
    expect(look(danger) !== look(enabled), 'the probe sees disabled').to.equal(true);
    expect(look(dangerErr), 'flavor="danger" with the error').to.equal(look(danger));
    for (const flavor of ANY_FLAVOR) {
      const [el] = await twins(tag(flavor, ' disabled error="x"'));
      expect(look(el), String(flavor)).to.equal(look(danger));
    }
  });

  it('attribute order, copies and a morph: the look follows the attributes', async () => {
    const [errorFirst, neutralErrorFirst, danger, plain, success] = await twins(`
      <ty-input error="x" flavor="success"></ty-input>
      <ty-input error="x" flavor="neutral"></ty-input>
      <ty-input flavor="danger" error="x"></ty-input>
      <ty-input></ty-input>
      <ty-input flavor="success"></ty-input>`);
    expect(look(errorFirst)).to.equal(look(danger));
    expect(look(neutralErrorFirst)).to.equal(look(danger));
    errorFirst.removeAttribute('error');
    await nextFrame();
    expect(look(errorFirst), 'the error gone: success').to.equal(look(success));

    // cloneNode and an innerHTML round trip copy only what the author wrote
    const [shown] = await twins(`<ty-input error="x"></ty-input>`);
    const parsed = document.createElement('div');
    parsed.innerHTML = shown.outerHTML;
    const copies = [shown.cloneNode(true), parsed.firstElementChild] as any[];
    plain.after(...copies);
    await nextFrame();
    for (const copy of copies) {
      expect(copy.getAttributeNames().join()).to.equal('error');
      expect(look(copy)).to.equal(look(danger));
      copy.error = '';
    }
    await nextFrame();
    for (const copy of copies) expect(look(copy)).to.equal(look(plain));

    // A morph applying the server's next markup to `shown`: its attributes
    // are exactly the server's, so nothing is left behind.
    expect(shown.getAttributeNames().join()).to.equal('error');
    shown.setAttribute('flavor', 'success');
    await nextFrame();
    expect(look(shown), 'flavor added beside the error').to.equal(look(danger));
    shown.removeAttribute('flavor');
    await nextFrame();
    expect(look(shown), 'flavor dropped').to.equal(look(danger));
    shown.removeAttribute('error');
    await nextFrame();
    expect(look(shown), 'error dropped').to.equal(look(plain));
    expect(shown.getAttributeNames().length).to.equal(0);
  });

  it('an error set while detached shows once connected, first time or put back', async () => {
    const [danger] = await twins(`<ty-input flavor="danger" error="Bad"></ty-input>`);
    const fresh = document.createElement('ty-input') as any;
    fresh.error = 'Bad';
    danger.after(fresh);
    await nextFrame();
    expect(look(fresh)).to.equal(look(danger));
    expect(fresh.hasAttribute('flavor')).to.equal(false);

    // Removed, error set, put back
    const [moved] = await twins(`<ty-input></ty-input>`);
    const parent = moved.parentElement;
    moved.remove();
    moved.error = 'Bad';
    parent.append(moved);
    await nextFrame();
    expect(look(moved)).to.equal(look(danger));
    expect(moved.shadowRoot.querySelector('.error-message')?.textContent).to.equal('Bad');
    let inputs = 0;
    moved.addEventListener('input', () => inputs++);
    const inner = moved.shadowRoot.querySelector('input') as HTMLInputElement;
    inner.value = 'x';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    expect(inputs, 'still listening after the move').to.equal(1);
  });

  it('validation shows and clears it: report, blur after an edit, reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <ty-input name="a" required></ty-input>
        <ty-input name="b" minlength="3"></ty-input>
        <ty-input flavor="danger" error="x"></ty-input>
        <ty-input></ty-input>
      </form>`);
    await nextFrame();
    const [a, b, danger, plain] = Array.from(form.querySelectorAll('ty-input')) as any[];
    a.reportValidity();
    expect(a.getAttribute('error')).to.equal(a.validationMessage);
    expect(look(a), 'reported').to.equal((focus(danger), look(danger)));
    a.value = 'ok';
    await nextFrame();
    expect(a.hasAttribute('error')).to.equal(false);
    danger.shadowRoot.querySelector('input').blur();
    expect(look(a), 'valid again').to.equal(look(plain));

    const inner = b.shadowRoot.querySelector('input') as HTMLInputElement;
    inner.focus();
    inner.value = 'ab';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    inner.blur();
    await nextFrame();
    expect(look(b), 'shown on blur').to.equal(look(danger));
    form.reset();
    await nextFrame();
    expect(b.hasAttribute('error')).to.equal(false);
    expect(look(b), 'reset').to.equal(look(plain));
    for (const el of [a, b]) {
      expect(el.flavor).to.equal('neutral');
      expect(el.hasAttribute('flavor')).to.equal(false);
    }
  });

  it('an error shown while the field has focus keeps the focused look', async () => {
    const [field, danger] = await twins(`<ty-input></ty-input><ty-input flavor="danger" error="x"></ty-input>`);
    focus(field);
    field.error = 'x';
    await nextFrame();
    expect(field.shadowRoot.querySelector('.input-wrapper').classList.contains('focused')).to.equal(true);
    expect(look(field)).to.equal((focus(danger), look(danger)));
  });

  it('an error render drops a focused look the field no longer has', async () => {
    const [field, danger] = await twins(`<ty-input type="number" value="1234"></ty-input><ty-input flavor="danger" error="x"></ty-input>`);
    const inner = field.shadowRoot.querySelector('input') as HTMLInputElement;
    // A focus that ended without a blur (Firefox/WebKit moving or hiding a
    // focused field): the handler ran, the field isn't focused.
    inner.dispatchEvent(new FocusEvent('focus'));
    expect(field.shadowRoot.activeElement === inner, 'not really focused').to.equal(false);
    field.error = 'x';
    await nextFrame();
    expect(field.shadowRoot.querySelector('.input-wrapper').classList.contains('focused')).to.equal(false);
    expect(look(field)).to.equal(look(danger));
    expect(inner.value, 'formatted again').to.not.equal('1234');
  });
});

describe('ty-input — numeric shadow value', () => {
  it('input detail carries the parsed numeric value + raw input', async () => {
    const el = (await fixture(html`<ty-input type="number"></ty-input>`)) as any;
    await nextFrame();
    const inner = el.shadowRoot.querySelector('input') as HTMLInputElement;
    const ev = oneEvent(el, 'input');
    inner.value = '1234.56';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    const e = (await ev) as CustomEvent;
    expect(e.detail.value).to.equal(1234.56);   // unformatted shadow number
    expect(e.detail.rawValue).to.equal('1234.56');
  });
});

describe('ty-input — password reveal toggle', () => {
  it('renders for type=password and toggles the native input type', async () => {
    const el = (await fixture(html`<ty-input type="password" value="s3cret"></ty-input>`)) as any;
    await nextFrame();
    const toggle = el.shadowRoot.querySelector('.password-toggle') as HTMLButtonElement;
    const input = el.shadowRoot.querySelector('input') as HTMLInputElement;
    expect(toggle, 'toggle exists for password').to.exist;
    expect(input.type).to.equal('password');

    toggle.click();
    expect(input.type, 'revealed').to.equal('text');
    expect(toggle.getAttribute('aria-pressed')).to.equal('true');

    toggle.click();
    expect(input.type, 'hidden again').to.equal('password');
    expect(el.type, 'component type property unchanged').to.equal('password');
  });

  it('stays revealed through an error render', async () => {
    const el = (await fixture(html`<ty-input type="password" minlength="5" value="abc"></ty-input>`)) as any;
    await nextFrame();
    const toggle = el.shadowRoot.querySelector('.password-toggle') as HTMLButtonElement;
    const input = el.shadowRoot.querySelector('input') as HTMLInputElement;
    toggle.click();
    el.error = 'Too short';
    await nextFrame();
    expect(input.type, 'still revealed').to.equal('text');
    expect(toggle.getAttribute('aria-pressed')).to.equal('true');
    toggle.click();
    el.error = '';
    await nextFrame();
    expect(input.type, 'hidden stays hidden').to.equal('password');
  });

  it('keeps the caret, or the selection, where it was', async () => {
    const el = (await fixture(html`<ty-input type="password"></ty-input>`)) as any;
    const input = el.shadowRoot.querySelector('input') as HTMLInputElement;
    const toggle = el.shadowRoot.querySelector('.password-toggle') as HTMLElement;
    // Real clicks: the path on which Chromium drops the caret
    const click = async (target: HTMLElement) => {
      const r = target.getBoundingClientRect();
      await sendMouse({ type: 'click', position: [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)] });
      await nextFrame();
    };
    await click(input);
    await sendKeys({ type: 'hunter2' });
    await click(toggle);
    await sendKeys({ type: '!' });
    expect(el.value, 'revealed').to.equal('hunter2!');
    input.setSelectionRange(4, 4);
    await click(toggle);
    await sendKeys({ type: 'X' });
    expect(el.value, 'hidden again').to.equal('huntXer2!');
    input.setSelectionRange(1, 3);
    await click(toggle);
    expect([input.type, input.selectionStart, input.selectionEnd]).to.deep.equal(['text', 1, 3]);
    expect(el.shadowRoot.activeElement === input, 'focus stays in the field').to.equal(true);
    await resetMouse();
  });

  it('does not render for other types', async () => {
    const el = (await fixture(html`<ty-input type="text"></ty-input>`)) as any;
    await nextFrame();
    expect(el.shadowRoot.querySelector('.password-toggle')).to.be.null;
  });
});

describe('ty-input custom flavors', () => {
  const BRAND = 'rgb(1, 2, 3)';

  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-color-brand');
  });

  const borderColor = (el: any) =>
    getComputedStyle(el.shadowRoot.querySelector('.input-wrapper')).borderTopColor;

  it('derives the wrapper border from a custom flavor token', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', BRAND);
    const el = (await fixture(html`<ty-input flavor="brand"></ty-input>`)) as any;
    await nextFrame();
    expect(borderColor(el)).to.equal(BRAND);
  });

  it('page-level --input-accent rules override a custom flavor (escape hatch)', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', BRAND);
    const wrap = await fixture(html`
      <div>
        <style>ty-input[flavor="brand"] { --input-accent: rgb(9, 9, 9); }</style>
        <ty-input flavor="brand"></ty-input>
      </div>
    `);
    await nextFrame();
    const el = wrap.querySelector('ty-input') as any;
    expect(borderColor(el)).to.equal('rgb(9, 9, 9)');
  });
});

describe('ty-input password toggle focus outline follows flavor', () => {
  it('outlines in the flavor color, not a fixed primary', async () => {
    document.documentElement.style.setProperty('--ty-color-danger', 'rgb(7, 8, 9)');
    document.documentElement.style.setProperty('--ty-color-primary', 'rgb(1, 2, 3)');
    const el = (await fixture(html`<ty-input type="password" flavor="danger"></ty-input>`)) as any;
    await nextFrame();
    const toggle = el.shadowRoot.querySelector('.password-toggle') as HTMLButtonElement;
    toggle.focus();
    const outline = getComputedStyle(toggle).outlineColor;
    expect(outline, 'outline uses the danger flavor, not primary').to.equal('rgb(7, 8, 9)');
    document.documentElement.style.removeProperty('--ty-color-danger');
    document.documentElement.style.removeProperty('--ty-color-primary');
  });
});

describe('ty-input flavored emphasis ladder', () => {
  it('rests on the -soft shade and escalates to the base color on focus', async () => {
    document.documentElement.style.setProperty('--ty-color-success', 'rgb(7, 8, 9)');
    document.documentElement.style.setProperty('--ty-color-success-soft', 'rgb(4, 5, 6)');
    const el = (await fixture(html`<ty-input flavor="success"></ty-input>`)) as any;
    await nextFrame();
    const wrap = el.shadowRoot.querySelector('.input-wrapper') as HTMLElement;
    wrap.style.setProperty('transition', 'none', 'important');

    expect(getComputedStyle(wrap).borderTopColor, 'resting border is soft').to.equal('rgb(4, 5, 6)');

    el.shadowRoot.querySelector('input').focus();
    await nextFrame();
    expect(getComputedStyle(wrap).borderTopColor, 'focused border is the full color').to.equal('rgb(7, 8, 9)');

    document.documentElement.style.removeProperty('--ty-color-success');
    document.documentElement.style.removeProperty('--ty-color-success-soft');
  });
});

describe('ty-input custom flavor emphasis ladder', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-color-brand');
    document.documentElement.style.removeProperty('--ty-color-brand-soft');
  });

  it('with a -soft token defined, custom flavors get the same rest→focus ladder', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', 'rgb(7, 8, 9)');
    document.documentElement.style.setProperty('--ty-color-brand-soft', 'rgb(4, 5, 6)');
    const el = (await fixture(html`<ty-input flavor="brand"></ty-input>`)) as any;
    await nextFrame();
    const wrap = el.shadowRoot.querySelector('.input-wrapper') as HTMLElement;
    wrap.style.setProperty('transition', 'none', 'important');
    expect(getComputedStyle(wrap).borderTopColor, 'rest is soft').to.equal('rgb(4, 5, 6)');
    el.shadowRoot.querySelector('input').focus();
    await nextFrame();
    expect(getComputedStyle(wrap).borderTopColor, 'focus is full color').to.equal('rgb(7, 8, 9)');
  });

  it('with only the base token, rest degrades to the full color (flat, but visible)', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', 'rgb(7, 8, 9)');
    const el = (await fixture(html`<ty-input flavor="brand"></ty-input>`)) as any;
    await nextFrame();
    const wrap = el.shadowRoot.querySelector('.input-wrapper') as HTMLElement;
    expect(getComputedStyle(wrap).borderTopColor).to.equal('rgb(7, 8, 9)');
  });
});

describe('ty-input — form submit shows errors without JS', () => {
  it('submit attempt: errors in each field, first one focused, no submit', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <ty-input name="a" required></ty-input>
        <ty-input name="b" minlength="3" value="x"></ty-input>
        <button>Send</button>
      </form>
    `);
    let submitted = false;
    form.addEventListener('submit', (e) => { submitted = true; e.preventDefault(); });
    await nextFrame();
    const [a, b] = Array.from(form.querySelectorAll('ty-input')) as any[];

    (form.querySelector('button') as HTMLElement).click();
    await nextFrame();
    expect(submitted).to.equal(false);
    expect(a.getAttribute('error')).to.not.equal(null);
    expect(b.getAttribute('error')).to.contain('3');
    expect(a.shadowRoot.activeElement, 'first bad field focused').to.equal(a.shadowRoot.querySelector('input'));

    a.value = 'ok';
    b.value = 'xyz';
    await nextFrame();
    expect(a.hasAttribute('error')).to.equal(false);
    expect(b.hasAttribute('error')).to.equal(false);
    (form.querySelector('button') as HTMLElement).click();
    await nextFrame();
    expect(submitted).to.equal(true);
  });

  it('checkValidity() shows the message too, but moves no focus; validity.valid is the silent check', async () => {
    const form = await fixture<HTMLFormElement>(html`<form><ty-input name="a" required></ty-input></form>`);
    await nextFrame();
    const el = form.querySelector('ty-input') as any;
    expect(el.validity.valid, 'silent read').to.equal(false);
    expect(form.matches(':invalid')).to.equal(true);
    expect(el.hasAttribute('error')).to.equal(false);
    expect(form.checkValidity()).to.equal(false);
    expect(el.getAttribute('error')).to.not.equal(null);
    expect(el.shadowRoot.activeElement, 'no focus outside a submit').to.equal(null);
  });
});

describe('ty-input — message on blur after an edit', () => {
  const type = (inner: HTMLInputElement, v: string) => {
    inner.focus();
    inner.value = v;
    inner.dispatchEvent(new Event('input', { bubbles: true }));
  };

  it('edited and left invalid: shows the message; fixing clears it', async () => {
    const el = (await fixture(html`<ty-input minlength="3"></ty-input>`)) as any;
    const inner = el.shadowRoot.querySelector('input');
    type(inner, 'ab');
    await nextFrame();
    expect(el.hasAttribute('error'), 'not while typing').to.equal(false);
    inner.blur();
    await nextFrame();
    expect(el.getAttribute('error')).to.contain('3');
    type(inner, 'abc');
    await nextFrame();
    expect(el.hasAttribute('error'), 'cleared as soon as valid').to.equal(false);
  });

  it('tabbing through without typing shows nothing', async () => {
    const el = (await fixture(html`<ty-input required></ty-input>`)) as any;
    const inner = el.shadowRoot.querySelector('input');
    inner.focus();
    inner.blur();
    await nextFrame();
    expect(el.hasAttribute('error')).to.equal(false);
  });

  it('form.reportValidity() from a plain button uses the error lines', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-input name="a" required></ty-input><button type="button">Next</button></form>
    `);
    const btn = form.querySelector('button')!;
    btn.addEventListener('click', () => form.reportValidity());
    await nextFrame();
    btn.click();
    await nextFrame();
    expect((form.querySelector('ty-input') as any).getAttribute('error')).to.not.equal(null);
  });
});

describe('ty-input — behaves like a native input in a form', () => {
  const enter = (el: any) => {
    const inner = el.shadowRoot.querySelector('input');
    inner.focus();
    inner.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true }));
  };
  const watch = (form: HTMLFormElement) => {
    const log = { submits: 0 };
    form.addEventListener('submit', (e) => { log.submits++; e.preventDefault(); });
    return log;
  };

  it('Enter clicks the default submit button', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-input name="a" value="x"></ty-input><ty-input name="b"></ty-input><button>Go</button></form>`);
    const log = watch(form);
    await nextFrame();
    enter(form.querySelector('ty-input'));
    expect(log.submits).to.equal(1);
  });

  it('Enter does nothing when the default button is disabled', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-input name="a" value="x"></ty-input><button disabled>Go</button></form>`);
    const log = watch(form);
    await nextFrame();
    enter(form.querySelector('ty-input'));
    expect(log.submits).to.equal(0);
  });

  it('no submit button: Enter submits only a single-field form', async () => {
    const one = await fixture<HTMLFormElement>(html`<form><ty-input name="a" value="x"></ty-input></form>`);
    const two = await fixture<HTMLFormElement>(html`<form><ty-input name="a"></ty-input><ty-input name="b"></ty-input></form>`);
    const l1 = watch(one), l2 = watch(two);
    await nextFrame();
    enter(one.querySelector('ty-input'));
    enter(two.querySelector('ty-input'));
    expect(l1.submits).to.equal(1);
    expect(l2.submits).to.equal(0);
  });

  it('Enter on an invalid form shows the messages instead of submitting', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-input name="a" required></ty-input><button>Go</button></form>`);
    const log = watch(form);
    await nextFrame();
    enter(form.querySelector('ty-input'));
    await nextFrame();
    expect(log.submits).to.equal(0);
    expect((form.querySelector('ty-input') as any).getAttribute('error')).to.not.equal(null);
  });

  it('an empty field still submits name= (and numbers submit their value)', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-input name="empty"></ty-input><ty-input name="n" type="number" value="5"></ty-input></form>`);
    await nextFrame();
    const data = new FormData(form);
    expect(data.has('empty'), 'name= present').to.equal(true);
    expect(data.get('empty')).to.equal('');
    expect(data.get('n')).to.equal('5');
    const n = form.querySelectorAll('ty-input')[1] as any;
    n.value = '';
    await nextFrame();
    expect(new FormData(form).get('n')).to.equal('');
  });
});

describe('ty-input — form.reset() clears what validation showed', () => {
  it('after a submit attempt: no messages, fields empty, an untouched blur shows nothing', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <ty-input name="a" required></ty-input>
        <ty-input name="b" minlength="3"></ty-input>
        <button>Send</button>
      </form>
    `);
    await nextFrame();
    const [a, b] = Array.from(form.querySelectorAll('ty-input')) as any[];
    const innerB = b.shadowRoot.querySelector('input') as HTMLInputElement;
    innerB.focus();
    innerB.value = 'x';
    innerB.dispatchEvent(new Event('input', { bubbles: true }));
    (form.querySelector('button') as HTMLElement).click();
    await nextFrame();
    expect(a.getAttribute('error')).to.not.equal(null);
    expect(b.getAttribute('error')).to.contain('3');

    form.reset();
    await nextFrame();
    expect(a.hasAttribute('error'), 'a cleared').to.equal(false);
    expect(b.hasAttribute('error'), 'b cleared').to.equal(false);
    expect(a.hasAttribute('flavor'), 'no flavor attribute written').to.equal(false);
    expect(b.value).to.equal('');
    expect(innerB.value).to.equal('');

    // b was edited before the reset; now it's untouched again
    innerB.focus();
    innerB.blur();
    await nextFrame();
    expect(b.hasAttribute('error'), 'untouched blur shows nothing').to.equal(false);
    expect(a.validity.valueMissing, 'still invalid, just not shown').to.equal(true);
  });

  it('an error the author set stays', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-input name="a" value="taken" error="Already taken"></ty-input></form>
    `);
    await nextFrame();
    const el = form.querySelector('ty-input') as any;
    form.reset();
    await nextFrame();
    expect(el.getAttribute('error')).to.equal('Already taken');
  });

  it('a message the author wrote over a shown one stays', async () => {
    const form = await fixture<HTMLFormElement>(html`<form><ty-input name="a" required></ty-input></form>`);
    await nextFrame();
    const el = form.querySelector('ty-input') as any;
    el.reportValidity();
    expect(el.getAttribute('error')).to.not.equal(null);
    el.error = 'Server says no';
    el.value = 'x';
    await nextFrame();
    expect(el.getAttribute('error'), 'valid again, author message kept').to.equal('Server says no');
    form.reset();
    await nextFrame();
    expect(el.getAttribute('error')).to.equal('Server says no');
  });
});

describe('ty-input — validation never overwrites an error the author set', () => {
  const type = (el: any, v: string) => {
    const inner = el.shadowRoot.querySelector('input') as HTMLInputElement;
    inner.focus();
    inner.value = v;
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    return inner;
  };

  it('blur after an edit, then valid: the author text stays', async () => {
    const el = (await fixture(html`<ty-input minlength="5" error="Username is taken"></ty-input>`)) as any;
    await nextFrame();
    type(el, 'ab').blur();
    await nextFrame();
    expect(el.getAttribute('error')).to.equal('Username is taken');
    expect(el.validity.tooShort, 'still invalid underneath').to.equal(true);
    type(el, 'abcdef');
    await nextFrame();
    expect(el.getAttribute('error')).to.equal('Username is taken');
  });

  it('set over a shown message: a later blur and a submit keep it', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-input name="u" minlength="5"></ty-input><button>Go</button></form>`);
    form.addEventListener('submit', (e) => e.preventDefault());
    await nextFrame();
    const el = form.querySelector('ty-input') as any;
    type(el, 'ab').blur();
    await nextFrame();
    expect(el.getAttribute('error')).to.contain('5');
    el.error = 'Custom author message';
    type(el, 'abc').blur();
    await nextFrame();
    expect(el.getAttribute('error')).to.equal('Custom author message');
    form.querySelector('button')!.click();
    await nextFrame();
    expect(el.getAttribute('error')).to.equal('Custom author message');
    expect(el.shadowRoot.activeElement, 'still focused as the first invalid field')
      .to.equal(el.shadowRoot.querySelector('input'));
    el.reportValidity();
    expect(el.getAttribute('error')).to.equal('Custom author message');
  });

  it('cleared by the author: validation writes its own message again', async () => {
    const el = (await fixture(html`<ty-input minlength="5" error="Taken"></ty-input>`)) as any;
    await nextFrame();
    el.error = '';
    type(el, 'ab').blur();
    await nextFrame();
    expect(el.getAttribute('error')).to.contain('5');
  });
});

describe('ty-input — properties set before the element upgrades', () => {
  let n = 0;
  const tag = () => `ty-input-upgrade-${++n}`;

  it('created and connected before its definition: later assignments still reach the setters', async () => {
    const name = tag();
    const el = document.createElement(name) as any;
    el.value = 'early';
    el.error = 'Early error';
    el.minLength = 3;
    document.body.append(el);
    customElements.define(name, class extends TyInput {});
    await nextFrame();
    const inner = el.shadowRoot.querySelector('input') as HTMLInputElement;
    expect(el.value).to.equal('early');
    expect(el.getAttribute('error')).to.equal('Early error');
    expect(el.getAttribute('minlength')).to.equal('3');
    expect(el.minLength).to.equal(3);
    for (const p of ['value', 'error', 'minLength']) {
      expect(Object.prototype.hasOwnProperty.call(el, p), `no own ${p} left`).to.equal(false);
    }

    el.value = 'later';
    el.error = 'Later error';
    el.minLength = 5;
    await nextFrame();
    expect(el.value).to.equal('later');
    expect(inner.value).to.equal('later');
    expect(el.getAttribute('error')).to.equal('Later error');
    expect(el.shadowRoot.querySelector('.error-message').textContent).to.equal('Later error');
    expect(el.getAttribute('minlength')).to.equal('5');
    expect(el.validity.tooShort).to.equal(false); // set in code: 'later' is 5 long
    el.value = 'abc';
    await nextFrame();
    expect(el.validity.tooShort, 'new minLength applies').to.equal(true);
    el.remove();
  });

  it('upgradeProperties() for a component extending HTMLElement directly', async () => {
    const name = tag();
    const el = document.createElement(name) as any;
    el.open = true;
    document.body.append(el);
    customElements.define(name, class extends HTMLElement {
      get open() { return this.hasAttribute('open'); }
      set open(v: boolean) { this.toggleAttribute('open', !!v); }
      connectedCallback() { upgradeProperties(this); }
    });
    expect(el.hasAttribute('open')).to.equal(true);
    expect(Object.prototype.hasOwnProperty.call(el, 'open')).to.equal(false);
    el.open = false;
    expect(el.hasAttribute('open'), 'later assignments reach the setter').to.equal(false);
    el.remove();
  });

  it('created detached, upgraded on insertion', async () => {
    const name = tag();
    const el = document.createElement(name) as any;
    el.value = 'one';
    el.required = true;
    customElements.define(name, class extends TyInput {});
    expect(el instanceof TyInput, 'not upgraded while detached').to.equal(false);
    const form = await fixture<HTMLFormElement>(html`<form></form>`);
    el.setAttribute('name', 'q');
    form.append(el);
    await nextFrame();
    expect(el instanceof TyInput).to.equal(true);
    expect(el.value).to.equal('one');
    expect(el.hasAttribute('required')).to.equal(true);
    el.value = 'two';
    el.required = false;
    await nextFrame();
    expect(new FormData(form).get('q')).to.equal('two');
    expect(el.hasAttribute('required')).to.equal(false);
  });
});

describe('ty-input — moved in the DOM', () => {
  async function mount() {
    const form = await fixture(html`
      <form><div id="a"><ty-input name="n" value="orig"></ty-input></div><div id="b"></div></form>
    `) as HTMLFormElement;
    const el = form.querySelector('ty-input') as TyInput;
    await nextFrame();
    return { form, el, inner: () => el.shadowRoot!.querySelector('input')! };
  }

  it('keeps the user\'s edit when moved', async () => {
    const { form, el, inner } = await mount();
    inner().focus();
    inner().select();
    await sendKeys({ type: 'edited' });
    inner().blur();

    form.querySelector('#b')!.appendChild(el);
    await nextFrame();

    expect(el.value).to.equal('edited');
    expect(inner().value).to.equal('edited');
    expect(new FormData(form).get('n')).to.equal('edited');
  });

  it('takes a value set while detached', async () => {
    const { form, el, inner } = await mount();
    el.remove();
    el.value = 'later';
    form.querySelector('#b')!.appendChild(el);
    await nextFrame();

    expect(inner().value).to.equal('later');
    expect(new FormData(form).get('n')).to.equal('later');
  });
});

describe('ty-input — form.reset() after the server changed the markup', () => {
  it('goes back to the latest value attribute', async () => {
    const form = (await fixture(html`<form><ty-input name="n" value="first"></ty-input></form>`)) as HTMLFormElement;
    const el = form.querySelector('ty-input') as TyInput;
    await nextFrame();
    el.setAttribute('value', 'saved'); // a morph
    const inner = el.shadowRoot!.querySelector('input')!;
    inner.focus();
    inner.select();
    await sendKeys({ type: 'unsaved' });
    inner.blur();
    form.reset();
    await nextFrame();
    expect(el.value).to.equal('saved');
  });
});
