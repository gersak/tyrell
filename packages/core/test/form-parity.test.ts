import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/input.js';
import '../lib/components/radio.js';
import '../lib/components/file-upload.js';
import '../lib/components/select.js';
import '../lib/components/option.js';
import '../lib/components/date-picker.js';
import '../lib/components/checkbox.js';
import '../lib/components/switch.js';
import '../lib/components/calendar.js';
import '../lib/components/textarea.js';
import { nativeMessage } from '../lib/utils/validity.js';

// Form fields behave like their native counterparts: focus() reaches the
// interactive element, empty values submit what native would, and the
// blur/submit error reveal doesn't eat clicks.

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

/** The element that actually has focus, through shadow roots. */
function deepActive(): Element | null {
  let a: Element | null = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a;
}

describe('form fields — focus() lands on the interactive element', () => {
  const cases: Array<[string, () => any]> = [
    ['ty-radio-group', () => html`<ty-radio-group name="r"><ty-radio value="a">A</ty-radio><ty-radio value="b">B</ty-radio></ty-radio-group>`],
    ['ty-file-upload', () => html`<ty-file-upload name="f"></ty-file-upload>`],
    ['ty-select', () => html`<ty-select name="s"><ty-option value="x">X</ty-option></ty-select>`],
    ['ty-date-picker', () => html`<ty-date-picker name="d"></ty-date-picker>`],
    ['ty-checkbox', () => html`<ty-checkbox name="c">C</ty-checkbox>`],
    ['ty-switch', () => html`<ty-switch name="w">W</ty-switch>`],
    ['ty-calendar', () => html`<ty-calendar></ty-calendar>`],
  ];
  for (const [tag, tpl] of cases) {
    it(tag, async () => {
      const el = (await fixture(tpl())) as HTMLElement;
      await nextFrame();
      await tick(20);
      el.focus();
      const active = deepActive();
      expect(active, 'something focused').to.exist;
      expect(active).to.not.equal(document.body);
      expect(el.contains(active) || el.shadowRoot!.contains(active) || el.contains(document.activeElement),
        'focus is inside the field').to.equal(true);
    });
  }

  it('radio group focuses the checked radio', async () => {
    const el = (await fixture(html`
      <ty-radio-group name="r" value="b"><ty-radio value="a">A</ty-radio><ty-radio value="b">B</ty-radio></ty-radio-group>`)) as HTMLElement;
    await nextFrame();
    el.focus();
    expect(document.activeElement).to.equal(el.querySelector('ty-radio[value="b"]'));
  });
});

describe('form fields — empty values submit like native', () => {
  it('single select name=, multiple nothing; date picker name=; file upload an empty file', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <ty-select name="s"><ty-option value="x">X</ty-option></ty-select>
      <ty-select name="m" multiple><ty-option value="x">X</ty-option></ty-select>
      <ty-date-picker name="d"></ty-date-picker>
      <ty-file-upload name="f"></ty-file-upload>
      <ty-checkbox name="c">C</ty-checkbox>
      <ty-radio-group name="r"><ty-radio value="a">A</ty-radio></ty-radio-group>
    </form>`);
    await nextFrame();
    await tick(20);
    const data = new FormData(form);
    expect(data.get('s')).to.equal('');
    expect(data.has('m')).to.equal(false);
    expect(data.get('d')).to.equal('');
    const file = data.get('f') as File;
    expect(file).to.be.instanceOf(File);
    expect(file.name).to.equal('');
    expect(file.size).to.equal(0);
    expect(data.has('c'), 'unchecked checkbox: nothing').to.equal(false);
    expect(data.has('r'), 'no radio picked: nothing').to.equal(false);
  });

  it('file upload with files submits only the files', async () => {
    const form = await fixture<HTMLFormElement>(html`<form><ty-file-upload name="f" multiple></ty-file-upload></form>`);
    const el = form.querySelector('ty-file-upload') as any;
    await nextFrame();
    el.setFiles([new File(['a'], 'a.txt'), new File(['bb'], 'b.txt')]);
    const files = new FormData(form).getAll('f') as File[];
    expect(files.map((f) => f.name)).to.deep.equal(['a.txt', 'b.txt']);
  });
});

describe('form fields — error lines', () => {
  it('file upload: removing the last file of a required upload shows its message', async () => {
    const el = (await fixture(html`<ty-file-upload name="f" required></ty-file-upload>`)) as any;
    await nextFrame();
    el.setFiles([new File(['a'], 'a.txt')]);
    await tick(10);
    expect(el.hasAttribute('error')).to.equal(false);
    el.setFiles([]);
    await tick(10);
    expect(el.getAttribute('error')).to.not.equal(null);
    el.setFiles([new File(['a'], 'a.txt')]);
    await tick(10);
    expect(el.hasAttribute('error'), 'cleared once valid').to.equal(false);
  });

  it('submit: a required radio group shows its message and takes focus', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <ty-radio-group name="r" required><ty-radio value="a">A</ty-radio></ty-radio-group>
      <button>Go</button>
    </form>`);
    await nextFrame();
    form.querySelector('button')!.click();
    await nextFrame();
    const group = form.querySelector('ty-radio-group') as any;
    expect(group.getAttribute('error')).to.not.equal(null);
    expect(document.activeElement).to.equal(form.querySelector('ty-radio'));
  });
});

/** What a fresh native control in this browser reports (not Ty's shared probe). */
function native(tag: string, attrs: Record<string, string>, value?: string): string {
  const el = document.createElement(tag) as HTMLInputElement;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (value !== undefined) el.value = value;
  return el.validationMessage;
}

describe('form fields — messages are the browser\'s own', () => {
  const settle = async () => { await nextFrame(); await tick(20); };

  it('ty-textarea required', async () => {
    const el = (await fixture(html`<ty-textarea required></ty-textarea>`)) as any;
    await settle();
    expect(el.validationMessage).to.equal(native('textarea', { required: '' }));
    expect(el.validationMessage).to.not.equal('');
  });

  it('ty-checkbox required', async () => {
    const el = (await fixture(html`<ty-checkbox required>C</ty-checkbox>`)) as any;
    await settle();
    expect(el.validationMessage).to.equal(native('input', { type: 'checkbox', required: '' }));
    expect(el.validationMessage).to.not.equal('');
  });

  it('ty-switch required (a native switch where the browser has one)', async () => {
    const el = (await fixture(html`<ty-switch required>W</ty-switch>`)) as any;
    await settle();
    expect(el.validationMessage).to.equal(native('input', { type: 'checkbox', switch: '', required: '' }));
    expect(el.validationMessage).to.not.equal('');
  });

  it('ty-radio-group required', async () => {
    const el = (await fixture(html`
      <ty-radio-group name="r" required><ty-radio value="a">A</ty-radio></ty-radio-group>`)) as any;
    await settle();
    expect(el.validationMessage).to.equal(native('input', { type: 'radio', name: 'r', required: '' }));
    expect(el.validationMessage).to.not.equal('');
  });

  it('ty-select required, single and multiple', async () => {
    const one = (await fixture(html`<ty-select required><ty-option value="x">X</ty-option></ty-select>`)) as any;
    const many = (await fixture(html`<ty-select required multiple><ty-option value="x">X</ty-option></ty-select>`)) as any;
    await settle();
    expect(one.validationMessage).to.equal(native('select', { required: '' }));
    expect(many.validationMessage).to.equal(native('select', { required: '', multiple: '' }));
    expect(one.validationMessage).to.not.equal('');
  });

  it('ty-date-picker required, date and with-time', async () => {
    const day = (await fixture(html`<ty-date-picker required></ty-date-picker>`)) as any;
    const time = (await fixture(html`<ty-date-picker required with-time></ty-date-picker>`)) as any;
    await settle();
    expect(day.validationMessage).to.equal(native('input', { type: 'date', required: '' }, ''));
    expect(time.validationMessage).to.equal(native('input', { type: 'datetime-local', required: '' }, ''));
    expect(day.validationMessage).to.not.equal('');
  });

  it('ty-file-upload required, single and multiple', async () => {
    const one = (await fixture(html`<ty-file-upload required></ty-file-upload>`)) as any;
    const many = (await fixture(html`<ty-file-upload required multiple></ty-file-upload>`)) as any;
    await settle();
    expect(one.validationMessage).to.equal(native('input', { type: 'file', required: '' }));
    expect(many.validationMessage).to.equal(native('input', { type: 'file', required: '', multiple: '' }));
    expect(one.validationMessage).to.not.equal('');
  });

  it('ty-calendar min / max', async () => {
    const early = (await fixture(html`
      <ty-calendar year="2025" month="6" day="5" min="2025-06-10" max="2025-06-20"></ty-calendar>`)) as any;
    const late = (await fixture(html`
      <ty-calendar year="2025" month="6" day="25" min="2025-06-10" max="2025-06-20"></ty-calendar>`)) as any;
    await settle();
    const bounds = { type: 'date', min: '2025-06-10', max: '2025-06-20' };
    expect(early.validity.rangeUnderflow).to.equal(true);
    expect(early.validationMessage).to.equal(native('input', bounds, '2025-06-05'));
    expect(late.validity.rangeOverflow).to.equal(true);
    expect(late.validationMessage).to.equal(native('input', bounds, '2025-06-25'));
    expect(early.validationMessage).to.not.equal('');
  });

  it('nativeMessage: no attribute or value carries over between calls', () => {
    nativeMessage('input', { type: 'number', min: '5', max: '9', required: true }, '1');
    expect(nativeMessage('input', { type: 'text' })).to.equal('');
    nativeMessage('input', { type: 'file', required: true, multiple: true });
    expect(nativeMessage('input', { type: 'checkbox', required: true }))
      .to.equal(native('input', { type: 'checkbox', required: '' }));
    nativeMessage('textarea', { required: true });
    expect(nativeMessage('textarea', {})).to.equal('');
    expect(nativeMessage('input', { type: 'number', min: '', max: '' }, '3'), "'' leaves it off").to.equal('');
    expect(document.querySelectorAll('input, textarea, select').length, 'never in the document').to.equal(0);
  });
});

describe('form fields — blur reveal waits for the pointer', () => {
  it('blur while a pointer is pressed shows the message only after pointerup', async () => {
    const el = (await fixture(html`<ty-input minlength="3"></ty-input>`)) as any;
    const inner = el.shadowRoot.querySelector('input') as HTMLInputElement;
    inner.focus();
    inner.value = 'ab';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }));
    inner.blur();
    await tick(10);
    expect(el.hasAttribute('error'), 'nothing while pressed').to.equal(false);
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }));
    expect(el.hasAttribute('error'), 'not before the click runs').to.equal(false);
    await tick(10);
    expect(el.getAttribute('error')).to.contain('3');
  });

  // A tap: pointerdown, pointerup, then the compatibility mousedown moves
  // focus (the blur), then the click.
  const tap = (blur: () => void) => {
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }));
    blur();
  };

  it('touch: the blur comes after pointerup; the message waits for the click', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <ty-textarea name="t" minlength="20"></ty-textarea>
      <button>Send</button>
    </form>`);
    form.addEventListener('submit', (e) => e.preventDefault());
    await nextFrame();
    const el = form.querySelector('ty-textarea') as any;
    const inner = el.shadowRoot.querySelector('textarea') as HTMLTextAreaElement;
    let invalid = 0;
    el.addEventListener('invalid', () => invalid++);
    inner.focus();
    inner.value = 'short';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    tap(() => inner.blur());
    await tick(10);
    expect(el.hasAttribute('error'), 'nothing moves before the click').to.equal(false);
    form.querySelector('button')!.click();
    expect(invalid, 'the click submitted').to.equal(1);
    await tick(10);
    expect(el.getAttribute('error')).to.contain('20');
  });

  it('touch: a tap on a reset button resets and drops the waiting message', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <ty-input name="i" minlength="5"></ty-input>
      <button type="reset">Reset</button>
    </form>`);
    await nextFrame();
    const el = form.querySelector('ty-input') as any;
    const inner = el.shadowRoot.querySelector('input') as HTMLInputElement;
    inner.focus();
    inner.value = 'ab';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    tap(() => inner.blur());
    form.querySelector('button')!.click();
    await tick(20);
    expect(el.value).to.equal('');
    expect(el.hasAttribute('error')).to.equal(false);
  });

  it('touch: a long press or drag that never clicks shows it after a while', async () => {
    const el = (await fixture(html`<ty-input minlength="3"></ty-input>`)) as any;
    const inner = el.shadowRoot.querySelector('input') as HTMLInputElement;
    inner.focus();
    inner.value = 'ab';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    tap(() => inner.blur());
    await tick(100);
    expect(el.hasAttribute('error')).to.equal(false);
    await tick(1000);
    expect(el.getAttribute('error')).to.contain('3');
  });

  it('blur with no pointer pressed (Tab) shows it right away', async () => {
    const el = (await fixture(html`<ty-input minlength="3"></ty-input>`)) as any;
    const inner = el.shadowRoot.querySelector('input') as HTMLInputElement;
    inner.focus();
    inner.value = 'ab';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    inner.blur();
    expect(el.getAttribute('error')).to.contain('3');
  });
});

describe('form fields — a submit attempt focuses the first invalid field, in form order', () => {
  /** Focus is somewhere inside `el` (its shadow tree included). */
  const focusIn = (el: Element) => {
    for (let a: Element | null = document.activeElement; a; a = a.shadowRoot?.activeElement ?? null) {
      if (a === el) return true;
    }
    return false;
  };
  const canceled = (el: Element) => {
    const seen = { canceled: null as boolean | null };
    el.addEventListener('invalid', (e) => { seen.canceled = e.defaultPrevented; });
    return seen;
  };

  for (const [name, tpl] of [
    ['a required ty-checkbox', () => html`<ty-checkbox name="c" required>C</ty-checkbox>`],
    ['a required ty-switch', () => html`<ty-switch name="w" required>W</ty-switch>`],
    ['a required native input', () => html`<input name="n" required>`],
    ['a required ty-select', () => html`<ty-select name="s" required><ty-option value="x">X</ty-option></ty-select>`],
  ] as Array<[string, () => any]>) {
    it(`ty-input, then ${name}: the ty-input keeps focus`, async () => {
      const form = await fixture<HTMLFormElement>(html`<form>
        <ty-input name="a" required></ty-input>
        ${tpl()}
        <button>Go</button>
      </form>`);
      await nextFrame();
      await tick(20);
      const input = form.querySelector('ty-input')!;
      const later = form.querySelector('ty-input ~ :not(button)')!;
      const seen = canceled(later);
      form.querySelector('button')!.click();
      await nextFrame();
      await tick(10);
      expect(input.getAttribute('error')).to.not.equal(null);
      expect(focusIn(input), 'first invalid field focused').to.equal(true);
      expect(seen.canceled, 'no bubble on the later field').to.equal(true);
    });
  }

  it('a bubble field first gets the bubble and focus; a later ty-input still shows its message', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <ty-checkbox name="c" required>C</ty-checkbox>
      <ty-input name="a" required></ty-input>
      <button>Go</button>
    </form>`);
    await nextFrame();
    const box = form.querySelector('ty-checkbox')!;
    const input = form.querySelector('ty-input')!;
    const seen = canceled(box);
    form.querySelector('button')!.click();
    await nextFrame();
    expect(seen.canceled, 'the browser reports it').to.equal(false);
    expect(focusIn(box)).to.equal(true);
    expect(input.getAttribute('error')).to.not.equal(null);
  });

  it('a disabled invalid field is skipped', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <ty-input name="x" required disabled></ty-input>
      <ty-input name="a" required></ty-input>
      <ty-checkbox name="c" required>C</ty-checkbox>
      <button>Go</button>
    </form>`);
    await nextFrame();
    form.querySelector('button')!.click();
    await nextFrame();
    expect(focusIn(form.querySelectorAll('ty-input')[1])).to.equal(true);
  });

  it('a hidden invalid field (e.g. another wizard step) is skipped, like the browser does', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <div hidden><ty-input name="x" required></ty-input></div>
      <ty-input name="a" required></ty-input>
      <ty-checkbox name="c" required>C</ty-checkbox>
      <button>Go</button>
    </form>`);
    await nextFrame();
    const [hidden, visible] = Array.from(form.querySelectorAll('ty-input'));
    form.querySelector('button')!.click();
    await nextFrame();
    expect(focusIn(visible)).to.equal(true);
    expect(hidden.getAttribute('error'), 'its message still shows').to.not.equal(null);
  });

  it('a field in a visibility:hidden container (an inactive ty-wizard step) is skipped', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <div style="visibility: hidden"><ty-input name="x" required></ty-input></div>
      <ty-input name="a" required></ty-input>
      <ty-checkbox name="c" required>C</ty-checkbox>
      <button>Go</button>
    </form>`);
    await nextFrame();
    const seen = canceled(form.querySelector('ty-checkbox')!);
    form.querySelector('button')!.click();
    await nextFrame();
    expect(focusIn(form.querySelectorAll('ty-input')[1])).to.equal(true);
    expect(seen.canceled).to.equal(true);
  });

  for (const method of ['requestSubmit', 'reportValidity'] as const) {
    it(`form.${method}() from script: the first invalid field takes focus, no bubble on a later one`, async () => {
      const form = await fixture<HTMLFormElement>(html`<form>
        <ty-input name="a" required></ty-input>
        <ty-checkbox name="c" required>C</ty-checkbox>
        <input name="n" required>
      </form>`);
      await nextFrame();
      await tick(20);
      const box = canceled(form.querySelector('ty-checkbox')!);
      const native = canceled(form.querySelector('input')!);
      form[method]();
      expect(focusIn(form.querySelector('ty-input')!)).to.equal(true);
      expect(box.canceled).to.equal(true);
      expect(native.canceled).to.equal(true);
    });
  }

  it('a form inside a shadow root (Lit, Stencil apps) works the same', async () => {
    const host = await fixture<HTMLDivElement>(html`<div></div>`);
    host.attachShadow({ mode: 'open' }).innerHTML = `<form>
      <ty-input name="a" required></ty-input>
      <ty-input name="b" required></ty-input>
      <ty-checkbox name="c" required>C</ty-checkbox>
      <button><span>Go</span></button>
    </form>`;
    await nextFrame();
    await tick(20);
    const root = host.shadowRoot!;
    const seen = canceled(root.querySelector('ty-checkbox')!);
    root.querySelector('span')!.click();
    await nextFrame();
    expect(focusIn(root.querySelector('ty-input')!)).to.equal(true);
    expect(seen.canceled, 'no bubble on the later checkbox').to.equal(true);
  });

  describe('Enter counts as a submit only where it can submit', () => {
    // A live "enable Save" check runs checkValidity() on every input event.
    const live = async () => {
      const form = await fixture<HTMLFormElement>(html`<form>
        <ty-input name="a" required></ty-input>
        <ty-textarea name="t"></ty-textarea>
        <input name="n">
        <div contenteditable="true">x</div>
        <button>Save</button>
      </form>`);
      await nextFrame();
      await tick(20);
      return form;
    };
    const enter = (target: Element, init: KeyboardEventInit = {}) => target.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true, ...init }));

    it('Enter in a ty-textarea, then checkValidity(): focus stays', async () => {
      const form = await live();
      const textarea = form.querySelector('ty-textarea')!.shadowRoot!.querySelector('textarea')!;
      textarea.focus();
      enter(textarea);
      form.checkValidity();
      expect(focusIn(form.querySelector('ty-textarea')!)).to.equal(true);
    });

    it('Enter in a contenteditable, then checkValidity(): focus stays', async () => {
      const form = await live();
      const editable = form.querySelector<HTMLElement>('[contenteditable]')!;
      editable.focus();
      enter(editable);
      form.checkValidity();
      expect(document.activeElement).to.equal(editable);
    });

    it('Enter confirming an IME composition in a native input: focus stays', async () => {
      const form = await live();
      const input = form.querySelector('input')!;
      input.focus();
      enter(input, { isComposing: true });
      form.checkValidity();
      expect(document.activeElement).to.equal(input);
    });

    it('Enter in a native single-line input (implicit submission) focuses the first invalid field', async () => {
      const form = await live();
      const input = form.querySelector('input')!;
      input.focus();
      enter(input);
      form.checkValidity(); // what the implicit submission runs in this task
      expect(focusIn(form.querySelector('ty-input')!)).to.equal(true);
    });
  });

  it('form.checkValidity() moves no focus and leaves bubbles alone', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <ty-input name="a" required></ty-input>
      <ty-checkbox name="c" required>C</ty-checkbox>
    </form>`);
    await nextFrame();
    const seen = canceled(form.querySelector('ty-checkbox')!);
    expect(form.checkValidity()).to.equal(false);
    expect(focusIn(form.querySelector('ty-input')!)).to.equal(false);
    expect(seen.canceled).to.equal(false);
  });
});

describe('form fields — form.reset() clears every message validation showed', () => {
  it('ty-input, ty-textarea, ty-radio-group and ty-file-upload after a submit attempt', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <ty-input name="i" required></ty-input>
      <ty-textarea name="t" required></ty-textarea>
      <ty-radio-group name="r" required><ty-radio value="a">A</ty-radio></ty-radio-group>
      <ty-file-upload name="f" required></ty-file-upload>
      <ty-checkbox name="c" required>C</ty-checkbox>
      <button>Go</button>
    </form>`);
    await nextFrame();
    await tick(20);
    const fields = ['ty-input', 'ty-textarea', 'ty-radio-group', 'ty-file-upload']
      .map((tag) => form.querySelector(tag)!);
    form.querySelector('button')!.click();
    await nextFrame();
    for (const f of fields) expect(f.getAttribute('error'), `${f.localName} shows`).to.not.equal(null);

    form.reset();
    await nextFrame();
    await tick(10);
    for (const f of fields) {
      expect(f.hasAttribute('error'), `${f.localName} cleared`).to.equal(false);
      expect((f as any).validity.valid, `${f.localName} still invalid`).to.equal(false);
    }
  });

  it('a reset button: a blur reveal waiting for the pointer is dropped', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <ty-input name="i" required></ty-input>
      <button type="reset">Reset</button>
    </form>`);
    await nextFrame();
    const el = form.querySelector('ty-input') as any;
    const inner = el.shadowRoot.querySelector('input') as HTMLInputElement;
    inner.focus();
    inner.value = 'x';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    inner.value = '';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    // Pressing the reset button: blur while pressed, then the click resets
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }));
    inner.blur();
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }));
    form.querySelector('button')!.click();
    await tick(20);
    expect(el.hasAttribute('error')).to.equal(false);
  });
});
